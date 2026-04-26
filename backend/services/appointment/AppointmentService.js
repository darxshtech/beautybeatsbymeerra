const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorHandler');

class AppointmentService {
  /**
   * Check if a specific staff member is available at a given date/time
   */
  async isStaffAvailable(staffId, date, timeSlot, excludeAppointmentId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      staff: staffId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: timeSlot,
      status: { $nin: ['CANCELLED', 'NOSHOW'] }
    };

    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }

    const existing = await Appointment.findOne(query);
    
    if (existing) {
      console.log(`[BUSY] Staff ${staffId} at ${timeSlot} on ${date}. App: ${existing._id}`);
    }
    
    return !existing;
  }

  async findAvailableStaff(date, timeSlot) {
    const allStaff = await User.find({ role: { $in: ['STAFF', 'ADMIN'] }, isOff: { $ne: true } });
    
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    for (const s of allStaff) {
      // Check if staff works on this day/time (if schedule exists)
      if (s.availability && s.availability.length > 0) {
        const daySchedule = s.availability.find(a => a.day === dayName);
        if (!daySchedule || !daySchedule.slots.includes(timeSlot)) {
          continue; // Doesn't work this slot
        }
      }

      const available = await this.isStaffAvailable(s._id, date, timeSlot);
      if (available) return s._id;
    }
    return null;
  }

  /**
   * Get all appointments for calendar view (filtered by date)
   */
  async getAppointments(query) {
    let queryObj = {};
    
    // Formatting date query
    if (query.startDate && query.endDate) {
      queryObj.appointmentDate = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }

    if (query.customerId) {
      queryObj.customer = query.customerId;
    }

    if (query.staffId) {
      queryObj.staff = query.staffId;
    }

    if (query.status) {
      queryObj.status = query.status;
    }

    if (query.search) {
      // Find matching customers or services first
      const [customers, services] = await Promise.all([
        User.find({ name: { $regex: query.search, $options: 'i' }, role: 'CUSTOMER' }).select('_id'),
        require('../../models/Service').find({ name: { $regex: query.search, $options: 'i' } }).select('_id')
      ]);

      queryObj.$or = [
        { customer: { $in: customers.map(c => c._id) } },
        { service: { $in: services.map(s => s._id) } }
      ];
    }

    const appointments = await Appointment.find(queryObj)
      .populate('customer', 'name phone')
      .populate('staff', 'name')
      .populate('service', 'name price duration')
      .sort('-appointmentDate');

    return {
      success: true,
      data: appointments
    };
  }

  /**
   * Create an appointment (Guest or Registered)
   */
  async createAppointment(data) {
    const { service, appointmentDate, timeSlot, staff, notes, customerInfo, customerId } = data;

    let finalCustomerId = customerId;

    // Handle guest logic if not provided
    if (!finalCustomerId && customerInfo) {
      let user = await User.findOne({ phone: customerInfo.phone });
      if (!user) {
        user = await User.create({
          name: customerInfo.name || 'Guest Customer',
          phone: customerInfo.phone,
          role: 'CUSTOMER',
          registrationSource: data.type === 'WALKIN' ? 'WALKIN' : 'ONLINE'
        });
      }
      finalCustomerId = user._id;
    }

    if (!finalCustomerId) {
      throw new ErrorResponse('Customer information is required', 400);
    }

    // --- Smart Assignment Logic ---
    if (staff) {
      // Check if specifically requested staff is available
      const available = await this.isStaffAvailable(staff, appointmentDate, timeSlot);
      if (!available) {
        throw new ErrorResponse('Selected specialist is already booked for this time. Please choose another time or specialist.', 400);
      }
    } else {
      // "Any Specialist" logic - find someone free
      const autoAssignedStaff = await this.findAvailableStaff(appointmentDate, timeSlot);
      if (!autoAssignedStaff) {
        throw new ErrorResponse('No specialists are available at this time. Please select a different time slot.', 400);
      }
      data.staff = autoAssignedStaff; // Update staff in data for creation
    }

    const appointment = await Appointment.create({
      customer: finalCustomerId,
      service,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      staff: data.staff,
      notes,
      couponCode: data.couponCode || null
    });

    // --- Automated Billing Creation ---
    const Service = require('../../models/Service');
    const Billing = require('../../models/Billing');
    const selectedService = await Service.findById(service);
    
    if (selectedService) {
      let discount = 0;
      let total = selectedService.price;

      // --- Coupon Redemption ---
      if (data.couponCode) {
        const Coupon = require('../../models/Coupon');
        const coupon = await Coupon.findOne({ code: data.couponCode.toUpperCase(), isActive: true, isUsed: false });
        if (coupon && new Date() <= coupon.expiryDate) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round((selectedService.price * coupon.discountValue) / 100);
          } else {
            discount = coupon.discountValue;
          }
          total = Math.max(0, selectedService.price - discount);
          
          // Mark coupon as used
          coupon.isUsed = true;
          coupon.usedCount = 1;
          await coupon.save();
        }
      }

      // --- Loyalty Points Redemption ---
      if (data.pointsRedeemed && data.pointsRedeemed > 0) {
        const ptsDiscount = data.pointsRedeemed * 10;
        discount += ptsDiscount;
        total = Math.max(0, selectedService.price - discount);
        
        // Deduct points from user
        User.findByIdAndUpdate(finalCustomerId, {
          $inc: { loyaltyPoints: -data.pointsRedeemed }
        }).catch(err => console.error('Points deduction failed:', err));
      }

      const billing = await Billing.create({
        appointment: appointment._id,
        customer: finalCustomerId,
        items: [{
          name: selectedService.name,
          price: selectedService.price,
          isService: true
        }],
        subtotal: selectedService.price,
        discount: discount,
        total: total,
        paymentMethod: data.paymentMethod || 'UPI',
        paymentStatus: data.paymentMethod === 'CASH' ? 'PENDING' : 'PAID'
      });
      appointment.billing = billing._id;
      await appointment.save();
    }

    // Send WhatsApp Confirmations
    const user = await User.findById(finalCustomerId);
    const WhatsappService = require('../notification/WhatsappService');
    
    // Notify Customer (Template based for new clients)
    if (user && user.phone) {
      // Components for the template (e.g. {{1}} = name, {{2}} = date, {{3}} = time)
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: user.name },
            { type: 'text', text: new Date(appointmentDate).toLocaleDateString() },
            { type: 'text', text: timeSlot }
          ]
        }
      ];

      // Try sending template first (Works for new clients)
      WhatsappService.sendTemplateMessage(user.phone, 'appointment_confirmation', components)
        .then(res => {
          if (!res.success) {
            console.warn('[WHATSAPP] Template failed, falling back to raw text:', res.error);
            // Fallback to raw text for existing sessions
            const msg = `Hello ${user.name}! 🌟 Your appointment at BeautyBeats is confirmed for ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot}.`;
            WhatsappService.sendMessage(user.phone, msg);
          }
        })
        .catch(err => console.error('Booking WhatsApp Error:', err));
    }

    // Notify Specialist (Staff)
    if (appointment.staff) {
      const staffUser = await User.findById(appointment.staff);
      if (staffUser && staffUser.phone) {
        const staffMsg = `Hello ${staffUser.name}! 📅 A new appointment has been booked for you with ${user?.name || 'a customer'} on ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot}.`;
        WhatsappService.sendMessage(staffUser.phone, staffMsg).catch(err => console.error('Staff Booking Notification Error:', err));
      }
    }

    // Increment visit count for user asynchronously
    User.findByIdAndUpdate(finalCustomerId, {
      $inc: { visitCount: 1 },
      lastVisit: new Date()
    }).catch(err => console.error('Error updating user visit stats:', err));

    return {
      success: true,
      data: appointment
    };
  }

  /**
   * Update status of an appointment
   */
  async updateStatus(id, status) {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new ErrorResponse('Appointment not found', 404);
    }

    appointment.status = status;
    const updated = await appointment.save();

    // Auto-Review messaging when completed
    if (status === 'COMPLETED' && updated.customer) {
      const populatedApp = await Appointment.findById(updated._id).populate('service', 'name').populate('customer', 'name phone');
      if (populatedApp?.customer?.phone) {
        const NotificationService = require('../notification/NotificationService');
        const reviewLink = `http://localhost:3000/review?appId=${updated._id}`;
        NotificationService.triggerNotification('REVIEW_REQUEST', {
          phone: populatedApp.customer.phone,
          customerName: populatedApp.customer.name,
          service: populatedApp.service?.name || 'treatment',
          reviewLink
        }).catch(err => console.error('Review WhatsApp Error:', err));
      }
    }

    return {

      success: true,
      data: updated
    };
  }

  /**
   * Assign staff or service
   */
  async updateAppointment(id, updateData) {
    const appointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!appointment) {
      throw new ErrorResponse('Appointment not found', 404);
    }

    return {
      success: true,
      data: appointment
    };
  }
}

module.exports = new AppointmentService();

const AppointmentService = require('../services/appointment/AppointmentService');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');

exports.getAvailability = async (req, res, next) => {
  try {
    const { date, staffId } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    // Dynamic pool of slots for salon (10 AM to 7 PM)
    const slots = [
      '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
      '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
    ];
    const availabilityList = [];

    const User = require('../models/User');
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Fetch relevant staff once
    let staffList = [];
    if (staffId && staffId !== 'any' && staffId !== 'undefined' && staffId !== 'null') {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(staffId)) {
        const single = await User.findById(staffId);
        if (single) staffList = [single];
      }
    }

    if (staffList.length === 0) {
      staffList = await User.find({ role: { $in: ['STAFF', 'ADMIN'] }, isOff: { $ne: true } });
    }

    const now = new Date();
    // Use IST for accurate time comparison
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
    
    const requestedDate = new Date(date);
    const isToday = requestedDate.toDateString() === nowIST.toDateString();

    console.log(`Checking availability for ${date}. Today? ${isToday}. Total Staff: ${staffList.length}`);

    // For each slot, check if ANY staff member is both scheduled and free
    const { excludeAppId } = req.query;
    for (const slot of slots) {
      let available = false;

      // 1. If it's today, filter out past slots based on IST
      if (isToday) {
        const [timePart, ampm] = slot.split(' ');
        const [hours, minutes] = timePart.split(':');
        let h = parseInt(hours);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        
        const slotTimeIST = new Date(nowIST);
        slotTimeIST.setHours(h, parseInt(minutes), 0, 0);
        
        if (slotTimeIST < nowIST) {
          console.log(`Slot ${slot} is in the past. marking unavailable.`);
          availabilityList.push({ slot, available: false });
          continue;
        }
      }

      for (const s of staffList) {
        // 1. Check if staff is on leave
        if (s.isOff) continue;

        // 2. Check if staff works on this day/time (if schedule exists)
        if (s.availability && s.availability.length > 0) {
          const daySchedule = s.availability.find(a => a.day === dayName);
          if (!daySchedule || !daySchedule.slots.includes(slot)) {
            continue; // Doesn't work this slot
          }
        }

        // 3. Check if staff has an appointment conflict
        const isFree = await AppointmentService.isStaffAvailable(s._id, date, slot, excludeAppId);
        if (isFree) {
          available = true;
          break; // Found someone! This slot is available
        }
      }

      availabilityList.push({ slot, available });
    }

    res.status(200).json({
      success: true,
      data: availabilityList
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all appointments
 * @route   GET /api/appointments
 * @access  Private/Admin/Staff
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const filter = { ...req.query };
    
    // If not admin/staff, force filter by customerId
    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user.id;
    }

    const response = await AppointmentService.getAppointments(filter);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const response = await AppointmentService.getAppointmentById(req.params.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create an appointment
 * @route   POST /api/appointments
 * @access  Public (Optional auth)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const response = await AppointmentService.createAppointment({
      ...req.body,
      customerId: req.body.customerId || (req.user ? req.user.id : null)
    });
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Private/Admin/Staff
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('customer', 'name').populate('staff', 'name');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Check 12-hour policy for CUSTOMER
    if (req.user.role === 'CUSTOMER' && (req.body.appointmentDate || req.body.timeSlot || req.body.status === 'CANCELLED')) {
      const appDate = new Date(appointment.appointmentDate);
      const [timePart, ampm] = appointment.timeSlot.split(' ');
      let [hours, minutes] = timePart.split(':');
      let h = parseInt(hours);
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      appDate.setHours(h, parseInt(minutes), 0, 0);

      const diff = appDate.getTime() - Date.now();
      const hoursDiff = diff / (1000 * 60 * 60);

      if (hoursDiff < 12) {
        return res.status(400).json({ 
          success: false, 
          message: 'Changes or cancellations can only be made 12 hours prior to the appointment.' 
        });
      }
    }

    const response = await AppointmentService.updateAppointment(req.params.id, req.body);

    // Trigger review request if status updated to COMPLETED
    if (req.body.status === 'COMPLETED') {
      const populatedApp = await Appointment.findById(req.params.id).populate('service', 'name').populate('customer', 'name phone');
      if (populatedApp?.customer?.phone) {
        const NotificationService = require('../services/notification/NotificationService');
        const reviewLink = `http://localhost:3000/review?appId=${populatedApp._id}`;
        NotificationService.triggerNotification('REVIEW_REQUEST', {
          phone: populatedApp.customer.phone,
          customerName: populatedApp.customer.name,
          service: populatedApp.service?.name || 'treatment',
          reviewLink,
          appId: populatedApp._id
        }).catch(err => console.error('Review WhatsApp Error:', err));
      }
    }

    // Notify Admin/Employee of Reschedule
    if (req.body.appointmentDate || req.body.timeSlot) {
      const msg = `Appointment for ${appointment.customer?.name} has been rescheduled to ${req.body.appointmentDate} at ${req.body.timeSlot}.`;
      
      // Admin Notification
      await AdminNotification.create({
        type: 'APPOINTMENT_RESCHEDULED',
        title: '📅 Appointment Rescheduled',
        message: msg,
        customer: appointment.customer?._id,
        appointment: appointment._id
      });

      // Employee Notification (handled via staff field in appointment)
      if (appointment.staff) {
        // If the system has a Notification model for staff, we would use it here.
        // For now, let's check if there's a general notification system for staff.
      }
    }

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private/Admin
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const response = await AppointmentService.deleteAppointment(req.params.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get today's appointments for a specific staff member (employee portal)
 * @route   GET /api/appointments/my-customers
 * @access  Private (STAFF/ADMIN)
 */
exports.getStaffAppointments = async (req, res, next) => {
  try {
    const staffId = req.user._id || req.user.id;
    const { date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get appointments assigned to this staff member OR auto-assigned (no staff set)
    // Include both ONLINE and WALKIN types
    const isSysAdmin = staffId === 'SYSTEM_ADMIN_ID';
    const orQuery = isSysAdmin ? [{ staff: null }] : [{ staff: staffId }, { staff: null }];

    const appointmentsRaw = await Appointment.find({
      $or: orQuery,
      status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'IN-PROGRESS', 'COMPLETED'] }
    })
      .populate('customer', 'name phone email skinToneInfo birthday anniversary visitCount lastVisit loyaltyPoints')
      .populate('service', 'name category duration price')
      .populate('staff', 'name')
      .populate('billing', 'paymentStatus pendingAmount total splitDetails')
      .sort({ type: -1, createdAt: 1 }); // WALKIN (W) before ONLINE (O), then by creation time

    const appointments = appointmentsRaw.filter(app => {
      if (app.status !== 'COMPLETED') return true;
      if (app.billing && (app.billing.paymentStatus === 'PENDING' || app.billing.paymentStatus === 'PARTIAL' || app.billing.pendingAmount > 0)) return true;
      return false;
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Finish service and process payment
 * @route   POST /api/appointments/:id/finish
 * @access  Private (STAFF/ADMIN)
 */
exports.finishService = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const employeeId = req.user._id || req.user.id;
    const { paymentMethod, amount, transactionId, splitDetails } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('customer', 'name phone visitCount')
      .populate('service', 'name price')
      .populate('staff', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const totalAmount = amount || appointment.service?.price || 0;
    
    let paidAmount = totalAmount;
    let pendingAmount = 0;
    let paymentStatus = 'PAID';

    if (paymentMethod === 'SPLIT' && splitDetails) {
      paidAmount = (Number(splitDetails.cashAmount) || 0) + (Number(splitDetails.upiAmount) || 0);
      pendingAmount = Math.max(0, totalAmount - paidAmount);
      if (pendingAmount > 0) {
        paymentStatus = paidAmount > 0 ? 'PARTIAL' : 'PENDING';
      }
    } else {
      // If regular payment but amount is less than total
      // Assume amount provided is the paid amount if explicitly sent, else full price
      if (req.body.amount !== undefined && Number(req.body.amount) < (appointment.service?.price || 0)) {
        pendingAmount = Math.max(0, (appointment.service?.price || 0) - Number(req.body.amount));
        paymentStatus = 'PARTIAL';
      }
    }

    // Create/update billing record
    let billing;
    if (appointment.billing) {
      // It's already billed, just update payment
      billing = await Billing.findById(appointment.billing);
      if (billing) {
        billing.paymentMethod = paymentMethod || billing.paymentMethod;
        if (paymentMethod === 'SPLIT' && splitDetails) {
           billing.splitDetails = splitDetails;
        }
        billing.pendingAmount = pendingAmount;
        billing.paymentStatus = paymentStatus;
        await billing.save();
      }
    }
    
    if (!billing) {
      billing = await Billing.create({
        appointment: appointmentId,
        customer: appointment.customer._id,
        items: [{
          name: appointment.service?.name || 'Service',
          price: appointment.service?.price || 0,
          quantity: 1,
          isService: true
        }],
        subtotal: appointment.service?.price || 0,
        total: appointment.service?.price || 0,
        paymentMethod: paymentMethod || 'CASH',
        splitDetails: paymentMethod === 'SPLIT' ? splitDetails : undefined,
        pendingAmount: pendingAmount,
        paymentStatus: paymentStatus
      });
    }

    // Update appointment status if not completed
    if (appointment.status !== 'COMPLETED') {
      appointment.status = 'COMPLETED';
      appointment.billing = billing._id;
      await appointment.save();

      // Update customer visit count ONLY if newly completed
      if (appointment.customer) {
        await User.findByIdAndUpdate(appointment.customer._id, {
          $inc: { visitCount: 1 },
          lastVisit: new Date()
        });
      }
    }

    // Notify admin: service finished
    const employee = await User.findById(employeeId);
    const paymentDisplay = paymentMethod === 'UPI' 
      ? `UPI (Txn: ${transactionId || 'N/A'})`
      : paymentMethod === 'PREPAID' 
        ? 'Prepaid Balance'
        : paymentMethod || 'Cash';

    await AdminNotification.create({
      type: 'SERVICE_FINISHED',
      title: '✅ Service Completed',
      message: `${employee?.name || 'Staff'} has finished attending ${appointment.customer?.name || 'Customer'} for ${appointment.service?.name || 'service'}.`,
      employee: employeeId,
      customer: appointment.customer?._id,
      appointment: appointmentId
    });

    await AdminNotification.create({
      type: 'PAYMENT_RECEIVED',
      title: '💰 Payment Received',
      message: `Payment of ₹${amount || appointment.service?.price || 0} received via ${paymentDisplay} from ${appointment.customer?.name || 'Customer'}.`,
      employee: employeeId,
      customer: appointment.customer?._id,
      appointment: appointmentId,
      paymentInfo: {
        method: paymentMethod || 'CASH',
        amount: amount || appointment.service?.price || 0,
        transactionId: transactionId || ''
      }
    });

    // AUTO-SEND WHATSAPP BILL TO CUSTOMER
    try {
      const WhatsappService = require('../services/notification/WhatsappService');
      const billMsg = [
        `🧾 *BeautyBeats Invoice*`,
        ``,
        `Hi ${appointment.customer?.name || 'Customer'},`,
        `Thank you for your visit! Your service is complete.`,
        ``,
        `*Service:* ${appointment.service?.name || 'Salon Service'}`,
        `*Amount Paid:* ₹${amount || appointment.service?.price || 0}`,
        `*Payment Mode:* ${paymentMethod || 'CASH'}`,
        `*Date:* ${new Date().toLocaleDateString('en-IN')}`,
        ``,
        `Hope you loved the experience! See you soon. ✨`,
        `_BeautyBeats Premium Salon_`
      ].join('\n');

      if (appointment.customer?.phone) {
        await WhatsappService.sendMessage(appointment.customer.phone, billMsg);
        console.log(`Auto-bill sent to ${appointment.customer.phone}`);

        // TRIGGER REVIEW REQUEST
        const NotificationService = require('../services/notification/NotificationService');
        const reviewLink = `http://localhost:3000/review?appId=${appointment._id}`;
        await NotificationService.triggerNotification('REVIEW_REQUEST', {
          phone: appointment.customer.phone,
          customerName: appointment.customer.name,
          service: appointment.service?.name || 'treatment',
          reviewLink,
          appId: appointment._id
        }).catch(err => console.error('Review Notification Error:', err));
      }
    } catch (wsErr) {
      console.error('Auto-WhatsApp billing failed:', wsErr.message);
    }

    res.status(200).json({ 
      success: true, 
      data: { appointment, billing },
      message: 'Service completed, payment recorded, and WhatsApp bill sent.'
    });
  } catch (err) {
    next(err);
  }
};

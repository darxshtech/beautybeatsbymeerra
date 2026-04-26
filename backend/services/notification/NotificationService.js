const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');
const MessageTemplate = require('../../models/MessageTemplate');
const SentNotification = require('../../models/SentNotification');

class NotificationService {
  // Helper: get today's key in IST (YYYY-MM-DD)
  _getTodayKey() {
    const now = new Date();
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.toISOString().split('T')[0];
  }

  // Helper: get current date in IST
  _getISTDate() {
    const now = new Date();
    return new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  }

  // Helper: get day and month in IST
  _getLocalDayMonth(date) {
    const istString = new Date(date).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
    const d = new Date(istString);
    return { day: d.getDate(), month: d.getMonth() };
  }

  async getNotifications() {
    const istNow = this._getISTDate();
    const todayLocal = { day: istNow.getDate(), month: istNow.getMonth() };
    
    // Start of "Today" in IST
    const today = new Date(istNow);
    today.setUTCHours(0, 0, 0, 0); 
    // Since today is already shifted by 5.5, setUTCHours effectively zeros out the IST day
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const notifications = [];

    // 1. Special Events (Birthday, Anniversary)
    const eventUsers = await User.find({
      role: 'CUSTOMER',
      $or: [{ birthday: { $exists: true, $ne: null } }, { anniversary: { $exists: true, $ne: null } }]
    }).select('name birthday anniversary phone');

    eventUsers.forEach(user => {
      if (user.birthday) {
        const bday = this._getLocalDayMonth(user.birthday);
        if (bday.day === todayLocal.day && bday.month === todayLocal.month) {
          notifications.push({
            id: `bday-${user._id}`, type: 'SPECIAL_EVENT', title: 'Birthday Today 🎂',
            message: `It's ${user.name}'s birthday today! Send them a special discount coupon.`,
            customer: user.name, phone: user.phone, action: 'SEND_DISCOUNT',
            metadata: { userId: user._id, eventType: 'Birthday', phone: user.phone, customerName: user.name }
          });
        }
      }
      if (user.anniversary) {
        const anniv = this._getLocalDayMonth(user.anniversary);
        if (anniv.day === todayLocal.day && anniv.month === todayLocal.month) {
          notifications.push({
            id: `anniv-${user._id}`, type: 'SPECIAL_EVENT', title: 'Anniversary Today 💍',
            message: `It's ${user.name}'s anniversary today! Send them a special offer.`,
            customer: user.name, phone: user.phone, action: 'SEND_DISCOUNT',
            metadata: { userId: user._id, eventType: 'Anniversary', phone: user.phone, customerName: user.name }
          });
        }
      }
    });

    // 2. Appointment Reminders (Tomorrow)
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }).populate('customer', 'name phone').populate('service', 'name');

    upcomingAppointments.forEach(app => {
      if (app.customer) {
        notifications.push({
          id: `remind-${app._id}`, type: 'REMINDER', title: 'Appointment Tomorrow ⏰',
          message: `${app.customer.name} has a ${app.service?.name || 'service'} appointment tomorrow at ${app.timeSlot}.`,
          customer: app.customer.name, phone: app.customer.phone, action: 'SEND_REMINDER',
          metadata: { appId: app._id, timeSlot: app.timeSlot, service: app.service?.name, phone: app.customer.phone, customerName: app.customer.name }
        });
      }
    });

    // 3. Treatment Follow-ups
    const servicesWithFollowUp = await Service.find({ followUpDays: { $gt: 0 } });
    for (const svc of servicesWithFollowUp) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - svc.followUpDays);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setDate(targetDate.getDate() + 1);

      const followUpApps = await Appointment.find({
        service: svc._id,
        status: 'COMPLETED',
        appointmentDate: { $gte: targetDate, $lt: targetDateEnd }
      }).populate('customer', 'name phone');

      followUpApps.forEach(app => {
        if (app.customer) {
          notifications.push({
            id: `followup-${app._id}`, type: 'FOLLOW_UP', title: `Follow-Up Due (${svc.name}) 📋`,
            message: `${app.customer.name} had ${svc.name} ${svc.followUpDays} days ago. Time for Phase 2/follow-up session.`,
            customer: app.customer.name, phone: app.customer.phone, action: 'SEND_FOLLOWUP',
            metadata: { appId: app._id, service: svc.name, phone: app.customer.phone, customerName: app.customer.name }
          });
        }
      });
    }

    // 4. Deduplicate
    const todayKey = this._getTodayKey();
    const sentToday = await SentNotification.find({
      notificationKey: { $regex: `-${todayKey}$` }
    }).select('notificationKey');
    
    const sentKeys = new Set(sentToday.map(s => s.notificationKey));
    const filtered = notifications.filter(n => !sentKeys.has(`${n.id}-${todayKey}`));

    return { success: true, data: filtered };
  }


  async triggerNotification(type, metadata) {
    const WhatsappService = require('./WhatsappService');
    
    let message = '';
    let phone = metadata.phone;

    // Load templates
    const templates = {};
    const allTemplates = await MessageTemplate.find({});
    allTemplates.forEach(t => { templates[t.key] = t; });

    if (type === 'SPECIAL_EVENT') {
      const user = await User.findById(metadata.userId);
      phone = phone || user?.phone;
      const eventName = metadata.eventType || 'Special Day';

      const { generateCouponInternal } = require('../../controllers/couponController');
      const discount = templates['SPECIAL_EVENT']?.discountPercent || 20;
      const coupon = await generateCouponInternal(metadata.userId, eventName, discount);

      const tpl = templates['SPECIAL_EVENT'];
      if (tpl) {
        message = tpl.messageBody
          .replace(/\{\{name\}\}/g, user?.name || 'there')
          .replace(/\{\{event\}\}/g, eventName)
          .replace(/\{\{coupon\}\}/g, coupon.code)
          .replace(/\{\{discount\}\}/g, discount.toString());
      } else {
        message = `Hello ${metadata.customerName || 'there'}! 🎉 Happy ${eventName}! Use code ${coupon.code} for ${discount}% off at BeautyBeats!`;
      }
    }
    else if (type === 'REMINDER') {
      const tpl = templates['APPOINTMENT_REMINDER'];
      if (tpl) {
        message = tpl.messageBody
          .replace(/\{\{name\}\}/g, metadata.customerName || '')
          .replace(/\{\{service\}\}/g, metadata.service || '')
          .replace(/\{\{time\}\}/g, metadata.timeSlot || '');
      } else {
        message = `Reminder: Your ${metadata.service} appointment is tomorrow at ${metadata.timeSlot} at BeautyBeats!`;
      }
    }
    else if (type === 'FOLLOW_UP') {
      message = `Hello! It's been a few weeks since your ${metadata.service} at BeautyBeats. Time for your follow-up session! Book your next appointment to ensure the best results. 💅`;
    }
    else if (type === 'REVIEW_REQUEST') {
      const tpl = templates['REVIEW_REQUEST'];
      if (tpl) {
        message = tpl.messageBody
          .replace(/\{\{name\}\}/g, metadata.customerName || '')
          .replace(/\{\{service\}\}/g, metadata.service || '')
          .replace(/\{\{reviewLink\}\}/g, metadata.reviewLink || '');
      } else {
        message = `Hi! Thank you for visiting BeautyBeats! Please leave a review: ${metadata.reviewLink}`;
      }
    }

    if (phone && message) {
      const result = await WhatsappService.sendMessage(phone, message);
      
      // Corrected idSource to match getNotifications IDs
      let idSource = '';
      if (type === 'SPECIAL_EVENT') {
        idSource = metadata.eventType === 'Birthday' ? `bday-${metadata.userId}` : `anniv-${metadata.userId}`;
      } else if (type === 'REMINDER') {
        idSource = `remind-${metadata.appId}`;
      } else if (type === 'FOLLOW_UP') {
        idSource = `followup-${metadata.appId}`;
      } else if (type === 'REVIEW_REQUEST') {
        idSource = `review-${metadata.appId}`;
      }

      if (idSource) {
        const todayKey = this._getTodayKey();
        await SentNotification.findOneAndUpdate(
          { notificationKey: `${idSource}-${todayKey}` },
          { 
            type, 
            recipient: phone, 
            status: result.success ? 'SENT' : 'FAILED',
            message: message,
            sentAt: new Date()
          },
          { upsert: true }
        ).catch(e => console.error('Sent recording error:', e));
      }

      if (result.success) {
        return { success: true, message: result.message || `Notification sent to ${phone} via WhatsApp.` };
      }
      return { success: false, message: `Failed to send WhatsApp: ${result.error}` };
    }

    return { success: false, message: `Could not trigger ${type}. Missing phone or message content.` };
  }

}

module.exports = new NotificationService();

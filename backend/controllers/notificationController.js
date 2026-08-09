const NotificationService = require('../services/notification/NotificationService');
const NotificationScheduler = require('../services/notification/NotificationScheduler');
const SentNotification = require('../models/SentNotification');
const User = require('../models/User');

exports.getNotifications = async (req, res, next) => {
  try {
    const response = await NotificationService.getNotifications();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.triggerNotification = async (req, res, next) => {
  try {
    const { type, metadata } = req.body;
    const response = await NotificationService.triggerNotification(type, metadata);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Force-run all pending notifications now
 * @route   POST /api/notifications/send-all
 * @access  Private/Admin
 */
exports.sendAllNow = async (req, res, next) => {
  try {
    await NotificationScheduler.runDailyNotifications();
    res.status(200).json({ success: true, message: 'All pending notifications have been processed.' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get sent notification history
 * @route   GET /api/notifications/history
 * @access  Private/Admin
 */
exports.getSentHistory = async (req, res, next) => {
  try {
    const { type, status, limit } = req.query;
    const filter = { type: { $ne: 'SYSTEM' } };
    if (type && type !== 'ALL') filter.type = type;
    if (status && status !== 'ALL') filter.status = status;

    const history = await SentNotification.find(filter)
      .sort('-sentAt')
      .limit(parseInt(limit) || 1000);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Send manual WhatsApp broadcast
 * @route   POST /api/notifications/broadcast
 * @access  Private/Admin
 */
exports.sendBroadcast = async (req, res, next) => {
  try {
    const { target, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }
    
    let users = [];
    if (target === 'VIP') {
      users = await User.find({ role: 'CUSTOMER', $or: [{ loyaltyPoints: { $gte: 100 } }, { visitCount: { $gte: 3 } }] });
    } else if (target === 'UPCOMING') {
      const Appointment = require('../models/Appointment');
      const upcoming = await Appointment.find({
        status: { $in: ['PENDING', 'CONFIRMED'] },
        appointmentDate: { $gte: new Date() }
      }).select('customer');
      const customerIds = upcoming.map(a => a.customer).filter(Boolean);
      users = await User.find({ _id: { $in: customerIds } });
    } else {
      users = await User.find({ role: 'CUSTOMER', phone: { $exists: true, $ne: null } });
    }

    const broadcastList = users.map(user => {
      const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
      const formattedText = `🌟 *BeautyBeats Special Offer*\n\nHi ${user.name || 'Customer'},\n${message}\n\n👉 Book your session today!`;
      const whatsappUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(formattedText)}` : null;
      return {
        id: user._id,
        name: user.name,
        phone: user.phone,
        whatsappUrl,
        formattedText
      };
    }).filter(b => b.whatsappUrl);

    // Save to SentNotification history
    const historyRecords = broadcastList.map(item => ({
      type: 'SPECIAL_EVENT',
      recipient: item.phone,
      message: item.formattedText,
      status: 'SENT',
      sentAt: new Date()
    }));

    if (historyRecords.length > 0) {
      await SentNotification.insertMany(historyRecords).catch(e => console.error('Broadcast log error:', e));
    }

    res.status(200).json({ 
      success: true, 
      message: `Broadcast links ready for ${broadcastList.length} customers!`,
      count: broadcastList.length,
      data: broadcastList
    });
  } catch (err) {
    next(err);
  }
};

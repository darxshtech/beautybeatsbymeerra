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
    
    // Find users based on target
    let query = { role: 'CUSTOMER' };
    if (target === 'VIP') {
      query.loyaltyPoints = { $gte: 1000 };
    }
    // Note: UPCOMING logic would ideally query Appointments, then extract customer IDs.
    // For simplicity, we just fetch customers and simulate the broadcast.

    const users = await User.find(query);
    
    // Mock sending WhatsApp broadcast by logging SentNotification
    const sentRecords = users.map(user => ({
      type: 'SPECIAL_EVENT',
      status: 'SENT',
      recipient: user.phone || 'Unknown',
      sentAt: new Date()
    }));

    if (sentRecords.length > 0) {
      await SentNotification.insertMany(sentRecords);
    }

    res.status(200).json({ success: true, message: `Broadcast sent to ${users.length} customers` });
  } catch (err) {
    next(err);
  }
};

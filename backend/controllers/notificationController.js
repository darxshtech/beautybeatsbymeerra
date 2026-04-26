const NotificationService = require('../services/notification/NotificationService');
const NotificationScheduler = require('../services/notification/NotificationScheduler');
const SentNotification = require('../models/SentNotification');

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

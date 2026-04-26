const AdminNotification = require('../models/AdminNotification');

/**
 * @desc    Get all admin notifications (latest first)
 * @route   GET /api/admin-notifications
 * @access  Private (ADMIN)
 */
exports.getAdminNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, type, limit } = req.query;
    const filter = {};
    if (unreadOnly === 'true') filter.isRead = false;
    if (type && type !== 'ALL') filter.type = type;

    const notifications = await AdminNotification.find(filter)
      .populate('employee', 'name')
      .populate('customer', 'name phone')
      .sort('-createdAt')
      .limit(parseInt(limit) || 1000);

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/admin-notifications/count
 * @access  Private (ADMIN)
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await AdminNotification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, count });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/admin-notifications/:id/read
 * @access  Private (ADMIN)
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/admin-notifications/read-all
 * @access  Private (ADMIN)
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const express = require('express');
const router = express.Router();
const { 
  getAdminNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/adminNotificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN'), getAdminNotifications);
router.get('/count', protect, authorize('ADMIN'), getUnreadCount);
router.put('/read-all', protect, authorize('ADMIN'), markAllAsRead);
router.put('/:id/read', protect, authorize('ADMIN'), markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getNotifications, triggerNotification, sendAllNow, getSentHistory } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN', 'STAFF'), getNotifications);
router.get('/history', protect, authorize('ADMIN'), getSentHistory);
router.post('/trigger', protect, authorize('ADMIN', 'STAFF'), triggerNotification);
router.post('/send-all', protect, authorize('ADMIN'), sendAllNow);

module.exports = router;

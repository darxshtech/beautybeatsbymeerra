const express = require('express');
const router = express.Router();
const { 
  clockIn, 
  clockOut, 
  getMyStatus, 
  getAllAttendance, 
  getMyLogs 
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Employee routes
router.post('/clock-in', protect, authorize('STAFF', 'ADMIN'), clockIn);
router.post('/clock-out', protect, authorize('STAFF', 'ADMIN'), clockOut);
router.get('/status', protect, authorize('STAFF', 'ADMIN'), getMyStatus);
router.get('/my-logs', protect, authorize('STAFF', 'ADMIN'), getMyLogs);

// Admin routes
router.get('/', protect, authorize('ADMIN'), getAllAttendance);

module.exports = router;

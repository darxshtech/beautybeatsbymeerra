const express = require('express');
const router = express.Router();
const { getDashboardStats, getTopServices, getRevenueByPeriod, getStaffClientStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('ADMIN'), getDashboardStats);
router.get('/top-services', protect, authorize('ADMIN', 'STAFF'), getTopServices);
router.get('/revenue', protect, authorize('ADMIN', 'STAFF'), getRevenueByPeriod);
router.get('/staff-clients', protect, authorize('ADMIN', 'STAFF'), getStaffClientStats);

module.exports = router;

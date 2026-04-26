const express = require('express');
const router = express.Router();
const DashboardService = require('../services/report/DashboardService');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    Get dashboard KPIs
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin/Staff
 */
router.get('/stats', protect, authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const response = await DashboardService.getDashboardStats();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

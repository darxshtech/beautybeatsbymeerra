const express = require('express');
const router = express.Router();
const { getPlans, updatePlan } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPlans);
router.put('/:id', protect, authorize('ADMIN'), updatePlan);

module.exports = router;

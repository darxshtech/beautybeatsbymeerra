const express = require('express');
const router = express.Router();
const { getPlans, updatePlan, createPlan } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPlans);
router.post('/', protect, authorize('ADMIN'), createPlan);
router.put('/:id', protect, authorize('ADMIN'), updatePlan);

module.exports = router;

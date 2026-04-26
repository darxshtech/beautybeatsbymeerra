const express = require('express');
const router = express.Router();
const { 
  getCoupons, 
  validateCoupon,
  generateCoupon,
  createCoupon, 
  deleteCoupon 
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN', 'STAFF'), getCoupons);
router.get('/validate/:code', validateCoupon); // Public - customers validate during booking
router.post('/generate', protect, authorize('ADMIN', 'STAFF'), generateCoupon);
router.post('/', protect, authorize('ADMIN'), createCoupon);
router.delete('/:id', protect, authorize('ADMIN'), deleteCoupon);

module.exports = router;

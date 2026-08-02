const express = require('express');
const router = express.Router();
const { 
  getBills, 
  getBillById, 
  createBill, 
  updateBillStatus,
  sendBillWhatsApp,
  generateCustomerHistoryPDF,
  generateSingleBillPDF
} = require('../controllers/billingController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const billingValidator = require('../validators/billing/billingValidator');

router.get('/', protect, authorize('ADMIN', 'STAFF'), getBills);
router.get('/customer/:id/pdf', protect, authorize('ADMIN', 'STAFF'), generateCustomerHistoryPDF);
router.get('/:id/pdf', optionalProtect, generateSingleBillPDF);
router.get('/:id', protect, getBillById);
router.post('/', protect, authorize('ADMIN', 'STAFF'), validate(billingValidator.create), createBill);
router.post('/:id/send', protect, authorize('ADMIN', 'STAFF'), sendBillWhatsApp);
router.put('/:id/status', protect, authorize('ADMIN'), validate(billingValidator.updateStatus), updateBillStatus);

module.exports = router;

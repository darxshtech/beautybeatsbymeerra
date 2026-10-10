const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  syncTransaction, 
  checkPaymentMatch, 
  verifyCustomerUtr,
  receiveBankSmsWebhook
} = require('../controllers/transactionController');

// Public endpoints for client website payment polling, customer confirmation & bank SMS webhook
router.get('/check-match', checkPaymentMatch);
router.post('/verify-customer-utr', verifyCustomerUtr);
router.post('/webhook/bank-sms', receiveBankSmsWebhook);

// Admin endpoints
router.get('/', getTransactions);
router.post('/sync', syncTransaction);

module.exports = router;

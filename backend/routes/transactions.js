const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  syncTransaction, 
  checkPaymentMatch, 
  verifyCustomerUtr 
} = require('../controllers/transactionController');

// Public endpoints for client website payment polling and customer confirmation
router.get('/check-match', checkPaymentMatch);
router.post('/verify-customer-utr', verifyCustomerUtr);

// Admin endpoints
router.get('/', getTransactions);
router.post('/sync', syncTransaction);

module.exports = router;

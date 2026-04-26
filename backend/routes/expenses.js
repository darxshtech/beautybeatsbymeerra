const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  addExpense, 
  getMonthlyReport 
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const expenseValidator = require('../validators/expense/expenseValidator');

router.get('/', protect, authorize('ADMIN'), getExpenses);
router.post('/', protect, authorize('ADMIN'), validate(expenseValidator.create), addExpense);
router.get('/report', protect, authorize('ADMIN'), getMonthlyReport);

module.exports = router;

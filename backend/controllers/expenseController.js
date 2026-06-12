const ExpenseService = require('../services/expense/ExpenseService');

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Private/Admin
 */
exports.getExpenses = async (req, res, next) => {
  try {
    const query = { ...req.query, branch: req.branch };
    const response = await ExpenseService.getExpenses(query);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add new expense
 * @route   POST /api/expenses
 * @access  Private/Admin
 */
exports.addExpense = async (req, res, next) => {
  try {
    const data = { ...req.body, branch: req.branch };
    const response = await ExpenseService.createExpense(data, req.user.id);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get monthly expense report
 * @route   GET /api/expenses/report
 * @access  Private/Admin
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const response = await ExpenseService.getMonthlyExpenseReport(year);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

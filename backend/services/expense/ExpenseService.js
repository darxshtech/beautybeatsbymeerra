const Expense = require('../../models/Expense');
const ErrorResponse = require('../../utils/errorHandler');

class ExpenseService {
  /**
   * Get all expenses with filtering/sorting
   */
  async getExpenses(query) {
    let queryStr = { ...query };

    // Monthly filtering
    if (query.month) {
      const year = query.year || new Date().getFullYear();
      const startDate = new Date(year, query.month - 1, 1);
      const endDate = new Date(year, query.month, 0);
      queryStr.date = { $gte: startDate, $lte: endDate };
      delete queryStr.month;
      delete queryStr.year;
    }

    const expenses = await Expense.find(queryStr)
      .populate('recordedBy', 'name')
      .sort('-date');

    return {
      success: true,
      count: expenses.length,
      data: expenses
    };
  }

  /**
   * Add new expense
   */
  async createExpense(data, userId) {
    const expense = await Expense.create({
      ...data,
      recordedBy: userId
    });

    return {
      success: true,
      data: expense
    };
  }

  /**
   * Monthly report aggregation
   */
  async getMonthlyExpenseReport(year) {
    const report = await Expense.aggregate([
       {
         $match: {
           date: {
             $gte: new Date(year, 0, 1),
             $lte: new Date(year, 11, 31)
           }
         }
       },
       {
         $group: {
           _id: { $month: "$date" },
           total: { $sum: "$amount" }
         }
       }
    ]);

    return {
      success: true,
      data: report
    };
  }
}

module.exports = new ExpenseService();

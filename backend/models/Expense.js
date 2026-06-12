const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // Utility, Rent, Products, etc.
  date: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: String, enum: ['SALON', 'CLINIC'], default: 'SALON' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);

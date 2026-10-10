const mongoose = require('mongoose');

const AccountTransactionSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CASH', 'CARD', 'NETBANKING'],
    default: 'UPI'
  },
  tag: {
    type: String,
    enum: ['CLIENT_WEBSITE_BOOKING', 'WALKIN_POS', 'OFFLINE_SALON', 'OTHER'],
    default: 'CLIENT_WEBSITE_BOOKING'
  },
  status: {
    type: String,
    enum: ['PENDING', 'RECEIVED', 'MATCHED'],
    default: 'RECEIVED'
  },
  customerName: {
    type: String
  },
  customerPhone: {
    type: String
  },
  utrNumber: {
    type: String
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  },
  notes: {
    type: String
  },
  branch: {
    type: String,
    enum: ['SALON', 'CLINIC'],
    default: 'SALON'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AccountTransaction', AccountTransactionSchema);

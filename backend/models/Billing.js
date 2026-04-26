const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    isService: { type: Boolean, default: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['CASH', 'CARD', 'UPI', 'CREDIT'], 
    default: 'CASH' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'PARTIAL'], 
    default: 'PENDING' 
  },
  invoiceUrl: { type: String }, // Link to PDF bill
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', BillingSchema);

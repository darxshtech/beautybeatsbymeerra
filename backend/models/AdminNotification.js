const mongoose = require('mongoose');

const AdminNotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: [
      'EMPLOYEE_CLOCK_IN', 
      'EMPLOYEE_CLOCK_OUT', 
      'CONSENT_FORM_DONE', 
      'SERVICE_STARTED', 
      'SERVICE_FINISHED', 
      'PAYMENT_RECEIVED',
      'SYSTEM'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Related entities
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  
  // Payment details (for PAYMENT_RECEIVED type)
  paymentInfo: {
    method: { type: String, enum: ['CASH', 'UPI', 'CARD', 'PREPAID'] },
    amount: { type: Number },
    transactionId: { type: String }
  },
  
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto-cleanup notifications older than 30 days
AdminNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);

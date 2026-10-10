const mongoose = require('mongoose');

const SalonSettingsSchema = new mongoose.Schema({
  branch: {
    type: String,
    enum: ['SALON', 'CLINIC'],
    default: 'SALON',
    unique: true
  },
  openingTime: {
    type: String,
    default: '10:00 AM'
  },
  closingTime: {
    type: String,
    default: '08:00 PM'
  },
  slotInterval: {
    type: Number,
    default: 30
  },
  closedDays: {
    type: [String],
    default: []
  },
  isClosedTodayOverride: {
    type: Boolean,
    default: false
  },
  bankDetails: {
    bankName: { type: String, default: 'Axis Bank' },
    accountHolderName: { type: String, default: 'BeautyBeats' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: 'beautybeats320-3@okaxis' },
    webhookSecret: { type: String, default: 'bb_secure_webhook_key' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalonSettings', SalonSettingsSchema);

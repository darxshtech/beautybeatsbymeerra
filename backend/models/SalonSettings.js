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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalonSettings', SalonSettingsSchema);

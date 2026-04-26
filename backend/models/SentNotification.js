const mongoose = require('mongoose');

/**
 * Tracks which notifications have been sent to avoid duplicates.
 * Each record represents one notification sent to a specific user on a specific day.
 */
const SentNotificationSchema = new mongoose.Schema({
  // Unique key per notification: e.g., "bday-userId-2026-04-12" or "remind-appId-2026-04-12"
  notificationKey: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // SPECIAL_EVENT, REMINDER, FOLLOW_UP, REVIEW_REQUEST
  recipient: { type: String }, // phone number
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
  message: { type: String },
  sentAt: { type: Date, default: Date.now }
});

// Auto-cleanup records older than 90 days
SentNotificationSchema.index({ sentAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('SentNotification', SentNotificationSchema);

const mongoose = require('mongoose');

const MessageTemplateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // SPECIAL_EVENT, APPOINTMENT_REMINDER, REVIEW_REQUEST
  label: { type: String, required: true },
  messageBody: { type: String, required: true },
  discountPercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Seed defaults if collection is empty
MessageTemplateSchema.statics.seedDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.insertMany([
      {
        key: 'SPECIAL_EVENT',
        label: 'Special Event Promo (Birthday/Anniversary/Festival)',
        messageBody: 'Hello {{name}}! 🎉 Wishing you a very Happy {{event}} from the BeautyBeats family! As a gift, use your exclusive code {{coupon}} for {{discount}}% off on any treatment. Book now! 💅✨',
        discountPercent: 20
      },
      {
        key: 'APPOINTMENT_REMINDER',
        label: 'Appointment Reminder (Day Before)',
        messageBody: 'Hi {{name}}! This is a reminder for your {{service}} appointment tomorrow at {{time}} at BeautyBeats. Please arrive 5 minutes early. We look forward to seeing you! 🌟',
        discountPercent: 0
      },
      {
        key: 'REVIEW_REQUEST',
        label: 'Post-Appointment Review Request',
        messageBody: 'Hi {{name}}! Thank you for visiting BeautyBeats today. 🌸 We hope you loved your {{service}}! Please leave us a quick review: {{reviewLink}} Your feedback means the world to us!',
        discountPercent: 0
      }
    ]);
    console.log('[SEED] Default message templates created.');
  }
};

module.exports = mongoose.model('MessageTemplate', MessageTemplateSchema);

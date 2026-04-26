const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: String, required: true }, // Keeping as string to allow like '$29' or '₹999'
  interval: { type: String, default: 'monthly' },
  color: { type: String, default: 'from-pink-400 to-rose-400' },
  popular: { type: Boolean, default: false },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

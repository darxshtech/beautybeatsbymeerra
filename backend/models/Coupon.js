const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Per-customer unique coupon fields
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isUsed: { type: Boolean, default: false },
  eventType: { type: String }, // Birthday, Anniversary, Gudi Padwa, Womens Day, etc.
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', CouponSchema);

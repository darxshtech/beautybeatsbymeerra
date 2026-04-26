const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  password: { type: String },
  phone: { type: String, sparse: true, unique: true }, // Changed from required: true to sparse: true
  role: { type: String, enum: ['ADMIN', 'STAFF', 'CUSTOMER'], default: 'CUSTOMER' },
  googleId: { type: String, sparse: true },
  isProfileComplete: { type: Boolean, default: true },
  
  // Customer Specific Fields
  address: { type: String },
  birthday: { type: Date },
  anniversary: { type: Date },
  skinToneInfo: {
    skinType: String,
    concerns: [String],
    notes: String
  },
  loyaltyPoints: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date },
  registrationSource: { type: String, enum: ['ONLINE', 'WALKIN'], default: 'ONLINE' },
  
  // Subscription / Membership Fields
  subscription: {
    planName: { type: String, default: 'NONE' }, // e.g. Basic, Premium, VIP
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED'], default: 'INACTIVE' },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  // Staff Specific Fields
  specialization: [String],
  availability: [{
    day: String,
    slots: [String]
  }],
  isOff: { type: Boolean, default: false },
  offReason: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

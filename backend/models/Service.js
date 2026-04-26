const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true }, // e.g., Hair, Skin, Nails
  duration: { type: Number, required: true }, // in minutes
  price: { type: Number, required: true },
  
  // Packages (Gold / Silver / Custom)
  isPackage: { type: Boolean, default: false },
  packageName: { type: String }, // Gold, Silver, Custom
  includedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  
  imageUrl: { type: String },
  followUpDays: { type: Number, default: 0 }, // 0 = no follow-up, e.g. Facial=14, Hair Treatment=21
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);

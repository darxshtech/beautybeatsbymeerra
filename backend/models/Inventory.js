const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  stockCount: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' }, // pcs, ml, gram, etc.
  reorderLevel: { type: Number, default: 5 },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);

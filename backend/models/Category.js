const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  mainCategory: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

// Seed default categories if collection is empty
CategorySchema.statics.seedDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.insertMany([
      { name: 'Hair treatment' },
      { name: 'Clean up' },
      { name: 'Facial basic' },
      { name: 'Facial advance' }
    ]);
    console.log('[SEED] Default service categories created.');
  }
};

module.exports = mongoose.model('Category', CategorySchema);

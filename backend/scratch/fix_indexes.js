const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dropIndex = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const list = await mongoose.connection.db.collection('users').indexes();
    console.log('Current Indexes:', list);
    
    // Drop the phone index to let sparse: true take effect
    await mongoose.connection.db.collection('users').dropIndex('phone_1');
    console.log('Dropped phone_1 index');
  } catch (err) {
    console.log('Error or index not found:', err.message);
  }
  process.exit(0);
};

dropIndex();

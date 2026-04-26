const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beauty-beats');
    console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CRITICAL] MongoDB Connection Failed: ${error.message}`);
    console.warn('[WARNING] Backend running without a database. Activity will not be persistent.');
  }
};

module.exports = connectDB;

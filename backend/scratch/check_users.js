const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).select('+password');
    console.log(JSON.stringify(users.map(u => ({ email: u.email, phone: u.phone, hasPassword: !!u.password, name: u.name, role: u.role, registrationSource: u.registrationSource })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUsers();

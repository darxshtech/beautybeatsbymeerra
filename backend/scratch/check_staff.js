const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });

async function checkStaff() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const staff = await User.find({ role: { $in: ['STAFF', 'ADMIN'] } });
    console.log(`TOTAL_STAFF_COUNT: ${staff.length}`);
    staff.forEach(s => {
      console.log(`STAFF: ${s.name} | ROLE: ${s.role} | IS_OFF: ${s.isOff}`);
    });
    
    // Check current availability logic filter
    const activeStaff = await User.find({ role: { $in: ['STAFF', 'ADMIN'] }, isOff: { $ne: true } });
    console.log(`ACTIVE_STAFF_COUNT: ${activeStaff.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStaff();

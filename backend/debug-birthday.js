require('dotenv').config();
require('./config/db')();

setTimeout(async () => {
  try {
    const User = require('./models/User');
    
    // Fix demo customer's birthday to today at noon UTC (avoids timezone issues)
    const today = new Date();
    const fixedBirthday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    
    const demo = await User.findOneAndUpdate(
      { name: 'demo' },
      { birthday: fixedBirthday },
      { new: true }
    );
    
    if (demo) {
      console.log(`Fixed demo's birthday to: ${demo.birthday.toISOString()}`);
      console.log(`  Local getDate(): ${demo.birthday.getDate()}`);
      console.log(`  Local getMonth(): ${demo.birthday.getMonth()}`);
    }
    
    // Now verify the notification logic
    const now = new Date();
    console.log(`\nToday local: day=${now.getDate()}, month=${now.getMonth()}`);
    
    const customers = await User.find({ role: 'CUSTOMER', birthday: { $exists: true, $ne: null } }).select('name birthday phone');
    console.log(`\nCustomers with birthdays:`);
    customers.forEach(c => {
      const b = new Date(c.birthday);
      const match = b.getDate() === now.getDate() && b.getMonth() === now.getMonth();
      console.log(`  ${c.name}: ${b.toISOString()} | local day=${b.getDate()} month=${b.getMonth()} | MATCH: ${match}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}, 3000);

const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beautybeats');
    console.log('Connected to MongoDB');

    const User = require('./models/User');
    const Appointment = require('./models/Appointment');
    const Billing = require('./models/Billing');

    const phone = '7796384371';
    
    // Find customers with this phone
    const customers = await User.find({ phone });
    const ids = customers.map(c => c._id);

    if (ids.length > 0) {
      console.log(`Found ${ids.length} customers with phone ${phone}. Deleting...`);
      
      await Appointment.deleteMany({ customer: { $in: ids } });
      await Billing.deleteMany({ customer: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
      
      console.log('Cleanup complete for phone:', phone);
    } else {
      console.log('No customers found with phone:', phone);
    }

    // Optional: Delete all walkin appointments and their billing if needed
    // await Appointment.deleteMany({ type: 'WALKIN' });

    process.exit(0);
  } catch (err) {
    console.error('Cleanup Error:', err);
    process.exit(1);
  }
}

cleanup();

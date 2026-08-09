module.paths.push('d:/code mode/freelancing/beauty-beats/backend/node_modules');
require('dotenv').config({ path: 'd:/code mode/freelancing/beauty-beats/backend/.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const ConsentForm = require('../models/ConsentForm');
const SentNotification = require('../models/SentNotification');

async function clearData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.\n');

    // 1. Delete all appointments
    const apptResult = await Appointment.deleteMany({});
    console.log(`[DELETED] ${apptResult.deletedCount} Appointments.`);

    // 2. Delete all billings
    const billResult = await Billing.deleteMany({});
    console.log(`[DELETED] ${billResult.deletedCount} Billing records.`);

    // 3. Delete all consent forms
    const consentResult = await ConsentForm.deleteMany({});
    console.log(`[DELETED] ${consentResult.deletedCount} Consent forms.`);

    // 4. Delete all sent notifications
    const sentNotifResult = await SentNotification.deleteMany({});
    console.log(`[DELETED] ${sentNotifResult.deletedCount} Sent notifications.`);

    // 5. Delete Customer User Accounts ONLY (keep ADMIN & STAFF)
    const userResult = await User.deleteMany({ role: 'CUSTOMER' });
    console.log(`[DELETED] ${userResult.deletedCount} Customer User Accounts.`);

    console.log('\n--- SUCCESS: Data Cleanup Complete ---');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

clearData();

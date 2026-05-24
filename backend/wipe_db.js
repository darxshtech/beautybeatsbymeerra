require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Billing = require('./models/Billing');
const Coupon = require('./models/Coupon');
const Attendance = require('./models/Attendance');
const AdminNotification = require('./models/AdminNotification');
const SentNotification = require('./models/SentNotification');

async function wipeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Starting DB wipe...');

    // 1. Delete all appointments
    const apptResult = await Appointment.deleteMany({});
    console.log(`Deleted ${apptResult.deletedCount} Appointments.`);

    // 2. Delete all billings
    const billResult = await Billing.deleteMany({});
    console.log(`Deleted ${billResult.deletedCount} Billings.`);

    // 3. Delete all attendance logs
    const attResult = await Attendance.deleteMany({});
    console.log(`Deleted ${attResult.deletedCount} Attendance logs.`);

    // 4. Delete all notifications
    const adminNotifResult = await AdminNotification.deleteMany({});
    const sentNotifResult = await SentNotification.deleteMany({});
    console.log(`Deleted ${adminNotifResult.deletedCount} Admin Notifications and ${sentNotifResult.deletedCount} Sent Notifications.`);

    // 5. Delete all customers and staff (Keep SYSTEM_ADMIN or role ADMIN)
    // Wait, the user said "admin credentials from db", so keep ADMIN role.
    const userResult = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`Deleted ${userResult.deletedCount} Non-Admin Users.`);

    console.log('--- DB Wipe Completed Successfully ---');
  } catch (error) {
    console.error('Error during DB wipe:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

wipeDatabase();

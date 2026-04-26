const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('../models/Appointment');

dotenv.config({ path: '.env' });

async function checkAppointments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check appointments for today
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23,59,59,999);
    
    const count = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['CANCELLED', 'NOSHOW'] }
    });
    
    console.log(`TOTAL_ACTIVE_APPOINTMENTS_TODAY: ${count}`);
    
    // Sample a few appointments to see their structure
    const samples = await Appointment.find({}).limit(5).populate('staff', 'name');
    samples.forEach(a => {
      console.log(`APP: ${a.appointmentDate.toISOString()} | SLOT: ${a.timeSlot} | STAFF: ${a.staff?.name} | STATUS: ${a.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAppointments();

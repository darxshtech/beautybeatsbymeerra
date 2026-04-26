require('dotenv').config();
require('./config/db')();

setTimeout(async () => {
  try {
    const User = require('./models/User');
    const Appointment = require('./models/Appointment');
    
    console.log('=== Staff List ===');
    const staff = await User.find({ role: { $in: ['STAFF', 'ADMIN'] } });
    staff.forEach(s => {
      console.log(`- ${s.name} (${s.role}) | isOff: ${s.isOff}`);
    });

    const activeStaff = staff.filter(s => !s.isOff);
    console.log(`\nActive Staff Count: ${activeStaff.length}`);

    // Check for today's appointments
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const apps = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('staff', 'name');

    console.log(`\n=== Today's Appointments (${apps.length}) ===`);
    apps.forEach(a => {
      console.log(`- ${a.timeSlot} | Staff: ${a.staff?.name || 'Any'} | Status: ${a.status}`);
    });

    // Check availability for a specific slot manually
    const slot = '10:30 AM';
    let foundAny = false;
    for (const s of activeStaff) {
      const existing = await Appointment.findOne({
        staff: s._id,
        appointmentDate: today,
        timeSlot: slot,
        status: { $nin: ['CANCELLED', 'NOSHOW'] }
      });
      if (!existing) {
        foundAny = true;
        console.log(`\nSlot ${slot} is available with ${s.name}`);
      }
    }
    
    if (!foundAny) {
      console.log(`\nSlot ${slot} is FULL for all staff`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}, 2000);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

const User = require('../models/User');

const seedStaff = async () => {
  await connectDB();
  
  const staffData = [
    {
      name: 'Snehal',
      email: 'snehal@beautybeats.in',
      role: 'STAFF',
      specialization: ['Skin Expert', 'Facials'],
      isProfileComplete: true
    },
    {
      name: 'Amit',
      email: 'amit@beautybeats.in',
      role: 'STAFF',
      specialization: ['Hair Stylist', 'Scalp Treatment'],
      isProfileComplete: true
    },
    {
      name: 'Pooja',
      email: 'pooja@beautybeats.in',
      role: 'STAFF',
      specialization: ['Makeup Artist', 'Bridal'],
      isProfileComplete: true
    }
  ];

  for (const s of staffData) {
    const exists = await User.findOne({ name: s.name });
    if (!exists) {
      await User.create(s);
      console.log(`Created staff: ${s.name}`);
    }
  }

  console.log('Seeding completed');
  process.exit(0);
};

seedStaff();

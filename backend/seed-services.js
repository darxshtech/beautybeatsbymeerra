const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');
const Category = require('./models/Category');
const connectDB = require('./config/db');

dotenv.config();

const data = [
  { category: 'Relaxing', name: 'Hand Masaage', price: 600, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Relaxing', name: 'Full Leg', price: 800, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Relaxing', name: 'Back Massage', price: 700, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Relaxing', name: 'Head Massage', price: 550, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Relaxing', name: 'Feet Massage', price: 300, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Threading', name: 'Eye Brows', price: 40, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Threading', name: 'Upper Lips', price: 20, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Threading', name: 'Fore Head', price: 20, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Threading', name: 'Chin', price: 20, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Hand Wax', price: 250, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Half Leg', price: 250, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Full Leg', price: 500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Under Arms', price: 80, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Back Half', price: 150, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Back Full', price: 200, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Stomach', price: 200, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Choclate Wax', name: 'Full Body', price: 1800, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Spa', name: 'Basic Spa', price: 1499, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Spa', name: 'Advance Spa', price: 2999, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Spa', name: 'Luxurious Spa', price: 4500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Facial Delux', name: 'O3 + 10 step', price: 5000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Facial Delux', name: 'O3 + 7 step', price: 3500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Facial Delux', name: 'Gold Radiant', price: 3000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Facial Delux', name: 'Aroma', price: 4000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Face Wax Rica', name: 'Neck', price: 100, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Face Wax Rica', name: 'Upper Lips', price: 50, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Face Wax Rica', name: 'Fore Head', price: 80, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Face Wax Rica', name: 'Side Lock', price: 100, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Face Wax Rica', name: 'Face Wax', price: 450, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Hand', price: 350, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Half Leg', price: 450, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Full Leg', price: 900, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Under Arms', price: 100, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Back Half', price: 300, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Full Back', price: 400, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Body Wax', price: 2500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Bikini Wax', price: 2000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Body Wax Rica', name: 'Stomach', price: 250, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Pedicure', name: 'Basic', price: 799, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Pedicure', name: 'Advance', price: 1299, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Pedicure', name: 'Delux', price: 1599, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Pedicure', name: 'Wax Pedicure', price: 1899, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Manicure', name: 'Basic', price: 599, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Manicure', name: 'Advance', price: 799, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Manicure', name: 'Delux', price: 999, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour', name: 'Root Touchup', price: 1500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour', name: 'Global', price: 3500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Crown Area', price: 2000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Global', price: 3500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Balayage', price: 4000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Ombre', price: 4500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Global Highlight', price: 5000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Colour Highlights', name: 'Stripsper 1', price: 300, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Spa', name: 'Matrix Spa', price: 850, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Spa', name: 'Loreal Spa', price: 1000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Spa', name: 'Wella Spa', price: 1500, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Spa', name: 'Dandruff Spa', price: 2000, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Spa', name: 'Delux Spa', price: 2200, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Advance Hair cut', name: 'Layer Cut', price: 400, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Advance Hair cut', name: 'Mix Hair Cut', price: 400, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Advance Hair cut', name: 'Beauty Beats Signature Hair Cut', price: 599, duration: 60, branch: 'SALON', description: 'Hair Wash With Blow Dry', isActive: true },
  { category: 'Hair Cut', name: 'U cut', price: 200, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Cut', name: 'V Cut', price: 250, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Cut', name: 'Trim', price: 200, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Cut', name: 'Flex', price: 150, duration: 60, branch: 'SALON', isActive: true },
  { category: 'Hair Cut', name: 'Baby Hair Cut', price: 200, duration: 60, branch: 'SALON', isActive: true },
];

const seedServices = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get unique categories
    const categoriesSet = new Set(data.map(item => item.category));
    const categoriesArray = Array.from(categoriesSet);

    for (const catName of categoriesArray) {
      const existing = await Category.findOne({ name: catName });
      if (!existing) {
        await Category.create({ name: catName });
        console.log(`Created category: ${catName}`);
      }
    }

    for (const item of data) {
      const existing = await Service.findOne({ name: item.name, category: item.category });
      if (!existing) {
        await Service.create({
          name: item.name,
          category: item.category,
          price: item.price,
          duration: item.duration,
          branch: item.branch,
          isActive: item.isActive,
          description: item.description || ''
        });
        console.log(`Created service: ${item.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedServices();

const mongoose = require('mongoose');
const Service = require('./models/Service');
const dotenv = require('dotenv');

dotenv.config();

const seedService = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const service = await Service.findOneAndUpdate(
            { name: 'Premium Haircut' },
            {
                name: 'Premium Haircut',
                description: 'Expert haircut and styling.',
                category: 'Hair',
                duration: 45,
                price: 45,
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('Service seeded:', service._id);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedService();

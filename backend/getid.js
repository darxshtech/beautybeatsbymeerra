const mongoose = require('mongoose');
const Service = require('./models/Service');
const dotenv = require('dotenv');

dotenv.config();

const getService = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const service = await Service.findOne({});
        console.log('ID:', service ? service._id : 'NONE');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

getService();

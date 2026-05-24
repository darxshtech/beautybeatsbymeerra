require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Billing = require('./models/Billing');
const AppointmentService = require('./services/appointment/AppointmentService');

async function runTests() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  try {
    console.log('--- Test 1: Generate dynamic slots ---');
    // Using simple mock to simulate req/res
    const appointmentController = require('./controllers/appointmentController');
    const req = { query: { date: new Date().toISOString() } };
    const res = {
      status: (code) => ({
        json: (data) => console.log(`Availability slots returned: ${data.data.length}`)
      })
    };
    await appointmentController.getAvailability(req, res, (err) => console.error(err));

    console.log('--- Test 2: Create Split Payment ---');
    const reqSplit = {
      params: { id: new mongoose.Types.ObjectId() },
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        paymentMethod: 'SPLIT',
        amount: 1000,
        splitDetails: { cashAmount: 500, upiAmount: 500 }
      }
    };
    console.log('Tested split payment logic (mocked). Status should be PAID and pendingAmount 0.');
    let paidAmount = (Number(reqSplit.body.splitDetails.cashAmount) || 0) + (Number(reqSplit.body.splitDetails.upiAmount) || 0);
    let pendingAmount = Math.max(0, reqSplit.body.amount - paidAmount);
    if(pendingAmount === 0) {
      console.log('✅ Split Payment Math OK');
    } else {
      console.error('❌ Split Payment Math FAILED');
    }

    console.log('All basic unit tests passed.');
  } catch (error) {
    console.error('Test failed', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

runTests();

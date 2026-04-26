const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const WhatsappService = require('./services/notification/WhatsappService');
const connectDB = require('./config/db');

dotenv.config();

async function runTest() {
  await connectDB();
  const testPhone = '7796384371';
  
  console.log('--- BEAUTYBEATS WHATSAPP TEST FLOW ---');
  console.log(`Setting up test data for target phone: ${testPhone}`);

  try {
    // 1. Force the WhatsApp Service to test the connection directly
    console.log('\n[1/3] Testing Direct WhatsApp Connection (Using custom free-form text)...');
    const result = await WhatsappService.sendMessage(
      testPhone, 
      "Hello! This is a Beauty Beats custom messaging test. 💅 Your freeform text integration is active!"
    );
    
    if (result.success) {
      console.log('✅ Direct Message Sent Successfully!');
      console.log('--- META API RESPONSE ---');
      console.dir(result.data, { depth: null });
      console.log('-------------------------');
    } else {
      console.error('❌ Failed to send direct message:', result.error);
    }

    // 2. Set up test profile
    console.log('\n[2/3] Setting up test customer profile...');
    
    let user = await User.findOne({ phone: testPhone });
    if (!user) {
      // Create a dummy user
      user = new User({
        name: 'Test Customer',
        email: 'testcustomer@beautybeats.in',
        phone: testPhone,
        role: 'CUSTOMER'
      });
    }

    // Set birthday to today!
    user.birthday = new Date();
    await user.save();
    
    console.log(`✅ Test customer '${user.name}' updated! Their birthday is set to TODAY.`);
    console.log(`\n[3/3] TEST FLOW SETUP COMPLETE!`);
    console.log(`\n==============================================`);
    console.log(`HOW TO TEST THE FULL UI FLOW:`);
    console.log(`1. AS CUSTOMER: The test profile (phone: ${testPhone}) is ready, simulating a user who just completed their profile today on their birthday.`);
    console.log(`2. AS ADMIN:`);
    console.log(`   - Go to http://localhost:3001/notifications`);
    console.log(`   - You will see a "Birthday Alert" for 'Test Customer'.`);
    console.log(`   - Click the "Send Coupon" button next to their name.`);
    console.log(`   - Check WhatsApp for +91 ${testPhone} - you should receive the formal Birthday Coupon message!`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error('Exception during test setup:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

runTest();

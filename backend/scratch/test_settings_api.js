const axios = require('axios');

async function testSettings() {
  try {
    const res = await axios.get('http://localhost:5000/api/settings/salon');
    console.log('Status:', res.status);
    console.log('Data:', res.data);
    if (res.data.success && res.data.data.openingTime && res.data.data.closingTime) {
      console.log('TEST PASSED');
    } else {
      console.error('TEST FAILED: Invalid response payload');
      process.exit(1);
    }
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    process.exit(1);
  }
}

testSettings();

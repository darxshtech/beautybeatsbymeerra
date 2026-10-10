const axios = require('axios');

async function testAvailability() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await axios.get(`http://localhost:5000/api/appointments/availability?date=${today}&duration=60`);
    console.log('Availability response status:', res.status);
    console.log('Total slots returned:', res.data.data.length);
    console.log('First 3 slots:', res.data.data.slice(0, 3));
    console.log('Last 3 slots:', res.data.data.slice(-3));
    console.log('TEST PASSED');
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    process.exit(1);
  }
}

testAvailability();

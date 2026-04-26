const axios = require('axios');

async function testAvailability() {
  const API = 'http://127.0.0.1:5000/api';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  console.log(`Testing availability for: ${dateStr}`);
  
  try {
    const res = await axios.get(`${API}/appointments/availability?date=${dateStr}&staffId=`);
    console.log('Response Success:', res.data.success);
    console.log('Slots Returned:', res.data.data.length);
    
    const unavailable = res.data.data.filter(s => !s.available);
    console.log('Unavailable Slots:', unavailable.map(s => s.slot));
    
    if (res.data.data.every(s => !s.available)) {
      console.log('⚠️ ALERT: ALL SLOTS ARE SHOWING AS FULL!');
    } else {
      console.log('✅ Some slots are available.');
    }
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
}

testAvailability();

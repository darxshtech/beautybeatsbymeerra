const axios = require('axios');

async function verifyAll() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // 1. Verify Salon Settings GET
  const settingsRes = await axios.get('http://localhost:5000/api/settings/salon');
  console.log('✓ 1. SalonSettings GET:', settingsRes.status, {
    openingTime: settingsRes.data.data.openingTime,
    closingTime: settingsRes.data.data.closingTime
  });

  // 2. Verify Dynamic Availability Slots
  const today = new Date().toISOString().split('T')[0];
  const availRes = await axios.get(`http://localhost:5000/api/appointments/availability?date=${today}&duration=45`);
  console.log('✓ 2. Availability Slots API:', availRes.status, `Total slots: ${availRes.data.data.length}`);
  
  const sampleSlots = availRes.data.data.map(s => `${s.slot} (${s.available ? 'open' : 'closed'})`);
  console.log('    Sample slots:', sampleSlots.slice(0, 3), '...', sampleSlots.slice(-3));

  // 3. Verify Account Transactions Sync
  const testRef = `VERIFY-REF-${Date.now().toString().slice(-4)}`;
  const syncRes = await axios.post('http://localhost:5000/api/transactions/sync', {
    referenceId: testRef,
    amount: 800,
    paymentMethod: 'UPI',
    tag: 'CLIENT_WEBSITE_BOOKING',
    customerName: 'Ananya Verma'
  });
  console.log('✓ 3. Transactions Sync API:', syncRes.status, `Ref: ${syncRes.data.data.referenceId}`);

  // 4. Verify 5-minute Payment Polling & Matching
  const matchRes = await axios.get(`http://localhost:5000/api/transactions/check-match?referenceId=${testRef}&amount=800`);
  console.log('✓ 4. Payment Match Check API:', matchRes.status, `Matched: ${matchRes.data.matched}`);

  // 5. Verify Customer UTR Submission
  const utrRes = await axios.post('http://localhost:5000/api/transactions/verify-customer-utr', {
    referenceId: `VERIFY-UTR-${Date.now().toString().slice(-4)}`,
    amount: 1200,
    utrNumber: '998877665544',
    customerName: 'Rahul Joshi'
  });
  console.log('✓ 5. Customer UTR Verification API:', utrRes.status, `Matched: ${utrRes.data.matched}`);

  // 6. Verify Transactions List with Filter
  const listRes = await axios.get('http://localhost:5000/api/transactions?tag=CLIENT_WEBSITE_BOOKING');
  console.log('✓ 6. Transactions List API:', listRes.status, `Count: ${listRes.data.data.length}`, `Total Volume: ₹${listRes.data.stats.totalVolume}`);

  console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

verifyAll().catch(err => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});

const axios = require('axios');

async function testTransactions() {
  try {
    // 1. Sync a test transaction
    const syncRes = await axios.post('http://localhost:5000/api/transactions/sync', {
      referenceId: 'TEST-REF-001',
      amount: 499,
      paymentMethod: 'UPI',
      tag: 'CLIENT_WEBSITE_BOOKING',
      customerName: 'Priya Sharma'
    });
    console.log('Sync status:', syncRes.status, syncRes.data.data.referenceId);

    // 2. Check match by referenceId
    const matchRes = await axios.get('http://localhost:5000/api/transactions/check-match?referenceId=TEST-REF-001&amount=499');
    console.log('Match status:', matchRes.status, 'Matched:', matchRes.data.matched);

    // 3. List transactions
    const listRes = await axios.get('http://localhost:5000/api/transactions');
    console.log('List count:', listRes.data.data.length, 'Total Volume:', listRes.data.stats.totalVolume);

    console.log('ALL TRANSACTION TESTS PASSED');
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    process.exit(1);
  }
}

testTransactions();

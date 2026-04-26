/**
 * Comprehensive API Smoke Test for BeautyBeats
 * Tests all major endpoints to verify they don't 404/500
 */
const axios = require('axios');
const API = 'http://127.0.0.1:5000/api';

// We need an admin token to test protected routes
async function main() {
  console.log('=== BEAUTYBEATS API SMOKE TEST ===\n');

  // 1. Login as admin
  let token;
  try {
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: 'admin@beautybeats.in',
      password: 'Admin@123'
    });
    token = loginRes.data.token;
    console.log('✅ Auth: Admin login successful');
  } catch (e) {
    console.error('❌ Auth: Admin login failed -', e.response?.data?.message || e.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // List of endpoints to test
  const tests = [
    { method: 'GET', path: '/dashboard/stats', desc: 'Dashboard Stats' },
    { method: 'GET', path: '/services', desc: 'Services List' },
    { method: 'GET', path: '/users/customers?limit=5', desc: 'Customers List' },
    { method: 'GET', path: '/users/staff', desc: 'Staff List' },
    { method: 'GET', path: '/appointments?search=', desc: 'Appointments List' },
    { method: 'GET', path: '/billing?search=', desc: 'Billing List' },
    { method: 'GET', path: '/inventory?search=&lowStock=false', desc: 'Inventory' },
    { method: 'GET', path: '/expenses', desc: 'Expenses' },
    { method: 'GET', path: '/coupons', desc: 'Coupons' },
    { method: 'GET', path: '/feedback', desc: 'Feedback (Admin)' },
    { method: 'GET', path: '/feedback/public', desc: 'Feedback (Public)', noAuth: true },
    { method: 'GET', path: '/notifications', desc: 'Notifications' },
    { method: 'GET', path: '/message-templates', desc: 'Message Templates' },
    { method: 'GET', path: '/reports/top-services', desc: 'Reports: Top Services' },
    { method: 'GET', path: '/reports/revenue?filter=month', desc: 'Reports: Revenue (Month)' },
    { method: 'GET', path: '/reports/revenue?filter=today', desc: 'Reports: Revenue (Today)' },
    { method: 'GET', path: '/reports/revenue?filter=week', desc: 'Reports: Revenue (Week)' },
  ];

  let pass = 0, fail = 0;
  for (const test of tests) {
    try {
      const config = test.noAuth ? {} : { headers };
      const res = await axios({
        method: test.method,
        url: `${API}${test.path}`,
        ...config
      });
      console.log(`✅ ${test.desc}: ${res.status}`);
      pass++;
    } catch (e) {
      console.error(`❌ ${test.desc}: ${e.response?.status || 'NETWORK_ERROR'} - ${e.response?.data?.message || e.message}`);
      fail++;
    }
  }

  // Test coupon validation (should return 404 for non-existent code)
  try {
    await axios.get(`${API}/coupons/validate/FAKE123`);
    console.log('⚠️  Coupon validation: Expected 404 but got 200');
  } catch (e) {
    if (e.response?.status === 404) {
      console.log('✅ Coupon Validation: Correctly returns 404 for invalid code');
      pass++;
    } else {
      console.error(`❌ Coupon Validation: Unexpected ${e.response?.status}`);
      fail++;
    }
  }

  console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed ===`);
}

main().catch(console.error);

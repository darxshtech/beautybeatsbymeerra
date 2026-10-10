const { timeStringToMinutes, minutesToTimeString, generateSlots } = require('../utils/slotGenerator');

// Test 1: Convert time string
const m1 = timeStringToMinutes('10:00 AM');
const m2 = timeStringToMinutes('08:00 PM');
if (m1 !== 600 || m2 !== 1200) {
  console.error('FAIL: timeStringToMinutes conversion incorrect', { m1, m2 });
  process.exit(1);
}

// Test 2: Generate slots
const slots = generateSlots('10:00 AM', '12:00 PM', 30);
const expected = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
if (JSON.stringify(slots) !== JSON.stringify(expected)) {
  console.error('FAIL: generateSlots mismatch', { slots, expected });
  process.exit(1);
}

console.log('SLOT GENERATOR UNIT TESTS PASSED:', slots);

# Salon Schedule Opening & Closing Time Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic Salon Opening & Closing time configuration in the Admin Dashboard, enforce schedule slots in the Backend, and update the Client Website "Build Your Schedule" so that if the salon is closed for today, date selection starts from tomorrow.

**Architecture:** A MongoDB `SalonSettings` model with CRUD endpoints (`/api/settings/salon`) provides dynamic open/close hours. The backend `/api/appointments/availability` dynamically generates booking slots within these hours and excludes past times for today. The Client Website fetches the settings, detects if the salon has closed today, starts the 7-day selector from tomorrow if closed, and constrains booking slots.

**Tech Stack:** Node.js, Express, MongoDB/Mongoose, Next.js (App Router), React, Tailwind CSS, Lucide Icons, Axios.

## Global Constraints
- Do not break existing appointment booking flows or schema.
- Default salon hours are 10:00 AM to 08:00 PM with 30-minute intervals if unconfigured.
- All date/time calculations for today must be resilient to server timezones by calculating Indian Standard Time (Asia/Kolkata).
- Follow clean coding practices without code duplication or untested placeholders.

---

### Task 1: Backend SalonSettings Model, Controller, and Routes

**Files:**
- Create: `backend/models/SalonSettings.js`
- Create: `backend/controllers/settingsController.js`
- Create: `backend/routes/settings.js`
- Modify: `backend/server.js:90-95`
- Test: `backend/scratch/test_settings_api.js`

**Interfaces:**
- Consumes: `backend/middleware/auth.js` (`protect`, `authorize`), `backend/models/SalonSettings.js`
- Produces: `GET /api/settings/salon` (public), `PUT /api/settings/salon` (admin protected)

- [ ] **Step 1: Create the failing API test script**

Create `backend/scratch/test_settings_api.js`:
```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/scratch/test_settings_api.js`
Expected: FAIL with 404 or connection error since `/api/settings/salon` is not yet implemented.

- [ ] **Step 3: Create SalonSettings Mongoose model**

Create `backend/models/SalonSettings.js`:
```javascript
const mongoose = require('mongoose');

const SalonSettingsSchema = new mongoose.Schema({
  branch: {
    type: String,
    enum: ['SALON', 'CLINIC'],
    default: 'SALON',
    unique: true
  },
  openingTime: {
    type: String,
    default: '10:00 AM'
  },
  closingTime: {
    type: String,
    default: '08:00 PM'
  },
  slotInterval: {
    type: Number,
    default: 30
  },
  closedDays: {
    type: [String],
    default: []
  },
  isClosedTodayOverride: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SalonSettings', SalonSettingsSchema);
```

- [ ] **Step 4: Create settingsController.js**

Create `backend/controllers/settingsController.js`:
```javascript
const SalonSettings = require('../models/SalonSettings');

// Helper to get or initialize default settings
const getOrCreateDefaultSettings = async (branch = 'SALON') => {
  let settings = await SalonSettings.findOne({ branch });
  if (!settings) {
    settings = await SalonSettings.create({
      branch,
      openingTime: '10:00 AM',
      closingTime: '08:00 PM',
      slotInterval: 30,
      closedDays: [],
      isClosedTodayOverride: false
    });
  }
  return settings;
};

// @desc    Get salon settings (Public)
// @route   GET /api/settings/salon
exports.getSalonSettings = async (req, res) => {
  try {
    const branch = req.query.branch || req.branch || 'SALON';
    const settings = await getOrCreateDefaultSettings(branch);
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    console.error('Error fetching salon settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

// @desc    Update salon settings (Admin only)
// @route   PUT /api/settings/salon
exports.updateSalonSettings = async (req, res) => {
  try {
    const branch = req.body.branch || req.branch || 'SALON';
    const { openingTime, closingTime, slotInterval, closedDays, isClosedTodayOverride } = req.body;

    let settings = await SalonSettings.findOne({ branch });
    if (!settings) {
      settings = new SalonSettings({ branch });
    }

    if (openingTime) settings.openingTime = openingTime;
    if (closingTime) settings.closingTime = closingTime;
    if (slotInterval) settings.slotInterval = Number(slotInterval);
    if (Array.isArray(closedDays)) settings.closedDays = closedDays;
    if (typeof isClosedTodayOverride === 'boolean') settings.isClosedTodayOverride = isClosedTodayOverride;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Salon settings updated successfully',
      data: settings
    });
  } catch (err) {
    console.error('Error updating salon settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};
```

- [ ] **Step 5: Create routes/settings.js and register in server.js**

Create `backend/routes/settings.js`:
```javascript
const express = require('express');
const router = express.Router();
const { getSalonSettings, updateSalonSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/salon', getSalonSettings);
router.put('/salon', protect, authorize('ADMIN'), updateSalonSettings);

module.exports = router;
```

In `backend/server.js`, mount `/api/settings`:
```javascript
app.use('/api/settings', require('./routes/settings'));
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node backend/scratch/test_settings_api.js`
Expected: `TEST PASSED` with openingTime and closingTime in output.

- [ ] **Step 7: Commit changes**

```bash
git add backend/models/SalonSettings.js backend/controllers/settingsController.js backend/routes/settings.js backend/server.js backend/scratch/test_settings_api.js
git commit -m "feat(backend): add SalonSettings model, controller, and routes"
```

---

### Task 2: Dynamic Slot Generation & Backend Availability Controller

**Files:**
- Modify: `backend/controllers/appointmentController.js:10-85`
- Test: `backend/scratch/test_dynamic_slots.js`

**Interfaces:**
- Consumes: `backend/models/SalonSettings.js`, `backend/controllers/appointmentController.js`
- Produces: Dynamic slots in `GET /api/appointments/availability` based on `openingTime` and `closingTime`

- [ ] **Step 1: Create the failing unit test for dynamic slot generation**

Create `backend/scratch/test_dynamic_slots.js`:
```javascript
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

console.log('SLOT GENERATOR UNIT TESTS PASSED');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node backend/scratch/test_dynamic_slots.js`
Expected: FAIL (Cannot find module `../utils/slotGenerator`)

- [ ] **Step 3: Create slotGenerator utility**

Create `backend/utils/slotGenerator.js`:
```javascript
// Convert "10:30 AM" or "08:00 PM" to minutes from 00:00
function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let [_, hours, minutes, ampm] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
  }
  return h * 60 + m;
}

// Convert minutes to "10:30 AM"
function minutesToTimeString(totalMinutes) {
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  const hh = displayH < 10 ? `0${displayH}` : `${displayH}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm} ${ampm}`;
}

// Generate slot intervals between open and close time
function generateSlots(openingTime, closingTime, interval = 30) {
  const openMinutes = timeStringToMinutes(openingTime);
  const closeMinutes = timeStringToMinutes(closingTime);
  const slots = [];
  for (let current = openMinutes; current < closeMinutes; current += interval) {
    slots.push(minutesToTimeString(current));
  }
  return slots;
}

module.exports = {
  timeStringToMinutes,
  minutesToTimeString,
  generateSlots
};
```

- [ ] **Step 4: Update appointmentController.js to use dynamic slots from SalonSettings**

In `backend/controllers/appointmentController.js`:
Import `SalonSettings` and slot utility:
```javascript
const SalonSettings = require('../models/SalonSettings');
const { timeStringToMinutes, generateSlots } = require('../utils/slotGenerator');
```
Update `getAvailability`:
```javascript
exports.getAvailability = async (req, res, next) => {
  try {
    const { date, staffId, duration } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });
    const serviceDuration = parseInt(duration) || 30;

    // Fetch dynamic salon settings
    let settings = await SalonSettings.findOne({ branch: 'SALON' });
    const openingTime = settings?.openingTime || '10:00 AM';
    const closingTime = settings?.closingTime || '08:00 PM';
    const slotInterval = settings?.slotInterval || 30;

    // Generate dynamic pool of slots strictly within salon business hours
    const slots = generateSlots(openingTime, closingTime, slotInterval);
    const availabilityList = [];
    ...
```
Also ensure that for any slot `s`, if `slotTotalMinutes + serviceDuration > closeMinutes`, it is not available or filtered out so appointments cannot exceed closing time.

- [ ] **Step 5: Run slot tests and verify API behavior**

Run: `node backend/scratch/test_dynamic_slots.js`
Expected: `SLOT GENERATOR UNIT TESTS PASSED`

Run test against local endpoint:
Create and run `backend/scratch/test_availability_live.js` to ensure `/api/appointments/availability?date=...` responds correctly with dynamic slots.

- [ ] **Step 6: Commit changes**

```bash
git add backend/utils/slotGenerator.js backend/controllers/appointmentController.js backend/scratch/test_dynamic_slots.js
git commit -m "feat(backend): dynamic slot generation based on SalonSettings"
```

---

### Task 3: Admin Dashboard Salon Timings Management UI

**Files:**
- Modify: `admin-dashboard/src/app/settings/page.tsx`
- Test: Manual verification in browser & API check

**Interfaces:**
- Consumes: `GET /api/settings/salon`, `PUT /api/settings/salon` via `admin-dashboard/src/lib/api.ts`
- Produces: Business hours settings card in `/settings`

- [ ] **Step 1: Add Salon Business Hours management card to `admin-dashboard/src/app/settings/page.tsx`**

Update `SettingsPage` in `admin-dashboard/src/app/settings/page.tsx` to:
1. Fetch current settings on mount from `/settings/salon`.
2. Provide form controls:
   - `Opening Time` dropdown (e.g. 08:00 AM to 12:00 PM).
   - `Closing Time` dropdown (e.g. 05:00 PM to 11:00 PM).
   - `Slot Interval` selector (15, 30, 45, 60 minutes).
   - `Emergency Closed Today` toggle.
3. Handle "Save Business Hours" button with loading spinner, success toast, and error display.

- [ ] **Step 2: Verify in browser subagent or curl**

Test saving changes from Admin Dashboard or sending `PUT /api/settings/salon` with updated times. Verify response `200 OK` and updated database record.

- [ ] **Step 3: Commit changes**

```bash
git add admin-dashboard/src/app/settings/page.tsx
git commit -m "feat(admin): add salon opening and closing hours management to settings"
```

---

### Task 4: Client Website "Build Your Schedule" Date Picker Cutoff & Availability

**Files:**
- Modify: `client-website/src/app/book/page.tsx:50-140, 410-488`
- Test: Verification of date rendering when salon is open vs closed

**Interfaces:**
- Consumes: `GET /api/settings/salon`, `GET /api/appointments/availability`
- Produces: Dynamically shifted 7-day schedule (Tomorrow onwards if today is closed), salon hours badge, and boundary-checked slots.

- [ ] **Step 1: Add Salon Settings fetching and closure calculation to `client-website/src/app/book/page.tsx`**

1. Add state:
```tsx
const [salonSettings, setSalonSettings] = useState<{
  openingTime: string;
  closingTime: string;
  slotInterval: number;
  closedDays: string[];
  isClosedTodayOverride: boolean;
} | null>(null);
const [isClosedToday, setIsClosedToday] = useState(false);
```
2. In `useEffect` on mount:
Fetch `GET /api/settings/salon`.
3. Compute `isClosedToday`:
Calculate current IST time (hours and minutes).
Convert `closingTime` (default `"08:00 PM"`) to minutes.
If `currentISTMinutes >= closeMinutes`, OR `isClosedTodayOverride === true`, OR today's weekday is in `closedDays`:
Set `isClosedToday(true)`.
Else:
Set `isClosedToday(false)`.

- [ ] **Step 2: Update 7-Day Date Picker in Step 3 ("Build Your Schedule")**

Update the date rendering logic:
```tsx
{/* 2. Select Date */}
<div>
  <div className="flex items-center justify-between mb-4">
    <h4 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
      <Calendar className="w-4 h-4 text-primary" />
      2. Select Date
    </h4>
    {isClosedToday && (
      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
        Salon closed for today • Booking available from tomorrow
      </span>
    )}
  </div>
  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
    {Array.from({ length: 7 }).map((_, i) => {
      const offset = isClosedToday ? i + 1 : i;
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const d = date.toLocaleDateString('en-US', { weekday: 'short' });
      const day = date.getDate();
      const fullDate = date.toISOString().split('T')[0];
      ...
```
4. Set default `selectedDate` to tomorrow if `isClosedToday` is true, otherwise today.
5. Display business hours info pill above slots:
```tsx
<div className="text-xs font-bold text-gray-500 mb-2">
  Salon Hours: {salonSettings?.openingTime || '10:00 AM'} – {salonSettings?.closingTime || '08:00 PM'}
</div>
```

- [ ] **Step 3: Verify client behavior**

Simulate current time or closing time:
- When closing time is in the past: verify date picker starts from Tomorrow.
- When closing time is in the future: verify date picker starts from Today.

- [ ] **Step 4: Commit changes**

```bash
git add client-website/src/app/book/page.tsx
git commit -m "feat(client): hide today and start schedule from tomorrow if salon is closed"
```

---

### Task 5: End-to-End System Testing & Verification

**Files:**
- Test: `backend/scratch/test_e2e_booking_cutoff.js`

- [ ] **Step 1: Write and run end-to-end integration test**

Verify:
1. `GET /api/settings/salon` returns configured hours.
2. `PUT /api/settings/salon` successfully modifies opening/closing times.
3. `GET /api/appointments/availability` respects modified hours and returns slots only between open and close times.
4. Booking creation fails if user attempts a slot outside the salon's operating window.

- [ ] **Step 2: Commit final test script and verification results**

```bash
git add backend/scratch/test_e2e_booking_cutoff.js
git commit -m "test: add e2e verification script for salon schedule cutoff"
```

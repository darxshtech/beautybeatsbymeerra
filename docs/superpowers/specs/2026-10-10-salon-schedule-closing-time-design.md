# Salon Schedule Opening & Closing Time Specification

## 1. Problem Statement
In the client website booking workflow ("Build Your Schedule", Step 3 of `/book`), the 7-day appointment date picker always starts with today (`i = 0`). If the salon has already closed for the day (or if current time is past the salon closing time), users can still select today, which leads to confusing or impossible booking states. Furthermore, salon opening and closing hours are currently hardcoded in the backend rather than dynamically configurable by the administrator.

## 2. Requirements & Goals
1. **Dynamic Salon Settings**:
   - Provide an option for the salon administrator in the Admin Dashboard (`/settings`) to configure Salon Opening Time (e.g. `10:00 AM`) and Salon Closing Time (e.g. `08:00 PM`), as well as slot intervals (default 30 mins) and closed days.
   - Store settings persistently in MongoDB.
   - Expose public endpoint `GET /api/settings/salon` for client consumption and `PUT /api/settings/salon` (admin protected) for updates.
2. **Dynamic Slot Generation in Backend**:
   - `/api/appointments/availability` dynamically generates slots strictly starting at `openingTime` and ending such that services finish before `closingTime`.
   - Slots past the current time on "today" are automatically flagged as unavailable.
3. **Smart Date Visibility in Client Website ("Build Your Schedule")**:
   - Detect if the salon has closed for today:
     - Current IST time is greater than or equal to salon `closingTime`.
     - Or the remaining time today is less than the minimum duration required for the selected services.
     - Or the salon is designated closed today.
   - When the salon is closed for today:
     - The 7-day date picker omits today and starts showing dates from **Tomorrow** (`i = 1` through `7`).
     - Default date is automatically set to Tomorrow.
     - A banner informs the user: *"Salon is currently closed for today. Available dates start from tomorrow."*
   - When the salon is still open today:
     - Today is shown and selectable (`i = 0` through `6`).
     - Slots before current time or after closing time are omitted/disabled.
4. **Time Boundaries**:
   - Clients can only book slots that begin at or after the salon opening time, and conclude at or before the salon closing time.

---

## 3. Architecture & Data Flow

```
[Admin Dashboard]
       │
       ▼ (PUT /api/settings/salon)
[Backend MongoDB (SalonSettings Model)]
       ▲
       │ (GET /api/settings/salon)
[Client Website (/book)]
       │
       ▼ (If current time >= closingTime -> Shift dates to Tomorrow)
       ▼ (Fetch /api/appointments/availability?date=... strictly within [open, close])
[Booking Confirmation]
```

---

## 4. Detailed Component Specifications

### 4.1 Backend (Node.js / Express / Mongoose)

#### 4.1.1 Model: `backend/models/SalonSettings.js`
- `branch`: String (`'SALON' | 'CLINIC'`), default `'SALON'`
- `openingTime`: String (e.g., `'10:00 AM'`), default `'10:00 AM'`
- `closingTime`: String (e.g., `'08:00 PM'`), default `'08:00 PM'`
- `slotInterval`: Number (minutes, e.g. `30`), default `30`
- `closedDays`: Array of String (e.g. `['Monday']`), default `[]`
- `isClosedTodayOverride`: Boolean, default `false`
- `updatedAt`: Date, default `Date.now`

#### 4.1.2 Controller & Routes: `backend/routes/settings.js` & `backend/controllers/settingsController.js`
- `GET /api/settings/salon`:
  - Returns `SalonSettings` for `branch = 'SALON'`. If none exists, creates and returns defaults (`10:00 AM` to `08:00 PM`).
  - Response: `{ success: true, data: { openingTime, closingTime, slotInterval, closedDays, isClosedTodayOverride } }`
- `PUT /api/settings/salon`:
  - Protected with `auth` and `authorize(['ADMIN'])` middleware.
  - Validates time formats and ensures `openingTime` is earlier than `closingTime`.
  - Updates and returns updated `SalonSettings`.

#### 4.1.3 Appointment Controller: `backend/controllers/appointmentController.js`
- Update `getAvailability`:
  - Query `SalonSettings` for `SALON` branch.
  - Dynamically generate slots using a helper function:
    ```js
    const generateSlots = (openTime, closeTime, intervalMinutes = 30) => { ... }
    ```
  - Generate slots from opening time up to `closeTime - serviceDuration`.
  - Filter out past slots when `isToday` is true (using IST timezone calculation).

---

### 4.2 Client Website (`client-website/src/app/book/page.tsx`)

1. **State**:
   - `salonSettings`: `{ openingTime: string, closingTime: string, isClosedTodayOverride: boolean, closedDays: string[] } | null`
   - `loadingSettings`: boolean
2. **Computation**:
   - Helper `isSalonClosedToday(settings, serviceDuration)`:
     - Converts current IST time to minutes from midnight.
     - Converts `closingTime` to minutes from midnight.
     - Checks if `currentMinutes + serviceDuration >= closeMinutes` or if `isClosedTodayOverride` is true or if day of week is in `closedDays`.
3. **Date Selection**:
   - If `isSalonClosedToday`:
     - Range generated: `Array.from({ length: 7 }).map((_, i) => dateOffset = i + 1)` (Tomorrow through Day 7).
     - Initial `selectedDate` defaults to Tomorrow's ISO date string `YYYY-MM-DD`.
     - Displays helper badge: *"Salon is closed for today. Appointments start tomorrow."*
   - Else:
     - Range generated: `Array.from({ length: 7 }).map((_, i) => dateOffset = i)` (Today through Day 6).
     - Initial `selectedDate` defaults to Today's ISO date string `YYYY-MM-DD`.
4. **Time Slot Display**:
   - Displays salon business hours pill: `Salon Hours: {openingTime} – {closingTime}`.
   - Shows dynamically retrieved available slots from `/api/appointments/availability`.

---

### 4.3 Admin Dashboard (`admin-dashboard/src/app/settings/page.tsx`)

1. **Salon Timings Configuration Card**:
   - Fields:
     - Opening Time (select dropdown or time picker with AM/PM options, e.g. 08:00 AM - 12:00 PM)
     - Closing Time (select dropdown or time picker with AM/PM options, e.g. 05:00 PM - 11:00 PM)
     - Slot Duration (15 min, 30 min, 45 min, 60 min)
     - Emergency "Closed Today" switch toggle
   - Action: "Save Business Hours" button with loading and success toast.
   - On load, fetches from `GET /api/settings/salon` and pre-populates fields.
   - On save, sends `PUT /api/settings/salon` with updated configuration.

---

## 5. Security & Validation
- **Authentication**: `PUT /api/settings/salon` requires valid admin JWT token.
- **Input Validation**: Time strings must match standard time formats (`HH:MM AM/PM` or `HH:mm`).
- **Logical Validation**: `openingTime` must be strictly earlier than `closingTime`.
- **Integrity**: Appointment creation endpoint verifies that booked `timeSlot` is within the configured `openingTime` and `closingTime`.

---

## 6. Verification Plan
1. **Admin Settings Update**: Change opening time to `11:00 AM` and closing time to `07:00 PM` in admin dashboard and verify database update.
2. **Backend Availability**: Verify `/api/appointments/availability` returns slots starting at `11:00 AM` and ending by `07:00 PM`.
3. **Client Booking Today vs Tomorrow**:
   - Test when current time is earlier than closing time: Today is displayed as the first selectable date.
   - Test when current time is at or after closing time (or simulated): Today is omitted, the date picker starts from Tomorrow, and Tomorrow is pre-selected.
4. **End-to-End Booking**: Complete an appointment booking from the client website and verify it saves correctly with the valid slot and date.

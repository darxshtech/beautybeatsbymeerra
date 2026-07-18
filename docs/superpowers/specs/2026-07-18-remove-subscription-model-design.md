# Specification: Remove Subscription Model

This specification details the complete removal of the subscription model from the BeautyBeats codebase, including the frontend websites, admin dashboard, and backend server.

## Proposed Changes

### Backend

#### [DELETE] [SubscriptionPlan.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/models/SubscriptionPlan.js)
Completely remove the Mongoose model schema for subscription plans.

#### [DELETE] [subscriptionController.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/controllers/subscriptionController.js)
Delete the CRUD controller for subscription plans.

#### [DELETE] [subscriptions.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/routes/subscriptions.js)
Delete the API routing configuration for subscription plans.

#### [MODIFY] [server.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/server.js)
Remove the subscription route registration:
```javascript
app.use('/api/subscriptions', require('./routes/subscriptions'));
```

#### [MODIFY] [User.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/models/User.js)
Remove the `subscription` fields from the `UserSchema` object.

#### [MODIFY] [customerValidator.js](file:///d:/code%20mode/freelancing/beauty-beats/backend/validators/user/customerValidator.js)
Remove Joi validation schemas for the `subscription` field in both `create` and `update` methods.

---

### Admin Dashboard

#### [DELETE] [page.tsx](file:///d:/code%20mode/freelancing/beauty-beats/admin-dashboard/src/app/subscriptions/page.tsx)
Delete the dashboard page used for managing subscription plans.

#### [MODIFY] [Sidebar.tsx](file:///d:/code%20mode/freelancing/beauty-beats/admin-dashboard/src/components/Sidebar.tsx)
Remove the "Subscriptions" navigation item.

#### [MODIFY] [page.tsx](file:///d:/code%20mode/freelancing/beauty-beats/admin-dashboard/src/app/customers/page.tsx)
* Remove `subscriptionPlan` and `subscriptionStatus` from `formData` state.
* Remove form input fields for subscription plans.
* Remove the subscription columns and data display from the table.

---

### Client Website

#### [DELETE] [page.tsx](file:///d:/code%20mode/freelancing/beauty-beats/client-website/src/app/subscriptions/page.tsx)
Delete the page that shows subscription plans.

#### [MODIFY] [Navbar.tsx](file:///d:/code%20mode/freelancing/beauty-beats/client-website/src/components/Navbar.tsx)
Remove the "Subscriptions" option from desktop and mobile nav arrays.

---

### Clinic Website

#### [DELETE] [page.tsx](file:///d:/code%20mode/freelancing/beauty-beats/clinic-website/src/app/subscriptions/page.tsx)
Delete the page that shows subscription plans.

#### [MODIFY] [Navbar.tsx](file:///d:/code%20mode/freelancing/beauty-beats/clinic-website/src/components/Navbar.tsx)
Remove the "Subscriptions" option from desktop and mobile nav arrays.

---

## Verification Plan

### Automated Build Verification
* Run frontend/admin builds to verify zero compilation/TypeScript errors:
  * `npm run build` in `admin-dashboard`
  * `npm run build` in `client-website`
  * `npm run build` in `clinic-website`
* Run backend integration tests or verify server starts correctly without errors.

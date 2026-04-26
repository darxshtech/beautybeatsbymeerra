const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased for digital signature base64 data
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.send('Salon & Clinic Management API is running...');
});

// Define Routes
console.log('Registering Google Auth routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Registering User routes...');
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/message-templates', require('./routes/messageTemplates'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/consent-forms', require('./routes/consentForms'));
app.use('/api/admin-notifications', require('./routes/adminNotifications'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

// Seed default message templates on startup
const MessageTemplate = require('./models/MessageTemplate');
MessageTemplate.seedDefaults().catch(err => console.error('Template seed error:', err));

// Start automatic notification scheduler (daily 9 AM IST)
const NotificationScheduler = require('./services/notification/NotificationScheduler');
NotificationScheduler.start();

// Start automatic backup scheduler (weekly)
const BackupScheduler = require('./services/backup/BackupScheduler');
BackupScheduler.start();

// Start KeepAwake service
const KeepAwakeService = require('./services/server/KeepAwakeService');
KeepAwakeService.start();

// Catch-all for 404s
app.use((req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  next(err);
});

const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

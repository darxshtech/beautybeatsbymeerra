const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  createCustomer,
  getCustomerById, 
  updateUserProfile,
  deleteUser,
  getPersonnel,
  createPersonnel
} = require('../controllers/userController');
const { getMe } = require('../controllers/authController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const customerValidator = require('../validators/user/customerValidator');

// Staff/Personnel routes (Put these first to avoid capture by /:id)
router.get('/staff', (req, res, next) => {
  console.log('GET /staff called');
  next();
}, getPersonnel);
router.post('/staff', protect, authorize('ADMIN'), createPersonnel);

// Customer routes
router.get('/customers', protect, authorize('ADMIN', 'STAFF'), getCustomers);
router.post('/customers', protect, authorize('ADMIN', 'STAFF'), validate(customerValidator.create), createCustomer);
router.get('/customers/:id', protect, authorize('ADMIN', 'STAFF'), getCustomerById);
router.put('/customers/:id', protect, validate(customerValidator.update), updateUserProfile);

// User profile routes (Self)
router.get('/profile', protect, getMe);
router.put('/profile', protect, validate(customerValidator.update), updateUserProfile);

// Generic user routes
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;

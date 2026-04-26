const express = require('express');
const router = express.Router();
const { 
  createConsentForm, 
  getByAppointment, 
  getAllConsentForms 
} = require('../controllers/consentFormController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('STAFF', 'ADMIN'), createConsentForm);
router.get('/appointment/:appointmentId', protect, authorize('STAFF', 'ADMIN'), getByAppointment);
router.get('/', protect, authorize('ADMIN'), getAllConsentForms);

module.exports = router;

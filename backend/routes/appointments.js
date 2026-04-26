const express = require('express');
const router = express.Router();
const { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  getAvailability,
  getStaffAppointments,
  finishService
} = require('../controllers/appointmentController');
const { protect, authorize, optionalProtect } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const appointmentValidator = require('../validators/appointment/appointmentValidator');

router.get('/availability', optionalProtect, getAvailability);
router.get('/my-customers', protect, authorize('STAFF', 'ADMIN'), getStaffAppointments);
router.get('/', protect, authorize('ADMIN', 'STAFF', 'CUSTOMER'), getAppointments);
router.get('/:id', protect, authorize('ADMIN', 'STAFF'), getAppointmentById);
router.post('/', optionalProtect, validate(appointmentValidator.create), createAppointment);
router.put('/:id', protect, authorize('ADMIN', 'STAFF', 'CUSTOMER'), validate(appointmentValidator.update), updateAppointment);
router.post('/:id/finish', protect, authorize('STAFF', 'ADMIN'), finishService);
router.delete('/:id', protect, authorize('ADMIN'), deleteAppointment);

module.exports = router;


const express = require('express');
const router = express.Router();
const { 
  getServices, 
  createService, 
  createPackage,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const serviceValidator = require('../validators/service/serviceValidator');

router.get('/', getServices);
router.post('/', protect, authorize('ADMIN'), validate(serviceValidator.create), createService);
router.post('/package', protect, authorize('ADMIN'), validate(serviceValidator.createPackage), createPackage);
router.put('/:id', protect, authorize('ADMIN'), updateService);
router.delete('/:id', protect, authorize('ADMIN'), deleteService);

module.exports = router;

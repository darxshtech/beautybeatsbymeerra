const express = require('express');
const router = express.Router();
const { 
  getServices, 
  createService, 
  createPackage 
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const serviceValidator = require('../validators/service/serviceValidator');

router.get('/', getServices);
router.post('/', protect, authorize('ADMIN'), validate(serviceValidator.create), createService);
router.post('/package', protect, authorize('ADMIN'), validate(serviceValidator.createPackage), createPackage);

module.exports = router;

module.exports = router;

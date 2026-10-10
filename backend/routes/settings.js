const express = require('express');
const router = express.Router();
const { getSalonSettings, updateSalonSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/salon', getSalonSettings);
router.put('/salon', protect, authorize('ADMIN'), updateSalonSettings);

module.exports = router;

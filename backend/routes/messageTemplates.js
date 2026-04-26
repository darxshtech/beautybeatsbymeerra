const express = require('express');
const router = express.Router();
const { getTemplates, updateTemplate } = require('../controllers/messageTemplateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN'), getTemplates);
router.put('/:key', protect, authorize('ADMIN'), updateTemplate);

module.exports = router;

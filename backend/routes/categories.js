const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/', protect, authorize('ADMIN'), createCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

module.exports = router;

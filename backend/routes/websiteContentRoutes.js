const express = require('express');
const {
  getContent,
  createContent,
  updateContent,
  deleteContent
} = require('../controllers/websiteContentController');

const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
  .get(getContent)
  .post(protect, authorize('ADMIN'), upload.single('image'), createContent);

router.route('/:id')
  .put(protect, authorize('ADMIN'), upload.single('image'), updateContent)
  .delete(protect, authorize('ADMIN'), deleteContent);

module.exports = router;

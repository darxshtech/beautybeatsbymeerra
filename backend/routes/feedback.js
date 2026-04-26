const express = require('express');
const router = express.Router();
const { 
  getFeedback, 
  getPublicFeedback, 
  addFeedback, 
  approveFeedback, 
  rejectFeedback 
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Public route - must be BEFORE protected routes
router.get('/public', getPublicFeedback);

// Protected routes
router.get('/', protect, authorize('ADMIN', 'STAFF'), getFeedback);
router.post('/', addFeedback); // Public - customers submit via review link
router.put('/:id/approve', protect, authorize('ADMIN'), approveFeedback);
router.put('/:id/reject', protect, authorize('ADMIN'), rejectFeedback);

module.exports = router;

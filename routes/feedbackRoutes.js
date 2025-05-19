const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

// Unified feedback submission
router.post('/:targetType/:targetId', 
  authMiddleware.authenticate,
  feedbackController.submitFeedback
);

// Get questions with eligibility check
router.get('/questions/:targetType/:targetId',
  authMiddleware.authenticate,
  feedbackController.getFeedbackQuestions
);

// Separate eligibility check endpoint
router.get('/check/:targetType/:targetId',
  authMiddleware.authenticate,
  feedbackController.checkFeedbackEligibility
);

module.exports = router;
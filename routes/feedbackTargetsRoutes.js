const express = require('express');
const router = express.Router();
const { getFeedbackTargets } = require('../controllers/feedbackTargetsController');

router.get('/feedback-targets', getFeedbackTargets);

module.exports = router;
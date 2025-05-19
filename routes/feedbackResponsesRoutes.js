// routes/feedbackResponses.js
const express = require('express');
const router = express.Router();
const { saveResponse } = require('../controllers/feedbackResponsesController');

// POST route to save feedback response
router.post('/save-response', saveResponse);

module.exports = router;

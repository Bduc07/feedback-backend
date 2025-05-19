// authRoutes.js
const express = require('express');
const router = express.Router();
const { login, enroll } = require('../controllers/authController');

// Define your routes
router.post('/login', login);
router.post('/enroll', enroll);

module.exports = router;

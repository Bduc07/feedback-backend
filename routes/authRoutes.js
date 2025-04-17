const express = require('express');
const { login } = require('../controllers/authController'); // Import the login function

const router = express.Router(); // Create a new router instance

// Define the login route
router.post('/login', login);

// Export the router
module.exports = router;

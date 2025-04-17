const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware.js'); // Fixed path with .js extension

// Admin-only routes
router.get('/stats', verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, userController.getStats);

// User profile (protected)
router.get('/profile', verifyToken, userController.getProfile);

// Registration (public)
router.post('/register', userController.register);

// Update user (protected)
router.put('/update', verifyToken, userController.updateUser);

// Delete user (protected)
router.delete('/delete', verifyToken, userController.deleteUser);

// Get all users (admin-only)
router.get('/all', verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, userController.getAllUsers);

module.exports = router;
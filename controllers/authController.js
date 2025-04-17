const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { comparePassword } = require('../utils/haspassword');

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('User found in authController:', users); // Debug: check user data
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const passwordMatch = await comparePassword(password, user.password);
    console.log('Password match:', passwordMatch); // Debug: check if passwords match
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    
    // Map the role to match frontend expectations
    let userRole = user.role;
    if (!userRole || userRole === 'student') {
      userRole = 'std'; // Map "student" or NULL to "std"
    }
    // Ensure role is either "std" or "admin"
    if (userRole !== 'std' && userRole !== 'admin') {
      console.log('Invalid role detected:', userRole);
      return res.status(403).json({ message: 'Invalid role' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: userRole },
      process.env.JWT_SECRET || 'mySuperSecretKey123!@#',
      { expiresIn: '1h' }
    );
    console.log('Token generated:', token); // Debug: check if token is generated

    res.json({ token, role: userRole, name: user.name, message: 'Login successful' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { login };
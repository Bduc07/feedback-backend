const bcrypt = require('bcrypt'); // bcrypt for password hashing
const pool = require('../config/db'); // MySQL connection pool

// Login function
async function login(req, res) {
  const { email, password } = req.body;
  try {
    // Fetch user details from the database
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    // Check if user exists
    if (user.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check the domain based on role
    const isValidDomain = user[0].role === 'student'
      ? email.endsWith('@monumental.com')  // Student emails must end with @monumental.com
      : email.endsWith('@university.com');  // Admin emails must end with @university.com

    if (!isValidDomain) {
      return res.status(400).json({
        message: user[0].role === 'student'
          ? 'Only monumental.com emails are allowed for students'
          : 'Only university.com emails are allowed for admins',
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Successful login, return user details
    res.json({
      name: user[0].name,
      role: user[0].role,  // role can be 'student' or 'admin'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
}

// Enroll function
async function enroll(req, res) {
  const { email, password, name, phone_number, gender, role } = req.body;
  try {
    // Check the domain based on role
    const isValidDomain = role === 'student'
      ? email.endsWith('@monumental.com')  // Student emails must end with @monumental.com
      : email.endsWith('@university.com');  // Admin emails must end with @university.com

    if (!isValidDomain) {
      return res.status(400).json({
        message: role === 'student'
          ? 'Only monumental.com emails are allowed for students'
          : 'Only university.com emails are allowed for admins',
      });
    }

    // Hash password and insert new user into database
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, name, phone_number, gender, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone_number, gender, role]
    );
    res.status(201).json({ message: 'User enrolled successfully' });
  } catch (err) {
    console.error('Error enrolling user:', err);
    res.status(500).json({ message: 'Error enrolling user' });
  }
}

module.exports = { login, enroll };

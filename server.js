require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./config/db');

// Import route files
const statsRoutes = require('./routes/stats');

// Initialize app
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api', statsRoutes); // This enables /api/stats

// ✅ Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Login failed' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Login failed' });
    }

    // Normalize role
    const normalizedRole = user.role === 'std' ? 'student' : user.role;

    res.json({
      token: 'fake-jwt-token',
      name: user.name,
      role: normalizedRole,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Register Route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Register attempt:', name, email);

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'std'] // Default to student
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ✅ Feedback Questions
app.get('/api/feedback-questions', async (req, res) => {
  try {
    const [questions] = await db.query('SELECT * FROM feedback_questions');
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No feedback questions found' });
    }
    res.json(questions);
  } catch (err) {
    console.error('Error fetching feedback questions:', err);
    res.status(500).json({ message: 'Error fetching feedback questions' });
  }
});

// ✅ Submit Feedback
app.post('/api/submit-feedback', async (req, res) => {
  const feedback = req.body;

  if (!feedback || Object.keys(feedback).length === 0) {
    return res.status(400).json({ message: 'No feedback provided' });
  }

  try {
    const feedbackEntries = Object.entries(feedback);
    for (const [questionId, rating] of feedbackEntries) {
      await db.query(
        'INSERT INTO feedback_responses (question_id, rating) VALUES (?, ?)',
        [questionId, rating]
      );
    }
    res.status(200).json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// ✅ Test DB Connection
(async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();

// Start Server
const PORT = process.env.PORT || 3037;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
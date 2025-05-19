// In server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const feedbackTeacherRoutes = require('./routes/feedbackTeacherRoutes');
const coursesRoutes = require('./routes/coursesRoutes');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feedbackTargetsRoutes = require('./routes/feedbackTargetsRoutes');
const feedbackResponsesRoutes = require('./routes/feedbackResponsesRoutes'); 

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', statsRoutes);
app.use('/api', feedbackTeacherRoutes);
app.use('/api', coursesRoutes);
app.use('/api', feedbackTargetsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/feedbackResponses', feedbackResponsesRoutes); 

// Remove or comment out /api/teachers endpoints since teachers table doesn't exist
/*
app.get('/api/teachers', async (req, res) => {
  try {
    const [teachers] = await pool.query('SELECT id, name, subject FROM teachers');
    res.json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
});

app.get('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [teachers] = await pool.query('SELECT id, name, subject FROM teachers WHERE id = ?', [id]);
    if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teachers[0]);
  } catch (err) {
    console.error('Error fetching teacher:', err);
    res.status(500).json({ message: 'Error fetching teacher' });
  }
});
*/

// Remove or comment out /api/courses endpoints since courses table doesn't exist
/*
app.get('/api/courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT id, name, description FROM courses');
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [courses] = await pool.query('SELECT id, name, description FROM courses WHERE id = ?', [id]);
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found' });
    res.json(courses[0]);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ message: 'Error fetching course' });
  }
});
*/

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone_number } = req.body;

  if (!name || !email || !phone_number) {
    return res.status(400).json({ error: 'All fields must be filled' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE students SET name = ?, email = ?, phone_number = ? WHERE id = ?',
      [name, email, phone_number, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'An error occurred while updating the student.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user[0].id, name: user[0].name, role: user[0].role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      name: user[0].name,
      role: user[0].role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/api/feedback-questions', async (req, res) => {
  const { target_type, target_id } = req.query;
  let query = 'SELECT * FROM feedback_questions';
  const params = [];

  if (target_type) {
    query += ' WHERE target_type = ?';
    params.push(target_type);
    if (target_id) {
      query += ' AND (target_id = ? OR target_id IS NULL)';
      params.push(target_id);
    }
  }

  try {
    console.log('Executing query:', query, 'with params:', params);
    const [questions] = await pool.query(query, params);
    console.log('Questions fetched:', questions);
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No feedback questions found' });
    }
    res.json(questions);
  } catch (err) {
    console.error('Error fetching feedback questions:', err);
    res.status(500).json({ message: 'Error fetching feedback questions' });
  }
});
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone_number, studentId, bio } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, password, phone_number, studentId, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone_number, studentId, bio]
    );

    const userId = result.insertId; // ✅ get the auto-generated ID

    res.status(201).json({
      message: 'User registered successfully',
      userId, // ✅ return it
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/feedback-questions', async (req, res) => {
  const { target_type, target_id, question_text } = req.body;

  if (!target_type || !question_text) {
    return res.status(400).json({ error: 'target_type and question_text are required' });
  }

  const finalTargetId = target_id || null;

  try {
    const result = await pool.query(
      'INSERT INTO feedback_questions (target_type, target_id, question_text, created_at, updated_at) VALUES (?, NULL, ?, NOW(), NOW())',
      [target_type, question_text]
    );

    res.status(201).json({
      message: 'Question added successfully',
      question_id: result.insertId,
    });
  } catch (err) {
    console.error('Error adding feedback question:', err);
    res.status(500).json({ error: 'Failed to add question', details: err.message });
  }
});

app.post('/api/submit-feedback', async (req, res) => {
  const { submitter_identifier, target_type, target_id, responses, is_anonymous = 0 } = req.body;

  if (!submitter_identifier || !target_type || !target_id || !responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    for (const response of responses) {
      const { question_id, response_value } = response;
      if (!question_id || !response_value) {
        continue;
      }
      
      const teacher_id = target_type === 'teacher' ? String(target_id) : null;
      const course_id = target_type === 'course' ? String(target_id) : null;
      
      await pool.query(
        `INSERT INTO feedback_responses 
        (submitter_identifier, question_id, response_value, teacher_id, course_id, is_anonymous) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [submitter_identifier, question_id, response_value, teacher_id, course_id, is_anonymous]
      );
    }
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
  }
});

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();

const PORT = process.env.PORT || 3037;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
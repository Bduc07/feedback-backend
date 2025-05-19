// In routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [teachers] = await pool.query('SELECT id, name, course FROM users WHERE role = "teacher"');
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    res.json({
      students: students[0].count,
      teachers: teachers.length,
      admins: admins[0].count,
      teacherList: teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        course: teacher.course || 'No course assigned', // Handle null courses
      })),
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
});

module.exports = router;
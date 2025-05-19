const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Fetch all students (from the users table where role = 'student')
router.get('/', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM users WHERE role = "student"');

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.json(students); // Send the student data to frontend
  } catch (err) {
    console.error('🔥 Error fetching students:', err);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Fetch a single student by ID (from users table)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [student] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "student"', [id]);

    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student[0]); // Send the student details to frontend
  } catch (err) {
    console.error('🔥 Error fetching student by ID:', err);
    res.status(500).json({ message: 'Error fetching student' });
  }
});

// Route for updating student details (e.g., email, phone_number)
router.put('/:id', async (req, res) => {
  const { id } = req.params; // Get the student ID from the URL
  const { name, email, phone_number } = req.body; // Get the updated data from the request body

  // Validate input
  if (!name || !email || !phone_number) {
    return res.status(400).json({ error: "All fields must be filled" });
  }

  try {
    // Update student details in the database
    const result = await pool.query(
      'UPDATE users SET name = ?, email = ?, phone_number = ? WHERE id = ? AND role = "student"',
      [name, email, phone_number, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student details updated successfully' });
  } catch (err) {
    console.error('Error updating student details:', err);
    res.status(500).json({ message: 'Error updating student details' });
  }
});

// Route for deleting a student
router.delete('/:id', async (req, res) => {
  const { id } = req.params; // Get the student ID from the URL

  try {
    const result = await pool.query('DELETE FROM users WHERE id = ? AND role = "student"', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

module.exports = router;

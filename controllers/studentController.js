const pool = require('../config/db');

// Edit student details
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'All fields (name, email, phone) are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ? AND role = "student"',
      [name, email, phone, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student details updated successfully' });
  } catch (err) {
    console.error('🔥 Error updating student details:', err);
    res.status(500).json({ message: 'Error updating student details' });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = ? AND role = "student"', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('🔥 Error deleting student:', err);
    res.status(500).json({ message: 'Error deleting student' });
  }
};

module.exports = {
  updateStudent,
  deleteStudent,
};

const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    // Fetch counts from MySQL
    const [students] = await pool.query('SELECT COUNT(*) AS count FROM students');
    const [teachers] = await pool.query('SELECT COUNT(*) AS count FROM teachers');
    const [admins] = await pool.query('SELECT COUNT(*) AS count FROM admins');

    res.json({
      students: students[0].count,
      teachers: teachers[0].count,
      admins: admins[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
};
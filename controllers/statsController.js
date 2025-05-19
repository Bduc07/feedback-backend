const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [students] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const [teachers] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'teacher'");
    const [admins] = await db.query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");

    console.log('Stats:', {
      students: students[0].count,
      teachers: teachers[0].count,
      admins: admins[0].count,
    });

    res.json({
      students: students[0].count,
      teachers: teachers[0].count,
      admins: admins[0].count
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

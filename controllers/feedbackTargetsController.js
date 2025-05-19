const pool = require('../config/db');

// Get all feedback targets
exports.getFeedbackTargets = async (req, res) => {
  try {
    const [targets] = await pool.query('SELECT * FROM feedback_targets');
    res.json(targets);
  } catch (err) {
    console.error('Error fetching feedback targets:', err);
    res.status(500).json({ error: 'Failed to fetch feedback targets' });
  }
};
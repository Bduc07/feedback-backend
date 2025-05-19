const pool = require('../config/db');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  const { student_id, target_type, target_id, responses, is_anonymous = 0 } = req.body;
  if (!student_id || !target_type || !target_id || !responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    // Insert each response into feedback_responses
    for (const response of responses) {
      const { question_id, response_value } = response;
      if (!question_id || !response_value) {
        continue; // Skip invalid responses
      }
      const teacher_id = target_type === 'teacher' ? target_id : null;
      const course_id = target_type === 'course' ? target_id : null;
      await pool.query(
        'INSERT INTO feedback_responses (user_id, question_id, response_value, teacher_id, course_id, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)',
        [student_id, question_id, response_value, teacher_id, course_id, is_anonymous]
      );
    }
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback', details: err.message });
  }
};
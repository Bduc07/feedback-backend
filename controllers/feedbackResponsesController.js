const db = require('../config/db'); // Import the MySQL pool connection

const saveResponse = async (req, res) => {
  const { student_id, target_type, target_id, question_id, response_value, is_anonymous, course_id, teacher_id } = req.body;

  if (!student_id || !target_type || !target_id || !question_id || !response_value) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (target_type === 'course' && !course_id) {
    return res.status(400).json({ error: 'Course ID is required for course feedback.' });
  }
  if (target_type === 'teacher' && !teacher_id) {
    return res.status(400).json({ error: 'Teacher ID is required for teacher feedback.' });
  }

  try {
    // Choose target ID column based on type
    const targetColumn = target_type === 'course' ? 'course_id' : 'teacher_id';
    const targetValue = target_type === 'course' ? course_id : teacher_id;

    // 1. Check for most recent feedback from this student for this target
    const [recent] = await db.execute(
      `SELECT created_at FROM feedback_responses 
       WHERE student_id = ? AND ${targetColumn} = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [student_id, targetValue]
    );

    if (recent.length > 0) {
      const lastFeedbackTime = new Date(recent[0].created_at);
      const now = new Date();
      const sevenDaysLater = new Date(lastFeedbackTime.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (now < sevenDaysLater) {
        return res.status(403).json({
          error: `You can submit feedback again on ${sevenDaysLater.toDateString()}`
        });
      }
    }

    // 2. Save new feedback
    const [rows] = await db.execute(
      'INSERT INTO feedback_responses (student_id, target_type, target_id, question_id, response_value, is_anonymous, course_id, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, target_type, target_id, question_id, response_value, is_anonymous || false, course_id || null, teacher_id || null]
    );

    return res.status(200).json({
      message: 'Feedback saved successfully!',
      feedback: { student_id, target_type, target_id, question_id, response_value, is_anonymous: is_anonymous || false, course_id, teacher_id },
    });

  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ error: 'Failed to save feedback. Please try again.' });
  }
};

module.exports = { saveResponse };

// In controllers/feedbackTeacherController.js
const pool = require('../config/db');

// Add a new feedback teacher question
exports.addQuestion = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  try {
    console.log('Attempting to insert question:', question);
    const [result] = await pool.query(
      'INSERT INTO feedback_questions (question_text, target_type) VALUES (?, "teacher")',
      [question]
    );
    console.log('Insert result:', result);
    res.status(201).json({ message: 'Question added successfully', insertId: result.insertId });
  } catch (err) {
    console.error('Error adding teacher question:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Failed to add question', details: err.message });
  }
};

// Get all feedback teacher questions
exports.getQuestions = async (req, res) => {
  try {
    const [questions] = await pool.query('SELECT * FROM feedback_questions WHERE target_type = "teacher"');
    const formattedQuestions = questions.map((q) => ({
      ...q,
      id: q.question_id,
      question: q.question_text,
    }));
    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching teacher questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Edit a feedback teacher question
exports.editQuestion = async (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE feedback_questions SET question_text = ? WHERE question_id = ? AND target_type = "teacher"',
      [question, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    console.error('Error editing teacher question:', err);
    res.status(500).json({ error: 'Failed to edit question' });
  }
};

// Delete a feedback teacher question
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM feedback_questions WHERE question_id = ? AND target_type = "teacher"',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Get feedback responses for a specific teacher
exports.getFeedbackForTeacher = async (req, res) => {
  const { teacherId } = req.params;

  try {
    // Fetch feedback responses for the teacher, joining with feedback_questions
    const [feedbackResponses] = await pool.query(
      `SELECT fr.submitter_identifier, fr.question_id, fr.response_value, fr.created_at, fr.is_anonymous, fq.question_text
       FROM feedback_responses fr
       JOIN feedback_questions fq ON fr.question_id = fq.question_id
       WHERE fr.teacher_id = ?`,
      [teacherId]
    );

    if (feedbackResponses.length === 0) {
      return res.status(404).json({ message: 'No feedback found for this teacher' });
    }

    // Group responses by submission (submitter_identifier + created_at)
    const groupedFeedback = feedbackResponses.reduce((acc, response) => {
      const key = `${response.submitter_identifier}-${response.created_at}`;
      if (!acc[key]) {
        acc[key] = {
          studentId: response.submitter_identifier,
          createdAt: response.created_at,
          responses: [],
          isAnonymous: response.is_anonymous,
        };
      }
      acc[key].responses.push({
        question: response.question_text,
        answer: response.response_value,
      });
      return acc;
    }, {});

    // Convert grouped feedback to an array
    const feedbackData = Object.values(groupedFeedback);

    res.status(200).json(feedbackData);
  } catch (err) {
    console.error('Error fetching teacher feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback', details: err.message });
  }
};
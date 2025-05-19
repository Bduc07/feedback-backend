const pool = require('../config/db');

exports.getCourses = async (req, res) => {
  try {
    const [questions] = await pool.query('SELECT * FROM feedback_questions WHERE target_type = "course"');
    const formattedQuestions = questions.map((q) => ({
      ...q,
      id: q.question_id, // Map question_id to id
      question: q.question_text, // Map question_text to question
    }));
    res.json(formattedQuestions);
  } catch (err) {
    console.error('Error fetching course questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Add a new course feedback question
exports.addCourse = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }
  try {
    console.log('Attempting to insert course question:', question);
    const [result] = await pool.query(
      'INSERT INTO feedback_questions (question_text, target_type) VALUES (?, "course")',
      [question]
    );
    console.log('Insert result:', result);
    res.status(201).json({ message: 'Question added successfully', insertId: result.insertId });
  } catch (err) {
    console.error('Error adding course question:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Failed to add question', details: err.message });
  }
};

// Edit a course feedback question
exports.editCourse = async (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE feedback_questions SET question_text = ? WHERE question_id = ? AND target_type = "course"',
      [question, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    console.error('Error editing course question:', err);
    res.status(500).json({ error: 'Failed to edit question' });
  }
};

// Delete a course feedback question
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM feedback_questions WHERE question_id = ? AND target_type = "course"',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting course question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};
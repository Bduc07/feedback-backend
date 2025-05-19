const pool = require('../config/db');

// Helper function to check existing feedback
const checkWeeklyFeedback = async (userId, targetType, targetId) => {
  const [existing] = await pool.query(
    `SELECT COUNT(*) as count FROM feedback_responses 
     WHERE user_id = ? 
     AND ${targetType}_id = ? 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [userId, targetId]
  );
  return existing[0].count > 0;
};

exports.submitFeedback = async (req, res) => {
  const { targetType, targetId } = req.params;
  const { responses } = req.body;
  const userId = req.user.id;

  try {
    // 1. Check for existing feedback this week
    const hasSubmitted = await checkWeeklyFeedback(userId, targetType, targetId);
    if (hasSubmitted) {
      return res.status(409).json({ 
        success: false,
        message: `You've already submitted feedback for this ${targetType} this week`
      });
    }

    // 2. Verify target exists
    const [target] = await pool.query(
      'SELECT id FROM feedback_targets WHERE id = ? AND type = ?',
      [targetId, targetType]
    );
    
    if (target.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Feedback target not found'
      });
    }

    // 3. Save each response
    for (const response of responses) {
      await pool.query(
        `INSERT INTO feedback_responses 
        (user_id, question_id, response_value, ${targetType}_id, created_at)
        VALUES (?, ?, ?, ?, NOW())`,
        [userId, response.questionId, response.value, targetId]
      );
    }

    res.json({ 
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

exports.getFeedbackQuestions = async (req, res) => {
  const { targetType, targetId } = req.params;
  
  try {
    // 1. Check if user already submitted feedback this week
    const hasSubmitted = await checkWeeklyFeedback(req.user.id, targetType, targetId);
    if (hasSubmitted) {
      return res.json({
        success: true,
        alreadySubmitted: true,
        message: `You've already submitted feedback for this ${targetType} this week`
      });
    }

    // 2. Get questions
    const [questions] = await pool.query(
      `SELECT id, question_text 
       FROM feedback_questions 
       WHERE target_type = ?`,
      [targetType]
    );

    res.json({
      success: true,
      questions,
      alreadySubmitted: false
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load questions'
    });
  }
};

exports.checkFeedbackEligibility = async (req, res) => {
  const { targetType, targetId } = req.params;
  const userId = req.user.id;

  try {
    const hasSubmitted = await checkWeeklyFeedback(userId, targetType, targetId);
    res.json({
      success: true,
      canSubmit: !hasSubmitted,
      message: hasSubmitted 
        ? `You've already submitted feedback for this ${targetType} this week`
        : 'You can submit feedback'
    });
  } catch (error) {
    console.error('Error checking feedback eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking feedback eligibility'
    });
  }
};
// In routes/feedbackTeacherRoutes.js
const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion, editQuestion, deleteQuestion, getFeedbackForTeacher } = require('../controllers/feedbackTeacherController');

router.get('/feedback-teacher', getQuestions);
router.post('/feedback-teacher', addQuestion);
router.put('/feedback-teacher/:id', editQuestion);
router.delete('/feedback-teacher/:id', deleteQuestion);
router.get('/feedback/teacher/:teacherId', getFeedbackForTeacher);

module.exports = router;
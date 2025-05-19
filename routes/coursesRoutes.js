const express = require('express');
const router = express.Router();
const { getCourses, addCourse, editCourse, deleteCourse } = require('../controllers/coursesController');

router.get('/courses', getCourses);
router.post('/courses', addCourse);
router.put('/courses/:id', editCourse); // New route for editing
router.delete('/courses/:id', deleteCourse);

module.exports = router;
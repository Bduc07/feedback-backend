const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: { type: String, default: 'teacher' }
});

module.exports = mongoose.model('teacher', teacherSchema);
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: { type: String, default: 'admin' }
});

module.exports = mongoose.model('admin', adminSchema);
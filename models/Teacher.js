const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);

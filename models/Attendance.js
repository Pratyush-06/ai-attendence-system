const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: {
        type: String,
        default: 'Present',
        enum: ['Present', 'Absent']
    }
}, { timestamps: true });

// Prevent duplicate attendance for same student in same session
attendanceSchema.index({ sessionId: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

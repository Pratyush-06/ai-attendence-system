const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requireStudent, requireTeacher } = require('../middleware/auth');

// @route   POST api/attendance/mark
// @desc    Mark attendance for a session (with Geofencing check)
// @access  Private (Student)
router.post('/mark', verifyToken, requireStudent, attendanceController.markAttendance);

// @route   GET api/attendance/session/:sessionId
// @desc    Get attendance records for a specific session
// @access  Private (Teacher)
router.get('/session/:sessionId', verifyToken, requireTeacher, attendanceController.getSessionAttendance);

// @route   GET api/attendance/student
// @desc    Get all attendance records for the logged in student
// @access  Private (Student)
router.get('/student', verifyToken, requireStudent, attendanceController.getStudentAttendance);

// @route   GET api/attendance/export/:sessionId
// @desc    Export attendance to an Excel sheet
// @access  Private (Teacher)
router.get('/export/:sessionId', verifyToken, requireTeacher, attendanceController.exportAttendance);

module.exports = router;

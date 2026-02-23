const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken, requireTeacher } = require('../middleware/auth');

// @route   POST api/sessions
// @desc    Create a new attendance session
// @access  Private (Teacher)
router.post('/', verifyToken, requireTeacher, sessionController.createSession);

// @route   GET api/sessions
// @desc    Get active sessions for a teacher
// @access  Private (Teacher)
router.get('/', verifyToken, requireTeacher, sessionController.getActiveSessions);

// @route   PUT api/sessions/:sessionId/end
// @desc    End an active session
// @access  Private (Teacher)
router.put('/:sessionId/end', verifyToken, requireTeacher, sessionController.endSession);

module.exports = router;

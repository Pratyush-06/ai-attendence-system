const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/student/register
// @desc    Register a student
// @access  Public
router.post('/student/register', authController.registerStudent);

// @route   POST api/auth/student/login
// @desc    Login a student
// @access  Public
router.post('/student/login', authController.loginStudent);

// @route   POST api/auth/teacher/register
// @desc    Register a teacher
// @access  Public
router.post('/teacher/register', authController.registerTeacher);

// @route   POST api/auth/teacher/login
// @desc    Login a teacher
// @access  Public
router.post('/teacher/login', authController.loginTeacher);

module.exports = router;

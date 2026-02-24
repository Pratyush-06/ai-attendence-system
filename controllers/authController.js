const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { v4: uuidv4 } = require('uuid');

// ----- Student Auth -----
exports.registerStudent = async (req, res) => {
    try {
        const { rollNo, name, dept, year, password } = req.body;

        // Check if student exists
        let student = await Student.findOne({ rollNo });
        if (student) {
            return res.status(400).json({ error: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create student
        student = new Student({
            rollNo,
            name,
            dept,
            year,
            password: hashedPassword
        });

        await student.save();

        res.status(201).json({ message: 'Student registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        // Check student
        const student = await Student.findOne({ rollNo });
        if (!student) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            id: student._id,
            rollNo: student.rollNo,
            role: 'student'
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, student: { name: student.name, rollNo: student.rollNo, dept: student.dept } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ----- Teacher Auth -----
exports.registerTeacher = async (req, res) => {
    try {
        const { teacherId, name, subjects, password } = req.body;
        const cleanedSubjects = Array.isArray(subjects)
            ? [...new Set(subjects.map((s) => String(s).trim()).filter(Boolean))]
            : [];

        // Check if teacher exists
        let teacher = await Teacher.findOne({ teacherId });
        if (teacher) {
            return res.status(400).json({ error: 'Teacher already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create teacher
        teacher = new Teacher({
            teacherId,
            name,
            subjects: cleanedSubjects,
            password: hashedPassword
        });

        await teacher.save();

        res.status(201).json({ message: 'Teacher registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.loginTeacher = async (req, res) => {
    try {
        const { teacherId, password } = req.body;

        // Check teacher
        const teacher = await Teacher.findOne({ teacherId });
        if (!teacher) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            id: teacher._id,
            teacherId: teacher.teacherId,
            role: 'teacher'
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                const cleanedSubjects = Array.isArray(teacher.subjects)
                    ? teacher.subjects.map((s) => String(s).trim()).filter(Boolean)
                    : [];
                res.json({
                    token,
                    teacher: { name: teacher.name, teacherId: teacher.teacherId, subjects: cleanedSubjects }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

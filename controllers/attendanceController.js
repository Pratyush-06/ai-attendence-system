const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Student = require('../models/Student');
const xlsx = require('xlsx');

// Helper function to calculate distance in meters between two coordinates
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Shared logic for marking attendance (used by both QR scan and class code)
async function processAttendanceMark(req, res, sessionId, location) {
    const rollNo = req.user.rollNo;

    // Verify session is valid, active, and not expired
    const session = await Session.findOne({ sessionId, active: true });
    if (!session) {
        return res.status(404).json({ error: 'Session not found or inactive' });
    }

    if (new Date() > new Date(session.expiresAt)) {
        session.active = false;
        await session.save();
        return res.status(400).json({ error: 'Session has expired' });
    }

    // Geofencing Check
    const campusLat = parseFloat(process.env.CAMPUS_LAT);
    const campusLng = parseFloat(process.env.CAMPUS_LNG);
    const campusRadius = parseFloat(process.env.CAMPUS_RADIUS_M);

    const distanceMeters = getDistanceFromLatLonInM(
        location.lat, location.lng, campusLat, campusLng
    );

    if (distanceMeters > campusRadius) {
        return res.status(403).json({ error: `Outside campus radius. Distance is ${Math.round(distanceMeters)}m` });
    }

    // Check for duplicate attendance — return friendly message
    const existingAttendance = await Attendance.findOne({ sessionId, rollNo });
    if (existingAttendance) {
        return res.status(200).json({
            alreadyMarked: true,
            message: 'You are already marked present ✅'
        });
    }

    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().split(' ')[0];

    // Get student name for real-time display
    const student = await Student.findOne({ rollNo }, 'name');
    const studentName = student ? student.name : rollNo;

    // Mark attendance
    const attendance = new Attendance({
        sessionId,
        rollNo,
        subject: session.subject,
        date: dateString,
        time: timeString,
        location: { lat: location.lat, lng: location.lng },
        status: 'Present'
    });

    await attendance.save();

    // Get updated present count for real-time display
    const presentCount = await Attendance.countDocuments({ sessionId, status: 'Present' });

    // Emit Socket.io event to session room
    const io = req.app.get('io');
    if (io) {
        io.to(sessionId).emit('attendanceMarked', {
            rollNo,
            name: studentName,
            sessionId,
            presentCount,
            totalStudents: session.totalStudents,
            time: timeString
        });
    }

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
}

// @desc    Mark attendance for a session (QR scan)
// @route   POST api/attendance/mark
exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, location } = req.body;

        if (!sessionId || !location || !location.lat || !location.lng) {
            return res.status(400).json({ error: 'Session ID and location are required' });
        }

        await processAttendanceMark(req, res, sessionId, location);

    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ alreadyMarked: true, message: 'You are already marked present ✅' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Mark attendance using class code (fallback if camera fails)
// @route   POST api/attendance/mark-by-code
exports.markAttendanceByCode = async (req, res) => {
    try {
        const { classCode, location } = req.body;

        if (!classCode || !location || !location.lat || !location.lng) {
            return res.status(400).json({ error: 'Class code and location are required' });
        }

        // Find active session by class code
        const session = await Session.findOne({ classCode, active: true });
        if (!session) {
            return res.status(404).json({ error: 'Invalid class code or session has ended' });
        }

        await processAttendanceMark(req, res, session.sessionId, location);

    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ alreadyMarked: true, message: 'You are already marked present ✅' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get attendance records for a specific session (Teacher only)
// @route   GET api/attendance/session/:sessionId
exports.getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const teacherId = req.user.teacherId;

        const session = await Session.findOne({ sessionId, teacherId });
        if (!session) {
            return res.status(403).json({ error: 'Unauthorized or session does not exist' });
        }

        const records = await Attendance.find({ sessionId }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get attendance records for a student
// @route   GET api/attendance/student
exports.getStudentAttendance = async (req, res) => {
    try {
        const rollNo = req.user.rollNo;
        const query = { rollNo };
        if (req.query.subject) {
            query.subject = req.query.subject;
        }

        const records = await Attendance.find(query).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get student attendance stats (subject-wise %)
// @route   GET api/attendance/student/stats
exports.getStudentStats = async (req, res) => {
    try {
        const rollNo = req.user.rollNo;

        const records = await Attendance.find({ rollNo });

        // Subject-wise stats
        const subjectMap = {};
        for (const record of records) {
            if (!subjectMap[record.subject]) {
                subjectMap[record.subject] = { present: 0, total: 0 };
            }
            subjectMap[record.subject].total++;
            if (record.status === 'Present') {
                subjectMap[record.subject].present++;
            }
        }

        const subjects = Object.entries(subjectMap).map(([name, data]) => ({
            name,
            percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
            present: data.present,
            total: data.total
        }));

        // Overall stats
        const totalPresent = records.filter(r => r.status === 'Present').length;
        const totalRecords = records.length;

        // Recent records (last 10)
        const recent = records
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(r => ({
                subject: r.subject,
                date: r.date,
                status: r.status
            }));

        res.json({
            subjects,
            overall: {
                percentage: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
                present: totalPresent,
                total: totalRecords
            },
            recent
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Export session attendance to Excel (Teacher only)
// @route   GET api/attendance/export/:sessionId
exports.exportAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const teacherId = req.user.teacherId;

        const session = await Session.findOne({ sessionId, teacherId });
        if (!session) {
            return res.status(403).json({ error: 'Unauthorized or session does not exist' });
        }

        const records = await Attendance.find({ sessionId }).lean();

        if (!records.length) {
            return res.status(404).json({ error: 'No records found for this session' });
        }

        const dataForExcel = records.map(record => ({
            RollNumber: record.rollNo,
            Subject: record.subject,
            Date: record.date,
            Time: record.time,
            Status: record.status,
            'Location (Lat)': record.location.lat,
            'Location (Lng)': record.location.lng,
            MarkedAt: record.createdAt
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(dataForExcel);
        xlsx.utils.book_append_sheet(wb, ws, 'Attendance');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.set('Content-Disposition', `attachment; filename=attendance_${sessionId}.xlsx`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Manually mark a student present (Teacher adds by name/roll)
// @route   POST api/attendance/manual-mark
exports.manualMarkAttendance = async (req, res) => {
    try {
        const { sessionId, studentName, rollNo } = req.body;
        const teacherId = req.user.teacherId;

        if (!sessionId || !studentName || !rollNo) {
            return res.status(400).json({ error: 'Session ID, student name, and roll number are required' });
        }

        const session = await Session.findOne({ sessionId, teacherId, active: true });
        if (!session) {
            return res.status(404).json({ error: 'Session not found, not yours, or already ended' });
        }

        const existing = await Attendance.findOne({ sessionId, rollNo });
        if (existing) {
            return res.status(200).json({ alreadyMarked: true, message: `${rollNo} is already marked present` });
        }

        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0];

        const attendance = new Attendance({
            sessionId,
            rollNo,
            subject: session.subject,
            date: dateString,
            time: timeString,
            location: { lat: 0, lng: 0 },
            status: 'Present'
        });

        await attendance.save();

        const presentCount = await Attendance.countDocuments({ sessionId, status: 'Present' });

        const io = req.app.get('io');
        if (io) {
            io.to(sessionId).emit('attendanceMarked', {
                rollNo,
                name: studentName,
                sessionId,
                presentCount,
                totalStudents: session.totalStudents,
                time: timeString
            });
        }

        res.status(201).json({ message: `${studentName} marked present manually`, attendance });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ alreadyMarked: true, message: 'Already marked present' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const xlsx = require('xlsx');

// Helper function to calculate distance in meters between two coordinates
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
}

// @desc    Mark attendance for a session
// @route   POST api/attendance/mark
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, location } = req.body; // location = { lat: Number, lng: Number }
        const rollNo = req.user.rollNo; // from auth middleware

        if (!sessionId || !location || !location.lat || !location.lng) {
            return res.status(400).json({ error: 'Session ID and location are required' });
        }

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
            location.lat,
            location.lng,
            campusLat,
            campusLng
        );

        if (distanceMeters > campusRadius) {
            return res.status(403).json({ error: `Outside campus radius. Distance is ${Math.round(distanceMeters)}m` });
        }

        // Check for duplicate attendance
        const existingAttendance = await Attendance.findOne({ sessionId, rollNo });
        if (existingAttendance) {
            return res.status(400).json({ error: 'Attendance already marked for this session' });
        }

        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0];

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

        res.status(201).json({ message: 'Attendance marked successfully', attendance });

    } catch (err) {
        // Handle MongoDB duplicate key error silently if necessary
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Attendance already marked.' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get attendance records for a specific session (Teacher only)
// @route   GET api/attendance/session/:sessionId
// @access  Private (Teacher)
exports.getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const teacherId = req.user.teacherId;

        // Verify teacher owns the session
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
// @access  Private (Student)
exports.getStudentAttendance = async (req, res) => {
    try {
        const rollNo = req.user.rollNo;
        // Allows filtering by subject if passed as a query param
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

// @desc    Export session attendance to Excel (Teacher only)
// @route   GET api/attendance/export/:sessionId
// @access  Private (Teacher)
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

        // Write to buffer
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.set('Content-Disposition', `attachment; filename=attendance_${sessionId}.xlsx`);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

const buildQrPayload = ({ sessionId, teacherId, subject }) =>
    JSON.stringify({
        sessionId,
        teacherId,
        subject,
        timestamp: Date.now()
    });

// Generate a 6-digit class code
const generateClassCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Create a new attendance session (Teacher only)
// @route   POST api/sessions
exports.createSession = async (req, res) => {
    try {
        const { subject, durationMinutes, totalStudents } = req.body;
        const teacherId = req.user.teacherId;

        if (!subject || !durationMinutes) {
            return res.status(400).json({ error: 'Please provide subject and durationMinutes' });
        }

        const sessionId = uuidv4();
        const classCode = generateClassCode();
        const qrDataPayload = buildQrPayload({ sessionId, teacherId, subject });
        const expiresAt = new Date(Date.now() + durationMinutes * 60000);

        const session = new Session({
            sessionId,
            teacherId,
            subject,
            qrData: qrDataPayload,
            classCode,
            totalStudents: totalStudents || 60,
            expiresAt
        });

        await session.save();

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                sessionId: session.sessionId,
                subject: session.subject,
                expiresAt: session.expiresAt,
                qrCode: qrDataPayload,
                classCode: session.classCode,
                totalStudents: session.totalStudents
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all active sessions for a teacher
// @route   GET api/sessions
exports.getActiveSessions = async (req, res) => {
    try {
        const teacherId = req.user.teacherId;

        const sessions = await Session.find({
            teacherId,
            active: true,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        const normalizedSessions = sessions.map((session) => {
            const sessionObj = session.toObject();
            const payload = buildQrPayload({
                sessionId: sessionObj.sessionId,
                teacherId: sessionObj.teacherId,
                subject: sessionObj.subject
            });

            sessionObj.qrData = payload;
            sessionObj.qrCode = payload;
            return sessionObj;
        });

        res.json(normalizedSessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get past (ended/expired) sessions with full attendance details
// @route   GET api/sessions/history
exports.getPastSessions = async (req, res) => {
    try {
        const teacherId = req.user.teacherId;

        // Get ended or expired sessions
        const sessions = await Session.find({
            teacherId,
            $or: [{ active: false }, { expiresAt: { $lte: new Date() } }]
        }).sort({ createdAt: -1 }).limit(50);

        // For each session, get attendance records with student names
        const result = [];
        for (const session of sessions) {
            const records = await Attendance.find({ sessionId: session.sessionId })
                .sort({ status: 1, createdAt: -1 })
                .lean();

            // Enrich records with student names
            const rollNos = records.map(r => r.rollNo);
            const students = await Student.find({ rollNo: { $in: rollNos } }, 'rollNo name dept year').lean();
            const studentMap = {};
            for (const s of students) {
                studentMap[s.rollNo] = s;
            }

            const enrichedRecords = records.map(r => ({
                ...r,
                studentName: studentMap[r.rollNo]?.name || r.rollNo,
                dept: studentMap[r.rollNo]?.dept || '',
                year: studentMap[r.rollNo]?.year || ''
            }));

            const presentCount = records.filter(r => r.status === 'Present').length;
            const absentCount = records.filter(r => r.status === 'Absent').length;

            result.push({
                sessionId: session.sessionId,
                subject: session.subject,
                classCode: session.classCode,
                totalStudents: session.totalStudents,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
                active: session.active,
                presentCount,
                absentCount,
                attendance: enrichedRecords
            });
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    End an attendance session manually + auto-mark absentees
// @route   PUT api/sessions/:sessionId/end
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const teacherId = req.user.teacherId;

        const session = await Session.findOne({ sessionId, teacherId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized' });
        }

        session.active = false;
        await session.save();

        // Auto-mark absentees: find all students who were NOT marked present
        const presentRecords = await Attendance.find({ sessionId, status: 'Present' });
        const presentRollNos = new Set(presentRecords.map(r => r.rollNo));

        // Get all students in the system
        const allStudents = await Student.find({}, 'rollNo');
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().split(' ')[0];

        const absentRecords = [];
        for (const student of allStudents) {
            if (!presentRollNos.has(student.rollNo)) {
                absentRecords.push({
                    sessionId,
                    rollNo: student.rollNo,
                    subject: session.subject,
                    date: dateString,
                    time: timeString,
                    location: { lat: 0, lng: 0 },
                    status: 'Absent'
                });
            }
        }

        if (absentRecords.length > 0) {
            await Attendance.insertMany(absentRecords, { ordered: false }).catch(() => { });
        }

        // Emit real-time event
        const io = req.app.get('io');
        if (io) {
            io.to(sessionId).emit('sessionEnded', {
                sessionId,
                presentCount: presentRollNos.size,
                absentCount: absentRecords.length
            });
        }

        res.json({
            message: 'Session ended successfully',
            session,
            stats: {
                present: presentRollNos.size,
                absent: absentRecords.length
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get analytics for teacher's sessions
// @route   GET api/sessions/analytics
exports.getAnalytics = async (req, res) => {
    try {
        const teacherId = req.user.teacherId;

        // Get all sessions by this teacher
        const sessions = await Session.find({ teacherId }).sort({ createdAt: -1 });
        const sessionIds = sessions.map(s => s.sessionId);

        if (sessionIds.length === 0) {
            return res.json({ subjects: [], dailyTrend: [], overall: { totalSessions: 0, avgAttendance: 0 } });
        }

        // Get all attendance records for these sessions
        const allRecords = await Attendance.find({ sessionId: { $in: sessionIds } });

        // Subject-wise attendance %
        const subjectMap = {};
        for (const record of allRecords) {
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

        // Daily attendance trend (last 30 days)
        const dailyMap = {};
        for (const record of allRecords) {
            if (!dailyMap[record.date]) {
                dailyMap[record.date] = { present: 0, total: 0 };
            }
            dailyMap[record.date].total++;
            if (record.status === 'Present') {
                dailyMap[record.date].present++;
            }
        }

        const dailyTrend = Object.entries(dailyMap)
            .map(([date, data]) => ({
                date,
                percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
                present: data.present,
                total: data.total
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30);

        // Overall stats
        const totalPresent = allRecords.filter(r => r.status === 'Present').length;
        const totalRecords = allRecords.length;

        res.json({
            subjects,
            dailyTrend,
            overall: {
                totalSessions: sessions.length,
                avgAttendance: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
                totalPresent,
                totalRecords
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

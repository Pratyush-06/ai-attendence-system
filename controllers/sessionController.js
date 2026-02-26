const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

const buildQrPayload = ({ sessionId, teacherId, subject }) =>
    JSON.stringify({
        sessionId,
        teacherId,
        subject,
        timestamp: Date.now()
    });

// @desc    Create a new attendance session (Teacher only)
// @route   POST api/sessions
exports.createSession = async (req, res) => {
    try {
        const { subject, durationMinutes } = req.body;
        const teacherId = req.user.teacherId; // from auth middleware

        if (!subject || !durationMinutes) {
            return res.status(400).json({ error: 'Please provide subject and durationMinutes' });
        }

        const sessionId = uuidv4();

        // Keep QR content lightweight so frontend QR generator never overflows.
        const qrDataPayload = buildQrPayload({ sessionId, teacherId, subject });

        const expiresAt = new Date(Date.now() + durationMinutes * 60000);

        const session = new Session({
            sessionId,
            teacherId,
            subject,
            qrData: qrDataPayload,
            expiresAt
        });

        await session.save();

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                sessionId: session.sessionId,
                subject: session.subject,
                expiresAt: session.expiresAt,
                qrCode: qrDataPayload
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

        // Find sessions that belong to the teacher, are marked active, and haven't expired
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

            // For backward compatibility, always return a short QR payload field.
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

// @desc    End an attendance session manually
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

        res.json({ message: 'Session ended successfully', session });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

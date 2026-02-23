const Session = require('../models/Session');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

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

        // QR data can include sessionId and timestamp for validation
        const qrDataPayload = JSON.stringify({
            sessionId,
            teacherId,
            subject,
            timestamp: Date.now()
        });

        // Generate QR code data URL (base64)
        const qrDataUrl = await QRCode.toDataURL(qrDataPayload);

        const expiresAt = new Date(Date.now() + durationMinutes * 60000);

        const session = new Session({
            sessionId,
            teacherId,
            subject,
            qrData: qrDataUrl,
            expiresAt
        });

        await session.save();

        res.status(201).json({
            message: 'Session created successfully',
            session: {
                sessionId: session.sessionId,
                subject: session.subject,
                expiresAt: session.expiresAt,
                qrCode: session.qrData
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

        res.json(sessions);
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

const jwt = require('jsonwebtoken');

// Generic auth middleware — verifies JWT and attaches req.user
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// Role-specific middleware
const requireTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }
    next();
};

const requireStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
};

module.exports = { verifyToken, requireTeacher, requireStudent };

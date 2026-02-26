require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible to controllers via req.app
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Teacher/Student joins a session room for real-time updates
    socket.on('joinSession', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session room: ${sessionId}`);
    });

    socket.on('leaveSession', (sessionId) => {
        socket.leave(sessionId);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Configure Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AI Attendance Backend is running' });
});

// Serve frontend build dynamically
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start Server (using http server for Socket.io)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

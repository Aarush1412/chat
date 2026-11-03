const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect database
connectDB();

const app = express();

// Middleware (cors once, before the routes)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Health check: open http://localhost:5000 to test
app.get('/', (req, res) => res.json({ ok: true, message: 'Chat API running' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Global error handler
app.use(errorHandler);

module.exports = app;


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const inquiryRoutes = require('./routes/inquiry');

const app = express();

const allowedOrigins = [
    'https://frontend-production-7b812b1f.up.railway.app'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Global Error Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Endpoint not found'
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}

module.exports = app;

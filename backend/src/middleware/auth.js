const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // In test mode, allow validly signed mock tokens directly
        if (process.env.NODE_ENV === 'test') {
            req.user = decoded;
            return next();
        }

        // Ensure user actually exists in current database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'User session invalid. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Token is invalid or expired' });
    }
}

function requireRole(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permission' });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole };
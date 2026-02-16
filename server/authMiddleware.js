// server/authMiddleware.js — Firebase Authentication middleware
const { admin } = require('./firebase');
const logger = require('./logger');

/**
 * Middleware to verify Firebase ID tokens.
 * Expects header: Authorization: Bearer <token>
 */
async function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Unauthorized request: No token provided');
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (err) {
        logger.error('Failed to verify token: %s', err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

module.exports = { verifyAdmin };

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to verify JWT token and attach user to request object.
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('[Auth Middleware] Token found:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[Auth Middleware] Decoded:', decoded);

            // Handle both payload structures just in case
            const userId = decoded.user ? decoded.user.id : decoded.id;
            console.log('[Auth Middleware] User ID from token:', userId);

            req.user = await User.findByPk(userId);
            console.log('[Auth Middleware] User found in DB:', req.user ? 'Yes' : 'No');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('[Auth Middleware] Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('[Auth Middleware] No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Middleware to restrict access based on user role.
 * @param {string} role - The required role (e.g., 'admin').
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized, insufficient permissions' });
        }
    };
};

module.exports = { protect, requireRole };

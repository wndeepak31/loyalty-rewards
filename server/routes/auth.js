const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register user
// @access  Public
router.post(
    '/signup',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ where: { email } });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            user = await User.create({
                name,
                email,
                password,
            });

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            console.log(`[Auth Login] Attempting login for: ${email}`);
            let user = await User.findOne({ where: { email } });

            if (!user) {
                console.log(`[Auth Login] User not found: ${email}`);
                return res.status(400).json({ errors: [{ msg: '[DEBUG] User not found' }] });
            }

            console.log(`[Auth Login] User found: ${user.id}, comparing password...`);
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log(`[Auth Login] Password mismatch for user: ${email}`);
                return res.status(400).json({ errors: [{ msg: '[DEBUG] Password mismatch' }] });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    console.log('[Auth Login] Token generated for user:', user.id);
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
                }
            );
        } catch (err) {
            console.error('[Auth Login] Server error:', err);
            res.status(500).json({ errors: [{ msg: `[DEBUG] Server Error: ${err.message}` }] });
        }
    }
);

// @route   POST api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post(
    '/forgot-password',
    [check('email', 'Please include a valid email').isEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                // For security, don't confirm if user exists or not
                return res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
            }

            // Generate token
            const token = crypto.randomBytes(20).toString('hex');

            // Set token and expiry (1 hour)
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000;
            await user.save();

            // Mock email sending
            console.log('=========================================');
            console.log('PASSWORD RESET REQUEST');
            console.log(`User: ${user.email}`);
            console.log(`Link: http://localhost:5173/reset-password/${token}`);
            console.log('=========================================');

            res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post(
    '/reset-password/:token',
    [
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findOne({
                where: {
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Password reset token is invalid or has expired' }] });
            }

            // Update password (hooks in User model will handle hashing)
            user.password = req.body.password;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.json({ msg: 'Password has been reset successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register user and dispatch 6-digit verification OTP email
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

        const { name, email, password, phone } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        try {
            let user = await User.findOne({ where: { email: cleanEmail } });

            // If user already registered and verified
            if (user && user.isEmailVerified) {
                return res.status(400).json({
                    errors: [{ msg: 'An account with this email already exists. Please sign in.' }]
                });
            }

            // Generate secure 6-digit OTP and 15-minute expiration
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            if (!user) {
                user = await User.create({
                    name: name.trim(),
                    email: cleanEmail,
                    phone: phone ? phone.trim() : null,
                    password,
                    isEmailVerified: false,
                    emailVerificationCode: code,
                    emailVerificationExpires: expiresAt,
                });
            } else {
                // User previously signed up but did not verify email; update details and issue fresh OTP
                user.name = name.trim();
                if (phone) user.phone = phone.trim();
                user.password = password; // Trigger hashing hook
                user.emailVerificationCode = code;
                user.emailVerificationExpires = expiresAt;
                await user.save();
            }

            // Dispatch verification email via Resend (with console fallback)
            await sendVerificationEmail(cleanEmail, code, user.name);

            res.json({
                requiresVerification: true,
                email: cleanEmail,
                msg: 'Verification code sent to your email address.'
            });
        } catch (err) {
            console.error('[Signup Error]', err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/verify-email
// @desc    Verify 6-digit OTP code and activate account
// @access  Public
router.post(
    '/verify-email',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('code', '6-digit verification code is required').isLength({ min: 6, max: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, code } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const cleanCode = code.toString().trim();

        try {
            const user = await User.findOne({
                where: {
                    email: cleanEmail,
                    emailVerificationCode: cleanCode,
                    emailVerificationExpires: { [Op.gt]: new Date() },
                },
            });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid or expired verification code. Please request a new code.' }]
                });
            }

            // Mark user account verified
            user.isEmailVerified = true;
            user.emailVerificationCode = null;
            user.emailVerificationExpires = null;
            await user.save();

            const payload = {
                user: {
                    id: user.id,
                },
            };

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not configured');
            }

            jwt.sign(
                payload,
                secret,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        token,
                        user: { id: user.id, name: user.name, email: user.email, role: user.role },
                        msg: 'Email successfully verified!'
                    });
                }
            );
        } catch (err) {
            console.error('[Verify Email Error]', err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/resend-code
// @desc    Resend a fresh 6-digit OTP verification code
// @access  Public
router.post(
    '/resend-code',
    [check('email', 'Please include a valid email').isEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        try {
            const user = await User.findOne({ where: { email: cleanEmail } });

            if (!user) {
                return res.status(404).json({
                    errors: [{ msg: 'No account found with this email address.' }]
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    errors: [{ msg: 'This email is already verified. Please sign in.' }]
                });
            }

            // Generate fresh OTP
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            user.emailVerificationCode = code;
            user.emailVerificationExpires = expiresAt;
            await user.save();

            await sendVerificationEmail(cleanEmail, code, user.name);

            res.json({
                success: true,
                msg: 'A fresh 6-digit verification code has been sent to your email.'
            });
        } catch (err) {
            console.error('[Resend Code Error]', err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token (or prompt for email verification)
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
        const cleanEmail = email.toLowerCase().trim();

        try {
            console.log(`[Auth Login] Attempting login for: ${cleanEmail}`);
            let user = await User.findOne({ where: { email: cleanEmail } });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] });
            }

            // Check if email is verified (only enforced for non-admin accounts)
            if (user.role !== 'admin' && !user.isEmailVerified) {
                // Auto generate and dispatch a fresh code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

                user.emailVerificationCode = code;
                user.emailVerificationExpires = expiresAt;
                await user.save();

                await sendVerificationEmail(cleanEmail, code, user.name);

                return res.status(403).json({
                    requiresVerification: true,
                    email: cleanEmail,
                    errors: [{ msg: 'Please verify your email address to continue. A fresh 6-digit verification code has been sent.' }]
                });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }

            jwt.sign(
                payload,
                secret,
                { expiresIn: '5 days' },
                (err, token) => {
                    if (err) {
                        console.error('[Auth Login] JWT Sign Error:', err);
                        return res.status(500).json({ errors: [{ msg: `JWT Error: ${err.message}` }] });
                    }
                    console.log('[Auth Login] Token generated for user:', user.id);
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
                }
            );
        } catch (err) {
            console.error('[Auth Login] Critical Error:', err);
            res.status(500).json({
                errors: [{ msg: `Server Error: ${err.message}` }]
            });
        }
    }
);

// @route   POST api/auth/forgot-password
// @desc    Generate password reset token and dispatch email via Resend
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
        const cleanEmail = email.toLowerCase().trim();

        try {
            const user = await User.findOne({ where: { email: cleanEmail } });
            if (!user) {
                // For security, do not confirm existence
                return res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
            }

            // Generate cryptographically secure token
            const token = crypto.randomBytes(24).toString('hex');

            // Set token and 1-hour expiry
            user.resetPasswordToken = token;
            user.resetPasswordExpires = new Date(Date.now() + 3600000);
            await user.save();

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const resetUrl = `${clientUrl}/reset-password/${token}`;

            // Dispatch branded password reset email via Resend
            await sendPasswordResetEmail(cleanEmail, resetUrl, user.name);

            res.json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (err) {
            console.error('[Forgot Password Error]', err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password using valid token
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
                    resetPasswordExpires: { [Op.gt]: new Date() }
                }
            });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Password reset token is invalid or has expired. Please request a new link.' }]
                });
            }

            // Update password (hooks in User model will handle bcrypt hashing)
            user.password = req.body.password;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.json({ msg: 'Password has been reset successfully. You can now sign in with your new password.' });
        } catch (err) {
            console.error('[Reset Password Error]', err.message);
            res.status(500).json({ errors: [{ msg: 'Server error: ' + err.message }] });
        }
    }
);

module.exports = router;

const { validationResult, check } = require('express-validator');

/**
 * Middleware to handle validation errors.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateSignup = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validate
];

const validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validate
];

const validateTransaction = [
    check('amount', 'Amount must be a positive number').isFloat({ min: 0.01 }),
    validate
];

const validateReward = [
    check('name', 'Name is required').not().isEmpty(),
    check('pointsCost', 'Points cost must be a positive integer').isInt({ min: 1 }),
    validate
];

module.exports = {
    validateSignup,
    validateLogin,
    validateTransaction,
    validateReward
};

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { User } = require('../models');

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const LoyaltyService = require('../services/loyaltyService');
        await LoyaltyService.recalculateBalances(req.user.id);

        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
        });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

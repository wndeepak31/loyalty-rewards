const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const LoyaltyService = require('../services/loyaltyService');

// @route   GET api/loyalty/tier-progress
// @desc    Get user loyalty tier progression details
// @access  Private
router.get('/tier-progress', protect, async (req, res) => {
    try {
        const progress = await LoyaltyService.getTierProgress(req.user.id);
        res.json(progress);
    } catch (err) {
        console.error('Error fetching tier progress:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

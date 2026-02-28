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

// @route   GET api/loyalty/config
// @desc    Get loyalty system configuration
// @access  Private
router.get('/config', protect, async (req, res) => {
    try {
        const config = await LoyaltyService.getConfig();
        res.json(config);
    } catch (err) {
        console.error('Error fetching loyalty config:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/loyalty/tiers
// @desc    Get all loyalty tiers
// @access  Private
router.get('/tiers', protect, async (req, res) => {
    try {
        const { LoyaltyTier } = require('../models');
        const tiers = await LoyaltyTier.findAll({ order: [['minSpend', 'ASC']] });
        res.json(tiers);
    } catch (err) {
        console.error('Error fetching loyalty tiers:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

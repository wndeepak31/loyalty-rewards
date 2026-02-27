const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { User, Transaction, Redemption, Reward, LoyaltyTier, LoyaltyConfig, sequelize } = require('../models');

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', [protect, requireRole('admin')], async (req, res) => {
    try {
        const userCount = await User.count({ where: { role: 'user' } });
        const transactionCount = await Transaction.count();
        const redemptionCount = await Redemption.count();

        // Total points issued (sum of pointsEarned in transactions)
        const totalPointsIssued = await Transaction.sum('pointsEarned') || 0;

        // Total points redeemed (sum of pointsSpent in redemptions)
        const totalPointsRedeemed = await Redemption.sum('pointsSpent') || 0;

        res.json({
            userCount,
            transactionCount,
            redemptionCount,
            totalPointsIssued,
            totalPointsRedeemed,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/reports
// @desc    Get detailed reports (e.g., top users, recent big transactions)
// @access  Private/Admin
router.get('/reports', [protect, requireRole('admin')], async (req, res) => {
    try {
        // Top 5 users by available points
        const topUsers = await User.findAll({
            where: { role: 'user' },
            order: [['availablePoints', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'email', 'availablePoints', 'totalPoints'],
        });

        // Recent 5 redemptions
        const recentRedemptions = await Redemption.findAll({
            include: [
                { model: User, as: 'user', attributes: ['name', 'email'] },
                { model: Reward, as: 'reward', attributes: ['name'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: 5,
        });

        res.json({
            topUsers,
            recentRedemptions,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/config
// @desc    Get system loyalty configuration
// @access  Private/Admin
router.get('/config', [protect, requireRole('admin')], async (req, res) => {
    try {
        let config = await LoyaltyConfig.findOne();
        if (!config) {
            config = await LoyaltyConfig.create({});
        }
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/config
// @desc    Update system loyalty configuration
// @access  Private/Admin
router.post('/config', [protect, requireRole('admin')], async (req, res) => {
    try {
        const { earnRatePercentage, expiryMonths, maxRedeemPercentage } = req.body;
        let config = await LoyaltyConfig.findOne();
        if (!config) {
            config = new LoyaltyConfig();
        }

        config.earnRatePercentage = earnRatePercentage || config.earnRatePercentage;
        config.expiryMonths = expiryMonths || config.expiryMonths;
        config.maxRedeemPercentage = maxRedeemPercentage || config.maxRedeemPercentage;

        await config.save();
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/tiers
// @desc    Get all loyalty tiers
// @access  Private/Admin
router.get('/tiers', [protect, requireRole('admin')], async (req, res) => {
    try {
        const tiers = await LoyaltyTier.findAll({ order: [['minSpend', 'ASC']] });
        res.json(tiers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/tiers
// @desc    Create or update loyalty tier
// @access  Private/Admin
router.post('/tiers', [protect, requireRole('admin')], async (req, res) => {
    try {
        const { id, name, minSpend, earnRate, benefits } = req.body;
        let tier;
        if (id) {
            tier = await LoyaltyTier.findByPk(id);
            if (!tier) return res.status(404).json({ msg: 'Tier not found' });
            tier.name = name || tier.name;
            tier.minSpend = minSpend !== undefined ? minSpend : tier.minSpend;
            tier.earnRate = earnRate !== undefined ? earnRate : tier.earnRate;
            tier.benefits = benefits || tier.benefits;
            await tier.save();
        } else {
            tier = await LoyaltyTier.create({ name, minSpend, earnRate, benefits });
        }
        res.json(tier);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

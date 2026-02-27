const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Redemption, Reward, sequelize } = require('../models');
const LoyaltyService = require('../services/loyaltyService');

// @route   POST api/redemptions
// @desc    Redeem a reward with FIFO logic and system validation
// @access  Private
router.post('/', protect, async (req, res) => {
    const { rewardId } = req.body;

    const t = await sequelize.transaction();

    try {
        const reward = await Reward.findByPk(rewardId, { transaction: t });

        if (!reward) {
            await t.rollback();
            return res.status(404).json({ msg: 'Reward not found' });
        }

        if (!reward.isActive) {
            await t.rollback();
            return res.status(400).json({ msg: 'Reward is no longer active' });
        }

        if (reward.stock !== -1 && reward.stock <= 0) {
            await t.rollback();
            return res.status(400).json({ msg: 'Reward is out of stock' });
        }

        // 1. Validate Redemption (Max percentage cap)
        const validation = await LoyaltyService.validateRedemption(req.user.id, reward.pointsCost);
        if (!validation.valid) {
            await t.rollback();
            return res.status(400).json({ msg: validation.msg });
        }

        // 2. Create base redemption record
        const redemption = await Redemption.create(
            {
                userId: req.user.id,
                rewardId: reward.id,
                pointsSpent: reward.pointsCost,
                status: 'fulfilled',
            },
            { transaction: t }
        );

        // 3. Process FIFO Points Deduction
        await LoyaltyService.redeemPointsFIFO(req.user.id, reward.pointsCost, redemption.id, t);

        // 4. Decrease stock if not unlimited
        if (reward.stock !== -1) {
            reward.stock -= 1;
            await reward.save({ transaction: t });
        }

        await t.commit();
        res.json(redemption);
    } catch (err) {
        await t.rollback();
        console.error('Redemption Error:', err.message);
        res.status(500).json({ msg: err.message || 'Server Error' });
    }
});

// @route   GET api/redemptions
// @desc    Get user redemptions history
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const redemptions = await Redemption.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Reward,
                    as: 'reward',
                    attributes: ['name', 'description', 'imageUrl'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json(redemptions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

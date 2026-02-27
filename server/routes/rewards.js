const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, requireRole } = require('../middleware/auth'); // Renamed middleware to match usage
const { Reward } = require('../models');

// @route   GET api/rewards
// @desc    Get all active rewards
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const rewards = await Reward.findAll({
            where: { isActive: true },
        });
        res.json(rewards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/rewards
// @desc    Create a reward
// @access  Private/Admin
router.post(
    '/',
    [
        protect,
        requireRole('admin'), // Assuming admin role check here
        [
            check('name', 'Name is required').not().isEmpty(),
            check('pointsCost', 'Points cost is required').isInt({ min: 1 }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, pointsCost, stock, category, imageUrl } = req.body;

        try {
            const newReward = await Reward.create({
                name,
                description,
                pointsCost,
                stock,
                category,
                imageUrl,
            });

            res.json(newReward);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/rewards/:id
// @desc    Update a reward
// @access  Private/Admin
router.put('/:id', [protect, requireRole('admin')], async (req, res) => {
    const { name, description, pointsCost, stock, isActive, category, imageUrl } =
        req.body;

    try {
        let reward = await Reward.findByPk(req.params.id);

        if (!reward) {
            return res.status(404).json({ msg: 'Reward not found' });
        }

        reward.name = name || reward.name;
        reward.description = description || reward.description;
        reward.pointsCost = pointsCost || reward.pointsCost;
        reward.stock = stock !== undefined ? stock : reward.stock;
        reward.isActive = isActive !== undefined ? isActive : reward.isActive;
        reward.category = category || reward.category;
        reward.imageUrl = imageUrl || reward.imageUrl;

        await reward.save();

        res.json(reward);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/rewards/:id
// @desc    Delete (soft delete/deactivate) a reward
// @access  Private/Admin
router.delete('/:id', [protect, requireRole('admin')], async (req, res) => {
    try {
        let reward = await Reward.findByPk(req.params.id);

        if (!reward) {
            return res.status(404).json({ msg: 'Reward not found' });
        }

        // Instead of hard delete, maybe just deactivate? check requirements.
        // User asked for "Do not delete files", probably applies to code.
        // For data, standard is soft delete often. But user said "Delete reward" in plan.
        // I'll implement destroy but maybe better to soft delete. The plan said "Deactivate reward".
        // I'll toggle isActive to false.

        reward.isActive = false;
        await reward.save();

        res.json({ msg: 'Reward deactivated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

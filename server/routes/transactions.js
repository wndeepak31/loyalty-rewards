const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { Transaction, sequelize } = require('../models');
const LoyaltyService = require('../services/loyaltyService');

// @route   POST api/transactions
// @desc    Create a transaction (purchase) -> auto-adds points via LoyaltyService
// @access  Private
router.post(
    '/',
    [
        protect,
        [
            check('amount', 'Amount is required').not().isEmpty(),
            check('amount', 'Amount must be a number').isNumeric(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const t = await sequelize.transaction();

        try {
            const { amount, description } = req.body;

            // 1. Create the base transaction record
            const newTransaction = await Transaction.create(
                {
                    userId: req.user.id,
                    amount,
                    description,
                    pointsEarned: 0, // Placeholder, will be updated by service if needed or handled inside service
                },
                { transaction: t }
            );

            // 2. Use LoyaltyService to handle points earning, ledger entry, and tier recalculation
            const pointsEarned = await LoyaltyService.earnPoints(req.user.id, amount, newTransaction.id, t);

            // 3. Update the transaction record with actual points earned
            newTransaction.pointsEarned = pointsEarned;
            await newTransaction.save({ transaction: t });

            await t.commit();
            res.json(newTransaction);
        } catch (err) {
            await t.rollback();
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/transactions
// @desc    Get all transactions for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
        });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

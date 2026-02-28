const { User, Transaction, Redemption, LoyaltyTier, LoyaltyConfig, PointsLedger, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Loyalty Service
 * Handles all core business logic for the enterprise loyalty engine.
 */
class LoyaltyService {
    /**
     * Get the current loyalty configuration
     */
    static async getConfig() {
        let config = await LoyaltyConfig.findOne();
        if (!config) {
            // Default config if none exists
            config = await LoyaltyConfig.create({
                earnRatePercentage: 0.10,
                expiryMonths: 18,
                maxRedeemPercentage: 0.20
            });
        }
        return config;
    }

    /**
     * Calculate earned points based on amount and system config
     */
    static calculateEarnedPoints(amount, earnRate) {
        return Math.floor(parseFloat(amount) * parseFloat(earnRate));
    }

    /**
     * Recalculate a user's tier based on their yearly spend
     */
    static async recalculateTier(userId, transaction = null) {
        const user = await User.findByPk(userId, { transaction });
        if (!user) return null;

        const tiers = await LoyaltyTier.findAll({
            order: [['minSpend', 'DESC']],
            transaction
        });

        let newTier = 'Silver'; // Default
        for (const tier of tiers) {
            if (parseFloat(user.yearlySpend) >= parseFloat(tier.minSpend)) {
                newTier = tier.name;
                break;
            }
        }

        if (user.tier !== newTier) {
            user.tier = newTier;
            await user.save({ transaction });
        }

        return newTier;
    }

    /**
     * Add points to a user's ledger
     */
    static async earnPoints(userId, amount, transactionId, dbTransaction = null) {
        const user = await User.findByPk(userId, { transaction: dbTransaction });
        if (!user) throw new Error('User not found');

        // Fetch user's current tier details to get the specific earn rate
        const tier = await LoyaltyTier.findOne({
            where: { name: user.tier },
            transaction: dbTransaction
        });

        const config = await this.getConfig();
        const earnRate = tier ? tier.earnRate : config.earnRatePercentage;
        const points = this.calculateEarnedPoints(amount, earnRate);

        if (points <= 0) {
            // Still update yearly spend even if no points earned (e.g. amount too small)
            user.yearlySpend = parseFloat(user.yearlySpend) + parseFloat(amount);
            await user.save({ transaction: dbTransaction });
            await this.recalculateTier(userId, dbTransaction);
            return 0;
        }

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + config.expiryMonths);

        // Create Ledger Entry
        await PointsLedger.create({
            userId,
            type: 'EARN',
            points,
            remainingPoints: points,
            referenceId: transactionId.toString(),
            expiresAt
        }, { transaction: dbTransaction });

        // Update User Balance
        user.availablePoints += points;
        user.totalPoints += points;
        user.yearlySpend = parseFloat(user.yearlySpend) + parseFloat(amount);
        await user.save({ transaction: dbTransaction });

        // Recalculate Tier
        await this.recalculateTier(userId, dbTransaction);

        return points;
    }

    /**
     * Deduct points using FIFO logic
     */
    static async redeemPointsFIFO(userId, pointsToRedeem, redemptionId, dbTransaction = null) {
        let remainingToDeduct = pointsToRedeem;

        // Find all active EARN batches, oldest first
        const batches = await PointsLedger.findAll({
            where: {
                userId,
                type: 'EARN',
                remainingPoints: { [Op.gt]: 0 },
                expiresAt: { [Op.gt]: new Date() }
            },
            order: [['createdAt', 'ASC']],
            transaction: dbTransaction
        });

        for (const batch of batches) {
            if (remainingToDeduct <= 0) break;

            const deduction = Math.min(batch.remainingPoints, remainingToDeduct);
            batch.remainingPoints -= deduction;
            remainingToDeduct -= deduction;

            await batch.save({ transaction: dbTransaction });

            // Create REDEEM record linked to this batch (optional refinement: individual ledger entries or one per redemption)
        }

        if (remainingToDeduct > 0) {
            throw new Error('Insufficient points in valid ledger batches');
        }

        // Create global REDEEM ledger entry
        await PointsLedger.create({
            userId,
            type: 'REDEEM',
            points: pointsToRedeem,
            remainingPoints: 0,
            referenceId: redemptionId.toString()
        }, { transaction: dbTransaction });

        // Update User Balance
        const user = await User.findByPk(userId, { transaction: dbTransaction });
        user.availablePoints -= pointsToRedeem;
        await user.save({ transaction: dbTransaction });

        return true;
    }

    /**
     * Expire points that have passed their expiry date
     */
    static async expirePoints() {
        const transaction = await sequelize.transaction();
        try {
            const now = new Date();

            // Find all batches that have expired and still have remaining points
            const expiredBatches = await PointsLedger.findAll({
                where: {
                    type: 'EARN',
                    remainingPoints: { [Op.gt]: 0 },
                    expiresAt: { [Op.lt]: now }
                },
                transaction
            });

            for (const batch of expiredBatches) {
                const pointsToExpire = batch.remainingPoints;

                // 1. Zero out the batch
                batch.remainingPoints = 0;
                await batch.save({ transaction });

                // 2. Create EXPIRE ledger entry
                await PointsLedger.create({
                    userId: batch.userId,
                    type: 'EXPIRE',
                    points: pointsToExpire,
                    remainingPoints: 0,
                    referenceId: batch.id.toString()
                }, { transaction });

                // 3. Update User Balance
                const user = await User.findByPk(batch.userId, { transaction });
                user.availablePoints = Math.max(0, user.availablePoints - pointsToExpire);
                await user.save({ transaction });
            }

            await transaction.commit();
            return expiredBatches.length;
        } catch (error) {
            await transaction.rollback();
            console.error('Points Expiry Job Failed:', error);
            throw error;
        }
    }

    /**
     * Helper to check max redemption allowed
     */
    static async validateRedemption(userId, pointsToRedeem) {
        const config = await this.getConfig();
        const user = await User.findByPk(userId);

        const maxRedeem = Math.floor(user.availablePoints * parseFloat(config.maxRedeemPercentage));

        if (pointsToRedeem > maxRedeem) {
            return {
                valid: false,
                msg: `Maximum allowed redemption is ${maxRedeem} points (${config.maxRedeemPercentage * 100}% of balance).`
            };
        }

        if (pointsToRedeem > user.availablePoints) {
            return { valid: false, msg: 'Insufficient points balance.' };
        }

        return { valid: true };
    }

    /**
     * Get dynamic tier progress for a user
     */
    static async getTierProgress(userId) {
        // Ensure data is fresh
        await this.recalculateBalances(userId);

        const user = await User.findByPk(userId);
        if (!user) throw new Error('User not found');

        const tiers = await LoyaltyTier.findAll({
            order: [['minSpend', 'ASC']]
        });

        const currentSpend = parseFloat(user.yearlySpend);
        let currentTier = null;
        let nextTier = null;

        // Tiers are sorted ASC (minSpend: 0, 100000, 500000, 1000000)
        for (let i = 0; i < tiers.length; i++) {
            if (currentSpend >= parseFloat(tiers[i].minSpend)) {
                currentTier = tiers[i];
                nextTier = tiers[i + 1] || null;
            } else {
                // If we haven't found the current tier yet, the first tier is the target
                if (!currentTier) {
                    currentTier = { name: 'None', minSpend: 0 };
                    nextTier = tiers[0];
                }
                break;
            }
        }

        // Special case: If user spend is less than the lowest tier (though Silver is usually 0)
        if (!currentTier && tiers.length > 0) {
            currentTier = { name: 'None', minSpend: 0 };
            nextTier = tiers[0];
        }

        if (!nextTier) {
            // Highest tier reached
            return {
                currentTier: currentTier.name,
                nextTier: null,
                currentSpend,
                currentThreshold: parseFloat(currentTier.minSpend),
                nextThreshold: null,
                remainingAmount: 0,
                progressPercentage: 100
            };
        }

        const currentThreshold = parseFloat(currentTier.minSpend);
        const nextThreshold = parseFloat(nextTier.minSpend);
        const remainingAmount = Math.max(0, nextThreshold - currentSpend);

        // Progress within the current level jump
        // (currentSpend - currentThreshold) / (nextThreshold - currentThreshold)
        const range = nextThreshold - currentThreshold;
        const progressInRange = currentSpend - currentThreshold;
        const progressPercentage = Math.min(100, Math.max(0, (progressInRange / range) * 100));

        return {
            currentTier: currentTier.name,
            nextTier: nextTier.name,
            currentSpend,
            currentThreshold,
            nextThreshold,
            remainingAmount: Math.ceil(remainingAmount),
            progressPercentage: Math.round(progressPercentage)
        };
    }

    /**
     * Recalculate all user balances and tier from source records
     * Crucial for data consistency when records are modified in DB.
     */
    static async recalculateBalances(userId, transaction = null) {
        const user = await User.findByPk(userId, { transaction });
        if (!user) return null;

        // 1. Calculate Yearly Spend (Current Calendar Year)
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const totalSpend = await Transaction.sum('amount', {
            where: {
                userId,
                createdAt: { [Op.gte]: startOfYear }
            },
            transaction
        }) || 0;

        // 2. Calculate Lifetime Total Points (Sum of all EARN records)
        const totalPoints = await PointsLedger.sum('points', {
            where: {
                userId,
                type: 'EARN'
            },
            transaction
        }) || 0;

        // 3. Calculate Available Points (Sum of all remainingPoints in active/unexpired EARN records)
        const availablePoints = await PointsLedger.sum('remainingPoints', {
            where: {
                userId,
                type: 'EARN',
                remainingPoints: { [Op.gt]: 0 },
                expiresAt: { [Op.gt]: new Date() }
            },
            transaction
        }) || 0;

        // 4. Update User record
        user.yearlySpend = parseFloat(totalSpend);
        user.totalPoints = parseInt(totalPoints);
        user.availablePoints = parseInt(availablePoints);

        // 5. Determine correct tier
        const tiers = await LoyaltyTier.findAll({
            order: [['minSpend', 'DESC']],
            transaction
        });

        let newTier = 'Silver';
        for (const tier of tiers) {
            if (user.yearlySpend >= parseFloat(tier.minSpend)) {
                newTier = tier.name;
                break;
            }
        }
        user.tier = newTier;

        await user.save({ transaction });

        return user;
    }
}

module.exports = LoyaltyService;

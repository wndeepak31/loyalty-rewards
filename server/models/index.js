const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Reward = require('./Reward');
const Redemption = require('./Redemption');
const LoyaltyTier = require('./LoyaltyTier');
const LoyaltyConfig = require('./LoyaltyConfig');
const PointsLedger = require('./PointsLedger');

// Associations
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions', onDelete: 'CASCADE', hooks: true });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

User.hasMany(Redemption, { foreignKey: 'user_id', as: 'redemptions', onDelete: 'CASCADE', hooks: true });
Redemption.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

User.hasMany(PointsLedger, { foreignKey: 'user_id', as: 'ledgerEntries', onDelete: 'CASCADE', hooks: true });
PointsLedger.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Reward.hasMany(Redemption, { foreignKey: 'reward_id', as: 'redemptions' });
Redemption.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });

module.exports = {
    sequelize,
    User,
    Transaction,
    Reward,
    Redemption,
    LoyaltyTier,
    LoyaltyConfig,
    PointsLedger
};

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyTier = sequelize.define('LoyaltyTier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    minSpend: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'min_spend'
    },
    earnRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.10,
        field: 'earn_rate'
    },
    benefits: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'loyalty_tiers',
});

module.exports = LoyaltyTier;

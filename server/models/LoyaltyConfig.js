const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoyaltyConfig = sequelize.define('LoyaltyConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    earnRatePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.10, // 10% default
    },
    expiryMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
    },
    maxRedeemPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.20, // 20% default
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'loyalty_configs',
});

module.exports = LoyaltyConfig;

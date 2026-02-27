const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: { args: [0.01], msg: 'Amount must be greater than 0' },
        },
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: 'Purchase',
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'transactions',
});

/**
 * Calculate points earned from a purchase amount.
 * Rule: 1 point per ₹1000 spent.
 */
Transaction.calculatePoints = function (amount) {
    return Math.floor(parseFloat(amount) / 1000);
};

module.exports = Transaction;

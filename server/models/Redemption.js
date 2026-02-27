const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Redemption = sequelize.define('Redemption', {
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
    rewardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'rewards',
            key: 'id',
        },
    },
    pointsSpent: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'fulfilled', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'redemptions',
});

module.exports = Redemption;

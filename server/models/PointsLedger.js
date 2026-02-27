const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsLedger = sequelize.define('PointsLedger', {
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
    type: {
        type: DataTypes.ENUM('EARN', 'REDEEM', 'EXPIRE'),
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    remainingPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    referenceId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Stores transactionId or redemptionId',
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'points_ledger',
    indexes: [
        {
            fields: ['userId', 'type', 'remainingPoints'],
        },
        {
            fields: ['expiresAt'],
        }
    ]
});

module.exports = PointsLedger;

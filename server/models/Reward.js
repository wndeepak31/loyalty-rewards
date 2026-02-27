const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reward = sequelize.define('Reward', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Reward name is required' },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    pointsCost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: 'Points cost must be at least 1' },
        },
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1, // -1 = unlimited
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'General',
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'rewards',
});

module.exports = Reward;

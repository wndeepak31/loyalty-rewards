const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Name is required' },
            len: { args: [2, 100], msg: 'Name must be 2-100 characters' },
        },
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'Email already registered' },
        validate: {
            isEmail: { msg: 'Must be a valid email' },
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false,
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    availablePoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    tier: {
        type: DataTypes.STRING(20),
        defaultValue: 'Silver',
        allowNull: false,
    },
    yearlySpend: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        allowNull: false,
    },
    lifetimeSpend: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        allowNull: false,
        field: 'lifetime_spend'
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expires'
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
    const user = this.toJSON();
    delete user.password;
    return user;
};

module.exports = User;

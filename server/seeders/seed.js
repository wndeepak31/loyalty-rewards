const { sequelize, User, Reward } = require('../models');
const bcrypt = require('bcryptjs');

const seedConf = {
    admin: {
        name: 'Admin User',
        email: 'admin@loyaltyapp.com',
        password: 'admin123', // Will be hashed by hook
        role: 'admin',
    },
    rewards: [
        {
            name: '$5 Gift Card',
            description: 'Redeem for a $5 gift card',
            pointsCost: 500,
            stock: 100,
            category: 'Gift Cards',
            imageUrl: 'https://via.placeholder.com/150?text=Gift+Card',
        },
        {
            name: '$10 Gift Card',
            description: 'Redeem for a $10 gift card',
            pointsCost: 1000,
            stock: 50,
            category: 'Gift Cards',
            imageUrl: 'https://via.placeholder.com/150?text=Gift+Card',
        },
        {
            name: 'Coffee Mug',
            description: 'Branded premium coffee mug',
            pointsCost: 300,
            stock: 200,
            category: 'Merchandise',
            imageUrl: 'https://via.placeholder.com/150?text=Mug',
        },
        {
            name: 'T-Shirt',
            description: 'Limited edition loyalty member t-shirt',
            pointsCost: 800,
            stock: 75,
            category: 'Merchandise',
            imageUrl: 'https://via.placeholder.com/150?text=T-Shirt',
        },
        {
            name: 'Grand Vacation',
            description: 'Weekend getaway for two',
            pointsCost: 50000,
            stock: 1,
            category: 'Travel',
            imageUrl: 'https://via.placeholder.com/150?text=Vacation',
        },
    ],
};

const seed = async () => {
    try {
        await sequelize.sync({ alter: true });

        // Seed Admin
        const adminExists = await User.findOne({ where: { email: seedConf.admin.email } });
        if (!adminExists) {
            await User.create(seedConf.admin);
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }

        // Seed Rewards
        for (const reward of seedConf.rewards) {
            const rewardExists = await Reward.findOne({ where: { name: reward.name } });
            if (!rewardExists) {
                await Reward.create(reward);
                console.log(`Reward "${reward.name}" created`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();

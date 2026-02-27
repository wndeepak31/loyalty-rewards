const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const { sequelize, LoyaltyTier, LoyaltyConfig } = require('./models');
const startExpiryJob = require('./cron/loyaltyCron');

// ✅ Import all routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const rewardRoutes = require('./routes/rewards');
const redemptionRoutes = require('./routes/redemptions');
const adminRoutes = require('./routes/admin');
const loyaltyRoutes = require('./routes/loyalty');

const app = express();
const PORT = process.env.PORT || 5000;

// Export the app for Vercel
module.exports = app;

// ✅ Middleware
app.use(cors());
app.use(express.json());


// ✅ Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL
    });
});

app.get('/api/db-check', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'connected', message: 'Database connection successful' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// ✅ Database initialization
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        // Only sync in development or if explicitly requested via env
        if (process.env.NODE_ENV === 'development' || process.env.FORCE_DB_SYNC === 'true') {
            await sequelize.sync({ alter: true });
            console.log('Database synced');

            // Seed Default Configuration
            const configCount = await LoyaltyConfig.count();
            if (configCount === 0) {
                await LoyaltyConfig.create({
                    earnRatePercentage: 0.10,
                    expiryMonths: 18,
                    maxRedeemPercentage: 0.25
                });
                console.log('Default loyalty configuration seeded');
            }

            // Seed Default Tiers
            const tierCount = await LoyaltyTier.count();
            if (tierCount === 0) {
                await LoyaltyTier.bulkCreate([
                    {
                        name: 'Silver',
                        minSpend: 0,
                        earnRate: 0.10,
                        benefits: { list: ['Earn 10% points', 'Basic rewards access', 'Standard support'], icon: 'S' }
                    },
                    {
                        name: 'Gold',
                        minSpend: 100000,
                        earnRate: 0.15,
                        benefits: { list: ['Earn 15% points', 'Priority redemptions', 'Birthday exclusive'], icon: 'G' }
                    },
                    {
                        name: 'Platinum',
                        minSpend: 500000,
                        earnRate: 0.20,
                        benefits: { list: ['Earn 20% points', 'Concierge service', 'Private events'], icon: 'P' }
                    },
                    {
                        name: 'Diamond',
                        minSpend: 1000000,
                        earnRate: 0.25,
                        benefits: { list: ['Earn 25% points', 'Unlimited everything', 'Lifetime warranty'], icon: 'D' }
                    }
                ]);
                console.log('Default loyalty tiers seeded');
            }
        }

        // Only start cron in non-production environments (use Vercel Cron for prod)
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            startExpiryJob();
        }

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

// Start initialization in background without blocking
initDb().catch(err => console.error('Background DB Init Error:', err));

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

console.log('[Server] File Loading...');

let express, cors, path;
try {
    express = require('express');
    cors = require('cors');
    path = require('path');
    require('dotenv').config({ path: require('path').join(__dirname, '.env') });
    console.log('[Server] Core modules loaded');
} catch (err) {
    console.error('[Server] FATAL: Core module load failed:', err);
}

let sequelize, LoyaltyTier, LoyaltyConfig, startExpiryJob;
let modelLoadError = null;
try {
    const models = require('./models');
    sequelize = models.sequelize;
    LoyaltyTier = models.LoyaltyTier;
    LoyaltyConfig = models.LoyaltyConfig;
    console.log('[Server] Models loaded');
} catch (err) {
    modelLoadError = err;
    console.error('[Server] FATAL: Models load failed:', err.message, err.stack);
}

try {
    startExpiryJob = require('./cron/loyaltyCron');
    console.log('[Server] Cron loaded');
} catch (err) {
    console.error('[Server] FATAL: Cron load failed:', err);
}

let authRoutes, userRoutes, transactionRoutes, rewardRoutes, redemptionRoutes, adminRoutes, loyaltyRoutes;
try {
    authRoutes = require('./routes/auth');
    userRoutes = require('./routes/users');
    transactionRoutes = require('./routes/transactions');
    rewardRoutes = require('./routes/rewards');
    redemptionRoutes = require('./routes/redemptions');
    adminRoutes = require('./routes/admin');
    loyaltyRoutes = require('./routes/loyalty');
    console.log('[Server] Routes loaded');
} catch (err) {
    console.error('[Server] FATAL: Routes load failed:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Export the app for Vercel
module.exports = app;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.get('/api/health', (req, res) => {
    try {
        console.log('[Health Check] Invoked');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL,
            config: {
                hasDbUrl: !!process.env.DATABASE_URL,
                hasDbHost: !!process.env.DB_HOST,
                hasJwtSecret: !!process.env.JWT_SECRET,
                nodeVersion: process.version
            }
        });
    } catch (err) {
        console.error('[Health Check] Critical Error:', err);
        res.status(500).json({ error: 'Health Check Failed', message: err.message });
    }
});

app.get('/api/db-check', async (req, res) => {
    if (modelLoadError) {
        return res.status(500).json({
            status: 'error',
            phase: 'model_loading',
            message: modelLoadError.message,
            stack: modelLoadError.stack
        });
    }
    try {
        console.log('[DB Check] Attempting authentication...');
        await sequelize.authenticate();
        res.json({
            status: 'connected',
            message: 'Database connection successful',
            hasUrl: !!process.env.DATABASE_URL
        });
    } catch (err) {
        console.error('[DB Check] Failure:', err);
        res.status(500).json({
            status: 'error',
            phase: 'db_connection',
            message: err.message,
            stack: err.stack
        });
    }
});

if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (transactionRoutes) app.use('/api/transactions', transactionRoutes);
if (rewardRoutes) app.use('/api/rewards', rewardRoutes);
if (redemptionRoutes) app.use('/api/redemptions', redemptionRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (loyaltyRoutes) app.use('/api/loyalty', loyaltyRoutes);

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
            if (startExpiryJob) startExpiryJob();
        }

    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};

// Start initialization in background without blocking
const databaseInit = async () => {
    try {
        console.log('[Init] Starting Database Initialization...');
        await initDb();
        console.log('[Init] Database Initialization Complete');
    } catch (err) {
        console.error('[Init] CRITICAL ERROR during startup:', err);
    }
};

databaseInit();

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

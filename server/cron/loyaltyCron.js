const cron = require('node-cron');
const LoyaltyService = require('../services/loyaltyService');

/**
 * Scheduled Job for Points Expiry
 * Runs every day at midnight (00:00)
 */
const startExpiryJob = () => {
    // 0 0 * * * = Midnight every day
    // For testing/demo purposes, we could run it more often, e.g., every hour: 0 * * * *
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily points expiry job...');
        try {
            const expiredCount = await LoyaltyService.expirePoints();
            console.log(`[CRON] Expiry job completed. ${expiredCount} batches processed.`);
        } catch (error) {
            console.error('[CRON] Expiry job failed:', error);
        }
    });

    console.log('[CRON] Points expiry job scheduled (Daily at Midnight).');
};

module.exports = startExpiryJob;

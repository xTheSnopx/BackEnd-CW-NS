const scraperService = require('../services/ScraperService');

// Sync Every 15 minutes (900000 ms)
const SYNC_INTERVAL = 15 * 60 * 1000; 

function startScraperCron() {
    console.log('[Scraper] Background cron initialized.');
    
    // Run immediately on boot
    scraperService.syncData()
        .then(() => console.log('[Scraper] Initial sync completed.'))
        .catch(err => console.error('[Scraper] Initial sync error:', err.message));

    // Schedule running loop
    setInterval(async () => {
        try {
            console.log('[Scraper] Running sync routine...');
            await scraperService.syncData();
            console.log('[Scraper] Sync completed.');
        } catch (err) {
            console.error('[Scraper] Sync interval error:', err.message);
        }
    }, SYNC_INTERVAL);
}

module.exports = startScraperCron;

const scraperService = require('../services/ScraperService');

async function getFirstClan() {
    // Wait for initial scraper to have initialized cachedRankings
    if (!scraperService.getRankings()) {
        await scraperService.syncData();
    }
    const rankings = scraperService.getRankings();
    if (rankings && rankings.clans && rankings.clans.length > 0) {
        console.log(`First Clan: ${rankings.clans[0].name} (ID: ${rankings.clans[0].id})`);
    } else {
        console.log('No clans found in ranking cache.');
    }
}

getFirstClan();

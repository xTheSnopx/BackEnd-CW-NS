const reputationRepository = require('../repositories/ReputationRepository');
const scraperService = require('../services/ScraperService'); // Include Scraper

class DataController {
    constructor() {
        this.reputationRepository = reputationRepository;
        this.scraperService = scraperService;
    }

    async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await this.reputationRepository.getHistory(userId);
            return res.status(200).json(history);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getRankings(req, res) {
        try {
            const rankings = this.scraperService.getRankings();
            if (!rankings) {
                await this.scraperService.syncData();
                return res.status(200).json(this.scraperService.getRankings());
            }
            return res.status(200).json(rankings);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async getClanGains(req, res) {
        try {
            const { clanId } = req.query;
            if (!clanId) return res.status(400).json({ error: 'clanId is required' });

            const gains = await this.reputationRepository.getMemberGains(clanId);
            return res.status(200).json(gains);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DataController(); // Singleton

const https = require('https');
const userRepository = require('../repositories/UserRepository');
const reputationRepository = require('../repositories/ReputationRepository');
const seasonRepository = require('../repositories/SeasonRepository');

class ScraperService {
    constructor() {
        this.dataUrl = 'https://ninjasaga.cc/data/clan_rankings.json';
        this.userRepository = userRepository;
        this.reputationRepository = reputationRepository;
        this.seasonRepository = seasonRepository;
        this.cachedRankings = null; // Memory Cache for frontend lookup
    }

    async syncData() {
        return new Promise((resolve, reject) => {
            https.get(this.dataUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', async () => {
                    try {
                        const parsed = JSON.parse(data);
                        this.cachedRankings = parsed; // Cache it
                        await this.processRankings(parsed);
                        resolve();
                    } catch (err) {
                        console.error('Scraper JSON Error:', err.message);
                        reject(err);
                    }
                });
            }).on('error', (err) => {
                console.error('Scraper Fetch Error:', err.message);
                reject(err);
            });
        });
    }

    async processRankings(data) {
        if (!data || !data.clans) return;

        // Fetch current active season
        let activeSeason = await this.seasonRepository.getActiveSeason();
        const seasonId = activeSeason ? activeSeason.id : null;

        for (const clan of data.clans) {
            if (!clan.member_list) continue;

            for (const member of clan.member_list) {
                // 1. Log to FULL clan analytics table (New)
                try {
                    await this.reputationRepository.logMemberReputation(clan.id, member.name, member.reputation, seasonId);
                } catch (err) {
                    // Silently fail log skips
                }

                // 2. Keep the existing registered user logs
                const localUser = await this.userRepository.findByUsername(member.name);
                if (localUser) {
                    await this.reputationRepository.logReputation(localUser.id, member.reputation, seasonId);
                    console.log(`[Scraper] Logged local rep ${member.reputation} for user ${member.name} (Season: ${seasonId || 'None'})`);
                }
            }
        }
    }

    getRankings() {
        return this.cachedRankings;
    }
}

module.exports = new ScraperService();

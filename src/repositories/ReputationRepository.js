const db = require('../database');

class ReputationRepository {
    constructor() {
        this.db = db;
    }

    async logReputation(userId, points, seasonId = null) {
        const query = 'INSERT INTO reputation_logs (user_id, points, season_id) VALUES ($1, $2, $3) RETURNING id';
        const { rows } = await this.db.query(query, [userId, points, seasonId]);
        return rows[0];
    }

    async getHistory(userId, limit = 100) {
        const query = 'SELECT * FROM reputation_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2';
        const { rows } = await this.db.query(query, [userId, limit]);
        return rows;
    }

    // --- FULL CLAN MEMBER LOGS ---
    async logMemberReputation(clanId, memberName, points, seasonId = null) {
        const query = 'INSERT INTO member_reputation_logs (clan_id, member_name, points, season_id) VALUES ($1, $2, $3, $4) RETURNING id';
        const { rows } = await this.db.query(query, [clanId, memberName, points, seasonId]);
        return rows[0];
    }

    async getMemberGains(clanId) {
        // Adapt ROW_NUMBER() and case logic for PostgreSQL
        const query = `
            SELECT 
                member_name, 
                MAX(CASE WHEN rn = 1 THEN points END) as latest_points,
                MAX(CASE WHEN rn = 2 THEN points END) as prev_points,
                MAX(CASE WHEN rn = 1 THEN timestamp END) as latest_time,
                MAX(CASE WHEN rn = 2 THEN timestamp END) as prev_time
            FROM (
                SELECT 
                    member_name, 
                    points, 
                    timestamp,
                    ROW_NUMBER() OVER(PARTITION BY member_name ORDER BY timestamp DESC) as rn
                FROM member_reputation_logs
                WHERE clan_id = $1
            ) sub
            WHERE rn <= 2
            GROUP BY member_name
        `;
        const { rows } = await this.db.query(query, [clanId]);
        return rows;
    }
}

module.exports = new ReputationRepository(); // Singleton

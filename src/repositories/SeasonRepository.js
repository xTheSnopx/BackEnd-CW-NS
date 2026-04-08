const db = require('../database');

class SeasonRepository {
    constructor() {
        this.db = db;
    }

    async getActiveSeason() {
        const query = 'SELECT * FROM seasons WHERE is_active = true LIMIT 1';
        const { rows } = await this.db.query(query);
        return rows[0];
    }

    async createSeason(name, startDate = new Date(), endDate = null) {
        const query = 'INSERT INTO seasons (name, start_date, end_date, is_active) VALUES ($1, $2, $3, true) RETURNING *';
        const { rows } = await this.db.query(query, [name, startDate, endDate]);
        return rows[0];
    }

    async endAllSeasons() {
        const query = 'UPDATE seasons SET is_active = false, end_date = CURRENT_TIMESTAMP WHERE is_active = true';
        const { rowCount } = await this.db.query(query);
        return rowCount;
    }

    async listSeasons() {
        const query = 'SELECT * FROM seasons ORDER BY start_date DESC';
        const { rows } = await this.db.query(query);
        return rows;
    }
}

module.exports = new SeasonRepository();

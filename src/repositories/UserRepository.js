const db = require('../database');

class UserRepository {
    constructor() {
        this.db = db;
    }

    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await this.db.query(query, [username]);
        return rows[0];
    }

    async create(user) {
        const { username, password, plan_expires_at } = user;
        const query = 'INSERT INTO users (username, password, plan_expires_at) VALUES ($1, $2, $3) RETURNING id, username';
        const { rows } = await this.db.query(query, [username, password, plan_expires_at]);
        return rows[0];
    }

    async updatePlan(id, newExpiration) {
        const query = 'UPDATE users SET plan_expires_at = $1 WHERE id = $2';
        const { rowCount } = await this.db.query(query, [newExpiration, id]);
        return rowCount;
    }
}

module.exports = new UserRepository(); // Singleton instance

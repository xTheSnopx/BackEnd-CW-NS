const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'ninja_saga_cw',
    port: process.env.PGPORT || 5432,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

async function initializeTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Seasons Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS seasons (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                is_active BOOLEAN DEFAULT FALSE,
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                clan_id TEXT,
                member_id TEXT,
                plan_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Reputation Logs Table (Per user, per season)
        await client.query(`
            CREATE TABLE IF NOT EXISTS reputation_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                season_id INTEGER REFERENCES seasons(id),
                points INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Member Reputation Logs (Full clan tracking)
        await client.query(`
            CREATE TABLE IF NOT EXISTS member_reputation_logs (
                id SERIAL PRIMARY KEY,
                clan_id TEXT NOT NULL,
                member_name TEXT NOT NULL,
                season_id INTEGER REFERENCES seasons(id),
                points INTEGER NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query('COMMIT');
        console.log('PostgreSQL tables initialized or verified.');

        // Initialize first season if empty
        const seasonCheck = await client.query('SELECT COUNT(*) FROM seasons');
        if (parseInt(seasonCheck.rows[0].count) === 0) {
            await client.query("INSERT INTO seasons (name, is_active) VALUES ('Season 3', true)");
            console.log('Default Season 3 initialized.');
        }

        // Initialize default admin user if empty
        const userCheck = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCheck.rows[0].count) === 0) {
            const adminHash = '$2a$10$2OtL/4GCrV2cOu3NEKUpU.QpPUZS1ZpNT2JNpc/uVhSeDEiz/r/m2';
            await client.query(
                "INSERT INTO users (username, password, plan_expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '10 years')",
                ['admin', adminHash]
            );
            console.log('Default admin user activated.');
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error initializing PostgreSQL tables:', err.message);
    } finally {
        client.release();
    }
}

// Initialize tables on startup
initializeTables().catch(err => console.error('Immediate initialization error:', err));

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};

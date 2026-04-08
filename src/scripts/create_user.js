const bcrypt = require('bcryptjs');
const db = require('../database');

async function createTestUser() {
    const username = 'destra';
    const password = 'espiritulatino'; // Using the user's provided pass for familiarity

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Plan expires in 30 days
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        db.serialize(() => {
            const stmt = db.prepare('INSERT OR REPLACE INTO users (username, password, plan_expires_at) VALUES (?, ?, ?)');
            stmt.run(username, hashedPassword, expirationDate.toISOString(), function(err) {
                if (err) {
                    console.error('Error inserting user:', err.message);
                } else {
                    console.log(`✅ Test User Created!`);
                    console.log(`User: ${username}`);
                    console.log(`Pass: ${password}`);
                    console.log(`Plan Expires: ${expirationDate.toLocaleDateString()}`);
                }
            });
            stmt.finalize();
            
            // Add a mock reputation log just to test the DB connection
            db.run('INSERT INTO reputation_logs (user_id, points) VALUES (1, 45038)');
        });

    } catch (err) {
        console.error('Error creating user:', err.message);
    }
}

// Wait a moment for tables to initialize from database.js
setTimeout(createTestUser, 1000);

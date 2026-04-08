const db = require('../database');

function createMockMemberLogs() {
    const clanId = '25'; // Shadow Ninjas ID
    const members = ['Shodaime', 'Kyo', 'SAGA x Jack', 'GA Hardz'];

    db.serialize(() => {
        const stmt = db.prepare('INSERT INTO member_reputation_logs (clan_id, member_name, points, timestamp) VALUES (?, ?, ?, ?)');
        
        const now = new Date();
        const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

        members.forEach((name, index) => {
            const basePoints = 50000 + (index * 5000);
            
            // 1. Log 30 mins ago (Previous)
            stmt.run(clanId, name, basePoints, thirtyMinsAgo.toISOString());

            // 2. Log Now (Latest) (Add some increases)
            const increase = 150 + (Math.floor(Math.random() * 200));
            stmt.run(clanId, name, basePoints + increase, now.toISOString());
            
            console.log(`[Mock] Inserted 2 snapshots for ${name} (+${increase} pts)`);
        });

        stmt.finalize();
    });
}

// Wait to guarantee tables run
setTimeout(createMockMemberLogs, 1000);

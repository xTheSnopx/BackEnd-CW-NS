const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../src/database.sqlite');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  const username = 'Destra';
  const password = 'espiritulatino';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const planExpiresAt = new Date();
  planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);

  const insertUser = () => {
    const sql = 'INSERT INTO users (username, password, plan_expires_at) VALUES (?, ?, ?)';
    db.run(sql, [username, hashedPassword, planExpiresAt.toISOString()], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('has no column')) {
            db.run("ALTER TABLE users ADD COLUMN plan_expires_at DATETIME", () => {
                db.run('UPDATE users SET password = ?, plan_expires_at = ? WHERE username = ?', [hashedPassword, planExpiresAt.toISOString(), username], () => {
                   console.log('Successfully updated Destra account after ALTER.');
                });
            });
            db.run('UPDATE users SET password = ?, plan_expires_at = ? WHERE username = ?', [hashedPassword, planExpiresAt.toISOString(), username], () => {
                console.log('Successfully updated Destra account.');
            });
        } else {
            console.error('Error inserting:', err);
        }
      } else {
        console.log('Successfully created account: ' + username);
      }
    });
  };

  insertUser();
}

createAdmin();

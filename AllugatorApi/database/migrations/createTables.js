const db = require('../config/database.js');

const createTables = async () => {
    try {
        // Users Table
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phoneNumber TEXT,
                password TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Tables created successfully! ✨');
    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        db.close();
    }
};

createTables();
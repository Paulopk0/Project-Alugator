const db = require('../config/database.js');

const createTables = async () => {
    try {
        // Users Table
        await new Promise((resolve, reject) => {
            db.get(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
                (err, row) => {
                    if (err) {
                        console.error('❌ Erro ao verificar existência da tabela users:', err);
                        return reject(err);
                    }

                    if (row) {
                        return resolve();
                    }

                    db.run(
                        `CREATE TABLE users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            email TEXT UNIQUE NOT NULL,
                            phoneNumber TEXT,
                            password TEXT NOT NULL,
                            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                        )`, (err) => {
                            if (err) {
                                console.error('❌ Erro ao criar tabela users:', err);
                                reject(err);
                            } else {
                                console.log('✅ Tabela users criada');
                                resolve();
                            }
                        }
                    );
                }
            );
        });

        // Items Table (para aluguel)
        await new Promise((resolve, reject) => {
            db.get(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='items'`,
                (err, row) => {
                    if (err) {
                        console.error('❌ Erro ao verificar existência da tabela items:', err);
                        return reject(err);
                    }

                    if (row) {
                        return resolve();
                    }

                    db.run(`
                        CREATE TABLE IF NOT EXISTS items (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            ownerId INTEGER NOT NULL,
                            title TEXT NOT NULL,
                            priceDaily REAL NOT NULL,
                            description TEXT,
                            category TEXT NOT NULL,
                            condition TEXT NOT NULL,
                            photos TEXT,
                            publishDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                            location TEXT,
                            status TEXT DEFAULT 'available',
                            securityDeposit REAL DEFAULT 0,
                            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
                        )`, (err) => {
                            if (err) {
                                console.error('❌ Erro ao criar tabela items:', err);
                                reject(err);
                            } else {
                                console.log('✅ Tabela items criada');
                                resolve();
                            }
                        }
                    );
                }
            )
        });

        // Favorites Table (favoritos)
        await new Promise((resolve, reject) => {
            db.get(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='favorites'`,
                (err, row) => {
                    if (err) {
                        console.error('❌ Erro ao verificar existência da tabela favorites:', err);
                        return reject(err);
                    }

                    if (row) {
                        return resolve();
                    }
                    db.run(`
                        CREATE TABLE IF NOT EXISTS favorites (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            userId INTEGER NOT NULL,
                            itemId INTEGER NOT NULL,
                            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
                            UNIQUE(userId, itemId)
                        )`, (err) => {
                            if (err) {
                                console.error('❌ Erro ao criar tabela favorites:', err);
                                reject(err);
                            } else {
                                console.log('✅ Tabela favorites criada');
                                resolve();
                            }
                        }
                    );
                }
            )
        });

        // Rentals Table (aluguéis/reservas)
        await new Promise((resolve, reject) => {
            db.get(
                `SELECT name FROM sqlite_master WHERE type='table' AND name='rentals'`,
                (err, row) => {
                    if (err) {
                        console.error('❌ Erro ao verificar existência da tabela rentals:', err);
                        return reject(err);
                    }

                    if (row) {
                        return resolve();
                    }

                    db.run(`
                        CREATE TABLE IF NOT EXISTS rentals (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            itemId INTEGER NOT NULL,
                            renterId INTEGER NOT NULL,
                            startDate DATETIME NOT NULL,
                            endDate DATETIME NOT NULL,
                            days INTEGER NOT NULL,
                            pricePerDay REAL NOT NULL,
                            totalPrice REAL NOT NULL,
                            status TEXT DEFAULT 'pending',
                            paymentStatus TEXT DEFAULT 'pending',
                            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
                            FOREIGN KEY (renterId) REFERENCES users(id) ON DELETE CASCADE
                        )`, (err) => {
                            if (err) {
                                console.error('❌ Erro ao criar tabela rentals:', err);
                                reject(err);
                            } else {
                                console.log('✅ Tabela rentals criada');
                                resolve();
                            }
                        }
                    );
                }
            )
        });
    } catch (error) {
        console.error('💥 Erro crítico na criação de tabelas:', error);
        process.exit(1);
    }
};

module.exports = createTables;
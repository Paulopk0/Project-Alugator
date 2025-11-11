const db = require('../config/database.js');

const createTables = async () => {
    try {
        // Users Table
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    phoneNumber TEXT,
                    password TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela users:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela users criada');
                    resolve();
                }
            });
        });

        // Items Table (para aluguel)
        await new Promise((resolve, reject) => {
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
                    status TEXT DEFAULT 'Disponível',
                    securityDeposit REAL DEFAULT 0,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela items:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela items criada');
                    resolve();
                }
            });
        });

        // Rentals Table (histórico de aluguéis)
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS rentals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    itemId INTEGER NOT NULL,
                    renterId INTEGER NOT NULL,
                    startDate DATETIME NOT NULL,
                    endDate DATETIME NOT NULL,
                    totalPrice REAL NOT NULL,
                    status TEXT DEFAULT 'Pendente',
                    paymentStatus TEXT DEFAULT 'Aguardando',
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
                    FOREIGN KEY (renterId) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela rentals:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela rentals criada');
                    resolve();
                }
            });
        });

        // Reviews Table (avaliações)
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    itemId INTEGER NOT NULL,
                    userId INTEGER NOT NULL,
                    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                    comment TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
                    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela reviews:', err);
                    reject(err);
                } else {
                    console.log('✅ Tabela reviews criada');
                    resolve();
                }
            });
        });

        console.log('✨ Todas as tabelas foram criadas com sucesso!');
    } catch (error) {
        console.error('💥 Erro crítico na criação de tabelas:', error);
        process.exit(1);
    }
};

createTables();
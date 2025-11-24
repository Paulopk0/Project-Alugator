const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');

if (!fs.existsSync(path.dirname(dbPath))) {
    console.log('Criando banco de dados SQLite.')
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        fs.writeFileSync(dbPath, '');
        console.log('Banco de dados criado!')
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
});

module.exports = db;
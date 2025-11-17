const db = require('../config/database');

/**
 * Migration: Criar tabela de códigos de recuperação de senha
 * 
 * Tabela: password_reset_codes
 * - id: INTEGER PRIMARY KEY AUTOINCREMENT
 * - userId: INTEGER NOT NULL (FK para users.id)
 * - code: TEXT NOT NULL (código de 6 dígitos)
 * - expiresAt: DATETIME NOT NULL
 * - used: INTEGER DEFAULT 0 (0 = não usado, 1 = usado)
 * - createdAt: DATETIME DEFAULT CURRENT_TIMESTAMP
 */

const createPasswordResetTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS password_reset_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            code TEXT NOT NULL,
            expiresAt DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    return new Promise((resolve, reject) => {
        db.run(sql, (err) => {
            if (err) {
                console.error('❌ Erro ao criar tabela password_reset_codes:', err);
                reject(err);
            } else {
                console.log('✅ Tabela password_reset_codes criada com sucesso');
                resolve();
            }
        });
    });
};

// Executar migration se chamado diretamente
if (require.main === module) {
    createPasswordResetTable()
        .then(() => {
            console.log('Migration concluída!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Migration falhou:', err);
            process.exit(1);
        });
}

module.exports = { createPasswordResetTable };

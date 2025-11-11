const db = require('../database/config/database.js');

class FavoriteService {
    /**
     * Adiciona um item aos favoritos do usuário
     */
    async addFavorite(userId, itemId) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO favorites (userId, itemId) VALUES (?, ?)';
            
            db.run(sql, [userId, itemId], function(err) {
                if (err) {
                    // Erro de UNIQUE constraint (item já está nos favoritos)
                    if (err.message.includes('UNIQUE')) {
                        reject({
                            status: 400,
                            message: 'Item já está nos favoritos'
                        });
                        return;
                    }
                    
                    console.error('Erro ao adicionar favorito:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao adicionar favorito'
                    });
                    return;
                }
                
                resolve({
                    status: 201,
                    message: 'Item adicionado aos favoritos!',
                    favoriteId: this.lastID
                });
            });
        });
    }

    /**
     * Remove um item dos favoritos do usuário
     */
    async removeFavorite(userId, itemId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM favorites WHERE userId = ? AND itemId = ?';
            
            db.run(sql, [userId, itemId], function(err) {
                if (err) {
                    console.error('Erro ao remover favorito:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao remover favorito'
                    });
                    return;
                }
                
                if (this.changes === 0) {
                    reject({
                        status: 404,
                        message: 'Favorito não encontrado'
                    });
                    return;
                }
                
                resolve({
                    status: 200,
                    message: 'Item removido dos favoritos!'
                });
            });
        });
    }

    /**
     * Lista todos os favoritos do usuário com detalhes dos itens
     */
    async getUserFavorites(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    favorites.id as favoriteId,
                    favorites.createdAt as favoritedAt,
                    items.*,
                    users.name as ownerName,
                    users.email as ownerEmail
                FROM favorites
                INNER JOIN items ON favorites.itemId = items.id
                LEFT JOIN users ON items.ownerId = users.id
                WHERE favorites.userId = ?
                ORDER BY favorites.createdAt DESC
            `;
            
            db.all(sql, [userId], (err, favorites) => {
                if (err) {
                    console.error('Erro ao buscar favoritos:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar favoritos'
                    });
                    return;
                }
                
                // Parse photos
                const favoritesWithPhotos = favorites.map(fav => ({
                    ...fav,
                    photos: this._parsePhotos(fav.photos)
                }));
                
                resolve({
                    status: 200,
                    favorites: favoritesWithPhotos
                });
            });
        });
    }

    /**
     * Verifica se um item está nos favoritos do usuário
     */
    async isFavorite(userId, itemId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id FROM favorites WHERE userId = ? AND itemId = ?';
            
            db.get(sql, [userId, itemId], (err, row) => {
                if (err) {
                    console.error('Erro ao verificar favorito:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao verificar favorito'
                    });
                    return;
                }
                
                resolve({
                    status: 200,
                    isFavorite: !!row
                });
            });
        });
    }

    /**
     * Retorna os IDs dos itens favoritados pelo usuário
     */
    async getUserFavoriteIds(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT itemId FROM favorites WHERE userId = ?';
            
            db.all(sql, [userId], (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar IDs de favoritos:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar favoritos'
                    });
                    return;
                }
                
                const itemIds = rows.map(row => row.itemId);
                
                resolve({
                    status: 200,
                    favoriteIds: itemIds
                });
            });
        });
    }

    /**
     * Helper para parsear fotos
     */
    _parsePhotos(photosData) {
        if (!photosData) return [];
        try {
            return JSON.parse(photosData);
        } catch (e) {
            return [photosData];
        }
    }
}

module.exports = new FavoriteService();

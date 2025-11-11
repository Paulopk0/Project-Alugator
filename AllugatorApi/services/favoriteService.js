const db = require('../database/config/database.js');

/**
 * FavoriteService
 * 
 * Service responsável pela lógica de negócio dos favoritos.
 * Gerencia a relação muitos-para-muitos entre usuários e itens através da tabela 'favorites'.
 * 
 * Funcionalidades:
 * - Adicionar item aos favoritos
 * - Remover item dos favoritos
 * - Listar favoritos do usuário (com detalhes dos itens)
 * - Buscar apenas IDs dos favoritos (para verificação rápida)
 * 
 * Estrutura do banco (tabela favorites):
 * - id: INTEGER PRIMARY KEY
 * - userId: INTEGER (FK para users)
 * - itemId: INTEGER (FK para items)
 * - createdAt: DATETIME
 * - UNIQUE (userId, itemId) - Impede favoritar o mesmo item 2x
 */
class FavoriteService {
    /**
     * addFavorite - Adiciona um item aos favoritos do usuário
     * 
     * Cria um novo registro na tabela 'favorites' vinculando o usuário ao item.
     * Se o item já estiver nos favoritos, retorna erro 400 (devido à constraint UNIQUE).
     * 
     * @param {number} userId - ID do usuário que está favoritando
     * @param {number} itemId - ID do item a ser favoritado
     * @returns {Promise<Object>} Objeto com status 201 e ID do favorito criado
     * 
     * @throws {Object} Status 400 se item já está nos favoritos
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @example
     * addFavorite(1, 5)
     * // Retorna: { status: 201, message: 'Item adicionado aos favoritos!', favoriteId: 10 }
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
     * removeFavorite - Remove um item dos favoritos do usuário
     * 
     * Deleta o registro da tabela 'favorites' que vincula o usuário ao item.
     * Se o favorito não existir, retorna erro 404.
     * 
     * SQL: DELETE FROM favorites WHERE userId = ? AND itemId = ?
     * 
     * @param {number} userId - ID do usuário
     * @param {number} itemId - ID do item a ser removido dos favoritos
     * @returns {Promise<Object>} Objeto com status 200 e mensagem de sucesso
     * 
     * @throws {Object} Status 404 se favorito não encontrado
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @note Usa this.changes para verificar se algum registro foi deletado
     * 
     * @example
     * removeFavorite(1, 5)
     * // Retorna: { status: 200, message: 'Item removido dos favoritos!' }
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
     * getUserFavorites - Lista todos os favoritos do usuário com detalhes completos dos itens
     * 
     * Retorna lista completa de itens favoritados pelo usuário, incluindo:
     * - Dados do favorito (id, data de criação)
     * - Dados completos do item (título, descrição, preço, categoria, condição, fotos, etc.)
     * - Dados do proprietário do item (nome, email)
     * 
     * SQL: Faz JOIN de 3 tabelas:
     * - favorites (tabela pivot)
     * - items (dados do item)
     * - users (dados do proprietário)
     * 
     * Ordenação: Por data de adição aos favoritos (mais recentes primeiro)
     * 
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Objeto com status 200 e array de favoritos
     * 
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @note Cada item retornado inclui campos do item, do favorito e do proprietário
     * @note Photos são processadas pelo helper _attachPhotosToItems()
     * 
     * @example
     * getUserFavorites(1)
     * // Retorna: {
     * //   status: 200,
     * //   favorites: [
     * //     {
     * //       favoriteId: 5,
     * //       favoritedAt: '2024-01-01 10:00:00',
     * //       id: 10,
     * //       title: 'Furadeira',
     * //       priceDaily: 25,
     * //       ownerName: 'João Silva',
     * //       ...
     * //     }
     * //   ]
     * // }
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
     * isFavorite - Verifica se um item específico está nos favoritos do usuário
     * 
     * Consulta simples que retorna true/false indicando se existe um registro
     * na tabela 'favorites' vinculando o usuário ao item.
     * 
     * SQL: SELECT id FROM favorites WHERE userId = ? AND itemId = ?
     * 
     * @param {number} userId - ID do usuário
     * @param {number} itemId - ID do item a ser verificado
     * @returns {Promise<Object>} Objeto com status 200 e boolean isFavorite
     * 
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @note Usa !!row para converter resultado em boolean (true se encontrou, false se não)
     * @note Esta função é mais leve que getUserFavorites quando só precisa verificar um item
     * 
     * @example
     * isFavorite(1, 5)
     * // Retorna: { status: 200, isFavorite: true }
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
     * getUserFavoriteIds - Retorna apenas os IDs dos itens favoritados pelo usuário
     * 
     * Versão otimizada que retorna APENAS os IDs dos itens, sem fazer JOINs.
     * Muito mais rápido que getUserFavorites quando só precisa dos IDs para verificação.
     * 
     * Usado principalmente no frontend para:
     * - Marcar itens como favoritados na listagem (ícone de coração preenchido)
     * - Verificar múltiplos itens de uma vez
     * 
     * SQL: SELECT itemId FROM favorites WHERE userId = ?
     * (Sem JOINs, apenas a tabela favorites)
     * 
     * @param {number} userId - ID do usuário
     * @returns {Promise<Object>} Objeto com status 200 e array de IDs
     * 
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @note Retorna array vazio [] se usuário não tem favoritos
     * @note Usa map() para extrair apenas o campo itemId de cada registro
     * 
     * @example
     * getUserFavoriteIds(1)
     * // Retorna: { status: 200, favoriteIds: [5, 10, 12, 18] }
     * 
     * @example
     * // Uso no frontend:
     * const { favoriteIds } = await fetchFavoriteIds();
     * const isFavorited = favoriteIds.includes(item.id);
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
     * _parsePhotos - Helper privado para processar campo 'photos' do banco
     * 
     * Converte o campo 'photos' armazenado no banco de dados para formato de array.
     * O banco pode armazenar photos de 3 formas:
     * 1. String JSON: '["foto1", "foto2"]' → Parse para array
     * 2. String simples: 'foto1' → Converte para array ['foto1']
     * 3. null/undefined → Retorna array vazio []
     * 
     * @param {string|null} photosData - Dados do campo 'photos' do banco
     * @returns {Array<string>} Array de nomes de fotos
     * 
     * @private
     * @note Usa try/catch para lidar com JSON inválido
     * @note Prefixo '_' indica que é método privado (convenção)
     * 
     * @example
     * _parsePhotos('["furadeira1", "furadeira2"]')
     * // Retorna: ['furadeira1', 'furadeira2']
     * 
     * @example
     * _parsePhotos('default')
     * // Retorna: ['default']
     * 
     * @example
     * _parsePhotos(null)
     * // Retorna: []
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

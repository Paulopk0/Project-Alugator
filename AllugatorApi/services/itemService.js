const db = require('../database/config/database.js');

class ItemService {
    /**
     * Cria um novo item para aluguel
     */
    async createItem(itemData) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO items 
                (ownerId, title, priceDaily, description, category, condition, photos, location, status, securityDeposit) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            const params = [
                itemData.ownerId,
                itemData.title,
                itemData.priceDaily,
                itemData.description,
                itemData.category,
                itemData.condition,
                JSON.stringify(itemData.photos || []),
                itemData.location,
                itemData.status || 'Disponível',
                itemData.securityDeposit || 0
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Erro ao criar item:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao criar item'
                    });
                    return;
                }
                
                resolve({
                    status: 201,
                    message: 'Item criado com sucesso!',
                    itemId: this.lastID
                });
            });
        });
    }

    /**
     * Busca todos os itens disponíveis
     */
    async getAllAvailableItems(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT 
                items.*,
                users.name as ownerName,
                users.email as ownerEmail
                FROM items 
                LEFT JOIN users ON items.ownerId = users.id
                WHERE items.status = 'Disponível'`;
            
            const params = [];

            // Filtro de busca por texto (título ou descrição)
            if (filters.searchText && filters.searchText.trim()) {
                sql += ' AND (items.title LIKE ? OR items.description LIKE ?)';
                const searchParam = `%${filters.searchText.trim()}%`;
                params.push(searchParam, searchParam);
            }

            // Filtros opcionais
            if (filters.category) {
                sql += ' AND items.category = ?';
                params.push(filters.category);
            }

            if (filters.minPrice) {
                sql += ' AND items.priceDaily >= ?';
                params.push(filters.minPrice);
            }

            if (filters.maxPrice) {
                sql += ' AND items.priceDaily <= ?';
                params.push(filters.maxPrice);
            }

            if (filters.location) {
                sql += ' AND items.location LIKE ?';
                params.push(`%${filters.location}%`);
            }

            // Filtro de data - verifica se o item está disponível na data solicitada
            // Nota: Isso requer uma tabela de agendamentos/reservas para funcionar corretamente
            // Por enquanto, vamos apenas aceitar o parâmetro mas não filtrar
            // TODO: Implementar verificação de disponibilidade por data quando houver tabela de reservas
            
            // Filtro de período do dia (timeFilter: 'Manhã', 'Tarde', 'Noite')
            // Nota: Isso também requer dados de disponibilidade de horário nos itens
            // Por enquanto, vamos apenas aceitar o parâmetro
            // TODO: Implementar filtro de período quando houver campo de horários disponíveis

            sql += ' ORDER BY items.createdAt DESC';

            db.all(sql, params, (err, items) => {
                if (err) {
                    console.error('Erro ao buscar itens:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar itens'
                    });
                    return;
                }

                // Parse photos: se for JSON array válido faz parse, senão trata como string simples
                const itemsWithPhotos = this._attachPhotosToItems(items);

                resolve({
                    status: 200,
                    items: itemsWithPhotos
                });
                            });
                        });
                    }

                    /**
                     * Helper para parsear fotos de um item
                     */
                    _parsePhotos(photosData) {
                        if (!photosData) return [];
                        try {
                            return JSON.parse(photosData);
                        } catch (e) {
                            return [photosData];
                        }
                    }

                    /**
                     * Helper para anexar fotos parseadas a itens
                     */
                    _attachPhotosToItems(items) {
                        return items.map(item => ({
                            ...item,
                            photos: this._parsePhotos(item.photos)
                        }));
                    }

                    /**
                     * Busca um item específico por ID
                     */
                    async getItemById(itemId) {
                        return new Promise((resolve, reject) => {
                            const sql = `SELECT 
                                items.*,
                                users.name as ownerName,
                                users.email as ownerEmail,
                                users.phoneNumber as ownerPhone
                                FROM items 
                                LEFT JOIN users ON items.ownerId = users.id
                                WHERE items.id = ?`;

            db.get(sql, [itemId], (err, item) => {
                if (err) {
                    console.error('Erro ao buscar item:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar item'
                    });
                    return;
                }

                if (!item) {
                    reject({
                        status: 404,
                        message: 'Item não encontrado'
                    });
                    return;
                }

                // Parse photos com fallback para string simples
                let photos = [];
                if (item.photos) {
                    try {
                        photos = JSON.parse(item.photos);
                    } catch (e) {
                        photos = [item.photos];
                    }
                }

                resolve({
                    status: 200,
                    item: {
                        ...item,
                        photos
                    }
                });
            });
        });
    }

    /**
     * Busca itens de um proprietário específico
     */
    async getItemsByOwner(ownerId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM items WHERE ownerId = ? ORDER BY createdAt DESC';

            db.all(sql, [ownerId], (err, items) => {
                if (err) {
                    console.error('Erro ao buscar itens do proprietário:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar itens'
                    });
                    return;
                }

                const itemsWithPhotos = items.map(item => {
                    let photos = [];
                    if (item.photos) {
                        try {
                            photos = JSON.parse(item.photos);
                        } catch (e) {
                            photos = [item.photos];
                        }
                    }
                    return {
                        ...item,
                        photos
                    };
                });

                resolve({
                    status: 200,
                    items: itemsWithPhotos
                });
            });
        });
    }

    /**
     * Atualiza um item
     */
    async updateItem(itemId, itemData, ownerId) {
        return new Promise((resolve, reject) => {
            // Verifica se o item pertence ao usuário
            db.get('SELECT ownerId FROM items WHERE id = ?', [itemId], (err, item) => {
                if (err || !item) {
                    reject({
                        status: 404,
                        message: 'Item não encontrado'
                    });
                    return;
                }

                if (item.ownerId !== ownerId) {
                    reject({
                        status: 403,
                        message: 'Você não tem permissão para editar este item'
                    });
                    return;
                }

                const sql = `UPDATE items SET 
                    title = ?,
                    priceDaily = ?,
                    description = ?,
                    category = ?,
                    condition = ?,
                    photos = ?,
                    location = ?,
                    status = ?,
                    securityDeposit = ?,
                    updatedAt = CURRENT_TIMESTAMP
                    WHERE id = ?`;

                const params = [
                    itemData.title,
                    itemData.priceDaily,
                    itemData.description,
                    itemData.category,
                    itemData.condition,
                    JSON.stringify(itemData.photos || []),
                    itemData.location,
                    itemData.status,
                    itemData.securityDeposit,
                    itemId
                ];

                db.run(sql, params, (err) => {
                    if (err) {
                        console.error('Erro ao atualizar item:', err);
                        reject({
                            status: 500,
                            message: 'Erro ao atualizar item'
                        });
                        return;
                    }

                    resolve({
                        status: 200,
                        message: 'Item atualizado com sucesso!'
                    });
                });
            });
        });
    }

    /**
     * Deleta um item
     */
    async deleteItem(itemId, ownerId) {
        return new Promise((resolve, reject) => {
            // Verifica se o item pertence ao usuário
            db.get('SELECT ownerId FROM items WHERE id = ?', [itemId], (err, item) => {
                if (err || !item) {
                    reject({
                        status: 404,
                        message: 'Item não encontrado'
                    });
                    return;
                }

                if (item.ownerId !== ownerId) {
                    reject({
                        status: 403,
                        message: 'Você não tem permissão para deletar este item'
                    });
                    return;
                }

                db.run('DELETE FROM items WHERE id = ?', [itemId], (err) => {
                    if (err) {
                        console.error('Erro ao deletar item:', err);
                        reject({
                            status: 500,
                            message: 'Erro ao deletar item'
                        });
                        return;
                    }

                    resolve({
                        status: 200,
                        message: 'Item deletado com sucesso!'
                    });
                });
            });
        });
    }

    /**
     * Busca itens por categoria
     */
    async getItemsByCategory(category) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
                items.*,
                users.name as ownerName
                FROM items 
                LEFT JOIN users ON items.ownerId = users.id
                WHERE items.category = ? AND items.status = 'Disponível'
                ORDER BY items.createdAt DESC`;

            db.all(sql, [category], (err, items) => {
                if (err) {
                    console.error('Erro ao buscar itens por categoria:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar itens'
                    });
                    return;
                }

                const itemsWithPhotos = items.map(item => {
                    let photos = [];
                    if (item.photos) {
                        try {
                            photos = JSON.parse(item.photos);
                        } catch (e) {
                            photos = [item.photos];
                        }
                    }
                    return {
                        ...item,
                        photos
                    };
                });

                resolve({
                    status: 200,
                    items: itemsWithPhotos
                });
            });
        });
    }
}

module.exports = new ItemService();

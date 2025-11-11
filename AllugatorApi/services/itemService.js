/**
 * ItemService - Camada de serviço para itens
 * 
 * Contém toda a lógica de negócio relacionada a itens:
 * - Validações de dados
 * - Interações com banco de dados SQLite
 * - Transformação de dados (parse de fotos, etc.)
 * - Aplicação de filtros de busca
 * 
 * Esta camada isola a lógica de negócio dos controllers,
 * facilitando manutenção e testes.
 */

const db = require('../database/config/database.js');

class ItemService {
    /**
     * Cria um novo item para aluguel no banco de dados
     * 
     * @param {Object} itemData - Dados do item
     * @param {number} itemData.ownerId - ID do proprietário (usuário logado)
     * @param {string} itemData.title - Título do item
     * @param {number} itemData.priceDaily - Preço por dia
     * @param {string} itemData.description - Descrição detalhada
     * @param {string} itemData.category - Categoria (ex: 'Ferramentas')
     * @param {string} itemData.condition - Condição (ex: 'Excelente', 'Bom')
     * @param {string} itemData.photos - Nome da foto ou JSON array
     * @param {string} itemData.location - Localização
     * @param {number} itemData.securityDeposit - Caução (padrão: 0)
     * 
     * @returns {Promise<Object>} Resultado com status e ID do item criado
     * 
     * @note Item é criado automaticamente com status 'available'
     * @note publishDate é preenchido automaticamente (CURRENT_TIMESTAMP)
     */
    async createItem(itemData) {
        return new Promise((resolve, reject) => {
            console.log('📦 Criando item com dados:', itemData);
            
            // Query SQL para inserção
            // publishDate e createdAt são preenchidos automaticamente pelo banco
            const sql = `INSERT INTO items 
                (ownerId, title, priceDaily, description, category, condition, photos, location, status, securityDeposit) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            // Monta array de parâmetros na ordem dos ?
            const params = [
                itemData.ownerId,
                itemData.title,
                itemData.priceDaily,
                itemData.description,
                itemData.category,
                itemData.condition,
                itemData.photos || 'default', // 'default' se não fornecido
                itemData.location,
                'available',                   // Status padrão ao criar
                itemData.securityDeposit || 0  // 0 se não fornecido
            ];

            console.log('📝 SQL INSERT:', sql);
            console.log('📌 Params:', params);

            // Executa INSERT no banco
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Erro ao criar item:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao criar item'
                    });
                    return;
                }
                
                console.log('✅ Item criado com ID:', this.lastID);
                
                // Retorna sucesso com ID do item criado
                resolve({
                    status: 201,
                    message: 'Item criado com sucesso!',
                    data: {
                        id: this.lastID,
                        itemId: this.lastID
                    }
                });
            });
        });
    }

    /**
     * Busca todos os itens disponíveis com filtros opcionais
     * 
     * @param {Object} filters - Filtros de busca (todos opcionais)
     * @param {string} filters.title - Busca parcial no título (LIKE %title%)
     * @param {string} filters.category - Busca exata por categoria
     * @param {string} filters.condition - Busca exata por condição
     * @param {string} filters.publishDate - Data de publicação (>= data)
     * @param {number} filters.minPrice - Preço mínimo
     * @param {number} filters.maxPrice - Preço máximo
     * @param {string} filters.location - Busca parcial na localização
     * 
     * @returns {Promise<Object>} Lista de itens encontrados
     * 
     * @note Apenas retorna itens com status = 'available'
     * @note Faz JOIN com tabela users para incluir ownerName e ownerEmail
     * @note Resultados ordenados por data de criação (mais recentes primeiro)
     * 
     * @example
     * // Busca por categoria e condição
     * getAllAvailableItems({ category: 'Ferramentas', condition: 'Excelente' })
     * 
     * // Busca por título parcial
     * getAllAvailableItems({ title: 'furadeira' })
     * 
     * // Busca por data de publicação
     * getAllAvailableItems({ publishDate: '2024-01-01' })
     */
    async getAllAvailableItems(filters = {}) {
        return new Promise((resolve, reject) => {
            // Query base: busca itens disponíveis com dados do proprietário
            let sql = `SELECT 
                items.*,
                users.name as ownerName,
                users.email as ownerEmail
                FROM items 
                LEFT JOIN users ON items.ownerId = users.id
                WHERE items.status = 'available'`; // Apenas itens disponíveis
            
            const params = [];

            console.log('🔍 Processando filtros no service:', filters);

            // Aplica filtros dinamicamente se fornecidos
            
            // Filtro por título (busca parcial case-insensitive)
            if (filters.title && filters.title.trim()) {
                sql += ' AND items.title LIKE ?';
                params.push(`%${filters.title.trim()}%`); // Busca parcial
                console.log('   ✓ Filtro de título aplicado:', filters.title);
            }

            // Filtro por categoria (busca exata, case-sensitive)
            if (filters.category) {
                sql += ' AND items.category = ?';
                params.push(filters.category);
                console.log('   ✓ Filtro de categoria aplicado:', filters.category);
            }

            // Filtro por condição (busca exata, case-sensitive)
            if (filters.condition) {
                sql += ' AND items.condition = ?';
                params.push(filters.condition);
                console.log('   ✓ Filtro de condição aplicado:', filters.condition);
            }

            // Filtro por data de publicação (itens >= data especificada)
            if (filters.publishDate) {
                sql += ' AND DATE(items.publishDate) >= DATE(?)';
                params.push(filters.publishDate); // Formato: YYYY-MM-DD
                console.log('   ✓ Filtro de data aplicado: a partir de', filters.publishDate);
            }

            // Filtros opcionais adicionais (mantidos para compatibilidade)
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

            // Ordena por data de criação (mais recentes primeiro)
            sql += ' ORDER BY items.createdAt DESC';

            console.log('📝 SQL Final:', sql);
            console.log('📌 Params:', params);

            // Executa query no banco
            db.all(sql, params, (err, items) => {
                if (err) {
                    console.error('❌ Erro ao buscar itens:', err);
                    reject({
                        status: 500,
                        message: 'Erro ao buscar itens'
                    });
                    return;
                }

                console.log('✅ Itens encontrados:', items.length);

                // Processa fotos dos itens (parse JSON se necessário)
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
                WHERE items.category = ? AND items.status = 'available'
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

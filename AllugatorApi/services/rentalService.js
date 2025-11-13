const db = require('../database/config/database');

/**
 * RentalService
 * 
 * Service responsável pela gestão de aluguéis.
 * Gerencia criação, consulta e verificação de disponibilidade dos itens.
 */

/**
 * createRental - Cria um novo aluguel no sistema
 * 
 * Cria o registro de aluguel e atualiza o status do item para 'rented'.
 * 
 * @param {Object} rentalData - Dados do aluguel (itemId, renterId, startDate, endDate, days, pricePerDay, totalPrice)
 * @returns {Promise<Object>} Status 201 com ID do aluguel criado
 */
const createRental = (rentalData) => {
    return new Promise((resolve, reject) => {
        const { itemId, renterId, startDate, endDate, days, pricePerDay, totalPrice } = rentalData;
        
        const query = `
            INSERT INTO rentals (itemId, renterId, startDate, endDate, days, pricePerDay, totalPrice, status, paymentStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid')
        `;
        
        db.run(query, [itemId, renterId, startDate, endDate, days, pricePerDay, totalPrice], function(err) {
            if (err) {
                console.error('Erro ao criar aluguel:', err);
                reject(err);
            } else {
                // Atualiza o status do item para 'rented'
                const updateItemQuery = `UPDATE items SET status = 'rented' WHERE id = ?`;
                db.run(updateItemQuery, [itemId], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar status do item:', updateErr);
                    }
                });
                
                resolve({
                    status: 201,
                    message: 'Aluguel criado com sucesso',
                    data: {
                        id: this.lastID,
                        rentalId: this.lastID
                    }
                });
            }
        });
    });
};

/**
 * getUserRentals - Busca todos os aluguéis de um usuário
 * 
 * Retorna lista de aluguéis com informações dos itens (título, foto, descrição, categoria).
 * Faz JOIN com tabela items.
 * 
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Status 200 com array de aluguéis
 */
const getUserRentals = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.*,
                i.title as itemTitle,
                i.photos as itemPhoto,
                i.description as itemDescription,
                i.category as itemCategory
            FROM rentals r
            JOIN items i ON r.itemId = i.id
            WHERE r.renterId = ?
            ORDER BY r.createdAt DESC
        `;
        
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar aluguéis do usuário:', err);
                reject(err);
            } else {
                resolve({
                    status: 200,
                    rentals: rows
                });
            }
        });
    });
};

/**
 * getRentalById - Busca um aluguel específico por ID
 * 
 * Retorna detalhes completos do aluguel com informações do item e do locatário.
 * Faz JOIN com tabelas items e users.
 * 
 * @param {number} rentalId - ID do aluguel
 * @returns {Promise<Object>} Status 200 com dados do aluguel ou 404 se não encontrado
 */
const getRentalById = (rentalId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.*,
                i.title as itemTitle,
                i.photos as itemPhoto,
                i.description as itemDescription,
                i.priceDaily as itemPriceDaily,
                u.name as renterName,
                u.email as renterEmail
            FROM rentals r
            JOIN items i ON r.itemId = i.id
            JOIN users u ON r.renterId = u.id
            WHERE r.id = ?
        `;
        
        db.get(query, [rentalId], (err, row) => {
            if (err) {
                console.error('Erro ao buscar aluguel:', err);
                reject(err);
            } else if (!row) {
                resolve({
                    status: 404,
                    message: 'Aluguel não encontrado'
                });
            } else {
                resolve({
                    status: 200,
                    data: row
                });
            }
        });
    });
};

/**
 * checkItemAvailability - Verifica se um item está disponível para aluguel
 * 
 * Busca aluguéis ativos (confirmed/active) que ainda não expiraram.
 * Se encontrar algum, o item está alugado (available = false).
 * 
 * @param {number} itemId - ID do item a verificar
 * @returns {Promise<Object>} Status 200 com available (boolean) e currentRental (se existir)
 */
const checkItemAvailability = (itemId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM rentals
            WHERE itemId = ? 
            AND status IN ('confirmed', 'active')
            AND endDate >= datetime('now')
            ORDER BY endDate DESC
            LIMIT 1
        `;
        
        db.get(query, [itemId], (err, row) => {
            if (err) {
                console.error('Erro ao verificar disponibilidade:', err);
                reject(err);
            } else {
                const isAvailable = !row;
                resolve({
                    status: 200,
                    available: isAvailable,
                    currentRental: row || null
                });
            }
        });
    });
};

/**
 * completeRental - Finaliza um aluguel após o período
 * 
 * Atualiza status do aluguel para 'completed' e status do item para 'available'.
 * Permite que o item fique disponível para novos aluguéis.
 * 
 * @param {number} rentalId - ID do aluguel a finalizar
 * @returns {Promise<Object>} Status 200 ou 404 se aluguel não encontrado
 */
const completeRental = (rentalId) => {
    return new Promise((resolve, reject) => {
        // Busca o aluguel
        db.get('SELECT * FROM rentals WHERE id = ?', [rentalId], (err, rental) => {
            if (err) {
                return reject(err);
            }
            if (!rental) {
                return resolve({
                    status: 404,
                    message: 'Aluguel não encontrado'
                });
            }
            
            // Atualiza status do aluguel para 'completed'
            const updateRentalQuery = `UPDATE rentals SET status = 'completed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateRentalQuery, [rentalId], (updateErr) => {
                if (updateErr) {
                    return reject(updateErr);
                }
                
                // Atualiza status do item para 'available'
                const updateItemQuery = `UPDATE items SET status = 'available' WHERE id = ?`;
                db.run(updateItemQuery, [rental.itemId], (itemErr) => {
                    if (itemErr) {
                        console.error('Erro ao atualizar status do item:', itemErr);
                    }
                    
                    resolve({
                        status: 200,
                        message: 'Aluguel finalizado com sucesso'
                    });
                });
            });
        });
    });
};

/**
 * cancelRental - Cancela um aluguel
 * 
 * Verifica se o aluguel pertence ao usuário, atualiza status para 'cancelled'
 * e libera o item (status 'available').
 * 
 * @param {number} rentalId - ID do aluguel
 * @param {number} userId - ID do usuário (para validar propriedade)
 * @returns {Promise<Object>} Status 200 ou 404 se não encontrado/sem permissão
 */
const cancelRental = (rentalId, userId) => {
    return new Promise((resolve, reject) => {
        // Verifica se o aluguel pertence ao usuário
        db.get('SELECT * FROM rentals WHERE id = ? AND renterId = ?', [rentalId, userId], (err, rental) => {
            if (err) {
                return reject(err);
            }
            if (!rental) {
                return resolve({
                    status: 404,
                    message: 'Aluguel não encontrado ou você não tem permissão'
                });
            }
            
            // Atualiza status do aluguel para 'cancelled'
            const updateRentalQuery = `UPDATE rentals SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateRentalQuery, [rentalId], (updateErr) => {
                if (updateErr) {
                    return reject(updateErr);
                }
                
                // Atualiza status do item para 'available'
                const updateItemQuery = `UPDATE items SET status = 'available' WHERE id = ?`;
                db.run(updateItemQuery, [rental.itemId], (itemErr) => {
                    if (itemErr) {
                        console.error('Erro ao atualizar status do item:', itemErr);
                    }
                    
                    resolve({
                        status: 200,
                        message: 'Aluguel cancelado com sucesso'
                    });
                });
            });
        });
    });
};

// Confirmar retirada do item
const confirmPickup = (rentalId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM rentals WHERE id = ?', [rentalId], (err, rental) => {
            if (err) {
                return reject(err);
            }
            if (!rental) {
                return resolve({
                    status: 404,
                    message: 'Aluguel não encontrado'
                });
            }
            
            // Atualiza status do aluguel para 'active'
            const updateQuery = `UPDATE rentals SET status = 'active', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateQuery, [rentalId], (updateErr) => {
                if (updateErr) {
                    return reject(updateErr);
                }
                
                resolve({
                    status: 200,
                    message: 'Retirada confirmada com sucesso'
                });
            });
        });
    });
};

// Confirmar devolução do item
const confirmReturn = (rentalId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM rentals WHERE id = ?', [rentalId], (err, rental) => {
            if (err) {
                console.error('Erro ao buscar rental:', err);
                return reject(err);
            }
            if (!rental) {
                return resolve({
                    status: 404,
                    message: 'Aluguel não encontrado'
                });
            }
            
            // Atualiza status do aluguel para 'completed'
            const updateRentalQuery = `UPDATE rentals SET status = 'completed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(updateRentalQuery, [rentalId], (updateErr) => {
                if (updateErr) {
                    console.error('Erro ao atualizar rental:', updateErr);
                    return reject(updateErr);
                }
                
                // Atualiza status do item para 'available'
                const updateItemQuery = `UPDATE items SET status = 'available' WHERE id = ?`;
                db.run(updateItemQuery, [rental.itemId], (itemErr) => {
                    if (itemErr) {
                        console.error('Erro ao atualizar status do item:', itemErr);
                    }
                    
                    resolve({
                        status: 200,
                        message: 'Devolução confirmada com sucesso'
                    });
                });
            });
        });
    });
};

/**
 * getMyRentedOutItems - Busca itens do usuário que estão sendo alugados por outros
 * 
 * Retorna lista de aluguéis onde o usuário é o DONO do item (ownerId),
 * não o locatário (renterId).
 * 
 * @param {number} userId - ID do usuário dono dos itens
 * @returns {Promise<Object>} Status 200 com array de aluguéis
 */
const getMyRentedOutItems = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                r.*,
                i.title as itemTitle,
                i.photos as itemPhoto,
                i.description as itemDescription,
                i.category as itemCategory,
                u.name as renterName,
                u.email as renterEmail
            FROM rentals r
            JOIN items i ON r.itemId = i.id
            JOIN users u ON r.renterId = u.id
            WHERE i.ownerId = ?
            ORDER BY r.createdAt DESC
        `;
        
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar itens alugados:', err);
                reject(err);
            } else {
                resolve({
                    status: 200,
                    rentals: rows
                });
            }
        });
    });
};

module.exports = {
    createRental,
    getUserRentals,
    getRentalById,
    checkItemAvailability,
    completeRental,
    cancelRental,
    confirmPickup,
    confirmReturn,
    getMyRentedOutItems
};

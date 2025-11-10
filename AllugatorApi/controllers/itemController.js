const itemService = require('../services/itemService');

class ItemController {
    /**
     * Cria um novo item
     */
    async createItem(req, res) {
        try {
            const { title, priceDaily, description, category, condition, photos, location, securityDeposit } = req.body;
            const ownerId = req.user.id; // ID do usuário autenticado (vem do middleware JWT)

            // Validações
            if (!title || !priceDaily || !category || !condition) {
                return res.status(400).json({
                    status: 400,
                    message: 'Campos obrigatórios: title, priceDaily, category, condition'
                });
            }

            const result = await itemService.createItem({
                ownerId,
                title,
                priceDaily,
                description,
                category,
                condition,
                photos,
                location,
                securityDeposit
            });

            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao criar item'
            });
        }
    }

    /**
     * Lista todos os itens disponíveis
     */
    async getAllItems(req, res) {
        try {
            const filters = {
                category: req.query.category,
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
                location: req.query.location
            };

            const result = await itemService.getAllAvailableItems(filters);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar itens'
            });
        }
    }

    /**
     * Busca um item por ID
     */
    async getItemById(req, res) {
        try {
            const { id } = req.params;
            const result = await itemService.getItemById(id);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar item'
            });
        }
    }

    /**
     * Lista itens do usuário autenticado
     */
    async getMyItems(req, res) {
        try {
            const ownerId = req.user.id;
            const result = await itemService.getItemsByOwner(ownerId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar seus itens'
            });
        }
    }

    /**
     * Atualiza um item
     */
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user.id;
            const itemData = req.body;

            const result = await itemService.updateItem(id, itemData, ownerId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao atualizar item'
            });
        }
    }

    /**
     * Deleta um item
     */
    async deleteItem(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user.id;

            const result = await itemService.deleteItem(id, ownerId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao deletar item'
            });
        }
    }

    /**
     * Busca itens por categoria
     */
    async getItemsByCategory(req, res) {
        try {
            const { category } = req.params;
            const result = await itemService.getItemsByCategory(category);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar itens por categoria'
            });
        }
    }
}

module.exports = new ItemController();

/**
 * ItemController - Controlador de itens para aluguel
 * 
 * Responsável por processar requisições HTTP relacionadas a itens:
 * - Criação de novos itens
 * - Listagem e busca de itens disponíveis
 * - Consulta de itens por ID
 * - Gestão de itens do usuário
 * - Atualização e exclusão de itens
 * 
 * Todas as rotas (exceto GET públicas) requerem autenticação JWT.
 */

const itemService = require('../services/itemService');

class ItemController {
    /**
     * Cria um novo item para aluguel
     * 
     * @route POST /api/items
     * @auth Requer autenticação JWT
     * @access Private
     * 
     * @param {Object} req.body - Dados do item
     * @param {string} req.body.title - Título do item (obrigatório)
     * @param {number} req.body.priceDaily - Preço por dia (obrigatório)
     * @param {string} req.body.category - Categoria (obrigatório)
     * @param {string} req.body.condition - Condição (obrigatório)
     * @param {string} req.body.description - Descrição detalhada
     * @param {string} req.body.photos - Nome da foto
     * @param {string} req.body.location - Localização
     * @param {number} req.body.securityDeposit - Valor da caução
     * 
     * @returns {Object} 201 - Item criado com sucesso
     * @returns {Object} 400 - Campos obrigatórios faltando
     * @returns {Object} 500 - Erro interno do servidor
     */
    async createItem(req, res) {
        try {
            const { title, priceDaily, description, category, condition, photos, location, securityDeposit } = req.body;
            const ownerId = req.user.id; // ID do usuário autenticado (extraído do JWT pelo middleware)

            // Validações de campos obrigatórios
            if (!title || !priceDaily || !category || !condition) {
                return res.status(400).json({
                    status: 400,
                    message: 'Campos obrigatórios: title, priceDaily, category, condition'
                });
            }

            // Delega lógica de negócio para o service
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
     * Lista todos os itens disponíveis com filtros opcionais
     * 
     * @route GET /api/items
     * @auth Não requer autenticação
     * @access Public
     * 
     * @query {string} title - Filtro por título (busca parcial LIKE)
     * @query {string} category - Filtro por categoria (busca exata)
     * @query {string} condition - Filtro por condição (busca exata)
     * @query {string} publishDate - Filtro por data de publicação (>= data)
     * @query {number} minPrice - Preço mínimo (opcional)
     * @query {number} maxPrice - Preço máximo (opcional)
     * @query {string} location - Filtro por localização (opcional)
     * 
     * @returns {Object} 200 - Lista de itens encontrados
     * @returns {Object} 500 - Erro interno do servidor
     * 
     * @example
     * GET /api/items?category=Ferramentas&condition=Excelente
     * GET /api/items?title=furadeira&publishDate=2024-01-01
     */
    async getAllItems(req, res) {
        try {
            // Extrai filtros dos query parameters
            const filters = {
                title: req.query.title,
                category: req.query.category,
                condition: req.query.condition,
                publishDate: req.query.publishDate,
                // Mantém compatibilidade com filtros adicionais
                minPrice: req.query.minPrice,
                maxPrice: req.query.maxPrice,
                location: req.query.location
            };

            console.log('🔍 Filtros recebidos no controller:', filters);

            // Delega busca para o service
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
     * Busca um item específico por ID
     * 
     * @route GET /api/items/:id
     * @auth Não requer autenticação
     * @access Public
     * 
     * @param {number} req.params.id - ID do item
     * 
     * @returns {Object} 200 - Item encontrado
     * @returns {Object} 404 - Item não encontrado
     * @returns {Object} 500 - Erro interno do servidor
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
     * Lista todos os itens do usuário autenticado
     * 
     * @route GET /api/items/my-items
     * @auth Requer autenticação JWT
     * @access Private
     * 
     * @returns {Object} 200 - Lista de itens do usuário
     * @returns {Object} 401 - Não autenticado
     * @returns {Object} 500 - Erro interno do servidor
     */
    async getMyItems(req, res) {
        try {
            const ownerId = req.user.id; // ID extraído do JWT
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
     * Lista todos os itens do usuário autenticado com informações de aluguel
     * 
     * @route GET /api/my-items-with-rentals
     * @auth Requer autenticação JWT
     * @access Private
     * 
     * @returns {Object} 200 - Lista de itens do usuário com info de quem está alugando
     * @returns {Object} 401 - Não autenticado
     * @returns {Object} 500 - Erro interno do servidor
     */
    async getMyItemsWithRentals(req, res) {
        try {
            const ownerId = req.user.id; // ID extraído do JWT
            const result = await itemService.getItemsByOwnerWithRentals(ownerId);
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

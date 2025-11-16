/**
 * ItemController - Controlador de itens para aluguel
 * 
 * Responsável por processar requisições HTTP relacionadas a itens:
 * - Criação de novos itens (com validação e sanitização)
 * - Listagem e busca de itens disponíveis
 * - Consulta de itens por ID
 * - Gestão de itens do usuário
 * - Atualização e exclusão de itens
 * 
 * Todas as rotas (exceto GET públicas) requerem autenticação JWT.
 * 
 * Validações aplicadas:
 * - Título: 5-200 caracteres
 * - Preço: número positivo maior que 0.01
 * - Categoria: 3-50 caracteres
 * - Descrição: até 1000 caracteres (opcional)
 */

const itemService = require('../services/itemService');
const { validateCreateItem, sanitizeItem } = require('../utils/validation');

class ItemController {
    /**
     * Cria um novo item para aluguel
     * 
     * @route POST /api/items
     * @auth Requer autenticação JWT
     * @access Private
     * 
     * @param {Object} req.body - Dados do item
     * @param {string} req.body.title - Título do item (5-200 chars, obrigatório)
     * @param {number} req.body.priceDaily - Preço por dia (número positivo, obrigatório)
     * @param {string} req.body.category - Categoria (3-50 chars, obrigatório)
     * @param {string} req.body.condition - Condição (3-50 chars, obrigatório)
     * @param {string} req.body.description - Descrição detalhada (até 1000 chars, opcional)
     * @param {string} req.body.photos - Nome da foto (opcional)
     * @param {string} req.body.location - Localização (até 200 chars, opcional)
     * @param {number} req.body.securityDeposit - Valor da caução (número não-negativo, opcional)
     * 
     * @returns {Object} 201 - Item criado com sucesso
     * @returns {Object} 422 - Dados inválidos (validação falhou)
     * @returns {Object} 500 - Erro interno do servidor
     * 
     * @example
     * POST /api/items
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     * {
     *   "title": "Bicicleta Mountain Bike 21 Marchas",
     *   "priceDaily": 25.50,
     *   "category": "Esportes",
     *   "condition": "Excelente",
     *   "description": "Bicicleta em perfeito estado, nunca caiu",
     *   "location": "São Paulo, SP",
     *   "securityDeposit": 100
     * }
     * 
     * Response 201:
     * {
     *   "status": 201,
     *   "message": "Item criado com sucesso",
     *   "itemId": 42
     * }
     */
    async createItem(req, res) {
        try {
            const rawData = req.body;
            const ownerId = req.user.id; // ID do usuário autenticado (extraído do JWT pelo middleware)

            // ✅ VALIDAÇÃO: Verificar se dados estão válidos
            const validation = validateCreateItem(rawData);
            if (!validation.isValid) {
                return res.status(422).json({
                    status: 422,
                    message: 'Dados do item inválidos',
                    errors: validation.errors
                });
            }

            // ✅ SANITIZAÇÃO: Limpar e normalizar dados
            const sanitizedData = sanitizeItem(rawData);

            // Delega lógica de negócio para o service
            const result = await itemService.createItem({
                ownerId,
                title: sanitizedData.title,
                priceDaily: sanitizedData.priceDaily,
                description: sanitizedData.description,
                category: sanitizedData.category,
                condition: sanitizedData.condition,
                photos: sanitizedData.photos,
                location: sanitizedData.location,
                securityDeposit: sanitizedData.securityDeposit
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

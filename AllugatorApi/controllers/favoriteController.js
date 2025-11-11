const favoriteService = require('../services/favoriteService');

class FavoriteController {
    /**
     * Adiciona um item aos favoritos
     */
    async addFavorite(req, res) {
        try {
            const userId = req.user.id; // ID do usuário autenticado (vem do middleware JWT)
            const { itemId } = req.body;

            if (!itemId) {
                return res.status(400).json({
                    status: 400,
                    message: 'itemId é obrigatório'
                });
            }

            const result = await favoriteService.addFavorite(userId, itemId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao adicionar favorito'
            });
        }
    }

    /**
     * Remove um item dos favoritos
     */
    async removeFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({
                    status: 400,
                    message: 'itemId é obrigatório'
                });
            }

            const result = await favoriteService.removeFavorite(userId, parseInt(itemId));
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao remover favorito'
            });
        }
    }

    /**
     * Lista todos os favoritos do usuário
     */
    async getUserFavorites(req, res) {
        try {
            const userId = req.user.id;
            const result = await favoriteService.getUserFavorites(userId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar favoritos'
            });
        }
    }

    /**
     * Verifica se um item está nos favoritos
     */
    async checkFavorite(req, res) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;

            if (!itemId) {
                return res.status(400).json({
                    status: 400,
                    message: 'itemId é obrigatório'
                });
            }

            const result = await favoriteService.isFavorite(userId, parseInt(itemId));
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao verificar favorito'
            });
        }
    }

    /**
     * Retorna os IDs dos itens favoritados
     */
    async getFavoriteIds(req, res) {
        try {
            const userId = req.user.id;
            const result = await favoriteService.getUserFavoriteIds(userId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status,
                message: error.message || 'Erro ao buscar favoritos'
            });
        }
    }
}

module.exports = new FavoriteController();

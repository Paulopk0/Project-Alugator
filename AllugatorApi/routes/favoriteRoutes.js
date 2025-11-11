const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/favorites/ids
 * @desc    Retorna os IDs dos itens favoritados
 * @access  Private (requer token JWT)
 */
router.get('/ids', authenticateToken, favoriteController.getFavoriteIds);

/**
 * @route   GET /api/favorites/check/:itemId
 * @desc    Verifica se um item está nos favoritos
 * @access  Private (requer token JWT)
 */
router.get('/check/:itemId', authenticateToken, favoriteController.checkFavorite);

/**
 * @route   GET /api/favorites
 * @desc    Lista todos os favoritos do usuário
 * @access  Private (requer token JWT)
 */
router.get('/', authenticateToken, favoriteController.getUserFavorites);

/**
 * @route   POST /api/favorites
 * @desc    Adiciona um item aos favoritos
 * @access  Private (requer token JWT)
 */
router.post('/', authenticateToken, favoriteController.addFavorite);

/**
 * @route   DELETE /api/favorites/:itemId
 * @desc    Remove um item dos favoritos
 * @access  Private (requer token JWT)
 */
router.delete('/:itemId', authenticateToken, favoriteController.removeFavorite);

module.exports = router;

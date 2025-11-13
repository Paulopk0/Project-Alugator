const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Rotas públicas (não requerem autenticação)
router.get('/items', itemController.getAllItems.bind(itemController));
router.get('/items/category/:category', itemController.getItemsByCategory.bind(itemController));
router.get('/items/:id', itemController.getItemById.bind(itemController));

// Rotas protegidas (requerem autenticação)
router.post('/items', authenticateToken, itemController.createItem.bind(itemController));
router.get('/my-items', authenticateToken, itemController.getMyItems.bind(itemController));
router.get('/my-items-with-rentals', authenticateToken, itemController.getMyItemsWithRentals.bind(itemController));
router.put('/items/:id', authenticateToken, itemController.updateItem.bind(itemController));
router.delete('/items/:id', authenticateToken, itemController.deleteItem.bind(itemController));

module.exports = router;

const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Criar novo aluguel
router.post('/', rentalController.createRental);

// Buscar aluguéis do usuário logado
router.get('/', rentalController.getUserRentals);

// Verificar disponibilidade de um item
router.get('/check/:itemId', rentalController.checkItemAvailability);

// Buscar aluguel específico
router.get('/:rentalId', rentalController.getRentalById);

// Finalizar aluguel
router.put('/:rentalId/complete', rentalController.completeRental);

// Cancelar aluguel
router.delete('/:rentalId', rentalController.cancelRental);

// Confirmar retirada do item
router.put('/:rentalId/pickup', rentalController.confirmPickup);

// Confirmar devolução do item
router.put('/:rentalId/return', rentalController.confirmReturn);

module.exports = router;

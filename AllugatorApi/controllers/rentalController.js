const rentalService = require('../services/rentalService');

// Criar novo aluguel
const createRental = async (req, res) => {
    try {
        const { itemId, startDate, endDate, days, pricePerDay, totalPrice } = req.body;
        const renterId = req.user.id; // Vem do middleware de autenticação
        
        // Validações
        if (!itemId || !startDate || !endDate || !days || !pricePerDay || !totalPrice) {
            return res.status(400).json({
                status: 400,
                message: 'Dados incompletos. itemId, startDate, endDate, days, pricePerDay e totalPrice são obrigatórios'
            });
        }
        
        // Verifica disponibilidade do item
        const availability = await rentalService.checkItemAvailability(itemId);
        if (!availability.available) {
            return res.status(409).json({
                status: 409,
                message: 'Item não está disponível para aluguel',
                currentRental: availability.currentRental
            });
        }
        
        const rentalData = {
            itemId,
            renterId,
            startDate,
            endDate,
            days,
            pricePerDay,
            totalPrice
        };
        
        const result = await rentalService.createRental(rentalData);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao criar aluguel:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Buscar aluguéis do usuário logado
const getUserRentals = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await rentalService.getUserRentals(userId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao buscar aluguéis:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Buscar aluguel específico
const getRentalById = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const result = await rentalService.getRentalById(rentalId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao buscar aluguel:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Verificar disponibilidade de um item
const checkItemAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;
        const result = await rentalService.checkItemAvailability(itemId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Finalizar aluguel
const completeRental = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const result = await rentalService.completeRental(rentalId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao finalizar aluguel:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Cancelar aluguel
const cancelRental = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const userId = req.user.id;
        const result = await rentalService.cancelRental(rentalId, userId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao cancelar aluguel:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Confirmar retirada do item
const confirmPickup = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const result = await rentalService.confirmPickup(rentalId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao confirmar retirada:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Confirmar devolução do item
const confirmReturn = async (req, res) => {
    try {
        const { rentalId } = req.params;
        const result = await rentalService.confirmReturn(rentalId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao confirmar devolução:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Buscar itens do usuário que estão sendo alugados por outros
const getMyRentedOutItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await rentalService.getMyRentedOutItems(userId);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Erro ao buscar itens alugados:', error);
        res.status(500).json({
            status: 500,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
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

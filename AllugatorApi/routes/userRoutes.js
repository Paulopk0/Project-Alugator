const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/', userController.getAll.bind(userController));


// --- INÍCIO DAS NOVAS ROTAS DE PERFIL ---
router.put('/users/profile', authenticateToken, userController.updateProfile.bind(userController));
router.post('/users/change-password', authenticateToken, userController.changePassword.bind(userController));
router.post('/users/delete-account', authenticateToken, userController.deleteAccount.bind(userController));
// --- FIM DAS NOVAS ROTAS DE PERFIL ---


// Rota protegida de exemplo - requer token JWT
// IMPORTANT: rota específica deve vir antes da rota dinâmica '/:id'
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        status: 200,
        message: 'Perfil do usuário autenticado',
        user: req.user
    });
});

// Rota dinâmica para obter usuário por ID (deve ficar após '/profile')
router.get('/:id', userController.get.bind(userController));

// Rota protegida de exemplo - requer token JWT
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        status: 200,
        message: 'Perfil do usuário autenticado',
        user: req.user
    });
});

module.exports = router;
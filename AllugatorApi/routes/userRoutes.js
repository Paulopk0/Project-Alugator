const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/', userController.getAll.bind(userController));
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
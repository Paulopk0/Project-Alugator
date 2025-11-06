const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/', userController.getAll.bind(userController));
router.get('/:id', userController.get.bind(userController));

module.exports = router;
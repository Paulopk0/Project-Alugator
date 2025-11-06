const userService = require('../services/userService');

class UserController {
    async register(req, res) {
        try {
            const { name, email, phoneNumber, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: 'Nome, email e senha são obrigatórios.'
                });
            }

            const result = await userService.register(name, email, phoneNumber, password);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.login(email, password);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    async getAll(req, res) {
        try {
            const result = await userService.getAll();
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    async get(req, res) {
        try {
            const userId = req.params.id;
            const result = await userService.get(userId);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new UserController();
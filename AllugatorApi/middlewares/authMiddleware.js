const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = (req, res, next) => {
    try {
        // Obtém o token do header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'Token não fornecido'
            });
        }

        // Verifica o token (usa fallback para desenvolvimento se JWT_SECRET não estiver definido)
        const jwtSecret = process.env.JWT_SECRET;
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({
                    status: 403,
                    message: 'Token inválido ou expirado'
                });
            }

            // Adiciona os dados do usuário ao request
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Erro ao validar token'
        });
    }
};

module.exports = { authenticateToken };

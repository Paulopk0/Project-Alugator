/**
 * UserController - Controlador de usuários
 * 
 * Responsável por processar requisições HTTP relacionadas a usuários:
 * - Registro de novos usuários
 * - Login e autenticação (geração de JWT)
 * - Consulta de usuários
 * 
 * Senhas são armazenadas com hash bcrypt para segurança.
 * Login retorna token JWT para autenticação em rotas protegidas.
 */

const userService = require('../services/userService');

class UserController {
    /**
     * Registra um novo usuário no sistema
     * 
     * @route POST /api/users/register
     * @auth Não requer autenticação
     * @access Public
     * 
     * @param {Object} req.body - Dados do usuário
     * @param {string} req.body.name - Nome completo (obrigatório)
     * @param {string} req.body.email - Email único (obrigatório)
     * @param {string} req.body.password - Senha (obrigatório, será hasheada)
     * @param {string} req.body.phoneNumber - Telefone (opcional)
     * 
     * @returns {Object} 201 - Usuário criado com sucesso
     * @returns {Object} 400 - Campos obrigatórios faltando
     * @returns {Object} 409 - Email já cadastrado
     * @returns {Object} 500 - Erro interno do servidor
     * 
     * @example
     * POST /api/users/register
     * {
     *   "name": "João Silva",
     *   "email": "joao@email.com",
     *   "password": "senha123",
     *   "phoneNumber": "(11) 99999-9999"
     * }
     */
    async register(req, res) {
        try {
            const { name, email, phoneNumber, password } = req.body;

            // Validação de campos obrigatórios
            if (!name || !email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: 'Nome, email e senha são obrigatórios.'
                });
            }

            // Delega lógica de registro para o service
            // Service irá: verificar email único, hashear senha, inserir no banco
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

    /**
     * Autentica usuário e retorna token JWT
     * 
     * @route POST /api/users/login
     * @auth Não requer autenticação
     * @access Public
     * 
     * @param {Object} req.body - Credenciais
     * @param {string} req.body.email - Email do usuário
     * @param {string} req.body.password - Senha do usuário
     * 
     * @returns {Object} 200 - Login bem-sucedido com token JWT
     * @returns {Object} 401 - Credenciais inválidas
     * @returns {Object} 500 - Erro interno do servidor
     * 
     * @example
     * POST /api/users/login
     * {
     *   "email": "joao@email.com",
     *   "password": "senha123"
     * }
     * 
     * Response:
     * {
     *   "status": 200,
     *   "message": "Login realizado com sucesso",
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" }
     * }
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Delega autenticação para o service
            // Service irá: buscar usuário, comparar senha, gerar JWT
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

    /**
     * Lista todos os usuários cadastrados
     * 
     * @route GET /api/users
     * @auth Pode requerer autenticação (depende da configuração)
     * @access Private/Public
     * 
     * @returns {Object} 200 - Lista de usuários (sem senhas)
     * @returns {Object} 500 - Erro interno do servidor
     * 
     * @note Senhas não são retornadas por segurança
     */
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

    /**
     * Busca um usuário específico por ID
     * 
     * @route GET /api/users/:id
     * @auth Pode requerer autenticação (depende da configuração)
     * @access Private/Public
     * 
     * @param {number} req.params.id - ID do usuário
     * 
     * @returns {Object} 200 - Usuário encontrado (sem senha)
     * @returns {Object} 404 - Usuário não encontrado
     * @returns {Object} 500 - Erro interno do servidor
     */
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
/**
 * UserController - Controlador de usuários
 * 
 * Responsável por processar requisições HTTP relacionadas a usuários:
 * - Registro de novos usuários (com validação e sanitização)
 * - Login e autenticação (geração de JWT)
 * - Consulta de usuários
 * 
 * Senhas são armazenadas com hash bcrypt para segurança.
 * Login retorna token JWT para autenticação em rotas protegidas.
 * 
 * Validações aplicadas:
 * - Email: formato válido e único
 * - Senha: mínimo 6 caracteres
 * - Nome: 3-100 caracteres
 * - Telefone: 10-20 caracteres (opcional)
 */

const userService = require('../services/userService');
const { validateRegister, validateLogin, sanitizeRegister, sanitizeLogin } = require('../utils/validation');

class UserController {
    /**
     * Registra um novo usuário no sistema
     * 
     * @route POST /api/users/register
     * @auth Não requer autenticação
     * @access Public
     * 
     * @param {Object} req.body - Dados do usuário
     * @param {string} req.body.name - Nome completo (obrigatório, 3-100 chars)
     * @param {string} req.body.email - Email único (obrigatório, formato válido)
     * @param {string} req.body.password - Senha (obrigatório, mín 6 chars)
     * @param {string} req.body.phoneNumber - Telefone (opcional, 10-20 chars)
     * 
     * @returns {Object} 201 - Usuário criado com sucesso + token JWT
     * @returns {Object} 400 - Validação falhou ou email já existe
     * @returns {Object} 422 - Dados inválidos
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
     * 
     * Response 201:
     * {
     *   "status": 201,
     *   "message": "Usuário cadastrado com sucesso!",
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" },
     *   "userId": 1
     * }
     */
    async register(req, res) {
        try {
            const rawData = req.body;

            // ✅ VALIDAÇÃO: Verificar se campos obrigatórios existem
            const validation = validateRegister(rawData);
            if (!validation.isValid) {
                return res.status(422).json({
                    status: 422,
                    message: 'Validação falhou. Verifique os campos inválidos abaixo.',
                    field: 'register',
                    errors: validation.errors,
                    details: {
                        name: !rawData.name ? 'Campo obrigatório' : (rawData.name.length < 3 ? 'Mínimo 3 caracteres' : (rawData.name.length > 100 ? 'Máximo 100 caracteres' : null)),
                        email: !rawData.email ? 'Campo obrigatório' : (!validation.errors.find(e => e.includes('Email')) ? null : 'Formato inválido (ex: usuario@email.com)'),
                        password: !rawData.password ? 'Campo obrigatório' : (rawData.password.length < 6 ? 'Mínimo 6 caracteres' : null),
                        phoneNumber: rawData.phoneNumber && rawData.phoneNumber.length > 0 && (rawData.phoneNumber.length < 10 || rawData.phoneNumber.length > 20) ? 'Entre 10 e 20 caracteres' : null
                    }
                });
            }

            // ✅ SANITIZAÇÃO: Limpar e normalizar dados
            const sanitizedData = sanitizeRegister(rawData);

            // Delega lógica de registro para o service
            // Service irá: verificar email único, hashear senha, inserir no banco
            const result = await userService.register(
                sanitizedData.name,
                sanitizedData.email,
                sanitizedData.phoneNumber,
                sanitizedData.password
            );
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor',
                field: 'register'
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
     * @param {string} req.body.email - Email do usuário (obrigatório, formato válido)
     * @param {string} req.body.password - Senha do usuário (obrigatório, mín 6 chars)
     * 
     * @returns {Object} 200 - Login bem-sucedido com token JWT
     * @returns {Object} 422 - Dados inválidos
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
     * Response 200:
     * {
     *   "status": 200,
     *   "message": "Login realizado com sucesso",
     *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *   "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" }
     * }
     */
    async login(req, res) {
        try {
            const rawData = req.body;

            // ✅ VALIDAÇÃO: Verificar email e senha
            const validation = validateLogin(rawData);
            if (!validation.isValid) {
                return res.status(422).json({
                    status: 422,
                    message: 'Validação falhou. Verifique os campos inválidos abaixo.',
                    field: 'login',
                    errors: validation.errors,
                    details: {
                        email: !rawData.email ? 'Campo obrigatório' : (!validation.errors.find(e => e.includes('Email')) ? null : 'Formato inválido (ex: usuario@email.com)'),
                        password: !rawData.password ? 'Campo obrigatório' : (rawData.password.length < 6 ? 'Mínimo 6 caracteres' : null)
                    }
                });
            }

            // ✅ SANITIZAÇÃO: Normalizar dados
            const sanitizedData = sanitizeLogin(rawData);
            
            // Delega autenticação para o service
            // Service irá: buscar usuário, comparar senha, gerar JWT
            const result = await userService.login(sanitizedData.email, sanitizedData.password);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro interno do servidor',
                field: 'login'
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



    /**
     * Atualiza o perfil do usuário logado
     * @route PUT /api/users/profile
     * @auth Requer autenticação JWT
     * @access Private
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.id; 
            const { name, phoneNumber } = req.body;
            
            const result = await userService.updateProfile(userId, name, phoneNumber);
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
     * Altera a senha do usuário logado
     * @route POST /api/users/change-password
     * @auth Requer autenticação JWT
     * @access Private
     */
    async changePassword(req, res) {
        try {
            const userId = req.user.id; 
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    status: 400,
                    message: "Senha antiga e nova senha são obrigatórias."
                });
            }

            const result = await userService.changePassword(userId, oldPassword, newPassword);
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
     * Apaga a conta do usuário logado
     * @route POST /api/users/delete-account
     * @auth Requer autenticação JWT
     * @access Private
     */
    async deleteAccount(req, res) {
        try {
            const userId = req.user.id;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    status: 400,
                    message: "Senha é obrigatória para confirmar a exclusão."
                });
            }

            const result = await userService.deleteAccount(userId, password);
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
     * Solicita código de recuperação de senha
     * 
     * @route POST /api/users/forgot-password
     * @auth Não requer autenticação
     * @access Public
     */
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    status: 400,
                    message: "Email é obrigatório."
                });
            }

            const result = await userService.generateResetCode(email);
            
            if (result.status === 200) {
                // Enviar email com o código
                const { sendEmail } = require('../utils/email');
                try {
                    await sendEmail(
                        email, 
                        'Código de recuperação de senha - Allugator', 
                        `Olá!\n\nSeu código de recuperação de senha é: ${result.code}\n\nEste código expira em 15 minutos.\n\nSe você não solicitou esta recuperação, ignore este email.\n\nAtenciosamente,\nEquipe Allugator`
                    );
                } catch (emailError) {
                    console.error('Erro ao enviar email:', emailError);
                    return res.status(500).json({
                        status: 500,
                        message: "Erro ao enviar email de recuperação: " + (emailError.message || emailError)
                    });
                }
            }

            res.status(200).json({
                status: 200,
                message: "Código de recuperação enviado para seu e-mail."
            });
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro ao processar recuperação de senha'
            });
        }
    }

    /**
     * Valida código de recuperação
     * 
     * @route POST /api/users/validate-code
     * @auth Não requer autenticação
     * @access Public
     */
    async validateCode(req, res) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({
                    status: 400,
                    message: "Email e código são obrigatórios."
                });
            }

            const result = await userService.validateResetCode(email, code);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro ao validar código'
            });
        }
    }

    /**
     * Redefine a senha usando token de reset
     * 
     * @route POST /api/users/reset-password
     * @auth Requer resetToken
     * @access Public
     */
    async resetPassword(req, res) {
        try {
            const { resetToken, newPassword } = req.body;

            if (!resetToken || !newPassword) {
                return res.status(400).json({
                    status: 400,
                    message: "Token e nova senha são obrigatórios."
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    status: 400,
                    message: "A senha deve ter no mínimo 6 caracteres."
                });
            }

            const result = await userService.resetPassword(resetToken, newPassword);
            res.status(result.status).json(result);
        } catch (error) {
            const status = error.status || 500;
            res.status(status).json({
                status: status,
                message: error.message || 'Erro ao redefinir senha'
            });
        }
    }
}

module.exports = new UserController();
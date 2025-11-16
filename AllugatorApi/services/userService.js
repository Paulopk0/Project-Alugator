const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/config/database.js');

/**
 * UserService
 * 
 * Service responsável pela lógica de negócio de usuários e autenticação.
 * Gerencia cadastro, login, consultas de usuários e geração de tokens JWT.
 * 
 * Funcionalidades:
 * - Registro de novos usuários (com hash de senha)
 * - Autenticação/Login (com verificação bcrypt)
 * - Geração de tokens JWT (validade 7 dias)
 * - Listagem de usuários
 * - Busca de usuário por ID
 * 
 * Segurança:
 * - Senhas hasheadas com bcrypt (salt rounds = 10)
 * - JWT com expiração configurável
 * - Senhas NUNCA retornadas em consultas
 * - Validação de email único (constraint UNIQUE no banco)
 * 
 * Estrutura do banco (tabela users):
 * - id: INTEGER PRIMARY KEY
 * - name: TEXT NOT NULL
 * - email: TEXT UNIQUE NOT NULL
 * - password: TEXT NOT NULL (hash bcrypt)
 * - phoneNumber: TEXT
 * - createdAt: DATETIME DEFAULT CURRENT_TIMESTAMP
 */
class UserService {
    /**
     * generateToken - Gera um token JWT para autenticação do usuário
     * 
     * O token contém informações básicas do usuário no payload (id, email, name)
     * e tem validade configurável (padrão: 7 dias).
     * 
     * O token é usado pelo frontend para autenticar requisições subsequentes,
     * sendo enviado no header Authorization: Bearer {token}
     * 
     * Payload do token:
     * - id: ID do usuário
     * - email: Email do usuário
     * - name: Nome do usuário
     * - iat: Timestamp de criação
     * - exp: Timestamp de expiração
     * 
     * @param {Object} user - Objeto do usuário com id, email e name
     * @returns {string} Token JWT assinado
     * 
     * @note Secret Key vem de process.env.JWT_SECRET
     * @note Validade padrão: 7 dias (JWT_EXPIRES_IN ou '7d')
     * 
     * @example
     * const token = generateToken({ id: 1, email: 'user@email.com', name: 'João' });
     * // Retorna: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
     */
    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    /**
     * register - Registra um novo usuário no sistema
     * 
     * Fluxo de registro:
     * 1. Gera hash seguro da senha usando bcrypt (salt rounds = 10)
     * 2. Insere usuário no banco com senha hasheada
     * 3. Retorna ID do usuário criado
     * 
     * Validações:
     * - Email deve ser único (constraint UNIQUE no banco)
     * - Todos os campos obrigatórios devem ser preenchidos
     * 
     * Segurança:
     * - Senha NUNCA armazenada em texto plano
     * - Hash bcrypt com 10 rounds (recomendado)
     * - Salt gerado automaticamente por round
     * 
     * @param {string} name - Nome completo do usuário
     * @param {string} email - Email (usado para login)
     * @param {string} phoneNumber - Telefone de contato
     * @param {string} password - Senha em texto plano (será hasheada)
     * @returns {Promise<Object>} Objeto com status 201 e userId
     * 
     * @throws {Object} Status 400 se email já existe (SQLITE_CONSTRAINT)
     * @throws {Object} Status 400 em caso de erro ao salvar
     * 
     * @note Hash bcrypt: $2a$10$... (60 caracteres)
     * @note Salt rounds = 10: ~10 hashes por segundo (seguro e rápido)
     * 
     * @example
     * register('João Silva', 'joao@email.com', '(11) 99999-9999', 'senha123')
     * // Retorna: { status: 201, message: 'Usuário cadastrado com sucesso!', userId: 1 }
     */
    async register(name, email, phoneNumber, password) {
        try {
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);
            
            // ✨ Salva referência para 'this' (UserService) já que db.run() muda o contexto
            const self = this;

            return new Promise((resolve, reject) => {
                const sql = 'INSERT INTO users (name, email, phoneNumber, password) VALUES (?,?,?,?)';
                const params = [name, email, phoneNumber, passwordHash];

                db.run(sql, params, function (err) {
                    if (err) {
                        console.error('Database save error:', err);
                        reject({
                            status: 400,
                            message: err.code === 'SQLITE_CONSTRAINT' ?
                                "Este email já está em uso." :
                                "Erro ao salvar usuário."
                        });
                        return;
                    }
                    
                    // ✨ Novo: Gera token logo após criar usuário (igual ao login)
                    const newUser = { id: this.lastID, name, email };
                    const token = self.generateToken(newUser);
                    
                    resolve({
                        status: 201,
                        message: "Usuário cadastrado com sucesso!",
                        userId: this.lastID,
                        token: token,
                        user: newUser
                    });
                });
            });
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }

    /**
     * login - Autentica usuário e gera token JWT
     * 
     * Fluxo de login:
     * 1. Busca usuário por email no banco
     * 2. Verifica se usuário existe
     * 3. Compara senha fornecida com hash do banco usando bcrypt.compareSync()
     * 4. Se válido: gera token JWT e retorna dados do usuário (SEM senha)
     * 
     * Segurança:
     * - Comparação segura com bcrypt (compara hash, não texto plano)
     * - Senha NUNCA retornada na resposta
     * - Token JWT com expiração
     * 
     * @param {string} email - Email do usuário
     * @param {string} password - Senha em texto plano
     * @returns {Promise<Object>} Objeto com status 200, token JWT e dados do usuário
     * 
     * @throws {Object} Status 404 se usuário não encontrado
     * @throws {Object} Status 401 se senha incorreta
     * @throws {Object} Status 500 em caso de erro interno
     * 
     * @note bcrypt.compareSync() é seguro contra timing attacks
     * @note Token deve ser armazenado pelo frontend (AsyncStorage)
     * 
     * @example
     * login('joao@email.com', 'senha123')
     * // Retorna: {
     * //   status: 200,
     * //   message: 'Login realizado com sucesso!',
     * //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
     * //   user: { id: 1, name: 'João Silva', email: 'joao@email.com' }
     * // }
     */
    async login(email, password) {
        try {
            return new Promise((resolve, reject) => {
                const sql = "SELECT * FROM users WHERE email = ?";
                db.get(sql, [email], (err, user) => {
                    if (err || !user) {
                        reject({
                            status: 404,
                            message: "Usuário não encontrado."
                        });
                        return;
                    }

                    const passwordMatch = bcrypt.compareSync(password, user.password);
                    if (!passwordMatch) {
                        reject({
                            status: 401,
                            message: "Senha incorreta."
                        });
                        return;
                    }

                    // Gera o token JWT
                    const token = this.generateToken(user);

                    resolve({
                        status: 200,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        },
                        token: token,
                        message: "Login realizado com sucesso!"
                    });
                });
            });
        } catch (error) {
            throw {
                status: 500,
                message: "Erro interno do servidor"
            };
        }
    }

    /**
     * getAll - Lista todos os usuários cadastrados no sistema
     * 
     * Retorna lista de TODOS os usuários, mas SEM o campo 'password' por segurança.
     * Útil para:
     * - Listagem de usuários no painel admin
     * - Busca de proprietários de itens
     * - Estatísticas do sistema
     * 
     * SQL: SELECT id, name, email, phoneNumber FROM users
     * (Senha NÃO incluída no SELECT)
     * 
     * @returns {Promise<Object>} Objeto com status 200 e array de usuários
     * 
     * @throws {Object} Status 500 em caso de erro ao buscar
     * 
     * @note Senha NUNCA retornada por segurança
     * @note Sem paginação (retorna todos) - considerar adicionar em versão futura
     * 
     * @example
     * getAll()
     * // Retorna: {
     * //   status: 200,
     * //   users: [
     * //     { id: 1, name: 'João Silva', email: 'joao@email.com', phoneNumber: '(11) 99999-9999' },
     * //     { id: 2, name: 'Maria Santos', email: 'maria@email.com', phoneNumber: '(11) 88888-8888' }
     * //   ]
     * // }
     */
    async getAll() {
        try {
            return new Promise((resolve, reject) => {
                const sql = "SELECT id, name, email, phoneNumber FROM users";
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        reject({
                            status: 500,
                            message: "Erro ao buscar usuários."
                        });
                        return;
                    }
                    resolve({
                        status: 200,
                        users: rows
                    });
                });
            });
        } catch (error) {
            throw {
                status: 500,
                message: "Erro interno do servidor"
            };
        }
    }

    async get(userId) {
        try {
            return new Promise((resolve, reject) => {
                const sql = "SELECT id, name, email, phoneNumber FROM users WHERE id = ?";
                db.get(sql, [userId], (err, user) => {
                    if (err || !user) {
                        reject({
                            status: 404,
                            message: "Usuário não encontrado."
                        });
                        return;
                    }
                    resolve({
                        status: 200,
                        user: user
                    });
                });
            });
        } catch (error) {
            throw {
                status: 500,
                message: "Erro interno do servidor"
            };
        }
    }


    /**
     * Atualiza o perfil do usuário (nome, telefone)
     * @param {number} userId - ID do usuário (do token JWT)
     * @param {string} name - Novo nome
     * @param {string} phoneNumber - Novo telefone
     * @returns {Promise<Object>} Usuário atualizado
     */
    async updateProfile(userId, name, phoneNumber) {
        return new Promise((resolve, reject) => {
            if (!name) {
                return reject({ status: 400, message: "Nome é obrigatório." });
            }

            const sql = "UPDATE users SET name = ?, phoneNumber = ? WHERE id = ?";
            db.run(sql, [name, phoneNumber, userId], (err) => {
                if (err) {
                    console.error('Erro ao atualizar perfil:', err);
                    return reject({ status: 500, message: 'Erro ao atualizar perfil.' });
                }
                
                // Retorna o usuário atualizado
                const selectSql = "SELECT id, name, email, phoneNumber FROM users WHERE id = ?";
                db.get(selectSql, [userId], (selectErr, user) => {
                    if (selectErr || !user) {
                         return reject({ status: 404, message: "Usuário não encontrado pós-update." });
                    }
                    resolve({
                        status: 200,
                        message: "Perfil atualizado com sucesso!",
                        user: user
                    });
                });
            });
        });
    }

    /**
     * Altera a senha do usuário
     * @param {number} userId - ID do usuário (do token JWT)
     * @param {string} oldPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<Object>} Status 200 ou 401/400
     */
    async changePassword(userId, oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT password FROM users WHERE id = ?";
            db.get(sql, [userId], (err, user) => {
                if (err || !user) {
                    return reject({ status: 404, message: "Usuário não encontrado." });
                }
                const passwordMatch = bcrypt.compareSync(oldPassword, user.password);
                if (!passwordMatch) {
                    return reject({ status: 401, message: "Senha atual incorreta." });
                }
                if (!newPassword || newPassword.length < 6) {
                    return reject({ status: 400, message: "Nova senha deve ter pelo menos 6 caracteres." });
                }
                const salt = bcrypt.genSaltSync(10);
                const passwordHash = bcrypt.hashSync(newPassword, salt);
                const updateSql = "UPDATE users SET password = ? WHERE id = ?";
                db.run(updateSql, [passwordHash, userId], (updateErr) => {
                    if (updateErr) {
                        return reject({ status: 500, message: 'Erro ao atualizar senha.' });
                    }
                    resolve({
                        status: 200,
                        message: "Senha alterada com sucesso!"
                    });
                });
            });
        });
    }

    /**
     * Apaga a conta do usuário
     * @param {number} userId - ID do usuário (do token JWT)
     * @param {string} password - Senha (para confirmação)
     * @returns {Promise<Object>} Status 200 ou 401
     */
    async deleteAccount(userId, password) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT password FROM users WHERE id = ?";
            db.get(sql, [userId], (err, user) => {
                if (err || !user) {
                    return reject({ status: 404, message: "Usuário não encontrado." });
                }
                const passwordMatch = bcrypt.compareSync(password, user.password);
                if (!passwordMatch) {
                    return reject({ status: 401, message: "Senha incorreta. Não foi possível apagar a conta." });
                }
                const deleteSql = "DELETE FROM users WHERE id = ?";
                db.run(deleteSql, [userId], (deleteErr) => {
                    if (deleteErr) {
                        return reject({ status: 500, message: 'Erro ao apagar a conta.' });
                    }
                    resolve({
                        status: 200,
                        message: "Conta apagada com sucesso."
                    });
                });
            });
        });
    }
}

module.exports = new UserService();
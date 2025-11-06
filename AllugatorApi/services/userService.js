const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/config/database.js');

class UserService {
    /**
     * Gera um token JWT para o usuário
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
    async register(name, email, phoneNumber, password) {
        try {
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);

            return new Promise((resolve, reject) => {
                const sql = 'INSERT INTO users (name, email, phoneNumber, password) VALUES (?,?,?,?)';
                const params = [name, email, phoneNumber, passwordHash];

                console.log('Attempting to save user:', { name, email, phoneNumber });

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
                    console.log('User saved successfully with ID:', this.lastID);
                    resolve({
                        status: 201,
                        message: "Usuário cadastrado com sucesso!",
                        userId: this.lastID
                    });
                });
            });
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }

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
}

module.exports = new UserService();
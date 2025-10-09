const bcrypt = require('bcryptjs');
const db = require('../database/config/database.js');

class UserService {
    async register(name, email, phoneNumber, password) {
        try {
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);

            return new Promise((resolve, reject) => {
                const sql = 'INSERT INTO users (name, email, phoneNumber, password) VALUES (?,?,?,?)';
                const params = [name, email, phoneNumber, passwordHash];

                db.run(sql, params, function (err) {
                    if (err) {
                        reject({
                            status: 400,
                            message: "Este email já está em uso."
                        });
                        return;
                    }
                    resolve({ 
                        status: 201,
                        userId: this.lastID,
                        message: "Usuário cadastrado com sucesso!"
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

                    resolve({
                        status: 200,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        },
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
}

module.exports = new UserService();
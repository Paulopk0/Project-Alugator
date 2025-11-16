const bcrypt = require('bcryptjs');
const db = require('../config/database.js');

const users = [
  {
    name: 'Paulo',
    email: 'paulo@test.com',
    phoneNumber: '5511999999991',
    password: '123456'
  },
  {
    name: 'Luan',
    email: 'luan@test.com',
    phoneNumber: '5511999999992',
    password: '123456'
  },
  {
    name: 'Murillo',
    email: 'murillo@test.com',
    phoneNumber: '5511999999993',
    password: '123456'
  }
];

const seedUsers = async () => {
  try {
    // Hash all passwords
    const hashedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10)
    }));

    // Insert users
    const insertPromises = hashedUsers.map(user => {
      return new Promise((resolve, reject) => {
        const sql = 'INSERT OR IGNORE INTO users (name, email, phoneNumber, password) VALUES (?, ?, ?, ?)';
        db.run(sql, [user.name, user.email, user.phoneNumber, user.password], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });

    await Promise.all(insertPromises);
    console.log('Seed completo com sucesso! ✨');
    
  } catch (error) {
    console.error('Erro no seeder:', error);
  } finally {
    db.close();
  }
};

seedUsers();
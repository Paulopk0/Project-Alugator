const db = require('../config/database.js');

const dates = {
  twoMonthsAgo: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  oneMonthAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  twoWeeksAgo: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  oneWeekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  today: new Date().toISOString().split('T')[0],
  inOneWeek: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  inTwoWeeks: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  inOneMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  inTwoMonths: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

const rentals = [
  {
    itemId: 1,
    renterId: 2,
    startDate: dates.today,
    endDate: dates.inOneWeek,
    days: 7,
    pricePerDay: 25.00,
    totalPrice: (25.00 * 7) + (25.00 / 10) + 15,
    status: 'confirmed',
    payment: 'paid'
  },
  {
    itemId: 4,
    renterId: 1,
    startDate: dates.oneMonthAgo,
    endDate: dates.inTwoWeeks,
    days: 37,
    pricePerDay: 20.00,
    totalPrice: (20.00 * 37) + (20.00 / 10) + 15,
    status: 'active',
    payment: 'paid'
  },
  {
    itemId: 5,
    renterId: 1,
    startDate: dates.twoWeeksAgo,
    endDate: dates.inOneWeek,
    days: 21,
    pricePerDay: 12.00,
    totalPrice: (12.00 * 21) + (12.00 / 10) + 15,
    status: 'active',
    payment: 'paid'
  },
  {
    itemId: 7,
    renterId: 2,
    startDate: dates.twoMonthsAgo,
    endDate: dates.today,
    days: 60,
    pricePerDay: 28.00,
    totalPrice: (28.00 * 60) + (28.00 / 10) + 15,
    status: 'active',
    payment: 'paid'
  },
  {
    itemId: 2,
    renterId: 3,
    startDate: dates.oneWeekAgo,
    endDate: dates.inTwoMonths,
    days: 67,
    pricePerDay: 15.00,
    totalPrice: (15.00 * 67) + (15.00 / 10) + 15,
    status: 'confirmed',
    payment: 'paid'
  }
];

// inserir dados na tabela rentals
// atualizar campos de items para 'rented' quando aplicável
const seedRentals = () => {
  db.get('SELECT COUNT(*) as count FROM rentals', [], (err, row) => {
    if (err) {
      console.error('❌ Erro ao verificar aluguéis:', err);
      return;
    }

    if (row.count === 0) {
      console.log('🚗 Inserindo aluguéis iniciais...');

      const insertPromises = rentals.map(rental => {
        return new Promise((resolve, reject) => {
          const sql = `INSERT INTO rentals
            (itemId, renterId, startDate, endDate, days, pricePerDay, totalPrice, status, paymentStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          db.run(sql, [
            rental.itemId,
            rental.renterId,
            rental.startDate,
            rental.endDate,
            rental.days,
            rental.pricePerDay,
            rental.totalPrice,
            rental.status,
            rental.payment
          ], (err) => {
            if (err) reject(err);
            else {
              // Atualizar status do item para 'rented'
              const updateSql = `UPDATE items SET status = 'rented' WHERE id = ?`;
              db.run(updateSql, [rental.itemId], (updateErr) => {
                if (updateErr) reject(updateErr);
                else resolve();
              });
            }
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => {
          console.log('✨ Aluguéis inseridos com sucesso!');
          db.close();
        })
        .catch(error => {
          console.error('❌ Erro ao inserir aluguéis:', error);
          db.close();
        });
    } else {
      console.log('ℹ️ Aluguéis já existem no banco.');
      db.close();
    }
  });
};

seedRentals();
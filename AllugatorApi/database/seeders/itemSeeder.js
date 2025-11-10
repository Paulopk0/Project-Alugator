const db = require('../config/database.js');

/**
 * Items de exemplo para popular o banco de dados
 * photos: string com nome do asset (ex: 'parafusadeira')
 * O frontend vai mapear para require('../assets/images/items/parafusadeira.png')
 */
const items = [
    {
        ownerId: 1,
        title: 'Parafusadeira Profissional',
        priceDaily: 25.00,
        description: 'Parafusadeira profissional, perfeita para trabalhos leves e médios. Inclui bateria extra e maleta.',
        category: 'Ferramentas',
        condition: 'Excelente',
        photos: 'parafusadeira', // Nome do asset 
        location: 'São Paulo, SP',
        status: 'Disponível',
        securityDeposit: 50.00
    },
    {
        ownerId: 1,
        title: 'Guarda-Roupa Modular',
        priceDaily: 15.00,
        description: 'Guarda-roupa espaçoso, fácil de montar e desmontar. Ideal para mudanças temporárias.',
        category: 'Móveis',
        condition: 'Bom',
        photos: 'guarda_roupa',
        location: 'Rio de Janeiro, RJ',
        status: 'Disponível',
        securityDeposit: 100.00
    },
    {
        ownerId: 1,
        title: 'Furadeira de Impacto',
        priceDaily: 30.00,
        description: 'Furadeira de impacto 800W, ideal para concreto e alvenaria. Acompanha conjunto de brocas.',
        category: 'Ferramentas',
        condition: 'Excelente',
        photos: 'furadeira',
        location: 'São Paulo, SP',
        status: 'Disponível',
        securityDeposit: 80.00
    },
    {
        ownerId: 1,
        title: 'Mesa de Escritório',
        priceDaily: 20.00,
        description: 'Mesa de escritório ampla, 1.20m x 0.60m, em MDF com acabamento amadeirado.',
        category: 'Móveis',
        condition: 'Bom',
        photos: 'mesa_escritorio',
        location: 'Belo Horizonte, MG',
        status: 'Disponível',
        securityDeposit: 60.00
    },
    {
        ownerId: 1,
        title: 'Escada Alumínio 6 Degraus',
        priceDaily: 12.00,
        description: 'Escada dobrável de alumínio, 6 degraus, suporta até 120kg.',
        category: 'Ferramentas',
        condition: 'Bom',
        photos: 'escada',
        location: 'Curitiba, PR',
        status: 'Disponível',
        securityDeposit: 40.00
    },
    {
        ownerId: 1,
        title: 'Bicicleta Mountain Bike',
        priceDaily: 35.00,
        description: 'Mountain bike aro 29, 21 marchas, freios a disco. Perfeita para trilhas.',
        category: 'Esportes',
        condition: 'Excelente',
        photos: 'bicicleta',
        location: 'Florianópolis, SC',
        status: 'Disponível',
        securityDeposit: 150.00
    },
    {
        ownerId: 1,
        title: 'Barraca de Camping 4 Pessoas',
        priceDaily: 28.00,
        description: 'Barraca impermeável para 4 pessoas. Fácil montagem, inclui bolsa.',
        category: 'Camping',
        condition: 'Excelente',
        photos: 'barraca',
        location: 'Brasília, DF',
        status: 'Disponível',
        securityDeposit: 80.00
    }
];

const seedItems = () => {
    db.get('SELECT COUNT(*) as count FROM items', [], (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar itens:', err);
            return;
        }

        if (row.count === 0) {
            console.log('📦 Inserindo itens iniciais...');
            
            const insertPromises = items.map(item => {
                return new Promise((resolve, reject) => {
                    const sql = `INSERT INTO items 
                        (ownerId, title, priceDaily, description, category, condition, photos, location, status, securityDeposit) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    
                    db.run(sql, [
                        item.ownerId,
                        item.title,
                        item.priceDaily,
                        item.description,
                        item.category,
                        item.condition,
                        item.photos,
                        item.location,
                        item.status,
                        item.securityDeposit
                    ], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });

            Promise.all(insertPromises)
                .then(() => {
                    console.log('✨ Itens inseridos com sucesso!');
                    db.close();
                })
                .catch(error => {
                    console.error('❌ Erro ao inserir itens:', error);
                    db.close();
                });
        } else {
            console.log('ℹ️  Itens já existem no banco');
            db.close();
        }
    });
};

seedItems();

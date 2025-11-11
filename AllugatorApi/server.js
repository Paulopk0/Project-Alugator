require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

const app = express();
// Configuração explícita de CORS para permitir o header Authorization
const corsOptions = {
    origin: true, // permite refletir a origem do request (padrão permissivo durante desenvolvimento)
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rotas
// Registrar rotas de itens antes das rotas de usuário para evitar conflito com a rota dinâmica '/:id' em userRoutes
app.use('/api', itemRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api', userRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Allugator API está rodando!',
        version: '1.0.0',
        endpoints: {
            users: '/api/register, /api/login, /api/profile',
            items: '/api/items, /api/my-items',
            favorites: '/api/favorites',
            rentals: '/api/rentals'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
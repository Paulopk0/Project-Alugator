require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rotas
app.use('/api', userRoutes);
app.use('/api', itemRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Allugator API está rodando!',
        version: '1.0.0',
        endpoints: {
            users: '/api/register, /api/login, /api/profile',
            items: '/api/items, /api/my-items'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/`);
});
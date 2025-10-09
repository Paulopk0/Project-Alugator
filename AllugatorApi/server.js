require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
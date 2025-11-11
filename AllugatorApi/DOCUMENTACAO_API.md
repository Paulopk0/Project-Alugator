# 🔌 Documentação Backend - Allugator API

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Configuração e Instalação](#configuração-e-instalação)
4. [Autenticação](#autenticação)
5. [Endpoints da API](#endpoints-da-api)
6. [Banco de Dados](#banco-de-dados)
7. [Middlewares](#middlewares)
8. [Services](#services)
9. [Padrões de Código](#padrões-de-código)
10. [Segurança](#segurança)
11. [Logs e Debugging](#logs-e-debugging)
12. [Tratamento de Erros](#tratamento-de-erros)

---

## 🎯 Visão Geral

A **Allugator API** é o backend do sistema de aluguel de itens P2P. Fornece:
- Sistema de autenticação JWT
- CRUD completo de itens
- Sistema de favoritos
- Gestão de aluguéis
- Busca avançada com filtros

### Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **SQLite3**: Banco de dados relacional
- **JWT (jsonwebtoken)**: Autenticação e autorização
- **bcrypt**: Hash de senhas
- **cors**: Habilitação de CORS para frontend

### Informações do Servidor

- **Porta**: 3000 (padrão)
- **Base URL**: `http://localhost:3000`
- **Prefixo API**: `/api`

---

## 🏗️ Arquitetura

### Estrutura em Camadas

```
Controllers → Services → Database
     ↓           ↓           ↓
  Validação   Lógica     SQLite
  HTTP        Negócio    Queries
```

#### Camadas:

1. **Controllers** (`controllers/`)
   - Recebem requisições HTTP
   - Validam entrada básica
   - Delegam para services
   - Retornam respostas HTTP

2. **Services** (`services/`)
   - Contêm lógica de negócio
   - Fazem queries no banco
   - Transformam dados
   - Retornam objetos padronizados

3. **Database** (`database/`)
   - Configuração SQLite
   - Migrations (estrutura)
   - Seeders (dados iniciais)

### Estrutura de Pastas

```
AllugatorApi/
├── server.js              # Arquivo principal (entry point)
├── package.json           # Dependências
├── controllers/           # Controllers HTTP
│   ├── itemController.js
│   ├── userController.js
│   └── ...
├── services/              # Lógica de negócio
│   ├── itemService.js
│   ├── userService.js
│   └── ...
├── middlewares/           # Middlewares Express
│   └── authMiddleware.js  # Autenticação JWT
├── routes/                # Definição de rotas
│   ├── itemRoutes.js
│   ├── userRoutes.js
│   └── ...
├── database/              # Banco de dados
│   ├── config/
│   │   └── database.js    # Conexão SQLite
│   ├── migrations/
│   │   └── createTables.js
│   ├── seeders/
│   │   ├── userSeeder.js
│   │   └── itemSeeder.js
│   └── data/
│       └── allugator.db   # Arquivo SQLite
└── API_DOCUMENTATION.md   # Documentação original
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js v14+ instalado
- npm ou yarn

### Instalação

```bash
# 1. Navegar para pasta da API
cd AllugatorApi

# 2. Instalar dependências
npm install

# 3. Criar banco de dados (executar migrations)
node database/migrations/createTables.js

# 4. Popular banco com dados de exemplo (opcional)
node database/seeders/userSeeder.js
node database/seeders/itemSeeder.js

# 5. Iniciar servidor
npm start
# Ou em modo desenvolvimento:
npm run dev
```

### Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```env
PORT=3000
JWT_SECRET=seu_secret_key_aqui
DATABASE_PATH=./database/data/allugator.db
```

---

## 🔐 Autenticação

### Sistema JWT (JSON Web Token)

#### Fluxo de Autenticação

```
1. Cliente → POST /api/users/login { email, password }
2. API valida credenciais
3. API gera token JWT
4. API retorna token + dados do usuário
5. Cliente armazena token (AsyncStorage/LocalStorage)
6. Cliente inclui token em requisições: Authorization: Bearer {token}
7. API valida token no middleware
8. API permite acesso à rota protegida
```

#### Estrutura do Token JWT

```javascript
// Payload do token:
{
  id: 1,              // ID do usuário
  email: "user@email.com",
  name: "Nome do Usuário",
  iat: 1234567890,    // Timestamp de criação
  exp: 1234654290     // Timestamp de expiração (24h)
}
```

#### Como Usar Token nas Requisições

```javascript
// Headers HTTP:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

#### Rotas Públicas vs Protegidas

**Públicas** (sem token):
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/items` (listagem)
- `GET /api/items/:id` (detalhes)

**Protegidas** (com token):
- `POST /api/items` (criar item)
- `GET /api/items/my-items` (meus itens)
- `PUT /api/items/:id` (atualizar item)
- `DELETE /api/items/:id` (deletar item)
- `POST /api/rentals` (criar aluguel)
- `POST /api/favorites/toggle` (favoritar)

---

## 📡 Endpoints da API

### 👤 Usuários

#### 1. Registrar Novo Usuário

```http
POST /api/users/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phoneNumber": "(11) 99999-9999"
}
```

**Resposta de Sucesso (201):**
```json
{
  "status": 201,
  "message": "Usuário registrado com sucesso!",
  "userId": 1
}
```

**Resposta de Erro (409 - Email já existe):**
```json
{
  "status": 409,
  "message": "Email já cadastrado"
}
```

---

#### 2. Login (Autenticação)

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "status": 200,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phoneNumber": "(11) 99999-9999"
  }
}
```

**Resposta de Erro (401 - Credenciais inválidas):**
```json
{
  "status": 401,
  "message": "Email ou senha incorretos"
}
```

---

#### 3. Listar Todos os Usuários

```http
GET /api/users
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "status": 200,
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "phoneNumber": "(11) 99999-9999",
      "createdAt": "2024-01-01 10:00:00"
    }
  ]
}
```

---

#### 4. Buscar Usuário por ID

```http
GET /api/users/:id
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "status": 200,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phoneNumber": "(11) 99999-9999",
    "createdAt": "2024-01-01 10:00:00"
  }
}
```

---

### 📦 Itens

#### 1. Criar Novo Item

```http
POST /api/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Furadeira Bosch Professional",
  "description": "Furadeira de impacto profissional, 850W",
  "priceDaily": 25.00,
  "category": "Ferramentas",
  "condition": "Excelente",
  "location": "São Paulo - SP",
  "photos": "furadeira1",
  "securityDeposit": 100.00
}
```

**Campos Obrigatórios:**
- `title` (string)
- `priceDaily` (number)
- `category` (string)
- `condition` (string)

**Campos Opcionais:**
- `description` (string)
- `photos` (string) - padrão: 'default'
- `location` (string)
- `securityDeposit` (number) - padrão: 0

**Categorias Válidas:**
```javascript
['Eletrônicos', 'Ferramentas', 'Veículos', 'Móveis', 
 'Esportes', 'Camping', 'Eventos', 'Outros']
```

**Condições Válidas:**
```javascript
['Excelente', 'Bom']
```

**Resposta de Sucesso (201):**
```json
{
  "status": 201,
  "message": "Item criado com sucesso!",
  "data": {
    "id": 15,
    "itemId": 15
  }
}
```

---

#### 2. Listar/Buscar Itens Disponíveis

```http
GET /api/items?title=furadeira&category=Ferramentas&condition=Excelente&publishDate=2024-01-01
```

**Query Parameters (todos opcionais):**

| Parâmetro | Tipo | Descrição | Busca |
|-----------|------|-----------|-------|
| `title` | string | Título do item | Parcial (LIKE) |
| `category` | string | Categoria | Exata (=) |
| `condition` | string | Condição | Exata (=) |
| `publishDate` | string | Data (YYYY-MM-DD) | >= data |
| `minPrice` | number | Preço mínimo | >= preço |
| `maxPrice` | number | Preço máximo | <= preço |
| `location` | string | Localização | Parcial (LIKE) |

**Exemplos de Busca:**

```http
# Busca por categoria
GET /api/items?category=Ferramentas

# Busca por título parcial
GET /api/items?title=furadeira

# Busca combinada
GET /api/items?category=Ferramentas&condition=Excelente&minPrice=10&maxPrice=50

# Busca por data de publicação (itens publicados a partir de 01/01/2024)
GET /api/items?publishDate=2024-01-01
```

**Resposta de Sucesso (200):**
```json
{
  "status": 200,
  "items": [
    {
      "id": 1,
      "ownerId": 1,
      "title": "Furadeira Bosch Professional",
      "description": "Furadeira de impacto profissional, 850W",
      "priceDaily": 25.00,
      "category": "Ferramentas",
      "condition": "Excelente",
      "photos": "furadeira1",
      "location": "São Paulo - SP",
      "status": "available",
      "securityDeposit": 100.00,
      "publishDate": "2024-01-01 10:00:00",
      "createdAt": "2024-01-01 10:00:00",
      "ownerName": "João Silva",
      "ownerEmail": "joao@email.com"
    }
  ]
}
```

**Resposta Vazia (200):**
```json
{
  "status": 200,
  "items": []
}
```

---

#### 3. Buscar Item por ID

```http
GET /api/items/:id
```

**Resposta (200):**
```json
{
  "status": 200,
  "item": {
    "id": 1,
    "ownerId": 1,
    "title": "Furadeira Bosch Professional",
    "description": "Furadeira de impacto profissional, 850W",
    "priceDaily": 25.00,
    "category": "Ferramentas",
    "condition": "Excelente",
    "photos": "furadeira1",
    "location": "São Paulo - SP",
    "status": "available",
    "securityDeposit": 100.00,
    "publishDate": "2024-01-01 10:00:00",
    "createdAt": "2024-01-01 10:00:00",
    "ownerName": "João Silva",
    "ownerEmail": "joao@email.com"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "status": 404,
  "message": "Item não encontrado"
}
```

---

#### 4. Listar Meus Itens

```http
GET /api/items/my-items
Authorization: Bearer {token}
```

Retorna todos os itens do usuário autenticado.

**Resposta (200):**
```json
{
  "status": 200,
  "items": [
    {
      "id": 1,
      "title": "Furadeira Bosch Professional",
      "status": "available",
      ...
    },
    {
      "id": 5,
      "title": "Serra Circular Makita",
      "status": "rented",
      ...
    }
  ]
}
```

---

#### 5. Atualizar Item

```http
PUT /api/items/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Furadeira Bosch Professional (ATUALIZADO)",
  "priceDaily": 30.00,
  "condition": "Bom"
}
```

**Resposta (200):**
```json
{
  "status": 200,
  "message": "Item atualizado com sucesso"
}
```

---

#### 6. Deletar Item

```http
DELETE /api/items/:id
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "status": 200,
  "message": "Item deletado com sucesso"
}
```

---

### ❤️ Favoritos

#### 1. Buscar IDs dos Favoritos

```http
GET /api/favorites/ids
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "status": 200,
  "favoriteIds": [1, 5, 8, 12]
}
```

---

#### 2. Adicionar/Remover Favorito (Toggle)

```http
POST /api/favorites/toggle
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": 1,
  "isFavorite": false
}
```

**Parâmetros:**
- `itemId` (number): ID do item
- `isFavorite` (boolean): `true` para remover, `false` para adicionar

**Resposta (200/201):**
```json
{
  "status": 200,
  "message": "Favorito atualizado com sucesso"
}
```

---

### 🏠 Aluguéis

#### 1. Verificar Disponibilidade do Item

```http
GET /api/rentals/check-availability/:itemId
Authorization: Bearer {token}
```

**Resposta - Item Disponível (200):**
```json
{
  "status": 200,
  "available": true
}
```

**Resposta - Item Alugado (200):**
```json
{
  "status": 200,
  "available": false,
  "currentRental": {
    "id": 5,
    "renterId": 2,
    "startDate": "2024-01-01",
    "endDate": "2024-01-10",
    "status": "active"
  }
}
```

---

#### 2. Criar Novo Aluguel

```http
POST /api/rentals
Authorization: Bearer {token}
Content-Type: application/json

{
  "itemId": 1,
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-01-20T00:00:00.000Z",
  "days": 5,
  "pricePerDay": 25.00,
  "totalPrice": 125.00
}
```

**Resposta de Sucesso (201):**
```json
{
  "status": 201,
  "message": "Aluguel criado com sucesso",
  "data": {
    "id": 10,
    "rentalId": 10
  }
}
```

**Resposta - Item Indisponível (409):**
```json
{
  "status": 409,
  "message": "Item não está disponível para aluguel"
}
```

---

## 🗄️ Banco de Dados

### Estrutura SQLite

#### Tabela: `users`

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY | ID único |
| name | TEXT | NOT NULL | Nome completo |
| email | TEXT | UNIQUE, NOT NULL | Email (login) |
| password | TEXT | NOT NULL | Senha hasheada (bcrypt) |
| phoneNumber | TEXT | - | Telefone |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

---

#### Tabela: `items`

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY | ID único |
| ownerId | INTEGER | FK → users.id | Proprietário |
| title | TEXT | NOT NULL | Título |
| description | TEXT | - | Descrição |
| priceDaily | REAL | NOT NULL | Preço por dia |
| category | TEXT | NOT NULL | Categoria |
| condition | TEXT | NOT NULL | Condição |
| photos | TEXT | - | Nome da foto |
| location | TEXT | - | Localização |
| status | TEXT | DEFAULT 'available' | Status do item |
| securityDeposit | REAL | DEFAULT 0 | Caução |
| publishDate | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de publicação |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Status Possíveis:**
- `'available'` - Disponível para aluguel
- `'rented'` - Atualmente alugado
- `'unavailable'` - Indisponível temporariamente

**⚠️ IMPORTANTE**: Status são armazenados em **inglês** no banco, mas exibidos em **português** no frontend via helper `translateItemStatus()`.

---

#### Tabela: `rentals`

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY | ID único |
| itemId | INTEGER | FK → items.id | Item alugado |
| renterId | INTEGER | FK → users.id | Locatário |
| startDate | DATETIME | NOT NULL | Data de início |
| endDate | DATETIME | NOT NULL | Data de fim |
| totalPrice | REAL | NOT NULL | Preço total |
| status | TEXT | DEFAULT 'pending' | Status do aluguel |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Status de Aluguel:**
- `'pending'` - Aguardando confirmação
- `'active'` - Aluguel ativo
- `'completed'` - Finalizado
- `'cancelled'` - Cancelado

---

#### Tabela: `favorites`

| Campo | Tipo | Restrições | Descrição |
|-------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY | ID único |
| userId | INTEGER | FK → users.id | Usuário |
| itemId | INTEGER | FK → items.id | Item favoritado |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**UNIQUE (userId, itemId)** - Usuário não pode favoritar mesmo item 2x

---

### Executar Migrations

```bash
node database/migrations/createTables.js
```

Cria todas as tabelas no arquivo `database/data/allugator.db`.

### Executar Seeders

```bash
# Usuários de exemplo
node database/seeders/userSeeder.js

# Itens de exemplo
node database/seeders/itemSeeder.js
```

---

## 🔧 Middlewares

### authMiddleware.js

**Propósito**: Valida token JWT em rotas protegidas.

**Como Funciona:**

1. Extrai token do header `Authorization: Bearer {token}`
2. Verifica validade do token com `jwt.verify()`
3. Decodifica payload do token
4. Anexa dados do usuário em `req.user`
5. Permite acesso à rota

**Uso:**

```javascript
// Em itemRoutes.js
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/items', authenticateToken, itemController.createItem);
//                     ↑ Middleware aplicado
```

**Dados Disponíveis:**

```javascript
// Dentro do controller/service:
req.user = {
  id: 1,
  email: "user@email.com",
  name: "Nome do Usuário"
}
```

**Respostas de Erro:**

```json
// 401 - Token não fornecido
{
  "status": 401,
  "message": "Token não fornecido"
}

// 403 - Token inválido
{
  "status": 403,
  "message": "Token inválido"
}
```

---

## 🔨 Services

### itemService.js

Contém lógica de negócio para itens.

#### Principais Funções:

```javascript
createItem(itemData)
// Cria novo item no banco
// Status padrão: 'available'
// Retorna: { status: 201, data: { id } }

getAllAvailableItems(filters)
// Busca itens disponíveis com filtros
// Faz JOIN com users para incluir ownerName/ownerEmail
// Aplica filtros dinâmicos (title, category, condition, publishDate)
// Retorna: { status: 200, items: [...] }

getItemById(id)
// Busca item específico por ID
// Retorna: { status: 200, item: {...} } ou 404

getItemsByOwner(ownerId)
// Busca todos os itens de um proprietário
// Retorna: { status: 200, items: [...] }

updateItem(id, ownerId, updateData)
// Atualiza item (apenas se for o dono)
// Retorna: { status: 200 } ou 403/404

deleteItem(id, ownerId)
// Deleta item (apenas se for o dono)
// Retorna: { status: 200 } ou 403/404
```

#### Filtros de Busca

**Busca Parcial (LIKE):**
- `title`: `LIKE %texto%`
- `location`: `LIKE %texto%`

**Busca Exata (=):**
- `category`: Deve ser valor exato (case-sensitive)
- `condition`: Deve ser valor exato (case-sensitive)

**Busca por Range:**
- `publishDate`: `>= DATE(data)` - itens publicados a partir da data
- `minPrice`: `>= valor`
- `maxPrice`: `<= valor`

**⚠️ IMPORTANTE - Case Sensitivity:**

```javascript
// ❌ NÃO FUNCIONARÁ
category: 'ferramentas'  // lowercase
condition: 'novo'        // não existe

// ✅ VALORES CORRETOS
category: 'Ferramentas'  // title case
condition: 'Excelente'   // valor exato do banco
```

---

### userService.js

Contém lógica de negócio para usuários.

#### Principais Funções:

```javascript
register(name, email, phoneNumber, password)
// Registra novo usuário
// Hash da senha com bcrypt
// Verifica email único
// Retorna: { status: 201, userId } ou 409

login(email, password)
// Autentica usuário
// Compara senha hasheada
// Gera token JWT (validade 24h)
// Retorna: { status: 200, token, user } ou 401

getAll()
// Lista todos os usuários (sem senhas)
// Retorna: { status: 200, users: [...] }

get(userId)
// Busca usuário por ID (sem senha)
// Retorna: { status: 200, user: {...} } ou 404
```

#### Segurança de Senhas

```javascript
// Registro: Hash da senha
const hashedPassword = await bcrypt.hash(password, 10);
// Senha nunca armazenada em texto plano

// Login: Comparação segura
const match = await bcrypt.compare(password, user.password);
// Compara senha fornecida com hash do banco
```

#### Geração de Token JWT

```javascript
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    name: user.name
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // Token expira em 24 horas
);
```

---

## 📝 Padrões de Código

### Estrutura de Controller

```javascript
/**
 * Documentação da função
 */
async functionName(req, res) {
  try {
    // 1. Extrair dados da requisição
    const { param1, param2 } = req.body;
    const userId = req.user.id; // Se autenticado
    
    // 2. Validações básicas
    if (!param1) {
      return res.status(400).json({
        status: 400,
        message: 'Mensagem de erro'
      });
    }
    
    // 3. Delegar para service
    const result = await service.functionName(param1, param2);
    
    // 4. Retornar resposta
    res.status(result.status).json(result);
    
  } catch (error) {
    // 5. Tratamento de erro
    const status = error.status || 500;
    res.status(status).json({
      status,
      message: error.message || 'Erro interno'
    });
  }
}
```

### Estrutura de Service

```javascript
async functionName(param1, param2) {
  return new Promise((resolve, reject) => {
    // 1. Preparar query SQL
    const sql = `SELECT * FROM table WHERE field = ?`;
    const params = [param1];
    
    // 2. Executar query
    db.all(sql, params, (err, rows) => {
      if (err) {
        // 3. Tratar erro
        reject({
          status: 500,
          message: 'Mensagem de erro'
        });
        return;
      }
      
      // 4. Processar resultados
      const processedData = rows.map(row => ({
        // transformações
      }));
      
      // 5. Resolver promise
      resolve({
        status: 200,
        data: processedData
      });
    });
  });
}
```

### Padrão de Resposta

Todas as respostas seguem este formato:

```javascript
{
  status: 200,           // HTTP status code
  message: "Mensagem",   // Mensagem descritiva (opcional)
  data: { ... },         // Dados retornados (opcional)
  items: [ ... ],        // Lista de itens (opcional)
  user: { ... }          // Dados do usuário (opcional)
}
```

---

## 🔒 Segurança

### Práticas de Segurança Implementadas

#### 1. Hash de Senhas (bcrypt)

```javascript
// Nunca armazenar senhas em texto plano
const hashedPassword = await bcrypt.hash(password, 10);
// Salt rounds = 10 (recomendado)
```

#### 2. JWT para Autenticação

```javascript
// Token expira em 24 horas
const token = jwt.sign(payload, secret, { expiresIn: '24h' });
```

#### 3. CORS Configurado

```javascript
// Permite requisições apenas de origens específicas
app.use(cors({
  origin: 'http://localhost:8081', // Expo dev server
  credentials: true
}));
```

#### 4. Validações de Entrada

```javascript
// Validar campos obrigatórios
if (!title || !priceDaily) {
  return res.status(400).json({ message: 'Campos obrigatórios' });
}

// Sanitizar entrada do usuário
const cleanTitle = title.trim();
```

#### 5. SQL Injection Prevention

```javascript
// ✅ CORRETO: Usar prepared statements
const sql = 'SELECT * FROM items WHERE id = ?';
db.get(sql, [id], callback);

// ❌ ERRADO: Concatenar strings
const sql = `SELECT * FROM items WHERE id = ${id}`; // Vulnerável!
```

#### 6. Autorização

```javascript
// Verificar propriedade antes de ações
if (item.ownerId !== req.user.id) {
  return res.status(403).json({ message: 'Sem permissão' });
}
```

### Checklist de Segurança

- [x] Senhas hasheadas com bcrypt
- [x] JWT com expiração
- [x] CORS configurado
- [x] Prepared statements (SQL)
- [x] Validações de entrada
- [x] Verificação de autorização
- [ ] Rate limiting (a implementar)
- [ ] HTTPS em produção
- [ ] Variáveis de ambiente (.env)
- [ ] Logs de auditoria

---

## 📊 Logs e Debugging

### Sistema de Logs com Emojis

Padronização de logs para facilitar debugging:

```javascript
console.log('🔍 Processando filtros:', filters);   // Busca/Search
console.log('📤 Enviando resposta:', data);        // Envio
console.log('📥 Dados recebidos:', req.body);      // Recebimento
console.log('✅ Operação bem-sucedida');           // Sucesso
console.log('❌ Erro ao processar:', error);       // Erro
console.log('📦 Criando recurso:', data);          // Criação
console.log('📝 SQL Query:', sql);                 // Query
console.log('📌 Params:', params);                 // Parâmetros
console.log('📊 Resultado:', result);              // Resultado
```

### Filtrando Logs no Terminal

```bash
# Filtrar por tipo de log (usando emojis)
npm start | grep "🔍"  # Apenas logs de busca
npm start | grep "❌"  # Apenas erros
```

### Logs por Camada

**Controllers:**
```javascript
console.log('🔍 Filtros recebidos no controller:', filters);
```

**Services:**
```javascript
console.log('📝 SQL Final:', sql);
console.log('📌 Params:', params);
console.log('✅ Itens encontrados:', items.length);
```

**Erros:**
```javascript
console.error('❌ Erro ao buscar itens:', err);
```

---

## ⚠️ Tratamento de Erros

### Hierarquia de Status Codes

| Código | Significado | Quando Usar |
|--------|-------------|-------------|
| 200 | OK | Sucesso (GET, PUT, DELETE) |
| 201 | Created | Recurso criado (POST) |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Token ausente/inválido |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já existe) |
| 500 | Internal Error | Erro inesperado do servidor |

### Padrão de Erro

```javascript
{
  status: 400,
  message: "Mensagem descritiva do erro"
}
```

### Exemplos por Cenário

#### 1. Campos Obrigatórios Faltando

```javascript
if (!title || !priceDaily) {
  return res.status(400).json({
    status: 400,
    message: 'Campos obrigatórios: title, priceDaily'
  });
}
```

#### 2. Recurso Não Encontrado

```javascript
if (!item) {
  return res.status(404).json({
    status: 404,
    message: 'Item não encontrado'
  });
}
```

#### 3. Sem Permissão

```javascript
if (item.ownerId !== req.user.id) {
  return res.status(403).json({
    status: 403,
    message: 'Você não tem permissão para editar este item'
  });
}
```

#### 4. Conflito (Email Já Existe)

```javascript
if (existingUser) {
  return res.status(409).json({
    status: 409,
    message: 'Email já cadastrado'
  });
}
```

#### 5. Token Inválido

```javascript
if (!token) {
  return res.status(401).json({
    status: 401,
    message: 'Token não fornecido'
  });
}
```

#### 6. Erro Interno

```javascript
catch (error) {
  console.error('❌ Erro:', error);
  res.status(500).json({
    status: 500,
    message: 'Erro interno do servidor'
  });
}
```

---

## 🔄 Fluxos de Dados

### Fluxo de Criação de Item

```
1. Cliente → POST /api/items + token JWT
2. authMiddleware verifica token
3. itemController extrai dados do body
4. itemController valida campos obrigatórios
5. itemController chama itemService.createItem()
6. itemService monta SQL INSERT
7. itemService executa query no SQLite
8. itemService retorna { status: 201, data: { id } }
9. itemController retorna resposta ao cliente
```

### Fluxo de Busca com Filtros

```
1. Cliente → GET /api/items?category=Ferramentas&condition=Excelente
2. itemController extrai query params
3. itemController monta objeto filters
4. itemController chama itemService.getAllAvailableItems(filters)
5. itemService monta query SQL com WHERE dinâmico
6. itemService adiciona params para cada filtro
7. itemService executa query (JOIN com users)
8. itemService processa fotos (_attachPhotosToItems)
9. itemService retorna { status: 200, items: [...] }
10. itemController retorna resposta ao cliente
```

### Fluxo de Login

```
1. Cliente → POST /api/users/login { email, password }
2. userController extrai email e password
3. userController chama userService.login()
4. userService busca usuário por email no banco
5. userService compara senha com bcrypt.compare()
6. Se válido: userService gera token JWT
7. userService retorna { status: 200, token, user }
8. userController retorna resposta ao cliente
9. Cliente armazena token no AsyncStorage
```

---

## 🧪 Testing

### Testes Manuais com cURL

#### Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@email.com","password":"senha123"}'
```

#### Criar Item (com token)

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Furadeira",
    "priceDaily": 25,
    "category": "Ferramentas",
    "condition": "Excelente"
  }'
```

#### Buscar Itens

```bash
curl http://localhost:3000/api/items?category=Ferramentas
```

### Testes com Postman/Insomnia

1. Importar collection
2. Configurar variável `{{baseUrl}}` = `http://localhost:3000`
3. Fazer login para obter token
4. Adicionar token no header de requisições protegidas

---

## 📚 Referências

### Dependências Principais

```json
{
  "express": "^4.18.2",
  "sqlite3": "^5.1.7",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5"
}
```

### Documentação Externa

- [Express.js](https://expressjs.com/)
- [SQLite3](https://www.sqlite.org/docs.html)
- [JWT](https://jwt.io/introduction)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

---

## 🚀 Próximos Passos

### Melhorias Planejadas

1. **Rate Limiting**: Limitar requisições por IP
2. **Paginação**: Adicionar limit/offset em listagens
3. **Filtros Avançados**: Ordenação, filtros compostos
4. **Upload de Imagens**: Sistema real de upload
5. **Notificações**: WebSocket para notificações em tempo real
6. **Testes Automatizados**: Jest/Mocha para testes unitários
7. **Documentação Swagger**: Interface interativa da API
8. **Cache**: Redis para otimizar consultas frequentes
9. **Logs Estruturados**: Winston para logs profissionais
10. **Métricas**: Monitoramento de performance

---

## 📁 Detalhamento de Arquivos

### server.js (Entry Point)

**Propósito**: Arquivo principal que inicializa o servidor Express.

**Configurações:**
- **Porta**: 3000 (padrão) ou definida via `process.env.PORT`
- **CORS**: Configuração permissiva para desenvolvimento
  - Permite todas as origens (`origin: true`)
  - Habilita credenciais
  - Headers permitidos: `Content-Type`, `Authorization`
  - Métodos permitidos: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Ordem de Registro de Rotas:**
```javascript
1. /api/items        // itemRoutes
2. /api/favorites    // favoriteRoutes
3. /api/rentals      // rentalRoutes
4. /api/users        // userRoutes (deve ser por último)
```

**⚠️ IMPORTANTE**: A ordem das rotas é crucial! `itemRoutes` deve vir antes de `userRoutes` para evitar conflito com a rota dinâmica `/:id`.

**Rota Raiz:**
```http
GET http://localhost:3000/

Resposta:
{
  "message": "🚀 Allugator API está rodando!",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/register, /api/login, /api/profile",
    "items": "/api/items, /api/my-items",
    "favorites": "/api/favorites",
    "rentals": "/api/rentals"
  }
}
```

---

### Controllers Detalhados

#### favoriteController.js

**Métodos Disponíveis:**

1. **addFavorite(req, res)**
   - Adiciona item aos favoritos
   - Requer autenticação
   - Valida presença de `itemId`

2. **removeFavorite(req, res)**
   - Remove item dos favoritos
   - `itemId` vem dos params da URL
   - Requer autenticação

3. **getUserFavorites(req, res)**
   - Lista todos os favoritos do usuário autenticado
   - Retorna itens completos (JOIN com tabela items)

4. **checkFavorite(req, res)**
   - Verifica se um item específico está nos favoritos
   - Retorna `{ isFavorite: true/false }`

5. **getFavoriteIds(req, res)**
   - Retorna apenas os IDs dos itens favoritados
   - Útil para marcar ícones de coração na UI
   - Retorna array: `[1, 5, 8, 12]`

6. **toggleFavorite(req, res)**
   - Adiciona OU remove favorito (toggle)
   - Baseado no parâmetro `isFavorite`
   - Se `isFavorite: true` → remove
   - Se `isFavorite: false` → adiciona

---

#### rentalController.js

**Métodos Disponíveis:**

1. **createRental(req, res)**
   - Cria novo aluguel
   - Valida dados obrigatórios
   - Verifica disponibilidade do item antes de criar
   - Atualiza status do item para `'rented'`
   - Campos requeridos:
     ```javascript
     {
       itemId: number,
       startDate: string (ISO),
       endDate: string (ISO),
       days: number,
       pricePerDay: number,
       totalPrice: number
     }
     ```

2. **getUserRentals(req, res)**
   - Lista todos os aluguéis do usuário autenticado
   - Inclui aluguéis onde o usuário é locatário (renter)
   - Retorna detalhes do item alugado (JOIN)

3. **getRentalById(req, res)**
   - Busca aluguel específico por ID
   - Inclui informações do item e usuários envolvidos

4. **checkItemAvailability(req, res)**
   - Verifica se item está disponível para aluguel
   - Retorna `{ available: true/false }`
   - Se alugado, retorna dados do aluguel atual

5. **completeRental(req, res)**
   - Finaliza um aluguel
   - Atualiza status para `'completed'`
   - Libera item (status volta para `'available'`)

6. **cancelRental(req, res)**
   - Cancela um aluguel
   - Atualiza status para `'cancelled'`
   - Libera item (status volta para `'available'`)

7. **getUserRentalHistory(req, res)**
   - Retorna histórico completo de aluguéis
   - Inclui aluguéis finalizados e cancelados
   - Útil para página de histórico

8. **getItemRentals(req, res)**
   - Lista todos os aluguéis de um item específico
   - Útil para proprietários verem histórico do item

---

### Services Detalhados

#### favoriteService.js

**Funções Principais:**

```javascript
addFavorite(userId, itemId)
// Adiciona item aos favoritos
// Verifica se já existe antes de adicionar
// Retorna: { status: 201, message: "..." }

removeFavorite(userId, itemId)
// Remove item dos favoritos
// Retorna: { status: 200, message: "..." }

getUserFavorites(userId)
// Busca todos os favoritos com JOIN
// Retorna itens completos + dados do proprietário
// Retorna: { status: 200, favorites: [...] }

isFavorite(userId, itemId)
// Verifica se item está nos favoritos
// Retorna: { status: 200, isFavorite: true/false }

getFavoriteIds(userId)
// Retorna apenas array de IDs
// Retorna: { status: 200, favoriteIds: [1, 5, 8] }

toggleFavorite(userId, itemId, isFavorite)
// Adiciona OU remove baseado no parâmetro
// Se isFavorite = true → remove
// Se isFavorite = false → adiciona
// Retorna: { status: 200/201, message: "..." }
```

**Lógica do Toggle:**
```javascript
if (isFavorite) {
  // Item JÁ está favoritado → REMOVER
  await removeFavorite(userId, itemId);
} else {
  // Item NÃO está favoritado → ADICIONAR
  await addFavorite(userId, itemId);
}
```

---

#### rentalService.js

**Funções Principais:**

```javascript
createRental(rentalData)
// Cria novo registro de aluguel
// Atualiza status do item para 'rented'
// Status inicial do aluguel: 'active'
// Retorna: { status: 201, data: { id, rentalId } }

getUserRentals(userId)
// Busca aluguéis onde userId = renterId
// JOIN com items e users (proprietário)
// Retorna: { status: 200, rentals: [...] }

getRentalById(rentalId)
// Busca aluguel específico
// Inclui dados do item e usuários
// Retorna: { status: 200, rental: {...} } ou 404

checkItemAvailability(itemId)
// Verifica status do item
// Busca aluguel ativo (status = 'active')
// Retorna: { 
//   status: 200, 
//   available: true/false,
//   currentRental?: {...}
// }

completeRental(rentalId)
// Atualiza status para 'completed'
// Libera item (status = 'available')
// Retorna: { status: 200, message: "..." }

cancelRental(rentalId)
// Atualiza status para 'cancelled'
// Libera item (status = 'available')
// Retorna: { status: 200, message: "..." }

getUserRentalHistory(userId)
// Busca TODOS os aluguéis do usuário
// Ordena por data de criação (mais recente primeiro)
// Retorna: { status: 200, history: [...] }

getItemRentals(itemId)
// Busca histórico de aluguéis de um item
// Útil para proprietários
// Retorna: { status: 200, rentals: [...] }
```

**Lógica de Disponibilidade:**
```javascript
// Item disponível se:
1. status = 'available' (não alugado)
   OU
2. Não possui aluguel ativo (status != 'active')

// Item indisponível se:
1. status = 'rented'
   E
2. Existe aluguel com status = 'active'
```

---

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro: "Token não fornecido"
```
Solução: Incluir header Authorization: Bearer {token}
```

#### 2. Erro: "Email já cadastrado"
```
Solução: Usar email diferente ou fazer login
```

#### 3. Erro: "Item não está disponível"
```
Solução: Verificar status do item e aluguéis ativos
```

#### 4. Banco de dados não existe
```
Solução: Executar migrations
node database/migrations/createTables.js
```

#### 5. CORS Error no frontend
```
Solução: Verificar configuração de CORS no server.js
Certifique-se de que o header Authorization está permitido
```

#### 6. Busca não retorna resultados
```
Solução: Verificar case-sensitivity
Categorias e condições devem ser exatas: 'Ferramentas', 'Excelente'
```

---

## 📝 Convenções de Código

### Nomenclatura

**Variáveis e Funções**: camelCase
```javascript
const userId = req.user.id;
function getUserRentals() { }
```

**Classes**: PascalCase
```javascript
class FavoriteController { }
```

**Arquivos**: camelCase
```javascript
favoriteController.js
itemService.js
```

**Constantes**: UPPER_SNAKE_CASE
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = 3000;
```

---

## 🎯 Melhores Práticas Implementadas

✅ **Separação de Responsabilidades**: Controllers, Services, Routes  
✅ **Autenticação JWT**: Token com expiração de 24h  
✅ **Hash de Senhas**: bcrypt com salt rounds = 10  
✅ **Prepared Statements**: Prevenção de SQL Injection  
✅ **Validação de Entrada**: Verificação de campos obrigatórios  
✅ **Status HTTP Corretos**: 200, 201, 400, 401, 403, 404, 409, 500  
✅ **Logs com Emojis**: Facilita debugging  
✅ **CORS Configurado**: Permite requisições do frontend  
✅ **Estrutura RESTful**: Verbos HTTP corretos  
✅ **Respostas Padronizadas**: Formato consistente de JSON

---

**Última atualização**: Novembro 2025  
**Versão da API**: 1.0  
**Desenvolvido por**: Equipe Allugator

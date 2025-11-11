# 📱 Documentação Frontend - Allugator

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxos de Navegação](#fluxos-de-navegação)
4. [Telas Principais](#telas-principais)
5. [APIs e Serviços](#apis-e-serviços)
6. [Componentes Compartilhados](#componentes-compartilhados)
7. [Utilitários](#utilitários)
8. [Padrões de Código](#padrões-de-código)
9. [Guia de Estilo Visual](#guia-de-estilo-visual)

---

## 🎯 Visão Geral

O **Allugator** é um aplicativo de aluguel de itens peer-to-peer (P2P), onde usuários podem:
- Listar seus itens para aluguel
- Buscar e alugar itens de outros usuários
- Gerenciar favoritos
- Acompanhar aluguéis ativos

### Tecnologias Utilizadas

- **React Native**: Framework principal
- **React Navigation**: Navegação entre telas
- **Expo**: Plataforma de desenvolvimento
- **AsyncStorage**: Armazenamento local (tokens, dados do usuário)
- **Axios**: Cliente HTTP para comunicação com API

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
Allugator/
├── screens/           # Telas do aplicativo
│   ├── store/         # Tela principal (loja)
│   ├── search/        # Busca de itens
│   ├── itemDetails/   # Detalhes do item
│   ├── payment/       # Pagamento
│   ├── addItem/       # Cadastro de item
│   ├── calendar/      # Seleção de data
│   ├── auth/          # Autenticação
│   ├── login/         # Login
│   ├── register/      # Cadastro
│   └── ...
├── apis/              # Clientes de API
│   ├── ItemApi.js
│   ├── RentalApi.js
│   ├── FavoriteApi.js
│   └── ...
├── components/        # Componentes reutilizáveis
│   ├── CustomButton/
│   ├── MessageDisplay/
│   └── ...
├── services/          # Serviços (storage, etc)
│   └── AuthStorage.js
├── utils/             # Utilitários
│   └── translationHelpers.js
└── assets/            # Imagens e recursos
    └── images/
        └── imageMap.js
```

---

## 🔄 Fluxos de Navegação

### 1. Fluxo de Autenticação

```
Login → Home (Store)
  └─ Registro → Login
```

### 2. Fluxo de Aluguel (Principal)

```
Store → ItemDetails → Payment → RentalTracking
  ↓
Search → SearchResults → ItemDetails → ...
```

**Detalhamento:**

1. **Store/Search**: Usuário visualiza itens disponíveis
2. **ItemDetails**: Seleciona quantidade de dias e vê disponibilidade
3. **Payment**: Confirma pagamento e cria aluguel
4. **RentalTracking**: Acompanha status do aluguel

### 3. Fluxo de Cadastro de Item

```
Store → (FAB +) → AddItem → Store (refresh)
```

### 4. Fluxo de Favoritos

```
Store → (❤️) → Favoritos atualizados
  └─ Favorites Screen → Lista de favoritos
```

---

## 📱 Telas Principais

### 1. StoreScreen (`screens/store/StoreScreen.js`)

**Propósito**: Tela principal que exibe todos os itens disponíveis para aluguel.

#### Estados Principais

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `items` | Array | Lista de todos os itens disponíveis |
| `loading` | Boolean | Indicador de carregamento inicial |
| `refreshing` | Boolean | Indicador de pull-to-refresh |
| `favorites` | Array | IDs dos itens favoritados |
| `currentUser` | Object | Dados do usuário logado |

#### Funções Principais

```javascript
loadUserData()
// Carrega dados do usuário do AsyncStorage
// Retorno: Atualiza state currentUser

loadItems()
// Busca todos os itens via API (getAllItems)
// Retorno: Atualiza state items

loadFavorites()
// Busca IDs dos favoritos via API (getFavoriteIds)
// Retorno: Atualiza state favorites

handleRefresh()
// Recarrega items e favoritos (pull-to-refresh)

handleItemPress(item)
// Navega para ItemDetails passando o item
// Parâmetros: item (Object)

handleFavorite(itemId, isFavorite)
// Adiciona/remove item dos favoritos
// Parâmetros: itemId (Number), isFavorite (Boolean)
// Retorno: Atualiza state favorites otimisticamente
```

#### Elementos Visuais

- **Header Verde**: Logo, título "Loja", nome do usuário
- **Botão de Busca**: Canto superior direito (🔍)
- **Lista de Itens**: Cards com imagem, título, preço, badges
- **Botão FAB**: Canto inferior direito (+) para adicionar item
- **Botão Favorito**: Coração em cada card

---

### 2. SearchScreen (`screens/search/SearchScreen.js`)

**Propósito**: Busca avançada de itens com múltiplos filtros.

#### Estados Principais

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `title` | String | Busca por título (parcial) |
| `selectedCategory` | String | Categoria selecionada |
| `selectedCondition` | String | Condição selecionada |
| `publishDate` | Date | Data de publicação (>= esta data) |
| `showDatePicker` | Boolean | Exibe/oculta seletor de data |
| `isLoading` | Boolean | Indicador de busca em andamento |

#### Funções Principais

```javascript
handleSearch()
// Executa busca com filtros preenchidos
// Processo:
// 1. Monta objeto filters com campos preenchidos
// 2. Chama searchItems(filters) da API
// 3. Navega para SearchResults com resultados
// Retorno: Navigate to SearchResults

handleCategoryPress(category)
// Toggle de seleção de categoria
// Se já selecionada → desmarca

handleConditionPress(condition)
// Toggle de seleção de condição
// Se já selecionada → desmarca

handleSelectDate(selectedDate)
// Recebe data do Calendar e atualiza publishDate
// Parâmetros: selectedDate (String YYYY-MM-DD)
```

#### Filtros Disponíveis

| Filtro | Tipo | Comportamento na API |
|--------|------|---------------------|
| **Título** | Parcial | `LIKE %title%` |
| **Categoria** | Exato | `= 'Categoria'` |
| **Condição** | Exato | `= 'Condição'` |
| **Data Publicação** | Range | `>= DATE(publishDate)` |

**⚠️ IMPORTANTE**: Valores de categoria e condição devem corresponder **exatamente** aos valores do banco (case-sensitive).

#### Categorias Válidas

```javascript
['Ferramentas', 'Móveis', 'Esportes', 'Camping', 
 'Eletrônicos', 'Veículos', 'Eventos', 'Outros']
```

#### Condições Válidas

```javascript
['Excelente', 'Bom']
```

---

### 3. ItemDetailsScreen (`screens/itemDetails/ItemDetailsScreen.js`)

**Propósito**: Exibe detalhes completos de um item e permite configurar aluguel.

#### Props de Navegação

```javascript
route.params = {
  item: Object  // Item completo vindo de Store ou Search
}
```

#### Estados Principais

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `selectedDays` | Number | Quantidade de dias (padrão: 3) |
| `totalPrice` | Number | Preço calculado (dias × preço/dia) |
| `isAvailable` | Boolean | Item disponível? |
| `checkingAvailability` | Boolean | Verificando disponibilidade? |
| `currentRental` | Object | Dados do aluguel atual (se alugado) |

#### Funções Principais

```javascript
fetchAvailability()
// Verifica em tempo real se item está disponível
// API: checkItemAvailability(itemId)
// Retorno: { available: Boolean, currentRental: Object }

useEffect([selectedDays])
// Recalcula totalPrice quando dias mudam
// totalPrice = pricePerDay × selectedDays

incrementDays()
// Adiciona 1 dia (sem limite)

decrementDays()
// Remove 1 dia (mínimo: 1)

handleConfirm()
// Navega para Payment com dados:
// { item, days: selectedDays, totalPrice }
```

#### Fluxo de Disponibilidade

1. Ao carregar tela → chama `checkItemAvailability()`
2. API verifica se existe aluguel ativo para o item
3. Se disponível → botão ativo
4. Se alugado → botão desabilitado + mostra data de fim do aluguel

---

### 4. PaymentScreen (`screens/payment/PaymentScreen.js`)

**Propósito**: Resumo do aluguel e confirmação de pagamento.

#### Props de Navegação

```javascript
route.params = {
  item: Object,      // Item sendo alugado
  days: Number,      // Quantidade de dias
  totalPrice: Number // Preço total calculado
}
```

#### Estados Principais

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `isProcessing` | Boolean | Processando pagamento? |

#### Cálculos Automáticos

```javascript
const pricePerDay = parseFloat(item.priceDaily || 0);
const subtotal = pricePerDay × days;
const couponDiscount = 0; // Não implementado
const total = subtotal - couponDiscount;
```

#### Função Principal

```javascript
handleConfirmPayment()
// Processo completo:
// 1. Calcula datas (startDate = hoje, endDate = hoje + days)
// 2. Monta rentalData = { itemId, startDate, endDate, days, pricePerDay, totalPrice }
// 3. Chama API createRental(rentalData)
// 4. Se sucesso (201) → navigation.replace('RentalTracking', { rentalId })
// 5. Se item indisponível (409) → Alert e volta
// 6. Se erro → Alert de erro

// IMPORTANTE: usa replace() para não permitir voltar para Payment
```

#### Possíveis Respostas da API

| Status | Significado | Ação |
|--------|-------------|------|
| 201 | Aluguel criado | Navega para RentalTracking |
| 409 | Item indisponível | Alert + goBack() |
| 400/500 | Erro | Alert de erro |

---

### 5. AddItemScreen (`screens/addItem/AddItemScreen.js`)

**Propósito**: Cadastro de novos itens para aluguel.

#### Estados do Formulário

| Estado | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `title` | String | ✅ | Título do item |
| `description` | String | ✅ | Descrição detalhada |
| `priceDaily` | String | ✅ | Preço por dia (R$) |
| `category` | String | ✅ | Categoria (padrão: 'Eletrônicos') |
| `condition` | String | ✅ | Condição (padrão: 'Excelente') |
| `location` | String | ✅ | Localização do item |
| `securityDeposit` | String | ❌ | Caução (opcional) |
| `photos` | String | ❌ | Nome da foto (padrão: 'default') |

#### Estados de UI

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `loading` | Boolean | Indicador de envio |
| `message` | String | Mensagem de feedback |
| `messageType` | String | 'error' ou 'success' |

#### Função de Validação e Envio

```javascript
handleSubmit()
// Validações:
// 1. Título não vazio
// 2. Descrição não vazia
// 3. Preço válido (> 0)
// 4. Localização não vazia

// Processo de envio:
// 1. Monta itemData com todos os campos
// 2. Converte priceDaily e securityDeposit para Number
// 3. Define photos como 'default' se vazio
// 4. Chama createItem(itemData)
// 5. Se sucesso → showMessage('success') + goBack() após 2s
// 6. Se erro → showMessage('error')
```

#### Objeto itemData Enviado

```javascript
{
  title: String,
  description: String,
  priceDaily: Number,
  category: String,        // Valor exato do banco
  condition: String,       // Valor exato do banco
  location: String,
  securityDeposit: Number, // 0 se não informado
  photos: String          // 'default' se não informado
}
```

**⚠️ CRÍTICO**: `category` e `condition` devem ter valores EXATOS do banco:
- **Categorias**: 'Eletrônicos', 'Ferramentas', 'Veículos', 'Móveis', 'Esportes', 'Camping', 'Eventos', 'Outros'
- **Condições**: 'Excelente', 'Bom'

**Problema já corrigido**: Anteriormente usava valores lowercase ('eletronicos', 'novo') que não batiam com o banco, fazendo itens não aparecerem em buscas.

---

### 6. SearchResultsScreen (`screens/searchResults/SearchResultsScreen.js`)

**Propósito**: Exibe resultados da busca.

#### Props de Navegação

```javascript
route.params = {
  items: Array,    // Lista de itens encontrados
  filters: Object  // Filtros aplicados
}
```

#### Informações Exibidas

1. **Filtros Aplicados**: Lista bullet com cada filtro usado
2. **Contador**: "X itens encontrados"
3. **Lista de Itens**: Cards clicáveis
4. **Estado Vazio**: Mensagem + botão "Nova Busca"

#### Interação

```javascript
// Ao clicar em um item:
navigation.navigate('ItemDetails', { item })
```

---

## 🔌 APIs e Serviços

### ItemApi (`apis/ItemApi.js`)

#### Funções Disponíveis

```javascript
getAllItems()
// GET /api/items
// Retorna: { items: Array }
// Descrição: Busca todos os itens disponíveis (status = 'available')

searchItems(filters)
// GET /api/items?title=...&category=...&condition=...&publishDate=...
// Parâmetros: filters = { title?, category?, condition?, publishDate? }
// Retorna: { items: Array }
// Descrição: Busca itens com filtros aplicados
```

### RentalApi (`apis/RentalApi.js`)

#### Funções Disponíveis

```javascript
checkItemAvailability(itemId)
// GET /api/rentals/check-availability/:itemId
// Parâmetros: itemId (Number)
// Retorna: { available: Boolean, currentRental?: Object }
// Descrição: Verifica se item está disponível ou em uso

createRental(rentalData)
// POST /api/rentals
// Parâmetros: rentalData = { itemId, startDate, endDate, days, pricePerDay, totalPrice }
// Retorna: { status: 201, data: { id, ... } } ou { status: 409 }
// Descrição: Cria novo aluguel no banco
```

### FavoriteApi (`apis/FavoriteApi.js`)

#### Funções Disponíveis

```javascript
getFavoriteIds()
// GET /api/favorites/ids
// Retorna: { favoriteIds: Array<Number> }
// Descrição: Busca apenas IDs dos favoritos do usuário

toggleFavorite(itemId, isFavorite)
// POST /api/favorites/toggle
// Parâmetros: itemId (Number), isFavorite (Boolean)
// Retorna: { status: 200 ou 201 }
// Descrição: Adiciona ou remove favorito
```

### ItemManagementApi (`apis/ItemManagementApi.js`)

#### Funções Disponíveis

```javascript
createItem(itemData)
// POST /api/items
// Parâmetros: itemData (Object)
// Retorna: { status: 201, data: { id, ... } }
// Descrição: Cria novo item no banco
```

### AuthStorage (`services/AuthStorage.js`)

#### Funções Disponíveis

```javascript
saveToken(token)
// Salva token JWT no AsyncStorage
// Key: '@allugator:token'

getToken()
// Recupera token do AsyncStorage
// Retorna: String ou null

saveUser(user)
// Salva dados do usuário no AsyncStorage
// Key: '@allugator:user'

getUser()
// Recupera dados do usuário
// Retorna: Object { id, name, email, ... }

clearStorage()
// Remove token e usuário (logout)
```

---

## 🧩 Componentes Compartilhados

### MessageDisplay (`components/MessageDisplay/MessageDisplay.js`)

**Propósito**: Exibe mensagens de feedback animadas (erro/sucesso).

#### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `message` | String | Texto da mensagem |
| `type` | String | 'error' ou 'success' |
| `onHide` | Function | Callback ao esconder (limpar state) |

#### Comportamento

- Aparece no topo da tela com animação
- Auto-esconde após 3 segundos
- Cores: vermelho (erro), verde (sucesso)

#### Uso

```javascript
const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState('error');

<MessageDisplay 
  message={message} 
  type={messageType}
  onHide={() => setMessage('')}
/>

// Exibir mensagem:
setMessage('Texto da mensagem');
setMessageType('success'); // ou 'error'
```

### CustomButton (`components/CustomButton/CustomButton.js`)

Botão customizado com estilo padrão do app.

### CustomTextInput (`components/CustomTextInput/CustomTextInput.js`)

Input de texto customizado com estilo padrão do app.

### ItemCard (`components/ItemCard/ItemCard.js`)

Card de item reutilizável (imagem, título, preço, badges).

---

## 🛠️ Utilitários

### translationHelpers (`utils/translationHelpers.js`)

**Propósito**: Traduz valores do banco (inglês) para exibição (português).

#### Funções Disponíveis

```javascript
translateItemStatus(status)
// Traduz status de itens
// Mapeamento:
// 'available' → 'Disponível'
// 'rented' → 'Alugado'
// 'unavailable' → 'Indisponível'
// Retorna: String traduzida ou valor original se não mapeado
```

**Por que existe?**

O banco armazena status em inglês (`available`, `rented`, `unavailable`) para consistência técnica, mas exibimos em português para o usuário.

#### Uso

```javascript
import { translateItemStatus } from '../../utils/translationHelpers';

// Exemplo:
<Text>{translateItemStatus(item.status)}</Text>
// Se item.status = 'available', exibe: "Disponível"
```

### imageMap (`assets/images/imageMap.js`)

**Propósito**: Mapeia nomes de imagens para recursos do projeto.

#### Função Principal

```javascript
getItemImage(photoName)
// Parâmetros: photoName (String) - nome da foto do item
// Retorna: require('path/to/image') ou imagem default
// Descrição: Busca imagem por nome, retorna default se não encontrar
```

#### Uso

```javascript
import { getItemImage } from '../../assets/images/imageMap';

<Image 
  source={getItemImage(item.photos)} 
  style={styles.image}
/>
```

---

## 📐 Padrões de Código

### 1. Nomenclatura de Variáveis

#### Estados

```javascript
// Plural para listas
const [items, setItems] = useState([]);
const [favorites, setFavorites] = useState([]);

// Singular para objetos
const [user, setUser] = useState(null);
const [item, setItem] = useState({});

// Booleanos com prefixo is/has/should
const [isLoading, setIsLoading] = useState(false);
const [isAvailable, setIsAvailable] = useState(true);
const [hasError, setHasError] = useState(false);
```

#### Funções

```javascript
// Handlers começam com "handle"
const handlePress = () => { ... };
const handleSubmit = () => { ... };
const handleFavorite = () => { ... };

// Funções de carregamento começam com "load"
const loadItems = async () => { ... };
const loadUser = async () => { ... };

// Funções de busca começam com "fetch"
const fetchAvailability = async () => { ... };
const fetchData = async () => { ... };
```

### 2. Estrutura de Componente

```javascript
/**
 * Documentação do componente
 */

// 1. IMPORTS
import React, { useState, useEffect } from 'react';
import { ... } from 'react-native';

// 2. CONSTANTES
const COLORS = { ... };
const CATEGORIES = [ ... ];

// 3. COMPONENTE
const ComponentName = ({ navigation, route }) => {
  // 3.1. PROPS/PARAMS
  const { param1, param2 } = route.params;
  
  // 3.2. ESTADOS
  const [state1, setState1] = useState(initialValue);
  const [state2, setState2] = useState(initialValue);
  
  // 3.3. EFFECTS
  useEffect(() => {
    // código
  }, [dependencies]);
  
  // 3.4. FUNÇÕES
  const handleFunction = () => {
    // código
  };
  
  // 3.5. RENDER
  return (
    <View>
      {/* JSX */}
    </View>
  );
};

// 4. ESTILOS
const styles = StyleSheet.create({
  // estilos
});

// 5. EXPORT
export default ComponentName;
```

### 3. Comentários

#### Comentários de Documentação

```javascript
/**
 * Nome da Função - Breve descrição
 * 
 * Descrição detalhada do que a função faz.
 * 
 * @param {Type} paramName - Descrição do parâmetro
 * @returns {Type} Descrição do retorno
 */
```

#### Comentários Inline

```javascript
// Comentário explicativo de uma linha

// Comentário explicativo
// de múltiplas linhas
// quando necessário
```

### 4. Tratamento de Erros

```javascript
try {
  setLoading(true);
  const response = await apiFunction();
  
  if (response.status === 200) {
    // Sucesso
    setData(response.data);
  } else {
    // Erro específico
    throw new Error(response.message);
  }
} catch (error) {
  console.error('❌ Erro ao [ação]:', error);
  Alert.alert('Erro', 'Mensagem amigável para o usuário');
} finally {
  setLoading(false);
}
```

### 5. Console Logs

Use emojis para facilitar identificação:

```javascript
console.log('🔍 Iniciando busca...'); // Busca/Search
console.log('📤 Enviando dados...'); // Envio
console.log('📥 Dados recebidos:', data); // Recebimento
console.log('✅ Sucesso!'); // Sucesso
console.log('❌ Erro:', error); // Erro
console.log('📦 Objeto:', obj); // Debug de objeto
console.log('📊 Contagem:', count); // Métricas
```

---

## 🎨 Guia de Estilo Visual

### Paleta de Cores Padrão

```javascript
const COLORS = {
  background: '#F0FFF0',   // Verde muito claro (fundo geral)
  primary: '#1DE9B6',      // Verde turquesa (primário)
  darkText: '#444444ff',   // Cinza escuro (texto principal)
  white: '#FFFFFF',        // Branco (cards, botões)
  lightGray: '#E0E0E0',    // Cinza claro (bordas)
  gray: '#888888',         // Cinza médio (texto secundário)
  lightGreen: '#E8F5E9',   // Verde clarinho (badges)
  shadow: '#00000026',     // Sombra (opacidade 15%)
};
```

### Layout Padrão das Telas

Todas as telas principais seguem este padrão:

```javascript
<View style={styles.container}>
  {/* 1. Background verde fixo (18% da altura) */}
  <View style={styles.background}>
    <View style={styles.headerContent}>
      <Text style={styles.headerTitle}>Título</Text>
    </View>
  </View>

  {/* 2. Botão de voltar absolutamente posicionado */}
  <TouchableOpacity style={styles.backButton} onPress={goBack}>
    <Text style={styles.backIcon}>←</Text>
  </TouchableOpacity>

  {/* 3. ScrollView com padding top */}
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    {/* 4. Card branco arredondado sobreposto */}
    <View style={styles.contentCard}>
      {/* Conteúdo da tela */}
    </View>
  </ScrollView>
</View>
```

#### Estilos Padrão

```javascript
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.18, // 18% da tela
    backgroundColor: COLORS.primary,
    zIndex: 0,
  },
  headerContent: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 999, // Sempre acima de tudo
    padding: 5,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.darkText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  scrollContainer: {
    paddingTop: screenHeight * 0.18, // Mesmo tamanho do background
  },
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 60, // Bordas arredondadas grandes
    borderTopRightRadius: 60,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
    minHeight: screenHeight * 0.82,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});
```

### Componentes de UI Comuns

#### Botão Primário

```javascript
<TouchableOpacity style={styles.primaryButton} onPress={handlePress}>
  <Text style={styles.primaryButtonText}>Texto do Botão</Text>
</TouchableOpacity>

// Estilos:
primaryButton: {
  backgroundColor: COLORS.primary,
  borderRadius: 25,
  paddingVertical: 18,
  alignItems: 'center',
  marginTop: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 5,
},
primaryButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: COLORS.white,
  letterSpacing: 0.5,
},
```

#### Input de Texto

```javascript
<TextInput
  style={styles.input}
  placeholder="Digite aqui..."
  placeholderTextColor={COLORS.gray}
  value={value}
  onChangeText={setValue}
/>

// Estilos:
input: {
  backgroundColor: COLORS.lightGreen,
  borderRadius: 12,
  padding: 15,
  fontSize: 16,
  color: COLORS.darkText,
  borderWidth: 1,
  borderColor: COLORS.lightGray,
},
```

#### Badge de Status

```javascript
<View style={styles.statusBadge}>
  <Text style={styles.statusText}>{translateItemStatus(status)}</Text>
</View>

// Estilos:
statusBadge: {
  backgroundColor: COLORS.lightGreen,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: COLORS.primary,
},
statusText: {
  fontSize: 12,
  color: COLORS.darkText,
  fontWeight: '600',
},
```

---

## 🔒 Autenticação e Segurança

### Fluxo de Token JWT

1. **Login**: Usuário faz login → API retorna token JWT
2. **Armazenamento**: Token salvo no AsyncStorage via `AuthStorage.saveToken()`
3. **Requisições**: Token incluído no header `Authorization: Bearer {token}`
4. **Logout**: Token removido do AsyncStorage

### Proteção de Rotas

Telas protegidas verificam token ao carregar:

```javascript
useEffect(() => {
  const checkAuth = async () => {
    const token = await AuthStorage.getToken();
    if (!token) {
      navigation.replace('Login');
    }
  };
  checkAuth();
}, []);
```

---

## 🐛 Debugging e Troubleshooting

### Problemas Comuns

#### 1. Itens não aparecem na busca

**Causa**: Valores de `category` ou `condition` não correspondem ao banco.

**Solução**: Verificar que valores enviados são EXATAMENTE iguais aos do banco (case-sensitive).

```javascript
// ❌ ERRADO
category: 'eletronicos'  // lowercase
condition: 'novo'        // não existe no banco

// ✅ CORRETO
category: 'Eletrônicos'  // com acento e capitalizado
condition: 'Excelente'   // valor exato do banco
```

#### 2. Token expirado

**Sintoma**: API retorna 401 Unauthorized

**Solução**: Implementar refresh token ou redirecionar para login.

```javascript
if (error.response?.status === 401) {
  await AuthStorage.clearStorage();
  navigation.replace('Login');
}
```

#### 3. Imagem não carrega

**Causa**: Nome da foto não existe no `imageMap.js`.

**Solução**: Adicionar imagem ao projeto ou verificar nome.

```javascript
// Sempre retorna default se não encontrar
const image = getItemImage(item.photos || 'default');
```

### Ferramentas de Debug

#### React Native Debugger

```bash
# Abrir menu de debug (Shake device ou Ctrl+M)
# Selecionar "Debug"
```

#### Console Logs

Use logs com emojis para facilitar filtro:

```bash
# Filtrar no console:
🔍  # Logs de busca
📤  # Logs de envio
📥  # Logs de recebimento
✅  # Logs de sucesso
❌  # Logs de erro
```

#### Network Inspector

Inspecione requisições HTTP:

```javascript
// Em ItemApi.js, RentalApi.js, etc.
console.log('📡 Request:', url, params);
console.log('📥 Response:', response);
```

---

## 📝 Checklist de Desenvolvimento

### Ao criar nova tela:

- [ ] Adicionar comentários de documentação no topo
- [ ] Seguir estrutura padrão de layout (background + card)
- [ ] Usar paleta de cores COLORS
- [ ] Adicionar tratamento de erros (try/catch)
- [ ] Implementar loading states
- [ ] Adicionar console.logs com emojis
- [ ] Testar navegação (goBack, navigate)
- [ ] Verificar responsividade (Dimensions)

### Ao criar nova API:

- [ ] Adicionar tratamento de erros
- [ ] Incluir logs de request/response
- [ ] Documentar parâmetros e retornos
- [ ] Incluir Authorization header se necessário
- [ ] Testar status codes (200, 201, 400, 401, 409, 500)

### Ao fazer commit:

- [ ] Remover console.logs desnecessários
- [ ] Verificar erros no VSCode
- [ ] Testar funcionalidade completa
- [ ] Atualizar documentação se necessário

---

## 🚀 Próximos Passos (Roadmap)

### Melhorias Planejadas

1. **Favoritos**:
   - Tela completa de favoritos
   - Filtros e ordenação

2. **Perfil**:
   - Edição de dados do usuário
   - Histórico de aluguéis
   - Avaliações

3. **Notificações**:
   - Push notifications
   - Alertas de aluguel próximo ao fim

4. **Chat**:
   - Conversa entre locador e locatário
   - Negociação de preços

5. **Pagamento**:
   - Integração com gateway real (PIX, cartão)
   - Comprovantes

6. **Avaliações**:
   - Sistema de reviews
   - Reputação de usuários

---

## 📞 Contato e Suporte

Para dúvidas sobre o código:

1. Consultar esta documentação
2. Verificar comentários no código
3. Procurar no histórico de commits
4. Contatar desenvolvedor responsável

---

## 📄 Changelog

### v1.0.0 (Atual)

- ✅ Sistema de autenticação (login/registro)
- ✅ Listagem de itens (Store)
- ✅ Busca avançada com filtros
- ✅ Detalhes do item
- ✅ Confirmação de pagamento
- ✅ Cadastro de itens
- ✅ Sistema de favoritos
- ✅ Verificação de disponibilidade em tempo real
- ✅ Tradução de status (inglês → português)
- ✅ Layout padronizado (background verde + card branco)

---

**Última atualização**: Novembro 2025  
**Versão da documentação**: 1.0  
**Desenvolvido por**: Equipe Allugator

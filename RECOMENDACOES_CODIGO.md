# 🔍 Análise de Código: Autenticação, Transação e Loja

## 📊 Resumo Executivo

Seu código está **bem estruturado**, mas identifiquei **3 problemas críticos** e **7 recomendações importantes** que podem melhorar segurança, performance e experiência do usuário.

---

## ⚠️ PROBLEMAS CRÍTICOS (Corrigir Agora)

### 1. **[CRÍTICO] Dependência Circular em `handleRegister` → `handleLogin`**

**Localização:** `Allugator/contexts/AuthContext.js` (linhas 124-140)

**Problema:**
```javascript
// ❌ PROBLEMA: Dependência circular
const handleRegister = useCallback(async (...) => {
  // ... register API call
  if (response.userId) {
    const loginResult = await handleLogin(email, password);
    // handleLogin está no mesmo useCallback, pode causar issues
  }
}, []); // Array de dependências vazio!
```

**Risco:**
- `handleRegister` chama `handleLogin`, mas `handleLogin` não está no array de dependências
- Pode causar versões desatualizadas da função
- React warnings em modo desenvolvimento

**Solução:**
```javascript
// ✅ CORRETO: Adicione handleLogin nas dependências
const handleRegister = useCallback(async (name, email, password, phoneNumber) => {
  // ... seu código
}, [handleLogin]); // ← Adicione isso

// OU melhor: Não use handleRegister dentro de handleLogin
// Faça login direto na resposta do register (ver recomendação abaixo)
```

---

### 2. **[CRÍTICO] Backend `register` retorna resposta diferente de `login`**

**Localização:** `AllugatorApi/services/userService.js` (linhas 70-110)

**Problema:**
```javascript
// ❌ Register retorna SÓ userId
register() {
  resolve({
    status: 201,
    message: "Usuário cadastrado com sucesso!",
    userId: this.lastID  // ← Apenas o ID!
  });
}

// ✅ Login retorna token + user
login() {
  resolve({
    status: 200,
    token: token,           // ← Token JWT
    user: { id, name, email }, // ← Dados do usuário
    message: "Login realizado com sucesso!"
  });
}
```

**Risco:**
- Frontend faz fallback para auto-login, mas é menos eficiente
- Inconsistência na API (endpoints com formatos diferentes)
- Dificulta manutenção futura

**Solução Recomendada:**
```javascript
// ✅ MELHOR: Register retorna token + user (igual login)
async register(name, email, phoneNumber, password) {
  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (name, email, phoneNumber, password) VALUES (?,?,?,?)';
      db.run(sql, [name, email, phoneNumber, passwordHash], function(err) {
        if (err) {
          reject({
            status: 400,
            message: err.code === 'SQLITE_CONSTRAINT' 
              ? "Este email já está em uso." 
              : "Erro ao salvar usuário."
          });
          return;
        }

        // ✨ Novo: Gera token logo após criar usuário
        const newUser = { 
          id: this.lastID, 
          name, 
          email 
        };
        
        const token = this.generateToken(newUser);

        resolve({
          status: 201,
          message: "Usuário cadastrado com sucesso!",
          token: token,      // ← Agora retorna token
          user: newUser,     // ← E dados do usuário
          userId: this.lastID
        });
      });
    });
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
}
```

**Benefícios:**
- Frontend não precisa fazer login automático
- Resposta consistente entre register e login
- Uma única chamada ao invés de duas

---

### 3. **[CRÍTICO] TransactionScreen recarrega ao focar na tab**

**Localização:** `Allugator/screens/transaction/TransactionScreen.js` (linhas 65-75)

**Problema:**
```javascript
useFocusEffect(
  useCallback(() => {
    setSelectedTab('myItems');  // ← Sempre volta para "Meus Itens"
    setMessage('');
    loadTransactions();         // ← Recarrega SEMPRE que volta pra tab
  }, [])
);
```

**Risco:**
- Recarrega dados desnecessariamente (API call a cada focar)
- Péssima UX: usuário perde contexto ao sair e voltar
- Alto consumo de banda e bateria
- Lentidão perceptível

**Solução:**
```javascript
// ✅ MELHOR: Apenas recarregue se necessário
useFocusEffect(
  useCallback(() => {
    // Não reseta aba automaticamente
    // Não recarrega dados automaticamente
    // Apenas limpa mensagens antigas
    setMessage('');
    
    // Recarregue apenas se os dados estiverem muito antigos (opcional)
    // const timeElapsed = Date.now() - lastLoadTime;
    // if (timeElapsed > 5 * 60 * 1000) { // 5 minutos
    //   loadTransactions();
    // }
  }, [])
);

// ✅ Carregue uma única vez ao montar:
useEffect(() => {
  loadTransactions();
}, []); // Sem o useFocusEffect!
```

---

## 🎯 RECOMENDAÇÕES IMPORTANTES

### 4. **StoreScreen: Filtragem de Categoria Quebrada**

**Localização:** `Allugator/screens/storeSystem/store/StoreScreen.js` (linhas 300-350)

**Problema:**
```javascript
// ❌ Há um bloco de categoria que chama funções inexistentes:
{items.length === 0 && !showingMyItems && (
  // ...
  onPress={() => {
    setSelectedCategory(null);     // ← Não existe!
    setFilteredItems(items);        // ← Não existe!
  }}
)}
```

**Solução:**
```javascript
// ✅ Use as funções corretas do hook:
onPress={() => {
  handleCategoryFilter(null);  // ← Função correta do useItems hook
  // (setFilteredItems é gerenciada internamente)
}}
```

---

### 5. **Adicionar Validação de Token Expirado**

**Localização:** `Allugator/contexts/AuthContext.js` (bootstrap)

**Problema:**
```javascript
// ❌ Apenas restaura token do AsyncStorage
// Não valida se o token ainda é válido!
const bootstrapAsync = async () => {
  const savedToken = await AuthStorage.getToken();
  const savedUser = await AuthStorage.getUser();
  
  if (savedToken && savedUser) {
    // ❌ Assume que token é válido
    setToken(savedToken);
    setUser(savedUser);
  }
};
```

**Solução:**
```javascript
// ✅ Valide o token antes de usar
const bootstrapAsync = async () => {
  try {
    const savedToken = await AuthStorage.getToken();
    const savedUser = await AuthStorage.getUser();
    
    if (savedToken && savedUser) {
      // Valida o token decodificando-o
      try {
        const decoded = jwtDecode(savedToken);
        
        // Verifica se expirou
        if (decoded.exp * 1000 > Date.now()) {
          setToken(savedToken);
          setUser(savedUser);
        } else {
          // Token expirado - limpa e força novo login
          await AuthStorage.clearToken();
          await AuthStorage.clearUser();
          setIsSignout(true);
        }
      } catch (e) {
        // Token inválido - limpa e força novo login
        console.error('Token inválido:', e);
        await AuthStorage.clearToken();
        await AuthStorage.clearUser();
        setIsSignout(true);
      }
    }
  } catch (error) {
    console.error('Erro ao restaurar sessão:', error);
  } finally {
    setLoading(false);
  }
};
```

**Instale a dependência:**
```bash
npm install jwt-decode
```

---

### 6. **Melhorar Tratamento de Erros no StoreScreen**

**Localização:** `Allugator/screens/storeSystem/store/StoreScreen.js`

**Problema:**
```javascript
// ❌ Sem tratamento de erros visível
const { items, loading, error } = useItems();

if (loading) return <ActivityIndicator />;
// ❌ E se houver erro? Usuário não vê nada!
```

**Solução:**
```javascript
// ✅ Mostre erros ao usuário
if (loading) return <ActivityIndicator />;

if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>⚠️ Erro ao carregar itens</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity onPress={loadItems} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 7. **TransactionScreen: Adicionar Confirmação antes de Deletar**

**Localização:** `Allugator/screens/transaction/TransactionScreen.js` (linhas 280-320)

**Problema:**
```javascript
// ⚠️ Abre modal mas não previne ações acidentais
const handleDeleteItem = async (item) => {
  setDeleteConfirmation(item); // ← Modal pode não aparecer se bug
};
```

**Recomendação:**
```javascript
// ✅ Use Alert.alert como fallback
const handleDeleteItem = async (item) => {
  Alert.alert(
    '🗑️ Deletar Item',
    `Tem certeza que deseja deletar "${item.name}"?\n\nEsta ação não pode ser desfeita.`,
    [
      { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
      {
        text: 'Deletar',
        onPress: () => confirmDelete(item),
        style: 'destructive'
      }
    ]
  );
};
```

---

### 8. **Adicionar Tratamento para Itens Sem Foto**

**Localização:** Ambos `TransactionScreen.js` e `StoreScreen.js`

**Problema:**
```javascript
// ❌ Se não houver foto, componente quebra
<Image 
  source={getItemImage(item.photos)}
  style={styles.itemImage}
/>
```

**Solução:**
```javascript
// ✅ Adicione placeholder
<Image 
  source={getItemImage(item.photos) || require('../assets/images/placeholder.png')}
  style={styles.itemImage}
  defaultSource={require('../assets/images/placeholder.png')}
/>
```

---

## 📋 Checklist de Ações

### Prioridade Crítica (Hoje):
- [ ] Mover `handleLogin` dependência no `useCallback` de `handleRegister`
- [ ] Modificar backend `register()` para retornar `token + user`
- [ ] Remover recarregamento automático no `useFocusEffect` do TransactionScreen
- [ ] Corrigir chamadas `setSelectedCategory` e `setFilteredItems` no StoreScreen

### Prioridade Alta (Esta Semana):
- [ ] Adicionar validação de token expirado
- [ ] Melhorar tratamento de erros visível no StoreScreen
- [ ] Adicionar confirmação com `Alert.alert` antes de deletar

### Prioridade Média (Próximas Sprints):
- [ ] Criar placeholder de imagem para itens sem foto
- [ ] Considerar cache de dados (Redux ou Context avançado)
- [ ] Adicionar testes unitários para AuthContext

---

## 📊 Resumo de Impacto

| Problema | Severidade | Impacto | Tempo Fix |
|----------|-----------|--------|----------|
| Dependência circular useCallback | 🔴 Crítico | Warnings React | 5 min |
| Register sem token | 🔴 Crítico | UX pobre (2 requests) | 10 min |
| Recarregamento forçado | 🔴 Crítico | UX ruim, bateria | 5 min |
| Categorias quebradas | 🟠 Alto | Filtro não funciona | 5 min |
| Token expirado | 🟠 Alto | Segurança | 15 min |
| Sem tratamento de erros | 🟡 Médio | UX confusa | 10 min |
| Sem confirmação delete | 🟡 Médio | UX ruim | 10 min |
| Sem imagem placeholder | 🟡 Médio | UI quebrada | 5 min |

**Tempo Total para Corrigir:** ~60 minutos (com código pronto)

---

## ✅ Próximos Passos

1. **Agora:** Corrija os 3 problemas críticos (15 minutos)
2. **Depois:** Implemente as 5 recomendações (45 minutos)
3. **Teste:** Valide cada mudança (que você já deve estar fazendo)
4. **Commit:** Faça um commit com mensagem clara

Quer que eu implemente essas mudanças para você? 🚀

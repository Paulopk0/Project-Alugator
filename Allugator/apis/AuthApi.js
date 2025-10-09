const API_URL = 'http://192.168.1.100:3000';

/**
 * Função para fazer login de um usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário logado
 */
const loginUser = async (email, password) => {
  console.log('--- Iniciando Tentativa de Login ---');
  console.log('Email recebido:', email);
  // Não vamos logar a senha por segurança, mas sabemos que ela foi recebida.

  try {
    const requestBody = JSON.stringify({ email, password });
    console.log('Enviando para API (login):', requestBody);

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('Resposta da API recebida. Status:', response.status);

    const data = await response.json();
    console.log('Dados da resposta (login):', data);

    if (!response.ok) {
      console.error('Resposta da API não foi "ok". Mensagem:', data.message);
      throw new Error(data.message || 'Falha no login');
    }

    console.log('Login bem-sucedido!');
    return data;
  } catch (error) {
    // Este console.error já existia, mas é muito importante.
    console.error('Erro no login:', error);
    throw error;
  }
};

/**
 * Função para registrar um novo usuário
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.name - Nome do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.phoneNumber - Telefone do usuário
 * @param {string} userData.password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário registrado
 */
const registerUser = async (userData) => {
  console.log('--- Iniciando Tentativa de Registro ---');
  console.log('Dados de usuário recebidos:', userData);

  try {
    const requestBody = JSON.stringify(userData);
    console.log('Enviando para API (registro):', requestBody);

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log('Resposta da API recebida. Status:', response.status);

    const data = await response.json();
    console.log('Dados da resposta (registro):', data);

    if (!response.ok) {
      console.error('Resposta da API não foi "ok". Mensagem:', data.message);
      throw new Error(data.message || 'Falha no registro');
    }

    console.log('Registro bem-sucedido!');
    return data;
  } catch (error) {
    // Este console.error já existia.
    console.error('Erro no registro:', error);
    throw error;
  }
};

export { loginUser, registerUser };
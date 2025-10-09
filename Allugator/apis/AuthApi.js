// URL base da sua API. Substitua pelo endereço real.
const API_URL = 'http://192.168.1.100:3000';

/**
 * Função para fazer login de um usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário logado
 */
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no login');
    }

    return data;
  } catch (error) {
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
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no registro');
    }

    return data;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

export { loginUser, registerUser };
import AuthStorage from '../services/AuthStorage';
const API_URL = 'http://localhost:3000/api';

/**
 * Função para obter headers com token de autenticação
 */
const getAuthHeaders = async () => {
  const token = await AuthStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Função para fazer login de um usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário logado
 */
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no login');
    }

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
const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha no registro');
    }

    return data;
  } catch (error) {
    // Este console.error já existia.
    console.error('Erro no registro:', error);
    throw error;
  }
};

/**
 * Função para obter perfil do usuário autenticado
 * @returns {Promise<Object>} Dados do perfil
 */
const getUserProfile = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao obter perfil');
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    throw error;
  }
};

/**
 * Função para fazer logout
 */
const logout = async () => {
  try {
    await AuthStorage.clearAuth();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

export { login, register, getUserProfile, logout };
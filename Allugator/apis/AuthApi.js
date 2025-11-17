/*
 * AuthApi
 *
 * Responsabilidade: camada de chamadas HTTP relacionadas à autenticação.
 * Blocos importantes:
 * - `login`, `register`: endpoints que retornam token + user ou mensagens de erro.
 * - `getUserProfile`: utiliza token salvo em `AuthStorage` via `getAuthHeaders()`.
 * - `logout`: local; limpa storage (server-side logout é opcional).
 *
 * Segurança / Operação:
 * - Não exponha tokens ou senhas em logs em produção.
 * - `getAuthHeaders()` lê o token via `AuthStorage` e adiciona `Authorization`.
 */

import AuthStorage from '../services/AuthStorage';
import API_URL from '../config/api';

console.log('[AuthApi] API_URL importado:', API_URL);

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
    console.log(`[AuthApi] Tentando login com email: ${email}`);
    console.log(`[AuthApi] URL da API: ${API_URL}/login`);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`[AuthApi] Response status: ${response.status}`);
    console.log(`[AuthApi] Response headers:`, response.headers);
    
    const text = await response.text();
    console.log(`[AuthApi] Response body (texto): ${text}`);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[AuthApi] Erro ao fazer parse JSON:`, parseError);
      console.error(`[AuthApi] Texto recebido:`, text);
      throw new Error(`Servidor retornou resposta inválida: ${text.substring(0, 100)}`);
    }

    console.log(`[AuthApi] Data parseada (login):`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.message || 'Falha no login');
    }

    console.log(`[AuthApi] Login bem-sucedido, retornando:`, JSON.stringify(data, null, 2));
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
const register = async (userData) => {
  try {
    console.log(`[AuthApi] userData completo:`, userData);
    console.log(`[AuthApi] Tentando registrar com email: ${userData.email}`);
    console.log(`[AuthApi] URL da API: ${API_URL}/register`);
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log(`[AuthApi] Response status: ${response.status}`);
    
    const text = await response.text();
    console.log(`[AuthApi] Response body (texto): ${text}`);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[AuthApi] Erro ao fazer parse JSON:`, parseError);
      console.error(`[AuthApi] Texto recebido:`, text);
      throw new Error(`Servidor retornou resposta inválida: ${text.substring(0, 100)}`);
    }

    console.log(`[AuthApi] Data parseada:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Falha no registro');
    }

    console.log(`[AuthApi] Registro bem-sucedido, retornando:`, data);
    return data;
  } catch (error) {
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
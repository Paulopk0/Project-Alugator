/**
 * UserApi.js
 * * Gerencia chamadas de API relacionadas a ações do usuário
 * (Editar Perfil, Mudar senha, apagar conta)
 */

import AuthStorage from '../services/AuthStorage';
import API_URL from '../config/api';

const getAuthHeaders = async () => {
  const token = await AuthStorage.getToken();
  if (!token) throw new Error('Token não encontrado');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Atualiza o perfil do usuário
 * @param {string} name - Novo nome
 * @param {string} phoneNumber - Novo telefone
 * @returns {Promise<Object>} Resposta da API com usuário atualizado
 *
 * Nota de segurança/uso:
 * - `getAuthHeaders()` lança se não houver token. Chamadas para este arquivo
 *   devem ser feitas quando o usuário estiver autenticado.
 * - As funções adicionam `statusCode` ao objeto retornado para facilitar
 *   decisões de UI (ex.: diferenciar erro 400 de 500). Mantenha esse comportamento
 *   se for consumido em vários lugares.
 */
export const updateProfile = async (name, phoneNumber) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name, phoneNumber })
    });
    
    const data = await response.json();
    data.statusCode = response.status;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};


/**
 * Altera a senha do usuário
 * @param {string} oldPassword - Senha atual
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resposta da API
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ oldPassword, newPassword })
    });
    
    const data = await response.json();
    data.statusCode = response.status;
    return data;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
};

/**
 * Apaga a conta do usuário
 * @param {string} password - Senha de confirmação
 * @returns {Promise<Object>} Resposta da API
 */
export const deleteAccount = async (password) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/delete-account`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ password })
    });

    const data = await response.json();
    data.statusCode = response.status;
    return data;
  } catch (error) {
    console.error('Erro ao apagar conta:', error);
    throw error;
  }
};
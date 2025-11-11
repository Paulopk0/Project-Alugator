import AuthStorage from '../services/AuthStorage';

const API_URL = 'http://localhost:3000/api';

/**
 * Retorna o header de autenticação com o token JWT
 */
const getAuthHeaders = async () => {
  try {
    const token = await AuthStorage.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

/**
 * Adiciona um item aos favoritos
 * @param {number} itemId - ID do item a ser favoritado
 * @returns {Promise<Object>} - Resposta da API
 */
export const addFavorite = async (itemId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ itemId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    throw error;
  }
};

/**
 * Remove um item dos favoritos
 * @param {number} itemId - ID do item a ser removido dos favoritos
 * @returns {Promise<Object>} - Resposta da API
 */
export const removeFavorite = async (itemId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/favorites/${itemId}`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    throw error;
  }
};

/**
 * Lista todos os favoritos do usuário
 * @returns {Promise<Object>} - Lista de favoritos
 */
export const getUserFavorites = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    throw error;
  }
};

/**
 * Verifica se um item está nos favoritos
 * @param {number} itemId - ID do item a verificar
 * @returns {Promise<Object>} - { isFavorite: boolean }
 */
export const checkFavorite = async (itemId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/favorites/check/${itemId}`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    throw error;
  }
};

/**
 * Retorna os IDs dos itens favoritados
 * @returns {Promise<Object>} - { favoriteIds: number[] }
 */
export const getFavoriteIds = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/favorites/ids`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar IDs de favoritos:', error);
    throw error;
  }
};

/**
 * Toggle favorito (adiciona se não existe, remove se existe)
 * @param {number} itemId - ID do item
 * @param {boolean} isFavorite - Se o item já é favorito
 * @returns {Promise<Object>} - Resposta da API
 */
export const toggleFavorite = async (itemId, isFavorite) => {
  if (isFavorite) {
    return await removeFavorite(itemId);
  } else {
    return await addFavorite(itemId);
  }
};

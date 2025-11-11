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
 * Função para buscar todos os items disponíveis
 * @returns {Promise<Object>} Lista de items
 */
const getAllItems = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/items`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao buscar items');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar items:', error);
    throw error;
  }
};

/**
 * Função para buscar um item específico por ID
 * @param {number} id - ID do item
 * @returns {Promise<Object>} Dados do item
 */
const getItemById = async (id) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao buscar item');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    throw error;
  }
};

/**
 * Função para criar um novo item
 * @param {Object} itemData - Dados do item
 * @returns {Promise<Object>} Item criado
 */
const createItem = async (itemData) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(itemData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao criar item');
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    throw error;
  }
};

/**
 * Função para buscar items com filtros
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Object>} Lista de items filtrados
 */
const searchItems = async (filters) => {
  try {
    const headers = await getAuthHeaders();
    
    // Construir query string com filtros
    const params = new URLSearchParams();
    if (filters.searchText) params.append('search', filters.searchText);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.timeFilter) params.append('timeFilter', filters.timeFilter);
    
    const response = await fetch(`${API_URL}/items?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao buscar items');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar items:', error);
    throw error;
  }
};

export { getAllItems, getItemById, createItem, searchItems };

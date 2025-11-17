/*
 * ItemApi
 *
 * Camada de comunicação com a API para operações de leitura (items):
 * - `getAllItems`, `getItemById`, `searchItems`, `getMyItems`, `createItem`.
 *
 * Observações importantes:
 * - `getAuthHeaders()` injeta o token quando presente; todas as chamadas usam esse helper.
 * - `searchItems()` constrói query string com `URLSearchParams` — ao alterar filtros,
 *   mantenha compatibilidade com os parâmetros esperados pelo backend.
 */

import AuthStorage from '../services/AuthStorage';
import API_URL from '../config/api';

/**
 * Função para obter headers com token de autenticação aqui finaliza
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
    
    console.log('🔍 Filtros de busca:', filters);
    
    // Construir query string com filtros baseados nos atributos do banco
    const params = new URLSearchParams();
    if (filters.title) params.append('title', filters.title);
    if (filters.category) params.append('category', filters.category);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.publishDate) params.append('publishDate', filters.publishDate);
    
    const url = `${API_URL}/items?${params.toString()}`;
    console.log('📡 URL da busca:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    console.log('📥 Resultado da busca:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao buscar items');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar items:', error);
    throw error;
  }
};

/**
 * Função para buscar todos os itens do usuário logado
 * @returns {Promise<Object>} Lista de itens do usuário
 */
const getMyItems = async () => {
  try {
    const headers = await getAuthHeaders();
    
    // Usa a rota que retorna informações do aluguel ativo
    const response = await fetch(`${API_URL}/my-items-with-rentals`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Falha ao buscar seus itens');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar seus itens:', error);
    throw error;
  }
};

export { getAllItems, getItemById, createItem, searchItems, getMyItems };

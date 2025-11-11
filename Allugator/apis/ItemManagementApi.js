import AuthStorage from '../services/AuthStorage';

const API_URL = 'http://localhost:3000/api';

// Helper para obter headers com autenticação
const getAuthHeaders = async () => {
  const token = await AuthStorage.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Criar um novo item
export const createItem = async (itemData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar item:', error);
    throw error;
  }
};

// Buscar itens do usuário logado
export const getMyItems = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/my-items`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar meus itens:', error);
    throw error;
  }
};

// Atualizar um item
export const updateItem = async (itemId, itemData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(itemData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
};

// Deletar um item
export const deleteItem = async (itemId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
};

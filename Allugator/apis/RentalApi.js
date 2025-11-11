import AuthStorage from '../services/AuthStorage';

const API_URL = 'http://localhost:3000/api/rentals';

// Helper para obter headers com autenticação
const getAuthHeaders = async () => {
  const token = await AuthStorage.getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Criar um novo aluguel
export const createRental = async (rentalData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(rentalData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar aluguel:', error);
    throw error;
  }
};

// Buscar aluguéis do usuário logado
export const getUserRentals = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar aluguéis:', error);
    throw error;
  }
};

// Verificar disponibilidade de um item
export const checkItemAvailability = async (itemId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/check/${itemId}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    throw error;
  }
};

// Buscar aluguel específico
export const getRentalById = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${rentalId}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar aluguel:', error);
    throw error;
  }
};

// Finalizar aluguel
export const completeRental = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${rentalId}/complete`, {
      method: 'PUT',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao finalizar aluguel:', error);
    throw error;
  }
};

// Cancelar aluguel
export const cancelRental = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${rentalId}`, {
      method: 'DELETE',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao cancelar aluguel:', error);
    throw error;
  }
};

// Confirmar retirada do item
export const confirmPickup = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${rentalId}/pickup`, {
      method: 'PUT',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao confirmar retirada:', error);
    throw error;
  }
};

// Confirmar devolução do item
export const confirmReturn = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${rentalId}/return`, {
      method: 'PUT',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao confirmar devolução:', error);
    throw error;
  }
};

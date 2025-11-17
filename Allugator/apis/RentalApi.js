/*
 * RentalApi
 *
 * Camada de comunicação com os endpoints de aluguel (`/rentals`).
 * Responsabilidades principais:
 * - Criar / consultar / atualizar / cancelar aluguéis
 * - Consultar disponibilidade (por item ou por intervalo de datas)
 * - Confirmar retirada/devolução e pagamentos
 *
 * Observações importantes:
 * - Todas as chamadas usam o token JWT salvo em `AuthStorage` via `getAuthHeaders()`;
 *   chamadas sem token irão falhar no backend com 401.
 * - Ao alterar rotas no backend, atualize as constantes e os consumidores (contexts/screens).
 * - Evite logar dados sensíveis (informações de pagamento, tokens) em produção.
 */

import AuthStorage from '../services/AuthStorage';
import API_URL from '../config/api';

// API_URL aqui já inclui `/api`, então adicionamos `/rentals`
const API_RENTALS_URL = `${API_URL}/rentals`;

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
    const response = await fetch(API_RENTALS_URL, {
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
    const response = await fetch(API_RENTALS_URL, {
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
    const response = await fetch(`${API_RENTALS_URL}/check/${itemId}`, {
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
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}`, {
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
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}/complete`, {
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
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}`, {
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
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}/pickup`, {
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
    const url = `${API_RENTALS_URL}/${rentalId}/return`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao confirmar devolução');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao confirmar devolução:', error);
    throw error;
  }
};

// Buscar itens que o usuário colocou para alugar (e estão sendo alugados por outros)
export const getMyRentedOutItems = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_RENTALS_URL}/my-items`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar itens alugados:', error);
    throw error;
  }
};

// Buscar histórico de aluguéis (aluguéis finalizados)
export const getRentalHistory = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_RENTALS_URL}/history`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
};

// Buscar detalhes completos de um aluguel
export const getRentalDetails = async (rentalId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}/details`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes do aluguel:', error);
    throw error;
  }
};

// Confirmar pagamento de um aluguel
export const confirmPayment = async (rentalId, paymentData = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_RENTALS_URL}/${rentalId}/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    throw error;
  }
};

// Verificar disponibilidade com datas específicas
export const checkItemAvailabilityByDates = async (itemId, startDate, endDate) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_RENTALS_URL}/check/${itemId}?startDate=${startDate}&endDate=${endDate}`, 
      {
        method: 'GET',
        headers
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    throw error;
  }
};

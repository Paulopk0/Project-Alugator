/**
 * RentalContext
 * 
 * Contexto centralizado para gerenciamento de aluguéis
 * Gerencia: aluguéis do usuário, aluguéis de itens alugados, confirmação, cancelamento, rastreamento
 */

import React, { createContext, useCallback, useState, useEffect } from 'react';
import {
  getUserRentals,
  getRentalHistory,
  getRentalDetails,
  cancelRental,
  confirmPayment,
  checkItemAvailabilityByDates,
} from '../apis/RentalApi';

/**
 * Context para gerenciamento de aluguéis
 */
export const RentalContext = createContext();

/**
 * Provider do RentalContext
 * 
 * Estado:
 * - myRentals: Aluguéis que o usuário logado fez (como locatário)
 * - rentalHistory: Histórico de aluguéis finalizados
 * - currentRental: Aluguel atualmente em processamento/rastreamento
 * - loading: Indica se está carregando dados
 * - error: Mensagem de erro, se houver
 * 
 * Métodos:
 * - loadMyRentals(): Carrega aluguéis do usuário logado
 * - loadRentalHistory(): Carrega histórico de aluguéis
 * - getRentalById(rentalId): Busca detalhes de um aluguel específico
 * - handleCancelRental(rentalId): Cancela um aluguel
 * - handleConfirmPayment(rentalId): Confirma pagamento
 * - checkAvailability(itemId, startDate, endDate): Verifica disponibilidade do item
 * - setCurrentRental(rental): Define aluguel em rastreamento
 * - clearError(): Limpa mensagem de erro
 */
export const RentalProvider = ({ children }) => {
  const [myRentals, setMyRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [currentRental, setCurrentRental] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega aluguéis do usuário logado (como locatário)
   * Aluguéis ativos e em processamento
   */
  const loadMyRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserRentals();
      
      if (response.rentals) {
        setMyRentals(response.rentals);
      }
    } catch (err) {
      const errorMsg = err.message || 'Erro ao carregar aluguéis';
      setError(errorMsg);
      console.error('❌ Erro ao carregar meus aluguéis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega histórico de aluguéis (aluguéis finalizados)
   */
  const loadRentalHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalHistory();
      
      if (response.rentals) {
        setRentalHistory(response.rentals);
      }
    } catch (err) {
      const errorMsg = err.message || 'Erro ao carregar histórico';
      setError(errorMsg);
      console.error('❌ Erro ao carregar histórico de aluguéis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca detalhes completos de um aluguel específico
   * @param {number} rentalId - ID do aluguel
   */
  const getRentalById = useCallback(async (rentalId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentalDetails(rentalId);
      
      if (response.rental) {
        setCurrentRental(response.rental);
        return response.rental;
      }
    } catch (err) {
      const errorMsg = err.message || 'Erro ao buscar aluguel';
      setError(errorMsg);
      console.error('❌ Erro ao buscar aluguel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancela um aluguel
   * @param {number} rentalId - ID do aluguel a cancelar
   * @param {string} reason - Motivo do cancelamento (opcional)
   */
  const handleCancelRental = useCallback(async (rentalId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await cancelRental(rentalId, reason);
      
      if (response.success || response.status === 200) {
        // Remove da lista de aluguéis ativos
        setMyRentals(prev => prev.filter(rental => rental.id !== rentalId));
        
        // Se era o aluguel atual sendo rastreado, limpa
        if (currentRental?.id === rentalId) {
          setCurrentRental(null);
        }
        
        return { success: true, message: response.message || 'Aluguel cancelado com sucesso' };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erro ao cancelar aluguel';
      setError(errorMsg);
      console.error('❌ Erro ao cancelar aluguel:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentRental?.id]);

  /**
   * Confirma pagamento de um aluguel
   * @param {number} rentalId - ID do aluguel
   * @param {Object} paymentData - Dados de pagamento (método, referência, etc)
   */
  const handleConfirmPayment = useCallback(async (rentalId, paymentData = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await confirmPayment(rentalId, paymentData);
      
      if (response.success || response.status === 200) {
        // Atualiza o aluguel na lista
        setMyRentals(prev => prev.map(rental => 
          rental.id === rentalId 
            ? { ...rental, paymentStatus: 'paid', status: 'confirmed' }
            : rental
        ));
        
        // Atualiza aluguel atual se for o mesmo
        if (currentRental?.id === rentalId) {
          setCurrentRental(prev => ({
            ...prev,
            paymentStatus: 'paid',
            status: 'confirmed'
          }));
        }
        
        return { success: true, message: response.message || 'Pagamento confirmado' };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erro ao confirmar pagamento';
      setError(errorMsg);
      console.error('❌ Erro ao confirmar pagamento:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentRental?.id]);

  /**
   * Verifica disponibilidade de um item para datas específicas
   * @param {number} itemId - ID do item
   * @param {string} startDate - Data de início (YYYY-MM-DD)
   * @param {string} endDate - Data de fim (YYYY-MM-DD)
   */
  const checkAvailability = useCallback(async (itemId, startDate, endDate) => {
    try {
      setError(null);
      const response = await checkItemAvailabilityByDates(itemId, startDate, endDate);
      
      return {
        available: response.available || false,
        unavailableDates: response.unavailableDates || [],
        message: response.message || ''
      };
    } catch (err) {
      const errorMsg = err.message || 'Erro ao verificar disponibilidade';
      setError(errorMsg);
      console.error('❌ Erro ao verificar disponibilidade:', err);
      return { available: false, unavailableDates: [], message: errorMsg };
    }
  }, []);

  /**
   * Utilitários para verificação de estado
   */

  /**
   * Verifica se há aluguéis ativos (não finalizados)
   */
  const hasActiveRentals = useCallback(() => {
    return myRentals.some(rental => 
      rental.status !== 'completed' && rental.status !== 'cancelled'
    );
  }, [myRentals]);

  /**
   * Conta quantos aluguéis ativos o usuário tem
   */
  const getActiveRentalCount = useCallback(() => {
    return myRentals.filter(rental => 
      rental.status !== 'completed' && rental.status !== 'cancelled'
    ).length;
  }, [myRentals]);

  /**
   * Verifica se há pagamentos pendentes
   */
  const hasPendingPayments = useCallback(() => {
    return myRentals.some(rental => rental.paymentStatus === 'pending');
  }, [myRentals]);

  /**
   * Filtra aluguéis por status
   */
  const getRentalsByStatus = useCallback((status) => {
    return myRentals.filter(rental => rental.status === status);
  }, [myRentals]);

  /**
   * Limpa mensagem de erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpa aluguel atual
   */
  const clearCurrentRental = useCallback(() => {
    setCurrentRental(null);
  }, []);

  /**
   * Retorna o valor total dos aluguéis
   */
  const getTotalRentalsValue = useCallback(() => {
    return myRentals.reduce((total, rental) => total + (rental.totalPrice || 0), 0);
  }, [myRentals]);

  /**
   * Contexto com todos os dados e métodos
   */
  const value = {
    // Estado
    myRentals,
    rentalHistory,
    currentRental,
    loading,
    error,
    
    // Métodos principais
    loadMyRentals,
    loadRentalHistory,
    getRentalById,
    handleCancelRental,
    handleConfirmPayment,
    checkAvailability,
    setCurrentRental,
    
    // Utilitários
    hasActiveRentals,
    getActiveRentalCount,
    hasPendingPayments,
    getRentalsByStatus,
    getTotalRentalsValue,
    
    // Controle
    clearError,
    clearCurrentRental,
  };

  return (
    <RentalContext.Provider value={value}>
      {children}
    </RentalContext.Provider>
  );
};

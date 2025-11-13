/**
 * useRentals Hook
 * 
 * Hook customizado para acessar o contexto de aluguéis com validação
 * Deve ser usado dentro de um componente envolvido pelo RentalProvider
 * 
 * @returns {Object} Objeto com todos os dados e métodos do RentalContext
 * 
 * @throws {Error} Se usado fora de um RentalProvider
 * 
 * Exemplo de uso:
 * ```
 * const { myRentals, loadMyRentals, handleCancelRental } = useRentals();
 * ```
 */

import { useContext } from 'react';
import { RentalContext } from '../contexts/RentalContext';

export const useRentals = () => {
  const context = useContext(RentalContext);
  
  if (!context) {
    throw new Error(
      '❌ useRentals deve ser usado dentro de um RentalProvider. ' +
      'Certifique-se de envolver o componente com <RentalProvider>...</RentalProvider>'
    );
  }
  
  return context;
};

/**
 * Hook useItems - Acesso fácil ao contexto de itens
 * 
 * Uso:
 * const { items, favorites, handleCategoryFilter } = useItems();
 */

import { useContext } from 'react';
import { ItemContext } from '../contexts/ItemContext';

export function useItems() {
  const context = useContext(ItemContext);
  
  if (!context) {
    throw new Error(
      'useItems deve ser usado dentro de um ItemProvider. ' +
      'Certifique-se de que o ItemProvider está envolvendo seus componentes.'
    );
  }
  
  return context;
}

export default useItems;

/**
 * useItems
 * Hook helper para acessar `ItemContext` de forma simples.
 *
 * Uso:
 * const { items, favorites, handleCategoryFilter } = useItems();
 *
 * Nota:
 * - Lança se usado fora de `ItemProvider`.
 * - Para operações pesadas (ex.: sincronizações em lote), prefira chamar
 *   os métodos do contexto diretamente para maior controle de estado.
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

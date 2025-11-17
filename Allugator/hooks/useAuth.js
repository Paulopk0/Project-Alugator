/**
 * useAuth
 * Hook que fornece acesso simplificado ao `AuthContext`.
 *
 * Uso típico:
 * const { user, token, login, logout, isAuthenticated } = useAuth();
 *
 * Blocos importantes / avisos:
 * - Lança exceção se usado fora do `AuthProvider` para evitar acesso nulo.
 * - Ideal para componentes e handlers; para lógica complexa prefira chamar
 *   diretamente funções do `AuthContext` quando necessário.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth deve ser usado dentro de um AuthProvider. ' +
      'Certifique-se de que o AuthProvider está envolvendo seus componentes.'
    );
  }
  
  return context;
}

export default useAuth;

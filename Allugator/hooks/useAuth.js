/**
 * Hook useAuth - Acesso fácil ao contexto de autenticação
 * 
 * Uso:
 * const { user, token, login, logout, isAuthenticated } = useAuth();
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

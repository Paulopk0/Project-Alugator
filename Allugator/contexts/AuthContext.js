/**
 * AuthContext - Gerencia estado global de autenticação
 * 
 * Responsabilidades:
 * - Armazenar user logado
 * - Armazenar token JWT
 * - Gerenciar login/logout
 * - Restaurar sessão ao abrir app
 * - Sincronizar com AsyncStorage
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthStorage from '../services/AuthStorage';
import { login as loginAPI, logout as logoutAPI, register as registerAPI } from '../apis/AuthApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Estado
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);

  /**
   * Restaura token e usuário do AsyncStorage ao iniciar
   * Chamado uma única vez no mount do provider
   */
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await AuthStorage.getToken();
      const savedUser = await AuthStorage.getUser();
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsSignout(false);
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza login e armazena token + usuário
   */
  const handleLogin = useCallback(async (email, password) => {
    try {
      setLoading(true);
      
      // Chama API de login
      const response = await loginAPI(email, password);
      
      console.log('[AuthContext] Response do login:', response);
      
      if (response.token && response.user) {
        // Salva no AsyncStorage
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveUser(response.user);
        
        // Atualiza estado
        setToken(response.token);
        setUser(response.user);
        setIsSignout(false);
        
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        return { success: false, message: response.message || 'Erro ao fazer login' };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realiza logout e limpa dados
   */
  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Chama API de logout (se necessário)
      if (token) {
        await logoutAPI();
      }
      
      // Limpa AsyncStorage
      await AuthStorage.clearToken();
      await AuthStorage.clearUser();
      
      // Atualiza estado
      setToken(null);
      setUser(null);
      setIsSignout(true);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Registra novo usuário
   */
  const handleRegister = useCallback(async (name, email, password, phoneNumber) => {
    try {
      setLoading(true);
      
      const response = await registerAPI({
        name,
        email,
        password,
        phoneNumber
      });
      
      console.log('[AuthContext] Response do registro:', response);
      
      if (response.token && response.user) {
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveUser(response.user);
        
        setToken(response.token);
        setUser(response.user);
        setIsSignout(false);
        
        return { success: true, message: 'Cadastro realizado com sucesso!' };
      } else if (response.userId) {
        // Se apenas userId foi retornado, significa que foi criado com sucesso
        return { success: true, message: 'Cadastro realizado com sucesso!' };
      } else {
        return { success: false, message: response.message || 'Erro ao registrar' };
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao registrar' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza dados do usuário
   */
  const updateUser = useCallback(async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      await AuthStorage.saveUser(updatedUser);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: error.message };
    }
  }, [user]);

  /**
   * Valor do contexto
   */
  const value = {
    // Estado
    user,
    token,
    loading,
    isSignout,
    
    // Ações
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateUser,
    
    // Utilitários
    isAuthenticated: !!token && !!user,
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

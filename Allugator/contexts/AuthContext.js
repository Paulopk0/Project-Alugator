/**
 * AuthContext - Gerencia estado global de autenticação
 * 
 * Responsabilidades:
 * - Armazenar user logado
 * - Armazenar token JWT
 * - Gerenciar login/logout
 * - Restaurar sessão ao abrir app
 * - Sincronizar com AsyncStorage
 * - Validar expiração de token
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
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
      
      console.log('[AuthContext] 📦 Dados recuperados:', {
        hasToken: !!savedToken,
        hasUser: !!savedUser,
        tokenLength: savedToken?.length
      });
      
      if (savedToken && savedUser) {
        // Valida se o token ainda é válido
        try {
          const decoded = jwtDecode(savedToken);
          
          console.log('[AuthContext] 🔍 Token decodificado:', {
            id: decoded.id,
            email: decoded.email,
            exp: decoded.exp,
            expDate: new Date(decoded.exp * 1000).toISOString(),
            now: new Date().toISOString(),
            isExpired: decoded.exp * 1000 <= Date.now()
          });
          
          // Verifica se expirou (exp está em segundos, Date.now() em ms)
          if (decoded.exp && decoded.exp * 1000 > Date.now()) {
            setToken(savedToken);
            setUser(savedUser);
            setIsSignout(false);
            console.log('[AuthContext] ✅ Token restaurado e válido - usuário logado automaticamente');
          } else {
            // Token expirado - limpa e força novo login
            console.log('[AuthContext] ⚠️ Token expirado, limpando dados');
            await AuthStorage.clearToken();
            await AuthStorage.clearUser();
            setIsSignout(true);
          }
        } catch (decodeError) {
          // Token inválido - limpa e força novo login
          console.error('[AuthContext] ❌ Token inválido:', decodeError);
          await AuthStorage.clearToken();
          await AuthStorage.clearUser();
          setIsSignout(true);
        }
      } else {
        console.log('[AuthContext] ℹ️ Nenhum dado salvo encontrado - primeiro acesso');
        setIsSignout(true);
      }
    } catch (error) {
      console.error('[AuthContext] 💥 Erro ao restaurar sessão:', error);
      setIsSignout(true);
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
      
      await logoutAPI();
      
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
        // Registro com token retornado (nova API)
        await AuthStorage.saveToken(response.token);
        await AuthStorage.saveUser(response.user);
        
        setToken(response.token);
        setUser(response.user);
        setIsSignout(false);
        
        return { success: true, message: 'Cadastro realizado com sucesso!' };
      } else if (response.userId) {
        // Fallback: Registro retornou só userId (API antiga), faz login automático
        console.log('[AuthContext] 🔄 Usuário criado com ID:', response.userId, '- fazendo login automático...');
        const loginResult = await handleLogin(email, password);
        return loginResult;
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
  }, [handleLogin]);

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

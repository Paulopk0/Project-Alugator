import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@allugator:token';
const USER_KEY = '@allugator:user';

/*
 * AuthStorage
 * Serviço responsável por persistir informações de autenticação no AsyncStorage.
 * Blocos importantes:
 * - saveToken / getToken / removeToken: manipulação direta do token JWT
 * - saveUser / getUser / removeUser: serialize/deserialize do objeto usuário
 * - clearAuth: remove token e usuário de forma atômica
 *
 * Atenção:
 * - Não exponha o token além do necessário. Use `AuthContext` para gerenciar estado em memória.
 * - AsyncStorage pode falhar; tratamos erros com logs e repassamos exceções quando crítico.
 */
const AuthStorage = {
    /**
     * Salva o token de autenticação
     */
    async saveToken(token) {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Erro ao salvar token:', error);
            throw error;
        }
    },

    /**
     * Obtém o token de autenticação
     */
    async getToken() {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Erro ao obter token:', error);
            return null;
        }
    },

    /**
     * Remove o token de autenticação
     */
    async removeToken() {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Erro ao remover token:', error);
            throw error;
        }
    },

    /**
     * Salva os dados do usuário
     */
    async saveUser(user) {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
    },

    /**
     * Obtém os dados do usuário
     */
    async getUser() {
        try {
            const user = await AsyncStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            return null;
        }
    },

    /**
     * Remove os dados do usuário
     */
    async removeUser() {
        try {
            await AsyncStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            throw error;
        }
    },

    /**
     * Limpa todos os dados de autenticação
     */
    async clearAuth() {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Erro ao limpar autenticação:', error);
            throw error;
        }
    }
};

export default AuthStorage;

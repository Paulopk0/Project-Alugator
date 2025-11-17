import API_URL from '../config/api';

/**
 * Solicita código de recuperação de senha
 * @param {string} email 
 * @returns {Promise<Object>} { status, message, code, expiresIn }
 */
export const requestPasswordReset = async (email) => {
    try {
        // IMPORTANTE: este endpoint dispara o envio do código por e-mail no servidor.
        // - Em produção não devemos logar códigos sensíveis nem detalhes do envio.
        // - Os logs abaixo ajudam no debug local, remova-os em produção.
        console.log('[PasswordResetApi] Solicitando recuperação para:', email);
        console.log('[PasswordResetApi] URL:', `${API_URL}/forgot-password`);

        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log('[PasswordResetApi] Response:', data);

        if (!response.ok) {
            throw data;
        }

        return data;
    } catch (error) {
        console.error('[PasswordResetApi] Erro ao solicitar recuperação:', error);
        throw error.message ? error : { message: 'Erro de conexão com o servidor' };
    }
};

/**
 * Valida código de recuperação
 * @param {string} email 
 * @param {string} code 
 * @returns {Promise<Object>} { status, message, resetToken }
 */
export const validateResetCode = async (email, code) => {
    try {
        // IMPORTANTE: validação do código recebido por email.
        // - Evite expor `code` em logs em ambientes compartilhados.
        console.log('[PasswordResetApi] Validando código:', { email, code });
        console.log('[PasswordResetApi] URL:', `${API_URL}/validate-code`);

        const response = await fetch(`${API_URL}/validate-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code }),
        });

        const data = await response.json();
        console.log('[PasswordResetApi] Response:', data);

        if (!response.ok) {
            throw data;
        }

        return data;
    } catch (error) {
        console.error('[PasswordResetApi] Erro ao validar código:', error);
        throw error.message ? error : { message: 'Erro de conexão com o servidor' };
    }
};

/**
 * Redefine a senha
 * @param {string} resetToken 
 * @param {string} newPassword 
 * @returns {Promise<Object>} { status, message }
 */
export const resetPassword = async (resetToken, newPassword) => {
    try {
        // IMPORTANTE: troca de senha final. `resetToken` deve ser tratado como secreto.
        console.log('[PasswordResetApi] Redefinindo senha com token');
        console.log('[PasswordResetApi] URL:', `${API_URL}/reset-password`);

        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resetToken, newPassword }),
        });

        const data = await response.json();
        console.log('[PasswordResetApi] Response:', data);

        if (!response.ok) {
            throw data;
        }

        return data;
    } catch (error) {
        console.error('[PasswordResetApi] Erro ao redefinir senha:', error);
        throw error.message ? error : { message: 'Erro de conexão com o servidor' };
    }
};

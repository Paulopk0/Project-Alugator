/**
 * Funções auxiliares para tradução de status e outras strings
 * Mantém inglês internamente no backend, mas mostra português pro usuário
 */

/**
 * Traduz status de item do inglês (backend) para português (display)
 * @param {string} status - Status em inglês: 'available', 'rented', 'unavailable'
 * @returns {string} Status traduzido para português
 */
export const translateItemStatus = (status) => {
    const translations = {
        'available': 'Disponível',
        'rented': 'Alugado',
        'unavailable': 'Indisponível'
    };
    
    return translations[status] || status;
};

/**
 * Converte status do português (input do usuário) para inglês (backend)
 * @param {string} statusPt - Status em português
 * @returns {string} Status em inglês para envio ao backend
 */
export const statusToEnglish = (statusPt) => {
    const translations = {
        'Disponível': 'available',
        'Alugado': 'rented',
        'Indisponível': 'unavailable'
    };
    
    return translations[statusPt] || statusPt;
};

/**
 * Retorna cor baseada no status (útil para badges)
 * @param {string} status - Status em inglês
 * @returns {string} Cor hexadecimal
 */
export const getStatusColor = (status) => {
    const colors = {
        'available': '#4CAF50',   // Verde
        'rented': '#FF9800',       // Laranja
        'unavailable': '#F44336'   // Vermelho
    };
    
    return colors[status] || '#757575'; // Cinza como fallback
};

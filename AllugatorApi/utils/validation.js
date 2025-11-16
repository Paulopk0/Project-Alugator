/**
 * Utilitários de Validação e Sanitização
 * 
 * Funções para validar e sanitizar dados de entrada antes de processar.
 * Previne ataques de injeção, validação inadequada e dados malformados.
 */

/**
 * Valida email com regex padrão RFC 5322
 * @param {string} email - Email a validar
 * @returns {boolean} true se válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida comprimento de string
 * @param {string} str - String a validar
 * @param {number} minLength - Comprimento mínimo
 * @param {number} maxLength - Comprimento máximo
 * @returns {boolean} true se válido
 */
const isValidLength = (str, minLength = 1, maxLength = 255) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Valida se é um número válido e positivo
 * @param {any} num - Valor a validar
 * @param {number} min - Valor mínimo (padrão: 0)
 * @returns {boolean} true se válido
 */
const isValidPrice = (num, min = 0) => {
  const parsed = parseFloat(num);
  return !isNaN(parsed) && parsed >= min && Number.isFinite(parsed);
};

/**
 * Sanitiza string removendo espaços extras e caracteres perigosos
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizada
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .substring(0, 255); // Limita a 255 caracteres
};

/**
 * Sanitiza email (lowercase)
 * @param {string} email - Email a sanitizar
 * @returns {string} Email sanitizado
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

/**
 * Valida registro (name, email, password, phoneNumber)
 * @param {Object} data - Dados do registro
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateRegister = (data) => {
  const errors = [];
  const { name, email, password, phoneNumber } = data;

  // Validar name
  if (!isValidLength(name, 3, 100)) {
    errors.push('Nome deve ter entre 3 e 100 caracteres');
  }

  // Validar email
  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar password
  if (!isValidLength(password, 6, 100)) {
    errors.push('Senha deve ter entre 6 e 100 caracteres');
  }

  // Validar phoneNumber (opcional, mas se preenchido)
  if (phoneNumber && !isValidLength(phoneNumber, 10, 20)) {
    errors.push('Telefone deve ter entre 10 e 20 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida login (email, password)
 * @param {Object} data - Dados do login
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  // Validar email
  if (!email || !isValidEmail(email)) {
    errors.push('Email inválido');
  }

  // Validar password
  if (!isValidLength(password, 6, 100)) {
    errors.push('Senha deve ter entre 6 e 100 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida criação de item
 * @param {Object} data - Dados do item
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateCreateItem = (data) => {
  const errors = [];
  const { title, priceDaily, category, condition, description, location, securityDeposit } = data;

  // Validar title
  if (!isValidLength(title, 5, 200)) {
    errors.push('Título deve ter entre 5 e 200 caracteres');
  }

  // Validar priceDaily
  if (!isValidPrice(priceDaily, 0.01)) {
    errors.push('Preço diário deve ser um número positivo');
  }

  // Validar category
  if (!isValidLength(category, 3, 50)) {
    errors.push('Categoria deve ter entre 3 e 50 caracteres');
  }

  // Validar condition
  if (!isValidLength(condition, 3, 50)) {
    errors.push('Condição deve ter entre 3 e 50 caracteres');
  }

  // Validar description (opcional)
  if (description && !isValidLength(description, 0, 1000)) {
    errors.push('Descrição não pode exceder 1000 caracteres');
  }

  // Validar location (opcional)
  if (location && !isValidLength(location, 0, 200)) {
    errors.push('Localização não pode exceder 200 caracteres');
  }

  // Validar securityDeposit (opcional)
  if (securityDeposit !== undefined && securityDeposit !== null && !isValidPrice(securityDeposit, 0)) {
    errors.push('Caução deve ser um número não-negativo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitiza dados de registro
 * @param {Object} data - Dados brutos
 * @returns {Object} Dados sanitizados
 */
const sanitizeRegister = (data) => {
  return {
    name: sanitizeString(data.name),
    email: sanitizeEmail(data.email),
    password: data.password, // NÃO sanitize senha (pode conter caracteres especiais legítimos)
    phoneNumber: data.phoneNumber ? sanitizeString(data.phoneNumber) : null
  };
};

/**
 * Sanitiza dados de login
 * @param {Object} data - Dados brutos
 * @returns {Object} Dados sanitizados
 */
const sanitizeLogin = (data) => {
  return {
    email: sanitizeEmail(data.email),
    password: data.password // NÃO sanitize senha
  };
};

/**
 * Sanitiza dados de item
 * @param {Object} data - Dados brutos
 * @returns {Object} Dados sanitizados
 */
const sanitizeItem = (data) => {
  return {
    title: sanitizeString(data.title),
    priceDaily: parseFloat(data.priceDaily),
    category: sanitizeString(data.category),
    condition: sanitizeString(data.condition),
    description: data.description ? sanitizeString(data.description) : null,
    location: data.location ? sanitizeString(data.location) : null,
    photos: data.photos ? sanitizeString(data.photos) : null,
    securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : 0
  };
};

module.exports = {
  isValidEmail,
  isValidLength,
  isValidPrice,
  sanitizeString,
  sanitizeEmail,
  validateRegister,
  validateLogin,
  validateCreateItem,
  sanitizeRegister,
  sanitizeLogin,
  sanitizeItem
};

/**
 * Utilitários de validação e formatação para formulários
 */

/**
 * Formata telefone para o padrão +NN NN NNNNN-NNNN
 * @param {string} text - Texto a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (text) => {
  const digits = text.replace(/\D/g, '').substring(0, 13);

  let masked = '+';
  if (digits.length > 0) {
    masked += digits.substring(0, 2);
  }
  if (digits.length > 2) {
    masked += ` ${digits.substring(2, 4)}`;
  }
  if (digits.length > 4) {
    masked += ` ${digits.substring(4, 9)}`;
  }
  if (digits.length > 9) {
    masked += `-${digits.substring(9, 13)}`;
  }
  return masked;
};

/**
 * Remove formatação do telefone, deixando apenas dígitos
 * @param {string} phone - Telefone formatado
 * @returns {string} Apenas dígitos
 */
export const unformatPhone = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone (mínimo 10 dígitos)
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} True se válido
 */
export const validatePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
};

/**
 * Valida senha (mínimo 6 caracteres)
 * @param {string} password - Senha a ser validada
 * @returns {boolean} True se válido
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Valida nome (mínimo 3 caracteres)
 * @param {string} name - Nome a ser validado
 * @returns {boolean} True se válido
 */
export const validateName = (name) => {
  return name && name.trim().length >= 3;
};

/**
 * Sanitiza nome (remove espaços extras)
 * @param {string} name - Nome a ser sanitizado
 * @returns {string} Nome sanitizado
 */
export const sanitizeName = (name) => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitiza email (lowercase e remove espaços)
 * @param {string} email - Email a ser sanitizado
 * @returns {string} Email sanitizado
 */
export const sanitizeEmail = (email) => {
  return email.trim().toLowerCase();
};

/**
 * Valida todos os campos de registro
 * @param {Object} data - Dados do formulário
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateRegisterForm = (data) => {
  const errors = [];

  if (!validateName(data.name)) {
    errors.push('Nome deve ter no mínimo 3 caracteres');
  }

  if (!validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!validatePhone(data.phoneNumber)) {
    errors.push('Telefone deve ter no mínimo 10 dígitos');
  }

  if (!validatePassword(data.password)) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('As senhas não conferem');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

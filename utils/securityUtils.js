const validator = require('validator');

// Sanitizar username (permite solo letras, números y guiones bajos)
const sanitizeUsername = (username) => {
  if (typeof username !== 'string') return username;
  return validator.escape(username.trim());
};

// Sanitizar email (solo trim y normalización, no escape)
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  const normalized = validator.normalizeEmail(email.trim());
  return normalized || ''; // Retorna string vacío si es inválido
};

const isValidEmail = (email) => {
  return typeof email === 'string' && validator.isEmail(email);
};

// Sanitizar password (solo trim, no modificar caracteres)
const sanitizePassword = (password) => {
  if (typeof password !== 'string') return password;
  return password.trim();
};

// Prevenir NoSQL Injection (para username o texto libre, no emails)
const preventNoSQLInjection = (input) => {
  return input.replace(/\$|\{|\}|\\|\./g, '');
};

module.exports = {
  sanitizeUsername,
  sanitizeEmail,
  sanitizePassword,
  isValidEmail,
  preventNoSQLInjection
};

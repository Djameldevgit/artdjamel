// src/utils/format.js

/**
 * Formatea números grandes (vistas, seguidores, likes) en formato compacto
 * Ejemplos: 1500 -> 1.5k, 2500000 -> 2.5M, 999 -> 999
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
 // src/utils/format.js
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  const n = Number(num);
  if (isNaN(n)) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
};
  
  /**
   * Formatea fecha a formato local (ej: "15 mars 2025")
   * @param {string|Date} date - Fecha a formatear
   * @param {string} locale - Código de idioma (por defecto 'fr-FR')
   * @returns {string} Fecha formateada
   */
  export const formatDate = (date, locale = 'fr-FR') => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Date invalide';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Formatea duración de video en segundos a formato mm:ss o hh:mm:ss
   * @param {number} seconds - Duración en segundos
   * @returns {string} Duración formateada (ej: "03:45" o "01:23:45")
   */
  export const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
  
    const pad = (n) => n.toString().padStart(2, '0');
  
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };
  
  /**
   * Formatea precio en DZD (Dinar argelino)
   * @param {number} price - Precio numérico
   * @param {boolean} showCurrency - Si se debe mostrar el símbolo DA
   * @returns {string} Precio formateado
   */
  export const formatPrice = (price, showCurrency = true) => {
    if (price === undefined || price === null) return showCurrency ? '0 DA' : '0';
    const num = Number(price);
    if (isNaN(num)) return showCurrency ? '0 DA' : '0';
  
    const formatted = num.toLocaleString('fr-DZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return showCurrency ? `${formatted} DA` : formatted;
  };
  
  /**
   * Trunca texto a una longitud máxima y añade "..."
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Longitud máxima (por defecto 100)
   * @returns {string} Texto truncado
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '…';
  };
  
  /**
   * Capitaliza primera letra de cada palabra
   * @param {string} str - Texto a capitalizar
   * @returns {string} Texto capitalizado
   */
  export const capitalizeWords = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Ejemplo de uso (puedes borrar estos comentarios):
  // formatNumber(1250)        → "1.3k"
  // formatDate('2025-03-15')  → "15 mars 2025"
  // formatDuration(125)        → "02:05"
  // formatPrice(5000)          → "5 000 DA"
  // truncateText('Texto muy largo...', 10) → "Texto muy …"
  // capitalizeWords('bonjour le monde') → "Bonjour Le Monde"
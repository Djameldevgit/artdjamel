// Formateadores para la aplicación

// Formatear números con separadores de miles
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  // Formatear precios
  export const formatPrice = (price, currency = '€') => {
    if (price === null || price === undefined) return 'Gratuit';
    if (price === 0) return 'Gratuit';
    return `${formatNumber(price)} ${currency}`;
  };
  
  // Formatear fechas
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    return new Intl.DateTimeFormat('fr-FR', mergedOptions).format(new Date(date));
  };
  
  // Formatear tiempo relativo
  export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 604800)} sem`;
    if (diffInSeconds < 31536000) return `Il y a ${Math.floor(diffInSeconds / 2592000)} mois`;
    return `Il y a ${Math.floor(diffInSeconds / 31536000)} an`;
  };
  
  // Acortar texto
  export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Generar slug
  export const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  // Capitalizar primera letra
  export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
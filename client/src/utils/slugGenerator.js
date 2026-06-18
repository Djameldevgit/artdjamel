// src/utils/slugUtils.js

/**
 * Convierte texto a slug (formato URL)
 */
 export const createSlug = (text) => {
    if (!text) return '';
    
    return String(text)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quita acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplaza caracteres especiales con -
      .replace(/^-+|-+$/g, ''); // Quita - al inicio y final
  };
  
  /**
   * Detecta qué tipo de ruta es según el slug
   */
  export const getRouteType = (slug) => {
    if (!slug) return 'home';
    if (slug === 'boutiques') return 'boutiques-list';
    if (slug.startsWith('boutique-')) return 'boutique';
    if (slug.startsWith('annonce-')) return 'annonce';
    return 'category';  
  };
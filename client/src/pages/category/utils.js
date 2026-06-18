// 📂 pages/category/utils.js

/**
 * Encuentra la subcategoría y artículo actual basado en los filtros
 * @param {Array} children - Lista de subcategorías
 * @param {Object} filters - { sub, article }
 * @param {Boolean} isBoutique - Si es modo boutique
 * @returns {Object} { currentSub, currentArticle }
 */
 export const findSubAndArticle = (children, filters, isBoutique) => {
    let currentSub = null;
    let currentArticle = null;
  
    if (!children || children.length === 0) {
      return { currentSub, currentArticle };
    }
  
    // Buscar subcategoría
    if (filters?.sub) {
      currentSub = children.find(c => c.slug === filters.sub) || null;
  
      // Buscar artículo SOLO si no es boutique
      if (!isBoutique && filters?.article && currentSub?.articles) {
        currentArticle =
          currentSub.articles.find(a => a.slug === filters.article) || null;
      }
    }
  
    return { currentSub, currentArticle };
  };
  
  
  /**
   * Construye parámetros de filtros para backend (opcional para futuro)
   * NO es obligatorio usarlo ahora, pero te sirve para escalar
   */
  export const buildFilterParams = (activeFilters) => {
    return {
      wilaya: activeFilters?.wilaya || '',
      commune: activeFilters?.commune || '',
      minPrice: activeFilters?.minPrice || null,
      maxPrice: activeFilters?.maxPrice || null,
      sortBy: activeFilters?.sortBy || 'recent'
    };
  };
  
  
  /**
   * Verifica si se puede cargar más contenido (scroll infinito)
   */
  export const canLoadMore = ({
    isBoutique,
    hasMoreBoutiques,
    boutiquesLoading,
    hasMorePosts,
    postsLoading,
    postsLength,
    limit
  }) => {
    if (isBoutique) {
      return hasMoreBoutiques && !boutiquesLoading;
    }
  
    return hasMorePosts && !postsLoading && postsLength < limit;
  };
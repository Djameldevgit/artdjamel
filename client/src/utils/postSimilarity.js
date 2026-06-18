import { matchSorter } from 'match-sorter';

/**
 * Calcula la similitud entre dos posts
 * @param {Object} post1 - Post principal
 * @param {Object} post2 - Post a comparar
 * @returns {number} Puntuación de similitud (0-100)
 */
export const calculatePostSimilarity = (post1, post2) => {
    if (post1._id === post2._id) return 0; // Mismo post
    
    let score = 0;
    const maxScore = 100;
    
    // 1. Misma categoría (40 puntos)
    if (post1.category === post2.category) {
        score += 40;
    }
    
    // 2. Misma subcategoría (25 puntos)
    if (post1.subCategory === post2.subCategory) {
        score += 25;
    }
    
    // 3. Precio similar (20 puntos)
    if (post1.price && post2.price) {
        const priceDiff = Math.abs(post1.price - post2.price);
        const priceThreshold = Math.max(post1.price, post2.price) * 0.3; // 30% diferencia
        if (priceDiff <= priceThreshold) {
            score += 20;
        }
    }
    
    // 4. Misma ubicación (15 puntos)
    if (post1.location?.city === post2.location?.city) {
        score += 15;
    } else if (post1.location?.region === post2.location?.region) {
        score += 10;
    }
    
    // 5. Keywords en título (usando matchSorter)
    if (post1.title && post2.title) {
        const keywords = post1.title.toLowerCase().split(' ');
        const matches = matchSorter([post2.title], keywords.join(' '));
        if (matches.length > 0) {
            score += 15;
        }
    }
    
    return Math.min(score, maxScore);
};

/**
 * Filtra y ordena posts similares
 * @param {Array} allPosts - Todos los posts disponibles
 * @param {Object} currentPost - Post actual
 * @param {number} limit - Límite de posts a retornar
 * @returns {Array} Posts similares ordenados
 */
export const getSimilarPosts = (allPosts, currentPost, limit = 6) => {
    if (!allPosts || !currentPost || allPosts.length === 0) return [];
    
    // Filtrar posts activos y que no sea el mismo
    const filteredPosts = allPosts.filter(post => 
        post._id !== currentPost._id && 
        post.status === 'active'
    );
    
    // Calcular puntuación de similitud para cada post
    const postsWithScore = filteredPosts.map(post => ({
        ...post,
        similarityScore: calculatePostSimilarity(currentPost, post)
    }));
    
    // Ordenar por puntuación descendente y luego por fecha
    const sortedPosts = postsWithScore.sort((a, b) => {
        if (b.similarityScore !== a.similarityScore) {
            return b.similarityScore - a.similarityScore;
        }
        // Si misma puntuación, ordenar por fecha más reciente
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Filtrar solo posts con cierta similitud (mínimo 30 puntos)
    const similarPosts = sortedPosts.filter(post => post.similarityScore >= 30);
    
    return similarPosts.slice(0, limit);
};

/**
 * Obtiene campos importantes para búsqueda de similitud
 * @param {Object} post 
 * @returns {Object} Campos importantes
 */
export const getImportantFields = (post) => {
    return {
        category: post.category,
        subCategory: post.subCategory,
        price: post.price,
        title: post.title,
        location: post.location,
        dynamicFields: post.dynamicFields,
        keywords: extractKeywords(post)
    };
};

/**
 * Extrae keywords del post
 * @param {Object} post 
 * @returns {Array} Array de keywords
 */
const extractKeywords = (post) => {
    const keywords = [];
    
    // Del título
    if (post.title) {
        keywords.push(...post.title.toLowerCase().split(/\s+/));
    }
    
    // De la descripción (primeras palabras)
    if (post.description) {
        keywords.push(...post.description.toLowerCase().split(/\s+/).slice(0, 10));
    }
    
    // De campos dinámicos importantes
    if (post.dynamicFields) {
        const importantDynamicFields = ['brand', 'model', 'type', 'color', 'size', 'condition'];
        importantDynamicFields.forEach(field => {
            if (post.dynamicFields[field]) {
                keywords.push(post.dynamicFields[field].toString().toLowerCase());
            }
        });
    }
    
    // Eliminar duplicados y palabras comunes
    const commonWords = ['de', 'la', 'el', 'en', 'y', 'a', 'con', 'para', 'por', 'se'];
    return [...new Set(keywords.filter(word => 
        word.length > 2 && !commonWords.includes(word)
    ))];
};
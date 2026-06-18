// 📂 redux/reducers/categoryReducer.js - VERSIÓN COMPLETA CORREGIDA

import * as types from '../constants/categoryConstants';

const initialState = {
  // ==================== SLIDER ====================
  sliderCategories: [],
  sliderLoading: false,
  sliderError: null,

  // ==================== CATÉGORIES PRINCIPALES ====================
  categories: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMoreCategories: true,
  totalCategories: 0,
  totalPages: 1,

  // ==================== 🆕 CATEGORÍAS CON VIDEOS (HOME SCROLL) ====================
  categoriesWithVideos: [],
  loadingCategoriesWithVideos: false,
  hasMoreCategoriesWithVideos: true,
  currentCategoriesPage: 1,
  totalCategoriesWithVideos: 0,
  errorCategoriesWithVideos: null,

  // ==================== CATÉGORIES POPULAIRES ====================
  popularCategories: [],
  popularLoading: false,
  popularError: null,

  // ==================== PAGE CATÉGORIE ====================
  activeCategory: null,
  categoryInfo: {},
  videos: [],
  videosLoading: false,
  videosError: null,
  videosCurrentPage: 1,
  hasMoreVideos: false,
  totalVideos: 0,
  totalPages: 1,

  // ==================== FILTRES ====================
  filters: {
    wilayas: [],
    priceRange: { min: 0, max: 1000000 },
    hasCommercial: false
  },
  filtersLoading: false,
  filtersError: null,
  activeFilters: {
    wilaya: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'recent'
  },

  // ==================== DÉTAILS CATÉGORIE ====================
  categoryDetails: null,
  detailsLoading: false,
  detailsError: null,

  // ==================== STATISTIQUES ====================
  stats: {
    totalCategories: 0,
    totalVideos: 0,
    categoriesWithVideos: 0,
    categoriesWithoutVideos: 0
  },
  topCategories: [],
  statsLoading: false,
  statsError: null,

  // ==================== RECHERCHE ====================
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchTerm: null
};

// Función auxiliar para evitar duplicados
const mergeCategoriesWithoutDuplicates = (existingCategories, newCategories) => {
  const existingIds = new Set(existingCategories.map(c => c._id?.toString()));
  const uniqueNewCategories = newCategories.filter(c => !existingIds.has(c._id?.toString()));
  return [...existingCategories, ...uniqueNewCategories];
};

export const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== SLIDER ====================
    case types.GET_SLIDER_CATEGORIES:
      return { ...state, sliderLoading: true, sliderError: null };
      
    case types.GET_SLIDER_CATEGORIES_SUCCESS:
      console.log('🎠 Slider mis à jour:', action.payload?.length || 0);
      return {
        ...state,
        sliderCategories: action.payload || [],
        sliderLoading: false,
        sliderError: null
      };
      
    case types.GET_SLIDER_CATEGORIES_FAIL:
      return {
        ...state,
        sliderLoading: false,
        sliderError: action.payload
      };

    // ==================== CATÉGORIES PRINCIPALES ====================
    case types.GET_MAIN_CATEGORIES:
      return { ...state, loading: true, error: null };
      
    case types.GET_MAIN_CATEGORIES_SUCCESS:
      const isFirstPage = (action.payload.currentPage || 1) === 1;
      const newCategories = isFirstPage 
        ? (action.payload.categories || []) 
        : mergeCategoriesWithoutDuplicates(state.categories, action.payload.categories || []);
      
      return {
        ...state,
        loading: false,
        categories: newCategories,
        currentPage: action.payload.currentPage || 1,
        hasMoreCategories: action.payload.hasMoreCategories || false,
        totalCategories: action.payload.totalCategories || 0,
        totalPages: action.payload.totalPages || 1,
        error: null
      };
      
    case types.GET_MAIN_CATEGORIES_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        categories: []
      };

    // ==================== 🆕 CATEGORÍAS CON VIDEOS (HOME SCROLL) ====================
    case types.GET_CATEGORIES_WITH_VIDEOS:
      return { 
        ...state, 
        loadingCategoriesWithVideos: true, 
        errorCategoriesWithVideos: null 
      };
      
    case types.GET_CATEGORIES_WITH_VIDEOS_SUCCESS:
      const isFirstCategoriesPage = (action.payload.currentPage === 1);
      
      // ✅ Evitar duplicados: solo añadir categorías que no existan
      let updatedCategories;
      if (isFirstCategoriesPage) {
        updatedCategories = action.payload.categories || [];
      } else {
        updatedCategories = mergeCategoriesWithoutDuplicates(
          state.categoriesWithVideos, 
          action.payload.categories || []
        );
      }
      
      console.log(`📦 Categorías: página ${action.payload.currentPage}, ` +
        `recibidas: ${action.payload.categories?.length || 0}, ` +
        `total acumulado: ${updatedCategories.length}, ` +
        `hasMore: ${action.payload.hasMoreCategories}`);
      
      return {
        ...state,
        loadingCategoriesWithVideos: false,
        categoriesWithVideos: updatedCategories,
        currentCategoriesPage: action.payload.currentPage || 1,
        hasMoreCategoriesWithVideos: action.payload.hasMoreCategories || false,
        totalCategoriesWithVideos: action.payload.totalCategories || 0,
        errorCategoriesWithVideos: null
      };
      
    case types.GET_CATEGORIES_WITH_VIDEOS_FAIL:
      return {
        ...state,
        loadingCategoriesWithVideos: false,
        errorCategoriesWithVideos: action.payload,
        categoriesWithVideos: []
      };
      
    case types.LOAD_MORE_CATEGORIES:
      return { ...state, loadingCategoriesWithVideos: true };

    // ==================== CATÉGORIES POPULAIRES ====================
    case types.GET_POPULAR_CATEGORIES:
      return { ...state, popularLoading: true, popularError: null };
      
    case types.GET_POPULAR_CATEGORIES_SUCCESS:
      return {
        ...state,
        popularCategories: action.payload || [],
        popularLoading: false,
        popularError: null
      };
      
    case types.GET_POPULAR_CATEGORIES_FAIL:
      return {
        ...state,
        popularLoading: false,
        popularError: action.payload
      };

    // ==================== VIDÉOS PAR CATÉGORIE ====================
    case types.GET_CATEGORY_VIDEOS:
      return { ...state, videosLoading: true, videosError: null };
      
    case types.GET_CATEGORY_VIDEOS_SUCCESS:
      const isFirstVideoPage = (action.payload.currentPage || 1) === 1;
      
      let updatedVideos;
      if (isFirstVideoPage) {
        updatedVideos = action.payload.videos || [];
      } else {
        const existingVideoIds = new Set(state.videos.map(v => v._id?.toString()));
        const uniqueNewVideos = (action.payload.videos || []).filter(v => !existingVideoIds.has(v._id?.toString()));
        updatedVideos = [...state.videos, ...uniqueNewVideos];
      }
      
      return {
        ...state,
        videosLoading: false,
        videosError: null,
        categoryInfo: isFirstVideoPage 
          ? (action.payload.categoryInfo || {}) 
          : state.categoryInfo,
        videos: updatedVideos,
        videosCurrentPage: action.payload.currentPage || 1,
        hasMoreVideos: action.payload.hasMoreVideos || false,
        totalVideos: action.payload.totalVideos || 0,
        totalPages: action.payload.totalPages || 1,
        filters: action.payload.filters || state.filters
      };
      
    case types.GET_CATEGORY_VIDEOS_FAIL:
      return {
        ...state,
        videosLoading: false,
        videosError: action.payload
      };
      
    case types.LOAD_MORE_VIDEOS:
      return { ...state, videosLoading: true };

    // ==================== FILTRES ====================
    case types.GET_CATEGORY_FILTERS:
      return { ...state, filtersLoading: true, filtersError: null };
      
    case types.GET_CATEGORY_FILTERS_SUCCESS:
      return {
        ...state,
        filtersLoading: false,
        filters: action.payload.filters || {
          wilayas: [],
          priceRange: { min: 0, max: 1000000 },
          hasCommercial: false
        },
        categoryInfo: action.payload.categoryInfo || state.categoryInfo,
        filtersError: null
      };
      
    case types.GET_CATEGORY_FILTERS_FAIL:
      return {
        ...state,
        filtersLoading: false,
        filtersError: action.payload
      };

    // ==================== DÉTAILS CATÉGORIE ====================
    case types.GET_CATEGORY_DETAILS:
      return { ...state, detailsLoading: true, detailsError: null };
      
    case types.GET_CATEGORY_DETAILS_SUCCESS:
      return {
        ...state,
        detailsLoading: false,
        categoryDetails: action.payload.category || null,
        videos: action.payload.videos || [],
        videosCurrentPage: 1,
        hasMoreVideos: action.payload.pagination?.hasMore || false,
        totalVideos: action.payload.pagination?.totalVideos || 0,
        totalPages: action.payload.pagination?.totalPages || 1,
        detailsError: null
      };
      
    case types.GET_CATEGORY_DETAILS_FAIL:
      return {
        ...state,
        detailsLoading: false,
        detailsError: action.payload
      };

    // ==================== STATISTIQUES ====================
    case types.GET_CATEGORY_STATS:
      return { ...state, statsLoading: true, statsError: null };
      
    case types.GET_CATEGORY_STATS_SUCCESS:
      return {
        ...state,
        statsLoading: false,
        stats: action.payload.stats || state.stats,
        topCategories: action.payload.topCategories || [],
        statsError: null
      };
      
    case types.GET_CATEGORY_STATS_FAIL:
      return {
        ...state,
        statsLoading: false,
        statsError: action.payload
      };

    // ==================== RECHERCHE ====================
    case types.SEARCH_CATEGORIES:
      return { ...state, searchLoading: true, searchError: null };
      
    case types.SEARCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        searchLoading: false,
        searchResults: action.payload.categories || [],
        searchTerm: action.payload.searchTerm || null,
        searchError: null
      };
      
    case types.SEARCH_CATEGORIES_FAIL:
      return {
        ...state,
        searchLoading: false,
        searchError: action.payload,
        searchResults: []
      };

    // ==================== NAVIGATION ====================
    case types.SET_ACTIVE_CATEGORY:
      return {
        ...state,
        activeCategory: action.payload,
        categoryInfo: {},
        videos: [],
        videosCurrentPage: 1,
        hasMoreVideos: false,
        totalVideos: 0,
        videosLoading: false,
        videosError: null,
        filters: {
          wilayas: [],
          priceRange: { min: 0, max: 1000000 },
          hasCommercial: false
        },
        activeFilters: {
          wilaya: null,
          minPrice: null,
          maxPrice: null,
          sortBy: 'recent'
        }
      };

    // ==================== FILTRES ACTIFS ====================
    case types.SET_ACTIVE_FILTERS:
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          ...action.payload
        },
        videos: [],
        videosCurrentPage: 1,
        hasMoreVideos: false
      };
      case types.GET_SLIDER_CATEGORIES_SUCCESS:
        console.log('🎠 Reducer - Slider actualizado:', action.payload?.length || 0);
        return {
          ...state,
          sliderCategories: action.payload || [],
          sliderLoading: false,
          sliderError: null
        };
    case types.RESET_ACTIVE_FILTERS:
      return {
        ...state,
        activeFilters: {
          wilaya: null,
          minPrice: null,
          maxPrice: null,
          sortBy: 'recent'
        },
        videos: [],
        videosCurrentPage: 1,
        hasMoreVideos: false
      };

    // ==================== NETTOYAGE ====================
    case types.RESET_CATEGORY_VIDEOS:
      return {
        ...state,
        videos: [],
        videosCurrentPage: 1,
        hasMoreVideos: false,
        totalVideos: 0,
        videosLoading: false,
        videosError: null
      };

    case types.CLEAR_CATEGORY_STATE:
      return {
        ...state,
        activeCategory: null,
        categoryInfo: {},
        videos: [],
        videosCurrentPage: 1,
        hasMoreVideos: false,
        totalVideos: 0,
        videosLoading: false,
        videosError: null,
        categoryDetails: null,
        searchResults: [],
        searchTerm: null,
        categoriesWithVideos: [],
        currentCategoriesPage: 1,
        hasMoreCategoriesWithVideos: true
      };

    case types.CLEAR_CATEGORY_ERRORS:
      return {
        ...state,
        error: null,
        videosError: null,
        filtersError: null,
        detailsError: null,
        statsError: null,
        searchError: null,
        popularError: null,
        sliderError: null,
        errorCategoriesWithVideos: null
      };

    default:
      return state;
  }
};

export default categoryReducer;
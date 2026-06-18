// 📂 redux/reducers/filterReducer.js
const initialState = {
    categoryInfo: {},
    children: [],
    wilayas: [],
    priceRange: { min: 0, max: 1000000 },
    loading: false,
    error: null
  };
  
  export const filterReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'GET_FILTER_OPTIONS':
        return { ...state, loading: true, error: null };
      case 'GET_FILTER_OPTIONS_SUCCESS':
        return {
          ...state,
          loading: false,
          categoryInfo: action.payload.categoryInfo,
          children: action.payload.children,
          wilayas: action.payload.wilayas,
          priceRange: action.payload.priceRange,
          error: null
        };
      case 'GET_FILTER_OPTIONS_FAIL':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };

  export default filterReducer;
const initialState = {
    categories: [],
    loading: false,
    error: null
  };
  
  export const accordionReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'GET_ACCORDION_CATEGORIES':
        return { ...state, loading: true, error: null };
      case 'GET_ACCORDION_CATEGORIES_SUCCESS':
        return { ...state, loading: false, categories: action.payload };
      case 'GET_ACCORDION_CATEGORIES_FAIL':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
// 📂 redux/reducers/productAproveReducer.js
import { PRODUCT_APROVE_TYPES } from '../actions/productAproveAction';

const initialState = {
  products: [],
  loading: false,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasMore: false
};

const productAproveReducer = (state = initialState, action) => {
  switch (action.type) {
    case PRODUCT_APROVE_TYPES.LOADING:
      return { ...state, loading: action.payload };
      
    case PRODUCT_APROVE_TYPES.GET_PENDIENTES:
      return {
        ...state,
        products: action.payload.products,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.hasMore,
        loading: false
      };
      
    case PRODUCT_APROVE_TYPES.APROBAR:
      return {
        ...state,
        products: state.products.filter(p => p._id !== action.payload.id),
        total: state.total - 1
      };
      
    case PRODUCT_APROVE_TYPES.RECHAZAR:
      return {
        ...state,
        products: state.products.filter(p => p._id !== action.payload.id),
        total: state.total - 1
      };
      
    case PRODUCT_APROVE_TYPES.RESET:
      return initialState;
      
    default:
      return state;
  }
};

export default productAproveReducer;
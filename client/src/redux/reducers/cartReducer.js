// src/redux/reducers/cartReducer.js
import { CART_TYPES } from '../actions/cartAction';

const initialState = {
  loading: false,
  items: [],
  totalPrice: 0,
  totalItems: 0,
  error: null
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case CART_TYPES.LOADING:
      return { ...state, loading: action.payload };
    case CART_TYPES.GET_CART:
    case CART_TYPES.ADD_TO_CART:
    case CART_TYPES.UPDATE_CART_ITEM:
    case CART_TYPES.REMOVE_FROM_CART:
      // ✅ Asegurar que payload tiene items, totalPrice y totalItems
      return {
        ...state,
        items: action.payload.items || [],
        totalPrice: action.payload.totalPrice || 0,
        totalItems: action.payload.totalItems || 0,
        loading: false,
        error: null
      };
    case CART_TYPES.CLEAR_CART:
      return { ...state, items: [], totalPrice: 0, totalItems: 0 };
    case CART_TYPES.CART_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default cartReducer;
// src/redux/reducers/cartReducer.js
import { CART_TYPES } from '../actions/cartAction';

const initialState = {
  loading: false,
  cart: { items: [], totalItems: 0, totalPrice: 0 },
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
      return { ...state, cart: action.payload, error: null };
    case CART_TYPES.CLEAR_CART:
      return { ...state, cart: { items: [], totalItems: 0, totalPrice: 0 } };
    case CART_TYPES.CART_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default cartReducer;
import { GLOBALTYPES } from '../actions/globalTypes';

const initialState = {
  orders: [], 
  loading: false,
  error: null
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.GET_ORDERS:
      return {
        ...state,
        orders: action.payload
      };

    case GLOBALTYPES.CREATE_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };

    default:
      return state;
  }
};

export default orderReducer;

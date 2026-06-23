import { ORDER_TYPES } from '../actions/orderAction';

const initialState = {
  loading: false,
  orders: [],
  total: 0,
  page: 1,
  pages: 1,
  stats: {
    totalOrders: 0,
    totalAmount: 0
  },
  orderDetail: null
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_TYPES.LOADING:
      return { ...state, loading: action.payload };
      
    case ORDER_TYPES.GET_USER_ORDERS:
      return {
        ...state,
        orders: action.payload.orders,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages
      };
      
    case ORDER_TYPES.GET_ALL_ORDERS:
      return {
        ...state,
        orders: action.payload.orders,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        stats: action.payload.stats
      };
      
    case ORDER_TYPES.GET_ORDER_DETAIL:
      return { ...state, orderDetail: action.payload };
      
    case ORDER_TYPES.UPDATE_ORDER_STATUS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.orderId === action.payload.orderId ? action.payload : order
        ),
        orderDetail: state.orderDetail?.orderId === action.payload.orderId
          ? action.payload
          : state.orderDetail
      };
      
    case ORDER_TYPES.CLEAR_ORDERS:
      return { ...initialState };
      
    default:
      return state;
  }
};

export default orderReducer;
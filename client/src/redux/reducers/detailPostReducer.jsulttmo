// redux/reducers/detailPostReducer.js
import * as types from '../constants/actionTypes';

const initialState = {
  post: null,
  loading: false,
  error: null
};

const detailPostReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_DETAIL_POST:
      return {
        ...state,
        post: action.payload,
        loading: false,
        error: null
      };
    
    case types.CLEAR_DETAIL_POST:
      return {
        ...initialState
      };
    
    case types.LOADING_DETAIL_POST:
      return {
        ...state,
        loading: action.payload
      };
    
    case types.ERROR_DETAIL_POST:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

export default detailPostReducer;
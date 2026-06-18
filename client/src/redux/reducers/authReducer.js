// src/redux/reducers/authReducer.js
import { GLOBALTYPES } from '../actions/globalTypes';

const initialState = {
  user: null,
  token: null,
  isLoading: false
};

  const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.AUTH:
      return {
        ...state,
        user: {
          ...action.payload.user,
          channelPlan: action.payload.user?.channelPlan || 'free'
        },
        token: action.payload.token
      };
    case "AUTH_UPDATE_ROLE":
      return {
        ...state,
        user: {
          ...state.user,
          role: action.payload,
          channelPlan: action.payload === 'userpro' ? (state.user?.channelPlan || 'basic') : 'free'
        }
      };
    case "AUTH_UPDATE_PLAN":
      return {
        ...state,
        user: {
          ...state.user,
          channelPlan: action.payload
        }
      };
    default:
      return state;
  }
};
export default authReducer
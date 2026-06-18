import { GLOBALTYPES } from '../actions/globalTypes';

const initialState = {
  socket: null
};

const globalReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.SOCKET:
      return {
        ...state,
        socket: action.payload
      };
    default:
      return state;
  }
};

export default globalReducer;

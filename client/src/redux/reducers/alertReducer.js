import { GLOBALTYPES } from '../actions/globalTypes';

const initialState = {
  loading: false,
  error: '',
  success: ''
};

  const alertReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.ALERT:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
export default alertReducer
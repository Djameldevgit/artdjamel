import { GLOBALTYPES } from "../actions/globalTypes";

const initialState = {
  images: false,
  style: false,
  ecommerce: false,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.SETTINGS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default settingsReducer;

 
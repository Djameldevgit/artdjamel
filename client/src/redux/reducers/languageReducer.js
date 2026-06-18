import { CHANGE_LANGUAGE } from "../actions/languageAction";

const initialState = {
  language: 'fr' // idioma por defecto
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_LANGUAGE.SET:
      return {
        ...state,
        language: action.payload.language
      };

    default:
      return state;
  }
};

export default languageReducer;

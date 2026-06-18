const initialState = {
  campo1: false,
  campo2: false,
  campo3: false,
  campo4: false,
  campo5: false,
};

const formReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_FORM":
      return action.payload;  // ejemplo: {_id:"66...", campo1:false,...}
    case "UPDATE_FORM":
      return action.payload;
    default:
      return state;
  }
};

export default formReducer;
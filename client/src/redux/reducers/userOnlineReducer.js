const initialState = {};

const userOnlineReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_USER_ONLINE_STATUS':
      return {
        ...state,
        [action.payload.userId]: action.payload.isOnline,
      };
    default:
      return state;
  }
};

export default userOnlineReducer;

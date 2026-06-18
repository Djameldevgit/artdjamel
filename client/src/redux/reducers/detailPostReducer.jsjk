import { POST_TYPES } from '../actions/postAction'

const initialState = {
  detailPost: []
};

const detailPostReducer = (state = initialState, action) => {
  switch (action.type) {
    case POST_TYPES.GET_POST:
      return {
        ...state,
        detailPost: state.detailPost.some(post => post._id === action.payload._id)
          ? state.detailPost.map(post =>
              post._id === action.payload._id ? action.payload : post
            )
          : [...state.detailPost, action.payload]
      };
      case POST_TYPES.VIEW_POST:
        return {
          ...state,
          detailPost: state.detailPost.map(post =>
            post._id === action.payload.postId
              ? action.payload.updatedPost   // 👈 reemplaza con el post actualizado
              : post
          )
        };
      

    default:
      return state;
  }
};

export default detailPostReducer;


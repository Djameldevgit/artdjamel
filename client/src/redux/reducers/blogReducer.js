const initialState = {
  comments: [],
  loading: false,
  error: null,
};

const sortByDateDesc = (arr) => {
  return [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export default function blogReducer(state = initialState, action) {
  switch(action.type) {
    case 'BLOG_GET_COMMENTS_REQUEST':
      return { ...state, loading: true };

    case 'BLOG_GET_COMMENTS_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        comments: sortByDateDesc(action.payload) 
      };

    case 'BLOG_GET_COMMENTS_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'BLOG_CREATE_COMMENT_SUCCESS':
    case 'BLOG_NEW_COMMENT_WS':
      return { 
        ...state, 
        comments: sortByDateDesc([action.payload, ...state.comments]) 
      };

    case 'BLOG_REPLY_WS':
      return {
        ...state,
        comments: sortByDateDesc(
          state.comments.map(comment =>
            comment._id === action.payload.commentId
              ? { 
                  ...comment, 
                  replies: [...(comment.replies || []), action.payload.reply],
                  updatedAt: action.payload.reply.createdAt // para que suba arriba si es más nuevo
                }
              : comment
          )
        )
      };

    case 'BLOG_UPDATE_WS':
      return {
        ...state,
        comments: sortByDateDesc(
          state.comments.map(comment =>
            comment._id === action.payload.commentId
              ? { ...comment, text: action.payload.text, updatedAt: new Date().toISOString() }
              : comment
          )
        )
      };

    case 'BLOG_DELETE_WS':
      return {
        ...state,
        comments: sortByDateDesc(
          state.comments.filter(comment => comment._id !== action.payload)
        )
      };

    case 'BLOG_LIKE_SUCCESS':
    case 'BLOG_DISLIKE_SUCCESS':
    case 'BLOG_LIKE_WS':
    case 'BLOG_DISLIKE_WS':
      return {
        ...state,
        comments: sortByDateDesc(
          state.comments.map(comment =>
            comment._id === action.payload.commentId
              ? { ...comment, likes: action.payload.likes, updatedAt: new Date().toISOString() }
              : comment
          )
        )
      };

    default:
      return state;
  }
}

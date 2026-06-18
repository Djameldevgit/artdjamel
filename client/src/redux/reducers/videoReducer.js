// redux/reducers/videoReducer.js
import { VIDEO_TYPES } from '../actions/videoAction';

const initialState = {
  loading: false,
  videos: [],
  currentVideo: null,
  total: 0,
  page: 1,
  totalPages: 0,
  hasMore: true,
  cart: [],
};

const updateVideoInArray = (arr, videoId, updater) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => (item?._id === videoId ? updater(item) : item));
};

const filterVideoFromArray = (arr, videoId) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => item?._id !== videoId);
};

const videoReducer = (state = initialState, action) => {
  switch (action.type) {
    case VIDEO_TYPES.LOADING:
      return { ...state, loading: action.payload };

    case VIDEO_TYPES.CREATE_VIDEO:
      return { ...state, videos: [action.payload, ...state.videos] };

    case VIDEO_TYPES.UPDATE_VIDEO: {
      const updated = action.payload;
      const updater = () => updated;
      return {
        ...state,
        videos: updateVideoInArray(state.videos, updated._id, updater),
        currentVideo: state.currentVideo?._id === updated._id ? updated : state.currentVideo,
      };
    }

    case VIDEO_TYPES.DELETE_VIDEO: {
      const id = action.payload;
      return {
        ...state,
        videos: filterVideoFromArray(state.videos, id),
        currentVideo: state.currentVideo?._id === id ? null : state.currentVideo,
      };
    }

    case VIDEO_TYPES.GET_VIDEO:
      return { ...state, currentVideo: action.payload };

    case VIDEO_TYPES.GET_VIDEOS:
      return {
        ...state,
        videos: action.payload.page === 1 ? action.payload.videos : [...state.videos, ...action.payload.videos],
        total: action.payload.total,
        page: action.payload.page,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.hasMore,
        loading: false,
      };

    case VIDEO_TYPES.LIKE_VIDEO: {
      const { id, liked, likes } = action.payload;
      const updater = (v) => ({ ...v, liked, likes });
      return {
        ...state,
        videos: updateVideoInArray(state.videos, id, updater),
        currentVideo: state.currentVideo?._id === id ? updater(state.currentVideo) : state.currentVideo,
      };
    }

    case VIDEO_TYPES.SHARE_VIDEO: {
      const { id, shared, shares } = action.payload;
      const updater = (v) => ({ ...v, shared, shares });
      return {
        ...state,
        videos: updateVideoInArray(state.videos, id, updater),
        currentVideo: state.currentVideo?._id === id ? updater(state.currentVideo) : state.currentVideo,
      };
    }

    case VIDEO_TYPES.TOGGLE_SAVE_VIDEO: {
      const { id, saved, savesCount } = action.payload;
      const updater = (v) => ({ ...v, saved, savesCount });
      return {
        ...state,
        videos: updateVideoInArray(state.videos, id, updater),
        currentVideo: state.currentVideo?._id === id ? updater(state.currentVideo) : state.currentVideo,
      };
    }

    case VIDEO_TYPES.INCREMENT_VIEW: {
      const { id, views } = action.payload;
      const updater = (v) => ({ ...v, views });
      return {
        ...state,
        videos: updateVideoInArray(state.videos, id, updater),
        currentVideo: state.currentVideo?._id === id ? updater(state.currentVideo) : state.currentVideo,
      };
    }

    case VIDEO_TYPES.ADD_TO_CART:
    case VIDEO_TYPES.REMOVE_FROM_CART:
    case VIDEO_TYPES.UPDATE_CART_QUANTITY:
    case VIDEO_TYPES.CLEAR_CART:
      return { ...state, cart: action.payload };

    default:
      return state;
  }
};

export default videoReducer;
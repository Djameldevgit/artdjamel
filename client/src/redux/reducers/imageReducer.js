// redux/reducers/imageReducer.js
import { IMAGE_TYPES } from '../actions/imageAction';

const initialState = {
  images: [],
  currentImage: null,
  userImages: [],
  trendingImages: [],
  loading: false,
  total: 0,
  page: 1,
  totalPages: 1,
  hasMore: false,
  error: null
};

const imageReducer = (state = initialState, action) => {
  switch (action.type) {
    case IMAGE_TYPES.LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case IMAGE_TYPES.GET_IMAGES:
      return {
        ...state,
        images: action.payload.images,
        total: action.payload.total,
        page: action.payload.page,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.hasMore,
        loading: false
      };
      
    case IMAGE_TYPES.GET_IMAGE:
      return {
        ...state,
        currentImage: action.payload,
        loading: false
      };
      
    case IMAGE_TYPES.CREATE_IMAGE:
      return {
        ...state,
        images: [action.payload, ...state.images],
        currentImage: action.payload,
        loading: false
      };
      
    case IMAGE_TYPES.UPDATE_IMAGE:
      return {
        ...state,
        images: state.images.map(img => 
          img._id === action.payload._id ? action.payload : img
        ),
        currentImage: state.currentImage?._id === action.payload._id 
          ? action.payload 
          : state.currentImage,
        loading: false
      };
      
    case IMAGE_TYPES.DELETE_IMAGE:
      return {
        ...state,
        images: state.images.filter(img => img._id !== action.payload),
        userImages: state.userImages.filter(img => img._id !== action.payload),
        currentImage: state.currentImage?._id === action.payload ? null : state.currentImage,
        loading: false
      };
      
    case IMAGE_TYPES.LIKE_IMAGE:
      return {
        ...state,
        images: state.images.map(img =>
          img._id === action.payload.id
            ? { ...img, likes: action.payload.likes, liked: action.payload.liked }
            : img
        ),
        currentImage: state.currentImage?._id === action.payload.id
          ? { ...state.currentImage, likes: action.payload.likes, liked: action.payload.liked }
          : state.currentImage,
        userImages: state.userImages.map(img =>
          img._id === action.payload.id
            ? { ...img, likes: action.payload.likes, liked: action.payload.liked }
            : img
        )
      };
      
    case IMAGE_TYPES.SHARE_IMAGE:
      return {
        ...state,
        images: state.images.map(img =>
          img._id === action.payload.id
            ? { ...img, shares: action.payload.shares, shared: action.payload.shared }
            : img
        ),
        currentImage: state.currentImage?._id === action.payload.id
          ? { ...state.currentImage, shares: action.payload.shares, shared: action.payload.shared }
          : state.currentImage
      };
      
    case IMAGE_TYPES.GET_USER_IMAGES:
      return {
        ...state,
        userImages: action.payload.images,
        total: action.payload.total,
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        loading: false
      };
      
    case IMAGE_TYPES.GET_TRENDING_IMAGES:
      return {
        ...state,
        trendingImages: action.payload.images,
        loading: false
      };
      
    default:
      return state;
  }
};

export default imageReducer;
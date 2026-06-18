import { CAROUSEL_TYPES } from '../actions/carouselHomeAction';

const initialState = {
  images: [],
  homeImages: [],
  allImages: [],
  loading: false,
  error: null
};

const carouselReducer = (state = initialState, action) => {
  switch (action.type) {
    case CAROUSEL_TYPES.GET_CAROUSEL_IMAGES:
      return {
        ...state,
        images: action.payload,
        homeImages: action.payload
      };
      
    case CAROUSEL_TYPES.GET_HOME_CAROUSEL:
      return {
        ...state,
        homeImages: action.payload,
        images: action.payload
      };
      
    case CAROUSEL_TYPES.GET_ALL_CAROUSEL_IMAGES:
      return {
        ...state,
        allImages: action.payload
      };
      
    case CAROUSEL_TYPES.CREATE_CAROUSEL_IMAGE:
      return {
        ...state,
        allImages: [...state.allImages, action.payload],
        homeImages: [...state.homeImages, action.payload],
        images: [...state.images, action.payload]
      };
      
    case CAROUSEL_TYPES.UPDATE_CAROUSEL_IMAGE:
      return {
        ...state,
        allImages: state.allImages.map(img =>
          img._id === action.payload._id ? action.payload : img
        ),
        homeImages: state.homeImages.map(img =>
          img._id === action.payload._id ? action.payload : img
        ),
        images: state.images.map(img =>
          img._id === action.payload._id ? action.payload : img
        )
      };
      
    case CAROUSEL_TYPES.DELETE_CAROUSEL_IMAGE:
      return {
        ...state,
        allImages: state.allImages.filter(img => img._id !== action.payload),
        homeImages: state.homeImages.filter(img => img._id !== action.payload),
        images: state.images.filter(img => img._id !== action.payload)
      };
      
    case CAROUSEL_TYPES.REORDER_CAROUSEL_IMAGES:
      const updatedAllImages = state.allImages.map(img => {
        const found = action.payload.find(item => item.id === img._id);
        return found ? { ...img, order: found.order } : img;
      });
      const updatedHomeImages = state.homeImages.map(img => {
        const found = action.payload.find(item => item.id === img._id);
        return found ? { ...img, order: found.order } : img;
      });
      return {
        ...state,
        allImages: updatedAllImages.sort((a, b) => (a.order || 0) - (b.order || 0)),
        homeImages: updatedHomeImages.sort((a, b) => (a.order || 0) - (b.order || 0)),
        images: updatedHomeImages
      };
      
    case CAROUSEL_TYPES.CAROUSEL_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case CAROUSEL_TYPES.CAROUSEL_ERROR:
      return {
        ...state,
        error: action.payload
      };
    
    default:
      return state;
  }
};

export default carouselReducer;
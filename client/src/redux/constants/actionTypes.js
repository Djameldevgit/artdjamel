// redux/constants/actionTypes.js
// Este archivo centraliza TODOS los tipos de acciones

// ============ AUTH ============
export const AUTH = 'AUTH';
export const LOGOUT = 'LOGOUT';
export const UPDATE_USER = 'UPDATE_USER';

// ============ ALERT ============
export const ALERT = 'ALERT';

// ============ CATEGORIES ============
export const GET_CATEGORIES = 'GET_CATEGORIES';
export const GET_CATEGORY = 'GET_CATEGORY';
export const GET_CATEGORY_CHILDREN = 'GET_CATEGORY_CHILDREN';
export const GET_CATEGORY_TREE = 'GET_CATEGORY_TREE';
export const GET_LEAF_CATEGORIES = 'GET_LEAF_CATEGORIES';
export const GET_CATEGORY_WITH_POSTS = 'GET_CATEGORY_WITH_POSTS';

export const SET_CURRENT_CATEGORY = 'SET_CURRENT_CATEGORY';
export const SET_BREADCRUMB = 'SET_BREADCRUMB';
export const SET_CATEGORY_FILTERS = 'SET_CATEGORY_FILTERS';

export const LOADING_CATEGORY = 'LOADING_CATEGORY';
export const ERROR_CATEGORY = 'ERROR_CATEGORY';
export const CLEAR_CATEGORY_ERROR = 'CLEAR_CATEGORY_ERROR';
export const RESET_CATEGORY_STATE = 'RESET_CATEGORY_STATE';

// ============ POSTS ============
export const GET_HOME_POSTS = 'GET_HOME_POSTS';
export const GET_CATEGORY_POSTS = 'GET_CATEGORY_POSTS';
export const GET_POST_SCROLL = 'GET_POST_SCROLL';
export const SEARCH_POSTS = 'SEARCH_POSTS';
export const CREATE_POST = 'CREATE_POST';
export const GET_POST = 'GET_POST';
export const UPDATE_POST = 'UPDATE_POST';
export const DELETE_POST = 'DELETE_POST';

export const SET_POST_FILTERS = 'SET_POST_FILTERS';
export const SET_CURRENT_POST = 'SET_CURRENT_POST';
export const CLEAR_POSTS = 'CLEAR_POSTS';
export const ADD_POST_VIEW = 'ADD_POST_VIEW';
export const TOGGLE_POST_FAVORITE = 'TOGGLE_POST_FAVORITE';

export const LOADING_POST = 'LOADING_POST';
export const ERROR_POST = 'ERROR_POST';
export const CLEAR_POST_ERROR = 'CLEAR_POST_ERROR';
export const RESET_POST_STATE = 'RESET_POST_STATE';

// ============ DETAIL POST ============
export const GET_DETAIL_POST = 'GET_DETAIL_POST';
export const CLEAR_DETAIL_POST = 'CLEAR_DETAIL_POST';
export const LOADING_DETAIL_POST = 'LOADING_DETAIL_POST';
export const ERROR_DETAIL_POST = 'ERROR_DETAIL_POST';

// ============ COMMENTS ============
export const GET_COMMENTS = 'GET_COMMENTS';
export const CREATE_COMMENT = 'CREATE_COMMENT';
export const UPDATE_COMMENT = 'UPDATE_COMMENT';
export const DELETE_COMMENT = 'DELETE_COMMENT';
export const REPLY_COMMENT = 'REPLY_COMMENT';

// ============ FAVORITES ============
export const GET_FAVORITES = 'GET_FAVORITES';
export const ADD_FAVORITE = 'ADD_FAVORITE';
export const REMOVE_FAVORITE = 'REMOVE_FAVORITE';

// ============ USERS ============
 
export const GET_USER_PROFILE = 'GET_USER_PROFILE';
export const FOLLOW_USER = 'FOLLOW_USER';
export const UNFOLLOW_USER = 'UNFOLLOW_USER';
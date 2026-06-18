// redux/constants/postConstants.js
 
export const GET_CATEGORY_POSTS = 'GET_CATEGORY_POSTS';
export const GET_POST_SCROLL = 'GET_POST_SCROLL';
 
 
export const GET_POST = 'GET_POST';
 

export const SET_POST_FILTERS = 'SET_POST_FILTERS';
export const SET_CURRENT_POST = 'SET_CURRENT_POST';
export const CLEAR_POSTS = 'CLEAR_POSTS';
export const ADD_POST_VIEW = 'ADD_POST_VIEW';
export const TOGGLE_POST_FAVORITE = 'TOGGLE_POST_FAVORITE';

 
export const RESET_POST_STATE = 'RESET_POST_STATE';


// redux/constants/postConstants.js - AGREGAR ESTAS SI NO LAS TIENES:
 
export const SUCCESS_POST = 'SUCCESS_POST'; // ← Opcional para mensajes de éxito

// Ya las tienes:
 // CONSTANTES BÁSICAS
export const CREATE_POST = 'CREATE_POST';
export const CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS';
export const CREATE_POST_FAIL = 'CREATE_POST_FAIL';

export const GET_POSTS = 'GET_POSTS';
export const GET_POSTS_SUCCESS = 'GET_POSTS_SUCCESS';
export const GET_POSTS_FAIL = 'GET_POSTS_FAIL';

export const GET_POST_BY_ID = 'GET_POST_BY_ID';
export const GET_POST_BY_ID_SUCCESS = 'GET_POST_BY_ID_SUCCESS';
export const GET_POST_BY_ID_FAIL = 'GET_POST_BY_ID_FAIL';

export const UPDATE_POST = 'UPDATE_POST';
export const UPDATE_POST_SUCCESS = 'UPDATE_POST_SUCCESS';
export const UPDATE_POST_FAIL = 'UPDATE_POST_FAIL';

export const DELETE_POST = 'DELETE_POST';
export const DELETE_POST_SUCCESS = 'DELETE_POST_SUCCESS';
export const DELETE_POST_FAIL = 'DELETE_POST_FAIL';

// CONSTANTES ESPECIALES (para home y búsqueda)
export const GET_HOME_POSTS = 'GET_HOME_POSTS';
export const GET_HOME_POSTS_SUCCESS = 'GET_HOME_POSTS_SUCCESS';
export const GET_HOME_POSTS_FAIL = 'GET_HOME_POSTS_FAIL';

export const SEARCH_POSTS = 'SEARCH_POSTS';
export const SEARCH_POSTS_SUCCESS = 'SEARCH_POSTS_SUCCESS';
export const SEARCH_POSTS_FAIL = 'SEARCH_POSTS_FAIL';

// CONSTANTES DE ESTADO
export const LOADING_POST = 'LOADING_POST';
export const ERROR_POST = 'ERROR_POST';
export const CLEAR_POST_ERROR = 'CLEAR_POST_ERROR';
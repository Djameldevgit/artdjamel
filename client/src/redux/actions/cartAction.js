// src/redux/actions/cartAction.js - Manejo de errores de stock mejorado

import { GLOBALTYPES } from './globalTypes';
import { getDataAPI, postDataAPI, putDataAPI, deleteDataAPI } from '../../utils/fetchData';

export const CART_TYPES = {
  LOADING: 'CART_LOADING',
  GET_CART: 'GET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  CART_ERROR: 'CART_ERROR'
};

// UTILIDAD: Normalizar items del carrito
// src/redux/actions/cartAction.js - normalizeCartItems
const normalizeCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => {
    const video = item.video || null;
    const videoId = item.videoId || video?._id || null;
    
    // ✅ Priorizar thumbnail guardado en el item
    let thumbnail = '/default-thumbnail.png';
    if (item.thumbnail && item.thumbnail !== '/default-thumbnail.png') {
      thumbnail = item.thumbnail;
    } else if (video) {
      if (video.thumbnail) thumbnail = video.thumbnail;
      else if (video.images && video.images.length > 0) {
        const firstImage = video.images[0];
        if (typeof firstImage === 'object' && firstImage.url) thumbnail = firstImage.url;
        else if (typeof firstImage === 'string') thumbnail = firstImage;
      }
    }
    
    return {
      videoId: videoId,
      video: video,
      quantity: item.quantity || 1,
      priceAtAdd: item.priceAtAdd || video?.price || 0,
      title: item.title || video?.title || 'Sin título',
      thumbnail: thumbnail,
      stock: video?.stock || 0,
      status: video?.status || 'en vente',
      ...item // Mantener otros campos
    };
  });
};

// ✅ Añadir al carrito (MEJORADO con manejo de errores de stock)
export const addToCart = (videoId, quantity = 1) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    if (!auth?.token) {
      throw new Error('Connectez-vous pour ajouter au panier');
    }
    
    const res = await postDataAPI('cart/add', { videoId, quantity }, auth.token);
    if (res.data.success) {
      const cart = res.data.cart;
      cart.items = normalizeCartItems(cart.items);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      dispatch({ 
        type: CART_TYPES.ADD_TO_CART, 
        payload: cart 
      });
      
      let message = res.data.alreadyInCart 
        ? 'Cette œuvre est déjà dans votre panier. Quantité mise à jour.' 
        : 'Votre œuvre a été ajoutée au panier !';
      
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { success: message } 
      });
      
      return { success: true, alreadyInCart: res.data.alreadyInCart };
    } else {
      throw new Error(res.data.message || 'Erreur lors de l\'ajout');
    }
  } catch (error) {
    console.error('❌ Error addToCart:', error);
    // ✅ Extraer mensaje del backend
    const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de l\'ajout au panier';
    dispatch({ 
      type: GLOBALTYPES.ALERT, 
      payload: { error: errorMsg } 
    });
    return { success: false, error: errorMsg };
  }
};
// Las demás acciones (getCart, updateCartItem, removeFromCart, clearCart)...
// (mantener igual que en versiones anteriores)
export const getCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const { auth } = getState();
    if (!auth?.token) {
      throw new Error('No autenticado');
    }
    
    const res = await getDataAPI('cart', auth.token);
    if (res.data.success) {
      const cart = res.data.cart;
      cart.items = normalizeCartItems(cart.items);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      dispatch({ 
        type: CART_TYPES.GET_CART, 
        payload: cart 
      });
    } else {
      throw new Error(res.data.message || 'Error al obtener carrito');
    }
  } catch (error) {
    console.error('❌ Error getCart:', error);
    dispatch({ 
      type: CART_TYPES.CART_ERROR, 
      payload: error.message 
    });
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};

export const updateCartItem = (videoId, quantity) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    if (!auth?.token) {
      throw new Error('No autenticado');
    }
    
    if (!videoId || typeof videoId !== 'string' || videoId.length !== 24) {
      throw new Error('ID de obra inválido');
    }
    
    const res = await putDataAPI('cart/update', { videoId, quantity }, auth.token);
    if (res.data.success) {
      const cart = res.data.cart;
      cart.items = normalizeCartItems(cart.items);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      dispatch({ 
        type: CART_TYPES.UPDATE_CART_ITEM, 
        payload: cart 
      });
    } else {
      throw new Error(res.data.message || 'Error al actualizar');
    }
  } catch (error) {
    console.error('❌ Error updateCartItem:', error);
    let errorMsg = 'Erreur lors de la mise à jour';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    dispatch({ 
      type: GLOBALTYPES.ALERT, 
      payload: { error: errorMsg } 
    });
  }
};

// src/redux/actions/cartAction.js - removeFromCart con normalización
export const removeFromCart = (videoId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    if (!auth?.token) {
      throw new Error('No autenticado');
    }
    
    const res = await deleteDataAPI(`cart/remove/${videoId}`, auth.token);
    if (res.data.success) {
      const cart = res.data.cart;
      // ✅ NORMALIZAR ITEMS antes de despachar
      cart.items = normalizeCartItems(cart.items);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      dispatch({ 
        type: CART_TYPES.REMOVE_FROM_CART, 
        payload: cart 
      });
      
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { success: 'Item supprimé du panier' } 
      });
    } else {
      throw new Error(res.data.message || 'Error al eliminar');
    }
  } catch (error) {
    console.error('❌ Error removeFromCart:', error);
    let errorMsg = 'Erreur lors de la suppression';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    dispatch({ 
      type: GLOBALTYPES.ALERT, 
      payload: { error: errorMsg } 
    });
  }
};
export const clearCart = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    if (!auth?.token) {
      throw new Error('No autenticado');
    }
    
    const res = await deleteDataAPI('cart/clear', auth.token);
    if (res.data.success) {
      dispatch({ 
        type: CART_TYPES.CLEAR_CART, 
        payload: { items: [], totalPrice: 0, totalItems: 0 } 
      });
      
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { success: 'Panier vidé avec succès' } 
      });
    } else {
      throw new Error(res.data.message || 'Error al vaciar');
    }
  } catch (error) {
    console.error('❌ Error clearCart:', error);
    let errorMsg = 'Erreur lors du vidage du panier';
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    dispatch({ 
      type: GLOBALTYPES.ALERT, 
      payload: { error: errorMsg } 
    });
  }
};

export const loadCart = (token) => async (dispatch) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const res = await getDataAPI('cart', token);
    if (res.data.success) {
      const cart = res.data.cart;
      cart.items = normalizeCartItems(cart.items);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      
      dispatch({ 
        type: CART_TYPES.GET_CART, 
        payload: cart 
      });
    }
  } catch (error) {
    console.error('❌ Error loadCart:', error);
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};
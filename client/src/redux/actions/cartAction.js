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

// Obtener carrito
export const getCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const { auth } = getState();
    if (!auth || !auth.token) {
      throw new Error('No autenticado');
    }
    const res = await getDataAPI('cart', auth.token);
    if (res.data.success) {
      dispatch({ type: CART_TYPES.GET_CART, payload: res.data.cart });
    }
  } catch (error) {
    console.error('Error getCart:', error);
    dispatch({ type: CART_TYPES.CART_ERROR, payload: error.message });
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};

export const addToCart = (videoId, quantity = 1) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    if (!auth || !auth.token) {
      throw new Error('No autenticado');
    }
    const res = await postDataAPI('cart/add', { videoId, quantity }, auth.token);
    if (res.data.success) {
      // ✅ Actualizar el estado con el carrito completo
      dispatch({ type: CART_TYPES.ADD_TO_CART, payload: res.data.cart });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Ajouté au panier' } });
    }
  } catch (error) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: error.response?.data?.message || 'Error al añadir' } });
  }
};

// Añadir al carrito
 
// Actualizar cantidad
export const updateCartItem = (videoId, quantity) => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await putDataAPI('cart/update', { videoId, quantity }, auth.token);
    if (res.data.success) {
      dispatch({ type: CART_TYPES.UPDATE_CART_ITEM, payload: res.data.cart });
    }
  } catch (error) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: error.response?.data?.message || 'Error al actualizar' } });
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};

// Eliminar item
export const removeFromCart = (videoId) => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await deleteDataAPI(`cart/remove/${videoId}`, auth.token);
    if (res.data.success) {
      dispatch({ type: CART_TYPES.REMOVE_FROM_CART, payload: res.data.cart });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Item eliminado' } });
    }
  } catch (error) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: error.response?.data?.message || 'Error al eliminar' } });
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};

// Vaciar carrito
export const clearCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CART_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await deleteDataAPI('cart/clear', auth.token);
    if (res.data.success) {
      dispatch({ type: CART_TYPES.CLEAR_CART });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Carrito vaciado' } });
    }
  } catch (error) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: error.response?.data?.message || 'Error al vaciar' } });
  } finally {
    dispatch({ type: CART_TYPES.LOADING, payload: false });
  }
};
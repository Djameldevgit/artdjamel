import { getDataAPI, putDataAPI,postDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from './globalTypes';

export const ORDER_TYPES = {
  LOADING: 'ORDER_LOADING',
  GET_USER_ORDERS: 'GET_USER_ORDERS',
  GET_ALL_ORDERS: 'GET_ALL_ORDERS',
  GET_ORDER_DETAIL: 'GET_ORDER_DETAIL',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  CLEAR_ORDERS: 'CLEAR_ORDERS',
  SYNC_ORDERS_LOADING: 'SYNC_ORDERS_LOADING',
  SYNC_ORDERS_SUCCESS: 'SYNC_ORDERS_SUCCESS',
  SYNC_ORDERS_ERROR: 'SYNC_ORDERS_ERROR'
};

// ============================================
// Obtener órdenes del usuario autenticado
// ============================================
export const getUserOrders = (page = 1, limit = 10) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_TYPES.LOADING, payload: true });
    
    const { auth } = getState();
    const res = await getDataAPI(`user/orders?page=${page}&limit=${limit}`, auth.token);
    
    dispatch({
      type: ORDER_TYPES.GET_USER_ORDERS,
      payload: {
        orders: res.data.orders,
        total: res.data.pagination.total,
        page: res.data.pagination.page,
        pages: res.data.pagination.pages
      }
    });
    
    return res.data;
  } catch (err) {
    console.error('❌ Error getUserOrders:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.error || err.message } });
    return null;
  } finally {
    dispatch({ type: ORDER_TYPES.LOADING, payload: false });
  }
};

// ============================================
// Obtener todas las órdenes (admin)
// ============================================
export const getAllOrders = (page = 1, limit = 20, status = '', startDate = '', endDate = '') => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_TYPES.LOADING, payload: true });
    
    const { auth } = getState();
    let url = `admin/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const res = await getDataAPI(url, auth.token);
    
    dispatch({
      type: ORDER_TYPES.GET_ALL_ORDERS,
      payload: {
        orders: res.data.orders,
        total: res.data.pagination.total,
        page: res.data.pagination.page,
        pages: res.data.pagination.pages,
        stats: res.data.stats
      }
    });
    
    return res.data;
  } catch (err) {
    console.error('❌ Error getAllOrders:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.error || err.message } });
    return null;
  } finally {
    dispatch({ type: ORDER_TYPES.LOADING, payload: false });
  }
};

// ============================================
// Obtener detalle de una orden
// ============================================
export const getOrderDetail = (orderId) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_TYPES.LOADING, payload: true });
    
    const { auth } = getState();
    const res = await getDataAPI(`order/${orderId}`, auth.token);
    
    dispatch({
      type: ORDER_TYPES.GET_ORDER_DETAIL,
      payload: res.data.order
    });
    
    return res.data.order;
  } catch (err) {
    console.error('❌ Error getOrderDetail:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.error || err.message } });
    return null;
  } finally {
    dispatch({ type: ORDER_TYPES.LOADING, payload: false });
  }
};

// ============================================
// Actualizar estado de una orden (admin)
// ============================================
export const updateOrderStatus = (orderId, status) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_TYPES.LOADING, payload: true });
    
    const { auth } = getState();
    const res = await putDataAPI(`order/${orderId}/status`, { status }, auth.token);
    
    dispatch({
      type: ORDER_TYPES.UPDATE_ORDER_STATUS,
      payload: res.data.order
    });
    
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Statut mis à jour avec succès' } });
    return res.data.order;
  } catch (err) {
    console.error('❌ Error updateOrderStatus:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.error || err.message } });
    return null;
  } finally {
    dispatch({ type: ORDER_TYPES.LOADING, payload: false });
  }
};
// redux/actions/orderAction.js
// Agregar al final del archivo

 


export const syncPendingOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await postDataAPI('sync-pending-orders', {}, auth.token);
    dispatch({
      type: ORDER_TYPES.SYNC_ORDERS_SUCCESS,
      payload: res.data.stats // <--- ¿Está guardando `stats`?
    });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.message } });
    return res.data;
  } catch (err) {
    // ...
  } finally {
    dispatch({ type: ORDER_TYPES.LOADING, payload: false });
  }
};
export const clearOrders = () => ({ type: ORDER_TYPES.CLEAR_ORDERS });
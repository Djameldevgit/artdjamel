import { getDataAPI, postDataAPI, putDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from './globalTypes';

// ============================================
// TIPOS DE ACCIONES
// ============================================
export const COMMISSION_TYPES = {
  LOADING: 'COMMISSION_LOADING',
  GET_CLIENT_COMMISSIONS: 'GET_CLIENT_COMMISSIONS',
  GET_ARTIST_COMMISSIONS: 'GET_ARTIST_COMMISSIONS',
  GET_COMMISSION_DETAIL: 'GET_COMMISSION_DETAIL',
  CREATE_COMMISSION: 'CREATE_COMMISSION',
  RESPOND_COMMISSION: 'RESPOND_COMMISSION',
  DECIDE_COMMISSION: 'DECIDE_COMMISSION',
  INITIATE_PAYMENT: 'INITIATE_PAYMENT',
  CLEAR_COMMISSIONS: 'CLEAR_COMMISSIONS',
  SET_ERROR: 'COMMISSION_SET_ERROR',
  CLEAR_ERROR: 'COMMISSION_CLEAR_ERROR'
};

// ============================================
// 1. CREAR UN NUEVO ENCARGO (Cliente)
// ============================================
export const createCommission = (formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await postDataAPI('commissions', formData, auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.CREATE_COMMISSION,
      payload: res.data
    });
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: '¡Encargo creado exitosamente!' }
    });
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: errorMsg }
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 2. OBTENER ENCARGOS DEL CLIENTE
// ============================================
export const getClientCommissions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await getDataAPI('commissions/client', auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.GET_CLIENT_COMMISSIONS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 3. OBTENER ENCARGOS PARA EL ARTISTA
// ============================================
export const getArtistCommissions = () => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await getDataAPI('commissions/artist', auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.GET_ARTIST_COMMISSIONS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 4. OBTENER DETALLE DE UN ENCARGO (opcional)
// ============================================
export const getCommissionDetail = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await getDataAPI(`commissions/${id}`, auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.GET_COMMISSION_DETAIL,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 5. ARTISTA RESPONDE AL ENCARGO
// ============================================
export const respondCommission = (id, responseData) => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await putDataAPI(`commissions/${id}/respond`, responseData, auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.RESPOND_COMMISSION,
      payload: res.data
    });
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: 'Respuesta enviada al cliente' }
    });
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: errorMsg }
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 6. CLIENTE DECIDE SOBRE LA RESPUESTA
// ============================================
export const decideCommission = (id, decision) => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await putDataAPI(`commissions/${id}/decide`, { decision }, auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.DECIDE_COMMISSION,
      payload: res.data.commission
    });
    
    const msg = decision === 'aceptar' 
      ? '¡Has aceptado la oferta! Ahora procede al pago.' 
      : decision === 'rechazar' 
        ? 'Has rechazado la oferta.' 
        : 'Oferta guardada para más tarde.';
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: msg }
    });
    
    // Si aceptó, devolvemos el commission actualizado para iniciar pago
    return res.data.commission;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: errorMsg }
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 7. INICIAR PAGO DEL ADELANTO (Cliente)
// ============================================
export const initiatePayment = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: true });
    const { auth } = getState();
    const res = await postDataAPI(`commissions/${id}/pay`, {}, auth.token);
    
    dispatch({
      type: COMMISSION_TYPES.INITIATE_PAYMENT,
      payload: res.data // { paymentUrl, paymentId }
    });
    
    // Redirigir a la pasarela de pago
    if (res.data.paymentUrl) {
      window.location.href = res.data.paymentUrl;
    }
    
    return res.data;
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    dispatch({
      type: COMMISSION_TYPES.SET_ERROR,
      payload: errorMsg
    });
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: errorMsg }
    });
    return null;
  } finally {
    dispatch({ type: COMMISSION_TYPES.LOADING, payload: false });
  }
};

// ============================================
// 8. LIMPIAR ESTADO
// ============================================
export const clearCommissions = () => ({
  type: COMMISSION_TYPES.CLEAR_COMMISSIONS
});

export const clearCommissionError = () => ({
  type: COMMISSION_TYPES.CLEAR_ERROR
});
// 📂 redux/actions/productAproveAction.js
import { GLOBALTYPES } from './globalTypes'
import { getDataAPI, putDataAPI, deleteDataAPI } from '../../utils/fetchData'

export const PRODUCT_APROVE_TYPES = {
  LOADING: 'LOADING_PRODUCTS',
  GET_PENDIENTES: 'GET_PRODUCTS_PENDIENTES',
  APROBAR: 'APROBAR_PRODUCT',
  RECHAZAR: 'RECHAZAR_PRODUCT',
  RESET: 'RESET_PRODUCTS'
}

// 🔥 GET PRODUCTOS PENDIENTES
export const getProductsPendientes = (token, page = 1, limit = 10, filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_APROVE_TYPES.LOADING, payload: true });
    
    let url = `boutiques/products/pendientes?page=${page}&limit=${limit}`;
    if (filters.boutiqueId) {
      url += `&boutiqueId=${encodeURIComponent(filters.boutiqueId)}`;
    }
    if (filters.categorie) {
      url += `&categorie=${encodeURIComponent(filters.categorie)}`;
    }
    
    const res = await getDataAPI(url, token);
    
    dispatch({
      type: PRODUCT_APROVE_TYPES.GET_PENDIENTES,
      payload: {
        products: res.data.products,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
        totalPages: res.data.totalPages,
        hasMore: res.data.hasMore
      }
    });
    
    dispatch({ type: PRODUCT_APROVE_TYPES.LOADING, payload: false });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || err.message }
    });
    dispatch({ type: PRODUCT_APROVE_TYPES.LOADING, payload: false });
  }
};

// 🔥 APROBAR PRODUCTO
export const aprobarProducto = (id, token, auth, socket) => async (dispatch) => {
  try {
    const res = await putDataAPI(`boutiques/products/aprobar/${id}`, {}, token);
    
    dispatch({
      type: PRODUCT_APROVE_TYPES.APROBAR,
      payload: { id }
    });
    
    // ✅ Enviar notificación al dueño del producto
    const product = res.data.product;
    const msg = {
      id: auth.user._id,
      text: '✅ Votre produit a été approuvé par l\'administrateur',
      recipients: [product.user?._id || product.boutique?.user?._id],
      url: `/product/${product._id}`,
      content: product.title,
      image: product.images?.[0]?.url,
      type: 'product'
    };
    
    dispatch(createNotify({ msg, auth, socket }));
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: res.data.message }
    });
    
    return { success: true };
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || err.message }
    });
    return { success: false, error: err.response?.data?.message };
  }
};

// 🔥 RECHAZAR PRODUCTO
export const rechazarProducto = (id, token, auth, socket) => async (dispatch) => {
  try {
    const res = await deleteDataAPI(`boutiques/products/rechazar/${id}`, token);
    
    dispatch({
      type: PRODUCT_APROVE_TYPES.RECHAZAR,
      payload: { id }
    });
    
    // ✅ Enviar notificación al dueño del producto
    const product = res.data.product;
    const msg = {
      id: auth.user._id,
      text: '❌ Votre produit a été rejeté par l\'administrateur',
      recipients: [product.user?._id || product.boutique?.user?._id],
      url: `/product/${product._id}`,
      content: product.title,
      image: product.images?.[0]?.url,
      type: 'product'
    };
    
    dispatch(createNotify({ msg, auth, socket }));
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: res.data.message }
    });
    
    return { success: true };
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || err.message }
    });
    return { success: false, error: err.response?.data?.message };
  }
};

// 🔥 RESET
export const resetProducts = () => (dispatch) => {
  dispatch({ type: PRODUCT_APROVE_TYPES.RESET });
};
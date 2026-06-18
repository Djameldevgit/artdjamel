 
import { getDataAPI, postDataAPI } from '../../utils/fetchData';
export const GLOBALTYPES = {
  LOADING: 'LOADING',
  ALERT: 'ALERT',
  GET_ORDERS: 'GET_ORDERS',
  CREATE_ORDER: 'CREATE_ORDER',
  // otros tipos...
};
export const getOrders = (token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.LOADING, payload: true });
    const res = await getDataAPI('orders', token);
 
    dispatch({
      type: GLOBALTYPES.GET_ORDERS,
      payload: res.data.orders,
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Error al obtener pedidos' },
    });
  } finally {
    dispatch({ type: GLOBALTYPES.LOADING, payload: false });
  }
};

export const createOrder = (token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.LOADING, payload: true });
    const res = await postDataAPI('orders', {}, token);

    dispatch({
      type: GLOBALTYPES.CREATE_ORDER,
      payload: res.data.order,
    });

    // Opcional: limpiar carrito tras compra
    dispatch({
      type: GLOBALTYPES.LOAD_CART,
      payload: { items: [], totalPrice: 0 },
    });

    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: 'Pedido realizado correctamente' },
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Error al crear pedido' },
    });
  } finally {
    dispatch({ type: GLOBALTYPES.LOADING, payload: false });
  }
};

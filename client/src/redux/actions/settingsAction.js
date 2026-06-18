import { GLOBALTYPES } from "./globalTypes";
import { getDataAPI, patchDataAPI } from "../../utils/fetchData";

export const getSettings = () => async (dispatch) => {
  try {
    const res = await getDataAPI("settings");
    dispatch({ type: GLOBALTYPES.SETTINGS, payload: res.data });
  } catch (err) {
    console.error(err);
  }
};

export const updateSettings = (settings, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI("settings", settings, token);
    dispatch({ type: GLOBALTYPES.SETTINGS, payload: res.data.settings });

    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: "Valores actualizados con éxito ✅" },
    });
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || "Error al actualizar configuración" },
    });
  }
};

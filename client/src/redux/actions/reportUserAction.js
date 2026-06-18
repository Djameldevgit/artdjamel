import { GLOBALTYPES } from './globalTypes';
import { getDataAPI, postDataAPI } from '../../utils/fetchData';

export const REPORT_TYPES = {
    CREATE_REPORT: 'CREATE_REPORT',
    GET_REPORTS: 'GET_REPORTS',
    LOADING_REPORT: 'LOADING_REPORT',
    GET_MOST_REPORTED_USERS:'GET_MOST_REPORTED_USERS',
    GET_MOST_ACTIVE_REPORTERS:'GET_MOST_ACTIVE_REPORTERS',
};

export const createReport = ({ auth, reportData }) => async (dispatch) => {
  try {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

      const res = await postDataAPI('reports', reportData, auth.token);

      dispatch({
          type: REPORT_TYPES.CREATE_REPORT,
          payload: res.data.report,
      });

      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
      dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: res.data.msg },
      });

  } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
      dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: err.response?.data?.msg || "Error al crear el reporte" },
      });
  }
};



export const getReports = (token) => async (dispatch) => {
    try {
        dispatch({ type: REPORT_TYPES.LOADING_REPORT, payload: true });

        // Obtenemos los reportes desde el backend
        const res = await getDataAPI('reports', token);
        console.log(res)
        // Despachamos la acción para guardar los reportes en el estado global
        dispatch({
            type: REPORT_TYPES.GET_REPORTS,
            payload: { ...res.data, page: 2 }
        });

        dispatch({ type: REPORT_TYPES.LOADING_REPORT, payload: false });
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || "Error al obtener los reportes" },
        });
    }
};

 

export const getMostReportedUsers = (token) => async (dispatch) => {
  try {
    const res = await getDataAPI("reports/most-reported-users", token);
    dispatch({ type: REPORT_TYPES.GET_MOST_REPORTED_USERS, payload: res.data.mostReportedUsers });
  } catch (err) {
    console.log(err);
  }
};

export const getMostActiveReporters = (token) => async (dispatch) => {
  try {
    const res = await getDataAPI("reports/most-active-reporters", token);
    dispatch({ type: REPORT_TYPES.GET_MOST_ACTIVE_REPORTERS, payload: res.data.mostActiveReporters });
  } catch (err) {
    console.log(err);
  }
};

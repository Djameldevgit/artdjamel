import { REPORT_TYPES } from "../actions/reportUserAction";


const initialState = {
    reports: [],
    mostReportedUsers: [],
    mostActiveReporters: [],
    loading: false,
    error: null,
    result: 0,
    page: 2,
    
};

const reportReducer = (state = initialState, action) => {
    switch (action.type) {
        case REPORT_TYPES.LOADING_REPORT:
            return {
                ...state,
                loading: action.payload,
            };
        case REPORT_TYPES.CREATE_REPORT:
            return {
                ...state,
                reports: [action.payload, ...state.reports], // Agrega el nuevo reporte al inicio
            };
        case REPORT_TYPES.GET_REPORTS:
         
            return {
                ...state,
                reports: action.payload.reports,
                result: action.payload.result,
                page: action.payload.page
            };
        case REPORT_TYPES.GET_MOST_REPORTED_USERS:
            return { ...state, mostReportedUsers: action.payload };

        case REPORT_TYPES.GET_MOST_ACTIVE_REPORTERS:
            return { ...state, mostActiveReporters: action.payload };

        default:
            return state;
    }
};

export default reportReducer;

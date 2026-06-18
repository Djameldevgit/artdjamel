import { USERS_TYPES_ACTION } from "../actions/usersActionAction";

 
const initialState = {
    loading: false,
    users: [],
    denuncias: [],
    activeLast24hUsers: [],
    activeLast3hUsers: [],
    counttotal: 0,
    result: 0,
    page: 1,
    error: null,
};

const usersActionReducer = (state = initialState, action) => {
    switch (action.type) {
        case USERS_TYPES_ACTION.LOADING_USERS_ACTION:
            return { ...state, loading: action.payload };

        case USERS_TYPES_ACTION.GET_TOTAL_USERS_COUNT_ACTION:
            return { ...state, counttotal: action.payload };

        case USERS_TYPES_ACTION.GET_USERS_ACTION:
            return {
                ...state,
                users: action.payload.users,
                result: action.payload.result,
                page: action.payload.page,
            };

        case USERS_TYPES_ACTION.UPDATE_USERS_ACTION:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                ),
            };

        case USERS_TYPES_ACTION.DELETE_USERS_ACTION:
            return {
                ...state,
                users: state.users.filter(user => user._id !== action.payload), // ✅ Aquí comparas con action.payload directamente
            };


        case USERS_TYPES_ACTION.GET_ACTIVE_USERS_LAST_24H_ACTION:
            return {
                ...state,
                activeLast24hUsers: action.payload,
            };

        case USERS_TYPES_ACTION.GET_ACTIVE_USERS_LAST_3H_ACTION:
            return {
                ...state,
                activeLast3hUsers: action.payload,
            };

        case USERS_TYPES_ACTION.UPDATE_USERS_STATU_ACTIONS:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload.userId ? { ...user, status: action.payload.newStatus } : user
                ),
            };

        case USERS_TYPES_ACTION.CREAR_DENUNCIA_ACTION:
            return {
                ...state,
                denuncias: [action.payload, ...state.denuncias],
                loading: false,
            };

        case USERS_TYPES_ACTION.GET_DENUNCIAS_ACTION:
            return {
                ...state,
                denuncias: action.payload,
            };

        default:
            return state;
    }
};

export default usersActionReducer;

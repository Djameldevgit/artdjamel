// redux/reducers/notifyReducer.js
import { NOTIFY_TYPES } from '../actions/notifyAction'
import { EditData } from '../actions/globalTypes'

const initialState = {
    loading: false,
    data: [],
    sound: false,
    lastUpdate: null
};

const notifyReducer = (state = initialState, action) => {
    switch (action.type) {
        case NOTIFY_TYPES.LOADING:
            return { ...state, loading: action.payload };
            
        case NOTIFY_TYPES.GET_NOTIFIES:
            return { 
                ...state, 
                data: action.payload, 
                loading: false,
                lastUpdate: Date.now()
            };
            
        case NOTIFY_TYPES.CREATE_NOTIFY:
            // ✅ Prevenir duplicados por ID
            const exists = state.data.some(notify => notify._id === action.payload._id);
            if (exists) return state;
            
            return { 
                ...state, 
                data: [action.payload, ...state.data],
                lastUpdate: Date.now()
            };
            
        case NOTIFY_TYPES.REMOVE_NOTIFY:
            return {
                ...state,
                data: state.data.filter(item => (
                    item.id !== action.payload.id || item.url !== action.payload.url
                ))
            };
            
        case NOTIFY_TYPES.UPDATE_NOTIFY:
            return {
                ...state,
                data: EditData(state.data, action.payload._id, action.payload),
                lastUpdate: Date.now()
            };
            
        case NOTIFY_TYPES.UPDATE_SOUND:
            return {
                ...state,
                sound: action.payload
            };
            
        case NOTIFY_TYPES.DELETE_ALL_NOTIFIES:
            return {
                ...state,
                data: [],
                lastUpdate: Date.now()
            };

        default:
            return state;
    }
};

export default notifyReducer;
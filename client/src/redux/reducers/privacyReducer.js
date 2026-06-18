import { PRIVACY_TYPES } from "../actions/privacyAction";

const initialState = {
    loading: false,
    privacySettings: {
        profile: 'public',
        posts: 'public',
        followers: 'public',
        following: 'public',
        likes: 'public',
        email: 'private',
        address: 'private',
        mobile: 'private'
    }
};

const privacyReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRIVACY_TYPES.LOADING_PRIVACY:
            return {
                ...state,
                loading: action.payload
            };
        
        case PRIVACY_TYPES.GET_PRIVACY:
        case PRIVACY_TYPES.UPDATE_PRIVACY:
            // Filtrar valores nulos y mantener los existentes
            const filteredPayload = {};
            Object.keys(action.payload).forEach(key => {
                if (action.payload[key] !== null && action.payload[key] !== undefined) {
                    filteredPayload[key] = action.payload[key];
                }
            });
            
            return {
                ...state,
                privacySettings: { 
                    ...state.privacySettings, 
                    ...filteredPayload 
                }
            };
        
        default:
            return state;
    }
}

export default privacyReducer;
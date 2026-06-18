const initialState = {
    stats: null,
    annonces: [],
    commandes: [],
    notifications: [],
    boutique: null,
    loading: false
};

export default function dashboardReducer(state = initialState, action) {
    switch (action.type) {
        case DASHBOARD_TYPES.FETCH_STATS:
            return { ...state, stats: action.payload };
        case DASHBOARD_TYPES.SET_LOADING:
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}
export const DASHBOARD_TYPES = {
    FETCH_STATS: 'FETCH_DASHBOARD_STATS',
    FETCH_ANNONCES: 'FETCH_DASHBOARD_ANNONCES',
    FETCH_COMMANDES: 'FETCH_DASHBOARD_COMMANDES',
    FETCH_NOTIFICATIONS: 'FETCH_DASHBOARD_NOTIFICATIONS',
    UPDATE_SETTINGS: 'UPDATE_DASHBOARD_SETTINGS',
    SET_LOADING: 'SET_DASHBOARD_LOADING'
};

export const fetchDashboardStats = () => async (dispatch) => {
    // Logique pour récupérer les statistiques
};

export const fetchUserAnnonces = () => async (dispatch) => {
    // Logique pour récupérer les annonces de l'utilisateur
};
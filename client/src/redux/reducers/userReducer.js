// redux/reducers/userReducer.js
// ============================================
// 📦 REDUCER DE USUARIO - ACTUALIZADO CON LIKE_VIDEO
// ============================================

import { USER_TYPES } from '../actions/userAction';

const initialState = {
    // ============ USUARIOS NORMALES (ADMIN) ============
    loading: false,
    users: [],
    result: 0,
    page: 1,
    error: null,
    
    // ============ USUARIOS BLOQUEADOS ============
    blockedUsers: [],
    blockedResult: 0,
    blockedPage: 1,
    loadingBlocked: false,
    
    // ============ COMENTARIOS ADMIN ============
    adminComments: {},
    
    // ============ PERFIL DE USUARIO ============
    profile: null,
    userVideos: [],
    savedVideos: [],
    likedVideos: [],
    activeTab: 'videos',
    
    // ============ PAGINACIÓN ============
    userVideosTotal: 0,
    userVideosPage: 1,
    userVideosHasMore: true,
    
    savedVideosTotal: 0,
    savedVideosPage: 1,
    savedVideosHasMore: true,
    
    likedVideosTotal: 0,
    likedVideosPage: 1,
    likedVideosHasMore: true,
    
    // ============ ESTADOS DE CARGA ============
    profileLoading: false
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        // ============ USUARIOS NORMALES ============
        case USER_TYPES.LOADING_USERS:
            return { ...state, loading: action.payload };

        case USER_TYPES.GET_USERS:
            return {
                ...state,
                users: action.payload.users || [],
                result: action.payload.result || 0,
                page: action.payload.page || 1,
                loading: false
            };

        case USER_TYPES.UPDATE_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id 
                        ? { ...user, ...action.payload } 
                        : user
                )
            };

        case USER_TYPES.UPDATE_USER_VERIFICATION:
            return {
                ...state,
                users: state.users.map(u =>
                    u._id === action.payload._id 
                        ? { ...u, isVerified: action.payload.isVerified } 
                        : u
                ),
            };

        case USER_TYPES.DELETE_USER:
            return {
                ...state,
                users: state.users.filter(u => u._id !== action.payload),
                result: state.result - 1
            };

        // ============ ACTIVAR/DESACTIVAR ============
        case USER_TYPES.ACTIVATE_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { ...user, isActive: true }
                        : user
                )
            };

        case USER_TYPES.DEACTIVATE_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { ...user, isActive: false }
                        : user
                )
            };

        case USER_TYPES.TOGGLE_ACTIVE_STATUS:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { ...user, isActive: action.payload.isActive }
                        : user
                )
            };

        // ============ BLOQUEO/DESBLOQUEO ============
        case USER_TYPES.BLOCK_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { 
                            ...user, 
                            isBlocked: true,
                            isActive: false,
                            blockDetails: action.payload.blockDetails
                          }
                        : user
                ),
                blockedUsers: state.blockedUsers.some(u => u._id === action.payload._id)
                    ? state.blockedUsers.map(user =>
                        user._id === action.payload._id
                            ? { ...user, ...action.payload }
                            : user
                      )
                    : [...state.blockedUsers, action.payload]
            };

        case USER_TYPES.UNBLOCK_USER:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { 
                            ...user, 
                            isBlocked: false,
                            isActive: true,
                            blockDetails: null
                          }
                        : user
                ),
                blockedUsers: state.blockedUsers.filter(
                    user => user._id !== action.payload._id
                )
            };

        case USER_TYPES.LOADING_BLOCKED_USERS:
            return { ...state, loadingBlocked: action.payload };

        case USER_TYPES.GET_BLOCKED_USERS:
            return {
                ...state,
                blockedUsers: action.payload.page === 1
                    ? action.payload.blockedUsers
                    : [...state.blockedUsers, ...action.payload.blockedUsers],
                blockedResult: action.payload.result || 0,
                blockedPage: action.payload.page || 1,
                loadingBlocked: false
            };

        // ============ PLANES ============
        case USER_TYPES.ACTIVATE_PRO:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { 
                            ...user, 
                            isPro: true,
                            proExpiryDate: action.payload.proExpiryDate || null,
                            channelPlan: action.payload.proExpiryDate ? 'pro' : user.channelPlan,
                            channelPlanExpiresAt: action.payload.proExpiryDate || user.channelPlanExpiresAt
                          }
                        : user
                )
            };

        case USER_TYPES.DEACTIVATE_PRO:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload._id
                        ? { 
                            ...user, 
                            isPro: false,
                            proExpiryDate: null,
                            channelPlan: user.channelPlan === 'pro' ? 'free' : user.channelPlan,
                            channelPlanExpiresAt: user.channelPlan === 'pro' ? null : user.channelPlanExpiresAt
                          }
                        : user
                )
            };

        case USER_TYPES.UPDATE_USER_PLAN_SUCCESS:
            return {
                ...state,
                users: state.users.map(user =>
                    user._id === action.payload.userId
                        ? { 
                            ...user, 
                            channelPlan: action.payload.plan,
                            channelPlanExpiresAt: action.payload.expiresAt,
                            isPro: (action.payload.plan === 'pro' || action.payload.plan === 'business'),
                            proExpiryDate: action.payload.expiresAt || null
                          }
                        : user
                ),
                loading: false
            };

        // ============ PERFIL DE USUARIO ============
        case USER_TYPES.LOADING:
            return { ...state, profileLoading: action.payload };

        case USER_TYPES.GET_USER_PROFILE:
            return { ...state, profile: action.payload, profileLoading: false };

        case USER_TYPES.GET_USER_VIDEOS:
            return {
                ...state,
                userVideos: action.payload.page === 1 
                    ? action.payload.videos 
                    : [...state.userVideos, ...action.payload.videos],
                userVideosTotal: action.payload.total,
                userVideosPage: action.payload.page,
                userVideosHasMore: action.payload.hasMore
            };

        case USER_TYPES.GET_SAVED_VIDEOS:
            return {
                ...state,
                savedVideos: action.payload.page === 1 
                    ? action.payload.videos 
                    : [...state.savedVideos, ...action.payload.videos],
                savedVideosTotal: action.payload.total,
                savedVideosPage: action.payload.page,
                savedVideosHasMore: action.payload.hasMore
            };

        case USER_TYPES.GET_LIKED_VIDEOS:
            return {
                ...state,
                likedVideos: action.payload.page === 1 
                    ? action.payload.videos 
                    : [...state.likedVideos, ...action.payload.videos],
                likedVideosTotal: action.payload.total,
                likedVideosPage: action.payload.page,
                likedVideosHasMore: action.payload.hasMore
            };

        case USER_TYPES.SET_ACTIVE_TAB:
            return { ...state, activeTab: action.payload };

        case USER_TYPES.FOLLOW_USER:
            return {
                ...state,
                profile: state.profile ? {
                    ...state.profile,
                    isFollowing: action.payload.isFollowing,
                    followersCount: action.payload.followersCount
                } : null
            };

        // ============ SAVE VIDEO (GUARDAR) ============
        case USER_TYPES.SAVE_VIDEO:
            const updateVideoList = (videos) => 
                videos.map(v => 
                    v._id === action.payload.videoId 
                        ? { ...v, isSaved: action.payload.isSaved }
                        : v
                );
            
            return {
                ...state,
                userVideos: updateVideoList(state.userVideos),
                savedVideos: updateVideoList(state.savedVideos),
                likedVideos: updateVideoList(state.likedVideos)
            };

        // ============ LIKE VIDEO (NUEVO) ============
        case USER_TYPES.LIKE_VIDEO:
            const updateLikeInList = (videos) => 
                videos.map(v => 
                    v._id === action.payload.videoId 
                        ? { ...v, liked: action.payload.isLiked }
                        : v
                );
            
            return {
                ...state,
                userVideos: updateLikeInList(state.userVideos),
                savedVideos: updateLikeInList(state.savedVideos),
                likedVideos: updateLikeInList(state.likedVideos)
            };

        // ============ COMENTARIOS ADMIN ============
        case USER_TYPES.GET_ADMIN_COMMENTS:
            return {
                ...state,
                adminComments: {
                    ...state.adminComments,
                    [action.payload.adminUserId]: action.payload.comments
                }
            };

        case USER_TYPES.ADD_ADMIN_COMMENT:
            return {
                ...state,
                adminComments: {
                    ...state.adminComments,
                    [action.payload.blogAuthor]: [
                        action.payload,
                        ...(state.adminComments[action.payload.blogAuthor] || [])
                    ]
                }
            };

        // ============ TRANSACCIONES ============
        case USER_TYPES.GET_USER_TRANSACTIONS:
            return {
                ...state,
                userTransactions: action.payload
            };

        // ============ LIMPIAR ============
        case USER_TYPES.CLEAR_USER_ERROR:
            return { ...state, error: null };

        case USER_TYPES.CLEAR_USER_STATE:
            return {
                ...state,
                profile: null,
                userVideos: [],
                savedVideos: [],
                likedVideos: [],
                activeTab: 'videos',
                userVideosTotal: 0,
                savedVideosTotal: 0,
                likedVideosTotal: 0
            };

        case USER_TYPES.RESET_USERS:
            return { ...initialState };
            
        default:
            return state;
    }
};

export default userReducer;
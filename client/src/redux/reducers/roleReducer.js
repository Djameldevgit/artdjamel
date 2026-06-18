import { ROLES_TYPES } from '../actions/roleAction';

const initialState = {
  isAdmin: false,
  isModerator: false,
  isuserpro: false,
  lastUpdated: null,
  currentPlan: 'free'  // ✅ NUEVO: Plan actual
};

export const roleReducer = (state = initialState, action) => {
  switch (action.type) {
    case ROLES_TYPES.UPDATE_ROLE:
      return {
        ...state,
        isAdmin: action.payload.newRole === 'admin',
        isModerator: action.payload.newRole === 'Moderateur',
        isuserpro: action.payload.newRole === 'userpro',
        currentPlan: action.payload.planId || state.currentPlan,
        lastUpdated: Date.now()
      };
    
    case ROLES_TYPES.USER_PRO:
      return {
        ...state,
        isuserpro: true,
        isAdmin: false,
        isModerator: false,
        currentPlan: action.payload.user?.channelPlan || 'basic',
        lastUpdated: Date.now()
      };
    
    case ROLES_TYPES.UPDATE_PLAN:
      return {
        ...state,
        currentPlan: action.payload.planId,
        lastUpdated: Date.now()
      };
    default:
      return state;
  }
};

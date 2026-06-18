// redux/reducers/profileReducer.js

import { PROFILE_TYPES } from '../actions/profileAction'

const initialState = {
    loading: false,
    ids: [],
    users: []
}

const profileReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROFILE_TYPES.LOADING:
            return {
                ...state,
                loading: action.payload
            };
            
        case PROFILE_TYPES.GET_USER:
            return {
                ...state,
                users: [...state.users, action.payload]
            };
            
        case PROFILE_TYPES.GET_ID:
            return {
                ...state,
                ids: [...state.ids, action.payload]
            };
            
        case PROFILE_TYPES.UPDATE_PROFILE:
            // ✅ Actualizar el usuario existente en el array users
            return {
                ...state,
                users: state.users.map(user => 
                    user._id === action.payload._id 
                        ? { ...user, ...action.payload }
                        : user
                )
            };
            
        default:
            return state;
    }
}

export default profileReducer
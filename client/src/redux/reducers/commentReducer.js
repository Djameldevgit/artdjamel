// commentReducer.js
import { COMMENT_TYPES } from '../actions/globalTypes';

const initialState = {
    commentsByUser: {},
    error: null
};

export const commentReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_COMMENTS':
            return {
                ...state,
                commentsByUser: {
                    ...state.commentsByUser,
                    [action.payload.userId]: action.payload.comments
                },
                error: null
            };

        case 'ADD_COMMENT':
            return {
                ...state,
                commentsByUser: {
                    ...state.commentsByUser,
                    [action.payload.userId]: [
                        ...(state.commentsByUser[action.payload.userId] || []),
                        action.payload.comment
                    ]
                },
                error: null
            };

        case 'DELETE_COMMENT':
            return {
                ...state,
                commentsByUser: {
                    ...state.commentsByUser,
                    [action.payload.userId]: state.commentsByUser[action.payload.userId].filter(
                        c => c._id !== action.payload.commentId
                    )
                },
                error: null
            };

        case 'COMMENT_ERROR':
            return {
                ...state,
                error: action.payload
            };

        default:
            return state;
    }
};

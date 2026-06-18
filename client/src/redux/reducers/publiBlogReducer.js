import { POST_TYPES_ADMIN } from "../actions/publiBlogAction."
import { EditData ,DeleteData} from '../actions/globalTypes'
const initialState = {
    loading: false,
    posts: [],
    result: 0,
    page: 2
}

const publiBlogReducer = (state = initialState, action) => {
    switch (action.type){
        case POST_TYPES_ADMIN.CREATE_POST:
            return {
                ...state,
                posts: [action.payload, ...state.posts]
            };
        case POST_TYPES_ADMIN.LOADING_POST:
            return {
                ...state,
                loading: action.payload
            };
        case POST_TYPES_ADMIN.GET_POSTS:
            return {
                ...state,
                posts: action.payload.posts,
                result: action.payload.result,
                page: action.payload.page
            };
        case POST_TYPES_ADMIN.UPDATE_POST:
            return {
                ...state,
                posts: EditData(state.posts, action.payload._id, action.payload)
            };
        case POST_TYPES_ADMIN.DELETE_POST:
            return {
                ...state,
                posts: DeleteData(state.posts, action.payload._id)
            };
        default:
            return state;
    }
}
export default publiBlogReducer

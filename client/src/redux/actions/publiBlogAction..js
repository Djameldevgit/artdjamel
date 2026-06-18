import { GLOBALTYPES } from './globalTypes';
import { postDataAPI } from '../../utils/fetchData';
export const POST_TYPES_ADMIN = {
    CREATE_POST: 'CREATE_POST',
    LOADING_POST: 'LOADING_POST',
    GET_POSTS: 'GET_POSTS',
    UPDATE_POST: 'UPDATE_POST',
    GET_POST: 'GET_POST',
    DELETE_POST: 'DELETE_POST'
 
  
  
  }
// Usar un post en el blog
 
export const createPostForBlog = ({content, images, auth, socket}) => async (dispatch) => {
    console.log(content,images)
    let media = []
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {loading: true} })
        if(images.length > 0) media = await imageUpload(images)

        const res = await postDataAPI('posts/admin', { content, images: media }, auth.token)

        dispatch({ 
            type: POST_TYPES_ADMIN.CREATE_POST, 
            payload: {...res.data.newPost, user: auth.user} 
        })

        dispatch({ type: GLOBALTYPES.ALERT, payload: {loading: false} })

        // Notify
        const msg = {
            id: res.data.newPost._id,
            text: 'added a new post.',
            recipients: res.data.newPost.user.followers,
            url: `/post/${res.data.newPost._id}`,
            content, 
            image: media[0].url
        }

        dispatch(createNotify({msg, auth, socket}))

    } catch (err) {
         dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: res.data.msg },
      })
    }
}

export const getPostsAdmin = (token) => async (dispatch) => {
    try {
        dispatch({ type: POST_TYPES_ADMIN.LOADING_POST, payload: true })
        const res = await getDataAPI('posts/admin', token)
        
        dispatch({
            type: POST_TYPES_ADMIN.GET_POSTS,
            payload: {...res.data, page: 2}
        })

        dispatch({ type: POST_TYPES_ADMIN.LOADING_POST, payload: false })
    } catch (err) {
         dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: res.data.msg },
      })
    }
}


 
export const updatePost = ({content, images, auth, status}) => async (dispatch) => {
    let media = []
    const imgNewUrl = images.filter(img => !img.url)
    const imgOldUrl = images.filter(img => img.url)

    if(status.content === content 
        && imgNewUrl.length === 0
        && imgOldUrl.length === status.images.length
    ) return;

    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {loading: true} })
        if(imgNewUrl.length > 0) media = await imageUpload(imgNewUrl)

        const res = await patchDataAPI(`post/${status._id}`, { 
            content, images: [...imgOldUrl, ...media] 
        }, auth.token)

        dispatch({ type: POST_TYPES_ADMIN.UPDATE_POST, payload: res.data.newPost })

        dispatch({ type: GLOBALTYPES.ALERT, payload: {success: res.data.msg} })
    } catch (err) {
         dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: res.data.msg },
      })
    }
}
import { getDataAPI, postDataAPI, putDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { createNotify, removeNotify } from '../actions/notifyAction'

// Obtener todos los comentarios
export const getComments = () => async dispatch => {
  dispatch({ type: 'BLOG_GET_COMMENTS_REQUEST' });
  try {
    const res = await getDataAPI('blog/comments');
    dispatch({
      type: 'BLOG_GET_COMMENTS_SUCCESS',
      payload: res.data.comments
    });
  } catch (err) {
    dispatch({
      type: 'BLOG_GET_COMMENTS_FAIL',
      payload: err.response?.data?.message || err.message
    });
  }
};

// Crear un nuevo comentario
// Crear un nuevo comentario (notificar al admin)
 

// Crear un nuevo comentario
export const createComment = (data, socket) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const token = auth?.token || localStorage.getItem('token');

    const res = await postDataAPI('blog/comments', data, token);

    dispatch({
      type: 'BLOG_CREATE_COMMENT_SUCCESS',
      payload: res.data.comment
    });

    // 🔹 Emitir evento en tiempo real
   
  } catch (err) {
    console.error(err);
  }
};


// Responder a un comentario
export const replyComment = (commentId, data ) => async (dispatch, getState) => {
  try {
    const token =
      getState().auth?.token || localStorage.getItem('token');

    const res = await postDataAPI(
      `blog/comments/${commentId}/reply`,
      data,
      token
    );

    dispatch({
      type: 'BLOG_REPLY_SUCCESS',
      payload: res.data.comment
    });

    if (socket) {
      socket.emit('blog:comment:reply', {
        commentId,
        reply: res.data.reply
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Actualizar un comentario
export const updateComment = (id, data, socket) => async (dispatch, getState) => {
  try {
    const token =
      getState().auth?.token || localStorage.getItem('token');

    const res = await putDataAPI(`blog/comments/${id}`, data, token);

    dispatch({
      type: 'BLOG_UPDATE_SUCCESS',
      payload: res.data.comment
    });

    if (socket) {
      socket.emit('blog:comment:update', {
        commentId: id,
        comment: res.data.comment
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Eliminar un comentario
export const deleteComment = (id, socket) => async (dispatch, getState) => {
  try {
    const token =
      getState().auth?.token || localStorage.getItem('token');

    await deleteDataAPI(`blog/comments/${id}`, token);

    dispatch({
      type: 'BLOG_DELETE_SUCCESS',
      payload: id
    });

    if (socket) {
      socket.emit('blog:comment:delete', { commentId: id });
    }
  } catch (err) {
    console.error(err);
  }
};

// Dar like a un comentario
export const likeComment = (commentId, socket) => async (dispatch, getState) => {
  try {
    const token =
      getState().auth?.token || localStorage.getItem('token');

    const res = await putDataAPI(
      `blog/comments/${commentId}/like`,
      null,
      token
    );

    dispatch({
      type: 'BLOG_LIKE_SUCCESS',
      payload: { commentId, likes: res.data.likes }
    });

    dispatch({
      type: 'NOTIFY_ADD',
      payload: { text: 'Te ha gustado un comentario', url: '/blog' }
    });

    if (socket) {
      socket.emit('blog:comment:like', {
        commentId,
        likes: res.data.likes
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Quitar like de un comentario
export const dislikeComment = (commentId, socket) => async (dispatch, getState) => {
  try {
    const token =
      getState().auth?.token || localStorage.getItem('token');

    const res = await putDataAPI(
      `blog/comments/${commentId}/dislike`,
      null,
      token
    );

    dispatch({
      type: 'BLOG_DISLIKE_SUCCESS',
      payload: { commentId, likes: res.data.likes }
    });

    dispatch({
      type: 'NOTIFY_ADD',
      payload: { text: 'Ya no te gusta un comentario', url: '/blog' }
    });

    if (socket) {
      socket.emit('blog:comment:dislike', {
        commentId,
        likes: res.data.likes
      });
    }
  } catch (err) {
    console.error(err);
  }
};

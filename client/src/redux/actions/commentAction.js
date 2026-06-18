import { GLOBALTYPES, EditData, DeleteData } from './globalTypes'
import { postDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData'
import { createNotify, removeNotify } from '../actions/notifyAction'
import { VIDEO_TYPES } from './videoAction'

// Helper para obtener el tipo de acción según el modelo
const getActionType = (targetType) => {
    const types = {
        'video': VIDEO_TYPES,
        'post': VIDEO_TYPES,
        'boutique': VIDEO_TYPES
    }
    return types[targetType] || VIDEO_TYPES
}

export const createComment = ({target, newComment, auth, socket, targetType, videoData}) => async (dispatch) => {
 
    
    if (!auth.token) {
        console.error('❌ No hay token en createComment');
        return;
    }
    
    const newTarget = {...target, comments: [...(target.comments || []), newComment]};
    const TYPES = getActionType(targetType);
    
    dispatch({ type: TYPES.UPDATE_VIDEO, payload: newTarget });

    try {
        const data = {
            ...newComment, 
            targetId: target._id, 
            targetModel: targetType || 'video',
            targetUserId: target.user?._id
        };
        
        console.log('📤 Enviando a API:', { url: 'comment', data });
        const res = await postDataAPI('comment', data, auth.token);
        console.log('📥 Respuesta API:', res.data);

        const newData = {...res.data.newComment, user: auth.user};
        const updatedTarget = {...target, comments: [...(target.comments || []), newData]};
        dispatch({ type: TYPES.UPDATE_VIDEO, payload: updatedTarget });

        if (socket) socket.emit('createCommentVideo', updatedTarget);

        // ✅ OBTENER IMAGEN del video (igual que en likeVideo)
        let imageUrl = '';
        if (videoData?.thumbnail) {
            imageUrl = videoData.thumbnail;
        } else if (target.thumbnail) {
            imageUrl = target.thumbnail;
        } else if (target.images && target.images[0]?.url) {
            imageUrl = target.images[0].url;
        }
        
        // ✅ Usar videoData?.thumbnail para la notificación (prioridad)
        const msg = {
            id: res.data.newComment._id,
            text: newComment.reply ? 'vous a mentionné dans un commentaire.' : 'a commenté votre vidéo.',
            recipients: newComment.reply ? [newComment.tag._id] : [target.user?._id],
            url: `/video/${target._id}`,
            content: target.title || target.content || '',
            image: imageUrl,   // ← MISMO CAMPO que likeVideo
        };

        dispatch(createNotify({msg, auth, socket}));
        
    } catch (err) {
        console.error('❌ Error en createComment:', err.response?.data || err.message);
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message} });
    }
};

export const updateComment = ({comment, target, content, auth, targetType}) => async (dispatch) => {
    const newComments = EditData(target.comments, comment._id, {...comment, content})
    const newTarget = {...target, comments: newComments}
    const TYPES = getActionType(targetType)
    
    // ✅ Usar UPDATE_VIDEO en lugar de UPDATE_POST
    dispatch({ type: TYPES.UPDATE_VIDEO, payload: newTarget })
    
    try {
        await patchDataAPI(`comment/${comment._id}`, { content }, auth.token)
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message} })
    }
}

export const likeComment = ({comment, target, auth, targetType}) => async (dispatch) => {
    const newComment = {...comment, likes: [...(comment.likes || []), auth.user]}
    const newComments = EditData(target.comments, comment._id, newComment)
    const newTarget = {...target, comments: newComments}
    const TYPES = getActionType(targetType)
    
    // ✅ Usar UPDATE_VIDEO en lugar de UPDATE_POST
    dispatch({ type: TYPES.UPDATE_VIDEO, payload: newTarget })

    try {
        await patchDataAPI(`comment/${comment._id}/like`, null, auth.token)
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message} })
    }
}

export const unLikeComment = ({comment, target, auth, targetType}) => async (dispatch) => {
    const newComment = {...comment, likes: DeleteData(comment.likes || [], auth.user._id)}
    const newComments = EditData(target.comments, comment._id, newComment)
    const newTarget = {...target, comments: newComments}
    const TYPES = getActionType(targetType)
    
    // ✅ Usar UPDATE_VIDEO en lugar de UPDATE_POST
    dispatch({ type: TYPES.UPDATE_VIDEO, payload: newTarget })

    try {
        await patchDataAPI(`comment/${comment._id}/unlike`, null, auth.token)
    } catch (err) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err.response?.data?.msg || err.message} })
    }
}

export const deleteComment = ({target, comment, auth, socket, targetType}) => async (dispatch) => {
    try {
        console.log('🗑️ deleteComment appelé:', { 
            commentId: comment._id, 
            targetId: target?._id,
            targetType,
            userId: auth.user?._id
        });

        if (!comment || !comment._id) {
            console.error('❌ deleteComment: ID de commentaire invalide');
            return;
        }

        const res = await deleteDataAPI(`comment/${comment._id}`, auth.token);
        
        console.log('✅ deleteComment réponse:', res.data);

        if (res.data.msg === 'Commentaire supprimé avec succès!') {
            const deleteArr = [...(target.comments || []).filter(cm => cm.reply === comment._id), comment];
            
            const newTarget = {
                ...target,
                comments: (target.comments || []).filter(cm => !deleteArr.find(da => cm._id === da._id))
            };
            
            const TYPES = getActionType(targetType);
            
            // ✅ Usar UPDATE_VIDEO en lugar de UPDATE_POST
            if (TYPES && TYPES.UPDATE_VIDEO) {
                dispatch({ type: TYPES.UPDATE_VIDEO, payload: newTarget });
            }
            
            if (socket) {
                socket.emit('deleteCommentVideo', newTarget);
            }
        }
        
    } catch (err) {
        console.error('❌ Erreur dans deleteComment:', err);
        dispatch({ 
            type: GLOBALTYPES.ALERT, 
            payload: { error: err.response?.data?.msg || 'Erreur lors de la suppression du commentaire' } 
        });
    }
}
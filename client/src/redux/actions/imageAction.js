// redux/actions/imageAction.js - COMPLETO CON NOTIFICACIONES
import { getDataAPI, postDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { imageUpload2} from '../../utils/imageUpload2';
import { GLOBALTYPES } from './globalTypes';
import { createNotify } from './notifyAction';
 
export const IMAGE_TYPES = {
  LOADING: 'IMAGE_LOADING',
  GET_IMAGES: 'GET_IMAGES',
  GET_IMAGE: 'GET_IMAGE',
  CREATE_IMAGE: 'CREATE_IMAGE',
  UPDATE_IMAGE: 'UPDATE_IMAGE',
  DELETE_IMAGE: 'DELETE_IMAGE',
  LIKE_IMAGE: 'LIKE_IMAGE',
  SHARE_IMAGE: 'SHARE_IMAGE',
  GET_USER_IMAGES: 'GET_USER_IMAGES',
  GET_TRENDING_IMAGES: 'GET_TRENDING_IMAGES'
};

// ============================================
// CRUD IMAGES AVEC NOTIFICATIONS
// ============================================

// ✅ Créer une image AVEC NOTIFICATION
export const createImagePost = (imageData, token, auth, socket) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    const res = await postDataAPI('images', imageData, token);
    
    dispatch({
      type: IMAGE_TYPES.CREATE_IMAGE,
      payload: res.data.image
    });
    
    const image = res.data.image;
    
    // ✅ 1. NOTIFICATION À L'UTILISATEUR (qui a créé l'image)
    const userMsg = {
      id: auth.user._id,
      text: `🖼️ Votre image "${image.title}" a été créée avec succès et est en attente de validation.`,
      recipients: [auth.user._id],
      url: `/image/${image._id}`,
      content: image.title,
      image: image.imageUrl,
      type: 'image_pending'
    };
    
    await dispatch(createNotify({ msg: userMsg, auth, socket }));
    
    // ✅ 2. NOTIFICATION AUX ADMINISTRATEURS
    const adminMsg = {
      id: auth.user._id,
      text: `🖼️ Nouvelle image en attente d'approbation: "${image.title}" par ${auth.user.username}`,
      recipients: ["admin"],
      url: `/admin/posts?tab=images`,
      content: image.title,
      image: image.imageUrl,
      type: 'image_pending_admin'
    };
    
    await dispatch(createNotify({ msg: adminMsg, auth, socket }));
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { 
        success: '🖼️ Image créée avec succès! Vous serez notifié lorsqu\'elle sera validée.' 
      }
    });
    
    return { success: true, image: res.data.image };
  } catch (err) {
    console.error('❌ Error createImagePost:', err);
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || 'Erreur lors de la création' }
    });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ✅ Mettre à jour une image AVEC NOTIFICATION
export const updateImage = (id, imageData, token, auth, socket) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    const res = await patchDataAPI(`images/${id}`, imageData, token);
    
    dispatch({
      type: IMAGE_TYPES.UPDATE_IMAGE,
      payload: res.data.image
    });
    
    const image = res.data.image;
    
    // ✅ Notifier le propriétaire de l'image
    if (image && image.user?._id && image.user._id !== auth.user._id) {
      const msg = {
        id: auth.user._id,
        text: '✏️ Votre image a été mise à jour',
        recipients: [image.user._id],
        url: `/image/${image._id}`,
        content: image.title,
        image: image.imageUrl,
        type: 'image'
      };
      
      dispatch(createNotify({ msg, auth, socket }));
    }
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: 'Image mise à jour avec succès' }
    });
    
    return { success: true, image: res.data.image };
  } catch (err) {
    console.error('❌ Error updateImage:', err);
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || 'Erreur lors de la mise à jour' }
    });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ✅ Supprimer une image AVEC NOTIFICATION
export const deleteImage = (id, token, auth, socket, imageData) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    const res = await deleteDataAPI(`images/${id}`, token);
    
    dispatch({
      type: IMAGE_TYPES.DELETE_IMAGE,
      payload: id
    });
    
    const image = res.data?.image || imageData;
    
    // ✅ Notifier le propriétaire
    if (image && image.user && image.user._id && image.user._id !== auth.user._id) {
      const msg = {
        id: auth.user._id,
        text: `🗑️ Votre image "${image.title || 'sans titre'}" a été supprimée`,
        recipients: [image.user._id],
        url: `/`,
        content: image.title || 'Image',
        image: image.imageUrl || null,
        type: 'image_deleted'
      };
      
      if (socket) {
        socket.emit('createNotify', msg);
      }
      
      dispatch(createNotify({ msg, auth, socket }));
    }
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: 'Image supprimée avec succès' }
    });
    
    return { success: true, data: res.data };
  } catch (err) {
    console.error('❌ Error deleteImage:', err);
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || 'Erreur lors de la suppression' }
    });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ✅ Récupérer une image par ID (publique)
export const getImageById = (id) => async (dispatch) => {
  try {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: true });
    
    console.log('🖼️ Appel API image - ID:', id);
    
    const res = await getDataAPI(`images/public/${id}`);
    
    console.log('🖼️ Réponse:', res.data);
    
    if (res.data.image && res.data.image.pendiente === true) {
      console.log('✅ Image en attente détectée!');
      
      dispatch({
        type: IMAGE_TYPES.GET_IMAGE,
        payload: res.data.image
      });
      
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { 
          info: res.data.message || '🖼️ Votre image a été envoyée pour validation.'
        }
      });
      
      dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
      return { success: false, image: res.data.image };
    }
    
    if (res.data.success === true && res.data.image) {
      console.log('✅ Image approuvée!');
      dispatch({
        type: IMAGE_TYPES.GET_IMAGE,
        payload: res.data.image
      });
      
      dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
      return { success: true, image: res.data.image };
    }
    
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
    return { success: false, error: res.data.message || 'Erreur inconnue' };
    
  } catch (err) {
    console.error('❌ Error getImageById:', err);
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || 'Impossible de charger l\'image' }
    });
    
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
    return { success: false, error: err.message };
  }
};

// ✅ Récupérer une image par ID (privé - pour admin)
export const getImageByIdPrivate = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: true });
    const res = await getDataAPI(`images/private/${id}`, token);
    dispatch({
      type: IMAGE_TYPES.GET_IMAGE,
      payload: res.data.image
    });
    return res.data;
  } catch (err) {
    console.error('❌ Error getImageByIdPrivate:', err);
    return null;
  } finally {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
  }
};

// ✅ Récupérer toutes les images (feed)
export const getImages = (page = 1, limit = 12, sortBy = 'recent', searchTerm = null) => async (dispatch) => {
  try {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: true });
    
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (sortBy) params.append('sortBy', sortBy);
    if (searchTerm && searchTerm.trim() !== '') params.append('searchTerm', searchTerm);
    
    console.log('🖼️ getImages appelé:', {
      page,
      sortBy,
      searchTerm,
      url: `images?${params.toString()}`
    });
    
    const res = await getDataAPI(`images?${params.toString()}`);
    
    dispatch({
      type: IMAGE_TYPES.GET_IMAGES,
      payload: {
        images: res.data.images || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        totalPages: res.data.totalPages || 1,
        hasMore: res.data.hasMore || false
      }
    });
    
    return res.data;
    
  } catch (err) {
    console.error('❌ Error getImages:', err);
    return { success: false, images: [] };
  } finally {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
  }
};

// ✅ Récupérer les images d'un utilisateur
export const getUserImages = (userId, page = 1, limit = 12) => async (dispatch) => {
  try {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: true });
    
    const res = await getDataAPI(`images/user/${userId}?page=${page}&limit=${limit}`);
    
    dispatch({
      type: IMAGE_TYPES.GET_USER_IMAGES,
      payload: {
        images: res.data.images || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        hasMore: res.data.hasMore || false
      }
    });
    
    return res.data;
  } catch (err) {
    console.error('❌ Error getUserImages:', err);
    return { success: false, images: [] };
  } finally {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
  }
};

// ✅ Récupérer les images tendances
export const getTrendingImages = (timeWindow = 'week', limit = 20) => async (dispatch) => {
  try {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: true });
    
    const res = await getDataAPI(`images/trending?timeRange=${timeWindow}&limit=${limit}`);
    
    console.log('🔥 Trending images response:', res.data);
    
    dispatch({
      type: IMAGE_TYPES.GET_TRENDING_IMAGES,
      payload: {
        images: res.data.images || [],
        hasMore: (res.data.images || []).length === limit,
        timeWindow: timeWindow
      }
    });
  } catch (err) {
    console.error('❌ Error loading trending images:', err);
    
    dispatch({
      type: IMAGE_TYPES.GET_TRENDING_IMAGES,
      payload: {
        images: [],
        hasMore: false,
        timeWindow: timeWindow
      }
    });
    
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.message || 'Error loading trending images' }
    });
  } finally {
    dispatch({ type: IMAGE_TYPES.LOADING, payload: false });
  }
};

// ✅ Like/Unlike une image AVEC NOTIFICATION
export const likeImage = (id, token, auth, socket, imageData) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`images/${id}/like`, {}, token);
    
    dispatch({
      type: IMAGE_TYPES.LIKE_IMAGE,
      payload: { id, likes: res.data.likes, liked: res.data.liked }
    });
    
    // ✅ Notifier le propriétaire
    if (res.data.liked && imageData && imageData.user?._id && imageData.user._id !== auth.user._id) {
      const msg = {
        id: auth.user._id,
        text: `❤️ @${auth.user.username} a aimé votre image`,
        recipients: [imageData.user._id],
        url: `/image/${id}`,
        content: imageData.title,
        image: imageData.imageUrl,
        type: 'image'
      };
      
      dispatch(createNotify({ msg, auth, socket }));
    }
    
    return { liked: res.data.liked, likes: res.data.likes };
  } catch (err) {
    console.error('❌ Error likeImage:', err);
    return { liked: false, likes: 0 };
  }
};

// ✅ Partager une image AVEC NOTIFICATION
export const shareImage = (id, token, auth, socket, imageData) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`images/${id}/share`, {}, token);
    
    dispatch({
      type: IMAGE_TYPES.SHARE_IMAGE,
      payload: { id, shares: res.data.shares, shared: res.data.shared }
    });
    
    // ✅ Notifier le propriétaire
    if (res.data.shared && imageData && imageData.user?._id && imageData.user._id !== auth.user._id) {
      const msg = {
        id: auth.user._id,
        text: `🔄 @${auth.user.username} a partagé votre image`,
        recipients: [imageData.user._id],
        url: `/image/${id}`,
        content: imageData.title,
        image: imageData.imageUrl,
        type: 'image'
      };
      
      dispatch(createNotify({ msg, auth, socket }));
    }
    
    return { shared: res.data.shared, shares: res.data.shares };
  } catch (err) {
    console.error('❌ Error shareImage:', err);
    return { shared: false, shares: 0 };
  }
};

// ✅ Incrémenter les vues d'une image
export const incrementImageView = (id, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`images/${id}/view`, {}, token);
    
    dispatch({
      type: IMAGE_TYPES.UPDATE_IMAGE,
      payload: {
        ...res.data.image,
        views: res.data.views
      }
    });
    
    return { success: true, views: res.data.views };
  } catch (err) {
    console.error('❌ Error incrementImageView:', err);
    return { success: false };
  }
};

// ✅ Upload d'image direct vers Cloudinary (utilitaire)
export const uploadImageDirect = (file, onProgress) => async (dispatch) => {
  try {
    const result = await imageUpload2(file, onProgress);
    return { success: true, url: result.url, public_id: result.public_id };
  } catch (err) {
    console.error('❌ Error uploadImageDirect:', err);
    return { success: false, error: err.message };
  }
};

// ✅ Statistiques utilisateur pour images
export const getUserImageStats = (token) => async (dispatch) => {
  try {
    const res = await getDataAPI('images/user/stats', token);
    return res.data;
  } catch (err) {
    console.error('❌ Error getUserImageStats:', err);
    return null;
  }
};
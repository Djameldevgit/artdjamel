// redux/actions/videoAction.js - VERSIÓN LIMPIA SIN ADMINISTRACIÓN NI CANALES
import { GLOBALTYPES } from './globalTypes';
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI ,getPublicDataAPI} from '../../utils/fetchData';
import { imageUpload2 } from '../../utils/imageUpload2';

export const VIDEO_TYPES = {
  LOADING: 'VIDEO_LOADING',
  LOADING_BY_CATEGORY: 'LOADING_BY_CATEGORY',
  TRENDING_LOADING: 'TRENDING_LOADING',
  CREATE_VIDEO: 'CREATE_VIDEO',
  UPDATE_VIDEO: 'UPDATE_VIDEO',
  DELETE_VIDEO: 'DELETE_VIDEO',
  GET_VIDEO: 'GET_VIDEO',
  GET_VIDEOS: 'GET_VIDEOS',
  GET_VIDEOS_BY_CATEGORY: 'GET_VIDEOS_BY_CATEGORY',
  GET_TRENDING_VIDEOS: 'GET_TRENDING_VIDEOS',
  LIKE_VIDEO: 'LIKE_VIDEO',
  SHARE_VIDEO: 'SHARE_VIDEO',
  TOGGLE_SAVE_VIDEO: 'TOGGLE_SAVE_VIDEO',
  INCREMENT_VIEW: 'INCREMENT_VIEW',
  GET_USER_VIDEOS: 'GET_USER_VIDEOS',
  USER_VIDEOS_LOADING: 'USER_VIDEOS_LOADING',
  CLEAR_USER_VIDEOS: 'CLEAR_USER_VIDEOS',
  GET_FEATURED_VIDEOS: 'GET_FEATURED_VIDEOS',
  GET_POPULAR_VIDEOS: 'GET_POPULAR_VIDEOS',
  GET_RELATED_VIDEOS: 'GET_RELATED_VIDEOS',
};

// ============================================
// CREAR OBRA
// ============================================
export const createVideo = (videoData, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    let uploadedImageUrls = [];
    if (videoData.images && videoData.images.length > 0) {
      uploadedImageUrls = await imageUpload2(videoData.images);
      console.log('📸 Imágenes subidas a Cloudinary:', uploadedImageUrls);
    }

    const payload = {
      title: videoData.title,
      description: videoData.description,
      category: videoData.category,
      videoUrl: videoData.videoUrl,
      videoPublicId: videoData.videoPublicId,
      thumbnail: videoData.thumbnail || (uploadedImageUrls.length > 0 ? uploadedImageUrls[0]?.url || uploadedImageUrls[0] : ''),
      duration: videoData.duration,
      technique: videoData.technique,
      style: videoData.style,
      width: Number(videoData.width),
      height: Number(videoData.height),
      price: Number(videoData.price),
      status: videoData.status || 'en vente',
      stock: Number(videoData.stock) || 1,
      music: videoData.music || null,
      images: uploadedImageUrls,
    };

    const res = await postDataAPI('videos', payload, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.CREATE_VIDEO, payload: res.data.video });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Œuvre publiée !' } });
      return { success: true, data: res.data };
    }
  } catch (err) {
    console.error('❌ Error createVideo:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ============================================
// ACTUALIZAR OBRA
// ============================================
// ============================================
// 📝 ACTUALIZAR VIDEO (COMPLETA Y CORREGIDA)
// ============================================
export const updateVideo = (id, videoData, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    // 1. Procesar imágenes nuevas
    let uploadedImageUrls = [];
    if (videoData.images && videoData.images.length > 0) {
      const newImages = videoData.images.filter(img => img.file && !img.isExisting);
      if (newImages.length > 0) {
        uploadedImageUrls = await imageUpload2(newImages);
        console.log('📸 Nuevas imágenes subidas en edición:', uploadedImageUrls);
      }
    }

    // 2. Combinar imágenes existentes + nuevas
    const existingImages = videoData.images
      .filter(img => img.url || typeof img === 'string')
      .map(img => {
        if (typeof img === 'string') return { url: img, public_id: '' };
        return img;
      });

    const finalImages = [...existingImages, ...uploadedImageUrls];

    // 3. Construir payload
    const payload = {
      title: videoData.title,
      description: videoData.description,
      category: videoData.category,
      technique: videoData.technique,
      style: videoData.style,
      width: Number(videoData.width),
      height: Number(videoData.height),
      price: Number(videoData.price),
      status: videoData.status || 'en vente',
      stock: Number(videoData.stock) || 1,
      videoUrl: videoData.videoUrl,
      videoPublicId: videoData.videoPublicId,
      thumbnail: videoData.thumbnail || (finalImages.length > 0 ? finalImages[0]?.url || finalImages[0] : ''),
      duration: videoData.duration,
      images: finalImages,
      music: videoData.music || null,
    };

    // 4. Enviar petición PATCH
    const res = await patchDataAPI(`videos/${id}`, payload, token);

    // 5. Manejar respuesta
    if (res.data.success) {
      // ✅ Extraer el video actualizado (puede venir como 'video' o 'artwork')
      const updatedVideo = res.data.video || res.data.artwork || res.data;

      if (!updatedVideo || !updatedVideo._id) {
        throw new Error('La respuesta no contiene el video actualizado correctamente');
      }

      dispatch({ type: VIDEO_TYPES.UPDATE_VIDEO, payload: updatedVideo });
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { success: '✅ Œuvre mise à jour avec succès !' }
      });
      return { success: true, data: updatedVideo };
    } else {
      throw new Error(res.data.message || 'Error al actualizar la obra');
    }
  } catch (err) {
    console.error('❌ Error updateVideo:', err);
    const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar la obra';
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: errorMsg }
    });
    return { success: false, error: errorMsg };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};
// ============================================
// OBTENER OBRA POR ID
// ============================================
export const getVideoById = (id) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.LOADING, payload: true });
    const res = await getPublicDataAPI(`videos/${id}`);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.GET_VIDEO, payload: res.data.artwork });
      return { success: true, video: res.data.artwork };
    }
  } catch (err) {
    console.error('❌ Error getVideoById:', err);
  } finally {
    dispatch({ type: VIDEO_TYPES.LOADING, payload: false });
  }
};

export const getArtworkById = getVideoById; // alias

// ============================================
// ELIMINAR OBRA
// ============================================
export const deleteVideo = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    const res = await deleteDataAPI(`videos/${id}`, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.DELETE_VIDEO, payload: id });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Œuvre supprimée' } });
      return { success: true };
    }
  } catch (err) {
    console.error('❌ Error deleteVideo:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ============================================
// INTERACCIONES: LIKE, SAVE, SHARE, VIEW
// ============================================
export const likeVideo = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/like`, {}, token);
    if (res.data.success) {
      dispatch({
        type: VIDEO_TYPES.LIKE_VIDEO,
        payload: { id: videoId, liked: res.data.liked, likes: res.data.likes },
      });
      return { liked: res.data.liked, likes: res.data.likes };
    }
  } catch (err) {
    console.error('❌ Error likeVideo:', err);
  }
};

export const toggleSaveVideo = (videoId, token) => async (dispatch) => {
  try {
    const res = await postDataAPI(`videos/${videoId}/save`, {}, token);
    if (res.data.success) {
      dispatch({
        type: VIDEO_TYPES.TOGGLE_SAVE_VIDEO,
        payload: { id: videoId, saved: res.data.saved, savesCount: res.data.savesCount },
      });
      return { saved: res.data.saved, savesCount: res.data.savesCount };
    }
  } catch (err) {
    console.error('❌ Error toggleSaveVideo:', err);
  }
};

export const shareVideo = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/share`, {}, token);
    if (res.data.success) {
      dispatch({
        type: VIDEO_TYPES.SHARE_VIDEO,
        payload: { id: videoId, shared: res.data.shared, shares: res.data.shares },
      });
      return { shared: res.data.shared, shares: res.data.shares };
    }
  } catch (err) {
    console.error('❌ Error shareVideo:', err);
  }
};

export const incrementVideoView = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/view`, {}, token);
    if (res.data.success) {
      dispatch({
        type: VIDEO_TYPES.INCREMENT_VIEW,
        payload: { id: videoId, views: res.data.views },
      });
    }
  } catch (err) {
    console.error('❌ Error incrementVideoView:', err);
  }
};

// ============================================
// LISTADOS
// ============================================
export const getVideosByCategory = (categorySlug, page = 1, limit = 12, sortBy = 'recent') => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.LOADING_BY_CATEGORY, payload: { categorySlug, loading: true } });
    const res = await getDataAPI(`videos/category/${categorySlug}?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    dispatch({
      type: VIDEO_TYPES.GET_VIDEOS_BY_CATEGORY,
      payload: {
        categorySlug,
        videos: res.data.videos,
        total: res.data.total,
        page: res.data.page,
        totalPages: res.data.totalPages,
        hasMore: res.data.hasMore,
      },
    });
  } catch (err) {
    console.error('❌ Error getVideosByCategory:', err);
  } finally {
    dispatch({ type: VIDEO_TYPES.LOADING_BY_CATEGORY, payload: { categorySlug, loading: false } });
  }
};

export const getTrendingVideos = (timeWindow = 'week', page = 1, limit = 20) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.TRENDING_LOADING, payload: true });
    const res = await getDataAPI(`videos/trending?timeRange=${timeWindow}&limit=${limit}&page=${page}`);
    dispatch({
      type: VIDEO_TYPES.GET_TRENDING_VIDEOS,
      payload: { videos: res.data.videos, hasMore: res.data.hasMore, page, timeWindow },
    });
  } catch (err) {
    console.error('❌ Error getTrendingVideos:', err);
  } finally {
    dispatch({ type: VIDEO_TYPES.TRENDING_LOADING, payload: false });
  }
};

// ============================================
// OBTENER OBRAS DE UN USUARIO (para el perfil)
// ============================================
export const getUserVideos = (userId, page = 1, limit = 12) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.USER_VIDEOS_LOADING, payload: true });
    const res = await getDataAPI(`videos/user/${userId}?page=${page}&limit=${limit}`);
    if (res.data.success) {
      dispatch({
        type: VIDEO_TYPES.GET_USER_VIDEOS,
        payload: {
          videos: res.data.videos,
          total: res.data.total,
          page: res.data.page,
          hasMore: res.data.hasMore,
        },
      });
    }
  } catch (error) {
    console.error('❌ Error getUserVideos:', error);
    dispatch({ type: VIDEO_TYPES.USER_VIDEOS_LOADING, payload: false });
  }
};

export const clearUserVideos = () => ({ type: VIDEO_TYPES.CLEAR_USER_VIDEOS });

// ============================================
// OTRAS FUNCIONES (featured, popular, related)
// ============================================
export const getFeaturedVideos = (limit = 10) => async (dispatch) => {
  try {
    const res = await getDataAPI(`videos/featured?limit=${limit}`);
    dispatch({ type: VIDEO_TYPES.GET_FEATURED_VIDEOS, payload: res.data.videos });
  } catch (err) {
    console.error('❌ Error getFeaturedVideos:', err);
  }
};

export const getPopularVideos = (limit = 10) => async (dispatch) => {
  try {
    const res = await getDataAPI(`videos/popular?limit=${limit}`);
    dispatch({ type: VIDEO_TYPES.GET_POPULAR_VIDEOS, payload: res.data.videos });
  } catch (err) {
    console.error('❌ Error getPopularVideos:', err);
  }
};

export const getRelatedVideos = (videoId, limit = 6) => async (dispatch) => {
  try {
    const res = await getDataAPI(`videos/${videoId}/related?limit=${limit}`);
    dispatch({ type: VIDEO_TYPES.GET_RELATED_VIDEOS, payload: res.data.videos });
  } catch (err) {
    console.error('❌ Error getRelatedVideos:', err);
  }
};

// ============================================
// ALIAS PARA COMPATIBILIDAD
// ============================================
export const likeArtwork = likeVideo;
export const shareArtwork = shareVideo;
export const incrementArtworkView = incrementVideoView;

export const updateArtwork = () => async () => {
  
};
 
export const addToCart = () => async () => {
  
};
 
 
export const aprobarVideo = () => async () => {
  
};
export const eliminarVideo = () => async () => {
  
};
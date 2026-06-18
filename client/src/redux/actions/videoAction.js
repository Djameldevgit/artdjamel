import { GLOBALTYPES } from './globalTypes';
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { createNotify } from './notifyAction';
import { imageUpload2 } from '../../utils/imageUpload2'; // ← IMPORTAR

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
  GET_USER_VIDEOS_REQUEST: 'GET_USER_VIDEOS_REQUEST',
  GET_USER_VIDEOS_SUCCESS: 'GET_USER_VIDEOS_SUCCESS',
  GET_USER_VIDEOS_FAIL: 'GET_USER_VIDEOS_FAIL',
  CLEAR_USER_VIDEOS: 'CLEAR_USER_VIDEOS',
  GET_FEATURED_VIDEOS: 'GET_FEATURED_VIDEOS',
  GET_POPULAR_VIDEOS: 'GET_POPULAR_VIDEOS',
  GET_RELATED_VIDEOS: 'GET_RELATED_VIDEOS',
};

// ========== CREAR VIDEO ==========
export const createVideo = (videoData, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    let uploadedImageUrls = [];
    if (videoData.images && videoData.images.length > 0) {
      // videoData.images es un array de objetos con { file, isExisting?, url? }
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
      images: uploadedImageUrls, // array de objetos { url, public_id } o strings
    };

    const res = await postDataAPI('videos', payload, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.CREATE_VIDEO, payload: res.data.video });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Vidéo publiée !' } });
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

// ========== ACTUALIZAR VIDEO ==========
export const updateVideo = (id, videoData, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    // Si videoData contiene imágenes nuevas (con file), subirlas
    let uploadedImageUrls = [];
    if (videoData.images && videoData.images.length > 0) {
      const newImages = videoData.images.filter(img => imsg.file && !img.isExisting);
      if (newImages.length > 0) {
        uploadedImageUrls = await imageUpload2(newImages);
        console.log('📸 Nuevas imágenes subidas en edición:', uploadedImageUrls);
      }
    }

    // Construir payload final combinando imágenes existentes (que ya tienen url) + nuevas
    // Si videoData.images son objetos con url, mantenerlos; si son strings, convertirlos
    const existingImages = videoData.images
      .filter(img => img.url || typeof img === 'string')
      .map(img => {
        if (typeof img === 'string') return { url: img, public_id: '' };
        return img;
      });

    const finalImages = [...existingImages, ...uploadedImageUrls];

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

    const res = await patchDataAPI(`videos/${id}`, payload, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.UPDATE_VIDEO, payload: res.data.video });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Vidéo mise à jour !' } });
      return { success: true, data: res.data };
    } else {
      throw new Error(res.data.message || 'Error al actualizar');
    }
  } catch (err) {
    console.error('❌ Error updateVideo:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};






export const getVideoById = (id) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.LOADING, payload: true });
    const res = await getDataAPI(`videos/${id}`);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.GET_VIDEO, payload: res.data.artwork}); // ← el backend devuelve { artwork }
      return { success: true, video: res.data.artwork };
    }
  } catch(err) { console.error(err); }
  finally { dispatch({ type: VIDEO_TYPES.LOADING, payload: false }); }
};

export const likeVideo = (videoId, token) => async (dispatch) => {
  const res = await patchDataAPI(`videos/${videoId}/like`, {}, token);
  if (res.data.success) {
    dispatch({ type: VIDEO_TYPES.LIKE_VIDEO, payload: { id: videoId, liked: res.data.liked, likes: res.data.likes } });
    return { liked: res.data.liked, likes: res.data.likes };
  }
};

export const saveVideo = (videoId, token) => async (dispatch) => {
  const res = await postDataAPI(`videos/${videoId}/save`, {}, token);
  if (res.data.success) {
    dispatch({ type: VIDEO_TYPES.TOGGLE_SAVE_VIDEO, payload: { id: videoId, saved: res.data.saved, savesCount: res.data.savesCount } });
    return { saved: res.data.saved, savesCount: res.data.savesCount };
  }
};

export const shareVideo = (videoId, token) => async (dispatch) => {
  const res = await patchDataAPI(`videos/${videoId}/share`, {}, token);
  if (res.data.success) {
    dispatch({ type: VIDEO_TYPES.SHARE_VIDEO, payload: { id: videoId, shared: res.data.shared, shares: res.data.shares } });
    return { shared: res.data.shared, shares: res.data.shares };
  }
};

export const incrementVideoView = (videoId, token) => async (dispatch) => {
  const res = await patchDataAPI(`videos/${videoId}/view`, {}, token);
  if (res.data.success) {
    dispatch({ type: VIDEO_TYPES.INCREMENT_VIEW, payload: { id: videoId, views: res.data.views } });
  }
};
export const getArtworkById = (id) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.LOADING, payload: true });
    const res = await getDataAPI(`videos/${id}`);
    if (res.data.success) {
      // ✅ El backend envía { success, artwork }
      dispatch({ type: VIDEO_TYPES.GET_VIDEO, payload: res.data.artwork });
      return { success: true, video: res.data.artwork };
    }
  } catch (err) {
    console.error(err);
  } finally {
    dispatch({ type: VIDEO_TYPES.LOADING, payload: false });
  }
};

export const getVideoByIdPrivate = (id, token) => async (dispatch) => {
  try {
    const res = await getDataAPI(`videos/private/${id}`, token);
    if (res.data.success) dispatch({ type: VIDEO_TYPES.GET_VIDEO, payload: res.data.video });
    return res.data;
  } catch (err) {
    return null;
  }
};

 

export const deleteVideo = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    const res = await deleteDataAPI(`videos/${id}`, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.DELETE_VIDEO, payload: id });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Video eliminado' } });
      return { success: true };
    }
  } catch (err) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.message } });
    return { success: false };
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ========== LISTADOS ==========
export const getVideosByCategory = (categorySlug, page = 1, limit = 12, sortBy = 'recent') => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.LOADING_BY_CATEGORY, payload: { categorySlug, loading: true } });
    const res = await getDataAPI(`videos/category/${categorySlug}?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    dispatch({ type: VIDEO_TYPES.GET_VIDEOS_BY_CATEGORY, payload: { categorySlug, videos: res.data.videos, total: res.data.total, page: res.data.page, totalPages: res.data.totalPages, hasMore: res.data.hasMore } });
  } catch (err) {
    console.error(err);
  } finally {
    dispatch({ type: VIDEO_TYPES.LOADING_BY_CATEGORY, payload: { categorySlug, loading: false } });
  }
};

export const getTrendingVideos = (timeWindow = 'week', page = 1, limit = 20) => async (dispatch) => {
  try {
    dispatch({ type: VIDEO_TYPES.TRENDING_LOADING, payload: true });
    const res = await getDataAPI(`videos/trending?timeRange=${timeWindow}&limit=${limit}&page=${page}`);
    dispatch({ type: VIDEO_TYPES.GET_TRENDING_VIDEOS, payload: { videos: res.data.videos, hasMore: res.data.hasMore, page, timeWindow } });
  } catch (err) {
    console.error(err);
  } finally {
    dispatch({ type: VIDEO_TYPES.TRENDING_LOADING, payload: false });
  }
};

export const getUserVideos = (userId, filter = 'all', page = 1, limit = 12) => async (dispatch, getState) => {
  try {
    dispatch({ type: VIDEO_TYPES.GET_USER_VIDEOS_REQUEST });
    const { auth } = getState();
    const token = auth?.token;
    const url = `user/${userId}/videos?page=${page}&limit=${limit}${filter !== 'all' ? `&filter=${filter}` : ''}`;
    const res = await getDataAPI(url, token);
    dispatch({ type: VIDEO_TYPES.GET_USER_VIDEOS_SUCCESS, payload: { videos: res.data.videos, total: res.data.total, pendingCount: res.data.pendingCount, approvedCount: res.data.approvedCount, page: res.data.page, totalPages: res.data.totalPages, hasMore: res.data.hasMore } });
    return { success: true };
  } catch (error) {
    dispatch({ type: VIDEO_TYPES.GET_USER_VIDEOS_FAIL, payload: error.message });
    return { success: false };
  }
};

export const clearUserVideos = () => ({ type: VIDEO_TYPES.CLEAR_USER_VIDEOS });

// ========== INTERACCIONES ==========
export const likeArtwork = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/like`, {}, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.LIKE_VIDEO, payload: { id: videoId, liked: res.data.liked, likes: res.data.likes } });
      return { liked: res.data.liked, likes: res.data.likes };
    }
  } catch (err) {
    console.error(err);
  }
};

export const saveArtwork = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/share`, {}, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.SHARE_VIDEO, payload: { id: videoId, shared: res.data.shared, shares: res.data.shares } });
      return { shared: res.data.shared, shares: res.data.shares };
    }
  } catch (err) {
    console.error(err);
  }
};

export const toggleSaveVideo = (videoId, token) => async (dispatch) => {
  try {
    const res = await postDataAPI(`videos/${videoId}/save`, {}, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.TOGGLE_SAVE_VIDEO, payload: { id: videoId, saved: res.data.isSaved, savesCount: res.data.savesCount } });
      return { saved: res.data.isSaved, savesCount: res.data.savesCount };
    }
  } catch (err) {
    console.error(err);
  }
};

export const incrementArtworkView = (videoId, token) => async (dispatch) => {
  try {
    const res = await patchDataAPI(`videos/${videoId}/view`, {}, token);
    if (res.data.success) {
      dispatch({ type: VIDEO_TYPES.INCREMENT_VIEW, payload: { id: videoId, views: res.data.views } });
    }
  } catch (err) {
    console.error(err);
  }
};

// Otras funciones que puedan faltar (getFeaturedVideos, etc.)...
export const getFeaturedVideos = (limit = 10) => async (dispatch) => {
  const res = await getDataAPI(`videos/featured?limit=${limit}`);
  dispatch({ type: VIDEO_TYPES.GET_FEATURED_VIDEOS, payload: res.data.videos });
};

export const updateArtwork = () => async () => {
  
};
export const shareArtwork = () => async () => {
  
};
export const addToCart = () => async () => {
  
};
 
 
export const aprobarVideo = () => async () => {
  
};
export const eliminarVideo = () => async () => {
  
};

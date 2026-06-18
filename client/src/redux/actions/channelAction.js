// redux/actions/channelAction.js
import { GLOBALTYPES } from './globalTypes';
 import { imageUpload2 } from '../../utils/imageUpload2';
 import {  getPublicDataAPI } from '../../utils/fetchData';
import { postDataAPI, getDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData';
 

export const CHANNEL_TYPES = {
    // Loading
    CHANNEL_LOADING: 'CHANNEL_LOADING',
    CHANNEL_FEED_LOADING: 'CHANNEL_FEED_LOADING',
    
    // Crear canal
    CREATE_CHANNEL: 'CREATE_CHANNEL',
    CREATE_CHANNEL_REQUEST: 'CREATE_CHANNEL_REQUEST',
    CREATE_CHANNEL_SUCCESS: 'CREATE_CHANNEL_SUCCESS',
    CREATE_CHANNEL_FAIL: 'CREATE_CHANNEL_FAIL',

    // Obtener canal
    GET_CHANNEL: 'GET_CHANNEL',
    GET_CHANNELS: 'GET_CHANNELS',
    GET_USER_CHANNELS: 'GET_USER_CHANNELS',
    CLEAR_CHANNEL: 'CLEAR_CHANNEL',
    
    // Videos del canal
    GET_CHANNEL_VIDEOS: 'GET_CHANNEL_VIDEOS',
    CLEAR_CHANNEL_VIDEOS: 'CLEAR_CHANNEL_VIDEOS',
    GET_CHANNEL_FEED_VIDEOS: 'GET_CHANNEL_FEED_VIDEOS',
    CLEAR_CHANNEL_FEED: 'CLEAR_CHANNEL_FEED',
    
    // Follow/Unfollow
    FOLLOW_CHANNEL: 'FOLLOW_CHANNEL',
    UNFOLLOW_CHANNEL: 'UNFOLLOW_CHANNEL',
 
    // Seguidores
    GET_CHANNEL_FOLLOWERS: 'GET_CHANNEL_FOLLOWERS',
    GET_USER_FOLLOWING_CHANNELS: 'GET_USER_FOLLOWING_CHANNELS',
    
    // Estadísticas
    REGISTER_CHANNEL_VIEW: 'REGISTER_CHANNEL_VIEW',
    CHANNEL_STATS: 'CHANNEL_STATS',
    
    // Actualizar canal
    UPDATE_CHANNEL: 'UPDATE_CHANNEL',
    
    // Admin - Canales pendientes
    GET_PENDING_CHANNELS_REQUEST: 'GET_PENDING_CHANNELS_REQUEST',
    GET_PENDING_CHANNELS_SUCCESS: 'GET_PENDING_CHANNELS_SUCCESS',
    GET_PENDING_CHANNELS_FAIL: 'GET_PENDING_CHANNELS_FAIL',
    
    APPROVE_CHANNEL_REQUEST: 'APPROVE_CHANNEL_REQUEST',
    APPROVE_CHANNEL_SUCCESS: 'APPROVE_CHANNEL_SUCCESS',
    APPROVE_CHANNEL_FAIL: 'APPROVE_CHANNEL_FAIL',
    
    REJECT_CHANNEL_REQUEST: 'REJECT_CHANNEL_REQUEST',
    REJECT_CHANNEL_SUCCESS: 'REJECT_CHANNEL_SUCCESS',
    REJECT_CHANNEL_FAIL: 'REJECT_CHANNEL_FAIL',
    
    // ✅ Nuevos tipos para RESUBMIT (reenviar canal rechazado)
    RESUBMIT_CHANNEL_REQUEST: 'RESUBMIT_CHANNEL_REQUEST',
    RESUBMIT_CHANNEL_SUCCESS: 'RESUBMIT_CHANNEL_SUCCESS',
    RESUBMIT_CHANNEL_FAIL: 'RESUBMIT_CHANNEL_FAIL',
    
    CLEAR_PENDING_CHANNELS: 'CLEAR_PENDING_CHANNELS',
    
    // Error general
    CHANNEL_ERROR: 'CHANNEL_ERROR',

    DELETE_CHANNEL_REQUEST: 'DELETE_CHANNEL_REQUEST',
    DELETE_CHANNEL_SUCCESS: 'DELETE_CHANNEL_SUCCESS',
    DELETE_CHANNEL_FAIL: 'DELETE_CHANNEL_FAIL',
    
    REPORT_CHANNEL_REQUEST: 'REPORT_CHANNEL_REQUEST',
    REPORT_CHANNEL_SUCCESS: 'REPORT_CHANNEL_SUCCESS',
    REPORT_CHANNEL_FAIL: 'REPORT_CHANNEL_FAIL',
    
    BLOCK_CHANNEL_REQUEST: 'BLOCK_CHANNEL_REQUEST',
    BLOCK_CHANNEL_SUCCESS: 'BLOCK_CHANNEL_SUCCESS',
    BLOCK_CHANNEL_FAIL: 'BLOCK_CHANNEL_FAIL',
    
    REGISTER_CHANNEL_SHARE: 'REGISTER_CHANNEL_SHARE',
    GET_CHANNEL_CONTACT: 'GET_CHANNEL_CONTACT',

    GET_PENDING_CHANNEL_REQUEST: 'GET_PENDING_CHANNEL_REQUEST',
    GET_PENDING_CHANNEL_SUCCESS: 'GET_PENDING_CHANNEL_SUCCESS',
    GET_PENDING_CHANNEL_ERROR: 'GET_PENDING_CHANNEL_ERROR',
    
    UPDATE_CHANNEL_FOLLOW_STATUS: 'UPDATE_CHANNEL_FOLLOW_STATUS',
    SET_FOLLOWING_CHANNELS: 'SET_FOLLOWING_CHANNELS',
    GET_APPROVED_CHANNELS_REQUEST: 'GET_APPROVED_CHANNELS_REQUEST',
    GET_APPROVED_CHANNELS_SUCCESS: 'GET_APPROVED_CHANNELS_SUCCESS',
    GET_APPROVED_CHANNELS_FAIL: 'GET_APPROVED_CHANNELS_FAIL',
    CLEAR_APPROVED_CHANNELS: 'CLEAR_APPROVED_CHANNELS',

};
import { createNotify } from './notifyAction';
 
// ==================== CREAR CANAL (como createPost) ====================
// redux/actions/channelAction.js

export const createChannel = ({ 
    channelData,   // { name, activity, description, wilaya, commune, phone, email, website }
    avatar,        // Array de objetos de imagen
    cover,         // Array de objetos de imagen
    auth 
}) => async (dispatch) => {
    let uploadedAvatar = [];
    let uploadedCover = [];
    
    try {
        console.log('🚀 createChannel INICIADO');
        console.log('📝 channelData:', channelData);
        console.log('📸 avatar tiene archivos?', avatar?.length);
        console.log('📸 cover tiene archivos?', cover?.length);
        console.log('🔑 Token presente?', !!auth?.token);
        
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        // ✅ SUBIR AVATAR SI EXISTE (como array)
        if(avatar && avatar.length > 0) {
            console.log('📤 Subiendo avatar...', avatar.length, 'imagen(es)');
            try {
                uploadedAvatar = await imageUpload2(avatar);
                console.log('✅ Avatar subido:', uploadedAvatar);
            } catch (uploadErr) {
                console.error('❌ Error subiendo avatar:', uploadErr);
                throw new Error(`Error al subir avatar: ${uploadErr.message}`);
            }
        }
        
        // ✅ SUBIR COVER SI EXISTE (como array)
        if(cover && cover.length > 0) {
            console.log('📤 Subiendo cover...', cover.length, 'imagen(es)');
            try {
                uploadedCover = await imageUpload2(cover);
                console.log('✅ Cover subido:', uploadedCover);
            } catch (uploadErr) {
                console.error('❌ Error subiendo cover:', uploadErr);
                throw new Error(`Error al subir cover: ${uploadErr.message}`);
            }
        }
        
        // ✅ PREPARAR DATOS PARA ENVIAR
        const dataToSend = { 
            ...channelData,
            avatar: uploadedAvatar,
            cover: uploadedCover
        };
        
        console.log('📡 Enviando petición POST a /api/channels');
        console.log('📦 Datos a enviar:', JSON.stringify({
            ...dataToSend,
            avatar: uploadedAvatar.length,
            cover: uploadedCover.length
        }));
        
        // ✅ ENVIAR PETICIÓN CON TRY-CATCH ESPECÍFICO
        let res;
        try {
            res = await postDataAPI('channels', dataToSend, auth.token);
            console.log('📡 Respuesta recibida:', res);
            console.log('📡 Status:', res.status);
            console.log('📡 Data:', res.data);
        } catch (apiErr) {
            console.error('❌ Error en la petición API:', apiErr);
            console.error('❌ Response error:', apiErr.response?.data);
            throw new Error(apiErr.response?.data?.msg || apiErr.response?.data?.message || 'Error de conexión con el servidor');
        }
        
        if (res.data?.success) {
            console.log('✅ Canal creado exitosamente:', res.data.channel);
            
            dispatch({ 
                type: CHANNEL_TYPES.CREATE_CHANNEL_SUCCESS, 
                payload: res.data.channel 
            });
            
            dispatch({ 
                type: GLOBALTYPES.ALERT, 
                payload: { success: res.data.msg || 'Canal créé avec succès!' } 
            });
            
            return { success: true, channel: res.data.channel };
        } else {
            const errorMsg = res.data?.msg || res.data?.message || 'Error desconocido al crear canal';
            console.error('❌ Error en respuesta:', errorMsg);
            throw new Error(errorMsg);
        }
        
    } catch (err) {
        console.error('❌ Error capturado en createChannel:', err);
        console.error('❌ Mensaje:', err.message);
        
        const errorMessage = err.message || 'Error al crear el canal';
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: errorMessage }
        });
        
        return { success: false, error: errorMessage };
        
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
};

// ==================== ACTUALIZAR CANAL (como updatePost sin status) ====================
// frontend/src/redux/actions/channelAction.js

// ✅ CORREGIDO - updateChannel
export const updateChannel = ({ 
    channelId,
    channelData,
    avatar,
    cover,
    auth 
}) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        // ✅ IMPORTANTE: Asegurar que avatar y cover tengan la estructura correcta
        let finalAvatar = [];
        let finalCover = [];
        
        // Procesar avatar
        if (avatar && avatar.length > 0) {
            finalAvatar = avatar.map(img => {
                if (img.file) {
                    // Es un File object - se subirá
                    return img.file;
                } else if (img.url) {
                    // Es imagen existente
                    return { url: img.url, public_id: img.public_id };
                }
                return img;
            });
        }
        
        // Procesar cover
        if (cover && cover.length > 0) {
            finalCover = cover.map(img => {
                if (img.file) {
                    return img.file;
                } else if (img.url) {
                    return { url: img.url, public_id: img.public_id };
                }
                return img;
            });
        }
        
        // ✅ Subir nuevas imágenes
        let uploadedAvatar = [];
        let uploadedCover = [];
        
        const newAvatarFiles = finalAvatar.filter(img => img instanceof File);
        const newCoverFiles = finalCover.filter(img => img instanceof File);
        
        if (newAvatarFiles.length > 0) {
            uploadedAvatar = await imageUpload2(newAvatarFiles);
        }
        
        if (newCoverFiles.length > 0) {
            uploadedCover = await imageUpload2(newCoverFiles);
        }
        
        // ✅ Combinar existentes + nuevas
        const existingAvatar = finalAvatar.filter(img => img.url && !(img instanceof File));
        const existingCover = finalCover.filter(img => img.url && !(img instanceof File));
        
        const finalAvatarArray = [...existingAvatar, ...uploadedAvatar];
        const finalCoverArray = [...existingCover, ...uploadedCover];
        
        // ✅ Enviar actualización
        const res = await patchDataAPI(`channels/${channelId}`, {
            ...channelData,
            avatar: finalAvatarArray,
            cover: finalCoverArray
        }, auth.token);
        
        dispatch({ 
            type: CHANNEL_TYPES.UPDATE_CHANNEL, 
            payload: res.data.channel 
        });
        
        dispatch({ 
            type: GLOBALTYPES.ALERT, 
            payload: { success: res.data.msg || "Canal actualizado con éxito" } 
        });
        
        return { success: true, channel: res.data.channel };
        
    } catch (err) {
        console.error('❌ Error updateChannel:', err);
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || err.message }
        });
        return { success: false, error: err.response?.data?.msg };
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
}
 
// ==================== OBTENER PERFIL DEL CANAL ====================
// frontend/src/redux/actions/channelAction.js

// frontend/src/redux/actions/channelAction.js

// redux/actions/channelAction.js

// ✅ CORREGIR getChannelProfile para usar la ruta de dueño cuando sea necesario
export const getChannelProfile = (channelId, token, isOwnerView = false) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: true });
        
        // ✅ Usar la ruta correcta según si es vista de dueño
        const url = isOwnerView ? `channels/owner/${channelId}` : `channels/${channelId}`;
        const res = await getDataAPI(url, token);
        
        console.log('📺 getChannelProfile - URL:', url);
        console.log('📺 Respuesta:', res.data);
        
        dispatch({ 
            type: CHANNEL_TYPES.GET_CHANNEL, 
            payload: res.data.channel || res.data.profile
        });
        
        return { success: true, channel: res.data.channel || res.data.profile };
        
    } catch (err) {
        console.error('❌ Error getChannelProfile:', err);
        dispatch({ type: CHANNEL_TYPES.CHANNEL_ERROR, payload: err.response?.data?.message });
        return { success: false, message: err.response?.data?.message };
    } finally {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: false });
    }
};
// ==================== OBTENER CANAL POR ID ====================
// redux/actions/channelAction.js

// 🔍 OBTENER CANAL POR ID (con soporte para vista de dueño)
export const getChannelById = (id, token, isOwnerView = false) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: true });
        
        // ✅ Usar ruta diferente si es vista de dueño
        const url = isOwnerView ? `channels/owner/${id}` : `channels/${id}`;
        const res = await getDataAPI(url, token);
        
        if (res.data?.success) {
            dispatch({
                type: CHANNEL_TYPES.GET_CHANNEL,
                payload: res.data.channel
            });
            return { success: true, channel: res.data.channel };
        }
        
        return { success: false, error: 'Canal non trouvé' };
        
    } catch (err) {
        console.error('❌ Error getChannelById:', err);
        dispatch({
            type: CHANNEL_TYPES.CHANNEL_ERROR,
            payload: err.response?.data?.msg || err.message
        });
        return { success: false, error: err.response?.data?.msg || err.message };
    } finally {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: false });
    }
};

// ==================== OBTENER MIS CANALES ====================
export const getMyChannels = (token) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: true });
        
        const res = await getDataAPI('my-channels', token);
        
        dispatch({ 
            type: CHANNEL_TYPES.GET_USER_CHANNELS, 
            payload: res.data.channels || [] 
        });
        
        return { success: true, channels: res.data.channels };
        
    } catch (err) {
        console.error('❌ Error getMyChannels:', err);
        dispatch({ type: CHANNEL_TYPES.GET_USER_CHANNELS, payload: [] });
        return { success: false, channels: [] };
    } finally {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: false });
    }
};

// ==================== OBTENER VIDEOS DEL CANAL ====================
// frontend/src/redux/actions/channelAction.js

export const getChannelVideos = (channelId, page = 1, limit = 12, token = null) => async (dispatch, getState) => {
    try {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: true });
        
        // ✅ Agregar timestamp para evitar caché
        const timestamp = Date.now();
        const url = `channels/${channelId}/videos?page=${page}&limit=${limit}&_=${timestamp}`;
        
        console.log('📹 Fetching videos desde:', url);
        
        const res = token ? await getDataAPI(url, token) : await getDataAPI(url);
        
        console.log('📹 Respuesta completa:', res);
        console.log('📹 Videos recibidos:', res.data?.videos);
        console.log('📹 Total:', res.data?.total);
        
        if (page === 1) {
            dispatch({ 
                type: CHANNEL_TYPES.GET_CHANNEL_VIDEOS, 
                payload: {
                    videos: res.data?.videos || [],
                    total: res.data?.total || 0,
                    hasMore: res.data?.hasMore || false,
                    isOwner: res.data?.isOwner || false
                }
            });
        } else {
            const currentVideos = getState().channel?.videos || [];
            dispatch({ 
                type: CHANNEL_TYPES.GET_CHANNEL_VIDEOS, 
                payload: {
                    videos: [...currentVideos, ...(res.data?.videos || [])],
                    total: res.data?.total || 0,
                    hasMore: res.data?.hasMore || false
                }
            });
        }
        
        return res.data;
        
    } catch (err) {
        console.error('❌ Error getChannelVideos:', err);
        return { success: false, videos: [] };
    } finally {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_LOADING, payload: false });
    }
};
 

// frontend/src/redux/actions/channelAction.js


export const toggleFollowChannel = (channelId, token) => async (dispatch, getState) => {
    try {
        console.log('📥 toggleFollowChannel - channelId:', channelId);
        
        const res = await patchDataAPI(`channels/${channelId}/follow`, {}, token);
        
        console.log('📥 toggleFollowChannel - respuesta:', res.data);
        
        if (res.data.success) {
            // ✅ Obtener followingChannels actuales del estado o localStorage
            const currentState = getState();
            let currentFollowing = currentState.channel?.followingChannels || [];
            
            // Si el estado está vacío, intentar cargar desde localStorage
            if (currentFollowing.length === 0) {
                const saved = localStorage.getItem('user_following_channels');
                if (saved) {
                    currentFollowing = JSON.parse(saved);
                }
            }
            
            let newFollowing;
            if (res.data.isFollowing) {
                // Agregar a la lista si no existe
                if (!currentFollowing.includes(channelId)) {
                    newFollowing = [...currentFollowing, channelId];
                } else {
                    newFollowing = currentFollowing;
                }
            } else {
                // Remover de la lista
                newFollowing = currentFollowing.filter(id => id !== channelId);
            }
            
            // ✅ Guardar en localStorage
            localStorage.setItem('user_following_channels', JSON.stringify(newFollowing));
            console.log('💾 Saved to localStorage:', newFollowing);
            
            // ✅ Disparar acciones de Redux
            if (res.data.isFollowing) {
                dispatch({
                    type: CHANNEL_TYPES.FOLLOW_CHANNEL,
                    payload: {
                        channelId: channelId,
                        followersCount: res.data.followersCount
                    }
                });
            } else {
                dispatch({
                    type: CHANNEL_TYPES.UNFOLLOW_CHANNEL,
                    payload: {
                        channelId: channelId,
                        followersCount: res.data.followersCount
                    }
                });
            }
            
            dispatch({
                type: CHANNEL_TYPES.UPDATE_CHANNEL_FOLLOW_STATUS,
                payload: {
                    isFollowing: res.data.isFollowing,
                    followersCount: res.data.followersCount
                }
            });
            
            // ✅ También guardar en sessionStorage como backup
            sessionStorage.setItem('user_following_channels', JSON.stringify(newFollowing));
        }
        
        return {
            success: true,
            isFollowing: res.data.isFollowing,
            followersCount: res.data.followersCount
        };
        
    } catch (err) {
        console.error('❌ Error toggleFollowChannel:', err);
        return { success: false, error: err.response?.data?.msg || err.message };
    }
};
// frontend/src/redux/actions/channelAction.js

// Añadir esta función al final del archivo
// frontend/src/redux/actions/channelAction.js

// Reemplaza loadUserFollowingChannels con esta versión que solo usa localStorage
export const loadFollowingFromStorage = () => async (dispatch) => {
    try {
        // Intentar cargar desde localStorage
        const saved = localStorage.getItem('user_following_channels');
        
        if (saved) {
            const followingChannels = JSON.parse(saved);
            console.log('📦 Loaded following channels from localStorage:', followingChannels);
            
            dispatch({
                type: CHANNEL_TYPES.SET_FOLLOWING_CHANNELS,
                payload: followingChannels
            });
            
            return { success: true, followingChannels };
        }
        
        // Backup desde sessionStorage
        const savedSession = sessionStorage.getItem('user_following_channels');
        if (savedSession) {
            const followingChannels = JSON.parse(savedSession);
            console.log('📦 Loaded following channels from sessionStorage:', followingChannels);
            
            dispatch({
                type: CHANNEL_TYPES.SET_FOLLOWING_CHANNELS,
                payload: followingChannels
            });
            
            return { success: true, followingChannels };
        }
        
        console.log('⚠️ No following channels found in storage, initializing empty array');
        // Inicializar con array vacío
        localStorage.setItem('user_following_channels', JSON.stringify([]));
        dispatch({
            type: CHANNEL_TYPES.SET_FOLLOWING_CHANNELS,
            payload: []
        });
        
        return { success: true, followingChannels: [] };
        
    } catch (err) {
        console.error('❌ Error loading from storage:', err);
        return { success: false, followingChannels: [] };
    }
};


// ==================== ADMIN: OBTENER CANALES PENDIENTES ====================
export const getPendingChannels = (token, page = 1, limit = 20) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.GET_PENDING_CHANNELS_REQUEST });
        
        const res = await getDataAPI(`admin/channels/pending?page=${page}&limit=${limit}`, token);
        
        dispatch({
            type: CHANNEL_TYPES.GET_PENDING_CHANNELS_SUCCESS,
            payload: {
                channels: res.data.channels || [],
                total: res.data.total || 0,
                page: res.data.page || 1,
                totalPages: res.data.totalPages || 1
            }
        });
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error getPendingChannels:', err);
        dispatch({
            type: CHANNEL_TYPES.GET_PENDING_CHANNELS_FAIL,
            payload: err.response?.data?.message || 'Error al cargar canales pendientes'
        });
        return { success: false };
    }
};

// ==================== ADMIN: APROBAR CANAL ====================
// frontend/src/redux/actions/channelAction.js

// ==================== ADMIN: APROBAR CANAL CON NOTIFICACIÓN ====================
export const approveChannel = (channelId, token, auth, socket) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.APPROVE_CHANNEL_REQUEST });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        const res = await patchDataAPI(`admin/channels/${channelId}/approve`, {}, token);
        
        dispatch({
            type: CHANNEL_TYPES.APPROVE_CHANNEL_SUCCESS,
            payload: res.data.channel
        });
        
        const channel = res.data.channel;
        
        // ✅ Notificar al dueño del canal que fue aprobado (en francés)
        if (channel && channel.owner && channel.owner._id) {
            const msg = {
                id: auth?.user?._id || 'admin',
                text: `✅ Félicitations ! Votre canal "${channel.name}" a été approuvé et est maintenant visible sur la plateforme. Vous pouvez dès à présent publier vos vidéos et commencer à partager votre contenu avec la communauté. 🎉`,
                recipients: [channel.owner._id], // Enviar solo al dueño del canal
                url: `/channel/${channel._id}`,
                content: channel.name,
                image: channel.avatar || channel.cover,
                type: 'channel_approved'
            };
            
            await dispatch(createNotify({ msg, auth, socket }));
        }
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { success: res.data.message || 'Canal approuvé avec succès' }
        });
        
        return { success: true, channel: res.data.channel };
        
    } catch (err) {
        console.error('❌ Error approveChannel:', err);
        dispatch({
            type: CHANNEL_TYPES.APPROVE_CHANNEL_FAIL,
            payload: err.response?.data?.message || 'Error al aprobar el canal'
        });
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.message || 'Erreur lors de l\'approbation du canal' }
        });
        return { success: false, error: err.response?.data?.message };
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
};

// ==================== ADMIN: RECHAZAR CANAL ====================
// frontend/src/redux/actions/channelAction.js

// ==================== ADMIN: RECHAZAR CANAL CON NOTIFICACIÓN ====================
// frontend/src/redux/actions/channelAction.js

// ==================== RECHAZAR CANAL (NO ELIMINAR) ====================
export const rejectChannel = (channelId, reason, token, auth, socket) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.REJECT_CHANNEL_REQUEST });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        const res = await patchDataAPI(`admin/channels/${channelId}/reject`, { reason }, token);
        
        dispatch({
            type: CHANNEL_TYPES.REJECT_CHANNEL_SUCCESS,
            payload: res.data.channel
        });
        
        const channel = res.data.channel;
        
        // ✅ Notificar al dueño del canal que fue rechazado (en francés)
        if (channel && channel.owner && channel.owner._id) {
            const reasonText = reason ? ` Motif : ${reason}` : '';
            const msg = {
                id: auth?.user?._id || 'admin',
                text: `❌ Votre canal "${channel.name}" n'a pas été approuvé.${reasonText}\n\nVeuillez corriger les problèmes et soumettre à nouveau votre canal depuis la page de modification.`,
                recipients: [channel.owner._id],
                url: `/channel/${channel._id}/edit`,
                content: channel.name,
                image: channel.avatar || channel.cover,
                type: 'channel_rejected'
            };
            
            const { createNotify } = await import('./notifyAction');
            await dispatch(createNotify({ msg, auth, socket }));
        }
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { success: res.data.message || 'Canal rejeté avec succès' }
        });
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error rejectChannel:', err);
        dispatch({
            type: CHANNEL_TYPES.REJECT_CHANNEL_FAIL,
            payload: err.response?.data?.message || 'Error al rechazar el canal'
        });
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.message || 'Erreur lors du rejet du canal' }
        });
        return { success: false, error: err.response?.data?.message };
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
};

// ==================== REENVIAR CANAL (para el dueño) ====================
 
export const resubmitChannel = (channelId, token) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        const res = await patchDataAPI(`channels/${channelId}/resubmit`, {}, token);
        
        if (res.data.success) {
            dispatch({
                type: CHANNEL_TYPES.UPDATE_CHANNEL,
                payload: res.data.channel
            });
            
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { success: res.data.message || 'Canal renvoyé pour approbation' }
            });
        }
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error resubmitChannel:', err);
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.message || 'Erreur lors du renvoi' }
        });
        return { success: false };
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
};


// ==================== LIMPIAR CANALES PENDIENTES ====================
export const clearPendingChannels = () => (dispatch) => {
    dispatch({ type: CHANNEL_TYPES.CLEAR_PENDING_CHANNELS });
};

// ==================== LIMPIAR ESTADO DEL CANAL ====================
export const clearChannelState = () => (dispatch) => {
    dispatch({ type: CHANNEL_TYPES.CLEAR_CHANNEL });
    dispatch({ type: CHANNEL_TYPES.CLEAR_CHANNEL_VIDEOS });
    dispatch({ type: CHANNEL_TYPES.CLEAR_CHANNEL_FEED });
};

// ==================== LIMPIAR ERRORES ====================
export const clearChannelErrors = () => (dispatch) => {
    dispatch({ type: CHANNEL_TYPES.CHANNEL_ERROR, payload: null });
};

// ==================== OBTENER ESTADÍSTICAS DEL CANAL ====================
export const getChannelStats = (channelId, token) => async (dispatch) => {
    try {
        const res = await getDataAPI(`channels/${channelId}/stats`, token);
        dispatch({
            type: CHANNEL_TYPES.CHANNEL_STATS,
            payload: res.data.stats
        });
        return res.data;
    } catch (err) {
        console.error('❌ Error getChannelStats:', err);
        return null;
    }
};

// ==================== OBTENER SEGUIDORES ====================
export const getChannelFollowers = (channelId, token) => async (dispatch) => {
    try {
        const res = await getDataAPI(`channels/${channelId}/followers`, token);
        dispatch({
            type: CHANNEL_TYPES.GET_CHANNEL_FOLLOWERS,
            payload: res.data.followers || []
        });
        return res.data;
    } catch (err) {
        console.error('❌ Error getChannelFollowers:', err);
        return null;
    }
};

// ==================== OBTENER FEED DE VIDEOS ====================
export const getChannelFeedVideos = (channelId, page = 1, limit = 10, token = null) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_FEED_LOADING, payload: true });
        
        const res = await getDataAPI(`channels/${channelId}/videos?page=${page}&limit=${limit}`, token);
        
        dispatch({
            type: CHANNEL_TYPES.GET_CHANNEL_FEED_VIDEOS,
            payload: {
                videos: res.data.videos,
                total: res.data.total,
                page: res.data.page,
                hasMore: res.data.hasMore,
                channelId
            }
        });
        
        return res.data;
    } catch (err) {
        console.error('❌ Error getChannelFeedVideos:', err);
        return null;
    } finally {
        dispatch({ type: CHANNEL_TYPES.CHANNEL_FEED_LOADING, payload: false });
    }
};

// ==================== LIMPIAR FEED ====================
export const clearChannelFeed = () => (dispatch) => {
    dispatch({ type: CHANNEL_TYPES.CLEAR_CHANNEL_FEED });
};

// ==================== REGISTRAR VISTA ====================
export const registerChannelView = (channelId, token) => async (dispatch) => {
    try {
        const res = await postDataAPI(`channels/${channelId}/view`, {}, token);
        if (res.data.success) {
            dispatch({
                type: CHANNEL_TYPES.REGISTER_CHANNEL_VIEW,
                payload: { count: res.data.count }
            });
        }
        return res.data;
    } catch (err) {
        console.error('❌ Error registerChannelView:', err);
        return null;
    }
};

// ==================== OBTENER CANALES QUE SIGUE EL USUARIO ====================
export const getUserFollowingChannels = (userId, token) => async (dispatch) => {
    try {
        const res = await getDataAPI(`users/${userId}/following-channels`, token);
        dispatch({
            type: CHANNEL_TYPES.GET_USER_FOLLOWING_CHANNELS,
            payload: res.data.channels || []
        });
        return res.data;
    } catch (err) {
        console.error('❌ Error getUserFollowingChannels:', err);
        return null;
    }
};
// ============================================
// 🗑️ DELETE CHANNEL - ELIMINAR CANAL
// ============================================
const deleteChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Buscar el canal
        const channel = await Channel.findById(id);
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                msg: 'Canal no encontrado'
            });
        }
        
        // Verificar permisos
        const isOwner = channel.owner.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para eliminar este canal'
            });
        }
        
        // ✅ 1. OBTENER TODOS LOS VIDEOS DEL CANAL
        const videos = await Video.find({ channel: id });
        const videoIds = videos.map(v => v._id);
        
        // ✅ 2. ELIMINAR REFERENCIAS EN USUARIOS
        
        // 2.1 Usuarios que siguen este canal
        await User.updateMany(
            { followingChannels: id },
            { $pull: { followingChannels: id } }
        );
        
        // 2.2 Usuarios que guardaron videos de este canal
        if (videoIds.length > 0) {
            await User.updateMany(
                { savedVideos: { $in: videoIds } },
                { $pull: { savedVideos: { $in: videoIds } } }
            );
            
            // 2.3 Usuarios que dieron like a videos de este canal
            await User.updateMany(
                { likedVideos: { $in: videoIds } },
                { $pull: { likedVideos: { $in: videoIds } } }
            );
        }
        
        // ✅ 3. ELIMINAR COMENTARIOS (si tienes modelo Comment separado)
        if (mongoose.models.Comment) {
            await mongoose.models.Comment.deleteMany({ video: { $in: videoIds } });
        }
        
        // ✅ 4. ELIMINAR REPORTES (si tienes)
        if (mongoose.models.Report) {
            await mongoose.models.Report.deleteMany({ channelId: id });
            await mongoose.models.Report.deleteMany({ videoId: { $in: videoIds } });
        }
        
        // ✅ 5. ELIMINAR TODOS LOS VIDEOS DEL CANAL
        const videosDeleted = await Video.deleteMany({ channel: id });
        
        // ✅ 6. ELIMINAR EL CANAL
        await Channel.findByIdAndDelete(id);
        
        console.log(`✅ Canal ${id} eliminado por usuario ${userId}`);
        console.log(`📊 Videos eliminados: ${videosDeleted.deletedCount || 0}`);
        console.log(`🎯 IDs de videos eliminados: ${videoIds.length}`);
        
        res.status(200).json({
            success: true,
            msg: 'Canal y todo su contenido eliminado correctamente',
            deletedData: {
                channelId: id,
                channelName: channel.name,
                videosCount: videosDeleted.deletedCount || 0,
                videosIds: videoIds
            }
        });
        
    } catch (error) {
        console.error('❌ Error al eliminar canal:', error);
        res.status(500).json({
            success: false,
            msg: error.message || 'Error al eliminar el canal'
        });
    }
};

export const deleteChannelAdmin = (channelId, reason, token, history) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.DELETE_CHANNEL_REQUEST });
        
        // ✅ Extraer token string si viene como objeto
        let finalToken = token;
        
        // Si token es un objeto (como auth completo), extraer el token
        if (typeof token === 'object' && token !== null) {
            console.warn('⚠️ Token recibido como objeto, extrayendo...');
            finalToken = token.token || token.access_token;
            
            if (!finalToken) {
                throw new Error('No se encontró token en el objeto');
            }
        }
        
        // Verificar que sea string
        if (typeof finalToken !== 'string') {
            console.error('Token inválido:', finalToken);
            throw new Error('Token de autenticación inválido');
        }
        
        console.log('✅ Token válido, longitud:', finalToken.length);
        
        const res = await deleteDataAPI(`channels/${channelId}`, { reason }, finalToken);
        
        dispatch({
            type: CHANNEL_TYPES.DELETE_CHANNEL_SUCCESS,
            payload: channelId
        });
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { success: res.data.message || 'Canal eliminado correctamente' }
        });
        
        if (history) {
            setTimeout(() => history.push('/my-channels'), 1500);
        }
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error deleteChannel:', err);
        
        dispatch({
            type: CHANNEL_TYPES.DELETE_CHANNEL_FAIL,
            payload: err.response?.data?.error || err.message
        });
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.error || 'Error al eliminar el canal' }
        });
        
        return { success: false };
    }
};
// ==================== REPORTAR CANAL ====================
export const reportChannel = (channelId, reportData, auth) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.REPORT_CHANNEL_REQUEST });
        
        const res = await postDataAPI(`channels/${channelId}/report`, reportData, auth.token);
        
        dispatch({
            type: CHANNEL_TYPES.REPORT_CHANNEL_SUCCESS,
            payload: { channelId, reportCount: res.data.reportCount }
        });
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { success: res.data.message || 'Reporte enviado' }
        });
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error reportChannel:', err);
        dispatch({
            type: CHANNEL_TYPES.REPORT_CHANNEL_FAIL,
            payload: err.response?.data?.message || 'Error al reportar'
        });
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.message || 'Error al reportar' }
        });
        return { success: false };
    }
};

// ==================== BLOQUEAR CANAL ====================
export const blockChannel = (channelId, auth) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.BLOCK_CHANNEL_REQUEST });
        
        const res = await patchDataAPI(`channels/${channelId}/block`, {}, auth.token);
        
        dispatch({
            type: CHANNEL_TYPES.BLOCK_CHANNEL_SUCCESS,
            payload: { channelId, isBlocked: res.data.isBlocked }
        });
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { success: res.data.message }
        });
        
        return { success: true, isBlocked: res.data.isBlocked };
        
    } catch (err) {
        console.error('❌ Error blockChannel:', err);
        dispatch({
            type: CHANNEL_TYPES.BLOCK_CHANNEL_FAIL,
            payload: err.response?.data?.message || 'Error al bloquear'
        });
        return { success: false };
    }
};

// ==================== REGISTRAR COMPARTIDO ====================
export const registerChannelShare = (channelId, auth) => async (dispatch) => {
    try {
        const res = await postDataAPI(`channels/${channelId}/share`, {}, auth?.token);
        
        dispatch({
            type: CHANNEL_TYPES.REGISTER_CHANNEL_SHARE,
            payload: { channelId, shareCount: res.data.shareCount }
        });
        
        return { success: true };
        
    } catch (err) {
        console.error('❌ Error registerShare:', err);
        return { success: false };
    }
};

// ==================== OBTENER INFO DE CONTACTO ====================
export const getChannelContact = (channelId, auth) => async (dispatch) => {
    try {
        const res = await getDataAPI(`channels/${channelId}/contact`, auth.token);
        
        dispatch({
            type: CHANNEL_TYPES.GET_CHANNEL_CONTACT,
            payload: res.data.contact
        });
        
        return { success: true, contact: res.data.contact };
        
    } catch (err) {
        console.error('❌ Error getChannelContact:', err);
        return { success: false };
    }
};

// channelAction.js - Versión que obtiene el token del store
 
// frontend/src/redux/actions/channelAction.js

// Añadir esta nueva acción
// frontend/src/redux/actions/channelAction.js

// ✅ CORREGIR esta acción - está mal implementada
export const getPendingChannelById = (token, channelId) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.GET_PENDING_CHANNEL_REQUEST });
        
        console.log('📺 getPendingChannelById - channelId:', channelId);
        console.log('📺 Token recibido:', token ? `Token presente (${token.substring(0, 30)}...)` : 'NO TOKEN');
        
        // ✅ CORRECCIÓN: getDataAPI(url, token) - el segundo parámetro es el token string
        // NO pasar un objeto config
        const res = await getDataAPI(`pending/${channelId}`, token);
        
        console.log('✅ Respuesta:', res.data);
        
        if (res.data.success) {
            dispatch({
                type: CHANNEL_TYPES.GET_PENDING_CHANNEL_SUCCESS,
                payload: res.data.profile
            });
        }
        
        return { success: true, channel: res.data.profile };
        
    } catch (error) {
        console.error('❌ Error getPendingChannelById:', error);
        dispatch({
            type: CHANNEL_TYPES.GET_PENDING_CHANNEL_ERROR,
            payload: error.response?.data?.message || error.message
        });
        
        return { 
            success: false, 
            error: error.response?.data?.message || error.message 
        };
    }
};

// frontend/src/redux/actions/channelAction.js

// ✅ CORREGIR getPendingChannelOwner para usar la ruta correcta
export const getPendingChannelOwner = (channelId, token) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.GET_PENDING_CHANNEL_REQUEST });
        
        console.log('📺 getPendingChannelOwner - channelId:', channelId);
        
        // ✅ USAR LA RUTA CORRECTA: channels/pending/:channelId
        const url = `channels/pending/${channelId}`;
        
        console.log('📡 Llamando a:', url);
        
        const res = await getDataAPI(url, token);
        
        console.log('✅ Respuesta:', res.data);
        
        if (res.data.success) {
            dispatch({ 
                type: CHANNEL_TYPES.GET_PENDING_CHANNEL_SUCCESS, 
                payload: res.data.profile 
            });
        }
        
        return res.data;
        
    } catch (err) {
        console.error('❌ Error getPendingChannelOwner:', err);
        
        dispatch({ 
            type: CHANNEL_TYPES.GET_PENDING_CHANNEL_ERROR, 
            payload: err.response?.data?.message || 'Error al cargar el canal pendiente'
        });
        
        return { success: false, error: err.response?.data?.message };
    }
};
export const getApprovedChannels = (page = 1, limit = 12) => async (dispatch) => {
    try {
        dispatch({ type: CHANNEL_TYPES.GET_APPROVED_CHANNELS_REQUEST });
        
        // ✅ Llamada correcta: la URL no tiene /api al inicio, y los params van en config
        const res = await getPublicDataAPI('public/approved', {
            params: { page, limit }
        });
        
        console.log('📡 Respuesta del servidor:', res.data);
        
        dispatch({
            type: CHANNEL_TYPES.GET_APPROVED_CHANNELS_SUCCESS,
            payload: {
                channels: res.data.channels || [],
                total: res.data.total || 0,
                page: res.data.page || 1,
                totalPages: res.data.totalPages || 1,
                hasMore: res.data.hasMore || false
            }
        });
    } catch (err) {
        console.error('❌ Error getApprovedChannels:', err);
        dispatch({
            type: CHANNEL_TYPES.GET_APPROVED_CHANNELS_FAIL,
            payload: err.response?.data?.message || 'Error al cargar canales'
        });
    }
};

export const clearApprovedChannels = () => ({
    type: CHANNEL_TYPES.CLEAR_APPROVED_CHANNELS
});
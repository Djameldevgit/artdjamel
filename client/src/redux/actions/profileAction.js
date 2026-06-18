// redux/actions/profileAction.js - VERSIÓN CORREGIDA

import { GLOBALTYPES } from './globalTypes'
import { getDataAPI,deleteDataAPI, patchDataAPI } from '../../utils/fetchData'
import { uploadAvatar } from '../../utils/uploadAvatar'  // ✅ Nueva función

export const PROFILE_TYPES = {
    LOADING: 'LOADING_PROFILE',
    GET_USER: 'GET_PROFILE_USER',
    GET_ID: 'GET_PROFILE_ID',
    UPDATE_PROFILE: 'UPDATE_PROFILE_USER'
}

// ============================================
// 🟢 GET PROFILE USERS
// ============================================
export const getProfileUsers = ({ id, auth }) => async (dispatch) => {
    dispatch({ type: PROFILE_TYPES.GET_ID, payload: id });

    try {
        dispatch({ type: PROFILE_TYPES.LOADING, payload: true });
        
        const res = await getDataAPI(`user/${id}/profile`, auth.token);
       
        console.log('📦 Respuesta del backend:', res.data);
        
        if (!res.data || !res.data.success || !res.data.profile) {
            throw new Error('Usuario no encontrado');
        }

        const profileData = res.data.profile;

        const userData = {
            _id: profileData._id,
            username: profileData.username || '',
            avatar: profileData.avatar || '',
            fullname: profileData.fullname || profileData.username || '',
            story: profileData.story || '',
            mobile: profileData.mobile || '',
            address: profileData.address || '',
            website: profileData.website || '',
            email: profileData.email || '',
            createdAt: profileData.createdAt || new Date().toISOString(),
            role: profileData.role || 'user'
        };

        console.log('📦 UserData a guardar:', userData);

        dispatch({
            type: PROFILE_TYPES.GET_USER,
            payload: userData
        });

        dispatch({ type: PROFILE_TYPES.LOADING, payload: false });
        
        return { success: true, user: userData };
        
    } catch (err) {
        console.error('❌ Error en getProfileUsers:', err);
        dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: { error: err.response?.data?.message || err.message || 'Error al cargar perfil' }
        });
        dispatch({ type: PROFILE_TYPES.LOADING, payload: false });
        return { success: false, error: err.message };
    }
};

// ============================================
// 🟢 UPDATE PROFILE USER
// ============================================
export const updateProfileUser = ({ userData, avatar, auth }) => async (dispatch) => {
    console.log('🚀 updateProfileUser iniciado');
    console.log('📝 userData:', userData);
    console.log('🖼️ avatar recibido:', avatar ? `File: ${avatar.name}, size: ${avatar.size}, type: ${avatar.type}` : 'null');
    
    if (userData.fullname && userData.fullname.length > 25) {
        return dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: { error: "Le nom complet est trop long (max 25 caractères)" }
        });
    }
  
    if (userData.story && userData.story.length > 200) {
        return dispatch({
            type: GLOBALTYPES.ALERT, 
            payload: { error: "La description est trop longue (max 200 caractères)" }
        });
    }
  
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        let avatarUrl = auth.user.avatar;
        
        // ✅ SUBIR AVATAR CON uploadAvatar
        if (avatar && avatar instanceof File) {
            console.log('📤 Subiendo nuevo avatar con uploadAvatar...');
            
            const result = await uploadAvatar(avatar);
            
            if (result && result.url) {
                avatarUrl = result.url;
                console.log('✅ Avatar subido correctamente:', avatarUrl);
            } else {
                console.warn('⚠️ No se pudo subir el avatar, manteniendo el actual');
            }
        } else {
            console.log('📷 No hay avatar nuevo, manteniendo el actual');
        }
        
        // ✅ CONSTRUIR DATOS A ENVIAR
        const updatedData = {
            fullname: userData.fullname || auth.user.fullname || '',
            mobile: userData.mobile || '',
            address: userData.address || '',
            story: userData.story || '',
            website: userData.website || '',
            avatar: avatarUrl
        };
  
        console.log('📦 Enviando al backend:', {
            ...updatedData,
            avatar: updatedData.avatar ? updatedData.avatar.substring(0, 50) + '...' : 'null'
        });
  
        const res = await patchDataAPI("user", updatedData, auth.token);
      
        if (res.data && (res.data.msg || res.data.success)) {
            
            // ✅ Actualizar auth.user
            const updatedUser = { 
                ...auth.user, 
                ...updatedData,
                avatar: avatarUrl
            };
            
            dispatch({
                type: GLOBALTYPES.AUTH,
                payload: {
                    ...auth,
                    user: updatedUser
                }
            });
  
            // ✅ Actualizar profile.users
            dispatch({
                type: PROFILE_TYPES.UPDATE_PROFILE,
                payload: updatedUser
            });
  
            dispatch({
                type: GLOBALTYPES.ALERT, 
                payload: { success: res.data.msg || 'Profil mis à jour avec succès' }
            });
  
            console.log('✅ Perfil actualizado correctamente');
            return { success: true, user: updatedUser };
        } else {
            throw new Error(res.data?.msg || 'Error al actualizar');
        }
      
    } catch (err) {
        console.error('❌ Error en updateProfileUser:', err);
      
        const errorMsg = err.response?.data?.msg || 
                         err.response?.data?.error ||
                         err.message || 
                         'Erreur lors de la mise à jour';
      
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
// 🟢 DELETE PROFILE USER
// ============================================
// redux/actions/profileAction.js - AÑADIR ESTA FUNCIÓN

// ============================================
// 🗑️ DELETE PROFILE USER - ELIMINAR CUENTA COMPLETA
// ============================================
// redux/actions/profileAction.js

// 🗑️ ELIMINAR PERFIL DE USUARIO COMPLETO (CORREGIDO)
export const deleteProfileUser = (auth) => async (dispatch) => {
    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        
        console.log('🗑️ Iniciando eliminación de cuenta para usuario:', auth.user?._id);
        console.log('📧 Email:', auth.user?.email);
        
        // ✅ CORREGIDO: Usar deleteDataAPI, NO patchDataAPI
        // ✅ CORREGIDO: Usar la ruta correcta '/user/delete-account'
        const res = await deleteDataAPI("delete-account", auth.token);
        
        if (res.data && res.data.success) {
            console.log('✅ Cuenta eliminada exitosamente en el backend');
            console.log('📊 Datos eliminados:', res.data.deletedData || 'No se recibieron detalles');
            
            // ✅ Limpiar localStorage y sessionStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user_following_channels');
            localStorage.removeItem('user_data');
            sessionStorage.clear();
            
            // ✅ Limpiar estado de Redux
            dispatch({
                type: GLOBALTYPES.AUTH,
                payload: {
                    token: '',
                    user: null
                }
            });
            
            // ✅ Resetear otros estados importantes
            dispatch({ type: 'CLEAR_ALL_CHANNELS' });
            dispatch({ type: 'CLEAR_ALL_VIDEOS' });
            dispatch({ type: 'CLEAR_FOLLOWING_CHANNELS' });
            
            // ✅ Mostrar mensaje de éxito
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { 
                    success: res.data.msg || 'Compte supprimé avec succès. Vous allez être redirigé.' 
                }
            });
            
            // ✅ Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
            return { success: true };
        } else {
            throw new Error(res.data?.msg || 'Error al eliminar cuenta');
        }
        
    } catch (err) {
        console.error('❌ Error eliminando perfil:', err);
        console.error('❌ Detalles del error:', err.response?.data);
        
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { 
                error: err.response?.data?.msg || err.message || 'Error al eliminar cuenta' 
            }
        });
        return { success: false, error: err.message };
    } finally {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
};
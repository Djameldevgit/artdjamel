import { GLOBALTYPES } from './globalTypes';
import { getDataAPI, patchDataAPI } from '../../utils/fetchData';

export const PRIVACY_TYPES = {
    GET_PRIVACY: 'GET_PRIVACY',
    UPDATE_PRIVACY: 'UPDATE_PRIVACY',
    LOADING_PRIVACY: 'LOADING_PRIVACY'
}

// actions/privacyAction.js
export const getPrivacySettings = (token) => async (dispatch) => {
    try {
        dispatch({ type: PRIVACY_TYPES.LOADING_PRIVACY, payload: true });
        
        const res = await getDataAPI('privacy', token);
    
        
        dispatch({ 
            type: PRIVACY_TYPES.GET_PRIVACY, 
            payload: res.data.privacySettings || {}
        });
        
    } catch (err) {
        dispatch({ 
            type: GLOBALTYPES.ALERT, 
            payload: { error: err.response?.data?.msg || 'Error al cargar configuración de privacidad' } 
        });
    } finally {
        dispatch({ type: PRIVACY_TYPES.LOADING_PRIVACY, payload: false });
    }
}
export const updatePrivacySettings = (privacySettings, token) => async (dispatch) => {
    try {
        dispatch({ type: PRIVACY_TYPES.LOADING_PRIVACY, payload: true });
        
        // Enviar los campos directamente, no dentro de un objeto privacySettings
        const res = await patchDataAPI('privacy', privacySettings, token);
        
        dispatch({ 
            type: PRIVACY_TYPES.UPDATE_PRIVACY, 
            payload: res.data.privacySettings
        });
        
        dispatch({ 
            type: GLOBALTYPES.ALERT, 
            payload: { success: res.data.msg } 
        });
        
    } catch (err) {
        dispatch({ 
            type: GLOBALTYPES.ALERT, 
            payload: { error: err.response?.data?.msg || 'Error al actualizar configuración' } 
        });
    } finally {
        dispatch({ type: PRIVACY_TYPES.LOADING_PRIVACY, payload: false });
    }
}

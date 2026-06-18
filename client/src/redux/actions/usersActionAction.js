import { GLOBALTYPES } from './globalTypes';
import { imageUpload } from '../../utils/imageUpload';
import { getDataAPI, patchDataAPI, deleteDataAPI, postDataAPI } from '../../utils/fetchData';
 
export const USERS_TYPES_ACTION = {
    LOADING_USERS_ACTION: 'LOADING_USERS_ACTION',
    GET_USERS_ACTION: 'GET_USERS_ACTION',
    UPDATE_USER_ACTION: 'UPDATE_USER_ACTION',
    GET_USER_ACTION: 'GET_USER_ACTION',
  
    GET_ACTIVE_USERS_LAST_24H_ACTION: 'GET_ACTIVE_USERS_LAST_24H_ACTION',  // Acción para usuarios activos en 24h
    GET_ACTIVE_USERS_LAST_3H_ACTION: 'GET_ACTIVE_USERS_LAST_3H_ACTION',    // Acción para usuarios activos en 3h
    GET_TOTAL_USERS_COUNT_ACTION: 'GET_TOTAL_USERS_COUNT_ACTION',
    GET_TOTAL_POSTS_USER_ACTION: 'GET_TOTAL_POSTS_USER_ACTION',
    UPDATE_USER_STATUS_ACTION: 'UPDATE_USER_STATUS_ACTION',
    CREAR_DENUNCIA_ACTION: 'CREAR_DENUNCIA_ACTION',
    GET_DENUNCIAS_ACTION: 'GET_DENUNCIAS_ACTION',

 
 

};

// Acción para obtener la cuenta total de usuarios
export const fetchTotalUsersCount = (token) => async (dispatch) => {
    try {
        const res = await getDataAUSERS_TYPES_ACTIONPI('users/counttotal', token); // Llama al endpoint que cuenta los usuarios
        dispatch({ type: USERS_TYPES_ACTION.GET_TOTAL_USERS_COUNT, payload: res.data.counttotal });
    } catch (error) {
        console.error('Error al obtener el total de usuarios:', error);
    }
};

// Acción para obtener usuarios activos en las últimas 24 horas
export const getActiveUsersLast24h = (token) => async (dispatch) => {
    try {
        const res = await getDataAPI('users/active-last-24h', token);
        dispatch({
            type: USERS_TYPES_ACTION.GET_ACTIVE_USERS_LAST_24H,
            payload: res.data.users
        });
    } catch (error) {
        console.error(error);
    }
};

// Acción para obtener usuarios activos en las últimas 3 horas
export const getActiveUsersLast3h = (token) => async (dispatch) => {
    try {
        const res = await getDataAPI('users/active-last-3h', token);
        dispatch({
            type: USERS_TYPES_ACTION.GET_ACTIVE_USERS_LAST_3H,
            payload: res.data.users
        });
    } catch (error) {
        console.error(error);
    }
};

// Acción para obtener todos los usuarios
export const getUsersAction = (token) => async (dispatch) => {
    try {
        dispatch({ type: USERS_TYPES_ACTION.LOADING_USERS_ACTION, payload: true });
        const res = await getDataAPI(`users/usersaction`, token);
        
        dispatch({
            type: USERS_TYPES_ACTION.GET_USER_ACTION,
            payload: { users: res.data.users, result: res.data.result, page: page + 1 }
        });
        
        dispatch({ type: USERS_TYPES_ACTION.LOADING_USERS_ACTION, payload: false });
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response.data.msg }
        });
    }
};


// Acción para actualizar un usuario
export const updateUser = ({ content, images, auth, status }) => async (dispatch) => {
    let media = [];
    const imgNewUrl = images.filter(img => !img.url);
    const imgOldUrl = images.filter(img => img.url);

    if (status.content === content
        && imgNewUrl.length === 0
        && imgOldUrl.length === status.images.length
    ) return;

    try {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
        if (imgNewUrl.length > 0) media = await imageUpload(imgNewUrl);

        const res = await patchDataAPI(`user/${status._id}`, {
            content, images: [...imgOldUrl, ...media]
        }, auth.token);

        dispatch({ type: USERS_TYPES_ACTION.UPDATE_USER, payload: res.data.newUser });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response.data.msg }
        });
    }
};

// Acción para obtener un usuario por su ID
export const getUser = ({ detailUser, id, auth }) => async (dispatch) => {
    if (detailUser.every(user => user._id !== id)) {
        try {
            const res = await getDataAPI(`user/${id}`, auth.token);
            dispatch({ type: USERS_TYPES_ACTION.GET_USER, payload: res.data.user });
        } catch (err) {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: err.response.data.msg }
            });
        }
    }
};
 
export const deleteUser = ({ user, auth }) => async (dispatch) => {
    try {
   

        const res = await deleteDataAPI(`user/${user._id}`, auth.token);

       
        if (res) {
            dispatch({
                type: USERS_TYPES_ACTION.DELETE_USER,
                payload: user._id,
            });

            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { success: "Usuario eliminado correctamente." },
            });
        } else {
            dispatch({
                type: GLOBALTYPES.ALERT,
                payload: { error: "No se pudo eliminar el usuario." },
            });
        }
    } catch (err) {
        console.error("Error al eliminar usuario:", err); // 🚀 Depuración

        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response?.data?.msg || "Error al eliminar el usuario." },
        });
    }
};



 
 

// Acción para actualizar el estado del usuario (suspender o activar)
export const updateUserStatus = (userId, newStatus, token) => async (dispatch) => {
    try {
        await patchDataAPI(`admin/user/${userId}/status`, { status: newStatus }, token);
        dispatch({
            type: USERS_TYPES_ACTION.UPDATE_USER_STATUS,
            payload: { userId, newStatus },
        });
    } catch (err) {
        dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { error: err.response.data.msg },
        });
    }
};
 
export const createDenuncia = ({ razones, auth, post }) => async (dispatch) => {

    try {
        // Despacha el loading para la acción
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });


        // Aquí usamos el id del post y la información adicional necesaria para la denuncia
        const res = await postDataAPI(`denunciar/${post._id}`, {
            razones,

            usuarioReportante: auth.user._id, // El id del usuario que está denunciando
        }, auth.token);

        console.log("Respuesta de la API:", res);

        // Despacha la acción de alerta con el estado de carga actualizado
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });

        // Despacha la acción para actualizar el estado global con la denuncia creada
        dispatch({
            type: USERS_TYPES_ACTION.CREAR_DENUNCIA,
            payload: res.data,
        });

    } catch (err) {
        console.error('Error al crear la denuncia:', err);

        // Despacha el error si ocurre
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false, error: err.message } });
    }
};


// Acción para obtener las denuncias de un usuario
export const getDenuncias = (user, token) => async (dispatch) => {
    try {
        const res = await getDataAPI(`denunciar/${user.id}`, token); // Asegúrate de que la ruta esté correcta
          dispatch({
            type: USERS_TYPES_ACTION.GET_DENUNCIAS,
            payload: res.data,
        });
    } catch (err) {
        console.error("Error al obtener las denuncias:", err);
    }
};
 
 
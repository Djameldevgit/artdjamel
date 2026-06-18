import { getDataAPI, postDataAPI, patchDataAPI, deleteDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from './globalTypes';
import { imageUpload } from '../../utils/imageUpload';

export const CAROUSEL_TYPES = {
  GET_CAROUSEL_IMAGES: 'GET_CAROUSEL_IMAGES',
  GET_HOME_CAROUSEL: 'GET_HOME_CAROUSEL',
  GET_ALL_CAROUSEL_IMAGES: 'GET_ALL_CAROUSEL_IMAGES',
  CREATE_CAROUSEL_IMAGE: 'CREATE_CAROUSEL_IMAGE',
  UPDATE_CAROUSEL_IMAGE: 'UPDATE_CAROUSEL_IMAGE',
  DELETE_CAROUSEL_IMAGE: 'DELETE_CAROUSEL_IMAGE',
  REORDER_CAROUSEL_IMAGES: 'REORDER_CAROUSEL_IMAGES',
  CAROUSEL_LOADING: 'CAROUSEL_LOADING',
  CAROUSEL_ERROR: 'CAROUSEL_ERROR'
};

// ============ HOME (PÚBLICO) ============
export const getHomeCarousel = () => async (dispatch) => {
  try {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: true });
    const res = await getDataAPI('carousel/home');
    dispatch({ type: CAROUSEL_TYPES.GET_HOME_CAROUSEL, payload: res.data.data });
    return res.data;
  } catch (err) {
    console.error('❌ Error getHomeCarousel:', err);
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_ERROR, payload: err.response?.data?.message || err.message });
  } finally {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: false });
  }
};

// ============ TODAS LAS IMÁGENES (ADMIN) ============
export const getAllCarouselImages = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: true });
    const { auth } = getState();
    const token = auth?.token || auth?.auth?.token;
    const res = await getDataAPI('carousel/admin/all', token);
    dispatch({ type: CAROUSEL_TYPES.GET_ALL_CAROUSEL_IMAGES, payload: res.data.data });
    return res.data;
  } catch (err) {
    console.error('❌ Error getAllCarouselImages:', err);
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_ERROR, payload: err.response?.data?.message || err.message });
  } finally {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: false });
  }
};

// ============ CREAR IMAGEN ============
export const createCarouselImage = (formData, auth) => async (dispatch) => {
  try {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: true });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    if (!formData.title?.trim()) throw new Error('El título es requerido');
    if (!formData.imageFile) throw new Error('Debes seleccionar una imagen');

    let imageData;

    // BUG 2 FIX: imageUpload espera un array de objetos { file } o ya subidos { url, public_id }
    if (formData.imageFile.isExisting) {
      // Imagen ya en Cloudinary — usar directamente sin re-subir
      imageData = {
        url: formData.imageFile.url,
        public_id: formData.imageFile.public_id
      };
    } else {
      // Imagen nueva — imageUpload necesita el File nativo, no el objeto wrapper
      const file = formData.imageFile.file;
      if (!file) throw new Error('Archivo de imagen no válido');

      console.log('📤 Subiendo imagen a Cloudinary...');
      // imageUpload recibe array de Files o de objetos con .file
      const uploaded = await imageUpload([formData.imageFile]);

      if (!uploaded || uploaded.length === 0) throw new Error('Error al subir la imagen');
      imageData = uploaded[0];
    }

    // Verificar que imageData tenga url y public_id
    if (!imageData?.url || !imageData?.public_id) {
      throw new Error('La imagen subida no devolvió url o public_id');
    }

    const dataToSend = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      link: formData.link?.trim() || '',
      linkType: formData.linkType || 'none',
      image: imageData
    };

    const res = await postDataAPI('carousel', dataToSend, auth.token);

    dispatch({ type: CAROUSEL_TYPES.CREATE_CAROUSEL_IMAGE, payload: res.data.data });
    dispatch(getHomeCarousel());
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Imagen creada exitosamente' } });

    return { success: true, data: res.data.data };

  } catch (err) {
    console.error('❌ Error createCarouselImage:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: false });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ============ ACTUALIZAR IMAGEN ============
export const updateCarouselImage = (id, formData, auth) => async (dispatch) => {
  try {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: true });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    const dataToSend = {
      title: formData.title?.trim(),
      description: formData.description?.trim() ?? '',
      link: formData.link?.trim() ?? '',
      linkType: formData.linkType
    };

    // Limpiar undefined
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === undefined) delete dataToSend[key];
    });

    // BUG 3 FIX: manejar los tres casos posibles de imagen en edición
    if (formData.imageFile) {
      if (formData.imageFile.isExisting) {
        // La imagen no cambió — enviar los datos existentes tal cual
        dataToSend.image = {
          url: formData.imageFile.url,
          public_id: formData.imageFile.public_id
        };
      } else if (formData.imageFile.file) {
        // Imagen nueva seleccionada — subir a Cloudinary
        console.log('📤 Subiendo nueva imagen en edición...');
        const uploaded = await imageUpload([formData.imageFile]);
        if (uploaded && uploaded.length > 0) {
          dataToSend.image = uploaded[0];
        }
      }
      // Si imageFile existe pero no tiene ni isExisting ni file, no hacer nada
    }

    const res = await patchDataAPI(`carousel/${id}`, dataToSend, auth.token);

    dispatch({ type: CAROUSEL_TYPES.UPDATE_CAROUSEL_IMAGE, payload: res.data.data });
    dispatch(getHomeCarousel());
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Imagen actualizada' } });

    return { success: true, data: res.data.data };

  } catch (err) {
    console.error('❌ Error updateCarouselImage:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: false });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};

// ============ ELIMINAR IMAGEN ============
export const deleteCarouselImage = (id, auth) => async (dispatch) => {
  try {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: true });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });

    await deleteDataAPI(`carousel/${id}`, auth.token);

    dispatch({ type: CAROUSEL_TYPES.DELETE_CAROUSEL_IMAGE, payload: id });
    dispatch(getHomeCarousel());
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Imagen eliminada' } });

    return { success: true };

  } catch (err) {
    console.error('❌ Error deleteCarouselImage:', err);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.response?.data?.message || err.message } });
    return { success: false, error: err.message };
  } finally {
    dispatch({ type: CAROUSEL_TYPES.CAROUSEL_LOADING, payload: false });
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
  }
};
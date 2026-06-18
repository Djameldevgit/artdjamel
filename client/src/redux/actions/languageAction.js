import axios from 'axios';

export const CHANGE_LANGUAGE = {
  SET: 'SET_LANGUAGE'
};

/**
 * Cambia el idioma si es diferente al actual.
 * @param {string} langCode - Código del idioma ('en', 'fr', 'ar', etc.)
 */
export const changeLanguage = (langCode) => async (dispatch, getState) => {
  const currentLang = getState().languageReducer.language;

  if (langCode === currentLang) {
    // ✅ Idioma ya está establecido, no se hace petición
    return;
  }

  try {
    const res = await axios.put(`/api/language/${langCode}`, { language: langCode });

    dispatch({
      type: CHANGE_LANGUAGE.SET,
      payload: {
        language: langCode,
        res
      }
    });
  } catch (error) {
    console.error('Error al cambiar idioma:', error);
  }
};

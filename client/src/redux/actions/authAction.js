// redux/actions/authAction.js
import { GLOBALTYPES } from './globalTypes'
import { postDataAPI } from '../../utils/fetchData'
import valid from '../../utils/valid'

// ============================================
// LOGIN (email/password)
// ============================================
// redux/actions/authAction.js - ACTUALIZADO

export const login = (data) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('login', data)

    // ✅ GUARDAR TOKEN EN LOCALSTORAGE TAMBIÉN
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('firstLogin', true)

    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: res.data.access_token,
        user: res.data.user
      }
    })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur de connexion' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

export const register = (data, t, lang) => async (dispatch) => {
  const check = valid(data, t, lang)
  if (check.errLength > 0) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: check.errMsg })
    return
  }
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('register', data)

    // ✅ GUARDAR TOKEN EN LOCALSTORAGE TAMBIÉN
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('firstLogin', true)

    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: res.data.access_token,
        user: res.data.user
      }
    })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur lors de l\'inscription' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

export const socialLogin = (data, platform) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const endpoint = platform === 'google' ? 'google_login' : 'facebook_login'
    await postDataAPI(endpoint, data)

    const refresh = await postDataAPI('refresh_token')
    
    // ✅ GUARDAR TOKEN EN LOCALSTORAGE TAMBIÉN
    localStorage.setItem('token', refresh.data.access_token)
    localStorage.setItem('firstLogin', true)

    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: refresh.data.access_token,
        user: refresh.data.user,
      },
    })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Connexion réussie' } })

    if (typeof window !== 'undefined') window.location.href = '/'
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur de connexion sociale' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

export const refreshToken = () => async (dispatch) => {
  const firstLogin = localStorage.getItem('firstLogin')
  if (firstLogin) {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    try {
      const res = await postDataAPI('refresh_token')
      
      // ✅ ACTUALIZAR TOKEN EN LOCALSTORAGE
      localStorage.setItem('token', res.data.access_token)

      dispatch({
        type: GLOBALTYPES.AUTH,
        payload: {
          token: res.data.access_token,
          user: res.data.user
        }
      })
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Session restaurée' } })
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response?.data?.msg || 'Session expirée' }
      })
    } finally {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
    }
  }
}

export const logout = () => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    // ✅ LIMPIAR LOCALSTORAGE
    localStorage.removeItem('firstLogin')
    localStorage.removeItem('token')
    localStorage.removeItem('pendingPayment')
    
    await postDataAPI('logout')
    window.location.href = '/'
  } catch (err) {
    localStorage.removeItem('firstLogin')
    localStorage.removeItem('token')
    window.location.href = '/'
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}
// ============================================
// SOCIAL LOGIN (Google / Facebook)
// ============================================
 
// ============================================
// REFRESH TOKEN
// ============================================
 

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('forgot', { email })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur lors de la réinitialisation' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = (password, token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('reset', { password }, token)
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur lors de la réinitialisation' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

// ============================================
// ACTIVATION ACCOUNT (after email click)
// ============================================
export const activationAccount = (activation_token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    await postDataAPI('activate', { activation_token })

    const refresh = await postDataAPI('refresh_token')
    dispatch({
      type: GLOBALTYPES.AUTH,
      payload: {
        token: refresh.data.access_token,
        user: refresh.data.user,
      },
    })
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Compte activé avec succès' } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur d\'activation' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

// ============================================
// SEND ACTIVATION EMAIL (resend)
// ============================================
export const sendActivationEmail = (token) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('send_activation_email', null, token)
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Impossible d\'envoyer l\'email' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

// ============================================
// SEND ADMIN EMAIL (mass email)
// ============================================
export const sendAdminEmail = ({ recipients, subject, message, url = '#', token, onSuccess }) => async (dispatch) => {
  try {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } })
    const res = await postDataAPI('send-user-emails', { recipients, subject, message, url }, token)
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } })
    if (onSuccess) onSuccess()
  } catch (err) {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { error: err.response?.data?.msg || 'Erreur d\'envoi des emails' }
    })
  } finally {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } })
  }
}

// ============================================
// LOGOUT
// ============================================
 
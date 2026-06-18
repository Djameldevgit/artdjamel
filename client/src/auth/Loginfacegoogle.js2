import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { socialLogin } from '../redux/actions/authAction';
import { showErrMsg, showSuccessMsg } from '../utils/notification/Notification';
import { useTranslation } from 'react-i18next';

const Loginfacegoogle = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { languageReducer } = useSelector(state => state);
  const lang = languageReducer.language || 'en';
  
  const { t, i18n } = useTranslation('auth');
  const [msg, setMsg] = useState({ err: '', success: '' });

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // ✅ GOOGLE SIGN-IN TRADICIONAL (Popup)
  const handleGoogleLogin = () => {
    const client = window.google?.accounts?.oauth2?.initCodeClient({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: handleGoogleResponse,
    });
    
    if (client) {
      client.requestCode();
    } else {
      setMsg({ err: 'Google Sign-In no disponible', success: '' });
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      // Aquí procesas el código de autorización
      await dispatch(socialLogin({ code: response.code }, 'google'));
      setMsg({ err: '', success: t('login_success_google') });
      setTimeout(() => history.push('/'), 1000);
    } catch (err) {
      setMsg({ err: t('login_error_google'), success: '' });
    }
  };

  // ✅ CARGAR GOOGLE API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleFacebookResponse = async (response) => {
    try {
      const { accessToken, userID } = response;
      if (!accessToken || !userID) {
        setMsg({ err: t('auth_error_facebook'), success: '' });
        return;
      }
      await dispatch(socialLogin({ accessToken, userID }, 'facebook'));
      setMsg({ err: '', success: t('login_success_facebook') });
      setTimeout(() => history.push('/'), 1000);
    } catch (err) {
      setMsg({ err: t('login_error_facebook'), success: '' });
    }
  };

  return (
    <div className="login_page">
      {msg.err && showErrMsg(msg.err)}
      {msg.success && showSuccessMsg(msg.success)}

      {/* ✅ BOTÓN GOOGLE COMPLETAMENTE PERSONALIZADO */}
      <div className="social mb-3">
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            height: '45px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#357ae8';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4285f4';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.25)';
          }}
        >
          <div style={{
            width: '18px',
            height: '18px',
            backgroundColor: 'white',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" 
              alt="Google" 
              width="14" 
              height="14" 
            />
          </div>
          {t('login_with_google')}
        </button>
      </div>

      {/* Facebook */}
      <div className="social">
        <FacebookLogin
          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          render={renderProps => (
            <button
              className="btn btn-primary w-100"
              onClick={renderProps.onClick}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                height: '45px'
              }}
            >
              <img src="/facebook-icon.png" alt="Facebook" width="20" height="20" />
              {t('login_with_facebook')}
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default Loginfacegoogle;
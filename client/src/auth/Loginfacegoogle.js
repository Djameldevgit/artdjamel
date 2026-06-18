import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from '@react-oauth/google';
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
  
  // Refs para evitar propagación
  const facebookContainerRef = useRef(null);
  const googleContainerRef = useRef(null);

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // Prevenir propagación de eventos en los contenedores
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // ============ FACEBOOK LOGIN ============
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

  // ============ GOOGLE LOGIN ============
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        setMsg({ err: t('auth_error_google'), success: '' });
        return;
      }
      await dispatch(socialLogin({ credential }, 'google'));
      setMsg({ err: '', success: t('login_success_google') });
      setTimeout(() => history.push('/'), 1000);
    } catch (err) {
      setMsg({ err: t('login_error_google'), success: '' });
    }
  };

  const handleGoogleError = () => {
    setMsg({ err: t('login_error_google'), success: '' });
  };

  return (
    <div className="social-login-container" onClick={stopPropagation}>
      {msg.err && showErrMsg(msg.err)}
      {msg.success && showSuccessMsg(msg.success)}

      {/* Botón Facebook */}
      <div 
        ref={facebookContainerRef}
        className="social-login-wrapper"
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <FacebookLogin
          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
          autoLoad={false}
          callback={handleFacebookResponse}
          render={renderProps => (
            <button
              className="btn btn-facebook w-100"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                renderProps.onClick();
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                height: '48px',
                borderRadius: '12px',
                background: '#1877f2',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#166fe5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1877f2'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
              {t('login_with_facebook') || 'Se connecter avec Facebook'}
            </button>
          )}
        />
      </div>

      {/* Botón Google */}
      <div 
        ref={googleContainerRef}
        className="social-login-wrapper mt-3"
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
          locale={lang === 'fr' ? 'fr' : 'en'}
        />
      </div>

      <style>{`
        .social-login-container {
          width: 100%;
          pointer-events: auto;
        }
        .social-login-wrapper {
          width: 100%;
          pointer-events: auto;
        }
        .social-login-wrapper > div {
          width: 100% !important;
        }
        .btn-facebook {
          transition: all 0.2s ease;
        }
        .btn-facebook:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default Loginfacegoogle;
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendActivationEmail } from '../redux/actions/authAction';
import { useTranslation } from 'react-i18next';

const ActivateButton = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('cardbodycarousel');
  const lang = languageReducer.language || 'fr';

  const [sent, setSent] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Verificar estado de activación
  useEffect(() => {
    if (user) {
      setIsActive(user.isVerified);
    }
  }, [user]);

  const handleActivate = () => {
    if (isActive) return;

    dispatch(sendActivationEmail(token));
    setSent(true);

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Ocultar si está activado o no hay usuario
  if (isActive || !user || !token) return null;

  return (
    <div className="text-center mt-4 animate-fade-in">
      <div className={`font-semibold mb-2 ${sent ? 'text-green-600' : 'text-red-600'}`}>
        {sent ? (
          <>
            <span className="text-green-500">✓</span> {t('enviadoExito', { lng: lang })}
          </>
        ) : (
          <>
            <span>❌</span> {t('noVerificada', { lng: lang })}
          </>
        )}
      </div>
      
      {!sent && (
        <button
          onClick={handleActivate}
          className={`mt-2 px-4 py-2 text-white rounded transition duration-300 ${
            isActive 
              ? 'hidden'
              : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
          }`}
          disabled={isActive}
        >
          {t('activar', { lng: lang })}
        </button>
      )}
    </div>
  );
};

export default ActivateButton;
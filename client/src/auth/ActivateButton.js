import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendActivationEmail } from '../redux/actions/authAction';
import { useTranslation } from 'react-i18next';

const ActivateButton = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const { languageReducer } = useSelector(state => state);

  const { t } = useTranslation('cardbodycarousel');
  const lang = languageReducer.language || 'en';

  const [sent, setSent] = useState(false);

  // Si no hay usuario o ya está verificado o ya se envió el email → no mostrar
  const hideBlock = !user || !token || user?.isVerified;

  const handleActivate = () => {
    if (user?.isVerified) return;

    dispatch(sendActivationEmail(token));
    setSent(true);

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (hideBlock) return null;

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center text-red-600 font-semibold mb-1">
        <i className="fas fa-user-times mr-2"></i>
        {t('noVerificada', { lng: lang })}
      </div>

      <button
        onClick={handleActivate}
        className="px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded text-sm transition duration-300"
      >
        {t('activar', { lng: lang })}
      </button>

      {sent && (
        <div className="text-yellow-600 text-xs mt-2">
          📩 {t('revisaTuCorreo', { lng: lang })}
        </div>
      )}
    </div>
  );
};

export default ActivateButton;

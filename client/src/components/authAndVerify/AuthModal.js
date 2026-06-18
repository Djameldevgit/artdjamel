import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const AuthModal = ({ show, onClose, closeOnOverlayClick = true }) => {
  const history = useHistory();
  const { t } = useTranslation('authmodal');
  const { languageReducer } = useSelector((state) => state);
  const lang = languageReducer?.language || 'en';

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleLogin = () => {
    history.push('/login');
    onClose();
  };

  const handleRegister = () => {
    history.push('/register');
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop={closeOnOverlayClick ? true : 'static'}
      keyboard={true}
      centered
      aria-labelledby="auth-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="auth-modal-title" className="w-100 text-center">
          {t('authenticationRequired', { lng: lang })}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4">
        <p className="text-muted mb-4">
          {t('pleaseLoginToContinue', { lng: lang })}
        </p>

        <div className="d-grid gap-2">
          <Button 
            variant="primary"
            size="lg"
            onClick={handleLogin}
          >
            {t('login', { lng: lang })}
          </Button>

          <Button 
            variant="success"
            size="lg"
            onClick={handleRegister}
          >
            {t('register', { lng: lang })}
          </Button>

          <Button 
            variant="secondary"
            size="lg"
            onClick={onClose}
          >
            {t('close', { lng: lang })}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
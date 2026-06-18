import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ActivateButton from '../../auth/ActivateButton';

const VerifyModal = ({ show, onClose, closeOnOverlayClick = true }) => {
  const { t } = useTranslation('authmodal');
  const { languageReducer } = useSelector(state => state);
  const lang = languageReducer?.language || 'es';

  useEffect(() => {
    if (show) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop={closeOnOverlayClick ? true : 'static'}
      keyboard={true}
      centered
      aria-labelledby="verify-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="verify-modal-title" className="w-100 text-center">
          {t('verificationRequired', { lng: lang })}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4">
        <p className="text-muted mb-4" style={{ lineHeight: '1.5' }}>
          {t('verificationMessage', { lng: lang })}
        </p>

        <div className="d-flex justify-content-center mb-3">
          <ActivateButton onClose={onClose} />
        </div>

        <p className="text-muted small fst-italic mb-0">
          {t('verificationNote', { lng: lang })}
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default VerifyModal;
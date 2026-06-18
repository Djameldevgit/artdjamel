import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const DesactivateModal = ({ show, onClose, closeOnOverlayClick = true }) => {
  const { t } = useTranslation('authmodal');
  const { auth, languageReducer } = useSelector(state => state);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const lang = languageReducer?.language || 'es';

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      // Reset estados al abrir
      setError('');
      setSuccess('');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Reset message cuando se cierra el modal
  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSendEmail = async () => {
    if (!message.trim()) {
      setError(t('messageRequired', { lng: lang }) || 'Debes escribir un mensaje.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/contact-activation-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth.token
        },
        body: JSON.stringify({
          message,
          lang
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(t('messageSentSuccess', { lng: lang }) || 'Correo enviado con éxito.');
        setMessage('');
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(data.msg || 'Error al enviar el mensaje.');
      }
    } catch (err) {
      console.error(err);
      setError(t('requestError', { lng: lang }) || 'Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop={closeOnOverlayClick ? true : 'static'}
      keyboard={true}
      centered
      size="lg"
      aria-labelledby="activation-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="activation-modal-title" className="w-100 text-center">
          {t('activationRequest', { lng: lang })}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-center text-muted mb-4">
          {t('activationMessage', { lng: lang })}
        </p>

        {/* Alertas de error y éxito */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            {success}
          </Alert>
        )}

        <Form>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label className="fw-bold">
              {t('userEmail', { lng: lang })}:
            </Form.Label>
            <Form.Control
              type="email"
              value={auth.user?.email || ''}
              readOnly
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="activationMessage">
            <Form.Label className="fw-bold">
              {t('message', { lng: lang })}:
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder', { lng: lang })}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <Button 
          variant="success"
          onClick={handleSendEmail}
          disabled={loading || !message.trim()}
          style={{ minWidth: '120px' }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {t('sending', { lng: lang })}
            </>
          ) : (
            t('requestActivation', { lng: lang })
          )}
        </Button>
        
        <Button 
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
          style={{ minWidth: '80px' }}
        >
          {t('close', { lng: lang })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DesactivateModal;
// LanguageModal.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import * as languageActions from '../../redux/actions/languageAction';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const LanguageModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('language');
  const [cookies, setCookie] = useCookies(['language']);
  const lang = languageReducer?.language || 'fr';

  const handleLanguageChange = (language) => {
    if (language === lang) {
      onHide();
      return;
    }

    dispatch(languageActions.changeLanguage(language));
    setCookie('language', language, { path: '/' });
    onHide();
  };

  const flagPath = (lang) => `/flags/${lang}.png`;

  const languageOptions = [
    { code: 'ar', name: t('language.ar', { lng: lang }), flag: '🇸🇦' },
    { code: 'fr', name: t('language.fr', { lng: lang }), flag: '🇫🇷' },
 
    { code: 'kab', name: t('language.kab', { lng: lang }), flag: '🇩🇿' },
  
  ];

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-6">{t('selectLanguage', 'Seleccionar Idioma')}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        <Row className="g-2">
          {languageOptions.map((option) => (
            <Col xs={6} key={option.code}>
              <Button
                variant={lang === option.code ? "primary" : "outline-secondary"}
                className="w-100 d-flex align-items-center justify-content-start py-2"
                onClick={() => handleLanguageChange(option.code)}
                style={{ fontSize: '0.9rem' }}
              >
                <span className="me-2" style={{ fontSize: '1.2rem' }}>{option.flag}</span>
                <span>{option.name}</span>
              </Button>
            </Col>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default LanguageModal;
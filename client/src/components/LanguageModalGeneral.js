import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';
import * as languageActions from '../redux/actions/languageAction';

export default function LanguageModalGeneral() {
  const dispatch = useDispatch();
  const { auth, languageReducer } = useSelector(state => state);
  const { t } = useTranslation('language');
  const [cookies, setCookie] = useCookies(['language']);
  const lang = languageReducer?.language || cookies.language || 'fr';

  const [show, setShow] = useState(false);

  const handleLanguageChange = useCallback((language) => {
    setShow(false);
    localStorage.setItem('seenLanguageModal', 'true');
    setCookie('languageSelected', true, { path: '/', maxAge: 31536000 });

    if (language !== lang) {
      dispatch(languageActions.changeLanguage(language));
      setCookie('language', language, { path: '/' });
    }
  }, [dispatch, setCookie, lang]);

  useEffect(() => {
    const defaultLanguage = cookies.language || 'fr';
    if (defaultLanguage !== languageReducer?.language) {
      dispatch(languageActions.changeLanguage(defaultLanguage));
    }
  }, [cookies.language, languageReducer?.language, dispatch]);

  useEffect(() => {
    if (!auth.token) {
      const seenBefore = localStorage.getItem('seenLanguageModal');
      if (!seenBefore) {
        setShow(true);
      }
    }
  }, [auth.token]);

  const flagPath = (lang) => `/flags/${lang}.png`;
  const flagStyle = { width: '40px', height: '28px', borderRadius: '4px' };

  const languages = [
    { code: 'ar', name: t('language.ar', { lng: lang }) },
    { code: 'fr', name: t('language.fr', { lng: lang }) },
  
    { code: 'ru', name: t('language.ru', { lng: lang }) },
 
  ];

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header>
    
           <Modal.Title style={{ fontWeight: 'bold', fontSize: '1.5rem', width: '100%', textAlign: 'center' }}>
          🌍 {t('Select the language')}
        </Modal.Title>
    
       
       
      </Modal.Header>

      <Modal.Body>
        <Row className="g-3 text-center">
          {languages.map((l) => (
            <Col key={l.code} xs={6} md={4}>
              <Card
                className="h-100 shadow-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => handleLanguageChange(l.code)}
              >
                <Card.Body>
                  <img src={flagPath(l.code)} alt={l.code} style={flagStyle} />
                  <div style={{   fontWeight: '500' }}>{l.name}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={() => setShow(false)}>
          {t('Cerrar')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

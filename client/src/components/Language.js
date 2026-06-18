import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import * as languageActions from '../redux/actions/languageAction';
import { Dropdown, ButtonGroup, Container, Row, Col } from 'react-bootstrap';

const Language = () => {
  const dispatch = useDispatch();
  const { languageReducer } = useSelector(state => state);
  const { t } = useTranslation('language');
  const [cookies, setCookie] = useCookies(['language']);
  const lang = languageReducer?.language || 'fr';

  const handleLanguageChange = useCallback((language) => {
    if (language === lang) return;

    dispatch(languageActions.changeLanguage(language));
    setCookie('language', language, { path: '/' });
  }, [dispatch, setCookie, lang]);

  useEffect(() => {
    const defaultLanguage = cookies.language || 'fr';
    if (defaultLanguage !== languageReducer?.language) {
      handleLanguageChange(defaultLanguage);
    }
  }, [cookies.language, languageReducer?.language, handleLanguageChange]);

  const flagPath = (lang) => `/flags/${lang}.png`;

  const flagStyle = {
    width: '20px',
    height: '14px',
    objectFit: 'cover',
    marginRight: '8px',
    borderRadius: '2px',
    verticalAlign: 'middle'
  };

  const languageNames = {
 
    fr: t('language.fr', { lng: lang }),
    ar: t('language.ar', { lng: lang }),
   
  
  };

  return (
    <div className="d-block d-md-none" style={{
      width: '100%',
      padding: 0,
      margin: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1040,
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* USANDO REACT BOOTSTRAP GRID SYSTEM */}
      <Container fluid className="px-4">
        <Row className="align-items-center" style={{ minHeight: '60px' }}>
          {/* TÍTULO DE LA APP - IZQUIERDA */}
          <Col xs={6} className="ps-0">
            <a href="/" style={{ textDecoration: 'none' }}>
              <h3 style={{ 
 fontFamily: "'Playfair Display', serif", // Fuente elegante

                margin: 0, 
                fontSize: '1.3rem', 
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '1.2'
              }}>
                {t('appName', { lng: lang })}
              </h3>
            </a>
          </Col>

          {/* SELECTOR DE IDIOMA - DERECHA */}
          <Col xs={6} className="pe-0">
            <div className="d-flex justify-content-end">
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle 
                  variant="outline-secondary" 
                  id="dropdown-language"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    minWidth: '120px',
                    maxWidth: '140px'
                  }}
                >
                  <img src={flagPath(lang)} alt="flag" style={flagStyle} />
                  <span style={{ marginLeft: '5px', fontSize: '0.85rem' }}>
                    {languageNames[lang]}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ minWidth: '140px' }}>
                  {['ar', 'fr'].map((langCode) => (
                    <Dropdown.Item 
                      key={langCode} 
                      onClick={() => handleLanguageChange(langCode)}
                      style={{ 
                        fontSize: '0.85rem',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <img src={flagPath(langCode)} alt={`${langCode} flag`} style={flagStyle} />
                      {languageNames[langCode]}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Language;
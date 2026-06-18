import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import * as languageActions from '../redux/actions/languageAction';
import { ButtonGroup, Button } from 'react-bootstrap';

const LanguageSelectorandroid = ({ isMobile = false }) => {
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
    borderRadius: '2px'
  };

  const languageNames = {
    fr: t('language.fr', { lng: lang }),
    ar: t('language.ar', { lng: lang }),
  };

  // 🔥 VERSIÓN CON REACT BOOTSTRAP - MEJOR ESTILADO
  return (
    <ButtonGroup size="sm" style={{ 
      width: '100%',
      display: 'flex',
      gap: '0'
    }}>
      {['fr', 'ar'].map((langCode, index) => (
        <Button
          key={langCode}
          variant={lang === langCode ? "primary" : "outline-primary"}
          onClick={() => handleLanguageChange(langCode)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 8px',
            fontSize: '0.8rem',
            fontWeight: lang === langCode ? '600' : '400',
            // Estilos para bordes redondeados solo en los extremos
            borderTopLeftRadius: index === 0 ? '6px' : '0',
            borderBottomLeftRadius: index === 0 ? '6px' : '0',
            borderTopRightRadius: index === 1 ? '6px' : '0',
            borderBottomRightRadius: index === 1 ? '6px' : '0',
            // Eliminar el borde doble entre botones
            marginLeft: index > 0 ? '-1px' : '0',
            border: '1px solid #007bff',
            minWidth: 'auto'
          }}
        >
          <img 
            src={flagPath(langCode)} 
            alt={`${langCode} flag`} 
            style={{
              ...flagStyle,
              filter: lang === langCode ? 'brightness(0) invert(1)' : 'none'
            }} 
          />
          <span>{languageNames[langCode]}</span>
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default LanguageSelectorandroid;
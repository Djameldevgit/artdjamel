// components/LanguageSelector.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'react-bootstrap-icons';

const Language  = ({ variant = 'drawer', onLanguageChange }) => {
  // ✅ Cambiar idioma por defecto a ÁRABE para probar
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('selectedLang');
    return saved || 'ar'; // ✅ ÁRABE por defecto
  });
  const [isOpen, setIsOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [forceTranslate, setForceTranslate] = useState(false);

  // Idiomas soportados (solo 3)
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // Función para verificar si Google Translate está listo
  const isGoogleTranslateReady = () => {
    return document.querySelector('.goog-te-combo') !== null;
  };

  // Función para forzar la traducción
  const forceTranslatePage = (targetLang) => {
    console.log(`🌐 Forzando traducción a: ${targetLang}`);
    
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = targetLang;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      // También intentar con el evento de Google
      if (window.google && window.google.translate) {
        const frame = document.querySelector('.goog-te-banner-frame');
        if (frame && frame.contentWindow) {
          try {
            frame.contentWindow.postMessage({ event: 'translate', language: targetLang }, '*');
          } catch(e) {}
        }
      }
      
      return true;
    }
    return false;
  };

  // Función para traducir la página con reintentos
  const translatePage = (targetLang, retries = 0) => {
    setIsTranslating(true);
    console.log(`🔄 Intentando traducir a ${targetLang} (intento ${retries + 1})`);
    
    try {
      const success = forceTranslatePage(targetLang);
      
      if (success) {
        setTimeout(() => {
          setIsTranslating(false);
          setCurrentLang(targetLang);
          localStorage.setItem('selectedLang', targetLang);
          
          // Aplicar RTL para árabe
          if (targetLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.style.direction = 'rtl';
            document.body.classList.add('rtl-mode');
          } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.style.direction = 'ltr';
            document.body.classList.remove('rtl-mode');
          }
          
          console.log(`✅ Traducción completada a ${targetLang}`);
          
          // Disparar evento personalizado
          const event = new CustomEvent('languageChanged', {
            detail: { language: targetLang }
          });
          document.dispatchEvent(event);
          
          if (onLanguageChange) onLanguageChange(targetLang);
          setIsOpen(false);
        }, 800);
      } else if (retries < 15) {
        // Reintentar hasta 15 veces
        setTimeout(() => translatePage(targetLang, retries + 1), 500);
      } else {
        console.error('❌ No se pudo traducir después de 15 intentos');
        setIsTranslating(false);
        
        // Fallback: recargar la página con parámetro
        window.location.href = `${window.location.pathname}?lang=${targetLang}`;
      }
    } catch (error) {
      console.error('Error traduciendo:', error);
      setIsTranslating(false);
    }
  };

  // Resetear traducción a francés
  const resetTranslation = () => {
    translatePage('fr');
  };

  // Cargar script de Google Translate
  useEffect(() => {
    if (document.querySelector('#google-translate-script')) {
      setScriptLoaded(true);
      // Si el script ya está cargado y tenemos idioma guardado, traducir
      const savedLang = localStorage.getItem('selectedLang');
      if (savedLang && savedLang !== 'fr') {
        setTimeout(() => translatePage(savedLang), 500);
      } else if (currentLang === 'ar') {
        // Si el idioma por defecto es árabe, traducir
        setTimeout(() => translatePage('ar'), 500);
      }
      return;
    }

    // Crear elemento oculto para Google Translate
    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.cssText = 'display: none; visibility: hidden; height: 0; width: 0;';
      document.body.appendChild(translateElement);
    }

    // Función de callback
    window.googleTranslateElementInit = () => {
      try {
        console.log('📦 Inicializando Google Translate...');
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,ar',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
        
        setScriptLoaded(true);
        console.log('✅ Google Translate inicializado correctamente');
        
        // Esperar a que el DOM se actualice
        setTimeout(() => {
          // Verificar si el selector está disponible
          if (isGoogleTranslateReady()) {
            console.log('✅ Selector de Google Translate encontrado');
            
            // Aplicar idioma guardado o árabe por defecto
            const savedLang = localStorage.getItem('selectedLang');
            if (savedLang && savedLang !== 'fr') {
              translatePage(savedLang);
            } else if (currentLang === 'ar') {
              translatePage('ar');
            }
          } else {
            console.warn('⚠️ Selector de Google Translate no encontrado');
          }
        }, 1000);
      } catch (error) {
        console.error('Error inicializando Google Translate:', error);
        setScriptLoaded(true);
      }
    };

    // Cargar script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      console.log('📦 Script de Google Translate cargado');
    };
    script.onerror = () => {
      console.error('Error cargando script de Google Translate');
      setScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (window.googleTranslateElementInit) {
        window.googleTranslateElementInit = null;
      }
    };
  }, []);

  // Efecto para forzar traducción cuando cambia currentLang
  useEffect(() => {
    if (scriptLoaded && forceTranslate && currentLang !== 'fr') {
      translatePage(currentLang);
      setForceTranslate(false);
    }
  }, [scriptLoaded, forceTranslate, currentLang]);

  // Ocultar elementos no deseados de Google Translate
  useEffect(() => {
    const hideGoogleElements = () => {
      const elements = document.querySelectorAll(
        '.goog-te-banner-frame, .goog-te-menu-frame, .goog-te-gadget, ' +
        '.goog-te-balloon-frame, .goog-te-banner, .skiptranslate'
      );
      elements.forEach(el => {
        if (el) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });
      
      // Eliminar estilos que causan problemas
      const style = document.getElementById('goog-gt-tt');
      if (style) style.remove();
      
      // Ajustar body
      document.body.style.top = '0px';
      document.body.style.position = 'relative';
    };
    
    const interval = setInterval(hideGoogleElements, 500);
    return () => clearInterval(interval);
  }, []);

  // Aplicar RTL inicial si el idioma es árabe
  useEffect(() => {
    if (currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.style.direction = 'rtl';
      document.body.classList.add('rtl-mode');
    }
  }, []);

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[2]; // Árabe por defecto

  // Estilos para variant='drawer'
  if (variant === 'drawer') {
    return (
      <div style={{
        margin: '16px',
        padding: '12px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Globe size={14} />
            <span>Langue / اللغة</span>
            {currentLang !== 'fr' && (
              <span className="ms-1 badge bg-success" style={{ fontSize: '0.6rem' }}>
                {currentLang === 'ar' ? 'العربية' : 'English'}
              </span>
            )}
          </div>
          {isTranslating && (
            <div className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', color: '#667eea' }} />
          )}
        </div>
        
        {/* Botón selector estilo dropdown */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1f2937' }}>
              {currentLanguage.name}
            </span>
          </div>
          <ChevronDown size={14} style={{ color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        
        {/* Dropdown de idiomas */}
        {isOpen && (
          <div style={{
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {languages.map(lang => {
              const isActive = currentLang === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => translatePage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: isActive ? '#667eea10' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '600' : '400',
                      color: isActive ? '#667eea' : '#374151'
                    }}>
                      {lang.name}
                    </span>
                  </div>
                  {isActive && <Check size={14} color="#10b981" />}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Botón reset a francés */}
        {currentLang !== 'fr' && (
          <div
            onClick={resetTranslation}
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#fee2e2',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '500'
            }}
          >
            🔄 Afficher l'original (Français)
          </div>
        )}
      </div>
    );
  }

  // Versión compacta para Navbar
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '20px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          color: 'white'
        }}
        disabled={isTranslating}
      >
        <Globe size={14} />
        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>
          {currentLanguage.flag}
        </span>
        <ChevronDown size={10} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            zIndex: 1000,
            minWidth: '140px'
          }}
        >
          {languages.map(lang => (
            <div
              key={lang.code}
              onClick={() => translatePage(lang.code)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background 0.2s',
                background: currentLang === lang.code ? '#667eea15' : 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentLang === lang.code ? '#667eea15' : 'transparent'}
            >
              <span>{lang.flag}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: currentLang === lang.code ? '600' : '400' }}>
                {lang.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Language ;
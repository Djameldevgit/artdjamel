// components/NativeTranslate.js - Versión con selector de idiomas
import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Badge } from 'react-bootstrap';
import { Translate, Globe, Check, X } from 'react-bootstrap-icons';

const NativeTranslate = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [showBanner, setShowBanner] = useState(true);
  const [browserLang, setBrowserLang] = useState(null);

  // Idiomas soportados
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', default: true },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  // Detectar idioma del navegador
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const navLang = navigator.language || navigator.userLanguage;
      const shortLang = navLang.split('-')[0];
      
      const found = languages.find(l => 
        l.code === navLang || l.code === shortLang
      );
      
      if (found && found.code !== 'fr') {
        setBrowserLang(found);
      }
    };
    
    detectBrowserLanguage();
    
    // Recuperar idioma guardado
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
      setCurrentLang(savedLang);
      if (savedLang !== 'fr') {
        applyTranslation(savedLang);
      }
    }
  }, []);

  // Aplicar traducción usando Google Translate API (sin mostrar UI)
  const applyTranslation = (targetLang) => {
    setIsTranslating(true);
    
    // Verificar si el script de Google Translate está cargado
    const checkAndTranslate = () => {
      const selectElement = document.querySelector('.goog-te-combo');
      
      if (selectElement) {
        selectElement.value = targetLang;
        selectElement.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          setIsTranslating(false);
          setCurrentLang(targetLang);
          localStorage.setItem('selectedLang', targetLang);
          
          // Aplicar RTL para árabe
          if (targetLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
          } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
          }
        }, 1000);
      } else {
        // Si el selector no está disponible, intentar de nuevo
        setTimeout(checkAndTranslate, 500);
      }
    };
    
    checkAndTranslate();
  };

  // Resetear traducción
  const resetTranslation = () => {
    applyTranslation('fr');
  };

  // Ocultar banner
  const hideBanner = () => {
    setShowBanner(false);
  };

  // Cargar script de Google Translate (oculto)
  useEffect(() => {
    // Verificar si ya existe
    if (document.querySelector('#google-translate-script')) {
      return;
    }

    // Crear elemento oculto para Google Translate
    const translateElement = document.createElement('div');
    translateElement.id = 'google_translate_element';
    translateElement.style.display = 'none';
    document.body.appendChild(translateElement);

    // Función de callback
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'fr',
        includedLanguages: languages.map(l => l.code).join(','),
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    // Cargar script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Limpiar elementos visuales de Google Translate
    const cleanGoogleUI = setInterval(() => {
      const elements = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu-frame, .goog-te-gadget');
      elements.forEach(el => {
        if (el) el.style.display = 'none';
      });
    }, 500);

    return () => {
      clearInterval(cleanGoogleUI);
    };
  }, []);

  return (
    <>
      {/* Banner de sugerencia de traducción */}
      {browserLang && showBanner && currentLang === 'fr' && (
        <div className="translation-banner">
          <div className="translation-banner-content">
            <Globe size={18} className="me-2" />
            <span>
              📢 Ce site est en français. 
              <strong> Traduire en {browserLang.name} ?</strong>
            </span>
            <div className="translation-banner-buttons">
              <Button 
                size="sm" 
                variant="primary" 
                onClick={() => applyTranslation(browserLang.code)}
              >
                Oui
              </Button>
              <Button 
                size="sm" 
                variant="link" 
                className="text-white"
                onClick={hideBanner}
              >
                Non
              </Button>
              <Button 
                size="sm" 
                variant="link" 
                className="text-white p-0 ms-2"
                onClick={hideBanner}
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante con selector de idiomas */}
      <div className="translate-float-btn">
        <Dropdown align="end">
          <Dropdown.Toggle 
            variant="light" 
            className="rounded-circle shadow-lg d-flex align-items-center justify-content-center"
            style={{ 
              width: '56px', 
              height: '56px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white'
            }}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Traduction...</span>
              </div>
            ) : (
              <Translate size={24} />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu align="end" className="translate-menu shadow-lg">
            <Dropdown.Header className="d-flex align-items-center">
              <Globe className="me-2" size={16} />
              <span>Traduire la page</span>
              {currentLang !== 'fr' && (
                <Badge bg="success" className="ms-2">
                  {languages.find(l => l.code === currentLang)?.name}
                </Badge>
              )}
            </Dropdown.Header>
            <Dropdown.Divider />
            
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {languages.map(lang => (
                <Dropdown.Item 
                  key={lang.code}
                  onClick={() => applyTranslation(lang.code)}
                  active={currentLang === lang.code}
                  className="d-flex align-items-center justify-content-between"
                >
                  <span>
                    <span className="me-2">{lang.flag}</span>
                    {lang.name}
                  </span>
                  {currentLang === lang.code && <Check size={14} className="text-success" />}
                </Dropdown.Item>
              ))}
            </div>
            
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={resetTranslation}
              className="text-danger"
              disabled={currentLang === 'fr'}
            >
              <span>🔄 Afficher l'original (Français)</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Estilos CSS */}
      <style jsx="true">{`
        .translate-float-btn {
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 9999;
        }
        
        .translate-float-btn .btn {
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .translate-float-btn .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        
        .translate-menu {
          border-radius: 12px !important;
          border: none !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          min-width: 240px !important;
        }
        
        .translate-menu .dropdown-item {
          padding: 10px 16px;
          transition: all 0.2s ease;
        }
        
        .translate-menu .dropdown-item:hover {
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          transform: translateX(4px);
        }
        
        .translate-menu .dropdown-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .translation-banner {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 50px;
          z-index: 10000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          animation: slideDown 0.3s ease-out;
        }
        
        .translation-banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .translation-banner-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        /* Ocultar completamente la UI de Google Translate */
        .goog-te-gadget {
          display: none !important;
        }
        
        .goog-te-banner-frame {
          display: none !important;
        }
        
        .goog-te-menu-frame {
          display: none !important;
        }
        
        .goog-te-combo {
          display: none !important;
        }
        
        body {
          top: 0px !important;
        }
        
        /* Estilo RTL para árabe */
        body.rtl {
          direction: rtl;
        }
        
        body.rtl .translate-float-btn {
          right: auto;
          left: 20px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .translate-float-btn {
            bottom: 70px;
            right: 15px;
          }
          
          .translate-float-btn .btn {
            width: 48px;
            height: 48px;
          }
          
          .translation-banner {
            top: 60px;
            padding: 8px 16px;
            font-size: 12px;
            width: 90%;
            border-radius: 20px;
          }
          
          .translation-banner-content {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default NativeTranslate;
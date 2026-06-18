// components/LanguageManager.js - Añadir clase CSS para forzar LTR
import React, { useEffect, useState } from 'react';

// ✅ IDIOMAS SOPORTADOS
export const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', label: 'AR', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', name: 'Français', label: 'FR', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', name: 'English', label: 'EN', flag: '🇬🇧', dir: 'ltr' }
];

// ✅ IDIOMA POR DEFECTO: ÁRABE
const DEFAULT_LANG = 'ar';

// ✅ LISTA DE COMPONENTES QUE SIEMPRE DEBEN SER LTR (IGNORAN RTL)
// Agrega aquí los nombres de las clases o IDs de los componentes
const IGNORE_RTL_SELECTORS = [
  '.navbar',           // Para cualquier navbar
  '.navbar2',          // Para Navbar2 específicamente
  '.video-reel-item',  // Para el reproductor de video
  '.video-player',     // Para el reproductor
  '.video-comments',   // Para comentarios
  '.step-video-upload', // Para los steps del wizard
  '.step-music-selection',
  '.step-video-info',
  '.create-video-wizard',
  '.edit-video-wizard',
  '.video-actions',
  // También puedes usar IDs
  '#navbar',           // Si tu navbar tiene un ID específico
  '#main-navbar'       // Ajusta según tu ID real
];

// ✅ COMPONENTES QUE IGNORAN RTL (nombres para el hook)
export const IGNORE_RTL_COMPONENTS = [
  'Navbar2',
  'VideoReelItem',
  'VideoPlayer',
  'VideoComments',
  'StepVideoUpload',
  'StepMusicSelection',
  'StepVideoInfo',
  'CreateVideoWizard',
  'EditVideoWizard',
  'VideoActions'
];

// ✅ FUNCIÓN PARA APLICAR/QUITAR CLASES RTL A COMPONENTES ESPECÍFICOS
const applyIgnoreRTLStyles = () => {
  // Agregar estilos globales si no existen
  if (!document.getElementById('ignore-rtl-styles')) {
    const style = document.createElement('style');
    style.id = 'ignore-rtl-styles';
    style.textContent = `
      /* Forzar LTR para componentes específicos */
      ${IGNORE_RTL_SELECTORS.map(selector => `
        ${selector} {
          direction: ltr !important;
          text-align: left !important;
        }
        ${selector} * {
          direction: ltr !important;
          text-align: left !important;
        }
      `).join('\n')}
      
      /* Mantener RTL para el resto de la app cuando el idioma es árabe */
      html[dir="rtl"]:not(.ignore-rtl) {
        direction: rtl;
      }
      html[dir="rtl"]:not(.ignore-rtl) * {
        direction: rtl;
      }
    `;
    document.head.appendChild(style);
  }
};

// ✅ FUNCIÓN PARA OBTENER DIRECCIÓN SEGÚN COMPONENTE
export const getComponentDirection = (componentName, currentLang) => {
  if (IGNORE_RTL_COMPONENTS.includes(componentName)) {
    return 'ltr';
  }
  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
  return langInfo?.dir || 'ltr';
};

// ✅ HOOK PERSONALIZADO PARA USAR EN COMPONENTES
export const useComponentDirection = (componentName) => {
  const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);
  
  useEffect(() => {
    const savedLang = getStoredLanguage();
    setCurrentLang(savedLang);
    
    const handleLanguageChange = () => {
      const newLang = getStoredLanguage();
      setCurrentLang(newLang);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);
  
  const shouldBeLTR = IGNORE_RTL_COMPONENTS.includes(componentName);
  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
  
  return {
    dir: shouldBeLTR ? 'ltr' : (langInfo?.dir || 'ltr'),
    textAlign: shouldBeLTR ? 'left' : (langInfo?.dir === 'rtl' ? 'right' : 'left'),
    isRTL: !shouldBeLTR && langInfo?.dir === 'rtl',
    shouldIgnoreRTL: shouldBeLTR
  };
};

// ✅ OBTENER IDIOMA GUARDADO
export const getStoredLanguage = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'googtrans') {
      const match = value.match(/\/auto\/(.+)$/);
      if (match && match[1] && SUPPORTED_LANGUAGES.some(l => l.code === match[1])) {
        return match[1];
      }
    }
  }
  
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
    return savedLang;
  }
  
  return DEFAULT_LANG;
};

// ✅ GUARDAR IDIOMA
export const setStoredLanguage = (langCode) => {
  localStorage.setItem('appLanguage', langCode);
  localStorage.setItem('useGoogleTranslate', 'true');
  localStorage.setItem('targetTranslateLang', langCode);
  
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `googtrans=/auto/${langCode}; path=/; expires=${expires.toUTCString()}`;
  document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${window.location.hostname}; expires=${expires.toUTCString()}`;
  
  const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  if (langInfo) {
    // Aplicar RTL solo al html, pero los componentes específicos lo ignorarán via CSS
    document.documentElement.dir = langInfo.dir;
    document.documentElement.lang = langCode;
  }
  
  const event = new CustomEvent('languageChanged', {
    detail: { targetLang: langCode }
  });
  document.dispatchEvent(event);
  
  console.log(`✅ Idioma guardado: ${langCode}`);
};

// ✅ TRADUCIR PÁGINA
export const translatePage = (targetLang) => {
  return new Promise((resolve) => {
    const checkAndTranslate = () => {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = targetLang;
        selectElement.dispatchEvent(new Event('change'));
        console.log(`✅ Traduciendo a: ${targetLang}`);
        resolve(true);
      } else {
        setTimeout(checkAndTranslate, 200);
      }
    };
    checkAndTranslate();
  });
};

// ✅ ESPERAR A QUE GOOGLE TRANSLATE ESTÉ LISTO
export const waitForGoogleTranslate = () => {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.google && window.google.translate) {
        clearInterval(checkInterval);
        console.log('✅ Google Translate listo');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('⚠️ Google Translate no cargó');
        resolve(false);
      }
    }, 100);
  });
};

// ✅ INICIALIZAR GOOGLE TRANSLATE
export const initGoogleTranslate = () => {
  return new Promise((resolve) => {
    if (document.querySelector('#google-translate-script')) {
      resolve(true);
      return;
    }

    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important;';
      document.body.appendChild(translateElement);
    }

    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: SUPPORTED_LANGUAGES.map(l => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
        console.log('✅ Google Translate inicializado');
        resolve(true);
      } catch (error) {
        console.error('Error inicializando Google Translate:', error);
        resolve(false);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      console.error('Error cargando Google Translate');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

// ✅ COMPONENTE PRINCIPAL LanguageManager
const LanguageManager = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      console.log('🌐 Inicializando LanguageManager...');
      
      try {
        // Aplicar estilos CSS para forzar LTR en componentes específicos
        applyIgnoreRTLStyles();
        
        const savedLang = getStoredLanguage();
        
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === savedLang);
        if (langInfo) {
          document.documentElement.dir = langInfo.dir;
          document.documentElement.lang = savedLang;
          console.log(`📝 Dirección aplicada: ${langInfo.dir}`);
        }
        
        try {
          await initGoogleTranslate();
          await waitForGoogleTranslate();
          
          if (savedLang !== 'fr') {
            await translatePage(savedLang);
          }
        } catch (error) {
          console.warn('⚠️ Google Translate no disponible');
        }
      } catch (error) {
        console.error('Error en inicialización:', error);
      }
      
      setIsInitialized(true);
      console.log('✅ LanguageManager listo');
    };
    
    initializeLanguage();
  }, []);

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
          el.style.height = '0';
          el.style.width = '0';
        }
      });
      document.body.style.top = '0px';
      document.body.style.position = 'relative';
    };
    
    hideGoogleElements();
    const interval = setInterval(hideGoogleElements, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!document.getElementById('google-translate-hide-styles')) {
      const style = document.createElement('style');
      style.id = 'google-translate-hide-styles';
      style.textContent = `
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        .goog-te-gadget,
        .goog-te-balloon-frame,
        .goog-te-banner,
        .skiptranslate,
        iframe[src*="translate"],
        div[class*="goog-te"] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        body {
          top: 0px !important;
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    window.changeLanguage = async (langCode) => {
      setStoredLanguage(langCode);
      await translatePage(langCode);
    };
    
    window.getCurrentLanguage = () => getStoredLanguage();
    
    return () => {
      delete window.changeLanguage;
      delete window.getCurrentLanguage;
    };
  }, []);

  return <>{children}</>;
};

export default LanguageManager;
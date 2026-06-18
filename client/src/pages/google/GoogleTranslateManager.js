// components/GoogleTranslateManager.js - Solo lógica, sin UI

import React, { useState, useEffect } from 'react';

const GoogleTranslateManager = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Idiomas soportados
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // 🆕 Idioma por defecto: ÁRABE
  const DEFAULT_LANG = 'ar';

  // Función para traducir la página (disponible globalmente)
  const translatePage = (targetLang) => {
    try {
      const selectElement = document.querySelector('.goog-te-combo');
      
      if (selectElement) {
        selectElement.value = targetLang;
        selectElement.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
          // Guardar en localStorage
          localStorage.setItem('selectedLang', targetLang);
        }, 500);
      } else {
        setTimeout(() => translatePage(targetLang), 500);
      }
    } catch (error) {
      console.error('Error traduciendo:', error);
    }
  };

  // Exponer la función globalmente para usarla desde cualquier componente
  useEffect(() => {
    window.translatePage = translatePage;
    
    return () => {
      delete window.translatePage;
    };
  }, []);

  // Cargar script de Google Translate
  useEffect(() => {
    if (document.querySelector('#google-translate-script')) {
      setScriptLoaded(true);
      return;
    }

    // Crear elemento oculto
    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
      translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important;';
      document.body.appendChild(translateElement);
    }

    // Función de callback
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: languages.map(l => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
        
        setScriptLoaded(true);
        
        // 🆕 Recuperar idioma guardado o usar árabe por defecto
        const savedLang = localStorage.getItem('selectedLang');
        const langToUse = savedLang || DEFAULT_LANG;
        
        // Traducir al idioma (si no es francés)
        if (langToUse !== 'fr') {
          setTimeout(() => translatePage(langToUse), 1000);
        }
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
    script.onerror = () => {
      console.error('Error cargando Google Translate');
      setScriptLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      if (window.googleTranslateElementInit) {
        window.googleTranslateElementInit = null;
      }
    };
  }, []);

  // Ocultar completamente los elementos de Google Translate
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

  // Estilos globales
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

  // Este componente no renderiza nada visual
  return null;
};

export default GoogleTranslateManager;
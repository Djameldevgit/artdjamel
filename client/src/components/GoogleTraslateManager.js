// components/GoogleTranslateManager.js
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const GoogleTranslateManager = () => {
  const [isTranslating, setIsTranslating] = useState(false)
  const { settings } = useSelector(state => state)

  useEffect(() => {
    // Verificar si hay traducción activa
    const useTranslate = localStorage.getItem('useGoogleTranslate') === 'true'
    const targetLang = localStorage.getItem('targetTranslateLang')

    if (useTranslate && targetLang) {
      setIsTranslating(true)
      initializeTranslation(targetLang)
    }

    // Escuchar cambios de traducción desde Navbar
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        if (event.detail.language === 'es') {
          disableTranslation()
        } else {
          activateTranslation(event.detail.language)
        }
      }
    }

    window.addEventListener('languageChanged', handleLanguageChange)
    return () => window.removeEventListener('languageChanged', handleLanguageChange)
  }, [])

  const initializeTranslation = (targetLang) => {
    // Configurar cookie para Google Translate
    const domain = window.location.hostname
    document.cookie = `googtrans=/es/${targetLang}; path=/; domain=${domain}`
    document.cookie = `googtrans=/es/${targetLang}; path=/`
  }

  const activateTranslation = (langCode) => {
    localStorage.setItem('useGoogleTranslate', 'true')
    localStorage.setItem('targetTranslateLang', langCode)
    setIsTranslating(true)
    
    // Forzar recarga para aplicar traducción completa
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const disableTranslation = () => {
    // Limpiar cookies
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname
    
    // Limpiar localStorage
    localStorage.removeItem('useGoogleTranslate')
    localStorage.removeItem('targetTranslateLang')
    
    // Remover elementos de Google Translate
    const googleElements = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu-frame')
    googleElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
    
    setIsTranslating(false)
    
    // Recargar para ver contenido original
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  // Traducir texto específico (para componentes dinámicos)
  const translateText = (text, callback) => {
    if (window.google && window.google.translate && window.google.translate.translate && isTranslating) {
      const targetLang = localStorage.getItem('targetTranslateLang') || 'en'
      window.google.translate.translate(text, 'es', targetLang, (result) => {
        if (result && result.translatedText) {
          callback(result.translatedText)
        }
      })
    }
  }

  return (
    <>
      {/* Indicador de traducción activa */}
      {isTranslating && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: settings.style 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '20px',
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          fontSize: '0.9rem',
          animation: 'pulse 2s infinite'
        }}>
          <span>🌐 Traducción automática activa</span>
          <button
            onClick={disableTranslation}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              marginLeft: '10px',
              padding: '5px 10px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Desactivar
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Estilos para contenido traducido */
        .goog-translated {
          transition: all 0.3s ease;
        }

        /* Ocultar banner de Google Translate */
        .goog-te-banner-frame {
          display: none !important;
        }

        /* Ocultar combo box flotante */
        .goog-te-menu-frame {
          display: none !important;
        }

        /* Evitar que algunos elementos se traduzcan */
        .notranslate {
          -webkit-translate: none !important;
          -moz-translate: none !important;
          -ms-translate: none !important;
          -o-translate: none !important;
          translate: none !important;
        }
      `}</style>
    </>
  )
}

export default GoogleTranslateManager
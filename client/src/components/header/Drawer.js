// 📂 components/common/Drawer.js - VERSIÓN CON ENLACE CONDICIONAL "CREAR CANAL" E ICONOS PNG
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { logout } from '../../redux/actions/authAction';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../utils/config';
// ✅ Importar acción para obtener los canales del usuario
import { getMyChannels } from '../../redux/actions/channelAction';

// ============================================
// CONSTANTES (idiomas)
// ============================================
const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', label: 'AR', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', name: 'Français', label: 'FR', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', name: 'English', label: 'EN', flag: '🇬🇧', dir: 'ltr' }
];
const DEFAULT_LANG = 'ar';

// ============================================
// FUNCIONES DE IDIOMA (sin cambios)
// ============================================
const getStoredLanguage = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'googtrans') {
      const match = value.match(/\/auto\/(.+)$/);
      if (match && match[1] && SUPPORTED_LANGUAGES.some(l => l.code === match[1])) return match[1];
    }
  }
  const savedLang = localStorage.getItem('appLanguage');
  if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) return savedLang;
  return DEFAULT_LANG;
};

const setStoredLanguage = (langCode) => {
  localStorage.setItem('appLanguage', langCode);
  localStorage.setItem('useGoogleTranslate', 'true');
  localStorage.setItem('targetTranslateLang', langCode);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `googtrans=/auto/${langCode}; path=/; expires=${expires.toUTCString()}`;
  const event = new CustomEvent('languageChanged', { detail: { targetLang: langCode } });
  document.dispatchEvent(event);
};

const translatePage = (targetLang) => {
  try {
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = targetLang;
      selectElement.dispatchEvent(new Event('change'));
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
      if (langInfo) {
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = targetLang;
      }
    } else {
      setTimeout(() => translatePage(targetLang), 500);
    }
  } catch (error) {
    console.error('Error traduciendo:', error);
  }
};

// ============================================
// COMPONENTE PRINCIPAL DRAWER
// ============================================
const Drawer = ({ show, onHide, width = 280, height = '100vh' }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  // ✅ Obtener los canales del usuario desde Redux
  const { userChannels = [], loading: channelsLoading } = useSelector(state => state.channel || {});

  // Estados
  const [darkMode, setDarkMode] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [currentLang, setCurrentLang] = useState(DEFAULT_LANG);
  const [openDropdowns, setOpenDropdowns] = useState({
    monCompte: false,
    mesAnnonces: false,
    mesCommandes: false,
    mesTransactions: false,
    videos: false,
    categories: false
  });
  const [localCategories, setLocalCategories] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // ============================================
  // CARGAR CATEGORÍAS PARA EL DRAWER
  // ============================================
  const loadCategoriesDirectly = useCallback(async () => {
    if (loadingLocal) return;
    setLoadingLocal(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/categories/slider`);
      console.log('🎯 Drawer: categorías cargadas:', data.categories?.length);
      setLocalCategories(data.categories || []);
    } catch (error) {
      console.error('❌ Error cargando categorías en drawer:', error);
    } finally {
      setLoadingLocal(false);
    }
  }, [loadingLocal]);

  useEffect(() => {
    if (show && localCategories.length === 0 && !loadingLocal) {
      loadCategoriesDirectly();
    }
  }, [show, localCategories.length, loadingLocal, loadCategoriesDirectly]);

  // ============================================
  // CARGAR CANALES DEL USUARIO (para saber si tiene canal)
  // ============================================
  useEffect(() => {
    if (show && auth?.user && userChannels.length === 0 && !channelsLoading) {
      dispatch(getMyChannels(auth.token));
    }
  }, [show, auth, userChannels.length, channelsLoading, dispatch]);

  const isProActive = useMemo(() => {
    const user = auth?.user;
    if (!user?.isPro) return false;
    if (!user?.proExpiryDate) return true;
    return new Date(user.proExpiryDate) > new Date();
  }, [auth?.user]);

  // ============================================
  // GOOGLE TRANSLATE (sin cambios)
  // ============================================
  useEffect(() => {
    if (document.querySelector('#google-translate-script')) {
      setTranslateReady(true);
      const savedLang = getStoredLanguage();
      setCurrentLang(savedLang);
      const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === savedLang);
      if (langInfo) {
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = savedLang;
      }
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
        setTranslateReady(true);
        const savedLang = getStoredLanguage();
        setCurrentLang(savedLang);
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === savedLang);
        if (langInfo) {
          document.documentElement.dir = langInfo.dir;
          document.documentElement.lang = savedLang;
        }
        if (savedLang !== 'fr') setTimeout(() => translatePage(savedLang), 1000);
      } catch (error) {
        console.error('Error inicializando Google Translate:', error);
        setTranslateReady(true);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (window.googleTranslateElementInit) window.googleTranslateElementInit = null;
    };
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
        .goog-te-banner-frame, .goog-te-menu-frame, .goog-te-gadget,
        .goog-te-balloon-frame, .goog-te-banner, .skiptranslate,
        iframe[src*="translate"], div[class*="goog-te"] {
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
        body { top: 0px !important; position: relative !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const [translateReady, setTranslateReady] = useState(false);

  const handleLanguageChange = (langCode) => {
    setStoredLanguage(langCode);
    setCurrentLang(langCode);
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = langInfo.code;
    }
    translatePage(langCode);
    setTimeout(() => {
      onHide();
      window.location.reload();
    }, 300);
  };

  // ============================================
  // MEJORA: ICONOS DE CATEGORÍAS (priorizar imagen PNG)
  // ============================================
  const defaultCategoryIcons = useMemo(() => ({
    'vehicules': '🚗', 'immobilier': '🏠', 'electromenager': '🔌',
    'electronique': '📱', 'mode': '👕', 'maison': '🛋️',
    'sports': '⚽', 'sante-beaute': '💄', 'alimentation': '🍕',
    'services': '🔧', 'animaux': '🐕', 'jouets': '🧸',
    'art': '🎨', 'livres': '📚', 'musique': '🎵'
  }), []);

  const getFullImageUrl = useCallback((iconPath) => {
    if (!iconPath) return null;
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) return iconPath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${iconPath.startsWith('/') ? iconPath : `/categories/${iconPath}`}`;
  }, []);

  // ✅ Función mejorada: prioriza imageUrl, luego icon (si es URL), luego emoji por defecto
  const getCategoryIcon = useCallback((category) => {
    // Si ya hubo error con esta categoría, mostrar emoji
    if (imageErrors[category.slug]) {
      return { type: 'emoji', value: defaultCategoryIcons[category.slug] || '📦' };
    }

    // 1. Intentar usar imageUrl (ruta a PNG)
    if (category.imageUrl) {
      const fullUrl = getFullImageUrl(category.imageUrl);
      if (fullUrl) return { type: 'image', value: fullUrl, alt: category.name };
    }

    // 2. Si no hay imageUrl, pero category.icon es una URL (posible legacy)
    if (category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))) {
      const fullUrl = getFullImageUrl(category.icon);
      if (fullUrl) return { type: 'image', value: fullUrl, alt: category.name };
    }

    // 3. Por defecto, usar emoji (category.icon suele ser el emoji)
    return { type: 'emoji', value: category.icon || defaultCategoryIcons[category.slug] || '📦' };
  }, [imageErrors, getFullImageUrl, defaultCategoryIcons]);

  const handleImageError = useCallback((slug) => {
    setImageErrors(prev => ({ ...prev, [slug]: true }));
  }, []);

  // ============================================
  // MANEJADORES (sin cambios)
  // ============================================
  const handleCategoryClick = useCallback((category) => {
    onHide();
    if (category.resourceUrl && category.resourceUrl.trim() !== '') {
      window.open(category.resourceUrl, '_blank');
    } else if (category.slug) {
      history.push(`/${category.slug}/1`);
    }
  }, [onHide, history]);

  const handleLogout = () => {
    dispatch(logout());
    onHide();
    history.push('/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  const isDashboardPage = location.pathname.includes('/users/dashboard') ||
                         location.pathname.includes('/profile') ||
                         location.pathname.startsWith('/mes-');

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({ ...prev, [dropdownName]: !prev[dropdownName] }));
  };

  const emojis = {
    home: '🏠', user: '👤', logout: '🚪', bell: '🔔', list: '📋',
    plus: '➕', dashboard: '📊', store: '🏪', categories: '📂',
    all: '📊', login: '🔑', register: '📝', question: '❓',
    mail: '✉️', shield: '🛡️', arrow: '➡️', globe: '🌍',
    sun: '☀️', moon: '🌙', fire: '🔥', chart: '📈',
    message: '💬', shopping: '🛒', megaphone: '📢', gear: '⚙️',
    verified: '✅', warning: '⚠️', star: '⭐', heart: '❤️',
    annonce: '📢', commande: '📦', voyage: '✈️', pub: '🎯',
    transaction: '💰', credit: '💳', video: '🎬', camera: '📹',
    tutorial: '🎓', channels: '📺'
  };

  const sectionColors = {
    monCompte: { primary: '#6366F1', light: '#EEF2FF' },
    mesAnnonces: { primary: '#3B82F6', light: '#EFF6FF' },
    mesCommandes: { primary: '#F59E0B', light: '#FFFBEB' },
    mesTransactions: { primary: '#10B981', light: '#ECFDF5' },
    videos: { primary: '#DC2626', light: '#FEF2F2' }
  };

  // ============================================
  // COMPONENTES INTERNOS (LinkItem, CategoryIcon, etc.)
  // ============================================
  const LinkItem = ({ emoji, icon, name, path, onClick, color = '#8b5cf6', badge = null, isDashboardLink = false, external = false }) => {
    const isActive = !external && (location.pathname === path || (isDashboardLink && location.pathname.startsWith('/dashboard')));
    const finalColor = color;
    const handleClick = (e) => {
      if (onClick) onClick(e);
      if (!external && path && !onClick) onHide();
    };
    const content = (
      <div onClick={handleClick} style={{
        padding: '10px 16px', margin: '2px 0', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', backgroundColor: isActive ? `${finalColor}12` : 'transparent',
        borderLeft: isActive ? `3px solid ${finalColor}` : 'none', transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: isActive ? `${finalColor}15` : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            {emoji || '📁'}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '500', color: isActive ? finalColor : '#374151' }}>{name}</span>
        </div>
        {badge && <span style={{ backgroundColor: badge.color || '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{badge.text}</span>}
      </div>
    );
    if (external && path) return <a href={path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>{content}</a>;
    if (path && !onClick && !external) return <Link to={path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>{content}</Link>;
    return content;
  };

  const CategoryIcon = ({ category }) => {
    const iconData = getCategoryIcon(category);
    const style = { width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 };
    if (iconData.type === 'image') {
      return (
        <div style={style}>
          <img src={iconData.value} alt={iconData.alt || category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => handleImageError(category.slug)} />
        </div>
      );
    }
    return (
      <div style={style}>
        <span style={{ fontSize: '1rem', color: '#6b7280' }}>{iconData.value}</span>
      </div>
    );
  };

  const DropdownItem = ({ icon, emoji, name, path, onClick, color = '#667eea', badge = null, disabled = false, external = false }) => {
    const isActive = !external && location.pathname === path;
    const finalColor = color;
    const handleClick = (e) => {
      if (disabled) return;
      if (onClick) onClick(e);
      if (!external && path && !onClick) onHide();
    };
    const content = (
      <div onClick={handleClick} style={{
        padding: '8px 16px 8px 48px', margin: '2px 0', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: isActive ? `${finalColor}12` : 'transparent',
        borderLeft: isActive ? `3px solid ${finalColor}` : 'none', transition: 'all 0.2s ease', opacity: disabled ? 0.6 : 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1rem', color: isActive ? finalColor : '#6b7280' }}>{icon || emoji || '•'}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '500', color: isActive ? finalColor : '#4b5563' }}>{name}</span>
        </div>
        {badge && <span style={{ backgroundColor: badge.color || '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{badge.text}</span>}
      </div>
    );
    if (external && path) return <a href={path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>{content}</a>;
    if (path && !onClick && !disabled && !external) return <Link to={path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>{content}</Link>;
    return content;
  };

  const DropdownHeader = ({ title, emoji, icon, dropdownName, color = '#667eea', children }) => {
    const isOpen = openDropdowns[dropdownName];
    const sectionColor = sectionColors[dropdownName]?.primary || color;
    return (
      <div style={{ marginBottom: '4px' }}>
        <div onClick={() => toggleDropdown(dropdownName)} style={{
          padding: '10px 16px', margin: '2px 0', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', backgroundColor: isOpen ? `${sectionColor}10` : 'transparent',
          transition: 'all 0.2s ease', fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', color: sectionColor }}>{icon || emoji}</span>
            <span style={{ color: '#1f2937', fontSize: '0.9rem' }}>{title}</span>
          </div>
          <div style={{ color: sectionColor, transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.7 }}>
            <FaChevronDown size={11} />
          </div>
        </div>
        {isOpen && <div style={{ marginLeft: '8px' }}>{children}</div>}
      </div>
    );
  };

  // ============================================
  // RENDER DE DROPDOWNS
  // ============================================
  const renderVideosDropdown = () => {
    if (!isProActive) return null;
    return (
      <DropdownHeader title="Vidéos" icon="🎬" dropdownName="videos" color="#DC2626">
        <DropdownItem icon="🎬" name="Créer une vidéo" path="/create-video-page" color="#DC2626" />
        <DropdownItem icon="📹" name="Mes vidéos" path="/video/userVideo" color="#DC2626" />
        <DropdownItem icon="📊" name="Statistiques vidéos" path="/stats-videos" color="#F59E0B" />
      </DropdownHeader>
    );
  };

  const renderCategoriesDropdown = () => {
    if (loadingLocal) {
      return (
        <DropdownHeader title="Catégories" icon="📂" dropdownName="categories" color="#8B5CF6">
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <div className="spinner-border spinner-border-sm text-primary" />
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>Chargement...</span>
          </div>
        </DropdownHeader>
      );
    }
    if (localCategories.length === 0) return null;
    return (
      <DropdownHeader title="Catégories" icon="📂" dropdownName="categories" color="#8B5CF6">
        {localCategories.slice(0, 15).map((category) => (
          <div
            key={category._id}
            onClick={() => handleCategoryClick(category)}
            style={{
              padding: '8px 16px 8px 48px',
              margin: '2px 0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <CategoryIcon category={category} />
            <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: '500' }}>{category.name}</span>
          </div>
        ))}
      </DropdownHeader>
    );
  };

  // ============================================
  // CONTENIDO PRINCIPAL (con enlace condicional)
  // ============================================
  const renderDashboardContent = () => (
    <>
      <div style={{
        padding: '20px 16px', margin: '0 16px 16px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>📊</div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Mon Espace</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{auth.user?.name || auth.user?.username}</div>
          {isProActive && (
            <div style={{ fontSize: '0.65rem', marginTop: '8px', opacity: 0.9, display: 'inline-block', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '20px' }}>
              ⭐ Compte Pro
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
      </div>

      <DropdownHeader title="Mon Compte" emoji={emojis.user} dropdownName="monCompte" color="#6366F1">
        <DropdownItem icon="📊" name="Tableau de bord" path="/users/dashboard" color="#6366F1" />
        <DropdownItem icon="⚙️" name="Paramètres du profil" path="/profile/settings" color="#6b7280" />
        <DropdownItem icon={emojis.logout} name="Se déconnecter" onClick={handleLogout} color="#ef4444" />
      </DropdownHeader>

      {renderVideosDropdown()}
      {renderCategoriesDropdown()}

      <DropdownHeader title="Annonces" emoji={emojis.annonce} dropdownName="mesAnnonces" color="#3B82F6">
        <DropdownItem icon="📋" name="Mes annonces" path="/mes-annonces" color="#3B82F6" />
        <DropdownItem icon="🆕" name="Annonces actives" path="/mes-annonces?filter=active" color="#10b981" />
        <DropdownItem icon="⏳" name="Annonces en attente" path="/mes-annonces?filter=pending" color="#f59e0b" />
        <DropdownItem icon="✅" name="Annonces vendues" path="/mes-annonces?filter=sold" color="#6b7280" />
        <DropdownItem icon="📝" name="Ajouter une annonce" path="/creer-annonce" color="#10b981" />
      </DropdownHeader>

      <DropdownHeader title="Mes Commandes" emoji={emojis.commande} dropdownName="mesCommandes" color="#F59E0B">
        <DropdownItem icon="📦" name="Toutes mes commandes" path="/mes-commandes" color="#F59E0B" />
        <DropdownItem icon="🔄" name="Commandes en cours" path="/mes-commandes?filter=processing" color="#3b82f6" />
        <DropdownItem icon="✅" name="Commandes livrées" path="/mes-commandes?filter=delivered" color="#10b981" />
        <DropdownItem icon="🧾" name="Tickets de livraison" path="/mes-tickets" color="#ec4899" />
      </DropdownHeader>

      <DropdownHeader title="Transactions" emoji={emojis.transaction} dropdownName="mesTransactions" color="#10B981">
        <DropdownItem icon="💰" name="Mes crédits" path="/mes-credits" color="#10B981" />
        <DropdownItem icon="💳" name="Recharger" path="/recharger-credits" color="#8b5cf6" />
        <DropdownItem icon="📊" name="Historique" path="/historique-transactions" color="#6b7280" />
        <DropdownItem icon="📈" name="Statistiques" path="/stats-transactions" color="#f59e0b" />
      </DropdownHeader>
    </>
  );

  const renderLoggedInContent = () => (
    <>
      <LinkItem emoji={darkMode ? emojis.sun : emojis.moon} name={darkMode ? 'Mode Clair' : 'Mode Sombre'} onClick={toggleDarkMode} color={darkMode ? '#f59e0b' : '#4b5563'} />
      <LinkItem emoji={emojis.dashboard} name="Mon Tableau de bord" path="/users/dashboard" color="#8b5cf6" isDashboardLink={true} />
      <LinkItem emoji="👤" name="Mon profil" path={`/profile/${auth.user?._id}`} color="#8b5cf6" isDashboardLink={true} />
      
      {/* ✅ Enlace condicional: mostrar solo si el usuario NO tiene ningún canal */}
      {userChannels.length === 0 && (
        <LinkItem emoji="📢" name="Créer une chaîne" path="/channel/new" color="#10b981" />
      )}
      
      {renderCategoriesDropdown()}
    </>
  );

  const renderGuestContent = () => (
    <>
      <LinkItem emoji={darkMode ? emojis.sun : emojis.moon} name={darkMode ? 'Mode Clair' : 'Mode Sombre'} onClick={toggleDarkMode} color={darkMode ? '#f59e0b' : '#4b5563'} />
      <div style={{ margin: '20px 0 5px 16px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>{emojis.user} Compte</div>
      <LinkItem emoji={emojis.login} name="Se connecter" path="/login" color="#10b981" />
      <LinkItem emoji={emojis.register} name="S'inscrire" path="/register" color="#667eea" />
      {renderCategoriesDropdown()}
    </>
  );

  const renderMainContent = () => {
    if (isDashboardPage && auth.user) return renderDashboardContent();
    if (auth.user) return renderLoggedInContent();
    return renderGuestContent();
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <Offcanvas show={show} onHide={onHide} placement="start" className="drawer" style={{ width, height, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ padding: '15px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {auth.user && (
            <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
              {auth.user.name || auth.user.username}
            </span>
          )}
          {isProActive && (
            <span style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⭐</span> PRO
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', marginRight: '10px', background: '#f3f4f6', padding: '4px', borderRadius: '12px' }}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: isActive ? '#667eea' : 'transparent',
                  border: isActive ? '2px solid #10b981' : 'none', color: isActive ? 'white' : '#6b7280',
                  fontWeight: '600', fontSize: lang.code === 'ar' ? '1rem' : '0.75rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
                }} title={lang.name} className="notranslate" translate="no">
                  <span className="notranslate" translate="no">{lang.label}</span>
                </button>
              );
            })}
          </div>
          <button onClick={onHide} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'all 0.2s ease' }} title="Fermer" className="notranslate" translate="no">
            <span className="notranslate" translate="no">✕</span>
          </button>
        </div>
      </div>
      <Offcanvas.Body style={{ overflowY: 'auto', padding: '10px 0', scrollbarWidth: 'thin' }}>
        {renderMainContent()}
        <div style={{ margin: '30px 0 15px 16px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>🔗 Liens utiles</div>
        
        <LinkItem emoji="🎓" name="Tutoriels (Comment utiliser l'app)" path="/tutorials" color="#F1C40F" />
        <LinkItem emoji="📺" name="Explorer les Chaînes" path="/channels" color="#8E44AD" />
        
        <LinkItem emoji="❓" name="Comment annoncer ?" path="/bloginfo" color="#6b7280" />
        <LinkItem emoji="✉️" name="Contactez-nous" path="/users/contactt" color="#6b7280" />
        <LinkItem emoji="🛡️" name="Politique de confidentialité" path="/bloginfo" color="#6b7280" />
        
        <div style={{ marginTop: '30px', padding: '15px 16px', borderTop: '1px solid #e5e7eb', fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}>
            <span>🛡️</span>
            <span>Plateforme sécurisée</span>
          </div>
          © {new Date().getFullYear()} MarketPlace VideoCommerce MERN-Djamel/Ba Tous droits réservés.
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Drawer;
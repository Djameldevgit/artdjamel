// 📂 components/common/Drawer.js - VERSIÓN CORREGIDA

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { logout } from '../../redux/actions/authAction';
import { getCategoriesForAccordion } from '../../redux/actions/categoryAction';
import { getUserBoutiques } from '../../redux/actions/boutiqueAction';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const Drawer = ({ 
  show, 
  onHide, 
  width = 280,
  height = '100vh'
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const { t, i18n } = useTranslation('global');
  const [darkMode, setDarkMode] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Obtener boutiques del usuario desde Redux
  const { userBoutiques = [], loading: boutiqueLoading } = useSelector(state => state.boutique || { userBoutiques: [], loading: false });
  
  const hasBoutiques = userBoutiques && Array.isArray(userBoutiques) && userBoutiques.length > 0;
  const firstBoutiqueId = hasBoutiques && userBoutiques[0]?._id ? userBoutiques[0]._id : null;

  // ✅ Verificar si el usuario es Pro activo
  const isProActive = useMemo(() => {
    const user = auth?.user;
    if (!user?.isPro) return false;
    if (!user?.proExpiryDate) return true;
    return new Date(user.proExpiryDate) > new Date();
  }, [auth?.user]);

  // Estados para los dropdowns
  const [openDropdowns, setOpenDropdowns] = useState({
    monCompte: false,
    mesAnnonces: false,
    mesCommandes: false,
    mesBoutiques: false,
    mesTransactions: false,
    videos: false  // ✅ Nuevo dropdown para videos
  });

  // Obtener categorías desde Redux
  const { accordionCategories = [] } = useSelector((state) => ({
    accordionCategories: state.category?.accordionCategories || []
  }));

  useEffect(() => {
    if (accordionCategories.length === 0) {
      dispatch(getCategoriesForAccordion());
    }
  }, [dispatch, accordionCategories.length]);

  useEffect(() => {
    if (auth?.token) {
      dispatch(getUserBoutiques(auth));
    }
  }, [dispatch, auth]);

  // 🔥 MAPA DE ICONOS POR DEFECTO PARA CADA CATEGORÍA (fallback cuando no hay imagen)
  const defaultCategoryIcons = useMemo(() => ({
    'vehicules': '🚗',
    'immobilier': '🏠',
    'telephones': '📱',
    'vetements': '👕',
    'electromenager': '🔌',
    'informatique': '💻',
    'loisirs': '🎮',
    'meubles': '🛋️',
    'sport': '⚽',
    'alimentaires': '🍎',
    'santebeaute': '💄',
    'services': '🛠️',
    'materiaux': '🧱',
    'emploi': '💼',
    'voyages': '✈️',
    'pieces-detachees': '⚙️',
    'boutiques': '🏪',
    'voitures': '🚙',
    'motos': '🏍️',
    'smartphones': '📱',
    'tablettes': '📟',
    'ordinateurs': '💻',
    'consoles': '🎮',
    'vetements-homme': '👔',
    'vetements-femme': '👗',
    'chaussures': '👟',
    'bijoux': '💍',
    'montres': '⌚',
    'appartement': '🏢',
    'villa': '🏡',
    'terrain': '🌾',
    'default': '📁'
  }), []);

  // Paleta de colores
  const colorPalette = useMemo(() => [
    '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#b5179e',
    '#7209b7', '#560bad', '#480ca8', '#3f37c9', '#4895ef',
    '#e63946', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
    '#6d597a', '#b56576', '#e56b6f', '#9c89b8', '#ef476f',
    '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#fb8b24',
    '#d90429', '#ff9770', '#6a994e', '#bc4c51', '#5e548e'
  ], []);

  const generateColorFromName = useCallback((name) => {
    if (!name) return colorPalette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  }, [colorPalette]);

  // 🔥 FUNCIÓN PARA OBTENER LA URL COMPLETA DE LA IMAGEN
  const getFullImageUrl = useCallback((iconPath) => {
    if (!iconPath) return null;
    
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
      return iconPath;
    }
    
    if (iconPath.startsWith('/categories')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${baseUrl}${iconPath}`;
    }
    
    if (iconPath.includes('.png') || iconPath.includes('.jpg') || iconPath.includes('.svg')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      return `${baseUrl}/categories/${iconPath}`;
    }
    
    return null;
  }, []);

  // 🔥 FUNCIÓN PARA OBTENER EL ICONO A MOSTRAR
  const getCategoryIcon = useCallback((category, color) => {
    const categorySlug = category.slug;
    const hasError = imageErrors[categorySlug];
    
    if (hasError) {
      return {
        type: 'emoji',
        value: defaultCategoryIcons[categorySlug] || defaultCategoryIcons.default
      };
    }
    
    if (category.icon) {
      const fullUrl = getFullImageUrl(category.icon);
      if (fullUrl) {
        return {
          type: 'image',
          value: fullUrl,
          alt: category.name
        };
      }
    }
    
    return {
      type: 'emoji',
      value: defaultCategoryIcons[categorySlug] || defaultCategoryIcons.default
    };
  }, [imageErrors, getFullImageUrl, defaultCategoryIcons]);

  const categoryItems = useMemo(() => {
    return accordionCategories.map(cat => ({
      ...cat,
      color: generateColorFromName(cat.name),
      isStore: cat.slug === 'boutiques'
    }));
  }, [accordionCategories, generateColorFromName]);

  // Idiomas
  const [currentLang, setCurrentLang] = useState(() => {
    const savedLang = localStorage.getItem('appLanguage') || 'fr';
    const useGoogleTranslate = localStorage.getItem('useGoogleTranslate') === 'true';
    const targetLang = localStorage.getItem('targetTranslateLang');
    return useGoogleTranslate && targetLang ? targetLang : savedLang;
  });

  const isDashboardPage = location.pathname.includes('/users/dashboard') || 
                         location.pathname.includes('/profile') ||
                         location.pathname.startsWith('/mes-');

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
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
    transaction: '💰', credit: '💳', video: '🎬', camera: '📹'
  };

  const handleImageError = useCallback((categorySlug) => {
    setImageErrors(prev => ({ ...prev, [categorySlug]: true }));
  }, []);

  const getCategoryPath = (categorySlug) => {
    if (categorySlug === 'boutiques') return '/boutiques';
    return `/${categorySlug}`;
  };

  const handleCategoryClick = (category) => {
    onHide();
    history.push(getCategoryPath(category.slug));
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('appLanguage', langCode);
    localStorage.setItem('useGoogleTranslate', 'true');
    localStorage.setItem('targetTranslateLang', langCode);
    document.cookie = `googtrans=/auto/${langCode}; path=/`;
    
    const event = new CustomEvent('languageChanged', {
      detail: { targetLang: langCode }
    });
    document.dispatchEvent(event);
    
    setTimeout(() => {
      onHide();
      window.location.reload();
    }, 300);
  };

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

  const handleNoBoutique = () => {
    alert('⚠️ Vous devez d\'abord créer une boutique avant de gérer des produits');
    onHide();
    history.push('/create-boutique');
  };

  // Colores para cada sección
  const sectionColors = {
    monCompte: { primary: '#6366F1', light: '#EEF2FF' },
    mesAnnonces: { primary: '#3B82F6', light: '#EFF6FF' },
    mesBoutiques: { primary: '#EC4899', light: '#FDF2F8' },
    mesCommandes: { primary: '#F59E0B', light: '#FFFBEB' },
    mesTransactions: { primary: '#10B981', light: '#ECFDF5' },
    videos: { primary: '#DC2626', light: '#FEF2F2' }  // ✅ Color rojo para videos
  };

  // 🔥 COMPONENTE CATEGORY ICON RENDERIZADO
  const CategoryIcon = ({ category, color, isActive }) => {
    const iconData = getCategoryIcon(category, color);
    const style = {
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      backgroundColor: isActive ? `${color}15` : '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0
    };

    if (iconData.type === 'image') {
      return (
        <div style={style}>
          <img 
            src={iconData.value}
            alt={iconData.alt || category.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => handleImageError(category.slug)}
          />
        </div>
      );
    }

    return (
      <div style={style}>
        <span style={{ fontSize: '1rem', color: isActive ? color : '#6b7280' }}>
          {iconData.value}
        </span>
      </div>
    );
  };

  // Componente DropdownItem
  const DropdownItem = ({ icon, emoji, name, path, onClick, color = '#667eea', badge = null, disabled = false }) => {
    const isActive = location.pathname === path;
    const finalColor = color;
    
    const handleClick = (e) => {
      if (disabled) {
        e.preventDefault();
        handleNoBoutique();
        return;
      }
      if (onClick) onClick(e);
      if (path && !onClick) onHide();
    };
    
    const content = (
      <div
        onClick={handleClick}
        style={{
          padding: '8px 16px 8px 48px',
          margin: '2px 0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'pointer' : 'pointer',
          backgroundColor: isActive ? `${finalColor}12` : 'transparent',
          borderLeft: isActive ? `3px solid ${finalColor}` : 'none',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isActive) {
            e.currentTarget.style.backgroundColor = `${finalColor}06`;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1rem', color: isActive ? finalColor : '#6b7280' }}>{icon || emoji || '•'}</span>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: isActive ? '600' : '500',
            color: isActive ? finalColor : '#4b5563'
          }}>
            {name}
          </span>
        </div>
        
        {badge && (
          <span style={{
            backgroundColor: badge.color || '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            {badge.text}
          </span>
        )}
      </div>
    );

    if (path && !onClick && !disabled) {
      return <Link to={path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>{content}</Link>;
    }
    return content;
  };

  // Componente DropdownHeader
  const DropdownHeader = ({ title, emoji, icon, dropdownName, color = '#667eea', children }) => {
    const isOpen = openDropdowns[dropdownName];
    const sectionColor = sectionColors[dropdownName]?.primary || color;
    
    return (
      <div style={{ marginBottom: '4px' }}>
        <div
          onClick={() => toggleDropdown(dropdownName)}
          style={{
            padding: '10px 16px',
            margin: '2px 0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            backgroundColor: isOpen ? `${sectionColor}10` : 'transparent',
            transition: 'all 0.2s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = `${sectionColor}06`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isOpen) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.1rem', color: sectionColor }}>{icon || emoji}</span>
            <span style={{ color: '#1f2937', fontSize: '0.9rem' }}>{title}</span>
          </div>
          <div style={{ 
            color: sectionColor, 
            transition: 'transform 0.3s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.7
          }}>
            <FaChevronDown size={11} />
          </div>
        </div>
        
        {isOpen && (
          <div style={{ marginLeft: '8px' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  // 🔥 COMPONENTE LINKITEM ACTUALIZADO CON SOPORTE PARA IMÁGENES
  const LinkItem = ({ emoji, icon, name, path, onClick, color = '#8b5cf6', badge = null, isDashboardLink = false, isBackButton = false }) => {
    const isActive = location.pathname === path || (isDashboardLink && location.pathname.startsWith('/dashboard'));
    const hasImageError = icon && imageErrors[name];
    const finalColor = color;
    
    const handleClick = (e) => {
      if (onClick) onClick(e);
      if (path && !onClick) onHide();
    };
    
    const isCategoryItem = icon && typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/categories'));
    
    const content = (
      <div
        onClick={handleClick}
        style={{
          padding: '10px 16px',
          margin: '2px 0',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: isActive ? `${finalColor}12` : 'transparent',
          borderLeft: isActive ? `3px solid ${finalColor}` : 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = `${finalColor}06`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
          {isBackButton ? (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              color: '#6b7280'
            }}>
              ←
            </div>
          ) : isCategoryItem && !hasImageError ? (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: isActive ? `${finalColor}15` : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src={icon}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={() => handleImageError(name)}
              />
            </div>
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: isActive ? `${finalColor}15` : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}>
              {emoji || (icon && hasImageError ? name?.charAt(0).toUpperCase() : '📁')}
            </div>
          )}
          <span style={{
            fontSize: '0.9rem',
            fontWeight: isActive ? '600' : '500',
            color: isActive ? finalColor : '#374151'
          }}>
            {name}
          </span>
        </div>
        
        {badge && (
          <span style={{
            backgroundColor: badge.color || '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            {badge.text}
          </span>
        )}
      </div>
    );

    if (path && !onClick) {
      return (
        <Link to={path} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={onHide}>
          {content}
        </Link>
      );
    }

    return <div style={{ display: 'block' }}>{content}</div>;
  };

  // ✅ DROPDOWN: Videos (solo para usuarios Pro activos)
  const renderVideosDropdown = () => {
    if (!isProActive) return null;
    
    return (
      <DropdownHeader 
        title="Vidéos" 
        icon="🎬" 
        dropdownName="videos"
        color="#DC2626"
      >
        <DropdownItem 
          icon="🎬" 
          name="Créer une vidéo" 
          path="/creer-video" 
          color="#DC2626" 
        />
        <DropdownItem 
          icon="📹" 
          name="Mes vidéos" 
          path="/mes-videos" 
          color="#DC2626" 
        />
        <DropdownItem 
          icon="📊" 
          name="Statistiques vidéos" 
          path="/stats-videos" 
          color="#F59E0B" 
        />
      </DropdownHeader>
    );
  };

  // Contenido para DASHBOARD con DROPDOWNS
  const renderDashboardContent = () => (
    <>
      {/* En-tête del dashboard */}
      <div style={{
        padding: '20px 16px',
        margin: '0 16px 16px 16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>📊</div>
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Mon Espace</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{auth.user?.name || auth.user?.username}</div>
          
          {/* Badge Pro */}
          {isProActive && (
            <div style={{ 
              fontSize: '0.65rem', 
              marginTop: '8px', 
              opacity: 0.9,
              display: 'inline-block',
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: '20px'
            }}>
              ⭐ Compte Pro
            </div>
          )}
          
          {hasBoutiques && (
            <div style={{ 
              fontSize: '0.65rem', 
              marginTop: '8px', 
              opacity: 0.8,
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '20px',
              marginLeft: isProActive ? '8px' : '0'
            }}>
              🏪 {userBoutiques.length} boutique(s)
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
      </div>

      {/* DROPDOWN: Mon Compte */}
      <DropdownHeader 
        title="Mon Compte" 
        emoji={emojis.user} 
        dropdownName="monCompte"
        color="#6366F1"
      >
        <DropdownItem 
          icon="📊" 
          name="Tableau de bord" 
          path="/users/dashboard" 
          color="#6366F1" 
        />
        <DropdownItem 
          icon="⚙️" 
          name="Paramètres du profil" 
          path="/profile/settings" 
          color="#6b7280" 
        />
        <DropdownItem 
          icon={emojis.logout} 
          name="Se déconnecter" 
          onClick={handleLogout} 
          color="#ef4444" 
        />
      </DropdownHeader>

      {/* ✅ DROPDOWN: Videos (solo para usuarios Pro) */}
      {renderVideosDropdown()}

      {/* DROPDOWN: Mes Annonces */}
      <DropdownHeader 
        title="Annonces" 
        emoji={emojis.annonce} 
        dropdownName="mesAnnonces"
        color="#3B82F6"
      >
        <DropdownItem 
          icon="📋" 
          name="Mes annonces" 
          path="/mes-annonces" 
          color="#3B82F6" 
        />
        <DropdownItem 
          icon="🆕" 
          name="Annonces actives" 
          path="/mes-annonces?filter=active" 
          color="#10b981" 
        />
        <DropdownItem 
          icon="⏳" 
          name="Annonces en attente" 
          path="/mes-annonces?filter=pending" 
          color="#f59e0b" 
        />
        <DropdownItem 
          icon="✅" 
          name="Annonces vendues" 
          path="/mes-annonces?filter=sold" 
          color="#6b7280" 
        />
        <DropdownItem 
          icon="📝" 
          name="Ajouter une annonce" 
          path="/creer-annonce" 
          color="#10b981" 
        />
      </DropdownHeader>

      {/* DROPDOWN: Mes Boutiques */}
      <DropdownHeader 
        title="Boutiques" 
        icon="🏪" 
        dropdownName="mesBoutiques"
        color="#EC4899"
      >
        <DropdownItem 
          icon="🏪" 
          name="Mes boutiques" 
          path="/mes-boutiques" 
          color="#EC4899" 
        />
        <DropdownItem 
          icon="✨" 
          name="Créer une boutique" 
          path="/create-boutique" 
          color="#8b5cf6" 
        />
        <DropdownItem 
          icon="✨" 
          name="Mes products boutiques" 
          path="/mes-products-boutiques" 
          color="#8b5cf6" 
        />
        
        {boutiqueLoading && (
          <div style={{ 
            padding: '8px 16px 8px 48px', 
            color: '#9ca3af', 
            fontSize: '0.75rem'
          }}>
            ⏳ Chargement de vos boutiques...
          </div>
        )}
      </DropdownHeader>

      {/* DROPDOWN: Mes Commandes */}
      <DropdownHeader 
        title="Mes Commandes" 
        emoji={emojis.commande} 
        dropdownName="mesCommandes"
        color="#F59E0B"
      >
        <DropdownItem 
          icon="📦" 
          name="Toutes mes commandes" 
          path="/mes-commandes" 
          color="#F59E0B" 
        />
        <DropdownItem 
          icon="🔄" 
          name="Commandes en cours" 
          path="/mes-commandes?filter=processing" 
          color="#3b82f6" 
        />
        <DropdownItem 
          icon="✅" 
          name="Commandes livrées" 
          path="/mes-commandes?filter=delivered" 
          color="#10b981" 
        />
        <DropdownItem 
          icon="🧾" 
          name="Tickets de livraison" 
          path="/mes-tickets" 
          color="#ec4899" 
        />
      </DropdownHeader>

      {/* DROPDOWN: Transactions */}
      <DropdownHeader 
        title="Transactions" 
        emoji={emojis.transaction} 
        dropdownName="mesTransactions"
        color="#10B981"
      >
        <DropdownItem 
          icon="💰" 
          name="Mes crédits" 
          path="/mes-credits" 
          color="#10B981" 
        />
        <DropdownItem 
          icon="💳" 
          name="Recharger" 
          path="/recharger-credits" 
          color="#8b5cf6" 
        />
        <DropdownItem 
          icon="📊" 
          name="Historique" 
          path="/historique-transactions" 
          color="#6b7280" 
        />
        <DropdownItem 
          icon="📈" 
          name="Statistiques" 
          path="/stats-transactions" 
          color="#f59e0b" 
        />
      </DropdownHeader>
    </>
  );

  // Contenido para usuario autenticado (vista normal)
  const renderLoggedInContent = () => (
    <>
      <LinkItem 
        emoji={darkMode ? emojis.sun : emojis.moon} 
        name={darkMode ? 'Mode Clair' : 'Mode Sombre'} 
        onClick={toggleDarkMode} 
        color={darkMode ? '#f59e0b' : '#4b5563'} 
      />

      <LinkItem 
        emoji={emojis.dashboard} 
        name="Mon Tableau de bord" 
        path="/users/dashboard" 
        color="#8b5cf6" 
        isDashboardLink={true}
      />
      
      <LinkItem 
        emoji="👤"
        name="Mon profil" 
        path={`/profile/${auth.user?._id}`}
        color="#8b5cf6" 
        isDashboardLink={true}
      />
    </>
  );

  // Contenido para usuario sin autenticar
  const renderGuestContent = () => (
    <>
      <LinkItem 
        emoji={darkMode ? emojis.sun : emojis.moon} 
        name={darkMode ? 'Mode Clair' : 'Mode Sombre'} 
        onClick={toggleDarkMode} 
        color={darkMode ? '#f59e0b' : '#4b5563'} 
      />

      <div style={{ margin: '20px 0 5px 16px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>
        {emojis.user} Compte
      </div>
      
      <LinkItem emoji={emojis.login} name="Se connecter" path="/login" color="#10b981" />
      <LinkItem emoji={emojis.register} name="S'inscrire" path="/register" color="#667eea" />
    </>
  );

  // 🔥 RENDERIZAR CATEGORÍAS CON SOPORTE PARA IMÁGENES
  const renderCategories = () => (
    <>
      <div style={{ margin: '20px 0 5px 16px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>
        {emojis.categories} Catégories
      </div>
      
      {categoryItems.map((category, index) => {
        const iconData = getCategoryIcon(category, category.color);
        
        return (
          <div
            key={index}
            onClick={() => handleCategoryClick(category)}
            style={{
              padding: '10px 16px',
              margin: '2px 0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${category.color}06`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {iconData.type === 'image' ? (
                <img 
                  src={iconData.value}
                  alt={category.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={() => handleImageError(category.slug)}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {iconData.value}
                </span>
              )}
            </div>
            
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              {category.name}
            </span>
          </div>
        );
      })}
    </>
  );

  // Renderizar contenido principal
  const renderMainContent = () => {
    if (isDashboardPage && auth.user) {
      return renderDashboardContent();
    }
    
    if (!auth.user) {
      return (
        <>
          {renderGuestContent()}
          {renderCategories()}
        </>
      );
    }
    
    return (
      <>
        {renderLoggedInContent()}
        {renderCategories()}
      </>
    );
  };

  return (
    <Offcanvas 
      show={show} 
      onHide={onHide}
      placement="start"
      className="drawer"
      style={{
        width: width,
        height: height,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Encabezado del Drawer */}
      <div style={{
        padding: '15px 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {auth.user && (
            <span style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: '600'
            }}>
              {auth.user.name || auth.user.username}
            </span>
          )}
          {/* Badge Pro en el header */}
          {isProActive && (
            <span style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>⭐</span> PRO
            </span>
          )}
        </div>
        
        {/* Selector de idioma y botón cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div style={{ 
    display: 'flex', 
    gap: '6px', 
    marginRight: '10px',
    background: '#f3f4f6',
    padding: '4px',
    borderRadius: '12px'
  }}>
    {[
      { code: 'ar', label: 'AR', title: 'العربية' },
      { code: 'fr', label: 'FR', title: 'Français' },
      { code: 'en', label: 'EN', title: 'English' }
    ].map((lang) => {
      const isActive = currentLang === lang.code;
      const useGoogleTranslate = localStorage.getItem('useGoogleTranslate') === 'true';
      const isTranslateActive = useGoogleTranslate && localStorage.getItem('targetTranslateLang') === lang.code;
      
      return (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isActive || isTranslateActive ? '#667eea' : 'transparent',
            border: isTranslateActive ? '2px solid #10b981' : 'none',
            color: isActive || isTranslateActive ? 'white' : '#6b7280',
            fontWeight: '600',
            fontSize: lang.code === 'ar' ? '1rem' : '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title={lang.title}
          className="notranslate"
          translate="no"
        >
          <span className="notranslate" translate="no">
            {lang.label}
          </span>
        </button>
      );
    })}
  </div>
 
  <button
    onClick={onHide}
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: '#f3f4f6',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      transition: 'all 0.2s ease'
    }}
    title="Fermer"
    className="notranslate"
    translate="no"
  >
    <span className="notranslate" translate="no">✕</span>
  </button>
</div>
      </div>
      
      {/* Contenido del Drawer */}
      <Offcanvas.Body style={{ 
        overflowY: 'auto',
        padding: '10px 0',
        scrollbarWidth: 'thin'
      }}>
        {renderMainContent()}
        
        {/* Enlaces útiles (siempre visibles) */}
        <div style={{ margin: '30px 0 15px 16px', fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>
          🔗 Liens utiles
        </div>
        
        <LinkItem emoji="❓" name="Comment annoncer ?" path="/bloginfo" color="#6b7280" />
        <LinkItem emoji="✉️" name="Contactez-nous" path="/users/contactt" color="#6b7280" />
        <LinkItem emoji="🛡️" name="Politique de confidentialité" path="/bloginfo" color="#6b7280" />
        
        {/* Footer */}
        <div style={{
          marginTop: '30px',
          padding: '15px 16px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '0.7rem',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '8px' }}>
            <span>🛡️</span>
            <span>Plateforme sécurisée</span>
          </div>
          © {new Date().getFullYear()} MarketPlace Djamel Tous droits réservés.
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Drawer;
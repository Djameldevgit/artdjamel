// components/Navbar2.jsx - VERSIÓN CON NAVEGACIÓN DE ÓRDENES Y ENCARGOS
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/actions/authAction';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import {
  FaTools,
  FaShieldAlt,
  FaUsers,
  FaUserCog,
  FaSignOutAlt,
  FaInfoCircle,
  FaSignInAlt,
  FaUserPlus,
  FaShareAlt,
  FaBars,
  FaPlus,
  FaSearch,
  FaBell,
  FaUserCircle,
  FaDownload,
  FaTimes,
  FaShoppingCart,
  FaClipboardList,   // 🆕 para "Mis encargos"
  FaInbox            // 🆕 para "Encargos recibidos"
} from 'react-icons/fa';

import { Navbar, Container, NavDropdown, Badge, Button } from 'react-bootstrap';
import VerifyModal from '../authAndVerify/VerifyModal';
import DesactivateModal from '../authAndVerify/DesactivateModal';
import MultiCheckboxModal from './MultiCheckboxModal.';
import ShareAppModal from '../shareAppModal';
import Drawer from './Drawer';

const Navbar2 = () => {
  const { auth, cart, notify, settings } = useSelector((state) => state);
  const dispatch = useDispatch();

  const { t } = useTranslation('navbar2');
  const history = useHistory();

  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const notifyDropdownRef = useRef(null);

  // ✅ Función para abrir el drawer
  const handleDrawerOpen = () => {
    console.log('Abriendo drawer...');
    setShowDrawer(true);
  };

  // ✅ Función para cerrar el drawer
  const handleDrawerClose = () => {
    console.log('Cerrando drawer...');
    setShowDrawer(false);
  };

  // Handle resize
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 700), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle scroll navbar
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // PWA installation
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }
    const handleInstallAvailable = () => setShowInstallButton(true);
    const handleInstalled = () => {
      setIsPWAInstalled(true);
      setShowInstallButton(false);
    };
    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);
    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        if (!showInstallButton && !isPWAInstalled) setShowInstallButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstallButton, isPWAInstalled]);

  const handleInstallPWA = async () => {
    try {
      if (window.installPWA) {
        const installed = await window.installPWA();
        if (installed) {
          setShowInstallButton(false);
          setIsPWAInstalled(true);
        }
      } else {
        window.open('/?install-pwa=true', '_blank');
      }
    } catch (error) {
      console.error('Error instalando PWA:', error);
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    dispatch(logout());
    setTimeout(() => (window.location.href = '/login'), 100);
  };

  const handleLogin = () => {
    setDropdownOpen(false);
    history.push('/login');
  };

  const handleRegister = () => {
    setDropdownOpen(false);
    history.push('/register');
  };

  if (!settings || Object.keys(settings).length === 0) {
    return (
      <nav className="navbar navbar-light bg-light nb2-fallback" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1030 }}>
        <span className="navbar-brand">Chargement...</span>
      </nav>
    );
  }

  const unreadNotifications = notify?.data?.filter(n => n && !n.isRead).length || 0;
  const cartItemCount = cart?.totalItems || 0;

  const MenuItem = ({ icon: Icon, iconColor, to, onClick, children, danger = false }) => {
    const handleClick = (e) => {
      if (onClick) onClick(e);
      setDropdownOpen(false);
      if (to) history.push(to);
    };
    return (
      <NavDropdown.Item
        as="button"
        onClick={handleClick}
        className={`custom-menu-item ${danger ? 'text-danger' : ''}`}
        style={{
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          margin: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: '500',
          width: 'calc(100% - 16px)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <Icon className="me-2" style={{ color: iconColor, fontSize: '1rem', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      </NavDropdown.Item>
    );
  };

  return (
    <>
      <Navbar
        className={`navbar2 ${!isNavbarVisible ? 'nb2-hidden' : ''}`}
        style={{
          zIndex: 1030,
          background: settings.style
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          padding: isMobile ? '6px 0' : '8px 0',
          boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
          minHeight: isMobile ? '56px' : '64px',
          transition: 'transform 0.3s ease-in-out',
          transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)'
        }}
        fixed="top"
        expand="lg"
      >
        <Container fluid className="align-items-center justify-content-between" style={{ padding: isMobile ? '0 12px' : '0 20px' }}>
          {/* Logo y marca */}
          <div className="d-flex align-items-center" style={{ minWidth: 0, flex: '0 1 auto' }}>
            <Link to="/" className="btn p-0" style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', marginRight: isMobile ? '6px' : '10px' }}>
              <img src="/images/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Link>
            {!isMobile && (
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Navbar.Brand className="py-0 mb-0">
                  <Card.Title className="mb-0" style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {t('appName') || 'MarketPlace'}
                  </Card.Title>
                </Navbar.Brand>
              </Link>
            )}
          </div>

          {/* Iconos de acción */}
          <div className="d-flex align-items-center" style={{ gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
            <Link to="/search" className="icon-button" style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)' }}>
              <FaSearch size={isMobile ? 16 : 18} style={{ color: '#667eea' }} />
            </Link>

            {showInstallButton && !isPWAInstalled && (
              <button onClick={handleInstallPWA} className="icon-button" style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(40, 167, 69, 0.1)', border: '2px solid #28a745', animation: 'pulse 2s infinite' }}>
                <FaDownload size={isMobile ? 16 : 18} style={{ color: '#28a745' }} />
              </button>
            )}

            {/* 🛒 CARRITO */}
            {auth.user && (
              <Link to="/cart" className="icon-button" style={{ position: 'relative', width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)' }}>
                <FaShoppingCart size={isMobile ? 18 : 20} style={{ color: '#667eea' }} />
                {cartItemCount > 0 && (
                  <Badge pill style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', fontSize: '0.6rem', padding: '3px 6px', minWidth: '20px' }}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Badge>
                )}
              </Link>
            )}

            {/* Notificaciones */}
            {auth.user && (
              <div className="position-relative icon-button" ref={notifyDropdownRef} style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)' }}>
                <Link to="/notify" style={{ display: 'flex' }}>
                  <FaBell size={isMobile ? 18 : 20} style={{ color: unreadNotifications > 0 ? '#f5576c' : '#667eea' }} />
                </Link>
                {unreadNotifications > 0 && (
                  <Badge pill style={{ fontSize: '0.6rem', position: 'absolute', top: '-4px', right: '-4px', padding: '3px 6px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </div>
            )}

            {/* Dropdown usuario */}
            <NavDropdown
              align="end"
              show={dropdownOpen}
              onToggle={(isOpen) => setDropdownOpen(isOpen)}
              title={
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {auth.user ? (
                    <div style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', padding: '2px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <img
                        src={auth.user.avatar || 'https://res.cloudinary.com/dzd58nm3l/image/upload/v1780538635/defalut-avatar_tfvwxr.png'}
                        alt="avatar"
                        style={{ borderRadius: '8px', width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('❌ Error cargando avatar:', auth.user.avatar);
                          e.target.src = 'https://res.cloudinary.com/dzd58nm3l/image/upload/v1780538635/defalut-avatar_tfvwxr.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '10px', backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaUserCircle size={isMobile ? 22 : 26} style={{ color: '#667eea' }} />
                    </div>
                  )}
                </div>
              }
              id="nav-user-dropdown"
              className="custom-dropdown"
            >
              <div className="dropdown-scroll-wrapper">
                {auth.user ? (
                  <>
                  {/* Header usuario */}
                  <div className="user-header">
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-white user-name">
                          {auth.user.username} -
                          <div className="user-role-badge">
                            {auth.user.role === 'admin' ? `👑 Admin` :
                              auth.user.role === 'Moderateur' ? `🛡️ Modérateur` :
                                auth.user.role === 'Super-utilisateur' ? `⭐ Super Utilisateur` : `👤 Utilisateur`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <NavDropdown.Divider />
          
                  {/* ✅ Admin: Publier une œuvre */}
                  {auth.user.role === 'admin' && (
                    <MenuItem icon={FaPlus} iconColor="#28a745" to="/create-video-page">
                      Publier une œuvre
                    </MenuItem>
                  )}
          
                  {/* ✅ ADMIN: VER TODOS LOS ACHATS (compras de todos los usuarios) */}
                  {auth.user.role === 'admin' && (
                    <MenuItem icon={FaShoppingCart} iconColor="#ffc107" to="/adminorders">
                      Voir les achats
                    </MenuItem>
                  )}
          
                  {/* ✅ USUARIO NORMAL: VER SUS ACHATS (sus propias compras) */}
                  {auth.user.role !== 'admin' && (
                    <MenuItem icon={FaShoppingCart} iconColor="#ffc107" to="/userorders">
                       Voir mes achats
                    </MenuItem>
                  )}
          
                  {/* 🆕 Créer une commande (encargo) - para todos */}
                  <MenuItem  icon={FaPlus}  iconColor="#28a745" to="/creer-une-commande">
                  Créer une commande
                  </MenuItem>
          
                  {/* ✅ Mes commandes (encargos del usuario) - para todos */}
                  <MenuItem icon={FaClipboardList} iconColor="#17a2b8" to="/mes-commandes">
                     Mes commandes 
                  </MenuItem>
          
                  {/* ✅ Commandes reçues (solo admin) */}
                  {auth.user.role === 'admin' && (
                    <MenuItem icon={FaInbox} iconColor="#fd7e14" to="/encargos-recibidos">
                      Commandes reçues
                    </MenuItem>
                  )}
          
                  {/* Otras opciones */}
                  <MenuItem icon={FaUserCircle} iconColor="#667eea" to={`/profile/${auth.user._id}`}>
                    Mon Profil
                  </MenuItem>
                  <MenuItem icon={FaShareAlt} iconColor="#ffc107" onClick={() => setShowShareModal(true)}>
                    Partager l'App
                  </MenuItem>
          
                  {/* ✅ Acciones de administración (solo admin y super-usuario) */}
                  {(auth.user.role === 'admin' || auth.user.role === 'Super-utilisateur') && (
                    <>
                      <NavDropdown.Divider />
                      <MenuItem icon={FaUsers} iconColor="#28a745" to="/admindashboard">
                        Dashboard Admin
                      </MenuItem>
                      <MenuItem icon={FaUserCog} iconColor="#667eea" to="/users">
                        Gestion utilisateurs
                      </MenuItem>
                      <MenuItem icon={FaTools} iconColor="#6c757d" to="/users/roles">
                        Gestion rôles
                      </MenuItem>
                    </>
                  )}
          
                  <NavDropdown.Divider />
                  <MenuItem icon={FaSignOutAlt} iconColor="#dc3545" onClick={handleLogout} danger>
                    Se déconnecter
                  </MenuItem>
                </>
                  
                ) : (
                  <>
                    <MenuItem icon={FaSignInAlt} iconColor="#28a745" onClick={handleLogin}>
                      Se connecter
                    </MenuItem>
                    <MenuItem icon={FaUserPlus} iconColor="#667eea" onClick={handleRegister}>
                      S'inscrire
                    </MenuItem>
                  </>
                )}
              </div>
            </NavDropdown>

            {/* ✅ BOTÓN DEL DRAWER */}
            <button
              onClick={handleDrawerOpen}
              className="icon-button"
              style={{
                width: isMobile ? '38px' : '42px',
                height: isMobile ? '38px' : '42px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: settings.style ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title={t('menu') || 'Menu'}
              aria-label="Abrir menú"
            >
              <FaBars size={isMobile ? 18 : 20} style={{ color: settings.style ? '#ffffff' : '#667eea' }} />
            </button>
          </div>
        </Container>
      </Navbar>

      <div style={{ height: isMobile ? '56px' : '64px' }} />

      {/* DRAWER */}
      <Drawer
        show={showDrawer}
        onHide={handleDrawerClose}
        position="start"
        title={t('menu') || "Menu"}
        user={auth.user}
      />

      {/* Modales */}
      <VerifyModal show={showVerifyModal} onClose={() => setShowVerifyModal(false)} />
      <DesactivateModal show={showDeactivatedModal} onClose={() => setShowDeactivatedModal(false)} />
      <MultiCheckboxModal show={showFeaturesModal} onClose={() => setShowFeaturesModal(false)} />
      <ShareAppModal show={showShareModal} onClose={() => setShowShareModal(false)} />

      {/* Estilos CSS */}
      <style>{`
        .nb2-hidden { transform: translateY(-100%); }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .icon-button { cursor: pointer; transition: all 0.3s ease; }
        .icon-button:hover { transform: translateY(-2px); }
        .custom-menu-item { color: ${settings.style ? '#ffffff' : '#333333'} !important; cursor: pointer; background: transparent !important; }
        .custom-menu-item:hover { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important; transform: translateX(4px); }
        .dropdown-scroll-wrapper { max-height: 70vh; overflow-y: auto; padding: 8px 0; }
        .user-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px; margin: 0 0 8px 0; border-radius: 12px 12px 0 0; }
        .user-avatar-wrapper { width: 50px; height: 50px; border-radius: 50%; border: 3px solid white; padding: 2px; background: white; }
        .user-name { font-size: 1rem; }
        .user-role-badge { font-size: 0.8rem; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-top: 4px; color: white; }
        #nav-user-dropdown + .dropdown-menu { position: absolute !important; right: 0 !important; left: auto !important; width: 290px !important; border-radius: 12px !important; background: ${settings.style ? '#2d3748' : '#ffffff'} !important; }
        @media (max-width: 700px) { #nav-user-dropdown + .dropdown-menu { width: 280px !important; } .custom-menu-item { padding: 10px 14px !important; } }
      `}</style>
    </>
  );
};

export default Navbar2;
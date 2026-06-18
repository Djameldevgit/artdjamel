import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHome, FaUser, FaList, FaPlus, FaShoppingCart, 
  FaTicketAlt, FaStore, FaBullhorn, 
  FaCreditCard, FaCog, FaChartLine, FaBell,
  FaChevronDown, FaSignOutAlt
} from 'react-icons/fa';
import { logout } from '../../redux/actions/authAction';
import { useDispatch } from 'react-redux';

const DashboardNavbar = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { auth } = useSelector(state => state);

  // Items principales del navbar
  const mainItems = [
    { 
      icon: FaHome, 
      label: 'Tableau de bord', 
      path: '/users/dashboard',
      color: '#667eea'
    },
    { 
      icon: FaUser, 
      label: 'Mon Profil', 
      path: `/profile/${auth.user?._id}`,
      color: '#f093fb'
    }
  ];

  // Menús desplegables - Solo los necesarios
  const dropdownMenus = [
    {
      id: 'annonces',
      label: 'Annonces',
      icon: FaList,
      color: '#48c6ef',
      items: [
        { label: 'Mes Annonces', path: '/mes-annonces', icon: FaList },
        { label: 'Ajouter Annonce', path: '/creer-annonce', icon: FaPlus, color: '#28a745' },
      ]
    },
    {
      id: 'boutiques',
      label: 'Boutiques',
      icon: FaStore,
      color: '#ec4899',
      items: [
        { label: 'Mes Boutiques', path: '/mes-boutiques', icon: FaStore },
        { label: 'Créer une boutique', path: '/create-boutique', icon: FaPlus, color: '#10b981' },
        { label: 'Mes Produits', path: `/mes-produits-boutique`, icon: FaShoppingCart, note: 'Nécessite boutiqueId' }
      ]
    },
    {
      id: 'commandes',
      label: 'Commandes',
      icon: FaShoppingCart,
      color: '#f59e0b',
      items: [
        { label: 'Mes Commandes', path: '/mes-commandes', icon: FaShoppingCart },
        { label: 'Tickets Livraison', path: '/mes-tickets', icon: FaTicketAlt },
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: FaCreditCard,
      color: '#10b981',
      items: [
        { label: 'Mes Crédits', path: '/mes-credits', icon: FaCreditCard },
        { label: 'Historique', path: '/historique-transactions', icon: FaChartLine },
      ]
    }
  ];

  // Acciones del navbar (derecha)
  const rightActions = [
    { icon: FaCog, label: 'Paramètres', path: '/profile/settings', color: '#6b7280' },
    { icon: FaBell, label: 'Notifications', path: '/mes-notifications', color: '#f59e0b', badge: true },
    { icon: FaSignOutAlt, label: 'Déconnexion', action: 'logout', color: '#ef4444' }
  ];

  const toggleDropdown = (menuId) => {
    setActiveDropdown(activeDropdown === menuId ? null : menuId);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const handleNavigation = (path) => {
    if (path) {
      history.push(path);
    }
    closeDropdowns();
  };

  const handleLogout = () => {
    dispatch(logout());
    closeDropdowns();
    history.push('/');
  };

  const handleAction = (action) => {
    if (action === 'logout') {
      handleLogout();
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Obtener notificaciones no leídas (ejemplo)
  const unreadNotifications = auth.user?.unreadNotifications || 0;

  return (
    <nav style={styles.navbar} onMouseLeave={closeDropdowns}>
      <div style={styles.navContainer}>
        
        {/* Logo / Marca */}
        <div style={styles.logo} onClick={() => handleNavigation('/users/dashboard')}>
          <span style={styles.logoText}>MarketPlace</span>
          <span style={styles.logoBadge}>Pro</span>
        </div>

        {/* Items principales */}
        <div style={styles.mainItems}>
          {mainItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              style={{
                ...styles.navButton,
                backgroundColor: isActive(item.path) ? `${item.color}12` : 'transparent',
                borderBottom: isActive(item.path) ? `3px solid ${item.color}` : '3px solid transparent'
              }}
            >
              <item.icon style={{ 
                ...styles.navIcon, 
                color: isActive(item.path) ? item.color : '#6c757d' 
              }} />
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div style={styles.dropdowns}>
          {dropdownMenus.map((menu) => (
            <div 
              key={menu.id} 
              style={styles.dropdownWrapper}
              onMouseEnter={() => setActiveDropdown(menu.id)}
            >
              <button
                onClick={() => toggleDropdown(menu.id)}
                style={{
                  ...styles.dropdownButton,
                  backgroundColor: activeDropdown === menu.id ? `${menu.color}12` : 'transparent',
                  borderBottom: activeDropdown === menu.id ? `3px solid ${menu.color}` : '3px solid transparent'
                }}
              >
                <menu.icon style={{ 
                  ...styles.dropdownIcon, 
                  color: activeDropdown === menu.id ? menu.color : '#6c757d' 
                }} />
                <span style={styles.dropdownLabel}>{menu.label}</span>
                <FaChevronDown style={{
                  ...styles.chevron,
                  transform: activeDropdown === menu.id ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </button>

              {/* Dropdown menu */}
              {activeDropdown === menu.id && (
                <div style={styles.dropdownMenu}>
                  {menu.items.map((item, index) => {
                    // Si es la ruta de productos, requiere boutiqueId (manejo especial)
                    const isProductsRoute = item.path === '/mes-produits-boutique';
                    const finalPath = isProductsRoute && auth.user?.boutiques?.[0]?._id 
                      ? `/mes-produits-boutique/${auth.user.boutiques[0]._id}`
                      : item.path;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigation(finalPath)}
                        style={styles.dropdownMenuItem}
                        disabled={isProductsRoute && !auth.user?.boutiques?.length}
                      >
                        {item.icon && <item.icon style={{ 
                          ...styles.dropdownItemIcon, 
                          color: item.color || menu.color 
                        }} />}
                        <span style={styles.dropdownItemLabel}>{item.label}</span>
                        {item.note && !auth.user?.boutiques?.length && (
                          <span style={styles.dropdownItemNote}>⚠️</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Acciones derecha */}
        <div style={styles.rightSection}>
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action.action === 'logout') {
                  handleAction(action.action);
                } else if (action.path) {
                  handleNavigation(action.path);
                }
              }}
              style={{
                ...styles.rightButton,
                backgroundColor: isActive(action.path) ? `${action.color}12` : 'transparent'
              }}
              title={action.label}
            >
              <action.icon style={{ 
                color: isActive(action.path) ? action.color : '#6c757d',
                fontSize: '18px'
              }} />
              {action.badge && unreadNotifications > 0 && (
                <span style={styles.badge}>{unreadNotifications}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%'
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    gap: '20px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    flexShrink: 0
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  logoBadge: {
    fontSize: '0.7rem',
    backgroundColor: '#ec4899',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '600'
  },
  mainItems: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px',
    height: '64px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#374151',
    borderRadius: '0'
  },
  navIcon: {
    fontSize: '1rem',
    transition: 'color 0.2s ease'
  },
  navLabel: {
    whiteSpace: 'nowrap'
  },
  dropdowns: {
    display: 'flex',
    gap: '4px',
    flex: 1,
    justifyContent: 'center'
  },
  dropdownWrapper: {
    position: 'relative'
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px',
    height: '64px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#374151',
    whiteSpace: 'nowrap'
  },
  dropdownIcon: {
    fontSize: '1rem',
    transition: 'color 0.2s ease'
  },
  dropdownLabel: {
    fontSize: '0.85rem'
  },
  chevron: {
    fontSize: '0.7rem',
    transition: 'transform 0.3s ease',
    marginLeft: '4px',
    color: '#9ca3af'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    minWidth: '220px',
    zIndex: 1001,
    overflow: 'hidden',
    marginTop: '4px'
  },
  dropdownMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontSize: '0.85rem',
    color: '#374151',
    textAlign: 'left'
  },
  dropdownItemIcon: {
    fontSize: '0.9rem',
    flexShrink: 0
  },
  dropdownItemLabel: {
    flex: 1
  },
  dropdownItemNote: {
    fontSize: '0.7rem',
    color: '#f59e0b',
    marginLeft: '8px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },
  rightButton: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  }
};

// Agregar hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .dashboard-nav-btn:hover {
    background-color: #f3f4f6 !important;
  }
  .dashboard-dropdown-item:hover {
    background-color: #f9fafb !important;
  }
  .dashboard-right-btn:hover {
    background-color: #f3f4f6 !important;
  }
`;
document.head.appendChild(styleSheet);

export default DashboardNavbar;
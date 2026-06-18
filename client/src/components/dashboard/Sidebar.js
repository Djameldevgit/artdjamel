// src/components/dashboard/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUser, FaList, FaPlus, FaShoppingCart, 
  FaTicketAlt, FaPlane, FaStore, FaBullhorn, 
  FaCreditCard, FaCog, FaSignOutAlt, FaChartLine,
  FaBox, FaShippingFast, FaFileInvoiceDollar
} from 'react-icons/fa';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const menuItems = [
    { icon: FaHome, label: 'Tableau de bord', path: '/dashboard', color: '#667eea' },
    { icon: FaUser, label: 'Mon Profil', path: '/profile', color: '#f093fb' },
    { icon: FaChartLine, label: 'Statistiques', path: '/statistiques', color: '#37ecba' },
    
    // Annonces
    { icon: FaList, label: 'Mes Annonces', path: '/mes-annonces', color: '#48c6ef' },
    { icon: FaPlus, label: 'Ajouter Annonce', path: '/creer-annonce', color: '#28a745' },
    
    // Commandes
    { icon: FaShoppingCart, label: 'Mes Commandes', path: '/mes-commandes', color: '#f5576c' },
    { icon: FaTicketAlt, label: 'Tickets Livraison', path: '/tickets-livraison', color: '#6a11cb' },
    
    // Voyage
    { icon: FaPlane, label: 'Demandes Devis', path: '/demandes-devis', color: '#ff9a9e' },
    
    // Publicité
    { icon: FaStore, label: 'Achat Store', path: '/achat-store', color: '#a18cd1' },
    { icon: FaBullhorn, label: 'Achat Publicité', path: '/achat-publicite', color: '#fbc2eb' },
    
    // Transactions
    { icon: FaCreditCard, label: 'Transactions', path: '/transactions', color: '#667eea' },
    
    // Paramètres
    { icon: FaCog, label: 'Paramètres', path: '/parametres', color: '#6c757d' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.sidebar}>
      {/* Logo/Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Mon Espace</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav style={styles.nav}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            style={{
              ...styles.navItem,
              backgroundColor: isActive(item.path) ? `${item.color}15` : 'transparent',
              borderLeft: isActive(item.path) ? `3px solid ${item.color}` : 'none'
            }}
          >
            <item.icon 
              style={{ 
                ...styles.navIcon, 
                color: isActive(item.path) ? item.color : '#6c757d' 
              }} 
            />
            <span style={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer del sidebar */}
      <div style={styles.footer}>
        <div style={styles.userSummary}>
          <div style={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} style={styles.avatarImage} />
            ) : (
              <FaUser size={20} />
            )}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.username}</div>
            <div style={styles.userStatus}>
              <span style={styles.statusDot} /> En ligne
            </div>
          </div>
        </div>
        
        <button style={styles.logoutButton}>
          <FaSignOutAlt style={styles.logoutIcon} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  header: {
    padding: '20px 15px',
    borderBottom: '1px solid #e0e0e0'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  nav: {
    flex: 1,
    padding: '15px 0',
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    margin: '4px 10px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  navIcon: {
    fontSize: '18px',
    marginRight: '12px',
    transition: 'all 0.2s ease'
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500'
  },
  footer: {
    padding: '15px',
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa'
  },
  userSummary: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginRight: '12px',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  userStatus: {
    fontSize: '12px',
    color: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    marginRight: '6px'
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  logoutIcon: {
    fontSize: '16px'
  }
};

export default Sidebar;
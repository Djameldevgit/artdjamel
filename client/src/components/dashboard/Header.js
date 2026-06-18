// src/components/dashboard/Header.js
import React from 'react';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';

const Header = ({ user }) => {
  return (
    <header style={styles.header}>
      {/* Barra de búsqueda */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher dans votre dashboard..."
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Notificaciones y perfil */}
      <div style={styles.profileSection}>
        {/* Notificaciones */}
        <button style={styles.notificationButton}>
          <FaBell size={20} />
          <span style={styles.notificationBadge}>3</span>
        </button>

        {/* Información del usuario */}
        <div style={styles.userInfo}>
          <div style={styles.avatarContainer}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                style={styles.avatar}
              />
            ) : (
              <FaUserCircle size={32} style={styles.avatarIcon} />
            )}
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user.username}</div>
            <div style={styles.userRole}>
              {user.role === 'admin' ? '👑 Administrateur' :
               user.role === 'Moderateur' ? '🛡️ Modérateur' :
               user.role === 'Super-utilisateur' ? '⭐ Super Utilisateur' :
               '👤 Utilisateur'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  searchContainer: {
    flex: 1,
    maxWidth: '500px'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6c757d',
    fontSize: '18px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px 10px 40px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  notificationButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#f5576c',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #667eea'
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
    color: '#667eea'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333'
  },
  userRole: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '2px'
  }
};

export default Header;
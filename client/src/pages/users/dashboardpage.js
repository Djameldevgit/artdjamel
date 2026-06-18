import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import { FaEnvelope, FaBell, FaPlusCircle, FaCheckCircle, FaExclamationTriangle, FaStore, FaAd, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import DashboardHeader from '../../components/dashboard/Header';

const DashboardPage = () => {
  const { auth } = useSelector(state => state);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Configuración responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!auth.user) {
      history.push('/login');
    }
  }, [auth.user, history]);

  // Verificar si el email está verificado
  const isEmailVerified = auth.user?.verified === true || auth.user?.emailVerified === true;

  if (!auth.user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Función para navegar a crear anuncio
  const handleCreateAnnonce = () => {
    history.push('/creer-annonce');
  };

  // Función para navegar a notificaciones
  const handleNotifications = () => {
    history.push('/mes-notifications');
  };

  // Función para reenviar verificación
  const handleResendVerification = () => {
    // Aquí puedes agregar la lógica para reenviar el email de verificación
    alert('Un email de vérification a été envoyé à ' + auth.user?.email);
  };

  return (
    <div style={styles.container}>
      {/* Navbar solo en desktop */}
      {!isMobile && <DashboardNavbar />}

      {/* Contenido principal */}
      <div style={styles.main}>
        <DashboardHeader user={auth.user} />
        
        <div style={styles.content}>
          
          {/* ============ CARDS SECTION ============ */}
          <div style={styles.cardsGrid}>
            
            {/* CARD 1: Verificación de email - Solo visible si no está verificado */}
            {!isEmailVerified && (
              <div style={{ ...styles.card, ...styles.cardWarning }}>
                <div style={styles.cardIconWarning}>
                  <FaExclamationTriangle size={32} />
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>Vérification email requise</h3>
                  <p style={styles.cardText}>
                    Votre adresse email n'est pas encore vérifiée. 
                    Cliquez sur le lien reçu par email ou demandez un nouveau lien.
                  </p>
                  <button 
                    onClick={handleResendVerification}
                    style={styles.cardButtonWarning}
                  >
                    Renvoyer l'email de vérification
                  </button>
                </div>
              </div>
            )}

            {/* CARD 2: Notificaciones */}
            <div style={styles.card} onClick={handleNotifications}>
              <div style={styles.cardIconPrimary}>
                <FaBell size={32} />
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Notifications</h3>
                <p style={styles.cardText}>
                  Consultez vos dernières alertes, messages et mises à jour importantes
                </p>
                <span style={styles.cardLink}>Voir les notifications →</span>
              </div>
            </div>

            {/* CARD 3: Publier un produit */}
            <div style={styles.card} onClick={handleCreateAnnonce}>
              <div style={styles.cardIconSuccess}>
                <FaPlusCircle size={32} />
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Publier une annonce</h3>
                <p style={styles.cardText}>
                  Créez une nouvelle annonce pour vendre vos produits ou services
                </p>
                <span style={styles.cardLink}>Créer une annonce →</span>
              </div>
            </div>
          </div>

          {/* ============ ACCIONES RÁPIDAS (Opciones del drawer) ============ */}
          <div style={styles.quickActionsSection}>
            <h2 style={styles.sectionTitle}>Accès rapide</h2>
            <div style={styles.quickActionsGrid}>
              
              {/* Mon Compte */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>👤</span> Mon Compte
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/users/dashboard" style={styles.actionLink}>📊 Tableau de bord</Link>
                  <Link to="/profile/settings" style={styles.actionLink}>⚙️ Paramètres du profil</Link>
                </div>
              </div>

              {/* Mes Annonces */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>📢</span> Mes Annonces
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/mes-annonces" style={styles.actionLink}>📋 Toutes mes annonces</Link>
                  <Link to="/mes-annonces?filter=active" style={styles.actionLink}>🆕 Annonces actives</Link>
                  <Link to="/creer-annonce" style={styles.actionLink}>📝 Ajouter une annonce</Link>
                </div>
              </div>

              {/* Mes Boutiques */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>🏪</span> Mes Boutiques
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/mes-boutiques" style={styles.actionLink}>🏪 Toutes mes boutiques</Link>
                  <Link to="/create-boutique" style={styles.actionLink}>✨ Créer une boutique</Link>
                </div>
              </div>

              {/* Mes Commandes */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>📦</span> Mes Commandes
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/mes-commandes" style={styles.actionLink}>📦 Toutes mes commandes</Link>
                  <Link to="/mes-tickets" style={styles.actionLink}>🧾 Tickets de livraison</Link>
                </div>
              </div>

              {/* Transactions */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>💰</span> Transactions
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/mes-credits" style={styles.actionLink}>💰 Mes crédits</Link>
                  <Link to="/historique-transactions" style={styles.actionLink}>📊 Historique</Link>
                </div>
              </div>

              {/* Liens utiles */}
              <div style={styles.actionGroup}>
                <h3 style={styles.actionGroupTitle}>
                  <span style={styles.actionGroupIcon}>🔗</span> Liens utiles
                </h3>
                <div style={styles.actionLinks}>
                  <Link to="/bloginfo" style={styles.actionLink}>❓ Comment annoncer ?</Link>
                  <Link to="/users/contactt" style={styles.actionLink}>✉️ Contactez-nous</Link>
                  <Link to="/bloginfo" style={styles.actionLink}>🛡️ Politique de confidentialité</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Nota para móviles */}
          {isMobile && (
            <div style={styles.mobileNote}>
              <div style={styles.noteIcon}>📱</div>
              <div style={styles.noteContent}>
                <h4 style={styles.noteTitle}>Navigation sur mobile</h4>
                <p style={styles.noteText}>
                  Utilisez le menu <strong>(icône ☰ en haut)</strong> pour accéder à toutes les fonctionnalités de votre tableau de bord.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: 1,
    padding: '25px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  // Cards Grid
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    border: '1px solid #e5e7eb'
  },
  cardWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    cursor: 'default'
  },
  cardIconPrimary: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4f46e5',
    flexShrink: 0
  },
  cardIconSuccess: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#16a34a',
    flexShrink: 0
  },
  cardIconWarning: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d97706',
    flexShrink: 0
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#1f2937'
  },
  cardText: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: '0 0 12px 0',
    lineHeight: 1.4
  },
  cardLink: {
    fontSize: '0.8rem',
    color: '#4f46e5',
    fontWeight: '500',
    textDecoration: 'none'
  },
  cardButtonWarning: {
    backgroundColor: '#d97706',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  // Quick Actions Section
  quickActionsSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 20px 0',
    color: '#1f2937',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '12px'
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  actionGroup: {
    borderLeft: '3px solid #e5e7eb',
    paddingLeft: '16px'
  },
  actionGroupTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionGroupIcon: {
    fontSize: '1rem'
  },
  actionLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  actionLink: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.2s',
    display: 'block',
    padding: '4px 0'
  },
  // Mobile Note
  mobileNote: {
    backgroundColor: '#e7f3ff',
    border: '1px solid #b6d4fe',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '20px'
  },
  noteIcon: {
    fontSize: '28px',
    flexShrink: 0
  },
  noteContent: {
    flex: 1
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#084298',
    margin: '0 0 8px 0'
  },
  noteText: {
    fontSize: '14px',
    color: '#055160',
    margin: 0,
    lineHeight: 1.5
  }
};

// Agregar hover effects con CSS-in-JS dinámico
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  }
  .dashboard-action-link:hover {
    color: #4f46e5 !important;
    transform: translateX(4px);
  }
  .dashboard-card-warning-btn:hover {
    background-color: #b45309 !important;
  }
`;
document.head.appendChild(styleSheet);

export default DashboardPage;
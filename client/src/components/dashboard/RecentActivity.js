// src/components/dashboard/RecentActivity.js
import React from 'react';
import { 
  FaShoppingCart, FaEye, FaStar, FaComment, 
  FaBell, FaUserPlus, FaBoxOpen, FaCreditCard 
} from 'react-icons/fa';

const RecentActivity = ({ user }) => {
  const activities = [
    {
      id: 1,
      type: 'commande',
      title: 'Nouvelle commande reçue',
      description: 'Commande #ORD-7842 pour iPhone 13 Pro',
      time: 'Il y a 10 min',
      icon: FaShoppingCart,
      color: '#28a745'
    },
    {
      id: 2,
      type: 'vue',
      title: 'Vue sur votre annonce',
      description: 'Votre annonce "Appartement Paris" a été vue 45 fois',
      time: 'Il y a 30 min',
      icon: FaEye,
      color: '#667eea'
    },
    {
      id: 3,
      type: 'avis',
      title: 'Nouvel avis reçu',
      description: '⭐️⭐️⭐️⭐️⭐️ "Excellent vendeur, livraison rapide"',
      time: 'Il y a 2 heures',
      icon: FaStar,
      color: '#ffc107'
    },
    {
      id: 4,
      type: 'message',
      title: 'Nouveau message',
      description: 'Jean Dupont vous a envoyé un message',
      time: 'Il y a 3 heures',
      icon: FaComment,
      color: '#f093fb'
    },
    {
      id: 5,
      type: 'notification',
      title: 'Rappel de paiement',
      description: 'Paiement pour Publicité Premium dû dans 2 jours',
      time: 'Il y a 5 heures',
      icon: FaBell,
      color: '#f5576c'
    },
    {
      id: 6,
      type: 'follower',
      title: 'Nouveau follower',
      description: 'Marie Martin suit maintenant votre boutique',
      time: 'Il y a 1 jour',
      icon: FaUserPlus,
      color: '#37ecba'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Activité Récente</h3>
        <button style={styles.seeAllButton}>
          Voir tout
        </button>
      </div>
      
      <div style={styles.activitiesList}>
        {activities.map((activity) => (
          <div key={activity.id} style={styles.activityItem}>
            <div style={styles.activityIcon}>
              <div style={{ ...styles.iconContainer, backgroundColor: `${activity.color}15` }}>
                <activity.icon style={{ color: activity.color }} />
              </div>
            </div>
            
            <div style={styles.activityContent}>
              <div style={styles.activityTitle}>{activity.title}</div>
              <div style={styles.activityDescription}>{activity.description}</div>
              <div style={styles.activityTime}>{activity.time}</div>
            </div>
            
            <div style={styles.activityStatus}>
              <div style={{
                ...styles.statusDot,
                backgroundColor: activity.type === 'commande' ? '#28a745' : 
                                activity.type === 'vue' ? '#667eea' :
                                activity.type === 'avis' ? '#ffc107' : '#6c757d'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  seeAllButton: {
    backgroundColor: 'transparent',
    border: '1px solid #667eea',
    color: '#667eea',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  activitiesList: {
    
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease'
  },
  activityIcon: {
    marginRight: '15px'
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  activityDescription: {
    fontSize: '13px',
    color: '#6c757d',
    marginBottom: '4px'
  },
  activityTime: {
    fontSize: '12px',
    color: '#999'
  },
  activityStatus: {
    marginLeft: '15px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  }
};

export default RecentActivity;
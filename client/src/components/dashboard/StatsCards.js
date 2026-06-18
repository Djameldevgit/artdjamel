// src/components/dashboard/StatsCards.js
import React from 'react';
import { 
  FaEye, FaShoppingCart, FaMoneyBillWave, FaStar,
  FaChartBar, FaUsers, FaBoxOpen, FaPercentage
} from 'react-icons/fa';

const StatsCards = ({ user }) => {
  const stats = [
    {
      title: 'Vues Total',
      value: '1,254',
      change: '+12%',
      icon: FaEye,
      color: '#667eea',
      trend: 'up'
    },
    {
      title: 'Commandes',
      value: '48',
      change: '+8%',
      icon: FaShoppingCart,
      color: '#f093fb',
      trend: 'up'
    },
    {
      title: 'Revenus',
      value: '€2,540',
      change: '+23%',
      icon: FaMoneyBillWave,
      color: '#f5576c',
      trend: 'up'
    },
    {
      title: 'Évaluation',
      value: '4.8',
      change: '+0.2',
      icon: FaStar,
      color: '#ffc107',
      trend: 'up'
    },
    {
      title: 'Annonces Actives',
      value: '12',
      change: '+2',
      icon: FaBoxOpen,
      color: '#28a745',
      trend: 'up'
    },
    {
      title: 'Taux de Conversion',
      value: '3.8%',
      change: '+0.5%',
      icon: FaPercentage,
      color: '#37ecba',
      trend: 'up'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Aperçu des Statistiques</h3>
        <select style={styles.select}>
          <option>Ce mois</option>
          <option>Le mois dernier</option>
          <option>Cette année</option>
        </select>
      </div>
      
      <div style={styles.grid}>
        {stats.map((stat, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconContainer, backgroundColor: `${stat.color}15` }}>
                <stat.icon style={{ ...styles.icon, color: stat.color }} />
              </div>
              <div style={styles.trendIndicator}>
                <span style={{
                  ...styles.trendText,
                  color: stat.trend === 'up' ? '#28a745' : '#dc3545'
                }}>
                  {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                </span>
              </div>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.value}>{stat.value}</div>
              <div style={styles.label}>{stat.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontSize: '14px',
    color: '#333',
    outline: 'none',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    fontSize: '24px'
  },
  trendIndicator: {
    fontSize: '14px',
    fontWeight: '600'
  },
  trendText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  cardBody: {
    
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '5px'
  },
  label: {
    fontSize: '14px',
    color: '#6c757d'
  }
};

export default StatsCards;
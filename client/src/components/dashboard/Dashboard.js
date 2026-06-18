// src/components/dashboard/Dashboard.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard-container" style={styles.container}>
      {/* Sidebar para desktop */}
      <div className="dashboard-sidebar" style={styles.sidebar}>
        <Sidebar user={user} />
      </div>

      {/* Contenido principal */}
      <div className="dashboard-main" style={styles.main}>
        <Header user={user} />
        
        <div className="dashboard-content" style={styles.content}>
          {/* Sección de estadísticas */}
          <div className="stats-section" style={styles.statsSection}>
            <StatsCards user={user} />
          </div>

          {/* Sección de actividad reciente y acciones rápidas */}
          <div className="activity-section" style={styles.activitySection}>
            <div className="recent-activity" style={styles.recentActivity}>
              <RecentActivity user={user} />
            </div>
            
            <div className="quick-actions" style={styles.quickActions}>
              <QuickActions user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
    display: { xs: 'none', md: 'block' } // Oculto en mobile
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto'
  },
  statsSection: {
    marginBottom: '30px'
  },
  activitySection: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '20px'
  },
  recentActivity: {
    gridColumn: '1'
  },
  quickActions: {
    gridColumn: '2'
  }
};

export default Dashboard;
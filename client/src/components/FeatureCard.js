// src/components/FeatureCard.js
import React from 'react';
import { Card, Badge } from 'react-bootstrap';

const FeatureCard = ({ icon, title, description, badges, theme, isRTL }) => {
  const styles = {
    card: {
      background: theme ? '#2c3e50' : '#ffffff',
      border: 'none',
      borderRadius: '15px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      padding: '25px',
      height: '100%',
      transition: 'all 0.3s ease',
      color: theme ? '#ffffff' : '#2c3e50',
      textAlign: isRTL ? 'right' : 'left'
    },
    icon: {
      fontSize: '48px',
      marginBottom: '15px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '15px',
      color: theme ? '#ffffff' : '#2c3e50'
    },
    description: {
      fontSize: '14px',
      opacity: 0.8,
      marginBottom: '20px',
      lineHeight: '1.6'
    },
    badgeContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    badge: {
      fontSize: '11px',
      padding: '5px 10px',
      background: theme ? '#34495e' : '#e9ecef',
      color: theme ? '#ffffff' : '#495057',
      border: 'none'
    }
  };

  return (
    <Card 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Card.Body>
        <div style={styles.icon}>{icon}</div>
        <h5 style={styles.title}>{title}</h5>
        <p style={styles.description}>{description}</p>
        <div style={styles.badgeContainer}>
          {badges.map((badge, index) => (
            <Badge key={index} style={styles.badge}>
              {badge}
            </Badge>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FeatureCard;
// src/pages/appinfo.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button
} from 'react-bootstrap';

const AppInfo2 = () => {
  const { t } = useTranslation('appinfoagencia');
  const { theme, languageReducer, auth } = useSelector(state => state);
  const currentLanguage = languageReducer?.language || 'en';
  const isRTL = ['ar', 'he'].includes(currentLanguage);

  // Estilos optimizados - Azul claro y diseño compacto
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '0',
      backgroundColor: theme ? '#1a1a1a' : '#f8f9fa',
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
    heroSection: {
      background: theme ? 
        'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)' :
        'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      color: 'white',
      padding: '60px 0 40px 0',
      textAlign: 'center'
    },
    section: {
      padding: '40px 0'
    },
    sectionLight: {
      background: theme ? '#2c3e50' : '#ffffff'
    },
    sectionDark: {
      background: theme ? '#1a1a1a' : '#f8f9fa'
    },
    sectionTitle: {
      color: theme ? '#ffffff' : '#2c3e50',
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '15px',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    sectionSubtitle: {
      color: theme ? '#bdc3c7' : '#6c757d',
      fontSize: '16px',
      textAlign: 'center',
      marginBottom: '30px',
      lineHeight: '1.5'
    },
    subsectionTitle: {
      color: theme ? '#ffffff' : '#34495e',
      fontSize: '22px',
      fontWeight: '600',
      margin: '20px 0 15px 0',
      textAlign: isRTL ? 'right' : 'left'
    },
    card: {
      background: theme ? '#34495e' : '#ffffff',
      border: 'none',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: '15px',
      color: theme ? '#ffffff' : '#2c3e50',
      transition: 'all 0.3s ease',
      height: '100%'
    },
    featureIcon: {
      fontSize: '36px',
      marginBottom: '15px',
      display: 'block'
    },
    benefitCard: {
      background: theme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${theme ? '#3498db' : '#3498db'}`,
      borderRadius: '10px',
      padding: '20px 15px',
      textAlign: 'center',
      height: '100%',
      transition: 'all 0.3s ease'
    },
    stepCard: {
      background: theme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${theme ? '#3498db' : '#3498db'}`,
      borderRadius: '8px',
      padding: '20px 15px',
      textAlign: 'center',
      height: '100%'
    },
    stepNumber: {
      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      color: 'white',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '0 auto 15px auto'
    },
    ctaButton: {
      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      border: 'none',
      borderRadius: '25px',
      padding: '12px 30px',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      margin: '5px',
      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
    }
  };

  return (
    <Container fluid style={styles.container}>
      {/* SECCIÓN 1: HERO - COMPACTA */}
      <div style={styles.heroSection}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.2' }}>
                {t('hero.title')}
              </h1>
              <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '25px', lineHeight: '1.5' }}>
                {t('hero.subtitle')}
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <Link 
                  to={auth.user ? '/' : '/login'}
                  style={styles.ctaButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
                  }}
                >
                  <i className="fas fa-rocket me-2"></i>
                  {t('hero.cta_button')}
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* SECCIÓN 2: DOLORES - MÁS COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionLight }}>
        <Container>
          <h2 style={styles.sectionTitle}>{t('pain_section.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('pain_section.subtitle')}</p>
          
          <Row>
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '25px 20px' }}>
                  <div style={{ ...styles.featureIcon, color: '#3498db' }}>🤯</div>
                  <h3 style={{ color: theme ? '#D5DCE8' : '#2c3e50', marginBottom: '15px', fontSize: '18px' }}>
                    {t('pain_section.algorithm.title')}
                  </h3>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.6', fontSize: '14px' }}>
                    {t('pain_section.algorithm.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '25px 20px' }}>
                  <div style={{ ...styles.featureIcon, color: '#3498db' }}>😰</div>
                  <h3 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '15px', fontSize: '18px' }}>
                    {t('pain_section.trust.title')}
                  </h3>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.6', fontSize: '14px' }}>
                    {t('pain_section.trust.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '25px 20px' }}>
                  <div style={{ ...styles.featureIcon, color: '#3498db' }}>💸</div>
                  <h3 style={{ color: theme ? '#D5DCE8' : '#2c3e50', marginBottom: '15px', fontSize: '18px' }}>
                    {t('pain_section.data_control.title')}
                  </h3>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.6', fontSize: '14px' }}>
                    {t('pain_section.data_control.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '25px 20px' }}>
                  <div style={{ ...styles.featureIcon, color: '#3498db' }}>📱</div>
                  <h3 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '15px', fontSize: '18px' }}>
                    {t('pain_section.limited_features.title')}
                  </h3>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.6', fontSize: '14px' }}>
                    {t('pain_section.limited_features.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 3: SOLUCIÓN - COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionDark }}>
        <Container>
          <h2 style={styles.sectionTitle}>{t('solution_section.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('solution_section.subtitle')}</p>
          
          <Row>
            <Col lg={4} className="mb-3">
              <div style={styles.benefitCard}>
                <div style={{ ...styles.featureIcon, color: '#27ae60' }}>🚀</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('solution_section.instant_app.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('solution_section.instant_app.description')}
                </p>
              </div>
            </Col>
            
            <Col lg={4} className="mb-3">
              <div style={styles.benefitCard}>
                <div style={{ ...styles.featureIcon, color: '#3498db' }}>🛡️</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('solution_section.trust_brand.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('solution_section.trust_brand.description')}
                </p>
              </div>
            </Col>
            
            <Col lg={4} className="mb-3">
              <div style={styles.benefitCard}>
                <div style={{ ...styles.featureIcon, color: '#9b59b6' }}>💾</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('solution_section.your_data.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('solution_section.your_data.description')}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 4: CARACTERÍSTICAS - MÁS COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionLight }}>
        <Container>
          <h2 style={styles.sectionTitle}>{t('features_section.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('features_section.subtitle')}</p>
          
          <Row>
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>📊 {t('features_section.client_database.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.client_database.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>🔔 {t('features_section.notifications.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.notifications.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>💬 {t('features_section.private_chat.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.private_chat.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>❤️ {t('features_section.favorites.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.favorites.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>🌐 {t('features_section.multi_language.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.multi_language.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-3">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '20px' }}>
                  <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>📤 {t('features_section.easy_sharing.title')}</h4>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                    {t('features_section.easy_sharing.description')}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 5: CÓMO FUNCIONA - COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionDark }}>
        <Container>
          <h2 style={styles.sectionTitle}>{t('how_it_works.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('how_it_works.subtitle')}</p>
          
          <Row>
            <Col lg={4} className="mb-3">
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>1</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('how_it_works.step1.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('how_it_works.step1.description')}
                </p>
              </div>
            </Col>
            
            <Col lg={4} className="mb-3">
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>2</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('how_it_works.step2.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('how_it_works.step2.description')}
                </p>
              </div>
            </Col>
            
            <Col lg={4} className="mb-3">
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>3</div>
                <h4 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '10px', fontSize: '16px' }}>
                  {t('how_it_works.step3.title')}
                </h4>
                <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px' }}>
                  {t('how_it_works.step3.description')}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 6: SOPORTE - COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionLight }}>
        <Container>
          <h2 style={styles.sectionTitle}>{t('support_section.title')}</h2>
          <p style={styles.sectionSubtitle}>{t('support_section.subtitle')}</p>
          
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <Card style={styles.card}>
                <Card.Body style={{ padding: '30px 25px' }}>
                  <div style={{ ...styles.featureIcon, color: '#f39c12' }}>⚡</div>
                  <h3 style={{ color: theme ? '#ffffff' : '#2c3e50', marginBottom: '15px', fontSize: '20px' }}>
                    {t('support_section.real_time_updates.title')}
                  </h3>
                  <p style={{ color: theme ? '#bdc3c7' : '#6c757d', lineHeight: '1.5', fontSize: '14px', marginBottom: '20px' }}>
                    {t('support_section.real_time_updates.description')}
                  </p>
                  
                  <Row>
                    <Col md={6} className="text-start mb-2">
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature1')}</p>
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature2')}</p>
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature3')}</p>
                    </Col>
                    <Col md={6} className="text-start mb-2">
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature4')}</p>
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature5')}</p>
                      <p style={{ color: theme ? '#bdc3c7' : '#6c757d', fontSize: '14px', margin: '5px 0' }}>✅ {t('support_section.whats_included.feature6')}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 7: CALL TO ACTION FINAL - COMPACTA */}
      <section style={{ ...styles.section, ...styles.sectionDark }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 style={styles.sectionTitle}>{t('final_cta.title')}</h2>
              <p style={{ 
                color: theme ? '#bdc3c7' : '#6c757d',
                fontSize: '16px',
                marginBottom: '25px',
                lineHeight: '1.5'
              }}>
                {t('final_cta.subtitle')}
              </p>
              
              <div>
                <Link 
                  to={auth.user ? '/' : '/login'}
                  style={{
                    ...styles.ctaButton,
                    fontSize: '16px',
                    padding: '15px 35px'
                  }}
                >
                  <i className="fas fa-crown me-2"></i>
                  {t('final_cta.button')}
                </Link>
              </div>
              
              <p style={{ 
                color: theme ? '#95a5a6' : '#6c757d',
                fontSize: '14px',
                marginTop: '20px'
              }}>
                {t('final_cta.no_risk')}
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default AppInfo2;
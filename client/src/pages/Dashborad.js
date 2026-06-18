// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
 //import DashboardLayout from '../components/dashboardUser/dashboradLayout/DashboradLayout';
import Overview from '../components/dashboardUser/OveryView/OverView';

 
  import { Annonces } from '../components/dashboardUser/Annocess';

 import Publicite from '../components/dashboardUser/Publicite/Publicite';
 
 
 import Commandes from '../components/dashboardUser/Commandes/Commandes';

//import Conversations from '../components/DashboardUser/Conversations/Conversations';
//import Notifications from '../components/DashboardUser/Notifications/Notifications';
//import Profil from '../components/DashboardUser/Profil/Profil';
//import Parametres from '../components/DashboardUser/Parametres/Parametres';
import { Spinner } from 'react-bootstrap';
import Boutique from '../components/dashboardUser/Boutique/Boutique';
import DashboardLayout from '../components/dashboardUser/dashboradLayout/DashboradLayout';

const Dashboard = () => {
    const { auth } = useSelector(state => state);
    const history = useHistory();
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!auth.token || !auth.user) {
           history.push('/login');
            return;
        }
        
        // Simular carga inicial
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [auth, history]);

    // Determinar sección activa desde URL
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setActiveSection(hash);
        }
    }, []);

    // Verificar si el usuario está verificado
    const isUserVerified = auth.user?.emailVerified || auth.user?.phoneVerified;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" size="lg" />
                    <p className="mt-3">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
        >
            <Container fluid className="py-4">
                {/* Banner de bienvenida */}
                <Row className="mb-4">
                    <Col>
                        <div className="bg-gradient-primary text-white rounded-3 p-4 shadow">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h1 className="h3 mb-1">Bonjour, {auth.user?.name || auth.user?.username} 👋</h1>
                                    <p className="mb-0 opacity-75">
                                        Bienvenue dans votre espace personnel. Gérez vos annonces, messages et paramètres.
                                    </p>
                                </div>
                                <div className="d-none d-md-block">
                                    <span className="badge bg-light text-primary fs-6 px-3 py-2">
                                        {new Date().toLocaleDateString('fr-FR', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Alerta de verificación si no está verificado */}
                {!isUserVerified && (
                    <Row className="mb-4">
                        <Col>
                            <Alert variant="warning" className="border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle fa-2x me-3"></i>
                                    <div>
                                        <h5 className="alert-heading mb-1">Compte non vérifié</h5>
                                        <p className="mb-0">
                                            Vérifiez votre email et téléphone pour débloquer toutes les fonctionnalités.
                                            <a href="#profil" className="alert-link ms-2">Vérifier maintenant</a>
                                        </p>
                                    </div>
                                </div>
                            </Alert>
                        </Col>
                    </Row>
                )}

                {/* Contenido principal según sección activa */}
                <Row>
                    <Col>
                        {activeSection === 'overview' && <Overview />}
                        {activeSection === 'annonces' && <Annonces />}
                        {activeSection === 'boutique' && <Boutique />}
                        {activeSection === 'publicite' && <Publicite />}
                        {activeSection === 'commandes' && <Commandes />}
                        {activeSection === 'conversations' && <Conversations />}
                        {activeSection === 'notifications' && <Notifications />}
                        {activeSection === 'profil' && <Profil />}
                        {activeSection === 'parametres' && <Parametres />}
                        
                        {/* Vista por defecto si no hay sección activa */}
                        {!activeSection && <Overview />}
                    </Col>
                </Row>
            </Container>
        </DashboardLayout>
    );
};

export default Dashboard;
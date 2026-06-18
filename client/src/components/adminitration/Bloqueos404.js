// 📂 pages/Bloqueos404.jsx - VERSIÓN COMPLETA EN FRANCÉS CON TÉLÉFONO

import React, { useEffect, useState } from 'react';
import { 
  Container,
  Card,
  Alert,
  ListGroup,
  Badge,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Spinner
} from 'react-bootstrap';
import { ClockHistory, ExclamationTriangle, PersonLock, CalendarEvent, Envelope, Telephone, InfoCircle, FileText, ChatDots } from 'react-bootstrap-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers } from '../../redux/actions/userAction';

const Bloqueos404 = () => {
    const dispatch = useDispatch();
    const { auth, homeUsers } = useSelector(state => state);
    const user = auth?.user;
    
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [userEmail, setUserEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Informations de contact de l'administration
    const adminContactInfo = {
        email: "artealger2020argelia@gmail.com",
        phone: "+213 658 556 296",
        phoneDisplay: "0658 55 62 96"
    };

    useEffect(() => {
        if (user?.email) {
            setUserEmail(user.email);
        }
    }, [user]);

    // Charger les données des utilisateurs pour obtenir blockDetails à jour
    useEffect(() => {
        if (auth.token && !dataLoaded) {
            dispatch(getUsers(auth.token));
            setDataLoaded(true);
        }
    }, [dispatch, auth.token, dataLoaded]);

    // Rechercher l'utilisateur actuel dans homeUsers
    const currentUser = homeUsers?.users?.find(u => u._id === user?._id);
    
    // Vérifier si l'utilisateur est bloqué
    const isBlocked = currentUser?.isBlocked === true;
    
    // Obtenir les détails du blocage
    const blockDetails = currentUser?.blockDetails || null;
    
    // Vérifier si le blocage a expiré
    const isExpired = blockDetails?.blockExpiryDate && new Date(blockDetails.blockExpiryDate) < new Date();

    // Debug
    console.log('=== BLOQUEOS404 DEBUG ===');
    console.log('Utilisateur:', user);
    console.log('CurrentUser:', currentUser);
    console.log('isBlocked:', isBlocked);
    console.log('BlockDetails:', blockDetails);
    console.log('isExpired:', isExpired);

    const handleContactSupport = () => {
        setShowContactModal(true);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
        setContactMessage('');
    };

    const handleSubmitContact = async (e) => {
        e.preventDefault();
        
        if (!contactMessage.trim()) {
            alert('Veuillez écrire un message');
            return;
        }

        setLoading(true);
    
        try {
            const response = await fetch('/api/contact-support-block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: auth?.token || ''
                },
                body: JSON.stringify({
                    email: user?.email,
                    username: user?.username,
                    _id: user?._id,
                    blockReason: blockDetails?.reason || 'Non spécifié',
                    blockDescription: blockDetails?.description || '',
                    blockDate: blockDetails?.blockDate || new Date(),
                    blockExpiryDate: blockDetails?.blockExpiryDate || null,
                    message: contactMessage
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi');
            }

            alert('Message envoyé avec succès. Nous vous contacterons prochainement.');
            setContactMessage('');
            handleCloseContactModal();
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    // Si pas d'utilisateur, afficher chargement
    if (!user) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // Si chargement des données
    if (isBlocked && !dataLoaded && homeUsers?.users?.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Chargement des informations de blocage...</p>
                </div>
            </Container>
        );
    }

    // Si le blocage a expiré mais l'état n'est pas mis à jour
    if (isBlocked && isExpired) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Card className="text-center shadow" style={{ width: '100%', maxWidth: '600px' }}>
                    <Card.Header className="bg-warning text-dark">
                        <h4 className="mb-0">⚠️ Blocage expiré</h4>
                    </Card.Header>
                    <Card.Body>
                        <ClockHistory size={48} className="text-warning mb-3" />
                        <Card.Title>Votre blocage a expiré</Card.Title>
                        <Card.Text>
                            La période de blocage est terminée. Vous devriez pouvoir accéder normalement à votre compte.
                            Si vous ne pouvez toujours pas accéder, veuillez contacter le support.
                        </Card.Text>
                        <Button variant="primary" href="/">
                            Accueil
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
 

    // SI BLOQUÉ - afficher page de blocage avec détails
    return (
        <>
            <Container className="py-5" style={{ maxWidth: '800px' }}>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className="shadow-lg border-danger">
                            <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <ExclamationTriangle className="me-2" />
                                    <strong>⚠️ Compte bloqué</strong>
                                </div>
                                <Badge bg="light" text="dark">
                                    Système de blocage
                                </Badge>
                            </Card.Header>
                            
                            <Card.Body>
                                <Alert variant="danger" className="d-flex align-items-center">
                                    <ExclamationTriangle size={24} className="me-3" />
                                    <div>
                                        <strong>Votre compte a été temporairement suspendu</strong>
                                        <br />
                                        Vous ne pourrez pas accéder à la plateforme jusqu'à la levée du blocage.
                                    </div>
                                </Alert>
                                
                                <ListGroup variant="flush" className="mb-4">
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold d-flex align-items-center">
                                            <PersonLock className="me-2" />
                                            Utilisateur:
                                        </span>
                                        <span className="text-end" style={{ minWidth: '50%' }}>
                                            {user?.username || 'N/A'}
                                        </span>
                                    </ListGroup.Item>
                                    
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold d-flex align-items-center">
                                            <ExclamationTriangle className="me-2" />
                                            Motif du blocage:
                                        </span>
                                        <span className="text-end text-danger fw-bold" style={{ minWidth: '50%' }}>
                                            {blockDetails?.reason || 'Non spécifié'}
                                        </span>
                                    </ListGroup.Item>
                                    
                                    {blockDetails?.description && (
                                        <ListGroup.Item>
                                            <div className="fw-bold mb-2 d-flex align-items-center">
                                                <FileText className="me-2" />
                                                Description détaillée:
                                            </div>
                                            <div className="text-muted bg-light p-2 rounded">
                                                {blockDetails.description}
                                            </div>
                                        </ListGroup.Item>
                                    )}
                                    
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold d-flex align-items-center">
                                            <ClockHistory className="me-2" />
                                            Date du blocage:
                                        </span>
                                        <span className="text-end" style={{ minWidth: '50%' }}>
                                            {blockDetails?.blockDate 
                                                ? new Date(blockDetails.blockDate).toLocaleString('fr-FR')
                                                : 'Inconnue'}
                                        </span>
                                    </ListGroup.Item>
                                    
                                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                        <span className="fw-bold d-flex align-items-center">
                                            <CalendarEvent className="me-2" />
                                            Date de déblocage:
                                        </span>
                                        <span className={`text-end ${!blockDetails?.blockExpiryDate ? 'text-warning' : ''}`} style={{ minWidth: '50%' }}>
                                            {blockDetails?.blockExpiryDate 
                                                ? new Date(blockDetails.blockExpiryDate).toLocaleString('fr-FR')
                                                : 'Sans date définie (en attente de révision)'}
                                        </span>
                                    </ListGroup.Item>
                                </ListGroup>
                                
                                {/* SECTION CONTACT DIRECT - TÉLÉPHONE */}
                                <Alert variant="primary" className="mt-3">
                                    <div className="d-flex align-items-start">
                                        <Telephone size={20} className="me-2 mt-1" />
                                        <div>
                                            <strong>📞 Contacter directement l'administration</strong>
                                            <div className="mt-2">
                                                <p className="mb-1">
                                                    <strong>Téléphone :</strong> 
                                                    <a href={`tel:${adminContactInfo.phone}`} className="ms-2 text-decoration-none">
                                                        {adminContactInfo.phoneDisplay}
                                                    </a>
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Email :</strong> 
                                                    <a href={`mailto:${adminContactInfo.email}`} className="ms-2 text-decoration-none">
                                                        {adminContactInfo.email}
                                                    </a>
                                                </p>
                                                <small className="text-muted d-block mt-2">
                                                    📍 Horaires de contact : Du lundi au vendredi de 9h à 18h
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </Alert>

                                <Alert variant="info" className="mt-2">
                                    <div className="d-flex align-items-start">
                                        <InfoCircle size={20} className="me-2 mt-1" />
                                        <div>
                                            <strong>Que pouvez-vous faire ?</strong>
                                            <ul className="mb-0 mt-1">
                                                <li>Attendre la fin de la période de blocage</li>
                                                <li>Contacter le support si vous pensez à une erreur</li>
                                                <li>Consulter les règles de la communauté</li>
                                                <li>Appeler directement l'administration au <strong>{adminContactInfo.phoneDisplay}</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </Alert>
                                
                                <div className="d-grid gap-2 mt-3">
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={handleContactSupport}
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" /> : '📧 Envoyer un message au support'}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-success" 
                                        href={`tel:${adminContactInfo.phone}`}
                                    >
                                        📞 Appeler l'administration ({adminContactInfo.phoneDisplay})
                                    </Button>
                                </div>
                            </Card.Body>
                            
                            <Card.Footer className="text-muted small d-flex justify-content-between">
                                <span>Système de gestion des utilisateurs</span>
                                <span>ID: {user?._id?.substring(0, 8) || 'N/A'}</span>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal de Contact avec Support */}
            <Modal 
                show={showContactModal} 
                onHide={handleCloseContactModal}
                centered
                size="lg"
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <ChatDots className="me-2" />
                        Contacter le support
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body>
                    <Alert variant="info">
                        <strong>Informations de votre blocage :</strong>
                        <ul className="mb-0 mt-2">
                            <li><strong>Motif :</strong> {blockDetails?.reason || 'Non spécifié'}</li>
                            <li><strong>Date du blocage :</strong> {blockDetails?.blockDate ? new Date(blockDetails.blockDate).toLocaleString('fr-FR') : 'Inconnue'}</li>
                            <li><strong>Date de déblocage :</strong> {blockDetails?.blockExpiryDate ? new Date(blockDetails.blockExpiryDate).toLocaleString('fr-FR') : 'En attente'}</li>
                        </ul>
                    </Alert>

                    <div className="mb-4">
                        <h5 className="mb-3">📞 Contactez l'administration</h5>
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex align-items-center p-2 bg-light rounded">
                                <Envelope className="me-2 text-primary" />
                                <span><strong>Email :</strong> </span>
                                <a href={`mailto:${adminContactInfo.email}`} className="ms-2">
                                    {adminContactInfo.email}
                                </a>
                            </div>
                            <div className="d-flex align-items-center p-2 bg-light rounded">
                                <Telephone className="me-2 text-success" />
                                <span><strong>Téléphone :</strong> </span>
                                <a href={`tel:${adminContactInfo.phone}`} className="ms-2">
                                    {adminContactInfo.phoneDisplay}
                                </a>
                            </div>
                        </div>
                        <small className="text-muted d-block mt-2">
                            📍 Disponible du lundi au vendredi de 9h à 18h
                        </small>
                    </div>

                    <Form onSubmit={handleSubmitContact}>
                        <Form.Group className="mb-3">
                            <Form.Label><strong>Votre email</strong></Form.Label>
                            <Form.Control
                                type="email"
                                value={userEmail}
                                readOnly
                                disabled
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label><strong>Message</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder="Décrivez votre situation, pourquoi vous pensez que le blocage peut être une erreur, ou toute information supplémentaire..."
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button 
                                variant="secondary" 
                                onClick={handleCloseContactModal}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={!contactMessage.trim() || loading}
                            >
                                {loading ? <Spinner size="sm" /> : 'Envoyer le message'}
                            </Button>
                        </div>
                    </Form>
                    
                    <hr className="my-3" />
                    
                    <div className="text-center">
                        <small className="text-muted">
                            Vous pouvez aussi nous appeler directement au <strong>{adminContactInfo.phoneDisplay}</strong>
                        </small>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Bloqueos404;
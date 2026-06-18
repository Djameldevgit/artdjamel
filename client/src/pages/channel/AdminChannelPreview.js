// frontend/src/components/adminitration/adminApove/AdminChannelPreview.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Image, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaStore, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { getPendingChannelById, approveChannel, rejectChannel } from '../../redux/actions/channelAction';
import './AdminChannelPreview.css'; // Importamos estilos personalizados

const AdminChannelPreview = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth, socket } = useSelector(state => state);
  const { pendingChannel, pendingLoading, error } = useSelector(state => state.channel);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const user = auth?.user;
    if (!user || user.role !== 'admin') {
      history.push('/');
      return;
    }
    
    if (id && auth?.token) {
      console.log('📺 Cargando canal pendiente ID:', id);
      dispatch(getPendingChannelById(auth.token, id));
    }
  }, [id, auth?.token, dispatch, history]);

  const handleApprove = async () => {
    if (!window.confirm(`Approuver le canal "${pendingChannel?.name}" ?`)) return;
    
    setActionLoading(true);
    try {
      const result = await dispatch(approveChannel(id, auth.token, auth, socket));
      if (result?.success) {
        alert('✅ Canal approuvé avec succès !');
        history.push('/admin/dashboard');
      } else {
        alert('❌ Erreur: ' + (result?.error || 'Erreur lors de l\'approbation'));
      }
    } catch (err) {
      console.error('Error approving channel:', err);
      alert('❌ Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer une raison pour le rejet');
      return;
    }
    
    setActionLoading(true);
    try {
      const result = await dispatch(rejectChannel(id, rejectReason, auth.token, auth, socket));
      if (result?.success) {
        alert('❌ Canal rejeté avec succès');
        closeRejectModal();
        history.push('/admin/dashboard');
      } else {
        alert('❌ Erreur: ' + (result?.error || 'Erreur lors du rejet'));
      }
    } catch (err) {
      console.error('Error rejecting channel:', err);
      alert('❌ Erreur: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (pendingLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des détails du canal...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Erreur</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => history.push('/admin/dashboard')}>
            <FaArrowLeft className="me-2" /> Retour au Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!pendingChannel) return null;

  const avatarUrl = pendingChannel.avatar?.[0]?.url || pendingChannel.avatar || 'https://via.placeholder.com/150';
  const coverUrl = pendingChannel.cover?.[0]?.url || pendingChannel.cover || 'https://via.placeholder.com/1200x300';

  return (
    <Container fluid className="py-4">
      {/* Modal de rechazo personalizado */}
      {showRejectModal && (
        <>
          <div className="custom-modal-overlay" onClick={closeRejectModal} />
          <div className="custom-modal-container">
            <div className="custom-modal">
              <div className="custom-modal-header">
                <div className="custom-modal-icon">
                  <FaExclamationTriangle size={24} />
                </div>
                <h3>Rejeter le canal</h3>
                <button className="custom-modal-close" onClick={closeRejectModal}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="custom-modal-body">
                <p>
                  Vous êtes sur le point de rejeter le canal <strong>{pendingChannel.name}</strong>.
                </p>
                <p className="text-muted small">
                  Veuillez indiquer la raison du rejet. Le propriétaire recevra une notification avec cette information.
                </p>
                
                <div className="form-group mt-3">
                  <label className="form-label fw-bold">Raison du rejet :</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ex: Contenu inapproprié, informations manquantes, doublon..."
                    style={{ resize: 'vertical' }}
                    autoFocus
                  />
                </div>
                
                {!rejectReason.trim() && (
                  <div className="text-warning small mt-2">
                    <FaExclamationTriangle className="me-1" />
                    Une raison est requise pour rejeter ce canal.
                  </div>
                )}
              </div>
              
              <div className="custom-modal-footer">
                <button 
                  className="btn-cancel" 
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <FaTimes className="me-2" />
                      Confirmer le rejet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => history.push('/admin/dashboard')} className="mb-3">
          <FaArrowLeft className="me-2" /> Retour au Dashboard
        </Button>
        
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="mb-2">
              {pendingChannel.name}
              <Badge bg="warning" text="dark" className="ms-3">
                <FaClock className="me-1" /> En attente d'approbation
              </Badge>
            </h1>
            <p className="text-muted">
              <FaStore className="me-1" /> Canal en révision - Visible uniquement par les administrateurs
            </p>
          </div>
          
          <div className="d-flex gap-2">
            <Button 
              variant="success" 
              size="lg" 
              onClick={handleApprove} 
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="me-2" /> : <FaCheck className="me-2" />}
              Approuver
            </Button>
            <Button 
              variant="danger" 
              size="lg" 
              onClick={openRejectModal} 
              disabled={actionLoading}
            >
              <FaTimes className="me-2" /> Rejeter
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="position-relative mb-5">
        <div 
          style={{
            height: '300px',
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '15px',
            backgroundColor: '#f0f0f0'
          }}
        />
        <div style={{ position: 'absolute', bottom: '-60px', left: '40px' }}>
          <Image
            src={avatarUrl}
            width="120"
            height="120"
            className="rounded-circle border border-4 border-white shadow"
            style={{ objectFit: 'cover', backgroundColor: 'white' }}
          />
        </div>
      </div>

      {/* Contenido */}
      <Row className="mt-5 pt-3">
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Informations du canal</h4>
              
              <Row className="mb-3">
                <Col md={3}><strong>Nom:</strong></Col>
                <Col md={9}>{pendingChannel.name}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={3}><strong>Slug:</strong></Col>
                <Col md={9}><code>/{pendingChannel.slug}</code></Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={3}><strong>Activité:</strong></Col>
                <Col md={9}><Badge bg="info">{pendingChannel.activity}</Badge></Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={3}><strong>Description:</strong></Col>
                <Col md={9}>{pendingChannel.description || 'Aucune description'}</Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={3}><strong>Localisation:</strong></Col>
                <Col md={9}>
                  <FaMapMarkerAlt className="me-1 text-primary" />
                  {pendingChannel.wilaya}, {pendingChannel.commune}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Informations de contact</h4>
              
              {pendingChannel.email && (
                <Row className="mb-3">
                  <Col md={3}><strong><FaEnvelope className="me-2" />Email:</strong></Col>
                  <Col md={9}>{pendingChannel.email}</Col>
                </Row>
              )}
              
              {pendingChannel.phone && (
                <Row className="mb-3">
                  <Col md={3}><strong><FaPhone className="me-2" />Téléphone:</strong></Col>
                  <Col md={9}>{pendingChannel.phone}</Col>
                </Row>
              )}
              
              {pendingChannel.website && (
                <Row className="mb-3">
                  <Col md={3}><strong>Site web:</strong></Col>
                  <Col md={9}>
                    <a href={pendingChannel.website} target="_blank" rel="noopener noreferrer">
                      {pendingChannel.website}
                    </a>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-primary bg-opacity-10">
              <h5 className="mb-0">
                <FaUser className="me-2" /> Propriétaire
              </h5>
            </Card.Header>
            <Card.Body className="text-center">
              <Image
                src={pendingChannel.owner?.avatar || 'https://via.placeholder.com/100'}
                width="80"
                height="80"
                className="rounded-circle mb-3"
              />
              <h5>{pendingChannel.owner?.username}</h5>
              <p className="text-muted">{pendingChannel.owner?.email}</p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-warning bg-opacity-10">
              <h5 className="mb-0">État de la demande</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <Badge bg="warning" text="dark" className="p-2">
                  ⏳ En attente de révision
                </Badge>
              </div>
              
              <hr />
              
              <small className="text-muted d-block">
                <strong>Créé le:</strong> {new Date(pendingChannel.createdAt).toLocaleDateString('fr-FR')}
              </small>
              <small className="text-muted d-block mt-2">
                <strong>ID:</strong> {pendingChannel._id}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminChannelPreview;
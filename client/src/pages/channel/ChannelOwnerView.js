// frontend/src/pages/channel/ChannelOwnerView.jsx - VERSIÓN CON MODAL PARA CANAL PENDIENTE

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import {
  Container,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  Badge,
  Card
} from 'react-bootstrap';
import {
  ArrowLeft,
  Pencil,
  Trash3,
  Share,
  Clock,
  CheckCircle,
  ExclamationTriangle,
  Building,
  GeoAlt,
  Briefcase,
  Film,
  Heart,
  X,
  HourglassSplit
} from 'react-bootstrap-icons';
import {
  getChannelProfile,
  getChannelVideos,
  clearChannelState
} from '../../redux/actions/channelAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import './ChannelOwnerView.css';

const getImageUrl = (imageData, defaultValue = '') => {
  if (!imageData) return defaultValue;
  if (typeof imageData === 'string') return imageData;
  if (Array.isArray(imageData) && imageData.length > 0) {
    return imageData[0]?.url || defaultValue;
  }
  if (imageData?.url) return imageData.url;
  return defaultValue;
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// ✅ Función para obtener token correctamente
const getAuthToken = (auth) => {
  if (!auth) return null;
  if (typeof auth.token === 'string' && auth.token) return auth.token;
  if (typeof auth.token === 'object' && auth.token !== null) {
    return auth.token.token || auth.token.access_token || null;
  }
  const localToken = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (localToken) return localToken;
  return null;
};

// ============================================
// ✅ MODAL PERSONALIZADO PARA CANAL PENDIENTE
// ============================================
const PendingChannelModal = ({ show, onClose, channelName, userId, history }) => {
  if (!show) return null;

  const handleGoToProfile = () => {
    if (history && userId) {
      history.push(`/profile/${userId}`);
    }
    onClose();
  };

  return (
    <div className="pending-modal-overlay" onClick={onClose}>
      <div className="pending-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pending-modal-header">
          <div className="pending-modal-icon">
            <HourglassSplit size={32} color="#f59e0b" />
          </div>
          <button className="pending-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="pending-modal-body">
          <h3 className="pending-modal-title">⏳ Canal en attente d'approbation</h3>

          <div className="pending-modal-message">
            <p>
              Votre canal <strong>"{channelName}"</strong> est actuellement en cours de vérification par notre équipe administrative.
            </p>
            <p>
              Une fois approuvé, il sera visible par tous les utilisateurs et vous pourrez :
            </p>
            <ul>
              <li>✓ Publier des vidéos</li>
              <li>✓ Modifier vos informations</li>
              <li>✓ Être visible dans les recherches</li>
              <li>✓ Recevoir des abonnés</li>
            </ul>
          </div>

          <div className="pending-modal-info">
            <strong>💡 Information importante :</strong>
            <p>
              La vérification prend généralement 24 à 48 heures. Vous serez notifié par email dès que votre canal sera approuvé.
            </p>
            <p className="mt-2">
              En attendant, vous pouvez consulter l'état de votre canal depuis votre profil.
            </p>
          </div>
        </div>

        <div className="pending-modal-footer pending-modal-footer-double">
          <button
            className="pending-modal-btn pending-modal-btn-secondary"
            onClick={handleGoToProfile}
          >
            👤 Retour au profil
          </button>
         
        </div>
      </div>
    </div>
  );
};
const ChannelOwnerView = () => {
  const { channelId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const {
    channel,
    videos = [],
    loading,
    error
  } = useSelector(state => state.channel);

  const [activeTab, setActiveTab] = useState('videos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // ✅ Ref para evitar peticiones duplicadas
  const hasLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const isOwner = auth.user?._id === channel?.owner?._id;
  const isAdmin = auth.user?.role === 'admin';
  const canEdit = isOwner || isAdmin;
  const isPending = channel?.pendiente === true || channel?.status === 'pending';

  // ✅ Mostrar modal automáticamente si el canal está pendiente
  useEffect(() => {
    if (channel && isPending && !showPendingModal && !isLoading) {
      // Pequeño delay para que el usuario vea el contenido antes del modal
      const timer = setTimeout(() => {
        setShowPendingModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [channel, isPending, isLoading, showPendingModal]);

  // ✅ Limpiar estado al desmontar
  useEffect(() => {
    return () => {
      dispatch(clearChannelState());
      hasLoadedRef.current = false;
      loadingRef.current = false;
      setShowPendingModal(false);
    };
  }, [dispatch]);

  // ✅ Cargar datos del canal con control de duplicados
  useEffect(() => {
    if (!channelId) return;
    if (hasLoadedRef.current) return;
    if (loadingRef.current) return;

    const loadData = async () => {
      try {
        loadingRef.current = true;
        setIsLoading(true);

        const token = getAuthToken(auth);

        console.log('📺 ChannelOwnerView - Cargando canal ID:', channelId);
        console.log('🔑 Token disponible:', !!token);

        if (!token) {
          console.error('❌ No hay token de autenticación');
          // ✅ Usar isOwnerView = true
          await dispatch(getChannelProfile(channelId, null, true));
          await dispatch(getChannelVideos(channelId, 1, 12, null));
        } else {
          // ✅ Usar isOwnerView = true
          await dispatch(getChannelProfile(channelId, token, true));
          await dispatch(getChannelVideos(channelId, 1, 12, token));
        }

        hasLoadedRef.current = true;

      } catch (err) {
        console.error('❌ Error loading channel:', err);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };
    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);

  }, [channelId, auth, dispatch]);

  const handleBack = () => {
    hasLoadedRef.current = false;
    history.goBack();
  };

  const handleEdit = () => {
    if (isPending) {
      setShowPendingModal(true);
      return;
    }
    hasLoadedRef.current = false;
    history.push(`/channel/${channelId}/edit`);
  };

  const handleViewPublic = () => {
    window.open(`/channel/${channelId}`, '_blank');
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    try {
      const token = getAuthToken(auth);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: "Canal supprimé avec succès" } });
        hasLoadedRef.current = false;
        history.push('/my-channels');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.message } });
    }
    setShowDeleteConfirm(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/channel/${channelId}`;
    navigator.clipboard.writeText(url);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: "Lien copié !" } });
  };

  // ✅ Estado de carga
  if ((loading || isLoading) && !channel) {
    return (
      <div className="owner-view-loading">
        <Spinner animation="border" variant="primary" />
        <p>Chargement de votre canal...</p>
      </div>
    );
  }

  if (error && !channel) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <ExclamationTriangle size={20} className="me-2" />
          <strong>Erreur :</strong> {error}
        </Alert>
        <Button variant="primary" onClick={handleBack}>
          <ArrowLeft size={16} className="me-2" /> Retour
        </Button>
      </Container>
    );
  }

  if (!channel) return null;

  return (
    <div className="channel-owner-view">
      {/* Modal para canal pendiente */}
      <PendingChannelModal
        show={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        channelName={channel.name}
        userId={auth.user?._id}
        history={history}
      />

      {/* Header con botón volver */}
      <div className="owner-header">
        <button className="back-btn" onClick={handleBack}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h1>Gestion du canal</h1>
      </div>

      {/* Banner */}
      <div className="owner-banner">
        {getImageUrl(channel.cover) ? (
          <img src={getImageUrl(channel.cover)} alt="Banner" />
        ) : (
          <div className="banner-placeholder">
            <Building size={48} />
            <span>{channel.name}</span>
          </div>
        )}
      </div>

      {/* Perfil del canal */}
      <div className="owner-profile">
        <div className="owner-avatar-wrapper">
          {getImageUrl(channel.avatar) ? (
            <img src={getImageUrl(channel.avatar)} alt={channel.name} className="owner-avatar" />
          ) : (
            <div className="owner-avatar-placeholder">
              <Building size={40} />
            </div>
          )}
          {canEdit && (
            <button className="avatar-edit-btn" onClick={handleEdit}>
              <Pencil size={12} />
            </button>
          )}
        </div>

        <div className="owner-info">
          <div className="owner-name-section">
            <h2>{channel.name}</h2>
            {channel.isVerified && (
              <Badge bg="info" className="verified-badge">
                <CheckCircle size={10} /> Vérifié
              </Badge>
            )}
          </div>

          {/* Badge de estado */}
          <div className="status-badge-container">
            {isPending ? (
              <Badge bg="warning" text="dark" className="status-badge pending">
                <Clock size={12} className="me-1" /> En attente d'approbation
              </Badge>
            ) : (
              <Badge bg="success" className="status-badge approved">
                <CheckCircle size={12} className="me-1" /> Canal approuvé
              </Badge>
            )}
          </div>

          {channel.activity && (
            <div className="owner-activity">
              <Briefcase size={14} className="me-1" />
              <span>{channel.activity}</span>
            </div>
          )}

          {channel.wilaya && (
            <div className="owner-location">
              <GeoAlt size={14} className="me-1" />
              <span>{channel.wilaya}{channel.commune ? `, ${channel.commune}` : ''}</span>
            </div>
          )}

          {channel.description && (
            <p className="owner-description">{channel.description}</p>
          )}

          {/* Stats */}
          <div className="owner-stats">
            <div className="stat">
              <span className="stat-value">{formatNumber(channel.totalVideos || 0)}</span>
              <span className="stat-label">Vidéos</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatNumber(channel.totalViews || 0)}</span>
              <span className="stat-label">Vues</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatNumber(channel.followersCount || 0)}</span>
              <span className="stat-label">Abonnés</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="owner-actions">
            <Button variant="outline-primary" onClick={handleShare}>
              <Share size={14} className="me-1" /> Partager
            </Button>
            <Button variant="outline-secondary" onClick={handleViewPublic}>
              <Building size={14} className="me-1" /> Vue publique
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              <Pencil size={14} className="me-1" /> Modifier
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash3 size={14} className="me-1" /> Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Alerta para canal pendiente (ahora más sutil, sin modal) */}
      {isPending && !showPendingModal && (
        <div className="pending-alert-info">
          <div className="alert-icon">
            <HourglassSplit size={20} />
          </div>
          <div className="alert-content">
            <span>Votre canal est en attente d'approbation.</span>
            <button onClick={() => setShowPendingModal(true)} className="alert-link">
              En savoir plus
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="owner-tabs">
        <button
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <Film size={14} className="me-1" /> Vidéos ({channel.totalVideos || 0})
        </button>
      </div>

      {/* Grid de videos */}
      <div className="videos-grid">
        {videos.length === 0 && !loading ? (
          <div className="empty-state">
            <Film size={48} className="empty-icon" />
            <h4>Aucune vidéo</h4>
            <p>Commencez à partager vos premières vidéos commerciales !</p>
            <Button variant="primary" onClick={() => history.push(`/create-video-page?channelId=${channelId}`)}>
              <Film size={14} className="me-1" /> Mettre en ligne
            </Button>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {videos.map(video => (
              <Col key={video._id}>
                <Card className="video-card h-100">
                  <div className="video-thumbnail">
                    {video.thumbnail ? (
                      <img src={getImageUrl(video.thumbnail)} alt={video.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <Film size={32} />
                      </div>
                    )}
                    <div className="video-duration">{video.duration || '0:30'}</div>
                    {video.pendiente && (
                      <Badge bg="warning" text="dark" className="video-status">
                        <Clock size={10} /> En attente
                      </Badge>
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title className="video-title">{video.title}</Card.Title>
                    <div className="video-stats">
                      <span><Heart size={12} /> {formatNumber(video.views || 0)}</span>
                      <span><Heart size={12} /> {formatNumber(video.likes?.length || 0)}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Trash3 size={18} className="me-2 text-danger" /> Supprimer le canal</h3>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer définitivement le canal <strong>{channel.name}</strong> ?</p>
              <Alert variant="danger">
                <ExclamationTriangle size={14} className="me-2" />
                Cette action supprimera également toutes les vidéos associées et ne peut pas être annulée.
              </Alert>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
              <Button variant="danger" onClick={confirmDelete}>Supprimer définitivement</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelOwnerView;
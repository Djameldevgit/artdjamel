// src/pages/Profile.jsx - VERSIÓN FINAL COMPLETA

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { 
  Container, 
  Spinner, 
  Alert, 
  Button,
  Tabs,
  Tab,
  Dropdown,
  Badge,
  Card,
  Row,
  Col
} from 'react-bootstrap';
import { 
  ThreeDotsVertical,
  Pencil, 
  Trash3,
  Star,
  Envelope,
  GeoAlt,
  Tv,
  Film,
  InfoCircle,
  CreditCard,
  CheckCircle,
  Clock,
  Briefcase,
  Building,
  Eye,
  Heart,
  Bookmark,
  X
} from 'react-bootstrap-icons';
import { getProfileUsers, deleteProfileUser } from '../../redux/actions/profileAction';
import { getMyChannels, CHANNEL_TYPES } from '../../redux/actions/channelAction';
import { getSavedVideos, getLikedVideos } from '../../redux/actions/userAction';
import useUserPlan from '../../components/useUserPlan';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import VideoCardVertical from '../../components/VideoCardVertical';
import { getUserVideos } from '../../redux/actions/videoAction';
import { deleteDataAPI } from '../../utils/fetchData';
import './profile.css';

// ============================================
// COMPONENTE: MODAL PERSONALIZADO
// ============================================
const CustomModal = ({ show, onClose, title, children, onConfirm, confirmText, confirmDisabled, confirmLoading }) => {
  if (!show) return null;
  
  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">{title}</h3>
          <button className="custom-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="custom-modal-body">
          {children}
        </div>
        <div className="custom-modal-footer">
          <button className="custom-modal-btn custom-modal-btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button 
            className="custom-modal-btn custom-modal-btn-danger" 
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLoading ? 'Suppression...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: CHANNEL CARD
// ============================================
const ChannelCard = ({ channel, onView, onEdit, onDelete, userRole, isOwner }) => {
  const isPending = channel.pendiente === true;
  const isApproved = channel.pendiente === false && channel.status === 'approved';
  const isRejected = channel.status === 'rejected';
  const canEdit = userRole === 'admin' || isOwner;
  
  const getAvatarUrl = () => {
    if (!channel.avatar) return null;
    if (typeof channel.avatar === 'string') return channel.avatar;
    if (Array.isArray(channel.avatar) && channel.avatar.length > 0) {
      return channel.avatar[0]?.url || channel.avatar[0];
    }
    if (channel.avatar?.url) return channel.avatar.url;
    return null;
  };

  const getStatusColor = () => {
    if (isPending) return { bg: '#f59e0b', text: '#92400e', label: '⏳ En attente' };
    if (isApproved) return { bg: '#10b981', text: '#064e3b', label: '✅ Approuvé' };
    if (isRejected) return { bg: '#ef4444', text: '#7f1d1d', label: '❌ Rejeté' };
    return { bg: '#6b7280', text: '#1f2937', label: '📝 Statut inconnu' };
  };
  
  const statusInfo = getStatusColor();

  return (
    <div className="mini-card channel-card">
      <div className="card-header-gradient" style={{ 
        background: isPending ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                  isApproved ? 'linear-gradient(135deg, #10b981, #059669)' :
                  'linear-gradient(135deg, #ef4444, #dc2626)'
      }}>
        <div className="card-avatar-wrapper">
          {getAvatarUrl() ? (
            <img src={getAvatarUrl()} alt={channel.name} />
          ) : (
            <div className="card-avatar-placeholder">
              <Building size={28} />
            </div>
          )}
        </div>
        
        <div className="card-status-badge">
          <Badge 
            style={{ 
              backgroundColor: statusInfo.bg,
              color: statusInfo.text,
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
            className="rounded-pill"
          >
            {statusInfo.label}
          </Badge>
        </div>
        
        {canEdit && (
          <Dropdown className="card-actions-dropdown">
            <Dropdown.Toggle variant="light" size="sm" className="rounded-circle">
              <ThreeDotsVertical size={14} />
            </Dropdown.Toggle>
            
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => onView(channel._id, isPending)}>
                <Eye size={12} className="me-2" /> Voir la chaîne
              </Dropdown.Item>
              
              <Dropdown.Item onClick={() => onEdit(channel._id, isPending, channel.name)}>
                <Pencil size={12} className="me-2" /> Modifier
              </Dropdown.Item>
              
              <Dropdown.Divider />
              
              <Dropdown.Item onClick={() => onDelete(channel)} className="text-danger">
                <Trash3 size={12} className="me-2" /> Supprimer
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
      
      <div className="card-body-custom">
        <h6 className="card-title">
          {channel.name}
          {isRejected && (
            <span style={{ fontSize: '10px', marginLeft: '8px', color: '#ef4444' }}>
              ⚠️ {channel.rejectionReason?.substring(0, 30)}
            </span>
          )}
        </h6>
        <div className="card-activity">
          <Briefcase size={12} className="me-1" />
          <span>{channel.activity}</span>
        </div>
        
        {channel.wilaya && (
          <div className="card-location">
            <GeoAlt size={10} className="me-1" />
            <span>{channel.wilaya}{channel.commune ? `, ${channel.commune}` : ''}</span>
          </div>
        )}
        
        <div className="card-stats">
          <div className="stat">
            <span className="stat-value">{channel.totalVideos || 0}</span>
            <span className="stat-label">Vidéos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{channel.totalViews || 0}</span>
            <span className="stat-label">Vues</span>
          </div>
          <div className="stat">
            <span className="stat-value">{channel.followersCount || 0}</span>
            <span className="stat-label">Abonnés</span>
          </div>
        </div>
        
        <div className="card-actions">
          <Button size="sm" variant="outline-primary" onClick={() => onView(channel._id, isPending)}>
            <Eye size={12} className="me-1" /> voir ma chaîne
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: CHANNELS TAB
// ============================================
const ChannelsTab = ({ channels = [], loading, onViewChannel, onEditChannel, onDeleteChannel, userRole }) => {
  const [filter, setFilter] = useState('all');
  
  const pendingChannels = channels.filter(ch => ch.pendiente === true);
  const approvedChannels = channels.filter(ch => ch.pendiente === false);
  
  const getFilteredChannels = () => {
    if (filter === 'pending') return pendingChannels;
    if (filter === 'approved') return approvedChannels;
    return channels;
  };
  
  const filteredChannels = getFilteredChannels();
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted">Chargement de vos chaînes...</p>
      </div>
    );
  }
  
  if (channels.length === 0) {
    return (
      <div className="empty-state">
        <Tv size={48} className="empty-icon" />
        <p className="empty-text">Vous n'avez encore aucune chaîne</p>
        <Button variant="primary" size="sm" className="rounded-pill mt-2" onClick={() => window.location.href = '/channel/new'}>
          Créer une chaîne
        </Button>
      </div>
    );
  }
  
  return (
    <div className="channels-tab">
      <div className="filter-buttons mb-4">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline-secondary'}
          size="sm"
          className="me-2 rounded-pill"
          onClick={() => setFilter('all')}
        >
          Toutes ({channels.length})
        </Button>
        <Button 
          variant={filter === 'pending' ? 'warning' : 'outline-secondary'}
          size="sm"
          className="me-2 rounded-pill"
          onClick={() => setFilter('pending')}
        >
          En attente ({pendingChannels.length})
        </Button>
        <Button 
          variant={filter === 'approved' ? 'success' : 'outline-secondary'}
          size="sm"
          className="rounded-pill"
          onClick={() => setFilter('approved')}
        >
          Approuvées ({approvedChannels.length})
        </Button>
      </div>
      
      <div className="cards-grid">
        <Row xs={2} sm={2} md={3} lg={4} className="g-2">
          {filteredChannels.map(channel => (
            <Col key={channel._id}>
              <ChannelCard 
                channel={channel}
                onView={onViewChannel}
                onEdit={onEditChannel}
                onDelete={onDeleteChannel}
                userRole={userRole}
                isOwner={channel.isOwner}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: VIDEOS TAB
// ============================================
const VideosTab = ({ userId, isOwner }) => {
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const { userVideos } = useSelector(state => state.video || { userVideos: { videos: [], loading: false } });
  const [filter, setFilter] = useState('all');
  
  const { videos, loading, pendingCount, approvedCount, total, page, hasMore } = userVideos;
  
  useEffect(() => {
    if (userId && auth?.token) {
      dispatch(getUserVideos(userId, filter, 1, 12));
    }
  }, [userId, filter, auth?.token, dispatch]);
  
  const loadMore = () => {
    if (hasMore && !loading) {
      dispatch(getUserVideos(userId, filter, page + 1, 12));
    }
  };
  
  const getFilteredVideos = () => {
    if (filter === 'pending') return videos.filter(v => v.pendiente === true);
    if (filter === 'approved') return videos.filter(v => v.pendiente === false);
    return videos;
  };
  
  const filteredVideos = getFilteredVideos();
  
  const getVideoStatus = (video) => {
    if (video.pendiente === true) {
      return { label: '⏳ En attente', color: '#f59e0b' };
    }
    if (video.pendiente === false && video.isActive !== false) {
      return { label: '✅ Publiée', color: '#10b981' };
    }
    if (video.status === 'rejected') {
      return { label: '❌ Rejetée', color: '#ef4444' };
    }
    return { label: '📝 Statut inconnu', color: '#6b7280' };
  };
  
  if (loading && videos.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted">Chargement de vos vidéos...</p>
      </div>
    );
  }
  
  if (videos.length === 0 && !loading) {
    return (
      <div className="empty-state text-center py-5">
        <Film size={48} className="empty-icon text-muted mb-3" />
        <p className="text-muted">Vous n'avez encore aucune vidéo</p>
        {isOwner && (
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-pill mt-2"
            onClick={() => window.location.href = '/create-video'}
          >
            <Film size={14} className="me-2" />
            Publier une vidéo
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="videos-tab">
      <div className="filter-buttons mb-4">
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline-secondary'}
          size="sm"
          className="me-2 rounded-pill"
          onClick={() => setFilter('all')}
        >
          <Film size={12} className="me-1" />
          Toutes ({total})
        </Button>
        
        <Button 
          variant={filter === 'pending' ? 'warning' : 'outline-secondary'}
          size="sm"
          className="me-2 rounded-pill"
          onClick={() => setFilter('pending')}
          disabled={pendingCount === 0}
        >
          <Clock size={12} className="me-1" />
          En attente ({pendingCount})
        </Button>
        
        <Button 
          variant={filter === 'approved' ? 'success' : 'outline-secondary'}
          size="sm"
          className="rounded-pill"
          onClick={() => setFilter('approved')}
          disabled={approvedCount === 0}
        >
          <CheckCircle size={12} className="me-1" />
          Publiées ({approvedCount})
        </Button>
      </div>
      
      {filteredVideos.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">
            {filter === 'pending' 
              ? "Aucune vidéo en attente d'approbation"
              : "Aucune vidéo publiée"}
          </p>
        </div>
      ) : (
        <>
          <Row xs={2} sm={2} md={3} lg={4} className="g-2">
            {filteredVideos.map(video => {
              const status = getVideoStatus(video);
              return (
                <Col key={video._id}>
                  <div className="video-card-wrapper" style={{ position: 'relative' }}>
                    <VideoCardVertical video={video} />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 10
                    }}>
                      <Badge 
                        style={{ 
                          backgroundColor: status.color,
                          color: 'white',
                          padding: '4px 8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        className="rounded-pill"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
          {hasMore && (
            <div className="text-center mt-4">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={loadMore}
                disabled={loading}
                className="rounded-pill"
              >
                {loading ? <Spinner size="sm" /> : 'Charger plus'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: SAVED VIDEOS TAB
// ============================================
const SavedVideosTab = ({ token }) => {
  const dispatch = useDispatch();
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadSavedVideos = async () => {
      if (!token) return;
      if (hasLoadedRef.current) return;
      
      setLoading(true);
      hasLoadedRef.current = true;
      
      try {
        const result = await dispatch(getSavedVideos(token, 1, 50));
        if (result?.success) {
          setSavedVideos(result.videos || []);
        } else {
          setError(result?.error || 'Error al cargar videos guardados');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedVideos();
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger" className="mx-auto" style={{ maxWidth: '400px' }}>
          <p className="mb-0">❌ {error}</p>
        </Alert>
      </div>
    );
  }

  if (savedVideos.length === 0) {
    return (
      <div className="empty-state text-center py-5">
        <Bookmark size={48} className="empty-icon text-muted mb-3" />
        <p className="text-muted">Aucune vidéo enregistrée</p>
      </div>
    );
  }

  return (
    <div className="videos-tab">
      <Row xs={2} sm={2} md={3} lg={4} className="g-2">
        {savedVideos.map(video => (
          <Col key={video._id}>
            <VideoCardVertical video={video} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ============================================
// COMPONENTE: LIKED VIDEOS TAB
// ============================================
const LikedVideosTab = ({ token }) => {
  const dispatch = useDispatch();
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadLikedVideos = async () => {
      if (!token) return;
      if (hasLoadedRef.current) return;
      
      setLoading(true);
      hasLoadedRef.current = true;
      
      try {
        const result = await dispatch(getLikedVideos(token, 1, 50));
        if (result?.success) {
          setLikedVideos(result.videos || []);
        } else {
          setError(result?.error || 'Error al cargar videos con like');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadLikedVideos();
  }, [token, dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger" className="mx-auto" style={{ maxWidth: '400px' }}>
          <p className="mb-0">❌ {error}</p>
        </Alert>
      </div>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <div className="empty-state text-center py-5">
        <Heart size={48} className="empty-icon text-muted mb-3" />
        <p className="text-muted">Aucune vidéo aimée</p>
      </div>
    );
  }

  return (
    <div className="videos-tab">
      <Row xs={2} sm={2} md={3} lg={4} className="g-2">
        {likedVideos.map(video => (
          <Col key={video._id}>
            <VideoCardVertical video={video} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ============================================
// COMPONENTE: PLAN INFO TAB
// ============================================
const PlanInfoTab = ({ planData }) => {
  const { planName, planLimits, isUserPro, hasActivePlan, getDaysRemaining } = planData;
  
  return (
    <div className="plan-info-tab">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5>Plan {planName || 'Gratuit'}</h5>
          {isUserPro && hasActivePlan && getDaysRemaining() > 0 && (
            <Badge bg="info" className="rounded-pill">
              <Clock size={10} className="me-1" />
              {getDaysRemaining()} jours restants
            </Badge>
          )}
          <hr />
          <div>Canaux max: {planLimits?.maxChannels === 'unlimited' ? 'Illimité' : planLimits?.maxChannels}</div>
          <div>Vidéos max: {planLimits?.maxVideos === 'unlimited' ? 'Illimité' : planLimits?.maxVideos}</div>
          <div>Durée max: {planLimits?.maxDuration || 20} secondes</div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ============================================
// COMPONENTE: DELETE CHANNEL MODAL
// ============================================
const DeleteChannelModal = ({ show, onClose, channel, onConfirm, deleting }) => {
  if (!show) return null;
  
  const isPending = channel?.pendiente === true;
  const videoCount = channel?.totalVideos || 0;
  const followerCount = channel?.followersCount || 0;
  
  if (isPending) {
    return (
      <div className="custom-modal-overlay" onClick={onClose}>
        <div className="custom-modal-container" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
          <div className="custom-modal-header" style={{ backgroundColor: '#f59e0b' }}>
            <h3 className="custom-modal-title">🕒 Supprimer la chaîne en attente</h3>
            <button className="custom-modal-close" onClick={onClose}>×</button>
          </div>
          <div className="custom-modal-body">
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>Voulez-vous vraiment supprimer cette chaîne en attente ?</p>
            <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#f59e0b', fontSize: '16px' }}>{channel?.name}</p>
            <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px' }}>
              <small style={{ color: '#92400e' }}>ℹ️ Cette chaîne n'a pas encore été approuvée et ne contient aucune vidéo.</small>
            </div>
          </div>
          <div className="custom-modal-footer">
            <button className="custom-modal-btn custom-modal-btn-secondary" onClick={onClose}>Annuler</button>
            <button className="custom-modal-btn custom-modal-btn-danger" onClick={onConfirm} disabled={deleting} style={{ backgroundColor: '#f59e0b' }}>
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header" style={{ backgroundColor: '#dc3545' }}>
          <h3 className="custom-modal-title">🗑️ Supprimer définitivement</h3>
          <button className="custom-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="custom-modal-body">
          <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '16px' }}>Êtes-vous absolument sûr de vouloir supprimer ?</p>
          <div style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', color: '#dc3545', fontSize: '18px' }}>{channel?.name}</p>
            <p style={{ fontSize: '13px', color: '#6c757d' }}>{channel?.activity}</p>
          </div>
          <div style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '10px' }}>⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !</p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '13px' }}>
              <li><strong>Toutes les vidéos</strong> de cette chaîne seront définitivement supprimées</li>
              {videoCount > 0 && <li><strong>{videoCount} vidéo(s)</strong> seront perdues à jamais</li>}
              {followerCount > 0 && <li><strong>{followerCount} abonné(s)</strong> perdront l'accès</li>}
              <li>Les <strong>likes, commentaires et partages</strong> seront également supprimés</li>
              <li>Cette <strong>action ne peut pas être annulée</strong></li>
            </ul>
          </div>
        </div>
        <div className="custom-modal-footer">
          <button className="custom-modal-btn custom-modal-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="custom-modal-btn custom-modal-btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Suppression...' : 'Oui, supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: INFO MODAL
// ============================================
const InfoModal = ({ show, onClose, user }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!show) return null;
  
  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <h3 className="custom-modal-title">📋 Informations du profil</h3>
          <button className="custom-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="custom-modal-body">
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ fontSize: '14px', color: '#666' }}>📝 À propos</h4>
            <p>{user?.story || 'Aucune description'}</p>
          </div>
          <hr />
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ fontSize: '14px', color: '#666' }}>📞 Contact</h4>
            <p>✉️ {user?.email || 'Non renseigné'}</p>
            <p>📱 {user?.mobile || 'Non renseigné'}</p>
            <p>📍 {user?.address || 'Non renseignée'}</p>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.followers?.length || 0}</div>
              <small>Abonnés</small>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.following?.length || 0}</div>
              <small>Abonnements</small>
            </div>
          </div>
          <hr />
          <small>📅 Membre depuis le {formatDate(user?.createdAt)}</small>
        </div>
        <div className="custom-modal-footer">
          <button className="custom-modal-btn custom-modal-btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: PROFILE (VERSIÓN FINAL)
// ============================================
const Profile = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  
  const { auth, profile } = useSelector(state => state);
  const { userChannels = [], loading: channelsLoading } = useSelector(state => state.channel || {});
  const { userVideos } = useSelector(state => state.video || { userVideos: { videos: [], total: 0 } });
  
  // Estados
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingChannelName, setPendingChannelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('channels');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para el modal de eliminación de cuenta
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  
  // Estado para modal de límite de plan
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  
  // Usar el hook useUserPlan
  const planData = useUserPlan();
  const { 
    isUserPro, 
    planName, 
    planIcon, 
    planColor, 
    planLimits,
    canCreateChannel,
    currentPlan,
    hasActivePlan,
    getDaysRemaining
  } = planData;
  
  const hasLoadedChannelsRef = useRef(false);
  const hasLoadedVideosRef = useRef(false);
  const userRole = auth.user?.role;
  
  const isOwnProfile = auth.user?._id === id;
  const currentUser = isOwnProfile ? auth.user : profile.users?.find(u => u._id === id);
  
  // ✅ Calcular canales APROBADOS (pendiente === false)
  const approvedChannels = userChannels.filter(ch => ch.pendiente === false);
  const currentChannelCount = approvedChannels.length;
  const pendingChannelsCount = userChannels.filter(ch => ch.pendiente === true).length;
  
  // ✅ Calcular videos APROBADOS (pendiente === false)
  const approvedVideos = userVideos?.videos?.filter(v => v.pendiente === false) || [];
  const currentVideoCount = approvedVideos.length;
  const pendingVideosCount = userVideos?.videos?.filter(v => v.pendiente === true).length || 0;
  
  const maxChannels = planLimits.maxChannels === 'unlimited' ? Infinity : planLimits.maxChannels;
  const remainingChannels = maxChannels === Infinity ? '∞' : Math.max(0, maxChannels - currentChannelCount);
  const canCreateNewChannel = canCreateChannel(currentChannelCount);
  
  const maxVideos = planLimits.maxVideos === 'unlimited' ? Infinity : planLimits.maxVideos;
  const remainingVideos = maxVideos === Infinity ? '∞' : Math.max(0, maxVideos - currentVideoCount);
  
  // ✅ Cargar videos del usuario
  useEffect(() => {
    if (!auth.token || !id || !isOwnProfile) return;
    if (hasLoadedVideosRef.current) return;
    
    const loadUserVideos = async () => {
      try {
        hasLoadedVideosRef.current = true;
        await dispatch(getUserVideos(id, 'all', 1, 100));
      } catch (err) {
        console.error('Error loading user videos:', err);
      }
    };
    
    loadUserVideos();
  }, [id, auth.token, dispatch, isOwnProfile]);
  
  useEffect(() => {
    if (!auth.token || !id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!isOwnProfile && !profile.ids?.includes(id)) {
          await dispatch(getProfileUsers({ id, auth }));
        }
        
        if (!hasLoadedChannelsRef.current) {
          hasLoadedChannelsRef.current = true;
          await dispatch(getMyChannels(auth.token));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, auth, dispatch, profile.ids, isOwnProfile]);
  
  const handleViewChannel = (channelId, isPending) => {
    if (isPending) {
      history.push(`/channel/${channelId}/owner`);
    } else {
      history.push(`/channel/${channelId}`);
    }
  };
  
  const handleEditChannel = (channelId, isPending, channelName) => {
    if (isPending) {
      setPendingChannelName(channelName);
      setShowPendingModal(true);
    } else {
      history.push(`/channel/${channelId}/edit`);
    }
  };
  
  const handleDeleteClick = (channel) => {
    setChannelToDelete(channel);
    setShowDeleteConfirm(true);
  };
  
  const handleCloseModal = () => {
    setShowDeleteConfirm(false);
    setChannelToDelete(null);
  };
  
  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    setDeleting(true);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    try {
      const res = await deleteDataAPI(`channels/${channelToDelete._id}`, auth.token);
      
      if (res.data?.success) {
        dispatch({ type: CHANNEL_TYPES.DELETE_CHANNEL_SUCCESS, payload: channelToDelete._id });
        await dispatch(getMyChannels(auth.token));
        await dispatch(getUserVideos(id, 'all', 1, 100));
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: "Canal supprimé avec succès" } });
        handleCloseModal();
      }
    } catch (err) {
      console.error('Error:', err);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err.message } });
    } finally {
      setDeleting(false);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
  };
  
  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    try {
      const result = await dispatch(deleteProfileUser(auth));
      
      if (result?.success) {
        setShowDeleteAccountModal(false);
        setConfirmEmail('');
        setConfirmText('');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: error.response?.data?.msg || error.message } 
      });
    } finally {
      setDeletingAccount(false);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
    }
  };
  
  const handleDeleteProfile = () => {
    setConfirmEmail('');
    setConfirmText('');
    setShowDeleteAccountModal(true);
  };
  
  const handleEditProfile = () => history.push('/profile/settings');
  const handleUpgradeToPro = () => history.push('/planes');
  const handleShowInfo = () => setShowInfoModal(true);
  
  const handleCreateNewChannel = () => {
    if (canCreateNewChannel) {
      history.push('/channel/new');
    } else {
      setShowPlanLimitModal(true);
    }
  };
  
  const ownChannels = userChannels.map(ch => ({
    ...ch,
    isOwner: ch.owner?._id === id || ch.userId === id || ch.owner === id,
    pendiente: ch.pendiente === true
  }));
  
  if (!auth.token) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h5>🔐 Authentification requise</h5>
          <p>Veuillez vous connecter pour voir les profils.</p>
        </Alert>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du profil...</p>
      </Container>
    );
  }
  
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h5>👤 Profil non trouvé</h5>
          <p>L'utilisateur n'existe pas.</p>
        </Alert>
      </Container>
    );
  }
  
  return (
    <div className="profile-page">
      <Container className="py-4">
        {/* ✅ Alerta de plan expirado o próximo a expirar */}
        {isOwnProfile && !hasActivePlan && isUserPro && (
          <Alert variant="danger" className="mb-3 text-center" style={{ borderRadius: '12px' }}>
            <strong>⚠️ Votre plan a expiré !</strong> Veuillez renouveler pour continuer à utiliser les fonctionnalités premium.
            <Button variant="outline-danger" size="sm" className="ms-3" onClick={handleUpgradeToPro}>
              Renouveler
            </Button>
          </Alert>
        )}
        
        {isOwnProfile && hasActivePlan && isUserPro && getDaysRemaining() <= 7 && getDaysRemaining() > 0 && (
          <Alert variant="warning" className="mb-3 text-center" style={{ borderRadius: '12px' }}>
            <strong>⏰ Votre plan {planName} expire dans {getDaysRemaining()} jour{getDaysRemaining() > 1 ? 's' : ''} !</strong>
            <Button variant="outline-warning" size="sm" className="ms-3" onClick={handleUpgradeToPro}>
              Renouveler
            </Button>
          </Alert>
        )}
        
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-container">
              <img 
                src={currentUser.avatar || '/default-avatar.png'} 
                alt={currentUser.fullname || currentUser.username}
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
            </div>
          </div>
          
          {isOwnProfile && (
            <Dropdown className="actions-dropdown">
              <Dropdown.Toggle variant="light" className="icon-btn">
                <ThreeDotsVertical size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                {/* INFORMACIÓN DEL PLAN */}
                <Dropdown.ItemText className="plan-info-item">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '16px' }}>{planIcon}</span>
                    <div>
                      <small className="text-muted d-block">Plan actuel</small>
                      <strong style={{ color: planColor }}>{planName}</strong>
                    </div>
                  </div>
                </Dropdown.ItemText>
                
                <Dropdown.Divider />
                
                {/* LÍMITES DEL PLAN - CON DATOS CORRECTOS (solo aprobados) */}
                <Dropdown.ItemText className="plan-limits-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">📺 Canaux (approuvés)</small>
                    <small>
                      <strong>{currentChannelCount}</strong> / {maxChannels === Infinity ? '∞' : maxChannels}
                      {pendingChannelsCount > 0 && (
                        <Badge bg="warning" className="ms-1" style={{ fontSize: '9px' }}>
                          +{pendingChannelsCount} en attente
                        </Badge>
                      )}
                    </small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">🎬 Vidéos (publiées)</small>
                    <small>
                      <strong>{currentVideoCount}</strong> / {maxVideos === Infinity ? '∞' : maxVideos}
                      {pendingVideosCount > 0 && (
                        <Badge bg="warning" className="ms-1" style={{ fontSize: '9px' }}>
                          +{pendingVideosCount} en attente
                        </Badge>
                      )}
                    </small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">⏱️ Durée max</small>
                    <small><strong>{planLimits.maxDuration}</strong> sec</small>
                  </div>
                </Dropdown.ItemText>
                
                <Dropdown.Divider />
                
                {/* BOTÓN CREAR NUEVO CANAL */}
                {canCreateNewChannel ? (
                  <Dropdown.Item onClick={handleCreateNewChannel} className="text-success">
                    <Tv size={14} className="me-2" /> 
                    Créer un nouveau canal
                    {remainingChannels !== '∞' && (
                      <Badge bg="success" className="ms-2" style={{ fontSize: '10px' }}>
                        +{remainingChannels} restant{remainingChannels > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Dropdown.Item>
                ) : (
                  <Dropdown.Item onClick={handleCreateNewChannel} className="text-muted">
                    <Tv size={14} className="me-2" /> 
                    Créer un nouveau canal
                    <Badge bg="secondary" className="ms-2" style={{ fontSize: '10px' }}>
                      Limite atteinte
                    </Badge>
                  </Dropdown.Item>
                )}
                
                <Dropdown.Divider />
                
                {/* BOTÓN UPGRADE (si no es business) */}
                {currentPlan !== 'business' && (
                  <Dropdown.Item onClick={handleUpgradeToPro} className="text-primary">
                    <Star size={14} className="me-2" /> 
                    {isUserPro ? 'Améliorer mon plan' : 'Passer à UserPro'}
                  </Dropdown.Item>
                )}
                
                <Dropdown.Divider />
                
                <Dropdown.Item onClick={handleShowInfo}><InfoCircle size={14} className="me-2" /> Informations</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleEditProfile}><Pencil size={14} className="me-2" /> Modifier le profil</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleDeleteProfile} className="text-danger"><Trash3 size={14} className="me-2" /> Supprimer le profil</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        
        <div className="profile-identity text-center">
          <h2>{currentUser.fullname || currentUser.username}</h2>
          <p><Envelope size={14} className="me-1" />{currentUser.email}</p>
          {isUserPro && <Badge bg="primary" className="mt-2 rounded-pill"><Star size={10} className="me-1" /> UserPro</Badge>}
        </div>
        
        <div className="profile-tabs mt-4">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs" fill>
            <Tab eventKey="channels" title={<span><Tv size={16} className="me-2" />Chaînes</span>}>
              <ChannelsTab 
                channels={ownChannels}
                loading={channelsLoading}
                onViewChannel={handleViewChannel}
                onEditChannel={handleEditChannel}
                onDeleteChannel={handleDeleteClick}
                userRole={userRole}
              />
            </Tab>
            
            <Tab eventKey="videos" title={<span><Film size={16} className="me-2" />Vidéos</span>}>
              <VideosTab userId={id} isOwner={isOwnProfile} />
            </Tab>
            
            {isOwnProfile && (
              <Tab eventKey="saved" title={<span><Bookmark size={16} className="me-2" />Enregistrés</span>}>
                <SavedVideosTab token={auth.token} />
              </Tab>
            )}
            
            {isOwnProfile && (
              <Tab eventKey="liked" title={<span><Heart size={16} className="me-2" />J'aime</span>}>
                <LikedVideosTab token={auth.token} />
              </Tab>
            )}
            
            <Tab eventKey="plan" title={<span><CreditCard size={16} className="me-2" />Plan</span>}>
              <PlanInfoTab planData={planData} />
            </Tab>
          </Tabs>
        </div>
        
        <DeleteChannelModal 
          show={showDeleteConfirm}
          onClose={handleCloseModal}
          channel={channelToDelete}
          onConfirm={confirmDeleteChannel}
          deleting={deleting}
        />
        
        <InfoModal 
          show={showInfoModal} 
          onClose={() => setShowInfoModal(false)} 
          user={currentUser} 
        />
        
        {/* MODAL PARA CANAL PENDIENTE */}
        <CustomModal
          show={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          title="⏳ Modification impossible"
          onConfirm={() => setShowPendingModal(false)}
          confirmText="Compris"
          confirmDisabled={false}
          confirmLoading={false}
        >
          <div className="text-center mb-3">
            <div style={{ fontSize: '50px' }}>⏳</div>
            <h5 className="mt-2 text-warning" style={{ color: '#f59e0b' }}>Canal en attente d'approbation</h5>
          </div>
          
          <div style={{ 
            backgroundColor: '#fef3c7', 
            borderLeft: '4px solid #f59e0b', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#78350f', marginBottom: '10px' }}>
              <strong>❌ Vous ne pouvez pas modifier ce canal pour le moment.</strong>
            </p>
            <p style={{ color: '#78350f', marginBottom: '10px' }}>
              Votre canal <strong>"{pendingChannelName}"</strong> est actuellement en cours de vérification par notre équipe administrative.
            </p>
            <p style={{ color: '#78350f', marginBottom: '0' }}>
              Une fois approuvé, vous pourrez modifier ses informations et publier des vidéos.
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '13px',
            color: '#004085'
          }}>
            <strong>💡 Information :</strong> La vérification prend généralement 24 à 48 heures. Vous serez notifié par email dès que votre chaîne sera approuvée.
          </div>
        </CustomModal>
        
        {/* MODAL PARA ELIMINAR CUENTA */}
        <CustomModal
          show={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          title="🗑️ Supprimer mon compte"
          onConfirm={confirmDeleteAccount}
          confirmText="Oui, supprimer mon compte"
          confirmDisabled={confirmEmail !== auth.user?.email || confirmText !== 'SUPPRIMER' || deletingAccount}
          confirmLoading={deletingAccount}
        >
          <div className="text-center mb-3">
            <div style={{ fontSize: '40px' }}>⚠️</div>
            <h5 className="mt-1 text-danger">Action IRRÉVERSIBLE</h5>
          </div>
          
          <div className="alert alert-warning" style={{ padding: '12px', fontSize: '13px' }}>
            <strong>🗑️ Ce qui sera supprimé définitivement :</strong>
            <ul className="mt-1 mb-0" style={{ paddingLeft: '20px' }}>
              <li>Tous vos <strong>canaux</strong> (approuvés et en attente)</li>
              <li>Toutes vos <strong>vidéos</strong></li>
              <li>Tous vos <strong>likes et favoris</strong></li>
              <li>Tous vos <strong>commentaires</strong></li>
              <li>Vos <strong>abonnés et abonnements</strong></li>
              <li>Vos <strong>informations personnelles</strong></li>
            </ul>
          </div>
          
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>Confirmez votre email</label>
            <input
              type="email"
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '14px' }}
              placeholder={auth.user?.email}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 'bold' }}>
              Tapez <strong className="text-danger">SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              className="form-control"
              style={{ padding: '8px 12px', fontSize: '14px' }}
              placeholder="SUPPRIMER"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            />
          </div>
        </CustomModal>
        
        {/* MODAL: LÍMITE DE PLAN ALCANZADO */}
        <CustomModal
          show={showPlanLimitModal}
          onClose={() => setShowPlanLimitModal(false)}
          title="📊 Limite atteinte"
          onConfirm={() => setShowPlanLimitModal(false)}
          confirmText="Compris"
          confirmDisabled={false}
          confirmLoading={false}
        >
          <div className="text-center mb-3">
            <div style={{ fontSize: '50px' }}>📊</div>
            <h5 className="mt-2 text-warning" style={{ color: '#f59e0b' }}>Limite de canaux atteinte</h5>
          </div>
          
          <div style={{ 
            backgroundColor: '#fef3c7', 
            borderLeft: '4px solid #f59e0b', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#78350f', marginBottom: '10px' }}>
              <strong>❌ Vous avez atteint la limite de canaux autorisés pour votre plan {planName}.</strong>
            </p>
            <p style={{ color: '#78350f', marginBottom: '0' }}>
              Pour créer plus de canaux, veuillez passer à un plan supérieur.
            </p>
          </div>
          
          <div className="d-flex gap-2 justify-content-center mt-3">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowPlanLimitModal(false)}>
              Plus tard
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpgradeToPro}>
              Voir les plans
            </Button>
          </div>
        </CustomModal>
      </Container>
    </div>
  );
};

export default Profile;
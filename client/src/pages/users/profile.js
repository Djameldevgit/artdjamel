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
  Row,
  Col
} from 'react-bootstrap';
import { 
  ThreeDotsVertical,
  Pencil, 
  Trash3,
  Envelope,
  Film,
  InfoCircle,
  Heart,
  Bookmark,
  X
} from 'react-bootstrap-icons';
import { getProfileUsers, deleteProfileUser } from '../../redux/actions/profileAction';
import { getSavedVideos, getLikedVideos } from '../../redux/actions/userAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import VideoCardVertical from '../../components/VideoCardVertical';
import { getUserVideos } from '../../redux/actions/videoAction';
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
// COMPONENTE: VIDEOS TAB (SIN FILTROS DE APROBACIÓN)
// ============================================
const VideosTab = ({ userId, isOwner }) => {
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const { userVideos } = useSelector(state => state.video || { userVideos: { videos: [], loading: false } });
  const { videos = [], loading = false, total = 0, page = 1, hasMore = true } = userVideos;
  
  useEffect(() => {
    if (userId && auth?.token) {
      dispatch(getUserVideos(userId, 'all', 1, 12));
    }
  }, [userId, auth?.token, dispatch]);
  
  const loadMore = () => {
    if (hasMore && !loading) {
      dispatch(getUserVideos(userId, 'all', page + 1, 12));
    }
  };
  
  if (loading && videos.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" size="sm" />
        <p className="mt-2 text-muted">Chargement de vos œuvres...</p>
      </div>
    );
  }
  
  if (videos.length === 0 && !loading) {
    return (
      <div className="empty-state text-center py-5">
        <Film size={48} className="empty-icon text-muted mb-3" />
        <p className="text-muted">Vous n'avez encore aucune œuvre</p>
        {isOwner && (
          <Button 
            variant="primary" 
            size="sm" 
            className="rounded-pill mt-2"
            onClick={() => window.location.href = '/create-video-page'}
          >
            <Film size={14} className="me-2" />
            Publier une œuvre
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="videos-tab">
      <Row xs={2} sm={2} md={3} lg={4} className="g-2">
        {videos.map(video => (
          <Col key={video._id}>
            <VideoCardVertical video={video} />
          </Col>
        ))}
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
          setError(result?.error || 'Erreur lors du chargement des œuvres sauvegardées');
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
        <p className="text-muted">Aucune œuvre sauvegardée</p>
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
          setError(result?.error || 'Erreur lors du chargement des œuvres aimées');
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
        <p className="text-muted">Aucune œuvre aimée</p>
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
// COMPONENTE PRINCIPAL: PROFILE (VERSIÓN SIN PLANES)
// ============================================
const Profile = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  
  const { auth, profile } = useSelector(state => state);
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Estados para el modal de eliminación de cuenta
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  
  const isOwnProfile = auth.user?._id === id;
  const currentUser = isOwnProfile ? auth.user : profile.users?.find(u => u._id === id);
  
  // Cargar datos del perfil
  useEffect(() => {
    if (!auth.token || !id) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!isOwnProfile && !profile.ids?.includes(id)) {
          await dispatch(getProfileUsers({ id, auth }));
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
  
  // Handlers
  const handleEditProfile = () => history.push('/profile/settings');
  const handleShowInfo = () => setShowInfoModal(true);
  
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
        {/* Header con avatar y dropdown */}
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
              
              <Dropdown.Menu align="end" className="profile-actions-menu">
                <Dropdown.Item onClick={handleShowInfo}>
                  <InfoCircle size={14} className="me-2" /> Informations
                </Dropdown.Item>
                <Dropdown.Item onClick={handleEditProfile}>
                  <Pencil size={14} className="me-2" /> Modifier le profil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleDeleteProfile} className="text-danger">
                  <Trash3 size={14} className="me-2" /> Supprimer le profil
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        
        <div className="profile-identity text-center">
          <h2>{currentUser.fullname || currentUser.username}</h2>
          <p><Envelope size={14} className="me-1" />{currentUser.email}</p>
        </div>
        
        {/* Tabs */}
        <div className="profile-tabs mt-4">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs" fill>
            <Tab eventKey="videos" title={<span><Film size={16} className="me-2" />Œuvres</span>}>
              <VideosTab userId={id} isOwner={isOwnProfile} />
            </Tab>
            
            {isOwnProfile && (
              <Tab eventKey="saved" title={<span><Bookmark size={16} className="me-2" />Sauvegardées</span>}>
                <SavedVideosTab token={auth.token} />
              </Tab>
            )}
            
            {isOwnProfile && (
              <Tab eventKey="liked" title={<span><Heart size={16} className="me-2" />Aimées</span>}>
                <LikedVideosTab token={auth.token} />
              </Tab>
            )}
          </Tabs>
        </div>
        
        {/* Modales */}
        <InfoModal 
          show={showInfoModal} 
          onClose={() => setShowInfoModal(false)} 
          user={currentUser} 
        />
        
        {/* Modal eliminar cuenta */}
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
              <li>Toutes vos <strong>œuvres</strong></li>
              <li>Tous vos <strong>likes et favoris</strong></li>
              <li>Tous vos <strong>commentaires</strong></li>
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
      </Container>
    </div>
  );
};

export default Profile;
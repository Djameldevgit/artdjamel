// src/pages/channel/MisChannel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Badge,
  Alert,
  Toast,
  Dropdown
} from 'react-bootstrap';
import { 
  Tv, 
  Plus, 
  Pencil, 
  Eye, 
  GeoAlt, 
  Telephone, 
  Envelope, 
  Briefcase,
  CheckCircle,
  Building,
  InfoCircle,
  Clock,
  ThreeDotsVertical,
  Trash3
} from 'react-bootstrap-icons';
import { getMyChannels, deleteChannel, CHANNEL_TYPES } from '../../redux/actions/channelAction';
import useUserPlan from '../../components/useUserPlan';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';

const MisChannel = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  // ✅ Selectors con valores por defecto para evitar undefined
  const { token, user } = useSelector(state => state.auth || {});
  const { userChannels = [], loading = false } = useSelector(state => state.channel || {});
  
  // ✅ Estado para el dropdown y eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [deletingChannelId, setDeletingChannelId] = useState(null);
  
  // ✅ Hook para obtener el plan del usuario
  const { 
    currentPlan, 
    planName, 
    planLimits, 
    isUserPro, 
    hasActivePlan,
    isExpired,
    getDaysRemaining,
    planColor,
    planIcon
  } = useUserPlan();
  
  const [showUpgradeToast, setShowUpgradeToast] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  
  // ✅ Usar ref para evitar llamadas duplicadas
  const hasLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  // ✅ Función para obtener token como string
  const getAuthToken = () => {
    if (!token) return null;
    if (typeof token === 'string') return token;
    if (typeof token === 'object' && token !== null) {
      return token.token || token.access_token || null;
    }
    return null;
  };

  // ✅ Cargar canales del usuario
  useEffect(() => {
    const loadChannels = async () => {
      if (!token || !user) return;
      if (hasLoadedRef.current) return;
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      hasLoadedRef.current = true;
      
      console.log('📱 Cargando canales del usuario...');
      await dispatch(getMyChannels(token));
      
      loadingRef.current = false;
    };
    
    loadChannels();
  }, [token, user, dispatch]);

  // ✅ Limpiar ref al desmontar
  useEffect(() => {
    return () => {
      hasLoadedRef.current = false;
      loadingRef.current = false;
    };
  }, []);

  // ✅ Verificar si puede crear un nuevo canal
  const canCreateNewChannel = () => {
    const currentChannelCount = userChannels?.length || 0;
    const maxChannels = planLimits?.maxChannels || 1;
    
    if (maxChannels === 'unlimited') return true;
    return currentChannelCount < maxChannels;
  };

  // ✅ Obtener canales restantes
  const getRemainingChannels = () => {
    const currentChannelCount = userChannels?.length || 0;
    const maxChannels = planLimits?.maxChannels || 1;
    
    if (maxChannels === 'unlimited') return 'Illimité';
    const remaining = maxChannels - currentChannelCount;
    return remaining > 0 ? remaining : 0;
  };

  // ✅ Manejador para crear nueva chaîne
  const handleCreateChannel = () => {
    if (!canCreateNewChannel()) {
      setShowLimitAlert(true);
      setTimeout(() => setShowLimitAlert(false), 5000);
      return;
    }
    history.push('/channel/new');
  };

  // ✅ Manejador para ver canal
  const handleViewChannel = (channelId) => {
    history.push(`/channel/${channelId}`);
  };

  // ✅ Manejador para editar canal
  const handleEditChannel = (channelId) => {
    history.push(`/channel/${channelId}/edit`);
  };

  // ✅ Manejador para eliminar canal
  const handleDeleteClick = (channel) => {
    setChannelToDelete(channel);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    const authToken = getAuthToken();
    if (!authToken) {
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: "Vous devez être connecté" } 
      });
      return;
    }
    
    setDeletingChannelId(channelToDelete._id);
    
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/channels/${channelToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ 
          reason: "Canal supprimé par le propriétaire depuis la page Mes chaînes" 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // ✅ FORZAR ACTUALIZACIÓN DIRECTA DEL ESTADO LOCAL
        // Método 1: Usar la constante correcta (ya está definida en CHANNEL_TYPES)
        dispatch({ 
          type: CHANNEL_TYPES.DELETE_CHANNEL_SUCCESS, 
          payload: channelToDelete._id 
        });
        
        // Método 2: También refrescar desde el servidor (doble seguridad)
        setTimeout(async () => {
          await dispatch(getMyChannels(authToken));
        }, 500);
        
        dispatch({ 
          type: GLOBALTYPES.ALERT, 
          payload: { success: data.message || "Canal supprimé avec succès" } 
        });
        
        setShowDeleteConfirm(false);
        setChannelToDelete(null);
        
      } else {
        throw new Error(data.message || data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error('❌ Error deleteChannel:', err);
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: err.message || "Erreur lors de la suppression du canal" } 
      });
    } finally {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
      setDeletingChannelId(null);
    }
  };

  // ✅ Renderizar badge del plan
  const renderPlanBadge = () => {
    const planIcons = {
      free: '🆓',
      basic: '⭐',
      pro: '🚀',
      business: '👑',
      enterprise: '🏢'
    };
    
    const planNames = {
      free: 'Gratuit',
      basic: 'Basic',
      pro: 'Pro',
      business: 'Business',
      enterprise: 'Enterprise'
    };
    
    return (
      <div className="plan-badge" style={{ backgroundColor: `${planColor}15`, borderColor: planColor }}>
        <span style={{ color: planColor }}>{planIcons[currentPlan] || '🆓'}</span>
        <span style={{ color: planColor }}>Plan {planNames[currentPlan] || 'Gratuit'}</span>
        {isUserPro && hasActivePlan && getDaysRemaining() > 0 && (
          <span className="plan-days" style={{ color: planColor }}>
            ({getDaysRemaining()} jours restants)
          </span>
        )}
        {isExpired && (
          <span className="plan-expired">⚠️ Expiré</span>
        )}
      </div>
    );
  };

  // ✅ Renderizar información de límites
  const renderLimitInfo = () => {
    const currentCount = userChannels?.length || 0;
    const maxChannels = planLimits?.maxChannels || 1;
    const remaining = getRemainingChannels();
    const percentage = maxChannels === 'unlimited' ? 100 : (currentCount / maxChannels) * 100;
    
    if (!isUserPro && currentPlan === 'free') {
      return (
        <Alert variant="info" className="mt-3">
          <div className="d-flex align-items-center gap-2">
            <InfoCircle size={20} />
            <div>
              <strong>Plan Gratuit</strong>
              <p className="mb-0 small">
                Vous avez {currentCount}/1 canal. 
                <a href="/become-pro" className="ms-2">Passez à UserPro</a> pour créer plus de canaux.
              </p>
            </div>
          </div>
        </Alert>
      );
    }
    
    return (
      <div className={`plan-limit-card ${!canCreateNewChannel() ? 'limit-reached' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">📊 Canaux utilisés</span>
          <span className="fw-bold">📊 Restants</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>{currentCount} / {maxChannels === 'unlimited' ? '∞' : maxChannels}</span>
          <span>{remaining === 'Illimité' ? '∞' : remaining}</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div 
            className={`progress-bar ${!canCreateNewChannel() ? 'bg-danger' : 'bg-success'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {!canCreateNewChannel() && (
          <Alert variant="danger" className="mt-3 mb-0 py-2">
            <strong>⚠️ Limite atteinte !</strong> Vous ne pouvez pas créer plus de {maxChannels} canal{maxChannels > 1 ? 'x' : ''}.
            <a href="/become-pro" className="ms-2">Passez au plan supérieur</a>
          </Alert>
        )}
      </div>
    );
  };

  const channelCount = userChannels?.length || 0;

  // ✅ Estado de carga
  if (loading && channelCount === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Chargement de vos chaînes...</span>
      </div>
    );
  }

  return (
    <div className="bg-light" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <Container className="py-4">
        {/* Toast de upgrade */}
        <Toast 
          show={showUpgradeToast} 
          onClose={() => setShowUpgradeToast(false)}
          className="position-fixed top-0 end-0 m-3"
          style={{ zIndex: 9999 }}
          delay={5000}
          autohide
        >
          <Toast.Header className="bg-warning">
            <strong className="me-auto">💡 Astuce</strong>
          </Toast.Header>
          <Toast.Body>
            Passez à UserPro pour débloquer plus de canaux et de fonctionnalités !
            <Button size="sm" variant="primary" className="ms-2" onClick={() => history.push('/become-pro')}>
              Upgrade
            </Button>
          </Toast.Body>
        </Toast>

        {/* Alert de limite atteinte */}
        <Alert 
          show={showLimitAlert} 
          variant="danger" 
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 9999, minWidth: '300px' }}
          onClose={() => setShowLimitAlert(false)}
          dismissible
        >
          <div className="d-flex align-items-center gap-2">
            <span>⚠️</span>
            <div>
              <strong>Vous ne pouvez pas créer plus de canaux !</strong>
              <br />
              <small>Votre plan {planName} permet maximum {planLimits?.maxChannels || 1} canal. Passez à un plan supérieur.</small>
            </div>
          </div>
        </Alert>

        {/* En-tête */}
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h1 className="h2 fw-bold text-dark d-flex align-items-center gap-2 mb-0">
              <Tv className="text-primary" size={32} />
              Mes chaînes
              {channelCount > 0 && (
                <Badge bg="secondary" pill className="ms-2">{channelCount}</Badge>
              )}
            </h1>
            {renderPlanBadge()}
          </div>
          <Button 
            variant="primary" 
            onClick={handleCreateChannel}
            disabled={!canCreateNewChannel()}
            className="rounded-pill px-4 py-2"
          >
            <Plus size={18} className="me-2" /> Nouvelle chaîne
          </Button>
        </div>

        {/* Information du plan et limites */}
        <div className="mb-4">
          {renderLimitInfo()}
        </div>

        {/* Liste des chaînes */}
        {channelCount === 0 ? (
          <Card className="text-center p-5 shadow-sm border-0">
            <div className="mb-4">
              <Tv size={64} className="text-muted mx-auto mb-3" />
              <h5 className="text-muted">Vous n'avez encore aucune chaîne</h5>
              <p className="text-muted mb-4">
                Créez votre première chaîne pour commencer à publier des vidéos commerciales.
              </p>
              <Button 
                variant="primary" 
                onClick={handleCreateChannel} 
                className="mx-auto rounded-pill px-4"
                disabled={!canCreateNewChannel()}
              >
                <Plus size={18} className="me-2" /> Créer ma première chaîne
              </Button>
              {!canCreateNewChannel() && (
                <p className="text-danger mt-3 small">
                  ⚠️ Vous avez atteint la limite de {planLimits?.maxChannels || 1} canal pour votre plan {planName}.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <>
            <Row xs={1} md={2} lg={3} className="g-4">
              {userChannels.map((channel) => (
                <Col key={channel._id}>
                  <Card className="h-100 shadow-sm border-0 hover-shadow transition-all">
                    {/* Header con gradiente */}
                    <div className="position-relative rounded-top" style={{ 
                      height: '100px', 
                      background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                      borderTopLeftRadius: '0.375rem',
                      borderTopRightRadius: '0.375rem'
                    }}>
                      {/* Avatar flotante */}
                      <div className="position-absolute bottom-0 start-50 translate-middle">
                        <div className="bg-white rounded-circle p-1 shadow-sm">
                          {channel.avatar && channel.avatar !== 'default' ? (
                            <img 
                              src={channel.avatar} 
                              alt={channel.name} 
                              width="70" 
                              height="70" 
                              className="rounded-circle object-fit-cover"
                              style={{ border: '2px solid white' }}
                            />
                          ) : (
                            <div 
                              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '70px', height: '70px', background: '#e7f1ff' }}
                            >
                              <Building size={32} className="text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Badge verificado */}
                      {channel.isVerified && (
                        <Badge 
                          bg="info" 
                          className="position-absolute top-0 end-0 m-2 rounded-pill d-flex align-items-center gap-1"
                        >
                          <CheckCircle size={12} /> Vérifié
                        </Badge>
                      )}
                      
                      {/* ✅ DROPDOWN DE TRES PUNTOS */}
                      <Dropdown className="position-absolute top-0 end-0 mt-2 me-2">
                        <Dropdown.Toggle 
                          variant="light" 
                          size="sm" 
                          className="rounded-circle bg-white bg-opacity-75 border-0"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <ThreeDotsVertical size={16} />
                        </Dropdown.Toggle>
                        
                        <Dropdown.Menu align="end">
                          <Dropdown.Item onClick={() => handleViewChannel(channel._id)}>
                            <Eye size={14} className="me-2" /> Voir la chaîne
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditChannel(channel._id)}>
                            <Pencil size={14} className="me-2" /> Modifier
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            onClick={() => handleDeleteClick(channel)}
                            className="text-danger"
                          >
                            <Trash3 size={14} className="me-2" /> Supprimer
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    {/* Body de la tarjeta */}
                    <Card.Body className="pt-5 text-center">
                      <Card.Title className="fw-bold mb-2">{channel.name}</Card.Title>
                      
                      {/* Categoría/Actividad */}
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        <Badge bg="light" text="dark" className="rounded-pill px-3 py-1">
                          <Briefcase size={12} className="me-1" /> 
                          {channel.activity?.name || channel.activity || 'Activité'}
                        </Badge>
                      </div>

                      {/* Ubicación */}
                      {channel.wilaya && (
                        <div className="text-muted small mb-2">
                          <GeoAlt size={12} className="me-1" /> 
                          {channel.wilaya}{channel.commune ? `, ${channel.commune}` : ''}
                        </div>
                      )}

                      {/* Teléfono */}
                      {channel.phone && (
                        <div className="text-muted small mb-2">
                          <Telephone size={12} className="me-1" /> 
                          {channel.phone}
                        </div>
                      )}

                      {/* Email */}
                      {channel.email && (
                        <div className="text-muted small mb-3 text-truncate">
                          <Envelope size={12} className="me-1" /> 
                          {channel.email}
                        </div>
                      )}

                      {/* Descripción */}
                      {channel.description && (
                        <div className="text-muted small mt-2 text-start border-top pt-2">
                          {channel.description.length > 80 
                            ? channel.description.substring(0, 80) + '…' 
                            : channel.description}
                        </div>
                      )}

                      {/* Estadísticas básicas */}
                      <div className="d-flex justify-content-around mt-3 pt-2 border-top">
                        <div className="text-center">
                          <div className="small text-muted">Vidéos</div>
                          <div className="fw-bold">{channel.totalVideos || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="small text-muted">Vues</div>
                          <div className="fw-bold">{channel.totalViews || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="small text-muted">Abonnés</div>
                          <div className="fw-bold">{channel.followersCount || 0}</div>
                        </div>
                      </div>
                    </Card.Body>

                    {/* Footer con botones */}
                    <Card.Footer className="bg-white border-top-0 pb-3">
                      <div className="d-flex justify-content-center gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewChannel(channel._id)}
                          className="rounded-pill px-3"
                        >
                          <Eye size={14} className="me-1" /> Voir
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleEditChannel(channel._id)}
                          className="rounded-pill px-3"
                        >
                          <Pencil size={14} className="me-1" /> Modifier
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Slots restantes */}
            {canCreateNewChannel() && getRemainingChannels() !== 'Illimité' && getRemainingChannels() > 0 && (
              <div className="text-center mt-4">
                <div className="d-inline-flex align-items-center gap-2 text-muted small bg-white px-3 py-2 rounded-pill shadow-sm">
                  <Clock size={14} />
                  ℹ️ Il vous reste {getRemainingChannels()} emplacement
                  {getRemainingChannels() > 1 ? 's' : ''} disponible
                  {getRemainingChannels() > 1 ? 's' : ''} pour créer de nouvelles chaînes.
                </div>
              </div>
            )}

            {/* Botón para crear más canales (si hay espacio) */}
            {canCreateNewChannel() && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline-primary" 
                  onClick={handleCreateChannel}
                  className="rounded-pill px-4"
                >
                  <Plus size={16} className="me-2" /> Créer une autre chaîne
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      {/* ✅ MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      {showDeleteConfirm && channelToDelete && (
        <div className="modal-overlay-custom" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3><Trash3 size={20} className="me-2 text-danger" /> Supprimer le canal</h3>
              <button className="btn-close-custom" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body-custom">
              <p>Êtes-vous sûr de vouloir supprimer définitivement le canal <strong>{channelToDelete.name}</strong> ?</p>
              <div className="warning-box-custom">
                <span>⚠️</span>
                <span>Cette action supprimera également toutes les vidéos associées et ne peut pas être annulée.</span>
              </div>
              <div className="channel-info-custom">
                <small>ID: {channelToDelete._id}</small><br />
                <small>Vidéos: {channelToDelete.totalVideos || 0}</small><br />
                <small>Abonnés: {channelToDelete.followersCount || 0}</small>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button 
                className="btn-cancel-custom" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingChannelId === channelToDelete._id}
              >
                Annuler
              </button>
              <button 
                className="btn-delete-custom" 
                onClick={confirmDeleteChannel}
                disabled={deletingChannelId === channelToDelete._id}
              >
                {deletingChannelId === channelToDelete._id ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash3 size={14} className="me-2" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS */}
      <style jsx="true">{`
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        
        .hover-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
        }
        
        .object-fit-cover {
          object-fit: cover;
        }
        
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 30px;
          border: 1px solid;
          font-size: 13px;
          font-weight: 500;
          background: white;
        }
        
        .plan-days {
          font-size: 11px;
        }
        
        .plan-expired {
          font-size: 11px;
          color: #dc3545;
        }
        
        .plan-limit-card {
          background: white;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .plan-limit-card.limit-reached {
          background: #fff3cd;
          border-color: #ffc107;
        }
        
        .progress {
          background-color: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .progress-bar {
          transition: width 0.3s ease;
        }
        
        /* Estilos del modal */
        .modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .modal-content-custom {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          overflow: hidden;
          animation: modalFadeIn 0.2s ease;
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .modal-header-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        
        .modal-header-custom h3 {
          margin: 0;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
        }
        
        .btn-close-custom {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          transition: color 0.2s;
        }
        
        .btn-close-custom:hover {
          color: #343a40;
        }
        
        .modal-body-custom {
          padding: 24px;
        }
        
        .warning-box-custom {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #856404;
          font-size: 14px;
        }
        
        .channel-info-custom {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          color: #6c757d;
        }
        
        .modal-footer-custom {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }
        
        .btn-cancel-custom {
          padding: 8px 20px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          background: white;
          color: #6c757d;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-cancel-custom:hover {
          background: #f8f9fa;
        }
        
        .btn-delete-custom {
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          background: #dc3545;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        
        .btn-delete-custom:hover:not(:disabled) {
          background: #c82333;
        }
        
        .btn-delete-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .plan-badge {
            font-size: 11px;
            padding: 4px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default MisChannel;
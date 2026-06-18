// components/NotifyPage.jsx (versión definitiva)
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Alert, Spinner, Image, Row, Col } from 'react-bootstrap';
import { 
  FaBell, FaCheckDouble, FaTrash, FaUserPlus, 
  FaHeart, FaComment, FaStore, FaBox, FaVideo, FaEdit, FaCheckCircle 
} from 'react-icons/fa';
import { getNotifies, isReadNotify, deleteAllNotifies, NOTIFY_TYPES } from '../../redux/actions/notifyAction';
import moment from 'moment';

const NotifyPage = () => {
  const dispatch = useDispatch();
  const { auth, notify, socket } = useSelector(state => state);
  const { data: notifies = [], loading = false } = notify;
  const [message, setMessage] = useState({ show: false, text: '', type: '' });

  const loadNotifies = useCallback(() => {
    if (auth?.token) dispatch(getNotifies(auth.token));
  }, [dispatch, auth?.token]);

  useEffect(() => {
    loadNotifies();
  }, [loadNotifies]);

  useEffect(() => {
    if (!socket || !auth?.user?._id) return;
    const userId = auth.user._id;
    const handleNewNotify = (newNotify) => {
      if (newNotify?.recipients?.includes(userId)) {
        dispatch({ type: NOTIFY_TYPES.CREATE_NOTIFY, payload: newNotify });
        setMessage({ show: true, text: 'Nueva notificación', type: 'info' });
        setTimeout(() => setMessage({ show: false, text: '', type: '' }), 3000);
      }
    };
    socket.on('createNotify', handleNewNotify);
    return () => socket.off('createNotify', handleNewNotify);
  }, [socket, dispatch, auth]);

  const showMessage = (text, type) => {
    setMessage({ show: true, text, type });
    setTimeout(() => setMessage({ show: false, text: '', type: '' }), 3000);
  };

  const handleMarkAsRead = async (notify) => {
    if (!notify.isRead && auth?.token) await dispatch(isReadNotify({ msg: notify, auth }));
  };

  const handleMarkAllAsRead = async () => {
    if (!auth?.token) return;
    for (const n of notifies.filter(n => !n.isRead)) {
      await dispatch(isReadNotify({ msg: n, auth }));
    }
    showMessage('Todas las notificaciones marcadas como leídas', 'success');
  };

  const handleDeleteAll = async () => {
    if (!auth?.token) return;
    if (!window.confirm('¿Eliminar todas las notificaciones?')) return;
    await dispatch(deleteAllNotifies(auth.token));
    showMessage('Todas las notificaciones eliminadas', 'warning');
  };

  const getNotifyIcon = (type) => {
    switch (type) {
      case 'follow': return <FaUserPlus className="text-primary" size={18} />;
      case 'like': return <FaHeart className="text-danger" size={18} />;
      case 'comment': return <FaComment className="text-success" size={18} />;
      case 'video': return <FaVideo className="text-primary" size={18} />;
      case 'video_edit': return <FaEdit className="text-warning" size={18} />;
      case 'video_approve': return <FaCheckCircle className="text-success" size={18} />;
      default: return <FaBell className="text-secondary" size={18} />;
    }
  };

  const formatDate = (dateString) => moment(dateString).fromNow();

  // Determinar si la notificación tiene miniatura de video
  const hasVideoThumbnail = (notify) => {
    return notify.image && 
           typeof notify.image === 'string' && 
           (notify.image.startsWith('http') || notify.image.startsWith('/')) &&
           !notify.image.includes('avatar');
  };

  // Texto personalizado según tipo
  const getActionText = (notify) => {
    const videoTitle = notify.content || '';
    const truncatedTitle = videoTitle.length > 40 ? videoTitle.substring(0, 40) + '...' : videoTitle;
    
    switch (notify.type) {
      case 'like':
        return `❤️ le gusta tu video ${truncatedTitle ? `"${truncatedTitle}"` : ''}`;
      case 'comment':
        return `💬 comentó en tu video ${truncatedTitle ? `"${truncatedTitle}"` : ''}`;
      case 'follow':
        return `➕ empezó a seguirte`;
      case 'video':
        return `📹 subió un nuevo video: "${truncatedTitle}"`;
      case 'video_edit':
        return `✏️ editó el video "${truncatedTitle}"`;
      case 'video_approve':
        return `✅ tu video "${truncatedTitle}" ha sido aprobado`;
      default:
        return notify.text || 'interactuó contigo';
    }
  };

  // Construir URL de destino
  const getTargetUrl = (notify) => {
    if (notify.url) return notify.url;
    // Si es notificación de video, intentar extraer ID del contenido de la URL o usar /video/id
    if (notify.type === 'video' || notify.type === 'video_edit' || notify.type === 'video_approve') {
      if (notify.url && notify.url.includes('/video/')) return notify.url;
      if (notify.videoId) return `/video/${notify.videoId}`;
    }
    return '#';
  };

  if (!auth?.user?._id) {
    return (
      <Card className="border-0 shadow-sm text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando usuario...</p>
      </Card>
    );
  }

  if (loading && notifies.length === 0) {
    return (
      <Card className="border-0 shadow-sm text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando notificaciones...</p>
      </Card>
    );
  }

  const unreadCount = notifies.filter(n => n && !n.isRead).length;

  return (
    <>
      {message.show && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ show: false })}>
          {message.text}
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-0 fw-bold">
                <FaBell className="me-2" style={{ color: '#EC4899' }} />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge bg="danger" className="ms-2 rounded-pill">{unreadCount} nuevas</Badge>
                )}
              </h5>
              <small className="text-muted">{notifies.length} en total</small>
            </div>
            <div className="d-flex gap-2">
              {notifies.length > 0 && unreadCount > 0 && (
                <Button size="sm" variant="outline-primary" onClick={handleMarkAllAsRead}>
                  <FaCheckDouble className="me-1" /> Marcar todas leídas
                </Button>
              )}
              {notifies.length > 0 && (
                <Button size="sm" variant="outline-danger" onClick={handleDeleteAll}>
                  <FaTrash className="me-1" /> Eliminar todas
                </Button>
              )}
            </div>
          </div>
        </Card.Header>

        {notifies.length === 0 ? (
          <Card.Body className="text-center py-5">
            <FaBell className="fs-1 text-muted mb-3 opacity-50" />
            <h5 className="text-muted">No hay notificaciones</h5>
            <p className="small text-muted">Aparecerán aquí las actividades relevantes</p>
          </Card.Body>
        ) : (
          <div className="list-group list-group-flush">
            {notifies.map(notify => {
              if (!notify?._id) return null;
              const avatarUrl = notify.user?.avatar || null;
              const thumbnailUrl = hasVideoThumbnail(notify) ? notify.image : null;
              const targetUrl = getTargetUrl(notify);
              const actionText = getActionText(notify);

              return (
                <Link
                  key={notify._id}
                  to={targetUrl}
                  className={`list-group-item list-group-item-action border-0 ${!notify.isRead ? 'bg-light' : ''}`}
                  style={{ padding: '16px 20px', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                  onClick={() => handleMarkAsRead(notify)}
                >
                  <Row className="align-items-center g-3">
                    {/* Avatar del actor */}
                    <Col xs="auto">
                      {avatarUrl ? (
                        <Image src={avatarUrl} width="48" height="48" className="rounded-circle" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                          {getNotifyIcon(notify.type)}
                        </div>
                      )}
                    </Col>

                    {/* Texto y fecha */}
                    <Col xs className="px-0">
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-1">
                        <div>
                          <strong>{notify.user?.username || 'Usuario'}</strong>{' '}
                          <span className="text-muted">{actionText}</span>
                        </div>
                        <small className="text-muted flex-shrink-0 ms-2">{formatDate(notify.createdAt)}</small>
                      </div>
                      {!notify.isRead && <Badge bg="primary" pill className="mt-1">Nuevo</Badge>}
                    </Col>

                    {/* Miniatura del video (si existe) */}
                    {thumbnailUrl && (
                      <Col xs="auto">
                        <Image 
                          src={thumbnailUrl} 
                          width="70" 
                          height="70" 
                          className="rounded border"
                          style={{ objectFit: 'cover' }}
                        />
                      </Col>
                    )}
                  </Row>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
};

export default NotifyPage;
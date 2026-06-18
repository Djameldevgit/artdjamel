import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Dropdown, Badge, Button, Image, Collapse } from 'react-bootstrap'
import Avatar from '../Avatar'
import moment from 'moment'
import NoNotice from '../../images/notice.png'
import { isReadNotify, NOTIFY_TYPES, deleteAllNotifies, getNotifies } from '../../redux/actions/notifyAction'
import { useTranslation } from 'react-i18next'

const NotificationsPage = () => {
  const { auth, notify, languageReducer } = useSelector(state => state)
  const dispatch = useDispatch()
  const { t, i18n } = useTranslation('notify')
  const lang = languageReducer.language || 'es'
  const [filter, setFilter] = useState('all') // all, unread, read
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showControls, setShowControls] = useState(false)

  // Detectar dirección del texto
  const isRTL = lang === 'ar'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (auth.token) {
      dispatch(getNotifies(auth.token))
    }
  }, [dispatch, auth.token])

  useEffect(() => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  const handleIsRead = (msg) => {
    dispatch(isReadNotify({ msg, auth }))
  }

  const handleMarkAsRead = (msg) => {
    if (!msg.isRead) {
      dispatch(isReadNotify({ msg, auth }))
    }
  }

  const handleMarkAsUnread = (msg) => {
    if (msg.isRead) {
      dispatch(isReadNotify({ msg, auth }))
    }
  }

  const handleSound = () => {
    dispatch({ type: NOTIFY_TYPES.UPDATE_SOUND, payload: !notify.sound })
  }

  const handleDeleteAll = () => {
    const newArr = notify.data.filter(item => item.isRead === false)
    if (newArr.length === 0) return dispatch(deleteAllNotifies(auth.token))

    if (window.confirm(t('confirmDelete', { count: newArr.length }))) {
      return dispatch(deleteAllNotifies(auth.token))
    }
  }

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notify.data.filter(msg => !msg.isRead)
    unreadNotifications.forEach(msg => {
      dispatch(isReadNotify({ msg, auth }))
    })
  }

  // Filtrar notificaciones
  const filteredNotifications = notify.data.filter(msg => {
    if (filter === 'unread') return !msg.isRead
    if (filter === 'read') return msg.isRead
    return true
  })

  const unreadCount = notify.data.filter(msg => !msg.isRead).length
  const readCount = notify.data.length - unreadCount

  return (
    <Container className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Mobile/Desktop */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className={`mb-1 ${isMobile ? 'h4' : ''}`}>
                {t('title')}
                {unreadCount > 0 && (
                  <Badge bg="danger" className={isRTL ? "me-2" : "ms-2"}>{unreadCount}</Badge>
                )}
              </h2>
              <p className={`text-muted mb-0 ${isMobile ? 'small' : ''}`}>
                {notify.data.length} {notify.data.length === 1 ? t('notification') : t('notifications')}
              </p>
            </div>
            
            {/* Botón toggle para móvil */}
            {isMobile && notify.data.length > 0 && (
              <Button 
                variant="outline-primary"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                style={{
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className={`fas fa-sliders-h`} />
                {showControls ? t('hide') : t('options')}
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Controles (Colapsables en móvil, siempre visibles en desktop) */}
      {notify.data.length > 0 && (
        <>
          {isMobile ? (
            <Collapse in={showControls}>
              <div className="mb-3">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    {/* Botones de acción */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Button 
                        variant={notify.sound ? "danger" : "outline-danger"}
                        size="sm"
                        onClick={handleSound}
                        style={{ flex: '1 1 auto', minWidth: '80px' }}
                      >
                        <i className={`fas fa-bell${notify.sound ? '' : '-slash'} me-1`} />
                        {notify.sound ? t('sound') : t('muted')}
                      </Button>

                      {unreadCount > 0 && (
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          style={{ flex: '1 1 auto', minWidth: '80px' }}
                        >
                          <i className="fas fa-check-double me-1" />
                          {t('readAll')}
                        </Button>
                      )}

                      <Button 
                        variant="outline-danger"
                        size="sm"
                        onClick={handleDeleteAll}
                        style={{ flex: '1 1 auto', minWidth: '80px' }}
                      >
                        <i className="fas fa-trash me-1" />
                        {t('deleteAll')}
                      </Button>
                    </div>

                    {/* Filtros */}
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('all')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {t('all')} ({notify.data.length})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('unread')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {t('unread')} ({unreadCount})
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFilter('read')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {t('read')} ({readCount})
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Collapse>
          ) : (
            // Desktop: siempre visible
            <>
              <Row className="mb-3">
                <Col>
                  <div className="d-flex gap-2">
                    <Button 
                      variant={notify.sound ? "danger" : "outline-danger"}
                      onClick={handleSound}
                      title={notify.sound ? t('disableSound') : t('enableSound')}
                    >
                      <i className={`fas fa-bell${notify.sound ? '' : '-slash'}`} />
                    </Button>

                    {unreadCount > 0 && (
                      <Button 
                        variant="outline-primary"
                        onClick={handleMarkAllAsRead}
                      >
                        {t('markAllAsRead')}
                      </Button>
                    )}

                    <Button 
                      variant="outline-danger"
                      onClick={handleDeleteAll}
                    >
                      {t('deleteAll')}
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      {t('all')} ({notify.data.length})
                    </button>
                    <button
                      type="button"
                      className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('unread')}
                    >
                      {t('unread')} ({unreadCount})
                    </button>
                    <button
                      type="button"
                      className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('read')}
                    >
                      {t('read')} ({readCount})
                    </button>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}

      {/* Lista de notificaciones */}
      <Row>
        <Col>
          {notify.data.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <Image src={NoNotice} alt="NoNotice" style={{ maxWidth: isMobile ? '150px' : '200px' }} />
                <p className="text-muted mt-3">{t('noNotifications')}</p>
              </Card.Body>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <p className="text-muted">{t('noNotificationsInCategory')}</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredNotifications.map((msg, index) => (
                <Card 
                  key={index} 
                  className={`${!msg.isRead ? 'border-primary' : 'border-0'} shadow-sm`}
                  style={{ 
                    backgroundColor: !msg.isRead ? '#f8f9ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <Card.Body className={isMobile ? 'p-2' : 'p-3'}>
                    <div className="d-flex align-items-center justify-content-between">
                      {/* Contenido principal */}
                      <Link
                        to={msg.url}
                        className="d-flex align-items-center text-decoration-none text-dark flex-grow-1"
                        onClick={() => handleIsRead(msg)}
                        style={{ 
                          minWidth: 0,
                          flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}
                      >
                        <Avatar 
                          src={msg.user.avatar} 
                          size={isMobile ? "medium-avatar" : "big-avatar"} 
                        />

                        <div className={isRTL ? "me-2" : "mx-2"} style={{ minWidth: 0, textAlign: isRTL ? 'right' : 'left', flex: 1 }}>
                          <div className={`mb-1 ${isMobile ? 'small' : ''}`}>
                            <strong className={isRTL ? "ms-1" : "me-1"}>{msg.user.username}</strong>
                            <span>
                              {msg.text
                                ? t(msg.text, { ns: msg.textNs || 'notify' })
                                : ''}
                            </span>
                          </div>
                          
                          {msg.content && (
                            <small className="text-muted d-block text-truncate">
                              {msg.content.slice(0, isMobile ? 30 : 50)}...
                            </small>
                          )}

                          <div className={`d-flex align-items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <small className="text-muted" style={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                              {moment(msg.createdAt).fromNow()}
                            </small>
                            {!msg.isRead && (
                              <Badge bg="primary" pill style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                                {t('new')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Imagen/Video preview */}
                        {msg.image && (
                          <div 
                            style={{ 
                              width: isMobile ? '40px' : '50px', 
                              height: isMobile ? '40px' : '50px',
                              flexShrink: 0
                            }} 
                            className={isRTL ? "me-2" : "ms-2"}
                          >
                            {msg.image.match(/video/i) ? (
                              <video 
                                src={msg.image} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                              />
                            ) : (
                              <Image 
                                src={msg.image} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                rounded
                              />
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Menú de tres puntos */}
                      <Dropdown align={isRTL ? "start" : "end"} className={isRTL ? "me-1" : "ms-1"}>
                        <Dropdown.Toggle 
                          variant="link" 
                          bsPrefix="p-0"
                          className="text-muted"
                          style={{ 
                            border: 'none',
                            boxShadow: 'none',
                            textDecoration: 'none',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                          }}
                        >
                          <i className="fas fa-ellipsis-v" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu style={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>
                          {!msg.isRead ? (
                            <Dropdown.Item onClick={() => handleMarkAsRead(msg)}>
                              <i className={`fas fa-check ${isRTL ? 'ms-2' : 'me-2'}`} />
                              {t('markAsRead')}
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item onClick={() => handleMarkAsUnread(msg)}>
                              <i className={`fas fa-envelope ${isRTL ? 'ms-2' : 'me-2'}`} />
                              {t('markAsUnread')}
                            </Dropdown.Item>
                          )}
                          
                          <Dropdown.Item as={Link} to={msg.url}>
                            <i className={`fas fa-external-link-alt ${isRTL ? 'ms-2' : 'me-2'}`} />
                            {t('viewDetails')}
                          </Dropdown.Item>
                          
                          <Dropdown.Divider />
                          
                          <Dropdown.Item className="text-danger">
                            <i className={`fas fa-trash ${isRTL ? 'ms-2' : 'me-2'}`} />
                            {t('delete')}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default NotificationsPage
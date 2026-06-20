import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart, faComment, faBookmark, faShare, faInfoCircle,
  faVolumeHigh, faVolumeXmark, faEye, faClock,
  faMusic, faXmark, faArrowLeft, faEllipsisVertical,
  faPen, faTrash, faFlag, faBan, faCheckCircle,
  faUserSlash, faExclamationTriangle,
  faChevronUp, faChevronDown, faSpinner,
  faCartShopping, faMessage, faPaintBrush
} from '@fortawesome/free-solid-svg-icons';
import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faShareSquare as faShareRegular
} from '@fortawesome/free-regular-svg-icons';
import Hls from 'hls.js';

import { likeVideo, shareVideo, deleteVideo, toggleSaveVideo } from '../../redux/actions/videoAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { addToCart } from '../../redux/actions/cartAction';
import VideoComments from './VideoComments';
import moment from 'moment';
import 'moment/locale/fr';
import './Feed.css';

const formatNumber = n => {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const getVideoWithExternalAudio = (videoUrl, audioUrl) => {
  if (!audioUrl || !videoUrl) return videoUrl;
  const uploadIndex = videoUrl.indexOf('/upload/');
  if (uploadIndex === -1) return videoUrl;
  const base = videoUrl.substring(0, uploadIndex + 8);
  const rest = videoUrl.substring(uploadIndex + 8);
  let audioPath = audioUrl;
  const audioUploadIndex = audioUrl.indexOf('/upload/');
  if (audioUploadIndex !== -1) {
    audioPath = audioUrl.substring(audioUploadIndex + 8);
  }
  const encodedAudio = encodeURIComponent(audioPath);
  const transformation = `l_audio:${encodedAudio},fl_layer_apply,co_replace_audio`;
  return `${base}${transformation}/${rest}`;
};

// ============================================================
// COMPONENTE: recibe `video` como prop (igual que el original)
// ============================================================
const Feed = ({
  video: propVideo,
  isActive = false,
  onVisibilityChange,
  onVideoDeleted,
  onNextVideo,
  onPreviousVideo,
  hasNext = false,
  hasPrev = false
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // -------------------- Selectores de Redux --------------------
  const { auth, socket } = useSelector(state => state);

  // 1️⃣ Obtener el video actualizado desde el store
  const storeVideo = useSelector(state => {
    if (!propVideo?._id) return null;
    let found = state.video.videos?.find(v => v._id === propVideo._id);
    if (found) return found;
    if (state.video.videosByCategory) {
      for (const catKey in state.video.videosByCategory) {
        const catVideos = state.video.videosByCategory[catKey];
        if (Array.isArray(catVideos)) {
          found = catVideos.find(v => v._id === propVideo._id);
          if (found) return found;
        }
      }
    }
    return null;
  });

  const video = storeVideo || propVideo;

  if (!video) {
    return null;
  }

  // 2️⃣ Estado del carrito
  const cart = useSelector(state => state.cart) || { items: [] };

  const isInCart = useMemo(() => {
    if (!video?._id) return false;
    return cart.items.some(item => item.videoId === video._id);
  }, [cart.items, video]);

  const cartQty = useMemo(() => {
    if (!video?._id) return 0;
    const item = cart.items.find(item => item.videoId === video._id);
    return item?.quantity || 0;
  }, [cart.items, video]);

  // -------------------- Estados locales --------------------
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(video.comments?.length || 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
  const [showMenu, setShowMenu] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const videoRef = useRef(null);
  const drawerRef = useRef(null);
  let hlsRef = useRef(null);

  // -------------------- Valores derivados --------------------
  const liked = video.likes?.some(id => id.toString() === auth.user?._id?.toString()) || false;
  const likesCount = video.likes?.length || 0;
  const savedState = video.saves?.some(id => id.toString() === auth.user?._id?.toString()) || false;
  const savesCount = video.saves?.length || video.savesCount || 0;
  const sharedState = video.shares?.some(id => id.toString() === auth.user?._id?.toString()) || false;
  const sharesCount = video.shares?.length || 0;

  const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'moderator';
  const isOwner = auth.user?._id === video.user?._id;
  const ownerName = video.user?.username || 'Artiste';
  const ownerId = video.user?._id;

  const stock = video?.stock || 0;
  const isOutOfStock = stock <= 0;
  const isMaxReached = stock > 0 && cartQty >= stock;
  const isAddDisabled = isOutOfStock || isMaxReached || addingToCart;

  const getCartButtonTitle = () => {
    if (isOutOfStock) return 'Œuvre épuisée';
    if (isMaxReached) return 'Stock maximum atteint';
    if (isInCart) return 'Déjà dans le panier';
    return 'Ajouter au panier';
  };

  // -------------------- Efectos (comportamiento original) --------------------
  useEffect(() => {
    setCommentsCount(video.comments?.length || 0);
  }, [video.comments]);

  useEffect(() => {
    if (!socket || !video) return;
    socket.emit('join-video-room', video._id);
    const onNewComment = (data) => {
      if (data.videoId === video._id) setCommentsCount(prev => prev + 1);
    };
    const onCommentDeleted = (data) => {
      if (data.videoId === video._id) setCommentsCount(prev => Math.max(0, prev - 1));
    };
    socket.on('new-comment', onNewComment);
    socket.on('comment-deleted', onCommentDeleted);
    return () => {
      socket.emit('leave-video-room', video._id);
      socket.off('new-comment', onNewComment);
      socket.off('comment-deleted', onCommentDeleted);
    };
  }, [socket, video]);

  const finalVideoSrc = useCallback(() => {
    if (video.videoUrl && (video.videoUrl.includes('l_audio') || video.videoUrl.includes('.m3u8'))) {
      return video.videoUrl;
    }
    if (video.music?.audioUrl) {
      return getVideoWithExternalAudio(video.videoUrl, video.music.audioUrl);
    }
    return video.videoUrl;
  }, [video.videoUrl, video.music])();

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (finalVideoSrc?.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, maxBufferLength: 30 });
        hls.loadSource(finalVideoSrc);
        hls.attachMedia(videoEl);
        hlsRef.current = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = finalVideoSrc;
      }
    } else {
      videoEl.src = finalVideoSrc;
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [finalVideoSrc]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (isActive && !showComments) {
      videoEl.play().catch(e => console.log("Play error:", e));
      setIsPlaying(true);
      onVisibilityChange?.(true);
    } else if (!isActive && !showComments) {
      videoEl.pause();
      setIsPlaying(false);
      onVisibilityChange?.(false);
    }
  }, [isActive, showComments, onVisibilityChange]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onTimeUpdate = () => {
      if (videoEl.duration) setProgress((videoEl.currentTime / videoEl.duration) * 100);
    };
    videoEl.addEventListener('timeupdate', onTimeUpdate);
    return () => videoEl.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && hasPrev && onPreviousVideo) {
        e.preventDefault();
        onPreviousVideo();
      } else if (e.key === 'ArrowDown' && hasNext && onNextVideo) {
        e.preventDefault();
        onNextVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, onPreviousVideo, onNextVideo]);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -------------------- Handlers --------------------
  const goToProfile = useCallback((e) => {
    e?.stopPropagation();
    if (!ownerId) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: 'Utilisateur non trouvé' } });
      return;
    }
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    history.push(`/profile/${ownerId}`);
  }, [ownerId, dispatch, history]);

  const handleLike = async () => {
    if (!auth.token) return history.push('/login');
    setActionLoading(true);
    try {
      const res = await dispatch(likeVideo(video._id, auth.token, auth, socket, video));
      if (res?.liked) createHeartEffect();
    } catch (error) {
      console.error('Error en handleLike:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!auth.token) return history.push('/login');
    if (saving) return;
    setSaving(true);
    try {
      const result = await dispatch(toggleSaveVideo(video._id, auth.token, auth, socket, video));
      if (result?.isSaved !== undefined) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: result.isSaved ? '✓ Ajouté aux favoris' : '✓ Retiré des favoris' }
        });
      }
    } catch (error) {
      console.error('Error en handleSave:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!auth.token) {
      history.push('/login');
      return;
    }
    const url = `${window.location.origin}/video/${video._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: video.title, text: video.description, url }); } catch { }
    } else {
      navigator.clipboard.writeText(url);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Lien copié !' } });
    }
    try {
      await dispatch(shareVideo(video._id, auth.token, auth, socket, video));
    } catch (error) {
      console.error('Error en handleShare:', error);
    }
  };

  const handleAddToCart = async () => {
    if (isAddDisabled) return;
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour ajouter au panier" } });
      history.push('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await dispatch(addToCart(video._id, 1));
    } catch (error) {
      console.error('Error addToCart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // NUEVOS HANDLERS para el menú
  const handleRequestCommission = () => {
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour demander une commande" } });
      history.push('/login');
      return;
    }
    // Aquí puedes redirigir a una página de solicitud de encargo o abrir un modal
    // Por ahora mostramos un mensaje
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: '📝 Votre demande de commande a été envoyée à l\'artiste !' }
    });
    // Redirigir a la página de comisión (si existe)
    // history.push(`/commission/${video.user._id}`);
  };

  const handleChatWithOwner = () => {
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour discuter avec l'artiste" } });
      history.push('/login');
      return;
    }
    if (!ownerId) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Artiste non trouvé" } });
      return;
    }
    // Redirigir al chat con el propietario
    history.push(`/message/${ownerId}`);
  };

  const createHeartEffect = () => {
    const h = document.createElement('div');
    h.className = 'vr-floating-heart';
    h.textContent = '❤️';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 800);
  };

  const handleDoubleClick = e => {
    e.stopPropagation();
    if (!liked) handleLike();
  };

  const toggleMute = e => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(m => !m);
    }
  };

  const togglePlay = e => {
    e.stopPropagation();
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(p => !p);
    }
  };

  const handleProgressClick = e => {
    e.stopPropagation();
    if (videoRef.current?.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * videoRef.current.duration;
    }
  };

  const handleOpenComments = () => { setShowComments(true); setDragOffset(0); };
  const handleCloseComments = () => {
    setShowComments(false);
    setDragOffset(0);
    if (drawerRef.current) drawerRef.current.style.transform = '';
  };
  const handleGoBack = () => history.goBack();
  const handleViewDetails = (e) => {
    e?.stopPropagation();
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    history.push(`/video/${video._id}`);
  };

  // Menú
  const menuAction = fn => () => { setShowMenu(false); fn(); };
  const handleEdit = menuAction(() => {
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    history.push(`/edit-video/${video._id}`);
  });
  const handleDeleteVideo = menuAction(async () => {
    if (!window.confirm('Supprimer cette vidéo ? Cette action est irréversible.')) return;
    setActionLoading(true);
    const res = await dispatch(deleteVideo(video._id, auth.token, auth, socket, video));
    setActionLoading(false);
    if (res?.success) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Vidéo supprimée' } });
      onVideoDeleted?.(video._id);
    }
  });

  // Drag comments
  const handleDragStart = e => {
    e.stopPropagation();
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
    setIsDragging(true);
    setDragOffset(0);
  };
  const handleDragMove = e => {
    if (!isDragging) return;
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = Math.min(Math.max(clientY - startY, 0), window.innerHeight * 0.6);
    setDragOffset(delta);
    if (drawerRef.current) drawerRef.current.style.transform = `translateY(${delta}px)`;
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragOffset > window.innerHeight * 0.25) {
      handleCloseComments();
    } else {
      if (drawerRef.current) drawerRef.current.style.transform = '';
      setDragOffset(0);
    }
  };

  const videoScale = !showComments ? 1 : 0.7 + 0.3 * Math.min(dragOffset / (window.innerHeight * 0.6), 1);
  const videoTranslateY = !showComments ? 0 : -15 * (1 - Math.min(dragOffset / (window.innerHeight * 0.6), 1));

  // ============================================================
  // RENDER - NUEVO LAYOUT
  // ============================================================
  return (
    <div className="video-reel-container">
      <div className="vr-header">
        <button className="vr-header-btn" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <div
        className="vr-video-wrapper"
        style={{
          transform: showComments
            ? `scale(${videoScale}) translateY(${videoTranslateY}%)`
            : 'scale(1) translateY(0)',
          transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        }}
        onDoubleClick={handleDoubleClick}
      >
        <video
          ref={videoRef}
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          poster={video.thumbnail}
          className="vr-video"
        />

        {!showComments && <div className="vr-gradient-overlay" />}

        {!showComments && (
          <div className="vr-progress-bar" onClick={handleProgressClick}>
            <div className="vr-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {!showComments && (
          <div className="vr-actions-sidebar">
            {/* -------------------- MENÚ DROPDOWN -------------------- */}
            <div className="vr-action-group">
              <Dropdown show={showMenu} onToggle={setShowMenu} align="end">
                <Dropdown.Toggle as="button" className="vr-action-btn vr-menu-toggle">
                  <FontAwesomeIcon icon={faEllipsisVertical} className="vr-action-icon" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="vr-dropdown-menu">
                  {/* Propietario o admin: editar / eliminar */}
                  {(isOwner || isAdmin) && (
                    <>
                      <Dropdown.Item onClick={handleEdit} className="vr-dropdown-item">
                        <FontAwesomeIcon icon={faPen} /> Modifier
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleDeleteVideo} className="vr-dropdown-item reject">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  
                  {/* Usuarios NO propietarios: acciones de interacción */}
                  {!isOwner && !isAdmin && (
                    <>
                      {/* Pedir un encargo */}
                      <Dropdown.Item onClick={handleRequestCommission} className="vr-dropdown-item">
                        <FontAwesomeIcon icon={faPaintBrush} /> Demander une commande
                      </Dropdown.Item>
                      {/* Chat con el dueño */}
                      <Dropdown.Item onClick={handleChatWithOwner} className="vr-dropdown-item">
                        <FontAwesomeIcon icon={faMessage} /> Chat avec le propriétaire
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}

                  {/* Guardar (Save) - para todos */}
                  <Dropdown.Item onClick={handleSave} className="vr-dropdown-item" disabled={saving}>
                    {saving ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={savedState ? faBookmark : faBookmarkRegular} />
                    )}
                    {' '}{savedState ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Dropdown.Item>

                  {/* Compartir (Share) */}
                  <Dropdown.Item onClick={handleShare} className="vr-dropdown-item">
                    <FontAwesomeIcon icon={faShare} /> Partager
                  </Dropdown.Item>

                  {/* Comentarios (Comments) - abre el drawer */}
                  <Dropdown.Item onClick={handleOpenComments} className="vr-dropdown-item">
                    <FontAwesomeIcon icon={faComment} /> Commentaires ({formatNumber(commentsCount)})
                  </Dropdown.Item>

                  {/* (Opcional) Ver detalles - ya está como botón aparte, pero lo dejamos por si acaso */}
                  <Dropdown.Item onClick={handleViewDetails} className="vr-dropdown-item">
                    <FontAwesomeIcon icon={faInfoCircle} /> Détails
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <span className="vr-action-count">Menu</span>
            </div>

            {/* -------------------- LIKE -------------------- */}
            <div className="vr-action-group">
              <button className={`vr-action-btn ${liked ? 'active-like' : ''}`} onClick={handleLike} disabled={actionLoading}>
                <FontAwesomeIcon icon={liked ? faHeart : faHeartRegular} className="vr-action-icon" style={{ color: liked ? '#ff3b5c' : 'white' }} />
              </button>
              <span className="vr-action-count">{formatNumber(likesCount)}</span>
            </div>

            {/* -------------------- CARRITO (ACHETER) -------------------- */}
            <div className="vr-action-group">
              <button
                className={`vr-action-btn ${isInCart ? 'in-cart' : ''} ${isAddDisabled ? 'disabled-btn' : ''}`}
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                title={getCartButtonTitle()}
              >
                {addingToCart ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="vr-action-icon" />
                ) : (
                  <FontAwesomeIcon
                    icon={faCartShopping}
                    className="vr-action-icon"
                    style={{ color: isInCart ? '#ff6b6b' : '#4caf50' }}
                  />
                )}
                {isInCart && cartQty > 0 && (
                  <span className="vr-cart-badge">{cartQty}</span>
                )}
              </button>
              <span className="vr-action-count">
                {isOutOfStock ? 'Épuisé' : isInCart ? 'Panier' : 'Acheter'}
              </span>
            </div>

            {/* -------------------- DETALLES (INFO) -------------------- */}
            <div className="vr-action-group">
              <button className="vr-action-btn" onClick={handleViewDetails} title="Détails du produit">
                <FontAwesomeIcon icon={faInfoCircle} className="vr-action-icon" />
              </button>
              <span className="vr-action-count">Détails</span>
            </div>

            {/* Navegación (flechas arriba/abajo) */}
            {isLargeScreen && (hasPrev || hasNext) && <div className="vr-nav-divider" />}
            {isLargeScreen && hasPrev && onPreviousVideo && (
              <div className="vr-nav-group">
                <button className="vr-nav-btn" onClick={onPreviousVideo} title="Précédent">
                  <FontAwesomeIcon icon={faChevronUp} />
                </button>
                <span className="vr-nav-label">Précédent</span>
              </div>
            )}
            {isLargeScreen && hasNext && onNextVideo && (
              <div className="vr-nav-group">
                <button className="vr-nav-btn" onClick={onNextVideo} title="Suivant">
                  <FontAwesomeIcon icon={faChevronDown} />
                </button>
                <span className="vr-nav-label">Suivant</span>
              </div>
            )}
          </div>
        )}

        {/* Botón de volumen */}
        {!showComments && (
          <button className="vr-volume-btn" onClick={toggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} />
          </button>
        )}

        {/* Información del video */}
        {!showComments && (
          <div className="vr-video-info">
            <div className="vr-user-row">
              <div className="vr-user-details">
                <div className="vr-username" onClick={goToProfile} style={{ cursor: ownerId ? 'pointer' : 'default' }}>
                  @{ownerName}
                </div>
                <div className="vr-stats">
                  <span><FontAwesomeIcon icon={faEye} />{formatNumber(video.views)}</span>
                  <span><FontAwesomeIcon icon={faClock} />{moment(video.createdAt).fromNow()}</span>
                </div>
              </div>
            </div>
            <p className="vr-title">{video.title}</p>
            {video.description && <p className="vr-description">{video.description}</p>}
            {video.tags?.length > 0 && (
              <div className="vr-tags">
                <FontAwesomeIcon icon={faMusic} />
                <span>{video.tags.slice(0, 2).join(' · ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer de comentarios */}
      {showComments && (
        <div className="vr-comments-drawer">
          <div className="vr-comments-backdrop" onClick={handleCloseComments} />
          <div
            ref={drawerRef}
            className="vr-comments-panel"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="vr-comments-drag-handle">
              <div className="vr-comments-drag-bar" />
            </div>
            <div className="vr-comments-header">
              <h5 className="vr-comments-title">{commentsCount} commentaire{commentsCount !== 1 ? 's' : ''}</h5>
              <button className="vr-comments-close" onClick={handleCloseComments}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="vr-comments-content">
              <VideoComments videoId={video._id} comments={video.comments || []} totalComments={commentsCount} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
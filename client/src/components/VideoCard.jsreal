// components/Video/VideoCard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import { 
  PlayFill, Heart, HeartFill, Eye, Clock, Share, 
  Bookmark, BookmarkFill, PauseFill, VolumeUp, 
  VolumeMute, Chat, MusicNote, ArrowLeft, 
  CheckCircle, Trash, ShieldLock, Person,
  Calendar, Tag, Film, GraphUp, ShareFill,
  People, ChatDots
} from 'react-bootstrap-icons';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { likeVideo, trackWatchTime } from '../redux/actions/videoAction';
import { aprobarVideo, eliminarVideo } from '../redux/actions/videoApproveAction';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import moment from 'moment';
import 'moment/locale/fr';

const DEFAULT_THUMBNAIL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23333333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23ffffff" font-size="16"%3E🎬 Vidéo%3C/text%3E%3C/svg%3E';

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23667eea"/%3E%3Ctext x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold"%3E👤%3C/text%3E%3C/svg%3E';

const VideoCard = ({ 
  video, 
  mode = 'grid',
  isActive = false,
  onVisibilityChange,
  onVideoEnd,
  autoPlay = true,
  muted = false,
  loop = false
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  
  // Estados del video
  const [liked, setLiked] = useState(video?.liked || false);
  const [likesCount, setLikesCount] = useState(video?.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados del reproductor
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Refs
  const videoRef = useRef(null);
  const watchTimeIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTrackedTimeRef = useRef(0);
  const lastVisibilityRef = useRef(false); // ✅ Para evitar llamadas repetidas
  const observerRef = useRef(null); // ✅ Para guardar referencia del observer

  moment.locale('fr');

  const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'moderator';
  const isPending = video?.pendiente === true;
  const isOwner = auth.user && video && auth.user._id === video.user?._id;
  const canEdit = isOwner || isAdmin;

  // ============================================
  // TRACKING DE TIEMPO DE VISUALIZACIÓN
  // ============================================
  const startWatchTimeTracking = useCallback(() => {
    if (watchTimeIntervalRef.current) return;
    
    let timeElapsed = 0;
    watchTimeIntervalRef.current = setInterval(() => {
      timeElapsed += 1;
      setWatchTime(timeElapsed);
    }, 1000);
  }, []);

  const stopWatchTimeTracking = useCallback(() => {
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
      watchTimeIntervalRef.current = null;
      
      if (watchTime >= 3 && auth?.token && !isPending) {
        if (watchTime !== lastTrackedTimeRef.current) {
          lastTrackedTimeRef.current = watchTime;
          dispatch(trackWatchTime(video._id, watchTime, auth.token));
        }
      }
      setWatchTime(0);
    }
  }, [watchTime, video._id, auth?.token, dispatch, isPending]);

  // ============================================
  // MODO REEL - Intersection Observer (CORREGIDO)
  // ============================================
  useEffect(() => {
    if (mode !== 'reel') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting;
          
          // ✅ Evitar llamadas repetidas del mismo estado
          if (isVisible === lastVisibilityRef.current) return;
          lastVisibilityRef.current = isVisible;
          
          if (isVisible && autoPlay && videoRef.current && !isPending) {
            videoRef.current.play().catch(e => console.log('Auto-play bloqueado:', e));
            setIsPlaying(true);
            onVisibilityChange?.(isVisible);
            startWatchTimeTracking();
          } else if (!isVisible && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
            onVisibilityChange?.(isVisible);
            stopWatchTimeTracking();
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      stopWatchTimeTracking();
    };
  }, [mode, autoPlay, onVisibilityChange, startWatchTimeTracking, stopWatchTimeTracking, isPending]);

  // Control manual cuando isActive cambia (CORREGIDO)
  useEffect(() => {
    if (mode !== 'reel') return;
    
    if (isActive && videoRef.current && !isPending) {
      videoRef.current.play().catch(e => console.log('Play manual:', e));
      setIsPlaying(true);
      startWatchTimeTracking();
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      stopWatchTimeTracking();
    }
  }, [isActive, mode, startWatchTimeTracking, stopWatchTimeTracking, isPending]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopWatchTimeTracking();
    };
  }, [stopWatchTimeTracking]);

  // ============================================
  // CONTROLES DE VIDEO
  // ============================================
  const togglePlay = () => {
    if (!videoRef.current || isPending) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      stopWatchTimeTracking();
    } else {
      videoRef.current.play();
      startWatchTimeTracking();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || isPending) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    stopWatchTimeTracking();
    if (loop && videoRef.current && !isPending) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else {
      onVideoEnd?.();
    }
  };

  const showControlsTemporarily = () => {
    if (isPending) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  // ============================================
  // ACCIONES SOCIALES
  // ============================================
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!auth?.token) {
      history.push('/login');
      return;
    }
    
    if (isPending) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Cette vidéo est en attente d\'approbation' }
      });
      return;
    }
    
    const result = await dispatch(likeVideo(video._id, auth.token, auth, null, video));
    if (result?.liked !== undefined) {
      setLiked(result.liked);
      setLikesCount(result.likes);
      
      if (result.liked) {
        createHeartEffect();
      }
    }
  };

  const createHeartEffect = () => {
    const heart = document.createElement('div');
    heart.className = 'heart-burst-effect';
    heart.innerHTML = '❤️';
    heart.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      z-index: 1000;
      pointer-events: none;
      animation: heartBurst 0.5s ease-out forwards;
    `;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 500);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!liked && !isPending && auth?.token) {
      handleLike(e);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (!auth?.token) {
      history.push('/login');
      return;
    }
    
    if (isPending) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Cette vidéo est en attente d\'approbation' }
      });
      return;
    }
    
    setSaved(!saved);
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: saved ? 'Retiré des favoris' : 'Ajouté aux favoris' }
    });
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/video/${video._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/video/${video._id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareModal(false);
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { success: 'Lien copié dans le presse-papier !' }
    });
  };

  const handleFollow = (e) => {
    e.stopPropagation();
    if (!auth?.token) {
      history.push('/login');
      return;
    }
    setIsFollowing(!isFollowing);
  };

  // ============================================
  // ACCIONES DE ADMIN
  // ============================================
  const handleApprove = async (e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm(`Approuver la vidéo "${video?.title}" ?`)) return;
    
    setActionLoading(true);
    const result = await dispatch(aprobarVideo(video._id, auth.token, auth, null, video));
    setActionLoading(false);
    
    if (result?.success) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { success: 'Vidéo approuvée avec succès' }
      });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: result?.error || 'Erreur lors de l\'approbation' }
      });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm(`Supprimer définitivement la vidéo "${video?.title}" ?`)) return;
    
    setActionLoading(true);
    const result = await dispatch(eliminarVideo(video._id, auth.token, auth, null, video));
    setActionLoading(false);
    
    if (result?.success) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { success: 'Vidéo supprimée' }
      });
      if (mode === 'reel') {
        onVideoEnd?.();
      }
    } else {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: result?.error || 'Erreur lors de la suppression' }
      });
    }
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const getThumbnail = () => {
    if (imgError) return DEFAULT_THUMBNAIL;
    if (video.videoType === 'youtube' && video.videoId) {
      return `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
    }
    if (video.thumbnail && video.thumbnail !== '' && video.thumbnail !== '/video-placeholder.jpg') {
      return video.thumbnail;
    }
    return DEFAULT_THUMBNAIL;
  };

  const handleImageError = (e) => {
    if (!imgError) {
      setImgError(true);
      e.target.src = DEFAULT_THUMBNAIL;
      e.target.onerror = null;
    }
  };

  const getAvatar = () => {
    if (avatarError) return DEFAULT_AVATAR;
    if (video.user?.avatar && video.user.avatar !== '' && video.user.avatar !== '/default-avatar.png') {
      return video.user.avatar;
    }
    return DEFAULT_AVATAR;
  };

  const handleAvatarError = (e) => {
    if (!avatarError) {
      setAvatarError(true);
      e.target.src = DEFAULT_AVATAR;
      e.target.onerror = null;
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const navigateToProfile = (e) => {
    e.stopPropagation();
    history.push(`/profile/${video.user?._id}`);
  };

  const navigateToDetail = () => {
    if (mode === 'reel') {
      history.push(`/video/${video._id}`);
    }
  };

  // ============================================
  // RENDER MODO REEL (TikTok Style)
  // ============================================
  if (mode === 'reel') {
    return (
      <>
        <div 
          className="video-reel-container"
          style={{
            height: '100vh',
            width: '100%',
            backgroundColor: '#000',
            position: 'relative',
            scrollSnapAlign: 'start',
            overflow: 'hidden'
          }}
          onDoubleClick={handleDoubleClick}
          onClick={showControlsTemporarily}
        >
          {/* Badge de estado pendiente */}
          {isPending && isAdmin && (
            <div className="position-absolute top-0 start-0 m-3 z-3" style={{ zIndex: 25 }}>
              <Badge bg="warning" className="px-3 py-2">
                <ShieldLock size={14} className="me-1" /> En attente d'approbation
              </Badge>
            </div>
          )}

          {/* Video element */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={getThumbnail()}
            loop={loop}
            muted={isMuted}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onLoadedData={() => setVideoLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />

          {/* Loading indicator */}
          {!videoLoaded && (
            <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 20 }}>
              <Spinner animation="border" variant="light" />
            </div>
          )}

          {/* Progress bar */}
          <div 
            className="position-absolute bottom-0 start-0 w-100"
            style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 15, cursor: 'pointer' }}
            onClick={handleSeek}
          >
            <div 
              style={{ 
                width: `${progress}%`, 
                height: '100%', 
                backgroundColor: '#ff4444',
                transition: 'width 0.1s linear'
              }}
            />
          </div>

          {/* Controls overlay */}
          {showControls && !isPending && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 20, background: 'rgba(0,0,0,0.4)' }}>
              <button 
                className="btn btn-light rounded-circle p-3 mx-2"
                onClick={togglePlay}
                style={{ width: '60px', height: '60px' }}
              >
                {isPlaying ? <PauseFill size={24} /> : <PlayFill size={24} />}
              </button>
              <button 
                className="btn btn-light rounded-circle p-3 mx-2"
                onClick={toggleMute}
                style={{ width: '60px', height: '60px' }}
              >
                {isMuted ? <VolumeMute size={24} /> : <VolumeUp size={24} />}
              </button>
            </div>
          )}

          {/* Volume control button */}
          {!isPending && (
            <button
              onClick={toggleMute}
              className="position-absolute bottom-3 end-3"
              style={{
                zIndex: 15,
                bottom: '100px',
                right: '15px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              {isMuted ? <VolumeMute size={18} /> : <VolumeUp size={18} />}
            </button>
          )}

          {/* Side actions */}
          <div className="position-absolute d-flex flex-column gap-3" style={{ zIndex: 15, bottom: '20%', right: '15px' }}>
            {/* Admin actions */}
            {isAdmin && isPending && (
              <>
                <div className="text-center">
                  <button
                    className="btn btn-dark rounded-circle p-2 mb-1"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.3)' }}
                    title="Approuver"
                  >
                    <CheckCircle size={22} color="#4caf50" />
                  </button>
                </div>
                <div className="text-center">
                  <button
                    className="btn btn-dark rounded-circle p-2 mb-1"
                    onClick={handleDelete}
                    disabled={actionLoading}
                    style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(244, 67, 54, 0.3)' }}
                    title="Supprimer"
                  >
                    <Trash size={22} color="#f44336" />
                  </button>
                </div>
              </>
            )}

            {/* Like button */}
            <div className="text-center">
              <button
                className="btn btn-dark rounded-circle p-2 mb-1"
                onClick={handleLike}
                style={{ width: '45px', height: '45px', borderRadius: '50%' }}
              >
                {liked ? <HeartFill size={22} color="#ff4444" /> : <Heart size={22} color="white" />}
              </button>
              <small className="text-white d-block">{formatNumber(likesCount)}</small>
            </div>

            {/* Comment button */}
            <div className="text-center">
              <button
                className="btn btn-dark rounded-circle p-2 mb-1"
                onClick={navigateToDetail}
                style={{ width: '45px', height: '45px', borderRadius: '50%' }}
              >
                <Chat size={22} color="white" />
              </button>
              <small className="text-white d-block">{formatNumber(video.comments?.length)}</small>
            </div>

            {/* Save button */}
            <div className="text-center">
              <button
                className="btn btn-dark rounded-circle p-2 mb-1"
                onClick={handleSave}
                style={{ width: '45px', height: '45px', borderRadius: '50%' }}
              >
                {saved ? <BookmarkFill size={22} color="#ffd700" /> : <Bookmark size={22} color="white" />}
              </button>
              <small className="text-white d-block">Favoris</small>
            </div>

            {/* Share button */}
            <div className="text-center">
              <button
                className="btn btn-dark rounded-circle p-2 mb-1"
                onClick={handleShare}
                style={{ width: '45px', height: '45px', borderRadius: '50%' }}
              >
                <Share size={22} color="white" />
              </button>
              <small className="text-white d-block">Partager</small>
            </div>
          </div>

          {/* Video info overlay */}
          <div className="position-absolute bottom-0 start-0 p-3" style={{ zIndex: 15, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', width: '100%' }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <img
                src={getAvatar()}
                alt={video.user?.username}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid white', cursor: 'pointer' }}
                onError={handleAvatarError}
                onClick={navigateToProfile}
              />
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2">
                  <strong 
                    className="text-white"
                    style={{ cursor: 'pointer' }}
                    onClick={navigateToProfile}
                  >
                    @{video.user?.username || 'Utilisateur'}
                  </strong>
                  {video.user?.isPro && <Badge bg="primary" size="sm">Pro</Badge>}
                  {isAdmin && video.user?.role === 'admin' && <Badge bg="danger" size="sm">Admin</Badge>}
                </div>
                <div className="d-flex align-items-center gap-3 small text-white-50">
                  <span><Eye size={12} /> {formatNumber(video.views)} vues</span>
                  <span><Clock size={12} /> {moment(video.createdAt).fromNow()}</span>
                </div>
              </div>
              {!isPending && auth?.token && auth.user?._id !== video.user?._id && (
                <button
                  className={`btn btn-sm ${isFollowing ? 'btn-outline-light' : 'btn-danger'} rounded-pill px-3`}
                  onClick={handleFollow}
                  style={{ fontSize: '12px' }}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
              )}
            </div>
            <h5 className="text-white mb-1" style={{ fontSize: '1rem' }}>{video.title}</h5>
            <p className="text-white-50 small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {video.description}
            </p>
            <div className="d-flex align-items-center gap-2 small text-white-50 mt-1">
              <MusicNote size={14} />
              <span>Son original - {video.user?.username || 'Utilisateur'}</span>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered onClick={(e) => e.stopPropagation()}>
          <Modal.Header closeButton>
            <Modal.Title>Partager la vidéo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column gap-3">
              <Button variant="outline-primary" onClick={copyToClipboard}>
                📋 Copier le lien
              </Button>
              <Button variant="success" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(video.title)} ${window.location.origin}/video/${video._id}`, '_blank')}>
                💬 WhatsApp
              </Button>
              <Button variant="info" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/video/' + video._id)}`, '_blank')}>
                📘 Facebook
              </Button>
              <Button variant="dark" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(window.location.origin + '/video/' + video._id)}`, '_blank')}>
                🐦 Twitter
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Admin Info Modal */}
        <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} centered size="lg" onClick={(e) => e.stopPropagation()}>
          <Modal.Header closeButton style={{ background: '#1a1a2e', color: 'white' }}>
            <Modal.Title><ShieldLock className="me-2" /> Informations Admin</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#16213e', color: 'white' }}>
            <div className="row">
              <div className="col-md-6">
                <p><Person className="me-2" /> <strong>ID:</strong> {video._id}</p>
                <p><Film className="me-2" /> <strong>Type:</strong> {video.videoType}</p>
                <p><Clock className="me-2" /> <strong>Durée:</strong> {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</p>
                <p><Calendar className="me-2" /> <strong>Créé le:</strong> {moment(video.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                <p><Tag className="me-2" /> <strong>Catégorie:</strong> {video.category}</p>
              </div>
              <div className="col-md-6">
                <p><GraphUp className="me-2" /> <strong>Engagement:</strong> {video.engagementScore?.toFixed(1) || 0}%</p>
                <p><People className="me-2" /> <strong>Vues uniques:</strong> {formatNumber(video.uniqueViews?.length || 0)}</p>
                <p><Heart className="me-2" /> <strong>Likes:</strong> {formatNumber(video.likes?.length || 0)}</p>
                <p><ChatDots className="me-2" /> <strong>Commentaires:</strong> {formatNumber(video.comments?.length || 0)}</p>
                <p><ShareFill className="me-2" /> <strong>Partages:</strong> {formatNumber(video.shares?.length || 0)}</p>
              </div>
            </div>
            <hr className="my-3" />
            <div className="d-flex gap-2">
              <Button size="sm" variant="success" onClick={handleApprove} disabled={actionLoading}>
                <CheckCircle className="me-1" /> Approuver
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete} disabled={actionLoading}>
                <Trash className="me-1" /> Supprimer
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Admin info button */}
        {isAdmin && isPending && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="position-absolute"
            style={{
              bottom: '100px',
              right: '15px',
              zIndex: 20,
              background: 'rgba(255, 152, 0, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Infos Admin"
          >
            <ShieldLock size={20} color="white" />
          </button>
        )}
      </>
    );
  }

  // ============================================
  // RENDER MODO GRID (Home Style)
  // ============================================
  return (
    <Card className="video-card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => history.push(`/video/${video._id}`)}>
      <div className="position-relative" style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px 12px 0 0', backgroundColor: '#1a1a1a' }}>
        <img
          src={getThumbnail()}
          alt={video.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          className="video-thumbnail"
          onError={handleImageError}
        />
        
        {isPending && (
          <Badge bg="warning" className="position-absolute top-0 start-0 m-2">
            <ShieldLock size={10} className="me-1" /> En attente
          </Badge>
        )}
        
        <div className="play-overlay d-flex align-items-center justify-content-center">
          <div className="play-button">
            <PlayFill size={48} className="text-white" />
          </div>
        </div>
        
        {video.duration > 0 && (
          <Badge bg="dark" className="position-absolute bottom-0 end-0 m-2 opacity-75">
            <Clock size={12} className="me-1" />
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
          </Badge>
        )}
        
        <Badge bg="primary" className="position-absolute top-0 end-0 m-2">
          {video.videoType === 'youtube' ? 'YouTube' : video.videoType === 'vimeo' ? 'Vimeo' : 'Vidéo'}
        </Badge>
      </div>
      
      <Card.Body>
        <Card.Title className="fs-6 fw-bold mb-2" style={{ lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.title}
        </Card.Title>
        
        <div className="d-flex align-items-center gap-2 mb-2">
          <img
            src={getAvatar()}
            alt={video.user?.username}
            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
            onError={handleAvatarError}
            onClick={(e) => { e.stopPropagation(); navigateToProfile(e); }}
          />
          <small className="text-muted" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigateToProfile(e); }}>
            {video.user?.username || 'Utilisateur'}
          </small>
          <small className="text-muted">•</small>
          <small className="text-muted">{moment(video.createdAt).fromNow()}</small>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex gap-3">
            <span className="small text-muted">
              <Eye size={14} className="me-1" /> {formatNumber(video.views)}
            </span>
            <span className="small text-muted" onClick={handleLike} style={{ cursor: 'pointer' }}>
              {liked ? <HeartFill size={14} className="me-1 text-danger" /> : <Heart size={14} className="me-1" />}
              {formatNumber(likesCount)}
            </span>
            <span className="small text-muted" onClick={handleSave} style={{ cursor: 'pointer' }}>
              {saved ? <BookmarkFill size={14} className="me-1 text-warning" /> : <Bookmark size={14} className="me-1" />}
            </span>
            <span className="small text-muted" onClick={handleShare} style={{ cursor: 'pointer' }}>
              <Share size={14} className="me-1" />
            </span>
          </div>
        </div>
      </Card.Body>
      
      <style jsx="true">{`
        .video-card:hover .video-thumbnail { transform: scale(1.05); }
        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .video-card:hover .play-overlay { opacity: 1; }
        .play-button {
          width: 60px;
          height: 60px;
          background: rgba(0,0,0,0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        .video-card:hover .play-button { transform: scale(1.1); }
        @keyframes heartBurst {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
    </Card>
  );
};

export default VideoCard;
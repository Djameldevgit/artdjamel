import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  faChevronUp, faChevronDown, faSpinner, faUserPlus, faCheck,
  faCartShopping
} from '@fortawesome/free-solid-svg-icons';
import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faShareSquare as faShareRegular
} from '@fortawesome/free-regular-svg-icons';
import Hls from 'hls.js';

import { likeVideo, shareVideo, deleteVideo, toggleSaveVideo  } from '../../redux/actions/videoAction';
import { aprobarVideo, eliminarVideo } from '../../redux/actions/videoAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { getChannelProfile, toggleFollowChannel } from '../../redux/actions/channelAction';
 
 import { addToCart } from '../../redux/actions/cartAction';
 
import VideoComments from './VideoComments';
import moment from 'moment';
import 'moment/locale/fr';
import './Feed.css';

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

const extractAvatar = (avatarData) => {
  if (!avatarData) return '/default-avatar.png';
  if (typeof avatarData === 'string') return avatarData;
  if (Array.isArray(avatarData) && avatarData.length > 0) {
    return avatarData[0]?.url || avatarData[0] || '/default-avatar.png';
  }
  if (avatarData?.url) return avatarData.url;
  return '/default-avatar.png';
};

const formatNumber = n => {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const Feed = ({
  video,
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
  const { auth, socket, channel: channelState } = useSelector(state => state);
  const videoRef = useRef(null);
  const drawerRef = useRef(null);
  let hlsRef = useRef(null);
  
  const hasFetchedRef = useRef(false);
  const lastVideoIdRef = useRef(null);

  // Estados locales
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(0);
  const [shared, setShared] = useState(false);
  const [sharesCount, setSharesCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [localIsFollowing, setLocalIsFollowing] = useState(false);
  const [localFollowersCount, setLocalFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1024);
 
  const [fetchedChannel, setFetchedChannel] = useState(null);
  const [fetchingChannel, setFetchingChannel] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'moderator';
  const isOwner = auth.user?._id === video.user?._id;
  const isPending = video?.status === 'pending';
   
  // ============================================
  // 🔄 SINCRONIZACIÓN DE ESTADOS CON PROPS
  // ============================================
  useEffect(() => {
    const userLiked = video.likes?.some(id => id.toString() === auth.user?._id?.toString()) || false;
    setLiked(userLiked);
    setLikesCount(video.likes?.length || 0);

    const isSavedNow = video.saves?.some(id => id.toString() === auth.user?._id?.toString()) || false;
    setSaved(isSavedNow);
    setSavesCount(video.saves?.length || video.savesCount || 0);

    const userShared = video.shares?.some(id => id.toString() === auth.user?._id?.toString()) || false;
    setShared(userShared);
    setSharesCount(video.shares?.length || 0);

    setCommentsCount(video.comments?.length || 0);
  }, [video, auth.user?._id]);

  // OBTENER CHANNEL ID
  const { initialChannelId, initialChannelName, initialChannelAvatar } = useMemo(() => {
    let id = null, name = null, avatar = null;
    if (video.channel && typeof video.channel === 'object') {
      id = video.channel._id;
      name = video.channel.name;
      avatar = video.channel.avatar;
    } else if (typeof video.channel === 'string' && video.channel.length > 0) {
      id = video.channel;
    } else if (video.channelId) {
      id = video.channelId;
    } else if (video.user?.channelId) {
      id = video.user.channelId;
    }
    return { initialChannelId: id, initialChannelName: name, initialChannelAvatar: avatar };
  }, [video.channel, video.channelId, video.user?.channelId]);

  // BUSCAR CANAL
  useEffect(() => {
    if (lastVideoIdRef.current !== video._id) {
      lastVideoIdRef.current = video._id;
      hasFetchedRef.current = false;
      setFetchedChannel(null);
      setFetchError(false);
    }

    if (hasFetchedRef.current) return;

    if (video.channel && typeof video.channel === 'object' && video.channel._id) {
      setFetchedChannel(video.channel);
      hasFetchedRef.current = true;
      return;
    }

    if (!initialChannelId || initialChannelId === 'null' || initialChannelId === 'undefined') {
      setFetchError(true);
      hasFetchedRef.current = true;
      return;
    }

    const fetchChannel = async () => {
      setFetchingChannel(true);
      try {
        const result = await dispatch(getChannelProfile(initialChannelId, auth.token));
        if (result?.profile || result?.channel) {
          setFetchedChannel(result.profile || result.channel);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error('❌ Error fetching channel:', err);
        setFetchError(true);
      } finally {
        setFetchingChannel(false);
        hasFetchedRef.current = true;
      }
    };

    fetchChannel();
  }, [initialChannelId, video._id, video.channel, dispatch, auth.token]);

  const finalChannel = fetchedChannel || (video.channel && typeof video.channel === 'object' ? video.channel : {});
  const channelId = finalChannel._id || initialChannelId;
  const channelName = finalChannel.name || initialChannelName || video.user?.username || 'Canal';
  const channelAvatar = extractAvatar(finalChannel.avatar || initialChannelAvatar);
  const isChannelVerified = finalChannel.isVerified || false;

  // SINCRONIZAR FOLLOW DESDE REDUX
  useEffect(() => {
    if (!channelId || channelId === 'null' || channelId === 'undefined') return;
    
    const isFollowFromList = channelState?.followingChannels?.includes(channelId);
    const isFollowFromChannel = channelState?.channel?._id === channelId && channelState?.channel?.isFollowing;
    const isFollowFromFetched = finalChannel?.isFollowing || false;
    const finalFollowState = isFollowFromList || isFollowFromChannel || isFollowFromFetched;
    
    setLocalIsFollowing(finalFollowState);
    
    const followersCountFromState = channelState?.channel?._id === channelId 
      ? channelState.channel.followersCount 
      : finalChannel?.followersCount || 0;
    
    setLocalFollowersCount(followersCountFromState);
    
  }, [channelId, channelState?.followingChannels, channelState?.channel, finalChannel]);

  // HANDLE FOLLOW
  const handleFollowChannel = async () => {
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour suivre" } });
      history.push('/login');
      return;
    }
    
    if (!channelId || channelId === 'null' || channelId === 'undefined') {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Canal invalide" } });
      return;
    }
    
    if (followLoading) return;
    
    const wasFollowing = localIsFollowing;
    const newFollowState = !wasFollowing;
    
    setLocalIsFollowing(newFollowState);
    setLocalFollowersCount(prev => newFollowState ? prev + 1 : Math.max(0, prev - 1));
    setFollowLoading(true);
    
    try {
      const res = await dispatch(toggleFollowChannel(channelId, auth.token));
      
      if (res?.success) {
        setLocalIsFollowing(res.isFollowing);
        setLocalFollowersCount(res.followersCount);
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: res.isFollowing ? '✓ Canal suivi' : '✓ Canal abandonné' }
        });
      } else {
        setLocalIsFollowing(wasFollowing);
        setLocalFollowersCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: res?.error || "Erreur lors du suivi du canal" }
        });
      }
    } catch (error) {
      console.error('❌ Error en handleFollowChannel:', error);
      setLocalIsFollowing(wasFollowing);
      setLocalFollowersCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: "Erreur lors du suivi du canal" }
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const goToChannel = useCallback((e) => {
    e?.stopPropagation();
    if (!channelId || channelId === 'null' || channelId === 'undefined' || channelId === '') {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Este video no pertenece a ningún canal.' }
      });
      return;
    }
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    history.push(`/channel/${channelId}`);
  }, [channelId, dispatch, history]);

  // VIDEO SOURCE
  const getFinalVideoSrc = () => {
    if (video.videoUrl && (video.videoUrl.includes('l_audio') || video.videoUrl.includes('.m3u8'))) {
      return video.videoUrl;
    }
    if (video.music?.audioUrl) {
      return getVideoWithExternalAudio(video.videoUrl, video.music.audioUrl);
    }
    return video.videoUrl;
  };
  const finalVideoSrc = getFinalVideoSrc();

  // HLS
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const src = finalVideoSrc;
    if (!src) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (src.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true, maxBufferLength: 30 });
        hls.loadSource(src);
        hls.attachMedia(videoEl);
        hlsRef.current = hls;
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = src;
      }
    } else {
      videoEl.src = src;
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [finalVideoSrc]);

  // PLAY/PAUSE
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

  // PROGRESS
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const onTimeUpdate = () => {
      if (videoEl.duration) setProgress((videoEl.currentTime / videoEl.duration) * 100);
    };
    videoEl.addEventListener('timeupdate', onTimeUpdate);
    return () => videoEl.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  // SOCKET COMENTARIOS
  useEffect(() => {
    if (!socket || !video || isPending) return;
    socket.emit('join-video-room', video._id);
    socket.on('new-comment', d => {
      if (d.videoId === video._id) setCommentsCount(p => p + 1);
    });
    socket.on('comment-deleted', d => {
      if (d.videoId === video._id) setCommentsCount(p => Math.max(0, p - 1));
    });
    return () => {
      socket.emit('leave-video-room', video._id);
      socket.off('new-comment');
      socket.off('comment-deleted');
    };
  }, [socket, video, isPending]);

  // DRAG COMENTARIOS
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

  // KEYBOARD NAV
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

  // RESIZE
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const guardPending = () => {
    if (!isPending) return false;
    dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Cette vidéo est en attente d'approbation" } });
    return true;
  };

  // HANDLE LIKE
  const handleLike = async () => {
    if (!auth.token) return history.push('/login');
    if (guardPending()) return;
    
    setActionLoading(true);
    try {
      const res = await dispatch(likeVideo(video._id, auth.token, auth, socket, video));
      if (res?.liked !== undefined) {
        setLiked(res.liked);
        setLikesCount(res.likes);
        if (res.liked) createHeartEffect();
      }
    } catch (error) {
      console.error('Error en handleLike:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // HANDLE SAVE
  const handleSave = async () => {
    if (!auth.token) return history.push('/login');
    if (guardPending()) return;
    if (saving) return;
    
    setSaving(true);
    try {
      const result = await dispatch(toggleSaveVideo(video._id, auth.token, auth, socket, video));
      
      if (result?.isSaved !== undefined) {
        setSaved(result.isSaved);
        setSavesCount(result.savesCount);
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

  // HANDLE SHARE
  const handleShare = async () => {
    if (!auth.token) {
      history.push('/login');
      return;
    }
    if (guardPending()) return;
    
    const url = `${window.location.origin}/video/${video._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: video.title, text: video.description, url }); } catch { }
    } else {
      navigator.clipboard.writeText(url);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Lien copié !' } });
    }
    
    const wasShared = shared;
    setShared(true);
    setSharesCount(prev => prev + 1);
    
    try {
      const res = await dispatch(shareVideo(video._id, auth.token, auth, socket, video));
      if (res?.shared !== undefined) {
        setShared(res.shared);
        setSharesCount(res.shares);
      } else {
        setShared(wasShared);
        setSharesCount(prev => wasShared ? prev : prev - 1);
      }
    } catch (error) {
      console.error('Error en handleShare:', error);
      setShared(wasShared);
      setSharesCount(prev => wasShared ? prev : prev - 1);
    }
  };

  // HANDLE CARRITO
  const handleAddToCart = () => {
    if (!auth.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour ajouter au panier" } });
      history.push('/login');
      return;
    }
    if (guardPending()) return;
    dispatch(addToCart(video._id, 1));
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
    if (!liked && !isPending) handleLike();
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

  // Acciones del menú
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
  const handleApproveVideo = menuAction(async () => {
    if (!window.confirm(`Approuver "${video.title}" ?`)) return;
    setActionLoading(true);
    const res = await dispatch(aprobarVideo(video._id, auth.token, auth, socket, video));
    setActionLoading(false);
    if (res?.success) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Vidéo approuvée !' } });
      onVideoDeleted?.(video._id);
    }
  });
  const handleRejectVideo = menuAction(async () => {
    if (!window.confirm(`Rejeter "${video.title}" ?`)) return;
    setActionLoading(true);
    const res = await dispatch(eliminarVideo(video._id, auth.token, auth, socket, video));
    setActionLoading(false);
    if (res?.success) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Vidéo rejetée' } });
      onVideoDeleted?.(video._id);
    }
  });
  const handleReportVideo = menuAction(() => dispatch({ type: GLOBALTYPES.ALERT, payload: { info: 'Fonctionnalité de signalement disponible prochainement.' } }));
  const handleBlockUser = menuAction(() => dispatch({ type: GLOBALTYPES.ALERT, payload: { info: `@${video.user?.username} bloqué.` } }));
  const handleNotInterested = menuAction(() => {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { info: 'Merci pour votre retour !' } });
    onVideoDeleted?.(video._id);
  });

  const videoScale = !showComments ? 1 : 0.7 + 0.3 * Math.min(dragOffset / (window.innerHeight * 0.6), 1);
  const videoTranslateY = !showComments ? 0 : -15 * (1 - Math.min(dragOffset / (window.innerHeight * 0.6), 1));

  if (fetchingChannel && !channelId) {
    return (
      <div className="video-reel-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" color="white" />
        </div>
      </div>
    );
  }

  return (
    <div className="video-reel-container">
      {/* HEADER: solo botón volver y badge admin */}
      <div className="vr-header">
        <button className="vr-header-btn" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        {isPending && isAdmin && (
          <div className="vr-admin-badge">
            <span className="vr-admin-dot" />
            <span className="vr-admin-text">Admin · En attente</span>
          </div>
        )}
      </div>

      {/* Video wrapper */}
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

        {/* Progress bar */}
        {!showComments && (
          <div className="vr-progress-bar" onClick={handleProgressClick}>
            <div className="vr-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Sidebar acciones - NUEVA ESTRUCTURA */}
        {!showComments && (
          <div className="vr-actions-sidebar">
            {/* 1. Menú de tres puntos (dropdown) */}
            <div className="vr-action-group">
              <Dropdown show={showMenu} onToggle={setShowMenu} align="end">
                <Dropdown.Toggle as="button" className="vr-action-btn vr-menu-toggle">
                  <FontAwesomeIcon icon={faEllipsisVertical} className="vr-action-icon" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="vr-dropdown-menu">
                  {isAdmin && isPending && (
                    <>
                      <Dropdown.Item onClick={handleApproveVideo} className="vr-dropdown-item approve">
                        <FontAwesomeIcon icon={faCheckCircle} /> Approuver
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleRejectVideo} className="vr-dropdown-item reject">
                        <FontAwesomeIcon icon={faBan} /> Rejeter
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  {(isOwner || isAdmin) && !isPending && (
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
                  {isAdmin && !isPending && (
                    <>
                      <Dropdown.Item onClick={handleDeleteVideo} className="vr-dropdown-item reject">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer (Admin)
                      </Dropdown.Item>
                      <Dropdown.Divider />
                    </>
                  )}
                  {!isOwner && !isAdmin && !isPending && (
                    <>
                      <Dropdown.Item onClick={handleReportVideo} className="vr-dropdown-item">
                        <FontAwesomeIcon icon={faFlag} /> Signaler
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleBlockUser} className="vr-dropdown-item reject">
                        <FontAwesomeIcon icon={faUserSlash} /> Bloquer @{video.user?.username}
                      </Dropdown.Item>
                    </>
                  )}
                  {!isPending && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleNotInterested} className="vr-dropdown-item">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Pas intéressé(e)
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <span className="vr-action-count">Menu</span>
            </div>

            {/* 2. Like */}
            <div className="vr-action-group">
              <button 
                className={`vr-action-btn ${liked ? 'active-like' : ''}`} 
                onClick={handleLike}
                disabled={actionLoading}
              >
                <FontAwesomeIcon 
                  icon={liked ? faHeart : faHeartRegular} 
                  className="vr-action-icon" 
                  style={{ color: liked ? '#ff3b5c' : 'white' }} 
                />
              </button>
              <span className="vr-action-count">{formatNumber(likesCount)}</span>
            </div>

            {/* 3. Save */}
            <div className="vr-action-group">
              <button 
                className={`vr-action-btn ${saved ? 'active-save' : ''}`} 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon 
                    icon={saved ? faBookmark : faBookmarkRegular} 
                    className="vr-action-icon" 
                    style={{ color: saved ? '#ffd700' : 'white' }} 
                  />
                )}
              </button>
              <span className="vr-action-count">{formatNumber(savesCount)}</span>
            </div>

            {/* 4. Carrito de compra */}
            <div className="vr-action-group">
              <button 
                className="vr-action-btn" 
                onClick={handleAddToCart}
                title="Ajouter au panier"
              >
                <FontAwesomeIcon icon={faCartShopping} className="vr-action-icon" style={{ color: '#4caf50' }} />
              </button>
              <span className="vr-action-count">Acheter</span>
            </div>

            {/* 5. Share */}
            <div className="vr-action-group">
              <button 
                className={`vr-action-btn ${shared ? 'active-share' : ''}`} 
                onClick={handleShare}
              >
                <FontAwesomeIcon 
                  icon={shared ? faShare : faShareRegular} 
                  className="vr-action-icon" 
                  style={{ color: shared ? '#4caf50' : 'white' }} 
                />
              </button>
              <span className="vr-action-count">{formatNumber(sharesCount)}</span>
            </div>

            {/* 6. Comments */}
            <div className="vr-action-group">
              <button className="vr-action-btn" onClick={handleOpenComments}>
                <FontAwesomeIcon icon={faComment} className="vr-action-icon" />
              </button>
              <span className="vr-action-count">{formatNumber(commentsCount)}</span>
            </div>

            {/* 7. Details (info) */}
            <div className="vr-action-group">
              <button className="vr-action-btn" onClick={handleViewDetails} title="Détails du produit">
                <FontAwesomeIcon icon={faInfoCircle} className="vr-action-icon" />
              </button>
              <span className="vr-action-count">Détails</span>
            </div>

            {/* 8. Navegación (solo escritorio) */}
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

        {/* Volume button */}
        {!showComments && (
          <button className="vr-volume-btn" onClick={toggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} />
          </button>
        )}

        {/* Video info (canal, título, descripción, etc.) */}
        {!showComments && (
          <div className="vr-video-info">
            {isPending && isAdmin && <span className="vr-pending-badge">⏳ En attente</span>}
            
            <div className="vr-user-row">
              <div className="vr-user-details">
                <div 
                  className="vr-username" 
                  onClick={goToChannel} 
                  style={{ cursor: channelId && channelId !== 'null' ? 'pointer' : 'default' }}
                >
                  @{channelName}
                </div>
                <div className="vr-stats">
                  <span><FontAwesomeIcon icon={faEye} />{formatNumber(video.views)}</span>
                  <span><FontAwesomeIcon icon={faClock} />{moment(video.createdAt).fromNow()}</span>
                  {localFollowersCount > 0 && (
                    <span><FontAwesomeIcon icon={faUserPlus} />{formatNumber(localFollowersCount)}</span>
                  )}
                </div>
              </div>
              
              {/* Botón follow */}
              {!isPending && !isOwner && (
                <button 
                  className={`vr-follow-btn ${localIsFollowing ? 'following' : ''}`} 
                  onClick={handleFollowChannel}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : localIsFollowing ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Abonné
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                      S'abonner
                    </>
                  )}
                </button>
              )}
              
              {!isPending && isOwner && (
                <button className="vr-follow-btn owner" disabled>
                  Votre canal
                </button>
              )}
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

      {/* Comments drawer */}
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
              <h5 className="vr-comments-title">
                {commentsCount} commentaire{commentsCount !== 1 ? 's' : ''}
              </h5>
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
// frontend/src/pages/channel/ChannelProfile.jsx
// 🔥 VERSIÓN CORREGIDA - isOwner definido antes de usarlo

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilm, faBookmark, faHeart, faArrowLeft,
  faUserPlus, faCheck, faEnvelope, faShare,
  faEllipsisH, faSpinner, faUserCircle,
  faCommentDots, faInfoCircle, faPhone, faEnvelope as faEnvelopeSolid,
  faGlobe, faMapMarkerAlt, faFlag, faBan, faEdit, faImage,
  faVideo, faEye, faThumbsUp, faExclamationTriangle, faClock, faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';

import { 
  toggleFollowChannel, 
  getChannelVideos,
  getChannelProfile,
  reportChannel,
  blockChannel,
  registerChannelShare,
  getChannelContact
} from '../../redux/actions/channelAction';
import { toggleSaveVideo } from '../../redux/actions/videoAction';
import { getSavedVideos, getLikedVideos } from '../../redux/actions/userAction';

import LoadMoreBtn from '../../components/LoadMoreBtn';
import VideoCardVertical from '../../components/VideoCardVertical';
import HeaderVideo from '../HeaderVideo';
import useUserPlan from '../../components/useUserPlan';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import './ChannelProfile.css';

// ==================== FUNCIÓN PARA EXTRAER URL DE IMAGEN ====================
const getImageUrl = (imageData, defaultValue = '') => {
  if (!imageData) return defaultValue;
  if (typeof imageData === 'string') return imageData;
  if (Array.isArray(imageData) && imageData.length > 0) {
    return imageData[0]?.url || defaultValue;
  }
  if (imageData?.url) return imageData.url;
  return defaultValue;
};

// ==================== FORMATO DE NÚMEROS ====================
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
};

// ==================== FUNCIÓN PARA OBTENER TOKEN ====================
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

// ==================== LOADING SPINNER ====================
const LoadingSpinner = () => (
  <div className="channel-loading">
    <div className="loading-spinner"><FontAwesomeIcon icon={faSpinner} spin /></div>
    <p>Cargando canal...</p>
  </div>
);

// ==================== AVATAR COMPONENTE ====================
const AvatarWithFallback = ({ src, alt, className, name, onClick, size = 'large' }) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getImageUrl(src);

  if (imgError || !avatarUrl) {
    const colors = ['#fe2c55', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
    const bg = colors[(name?.length || 0) % colors.length];
    return (
      <div className={`${className} ${onClick ? 'clickable' : ''}`} onClick={onClick}
        style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size === 'large' ? '48px' : '32px', fontWeight: 'bold', color: '#fff',
          cursor: onClick ? 'pointer' : 'default' }}>
        {name ? name.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUserCircle} />}
      </div>
    );
  }
  return <img src={avatarUrl} alt={alt} className={className} onError={() => setImgError(true)} 
    onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', objectFit: 'cover' }} />;
};

// ==================== BANNER COMPONENTE ====================
const ChannelBanner = ({ cover, channelName, planColor, onBack, onMessage, isOwner, 
  onEdit, onShare, onContact, onReport, onBlock }) => {
  const [bannerError, setBannerError] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const coverUrl = getImageUrl(cover);

  const BannerOverlay = () => (
    <div className="channel-banner-header">
      <button className="channel-banner-back-btn" onClick={onBack}><FontAwesomeIcon icon={faArrowLeft} /></button>
      <h2 className="channel-banner-title">{channelName}</h2>
      <div className="channel-banner-actions">
        {isOwner && <button className="channel-banner-message-btn" onClick={onMessage}><FontAwesomeIcon icon={faCommentDots} /></button>}
        <div className="channel-three-dots-wrapper">
          <button className="channel-banner-menu-btn" onClick={() => setMenuOpen(!menuOpen)}><FontAwesomeIcon icon={faEllipsisH} /></button>
          {menuOpen && (
            <div className="channel-profile-menu">
              {isOwner ? (
                <>
                  <button onClick={onEdit}><FontAwesomeIcon icon={faEdit} /> Modifier</button>
                  <button onClick={onContact}><FontAwesomeIcon icon={faInfoCircle} /> Contact</button>
                  <button onClick={onShare}><FontAwesomeIcon icon={faShare} /> Partager</button>
                </>
              ) : (
                <>
                  <button onClick={onReport}><FontAwesomeIcon icon={faFlag} /> Signaler</button>
                  <button onClick={onBlock}><FontAwesomeIcon icon={faBan} /> Bloquer</button>
                  <button onClick={onMessage}><FontAwesomeIcon icon={faEnvelope} /> Message</button>
                  <button onClick={onShare}><FontAwesomeIcon icon={faShare} /> Partager</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (bannerError || !coverUrl) {
    return (
      <div className="channel-banner-container">
        <div className="channel-banner-placeholder" style={{ background: `linear-gradient(135deg, ${planColor || '#fe2c55'}, ${planColor ? planColor + 'cc' : '#ff9800'})` }}>
          <BannerOverlay />
          <FontAwesomeIcon icon={faImage} size="3x" style={{ opacity: 0.7 }} />
          <span>{channelName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-banner-container">
      {!bannerLoaded && <div className="channel-banner-skeleton"><div className="skeleton-shimmer" /></div>}
      <img src={coverUrl} alt={channelName} className="channel-banner" style={{ display: bannerLoaded ? 'block' : 'none' }}
        onLoad={() => setBannerLoaded(true)} onError={() => setBannerError(true)} />
      <BannerOverlay />
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
const ChannelProfile = () => {
  const { channelId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth, channel: channelState } = useSelector(state => state);
  const { planName, planLimits, canUploadVideo, planColor } = useUserPlan();
  const { channel, loading, videos = [], hasMore = false, totalVideos = 0, error } = useSelector(state => state.channel);

  // ==================== ESTADOS LOCALES PARA FOLLOW (OPTIMISTIC UPDATE) ====================
  const [localIsFollowing, setLocalIsFollowing] = useState(false);
  const [localFollowersCount, setLocalFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // ==================== ESTADOS - CON FLAGS PARA EVITAR BUCLE ====================
  const [savedVideos, setSavedVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [likedHasMore, setLikedHasMore] = useState(false);
  const [savedPage, setSavedPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  
  // ✅ FLAGS PARA CONTROLAR QUE SOLO SE CARGUE UNA VEZ
  const savedLoadedRef = useRef(false);
  const likedLoadedRef = useRef(false);
  const savedErrorRef = useRef(false);
  const likedErrorRef = useRef(false);

  const [activeTab, setActiveTab] = useState('videos');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showPlanInfo, setShowPlanInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [contactInfo, setContactInfo] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // ✅ OBTENER TOKEN
  const token = getAuthToken(auth);
  
  // ✅ DEFINIR isOwner AQUÍ - ANTES DE USARLO
  const isOwner = auth.user?._id && channel?.owner?._id && auth.user._id.toString() === channel.owner?._id?.toString();
  
  // ✅ isPending
  const isPending = channel?.pending === true;
  
  // ✅ Límites de videos
  const currentVideoCount = videos.length;
  const maxVideos = planLimits?.maxVideos || 5;
  const canUploadMore = canUploadVideo(currentVideoCount);

  // ✅ Cargar following channels desde storage al montar el componente
  useEffect(() => {
    const loadFollowStateFromStorage = () => {
      try {
        const saved = localStorage.getItem('user_following_channels');
        if (saved && channelId) {
          const followingChannels = JSON.parse(saved);
          const isFollowSaved = followingChannels.includes(channelId);
          
          console.log('📦 Loading follow state from storage:', {
            channelId,
            isFollowSaved,
            followingChannels
          });
          
          setLocalIsFollowing(isFollowSaved);
        }
      } catch (err) {
        console.error('Error loading from storage:', err);
      }
    };
    
    if (channelId) {
      loadFollowStateFromStorage();
    }
  }, [channelId]);

  // ✅ Sincronizar estado local con Redux cuando cambia el canal
  useEffect(() => {
    if (channel) {
      const isInFollowingList = channelState?.followingChannels?.includes(channel._id);
      const isFollowingFromChannel = channel.isFollowing || false;
      const finalFollowState = isInFollowingList || isFollowingFromChannel;
      
      setLocalIsFollowing(finalFollowState);
      setLocalFollowersCount(channel.followersCount || 0);
    }
  }, [channel, channelState?.followingChannels]);

  // ==================== CARGAR DATOS DEL CANAL ====================
  useEffect(() => {
    if (!channelId) return;
    const loadChannelData = async () => {
      try {
        let authToken = null;
        if (auth?.token) authToken = typeof auth.token === 'string' ? auth.token : auth.token.token;
        if (!authToken && localStorage.getItem('access_token')) authToken = localStorage.getItem('access_token');
        if (!authToken && localStorage.getItem('token')) authToken = localStorage.getItem('token');
        
        await dispatch(getChannelProfile(channelId, authToken));
        await dispatch(getChannelVideos(channelId, 1, 12, authToken));
      } catch (err) { console.error('Error loading channel:', err); }
    };
    loadChannelData();
  }, [dispatch, channelId, auth]);

  // ==================== CARGAR VIDEOS GUARDADOS (SOLO UNA VEZ) ====================
  const loadSavedVideos = useCallback(async (page = 1) => {
    if (!token || !isOwner) return;
    if (savedLoadedRef.current || savedErrorRef.current) return;
    if (savedLoading) return;
    
    setSavedLoading(true);
    try {
      const result = await dispatch(getSavedVideos(token, page, 12));
      if (result?.success) {
        if (page === 1) setSavedVideos(result.videos || []);
        else setSavedVideos(prev => [...prev, ...(result.videos || [])]);
        setSavedHasMore(result.hasMore || false);
        setSavedPage(page);
        savedLoadedRef.current = true;
        savedErrorRef.current = false;
      } else {
        savedErrorRef.current = true;
        console.error('Error loading saved videos:', result?.error);
      }
    } catch (err) {
      console.error('Error loading saved videos:', err);
      savedErrorRef.current = true;
    } finally {
      setSavedLoading(false);
    }
  }, [token, isOwner, dispatch, savedLoading]);

  // ==================== CARGAR VIDEOS CON LIKE (SOLO UNA VEZ) ====================
  const loadLikedVideos = useCallback(async (page = 1) => {
    if (!token || !isOwner) return;
    if (likedLoadedRef.current || likedErrorRef.current) return;
    if (likedLoading) return;
    
    setLikedLoading(true);
    try {
      const result = await dispatch(getLikedVideos(token, page, 12));
      if (result?.success) {
        if (page === 1) setLikedVideos(result.videos || []);
        else setLikedVideos(prev => [...prev, ...(result.videos || [])]);
        setLikedHasMore(result.hasMore || false);
        setLikedPage(page);
        likedLoadedRef.current = true;
        likedErrorRef.current = false;
      } else {
        likedErrorRef.current = true;
        console.error('Error loading liked videos:', result?.error);
      }
    } catch (err) {
      console.error('Error loading liked videos:', err);
      likedErrorRef.current = true;
    } finally {
      setLikedLoading(false);
    }
  }, [token, isOwner, dispatch, likedLoading]);

  // ==================== CAMBIO DE TAB ====================
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'saved' && !savedLoadedRef.current && !savedErrorRef.current && !savedLoading) {
      loadSavedVideos(1);
    }
    if (tab === 'liked' && !likedLoadedRef.current && !likedErrorRef.current && !likedLoading) {
      loadLikedVideos(1);
    }
  }, [loadSavedVideos, loadLikedVideos, savedLoading, likedLoading]);

  // ==================== ERROR HANDLER ====================
  useEffect(() => {
    if (error) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: typeof error === 'string' ? error : 'Error al cargar el canal' } });
  }, [error, dispatch]);

  // ==================== HANDLERS ====================
  const handleBack = () => history.goBack();
  
  const handleMessage = () => {
    if (!token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour envoyer un message" } });
      history.push('/login');
      return;
    }
    history.push(`/message/${channel?.owner?._id}`);
  };
  
  const handleEditProfile = () => history.push(`/channel/${channelId}/edit`);
  const handleAvatarClick = () => { if (isOwner) handleEditProfile(); };
  
  const handleShareProfile = async () => {
    const url = `${window.location.origin}/channel/${channelId}`;
    if (token) await dispatch(registerChannelShare(channelId, { token }));
    if (navigator.share) {
      try { await navigator.share({ title: `Canal de ${channel?.name}`, url }); } 
      catch (err) { if (err.name !== 'AbortError') console.log('Error sharing:', err); }
    } else {
      navigator.clipboard.writeText(url);
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: "Lien copié !" } });
    }
  };

  const handleContact = async () => {
    if (!token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour voir les informations" } });
      history.push('/login');
      return;
    }
    if (!showContactInfo) {
      const result = await dispatch(getChannelContact(channelId, { token }));
      if (result.success) { setContactInfo(result.contact); setShowContactInfo(true); }
    } else { setShowContactInfo(false); setContactInfo(null); }
  };

  const handleReportChannel = async () => {
    if (!token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour signaler" } });
      history.push('/login');
      return;
    }
    if (!reportReason) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Veuillez sélectionner une raison" } });
      return;
    }
    const result = await dispatch(reportChannel(channelId, { reason: reportReason, description: reportDescription }, { token }));
    if (result.success) { setShowReportModal(false); setReportReason(''); setReportDescription(''); }
  };

  const handleBlockChannel = async () => {
    if (!token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour bloquer" } });
      history.push('/login');
      return;
    }
    const confirmBlock = window.confirm(isBlocked ? `Débloquer "${channel?.name}" ?` : `Bloquer "${channel?.name}" ?`);
    if (!confirmBlock) return;
    const result = await dispatch(blockChannel(channelId, { token }));
    if (result.success) {
      setIsBlocked(result.isBlocked);
      if (result.isBlocked) setTimeout(() => history.push('/'), 1500);
    }
  };

  // ==================== ✅ FOLLOW CON OPTIMISTIC UPDATE ====================
  const handleFollow = useCallback(async () => {
    if (!token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour suivre" } });
      history.push('/login');
      return;
    }
    
    if (followLoading) return;
    
    const wasFollowing = localIsFollowing;
    const newFollowState = !wasFollowing;
    
    setLocalIsFollowing(newFollowState);
    setLocalFollowersCount(prev => newFollowState ? prev + 1 : Math.max(0, prev - 1));
    
    setFollowLoading(true);
    
    try {
      const result = await dispatch(toggleFollowChannel(channelId, token));
      
      if (result?.success) {
        setLocalIsFollowing(result.isFollowing);
        setLocalFollowersCount(result.followersCount);
        
        dispatch({ 
          type: GLOBALTYPES.ALERT, 
          payload: { success: result.isFollowing ? '✓ Abonné' : '✓ Désabonné' } 
        });
      } else {
        setLocalIsFollowing(wasFollowing);
        setLocalFollowersCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
        
        dispatch({ 
          type: GLOBALTYPES.ALERT, 
          payload: { error: result?.error || "Erreur lors du suivi du canal" } 
        });
      }
    } catch (error) {
      console.error('Error en handleFollow:', error);
      setLocalIsFollowing(wasFollowing);
      setLocalFollowersCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
      
      dispatch({ 
        type: GLOBALTYPES.ALERT, 
        payload: { error: "Erreur lors du suivi du canal" } 
      });
    } finally {
      setFollowLoading(false);
    }
  }, [channelId, token, dispatch, followLoading, localIsFollowing]);

  // ==================== SAVE VIDEO ====================
  const handleSaveVideo = useCallback(async (videoId) => {
    if (!token) {
      history.push('/login');
      return { success: false };
    }
    const result = await dispatch(toggleSaveVideo(videoId, token, auth));
    if (result?.success && activeTab === 'saved') {
      if (result.isSaved) {
        savedLoadedRef.current = false;
        loadSavedVideos(1);
      } else {
        setSavedVideos(prev => prev.filter(v => v._id !== videoId));
      }
    }
    return result;
  }, [token, history, dispatch, auth, activeTab, loadSavedVideos]);

  const handleVideoClick = (videoId) => {
    sessionStorage.setItem('returnToChannel', 'true');
    sessionStorage.setItem('channelScrollPosition', window.scrollY.toString());
    history.push(`/video/${videoId}`);
  };

  const handleUploadVideo = () => {
    if (!canUploadMore) { setShowPlanInfo(true); setTimeout(() => setShowPlanInfo(false), 5000); return; }
    history.push(`/create-video-page?channelId=${channelId}`);
  };

  const loadMoreVideos = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await dispatch(getChannelVideos(channelId, nextPage, 12, token));
    setCurrentPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, hasMore, currentPage, dispatch, channelId, token]);

  const loadMoreSaved = useCallback(async () => {
    if (savedLoading || !savedHasMore) return;
    await loadSavedVideos(savedPage + 1);
  }, [savedLoading, savedHasMore, savedPage, loadSavedVideos]);

  const loadMoreLiked = useCallback(async () => {
    if (likedLoading || !likedHasMore) return;
    await loadLikedVideos(likedPage + 1);
  }, [likedLoading, likedHasMore, likedPage, loadLikedVideos]);

  const getCurrentVideos = () => {
    if (activeTab === 'videos') return videos;
    if (activeTab === 'saved') return savedVideos;
    if (activeTab === 'liked') return likedVideos;
    return [];
  };

  const getCurrentHasMore = () => {
    if (activeTab === 'videos') return hasMore;
    if (activeTab === 'saved') return savedHasMore;
    if (activeTab === 'liked') return likedHasMore;
    return false;
  };

  const getCurrentLoading = () => {
    if (activeTab === 'videos') return loadingMore;
    if (activeTab === 'saved') return savedLoading;
    if (activeTab === 'liked') return likedLoading;
    return false;
  };

  const getCurrentLoadMore = () => {
    if (activeTab === 'videos') return loadMoreVideos;
    if (activeTab === 'saved') return loadMoreSaved;
    if (activeTab === 'liked') return loadMoreLiked;
    return () => {};
  };

  const renderPendingAlert = () => {
    if (!isPending || !isOwner) return null;
    return (
      <div className="pending-alert-container">
        <div className="pending-alert-icon"><FontAwesomeIcon icon={faHourglassHalf} /></div>
        <div className="pending-alert-content">
          <h4>⏳ Canal en attente d'approbation</h4>
          <p>Votre canal <strong>"{channel?.name}"</strong> a été créé avec succès et est actuellement en cours de vérification.</p>
          <p>Une fois approuvé, il sera visible par tous les utilisateurs.</p>
          <div className="pending-alert-info"><FontAwesomeIcon icon={faClock} className="me-1" /><small>Temps d'attente estimé : 24 à 48 heures</small></div>
        </div>
      </div>
    );
  };

  if (isBlocked) {
    return (
      <div className="channel-blocked">
        <div className="blocked-content">
          <FontAwesomeIcon icon={faBan} size="4x" />
          <h2>Canal bloqué</h2>
          <p>Vous avez bloqué ce canal.</p>
          <button onClick={handleBlockChannel} className="btn-unblock">Débloquer</button>
          <button onClick={() => history.push('/')} className="btn-back-home">Accueil</button>
        </div>
      </div>
    );
  }

  if (loading && !channel) return <LoadingSpinner />;
  
  if (!channel || error) {
    return (
      <div className="channel-error">
        <h2>Canal non trouvé</h2>
        <button onClick={() => history.push('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="channel-profile-page">
      <ChannelBanner cover={channel.cover} channelName={channel.name} planColor={planColor}
        onBack={handleBack} onMessage={handleMessage} isOwner={isOwner}
        onEdit={handleEditProfile} onShare={handleShareProfile} onContact={handleContact}
        onReport={() => setShowReportModal(true)} onBlock={handleBlockChannel} />

      <div className="channel-avatar-container">
        <AvatarWithFallback src={channel.avatar} alt={channel.name} name={channel.name}
          className={`channel-avatar ${isOwner ? 'owner-avatar clickable' : ''}`}
          onClick={handleAvatarClick} size="large" />
        {isOwner && <div className="avatar-edit-badge" onClick={handleEditProfile}><FontAwesomeIcon icon={faEdit} size="12px" /></div>}
      </div>

      {renderPendingAlert()}

      <div className="channel-info-section">
        <h1 className="channel-name">{channel.name}</h1>
        <div className="channel-meta">
          <span className="channel-handle">@{channel.slug || channel.name.toLowerCase().replace(/\s/g, '')}</span>
          {channel.isVerified && <span className="verified-badge"><FontAwesomeIcon icon={faCheck} /> Vérifié</span>}
        </div>
        {channel.description && <p className="channel-description">{channel.description}</p>}

        <div className="channel-stats">
          <div className="stat-item"><span className="stat-value">{formatNumber(channel.totalVideos || 0)}</span><span className="stat-label">vidéos</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><span className="stat-value">{formatNumber(channel.totalViews || 0)}</span><span className="stat-label">vues</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><span className="stat-value">{formatNumber(channel.totalLikes || 0)}</span><span className="stat-label">likes</span></div>
          <div className="stat-divider" />
          <div className="stat-item"><span className="stat-value">{formatNumber(localFollowersCount)}</span><span className="stat-label">abonnés</span></div>
        </div>

        {showContactInfo && contactInfo && (
          <div className="contact-info-modal">
            <div className="contact-info-header"><h4><FontAwesomeIcon icon={faInfoCircle} /> Contact</h4><button onClick={() => setShowContactInfo(false)}>✕</button></div>
            <div className="contact-info-body">
              {contactInfo.email && <div className="contact-item"><FontAwesomeIcon icon={faEnvelopeSolid} /><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></div>}
              {contactInfo.phone && <div className="contact-item"><FontAwesomeIcon icon={faPhone} /><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></div>}
              {contactInfo.website && <div className="contact-item"><FontAwesomeIcon icon={faGlobe} /><a href={contactInfo.website} target="_blank" rel="noopener noreferrer">{contactInfo.website}</a></div>}
            </div>
          </div>
        )}

        <div className="channel-actions">
          {!isOwner ? (
            <>
              <button 
                className={`btn-follow ${localIsFollowing ? 'following' : ''}`} 
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <>
                    <FontAwesomeIcon icon={localIsFollowing ? faCheck : faUserPlus} />
                    <span>{localIsFollowing ? 'Abonné' : "S'abonner"}</span>
                  </>
                )}
              </button>
              <button className="btn-message" onClick={handleMessage}><FontAwesomeIcon icon={faEnvelope} /> Message</button>
            </>
          ) : (
            <button className="btn-upload" onClick={handleUploadVideo} disabled={!canUploadMore}>
              <FontAwesomeIcon icon={faVideo} /> Mettre en ligne
              {!canUploadMore && <span className="upload-limit">Limite atteinte</span>}
            </button>
          )}
        </div>
      </div>

      {/* ==================== TABS ==================== */}
      <div className="channel-tabs-container">
        <div className="channel-tabs">
          <button className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => handleTabChange('videos')}>
            <FontAwesomeIcon icon={faFilm} /> Vidéos {totalVideos > 0 && <span className="tab-count">{totalVideos}</span>}
          </button>
          
          {isOwner && token && (
            <>
              <button className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => handleTabChange('saved')}>
                <FontAwesomeIcon icon={faBookmark} /> Enregistrés 
                {savedVideos.length > 0 && <span className="tab-count">{savedVideos.length}</span>}
              </button>
              <button className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`} onClick={() => handleTabChange('liked')}>
                <FontAwesomeIcon icon={faHeart} /> J'aime
                {likedVideos.length > 0 && <span className="tab-count">{likedVideos.length}</span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIDEOS GRID */}
      <div className="videos-grid">
        {getCurrentVideos().map(video => (
          <VideoCardVertical key={video._id} video={video} onSave={isOwner ? () => handleSaveVideo(video._id) : null} />
        ))}
        {getCurrentLoading() && (<div className="loading-more-videos"><FontAwesomeIcon icon={faSpinner} spin /><span>Chargement...</span></div>)}
      </div>

      {/* EMPTY STATE */}
      {getCurrentVideos().length === 0 && !getCurrentLoading() && (
        <div className="empty-state">
          <div className="empty-icon"><FontAwesomeIcon icon={activeTab === 'videos' ? faFilm : activeTab === 'saved' ? faBookmark : faHeart} /></div>
          <h3>Aucune vidéo</h3>
          <p>{activeTab === 'videos' && isOwner ? 'Commencez à partager vos premières vidéos !' : 
              activeTab === 'videos' ? 'Aucune vidéo disponible.' : 
              activeTab === 'saved' ? 'Aucune vidéo enregistrée.' : 
              'Aucune vidéo aimée.'}</p>
          {activeTab === 'videos' && isOwner && (<button className="btn-upload-empty" onClick={handleUploadVideo}><FontAwesomeIcon icon={faVideo} /> Mettre en ligne</button>)}
        </div>
      )}

      {/* LOAD MORE BUTTON */}
      {getCurrentHasMore() && getCurrentVideos().length > 0 && (<LoadMoreBtn loading={getCurrentLoading()} loadMore={getCurrentLoadMore()} />)}
      
      <HeaderVideo />

      {/* PLAN LIMIT ALERT */}
      {showPlanInfo && (
        <div className="plan-limit-toast">
          <div className="toast-content"><FontAwesomeIcon icon={faExclamationTriangle} /><div><strong>Limite atteinte</strong><p>Votre plan {planName} permet max {maxVideos} vidéos.</p></div><button onClick={() => setShowPlanInfo(false)}>✕</button></div>
        </div>
      )}

      {/* MODAL REPORT */}
      {showReportModal && !isOwner && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><FontAwesomeIcon icon={faFlag} /> Signaler</h3><button onClick={() => setShowReportModal(false)}>✕</button></div>
            <div className="modal-body">
              <p>Pourquoi signalez-vous <strong>{channel?.name}</strong> ?</p>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="report-select">
                <option value="">Sélectionnez une raison...</option>
                <option value="spam">Spam</option><option value="harassment">Harcèlement</option>
                <option value="inappropriate">Contenu inapproprié</option><option value="violence">Violence</option>
                <option value="copyright">Copyright</option><option value="other">Autre</option>
              </select>
              <textarea placeholder="Détails..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows="4" />
            </div>
            <div className="modal-footer"><button className="btn-cancel" onClick={() => setShowReportModal(false)}>Annuler</button><button className="btn-submit" onClick={handleReportChannel}>Envoyer</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelProfile;
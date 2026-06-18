// pages/video/userVideo/UserVideoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilm, faBookmark, faHeart, faArrowLeft,
  faUserPlus, faCheck, faEnvelope, faShare,
  faEllipsisH, faSpinner, faUserCircle,
  faPlay, faUserCog, faCommentDots  // ✅ AÑADIDO: faCommentDots
} from '@fortawesome/free-solid-svg-icons';

import {
  getUserProfile, getUserVideos, getSavedVideos,
  getLikedVideos, setActiveTab, toggleFollow, clearUserVideoState
} from '../../../redux/actions/userVideoAction';

import LoadMoreBtn from '../../../components/LoadMoreBtn';
import './UserVideoPage.css';

/* ────────────────────────────────────────────
   LOADING
   ──────────────────────────────────────────── */
const LoadingSpinner = () => (
  <div className="user-video-loading">
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
    <p>Chargement...</p>
  </div>
);

/* ────────────────────────────────────────────
   AVATAR CON FALLBACK
   ──────────────────────────────────────────── */
const AvatarWithFallback = ({ src, alt, className, username }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    const colors = ['#fe2c55', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];
    const bg = colors[(username?.length || 0) % colors.length];
    return (
      <div
        className={className}
        style={{
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#fff',
        }}
      >
        {username ? username[0].toUpperCase() : <FontAwesomeIcon icon={faUserCircle} />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

/* ────────────────────────────────────────────
   MINI VIDEO CARD - SOLO ICONO PLAY CON VISTAS
   ──────────────────────────────────────────── */
const MiniVideoCard = ({ video, onClick, isOwnProfile, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fmt = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    if (onSave) await onSave(video._id);
    setIsSaved(s => !s);
    setSaving(false);
  };

  return (
    <div className="uv-mini-video-card" onClick={() => onClick(video._id)}>
      <div className="uv-mini-thumbnail-container">
        <img
          src={video.thumbnail || video.videoUrl?.replace(/\.mp4$/, '.jpg') || '/default-video.jpg'}
          alt={video.title}
          className="uv-mini-thumbnail"
          loading="lazy"
        />

        {/* OVERLAY SOLO CON PLAY Y VISTAS */}
        <div className="uv-mini-overlay">
          <div className="uv-mini-stats">
            <span className="uv-stat-play">
              <FontAwesomeIcon icon={faPlay} className="uv-stat-icon" />
              {fmt(video.views)}
            </span>
          </div>
        </div>

        {/* BOTÓN GUARDAR SOLO SI NO ES PERFIL PROPIO */}
        {!isOwnProfile && (
          <button
            className={`uv-mini-save-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faBookmark} spin={saving} />
          </button>
        )}

        {/* DURACIÓN DEL VIDEO */}
        {video.duration > 0 && (
          <div className="uv-mini-duration">
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* TÍTULO DEL VIDEO */}
      <p className="uv-mini-title">{video.title?.substring(0, 40)}</p>
    </div>
  );
};

/* ────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ──────────────────────────────────────────── */
const UserVideoPage = () => {
  const { userId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth, userVideo } = useSelector(state => state);
  const { profile, videos, savedVideos, likedVideos, activeTab, loading } = userVideo;

  const [userVideosPage, setUserVideosPage] = useState(1);
  const [savedVideosPage, setSavedVideosPage] = useState(1);
  const [likedVideosPage, setLikedVideosPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isOwnProfile = auth.user?._id === userId;

  const fmt = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  };

  /* carga inicial */
  useEffect(() => {
    if (auth.token) {
      dispatch(getUserProfile(userId, auth.token));
      dispatch(getUserVideos(userId, 1, auth.token, isOwnProfile));
    }
    return () => dispatch(clearUserVideoState());
  }, [userId, auth.token, isOwnProfile, dispatch]);

  /* cambio de tab */
  const handleTabChange = useCallback(async (tab) => {
    dispatch(setActiveTab(tab));
    if (tab === 'saved' && savedVideos.length === 0 && auth.token) {
      await dispatch(getSavedVideos(userId, 1, auth.token));
    } else if (tab === 'liked' && likedVideos.length === 0 && auth.token) {
      await dispatch(getLikedVideos(userId, 1, auth.token));
    }
  }, [userId, auth.token, savedVideos.length, likedVideos.length, dispatch]);

  /* load more */
  const loadMoreVideos = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = userVideosPage + 1;
    await dispatch(getUserVideos(userId, next, auth.token, isOwnProfile));
    setUserVideosPage(next);
    setLoadingMore(false);
  }, [userVideosPage, userId, auth.token, isOwnProfile, loadingMore, dispatch]);

  const loadMoreSaved = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = savedVideosPage + 1;
    await dispatch(getSavedVideos(userId, next, auth.token));
    setSavedVideosPage(next);
    setLoadingMore(false);
  }, [savedVideosPage, userId, auth.token, loadingMore, dispatch]);

  const loadMoreLiked = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const next = likedVideosPage + 1;
    await dispatch(getLikedVideos(userId, next, auth.token));
    setLikedVideosPage(next);
    setLoadingMore(false);
  }, [likedVideosPage, userId, auth.token, loadingMore, dispatch]);

  const handleFollow = useCallback(async () => {
    if (!auth.token) { history.push('/login'); return; }
    await dispatch(toggleFollow(userId, auth.token));
  }, [userId, auth.token, history, dispatch]);

 // En UserVideoPage.jsx - El icono de conversaciones (solo dueño del perfil)
const handleViewConversations = useCallback(() => {
  history.push('/message');  // ✅ Va a la lista de conversaciones, NO al chat directo
}, [history]);

// El botón de mensaje (visitantes) sí va a /message/:userId
const handleMessage = useCallback(() => {
  if (!auth.token) {
    history.push('/login');
    return;
  }
  history.push(`/message/${userId}`); // ✅ Chat directo con este usuario
}, [userId, auth.token, history]);

  // ✅ NUEVA FUNCIÓN: Ver todas las conversaciones (solo para dueño del perfil)
 
  const handleShareProfile = useCallback(() => {
    const url = `${window.location.origin}/video/userVideo/${userId}`;
    if (navigator.share) {
      navigator.share({ title: `Profil de ${profile?.username}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [profile?.username, userId]);

  const handleVideoClick = (videoId) => {
    sessionStorage.setItem('returnToProfile', 'true');
    sessionStorage.setItem('profileScrollPosition', window.scrollY.toString());
    history.push(`/video/userFeed/${userId}?startVideo=${videoId}`);
  };

  /* Manejar el menú de perfil (para el dueño) */
  const handleEditProfile = () => {
    setShowProfileMenu(false);
    history.push('/settings/profile');
  };

  const handleViewRealProfile = () => {
    setShowProfileMenu(false);
    history.push(`/profile/${userId}`);
  };

  /* helpers tabs */
  const getCurrentVideos = () => activeTab === 'saved' ? savedVideos : activeTab === 'liked' ? likedVideos : videos;
  const getCurrentHasMore = () => activeTab === 'saved' ? userVideo.savedVideosHasMore : activeTab === 'liked' ? userVideo.likedVideosHasMore : userVideo.userVideosHasMore;
  const getCurrentTotal = () => activeTab === 'saved' ? userVideo.savedVideosTotal : activeTab === 'liked' ? userVideo.likedVideosTotal : userVideo.userVideosTotal;
  const loadMoreFn = () => activeTab === 'saved' ? loadMoreSaved() : activeTab === 'liked' ? loadMoreLiked() : loadMoreVideos();

  /* ── RENDER ── */
  if (loading && !profile) return <LoadingSpinner />;

  if (!profile) return (
    <div className="user-video-error">
      <h2>Utilisateur non trouvé</h2>
      <button onClick={() => history.push('/')}>Retour à l'accueil</button>
    </div>
  );

  return (
    <div className="user-video-page">

      {/* ── HEADER ── */}
      <div className="uv-header">
        <button className="uv-back-btn" onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h2 className="uv-header-title">@{profile.username}</h2>

        <div className="uv-header-actions">
          {/* ✅ NUEVO: Icono de Conversaciones - SOLO para el dueño del perfil */}
          {isOwnProfile && (
            <button className="uv-conversations-btn" onClick={handleViewConversations}>
              <FontAwesomeIcon icon={faCommentDots} />
            </button>
          )}
          
          <button className="uv-share-btn" onClick={handleShareProfile}>
            <FontAwesomeIcon icon={faShare} />
          </button>
        </div>
      </div>

      {/* ── AVATAR (SIN ICONO DE CÁMARA) ── */}
      <div className="uv-avatar-container">
        <AvatarWithFallback
          src={profile.avatar}
          alt={profile.username}
          username={profile.username}
          className="uv-avatar"
        />
      </div>

      {/* ── BOTÓN DE 3 PUNTOS PARA EL DUEÑO DEL PERFIL ── */}
      {isOwnProfile && (
        <div className="uv-three-dots-wrapper">
          <button 
            className="uv-three-dots-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
          
          {showProfileMenu && (
            <div className="uv-profile-menu">
              <button onClick={handleEditProfile}>
                <FontAwesomeIcon icon={faUserCog} />
                <span>Editar perfil</span>
              </button>
              <button onClick={handleViewRealProfile}>
                <FontAwesomeIcon icon={faUserCircle} />
                <span>Ver perfil real</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── USERNAME ── */}
      <h2 className="uv-username">@{profile.username}</h2>

      {/* ── BIO ── */}
      {profile.bio && <p className="uv-bio">{profile.bio}</p>}

      {/* ── STATS ── */}
      <div className="uv-stats-row">
        <div
          className="uv-stat uv-stat-clickable"
          onClick={() => history.push(`/video/userVideo/${userId}/info?tab=videos`)}
        >
          <div className="uv-stat-number">{fmt(profile.videoStats?.totalVideos || 0)}</div>
          <div className="uv-stat-label">Vidéos</div>
        </div>

        <div
          className="uv-stat uv-stat-clickable"
          onClick={() => history.push(`/video/userVideo/${userId}/info?tab=followers`)}
        >
          <div className="uv-stat-number">{fmt(profile.followersCount || 0)}</div>
          <div className="uv-stat-label">Abonnés</div>
        </div>

        <div
          className="uv-stat uv-stat-clickable"
          onClick={() => history.push(`/video/userVideo/${userId}/info?tab=following`)}
        >
          <div className="uv-stat-number">{fmt(profile.followingCount || 0)}</div>
          <div className="uv-stat-label">Abonnements</div>
        </div>
      </div>

      {/* ── BOTONES ACCIÓN (SOLO SI NO ES PERFIL PROPIO) ── */}
      {!isOwnProfile && (
        <div className="uv-action-buttons">
          <button
            className={`uv-follow-btn ${profile.isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
          >
            <FontAwesomeIcon icon={profile.isFollowing ? faCheck : faUserPlus} />
            <span>{profile.isFollowing ? 'Suivi' : 'Suivre'}</span>
          </button>

          <button className="uv-message-btn" onClick={handleMessage}>
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Message</span>
          </button>

          <button className="uv-more-btn">
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
        </div>
      )}

      <div className="uv-separator" />

      {/* ── TABS ── */}
      <div className="uv-tabs">
        <button
          className={`uv-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => handleTabChange('videos')}
        >
          <FontAwesomeIcon icon={faFilm} />
          <span>Vidéos</span>
          {userVideo.userVideosTotal > 0 && (
            <span className="uv-tab-count">{fmt(userVideo.userVideosTotal)}</span>
          )}
        </button>

        <button
          className={`uv-tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => handleTabChange('saved')}
        >
          <FontAwesomeIcon icon={faBookmark} />
          <span>Favoris</span>
          {userVideo.savedVideosTotal > 0 && (
            <span className="uv-tab-count">{fmt(userVideo.savedVideosTotal)}</span>
          )}
        </button>

        <button
          className={`uv-tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => handleTabChange('liked')}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>J'aime</span>
          {userVideo.likedVideosTotal > 0 && (
            <span className="uv-tab-count">{fmt(userVideo.likedVideosTotal)}</span>
          )}
        </button>
      </div>

      {/* ── GRID DE VIDEOS (CON MENOS ALTURA) ── */}
      <div className="uv-videos-grid">
        {getCurrentVideos().map(video => (
          <MiniVideoCard
            key={video._id}
            video={video}
            onClick={handleVideoClick}
            isOwnProfile={isOwnProfile}
          />
        ))}
      </div>

      {/* ── EMPTY STATE ── */}
      {getCurrentVideos().length === 0 && !loading && (
        <div className="uv-empty-state">
          <div className="uv-empty-icon-container">
            <FontAwesomeIcon
              icon={activeTab === 'videos' ? faFilm : activeTab === 'saved' ? faBookmark : faHeart}
              className="uv-empty-icon"
            />
          </div>
          <h3 className="uv-empty-title">
            {activeTab === 'videos' ? 'Aucune vidéo' : activeTab === 'saved' ? 'Aucun favori' : 'Aucun "j\'aime"'}
          </h3>
          <p className="uv-empty-description">
            {activeTab === 'videos' && isOwnProfile
              ? 'Commencez à partager vos premières vidéos !'
              : activeTab === 'videos'
                ? "Cet utilisateur n'a pas encore publié de vidéos."
                : activeTab === 'saved'
                  ? 'Les vidéos que vous sauvegardez apparaîtront ici.'
                  : 'Les vidéos que vous aimez apparaîtront ici.'}
          </p>
          {activeTab === 'videos' && isOwnProfile && (
            <button className="uv-upload-btn" onClick={() => history.push('/upload-video')}>
              <FontAwesomeIcon icon={faFilm} />
              Publier une vidéo
            </button>
          )}
        </div>
      )}

      {/* ── LOAD MORE ── */}
      {getCurrentHasMore() && getCurrentVideos().length > 0 && (
        <LoadMoreBtn loading={loadingMore} loadMore={loadMoreFn} />
      )}

    </div>
  );
};

export default UserVideoPage;
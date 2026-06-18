// pages/video/userVideo/InfoUserVideo.jsx - VERSIÓN MEJORADA CON ICONOS CORRECTOS
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserGroup,        // ✅ Icono para seguidores (grupo de usuarios)
  faUserCheck,        // ✅ Icono para seguido (check)
  faArrowLeft,
  faEye,
  faCircle,
  faComment,
  faUserPlus,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getDataAPI, patchDataAPI } from '../../../utils/fetchData';
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AvatarWithFallback from '../message/AvatarWithFallback';
import './InfoUserVideo.css';
import HeaderVideo from '../../HeaderVideo';

const InfoUserVideo = () => {
  const { userId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth, socket } = useSelector(state => state);
  
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profileViews, setProfileViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingViews, setLoadingViews] = useState(false);
  const [loadingFollowAction, setLoadingFollowAction] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    profileViewsCount: 0
  });

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Cargando perfil para userId:', userId);
        const res = await getDataAPI(`user/${userId}/profile`, auth.token);
        console.log('📊 Respuesta perfil:', res.data);
        
        setProfile(res.data.profile);
        setStats({
          followersCount: res.data.profile.followersCount || 0,
          followingCount: res.data.profile.followingCount || 0,
          profileViewsCount: res.data.profile.profileViewsCount || 0
        });
      } catch (err) {
        console.error('❌ Error loading profile:', err);
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { error: err.response?.data?.message || 'Error al cargar perfil' }
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.token) {
      loadProfileData();
    }
  }, [userId, auth.token, dispatch]);

  // Cargar followers
  useEffect(() => {
    const loadFollowers = async () => {
      if (activeTab === 'followers') {
        try {
          setLoadingFollowers(true);
          console.log('🔍 Cargando followers para userId:', userId);
          const res = await getDataAPI(`user/${userId}/followers`, auth.token);
          console.log('📊 Respuesta followers:', res.data);
          setFollowers(res.data.users || []);
        } catch (err) {
          console.error('❌ Error loading followers:', err);
        } finally {
          setLoadingFollowers(false);
        }
      }
    };
    loadFollowers();
  }, [activeTab, userId, auth.token]);

  // Cargar following
  useEffect(() => {
    const loadFollowing = async () => {
      if (activeTab === 'following') {
        try {
          setLoadingFollowing(true);
          console.log('🔍 Cargando following para userId:', userId);
          const res = await getDataAPI(`user/${userId}/following`, auth.token);
          console.log('📊 Respuesta following:', res.data);
          setFollowing(res.data.users || []);
        } catch (err) {
          console.error('❌ Error loading following:', err);
        } finally {
          setLoadingFollowing(false);
        }
      }
    };
    loadFollowing();
  }, [activeTab, userId, auth.token]);

  // Cargar vistas del perfil
  useEffect(() => {
    const loadProfileViews = async () => {
      const canView = auth.user?._id === userId || auth.user?.role === 'admin';
      if (activeTab === 'views' && canView) {
        try {
          setLoadingViews(true);
          console.log('🔍 Cargando profile-views para userId:', userId);
          const res = await getDataAPI(`user/${userId}/profile-views`, auth.token);
          console.log('📊 Respuesta profile-views:', res.data);
          setProfileViews(res.data.views || []);
        } catch (err) {
          console.error('❌ Error loading profile views:', err);
        } finally {
          setLoadingViews(false);
        }
      }
    };
    loadProfileViews();
  }, [activeTab, userId, auth.token]);

  // ✅ Función follow/unfollow mejorada con PATCH
  const handleFollow = useCallback(async (targetUserId, isCurrentlyFollowing) => {
    if (!auth.token) {
      history.push('/login');
      return;
    }
    
    if (loadingFollowAction) return;
    setLoadingFollowAction(true);
    
    try {
      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      const res = await patchDataAPI(`user/${targetUserId}/${endpoint}`, {}, auth.token);
      console.log('📊 Follow response:', res.data);
      
      // Actualizar listas locales
      const updateUserList = (list) => list.map(user => 
        user._id === targetUserId 
          ? { ...user, isFollowing: !isCurrentlyFollowing }
          : user
      );
      
      if (activeTab === 'followers') {
        setFollowers(prev => updateUserList(prev));
      }
      if (activeTab === 'following') {
        setFollowing(prev => updateUserList(prev));
      }
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        followersCount: isCurrentlyFollowing 
          ? prev.followersCount - 1 
          : prev.followersCount + 1
      }));
      
    } catch (err) {
      console.error('❌ Error following user:', err);
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response?.data?.message || 'Error al seguir usuario' }
      });
    } finally {
      setLoadingFollowAction(false);
    }
  }, [auth.token, history, activeTab, loadingFollowAction, dispatch]);

  const handleGoToProfile = (targetUserId) => {
    history.push(`/video/userVideo/${targetUserId}`);
  };

  const handleGoToMessage = (targetUserId, username) => {
    const user = {
      _id: targetUserId,
      username: username,
      avatar: profile?.avatar
    };
    dispatch({ 
      type: 'MESS_TYPES.ADD_USER', 
      payload: { ...user, text: '', media: [] } 
    });
    history.push(`/message/${targetUserId}`);
  };

  const isUserOnline = useCallback((userId) => {
    if (!socket || !socket.connected) return false;
    return false;
  }, [socket]);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <LoadingSpinner fullPage={true} text="Chargement..." />;
  }

  if (!profile) {
    return (
      <div className="info-user-error">
        <h2>Utilisateur non trouvé</h2>
        <button onClick={() => history.push('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  const isOwnProfile = auth.user?._id === userId;
  const canViewViews = isOwnProfile || auth.user?.role === 'admin';

  const renderLoading = () => (
    <div className="info-user-loading">
      <div className="loading-spinner-small"></div>
      <p>Chargement...</p>
    </div>
  );

  return (
    <div className="info-user-page">
      {/* Header */}
      <div className="info-user-header">
        <button className="info-user-back-btn" onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="info-user-title">
          {activeTab === 'followers' && `Abonnés (${stats.followersCount})`}
          {activeTab === 'following' && `Abonnements (${stats.followingCount})`}
          {activeTab === 'views' && `Vues du profil (${stats.profileViewsCount})`}
        </h1>
        <div className="info-user-placeholder" />
      </div>

      {/* Tabs con iconos mejorados */}
      <div className="info-user-tabs">
        <button
          className={`info-user-tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <FontAwesomeIcon icon={faUserGroup} /> {/* ✅ Icono de grupo para seguidores */}
          <span>Abonnés</span>
          <span className="info-user-tab-count">{stats.followersCount}</span>
        </button>
        
        <button
          className={`info-user-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          <FontAwesomeIcon icon={faUserCheck} /> {/* ✅ Icono check para seguidos */}
          <span>Abonnements</span>
          <span className="info-user-tab-count">{stats.followingCount}</span>
        </button>
        
        {canViewViews && (
          <button
            className={`info-user-tab ${activeTab === 'views' ? 'active' : ''}`}
            onClick={() => setActiveTab('views')}
          >
            <FontAwesomeIcon icon={faEye} />
            <span>Vues</span>
            <span className="info-user-tab-count">{stats.profileViewsCount}</span>
          </button>
        )}
      </div>

      {/* Lista de usuarios */}
      <div className="info-user-list">
        {activeTab === 'followers' && (
          loadingFollowers ? renderLoading() :
          followers.length === 0 ? (
            <div className="info-user-empty">
              <FontAwesomeIcon icon={faUserGroup} className="info-user-empty-icon" />
              <h3>Aucun abonné</h3>
              <p>Cet utilisateur n'a pas encore d'abonnés</p>
            </div>
          ) : (
            followers.map(user => (
              <UserListItem
                key={user._id}
                user={user}
                isOwnProfile={isOwnProfile}
                currentUserId={auth.user?._id}
                onFollow={handleFollow}
                onProfileClick={handleGoToProfile}
                onMessageClick={handleGoToMessage}
                isOnline={isUserOnline(user._id)}
                loadingFollow={loadingFollowAction}
              />
            ))
          )
        )}

        {activeTab === 'following' && (
          loadingFollowing ? renderLoading() :
          following.length === 0 ? (
            <div className="info-user-empty">
              <FontAwesomeIcon icon={faUserCheck} className="info-user-empty-icon" />
              <h3>Aucun abonnement</h3>
              <p>Cet utilisateur ne suit personne</p>
            </div>
          ) : (
            following.map(user => (
              <UserListItem
                key={user._id}
                user={user}
                isOwnProfile={isOwnProfile}
                currentUserId={auth.user?._id}
                onFollow={handleFollow}
                onProfileClick={handleGoToProfile}
                onMessageClick={handleGoToMessage}
                isOnline={isUserOnline(user._id)}
                loadingFollow={loadingFollowAction}
              />
            ))
          )
        )}

        {activeTab === 'views' && canViewViews && (
          loadingViews ? renderLoading() :
          profileViews.length === 0 ? (
            <div className="info-user-empty">
              <FontAwesomeIcon icon={faEye} className="info-user-empty-icon" />
              <h3>Aucune vue de profil</h3>
              <p>Les personnes qui consultent votre profil apparaîtront ici</p>
            </div>
          ) : (
            profileViews.map(view => (
              <UserListItem
                key={view._id}
                user={view}
                isOwnProfile={isOwnProfile}
                currentUserId={auth.user?._id}
                onFollow={handleFollow}
                onProfileClick={handleGoToProfile}
                onMessageClick={handleGoToMessage}
                isOnline={isUserOnline(view._id)}
                showTimestamp={true}
                timestamp={view.viewedAt}
                timeAgo={formatDate(view.viewedAt)}
                loadingFollow={loadingFollowAction}
              />
            ))
          )
        )}
      </div>
    </div>
  );
};

// Componente de item de usuario mejorado
const UserListItem = ({ 
  user, 
  isOwnProfile, 
  currentUserId, 
  onFollow, 
  onProfileClick, 
  onMessageClick, 
  isOnline, 
  showTimestamp = false, 
  timestamp, 
  timeAgo,
  loadingFollow 
}) => {
  const isFollowing = user.isFollowing || false;
  const isCurrentUser = currentUserId === user._id;

  return (
    <div className="info-user-item">
      <div className="info-user-item-avatar" onClick={() => onProfileClick(user._id)}>
        <AvatarWithFallback
          src={user.avatar}
          alt={user.username}
          username={user.username}
          className="info-user-avatar"
          size="medium"
        />
        {!showTimestamp && (
          <div className={`info-user-online-dot ${isOnline ? 'online' : 'offline'}`}>
            <FontAwesomeIcon icon={faCircle} />
          </div>
        )}
      </div>
      
      <div className="info-user-item-info" onClick={() => onProfileClick(user._id)}>
        <div className="info-user-item-name">
          <h4>@{user.username || 'Utilisateur'}</h4>
          {user.isPro && <span className="info-user-pro-badge">PRO</span>}
          {user.role === 'admin' && <span className="info-user-admin-badge">Admin</span>}
          {user.role === 'moderator' && <span className="info-user-moderator-badge">Modérateur</span>}
        </div>
        {user.bio && <p className="info-user-item-bio">{user.bio.substring(0, 60)}</p>}
        {showTimestamp && (
          <p className="info-user-item-time">
            <FontAwesomeIcon icon={faEye} style={{ fontSize: '10px', marginRight: '4px' }} />
            Vu {timeAgo || new Date(timestamp).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
      
      <div className="info-user-item-actions">
        {!isCurrentUser && !showTimestamp && (
          <>
            <button 
              className={`info-user-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={() => onFollow(user._id, isFollowing)}
              disabled={loadingFollow}
            >
              {loadingFollow ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={isFollowing ? faUserCheck : faUserPlus} />
              )}
              <span>{isFollowing ? 'Suivi' : 'Suivre'}</span>
            </button>
            
            <button 
              className="info-user-message-btn"
              onClick={() => onMessageClick(user._id, user.username)}
            >
              <FontAwesomeIcon icon={faComment} />
            </button>
          </>
        )}
        
        {isCurrentUser && (
          <span className="info-user-current-badge">Vous</span>
        )}
      </div>
      <HeaderVideo/>
    </div>
  );
};

export default InfoUserVideo;
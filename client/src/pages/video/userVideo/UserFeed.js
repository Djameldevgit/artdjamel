// pages/video/userFeed/[userId].js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { getDataAPI } from '../../../utils/fetchData';
 
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';
 
import './UserFeed.css';
import HeaderVideo from '../../HeaderVideo';
import Feed from '../Feed';

const LoadingSpinner = () => (
  <div className="user-feed-loading">
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
    <p>Chargement des vidéos...</p>
  </div>
);

const UserFeed = () => {
  const { userId } = useParams();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  
  const queryParams = new URLSearchParams(location.search);
  const startVideoId = queryParams.get('startVideo');
  
  // Cargar TODOS los videos del usuario
  const loadUserVideos = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const token = auth.token;
      if (!token) {
        history.push('/login');
        return;
      }
      
      const res = await getDataAPI(`users/${userId}/videos?page=${pageNum}&limit=15`, token);
      
      if (res.data.success) {
        const newVideos = res.data.videos;
        
        if (append) {
          setVideos(prev => [...prev, ...newVideos]);
        } else {
          setVideos(newVideos);
        }
        
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error loading user videos:', err);
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Erreur lors du chargement des vidéos' }
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, auth.token, history, dispatch]);
  
  // Cargar información del usuario
  const loadUserInfo = useCallback(async () => {
    try {
      const token = auth.token;
      if (!token) return;
      
      const res = await getDataAPI(`user/${userId}/profile`, token);
      if (res.data.success) {
        setUserInfo(res.data.profile);
      }
    } catch (err) {
      console.error('Error loading user info:', err);
    }
  }, [userId, auth.token]);
  
  // Cargar datos iniciales
  useEffect(() => {
    if (userId && auth.token) {
      loadUserVideos(1, false);
      loadUserInfo();
    }
  }, [userId, auth.token]);
  
  // Cuando los videos se carguen, buscar el índice del video inicial
  useEffect(() => {
    if (videos.length > 0 && startVideoId) {
      const index = videos.findIndex(v => v._id === startVideoId);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
        setTimeout(() => {
          if (containerRef.current) {
            const scrollPosition = index * window.innerHeight;
            containerRef.current.scrollTo({ top: scrollPosition, behavior: 'instant' });
          }
        }, 100);
      }
    }
  }, [videos, startVideoId]);
  
  // Manejar evento de scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / window.innerHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      isScrollingRef.current = true;
      setCurrentIndex(newIndex);
      
      if (newIndex >= videos.length - 3 && hasMore && !loadingMore) {
        loadUserVideos(page + 1, true);
      }
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, [currentIndex, videos.length, hasMore, loadingMore, page, loadUserVideos]);
  
  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          setCurrentIndex(newIndex);
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: newIndex * window.innerHeight, behavior: 'smooth' });
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < videos.length - 1) {
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: newIndex * window.innerHeight, behavior: 'smooth' });
          }
        } else if (currentIndex >= videos.length - 3 && hasMore && !loadingMore) {
          loadUserVideos(page + 1, true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, hasMore, loadingMore, page, loadUserVideos]);
  
  // FUNCIÓN DE RETROCESO - Vuelve al perfil del usuario
  const goBackToProfile = () => {
    history.push(`/video/userVideo/${userId}`);
  };
  
  if (loading && videos.length === 0) {
    return <LoadingSpinner />;
  }
  
  if (videos.length === 0 && !loading) {
    return (
      <div className="user-feed-empty">
        <div className="empty-content">
          <div className="empty-icon">📹</div>
          <h2>Aucune vidéo</h2>
          <p>{userInfo?.username || 'Cet utilisateur'} n'a pas encore publié de vidéos.</p>
          <button className="back-to-profile-btn" onClick={goBackToProfile}>
            Voir le profil
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="user-feed-container">
      {/* Header flotante con flecha de retroceso */}
      <div className="user-feed-header">
        <button className="back-btn" onClick={goBackToProfile}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        
        <div className="user-info-header" onClick={goBackToProfile}>
          <img 
          src={userInfo?.avatar || '/default-avatar.png'}     alt={userInfo?.username}
            className="user-avatar-header"
          />
          <span className="username-header">@{userInfo?.username}</span>
        </div>
        
        <div className="header-placeholder" />
      </div>
      
      {/* Contenedor de videos con scroll */}
      <div 
        ref={containerRef}
        className="user-feed-videos-container"
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <div
            key={video._id}
            className="user-feed-video-wrapper"
          >
            <Feed
              video={video}
              isActive={index === currentIndex}
              isUserFeed={true}
              onVisibilityChange={() => {}}
              onVideoDeleted={() => {
                setVideos(prev => prev.filter(v => v._id !== video._id));
              }}
              onNextVideo={() => {
                if (index < videos.length - 1) {
                  const newIndex = index + 1;
                  setCurrentIndex(newIndex);
                  if (containerRef.current) {
                    containerRef.current.scrollTo({ top: newIndex * window.innerHeight, behavior: 'smooth' });
                  }
                }
              }}
              onPreviousVideo={() => {
                if (index > 0) {
                  const newIndex = index - 1;
                  setCurrentIndex(newIndex);
                  if (containerRef.current) {
                    containerRef.current.scrollTo({ top: newIndex * window.innerHeight, behavior: 'smooth' });
                  }
                }
              }}
              hasNext={index < videos.length - 1}
              hasPrev={index > 0}
            />
          </div>
        ))}
      </div>
      <HeaderVideo/> 
      {/* Indicador de carga */}
      {loadingMore && (
        <div className="loading-more-indicator">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Chargement...</span>
        </div>
      )}
    </div>
  );
};

export default UserFeed;
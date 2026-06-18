import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';

import { getDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import Feed from '../video/Feed';
 
import './ChannelFeed.css';  
import HeaderVideo from '../HeaderVideo';

const LoadingSpinner = () => (
  <div className="channel-feed-loading">
    <div className="loading-spinner">
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
    <p>Chargement des vidéos du canal...</p>
  </div>
);

const ChannelFeed = () => {
  const { channelId } = useParams();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [channelInfo, setChannelInfo] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  
  const queryParams = new URLSearchParams(location.search);
  const startVideoId = queryParams.get('startVideo');
  
  // ========== Cargar videos del canal ==========
  const loadChannelVideos = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const token = auth.token; // puede ser null (ruta pública)
      const url = `channels/${channelId}/videos?page=${pageNum}&limit=15`;
      const res = await getDataAPI(url, token);
      
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
      console.error('Error loading channel videos:', err);
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Erreur lors du chargement des vidéos du canal' }
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [channelId, auth.token, dispatch]);
  
  // ========== Cargar información del canal (para el header) ==========
  const loadChannelInfo = useCallback(async () => {
    try {
      const token = auth.token;
      const res = await getDataAPI(`channels/${channelId}`, token);
      if (res.data.success || res.data.profile) {
        const data = res.data.profile || res.data.channel;
        setChannelInfo(data);
      }
    } catch (err) {
      console.error('Error loading channel info:', err);
    }
  }, [channelId, auth.token]);
  
  // Cargar datos iniciales
  useEffect(() => {
    if (channelId) {
      loadChannelVideos(1, false);
      loadChannelInfo();
    }
  }, [channelId]);
  
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
  
  // ========== Manejar scroll vertical (efecto TikTok) ==========
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const newIndex = Math.round(scrollTop / window.innerHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      isScrollingRef.current = true;
      setCurrentIndex(newIndex);
      
      // Cargar más cuando falten 3 videos para el final
      if (newIndex >= videos.length - 3 && hasMore && !loadingMore) {
        loadChannelVideos(page + 1, true);
      }
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, [currentIndex, videos.length, hasMore, loadingMore, page, loadChannelVideos]);
  
  // Navegación por teclado (flechas arriba/abajo)
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
          loadChannelVideos(page + 1, true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, hasMore, loadingMore, page, loadChannelVideos]);
  
  // Volver al perfil del canal
  const goBackToChannel = () => {
    history.push(`/channel/${channelId}`);
  };
  
  if (loading && videos.length === 0) {
    return <LoadingSpinner />;
  }
  
  if (videos.length === 0 && !loading) {
    return (
      <div className="channel-feed-empty">
        <div className="empty-content">
          <div className="empty-icon">📹</div>
          <h2>Aucune vidéo</h2>
          <p>Ce canal n'a pas encore publié de vidéos.</p>
          <button className="back-to-channel-btn" onClick={goBackToChannel}>
            Voir le canal
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="channel-feed-container">
      {/* Header flotante con flecha de retroceso */}
      <div className="channel-feed-header">
        <button className="back-btn" onClick={goBackToChannel}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        
        <div className="channel-info-header" onClick={goBackToChannel}>
          <img 
            src={channelInfo?.avatar || '/default-avatar.png'}
            alt={channelInfo?.name}
            className="channel-avatar-header"
          />
          <span className="channel-name-header">{channelInfo?.name || 'Canal'}</span>
        </div>
        
        <div className="header-placeholder" />
      </div>
      
      {/* Contenedor de videos con scroll */}
      <div 
        ref={containerRef}
        className="channel-feed-videos-container"
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <div key={video._id} className="channel-feed-video-wrapper">
            <Feed
              video={video}
              isActive={index === currentIndex}
              isUserFeed={false}        // si tu Feed lo necesita
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
      
      {/* Indicador de carga de más videos */}
      {loadingMore && (
        <div className="loading-more-indicator">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Chargement...</span>
        </div>
      )}

      <HeaderVideo/>
    </div>
  );
};

export default ChannelFeed;
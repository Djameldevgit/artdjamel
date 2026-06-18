// pages/video/TrendingVideos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire,
  faHeart,
  faComment,
  faPlay,
  faEye,
  faClock,
  faArrowLeft,
  faTrophy,
  faMedal,
  faStar,
  faCalendarDay,
  faCalendarWeek,
  faSpinner,
  faChartLine,
  faUser,
  faShare
} from '@fortawesome/free-solid-svg-icons';
 import { getTrendingVideos } from '../../redux/actions/videoAction';
import './TrendingVideos.css';
import HeaderVideo from '../HeaderVideo';

 
// ============================================
// COMPONENTE DE LOADING
// ============================================
const LoadingSpinner = () => (
  <div className="trending-loading">
    <div className="trending-loading-spinner">
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
    <p>Chargement des tendances...</p>
  </div>
);

// ============================================
// COMPONENTE DE TARJETA DE VIDEO TRENDING
// ============================================
const TrendingVideoCard = ({ video, rank, onClick }) => {
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Obtener medalla según el ranking
  const getMedalIcon = () => {
    if (rank === 1) return faTrophy;
    if (rank === 2) return faMedal;
    if (rank === 3) return faStar;
    return null;
  };

  const getMedalColor = () => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#fe2c55';
  };

  // Calcular trending score basado en engagement del backend
  const trendingScore = video.engagementScore || 
    Math.min(((video.likes?.length || 0) + (video.comments?.length || 0)) / (video.views || 1) * 100, 100);

  const getScoreEmoji = () => {
    if (trendingScore >= 80) return '🚀';
    if (trendingScore >= 60) return '🔥';
    if (trendingScore >= 40) return '📈';
    return '👍';
  };

  return (
    <div className="trending-card" onClick={() => onClick(video._id)}>
      {/* Ranking con medalla */}
      <div className="trending-rank">
        {rank <= 3 ? (
          <FontAwesomeIcon 
            icon={getMedalIcon()} 
            style={{ color: getMedalColor() }}
            className="trending-medal"
          />
        ) : (
          <span className="trending-rank-number">#{rank}</span>
        )}
      </div>

      {/* Miniaturas del video */}
      <div className="trending-thumbnail-container">
        <img 
          src={video.thumbnail || 'https://via.placeholder.com/200x355?text=No+Image'} 
          alt={video.title}
          className="trending-thumbnail"
          loading="lazy"
        />
        
        {/* Overlay con estadísticas */}
        <div className="trending-overlay">
          <div className="trending-stats">
            <span className="trending-stat">
              <FontAwesomeIcon icon={faPlay} />
              {formatNumber(video.views || 0)}
            </span>
            <span className="trending-stat">
              <FontAwesomeIcon icon={faHeart} />
              {formatNumber(video.likes?.length || 0)}
            </span>
            <span className="trending-stat">
              <FontAwesomeIcon icon={faComment} />
              {formatNumber(video.comments?.length || 0)}
            </span>
          </div>
        </div>

        {/* Badge de trending score */}
        <div className="trending-score-badge">
          <FontAwesomeIcon icon={faFire} />
          <span>{Math.round(trendingScore)}</span>
        </div>

        {/* Duración */}
        {video.duration > 0 && (
          <div className="trending-duration">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Información del video */}
      <div className="trending-info">
        <h3 className="trending-title">{video.title}</h3>
        
        <div className="trending-user" onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/video/userVideo/${video.user?._id}`;
        }}>
          {video.user?.avatar ? (
            <img src={video.user.avatar} alt={video.user.username} className="trending-user-avatar" />
          ) : (
            <FontAwesomeIcon icon={faUser} className="trending-user-icon" />
          )}
          <span className="trending-username">@{video.user?.username}</span>
        </div>

        <div className="trending-meta">
          <span className="trending-meta-item">
            <FontAwesomeIcon icon={faEye} />
            {formatNumber(video.views)} vues
          </span>
          <span className="trending-meta-item">
            <FontAwesomeIcon icon={faClock} />
            {new Date(video.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>

        {/* Indicador de tendencia */}
        <div className="trending-trend-indicator">
          <span className="trending-emoji">{getScoreEmoji()}</span>
          <div className="trending-progress-bar">
            <div 
              className="trending-progress-fill"
              style={{ width: `${trendingScore}%` }}
            />
          </div>
          <span className="trending-percent">{Math.round(trendingScore)}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const TrendingVideos = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { trendingVideos = [], trendingLoading = false, trendingHasMore = false } = useSelector(state => state.video || {});
  const [timeWindow, setTimeWindow] = useState('week');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVideos, setAllVideos] = useState([]);

  // Cargar videos trending
  useEffect(() => {
    const loadTrending = async () => {
      setCurrentPage(1);
      await dispatch(getTrendingVideos(timeWindow, 1, 20));
    };
    loadTrending();
  }, [timeWindow, dispatch]);

  // Actualizar videos locales cuando cambian los trending
  useEffect(() => {
    if (trendingVideos) {
      setAllVideos(trendingVideos);
    }
  }, [trendingVideos]);

  // Cargar más videos
  const loadMore = useCallback(async () => {
    if (loadingMore || !trendingHasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    await dispatch(getTrendingVideos(timeWindow, nextPage, 20));
    setCurrentPage(nextPage);
    setLoadingMore(false);
  }, [trendingHasMore, currentPage, timeWindow, loadingMore, dispatch]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Navegar al video
  const handleVideoClick = (videoId) => {
    sessionStorage.setItem('returnToTrending', 'true');
    sessionStorage.setItem('trendingScrollPosition', window.scrollY.toString());
    history.push(`/video/${videoId}`);
  };

  // Volver atrás
  const handleGoBack = () => {
    history.goBack();
  };

  if (trendingLoading && allVideos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="trending-page">
      {/* Header */}
      <div className="trending-header">
        <button className="trending-back-btn" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        
        <div className="trending-title-section">
          <FontAwesomeIcon icon={faFire} className="trending-fire-icon" />
          <h1 className="trending-main-title">Tendances</h1>
        </div>

        <div className="trending-time-filter">
          <button
            className={`trending-time-btn ${timeWindow === 'day' ? 'active' : ''}`}
            onClick={() => setTimeWindow('day')}
          >
            <FontAwesomeIcon icon={faCalendarDay} />
            <span>Aujourd'hui</span>
          </button>
          <button
            className={`trending-time-btn ${timeWindow === 'week' ? 'active' : ''}`}
            onClick={() => setTimeWindow('week')}
          >
            <FontAwesomeIcon icon={faCalendarWeek} />
            <span>Cette semaine</span>
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="trending-stats-summary">
        <div className="trending-stat-card">
          <FontAwesomeIcon icon={faFire} className="trending-stat-icon" />
          <div className="trending-stat-info">
            <span className="trending-stat-value">{allVideos.length}</span>
            <span className="trending-stat-label">Vidéos tendances</span>
          </div>
        </div>
        <div className="trending-stat-card">
          <FontAwesomeIcon icon={faChartLine} className="trending-stat-icon" />
          <div className="trending-stat-info">
            <span className="trending-stat-value">
              {Math.round(allVideos.reduce((acc, v) => {
                const score = v.engagementScore || 
                  ((v.likes?.length || 0) + (v.comments?.length || 0)) / (v.views || 1) * 100;
                return acc + score;
              }, 0) / (allVideos.length || 1)) || 0}%
            </span>
            <span className="trending-stat-label">Score moyen</span>
          </div>
        </div>
      </div>

      {/* Grid de videos trending */}
      <div className="trending-grid">
        {allVideos.map((video, index) => (
          <TrendingVideoCard
            key={video._id}
            video={video}
            rank={index + 1}
            onClick={handleVideoClick}
          />
        ))}
      </div>

      {/* Loading más videos */}
      {loadingMore && (
        <div className="trending-loading-more">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Chargement...</span>
        </div>
      )}

      {/* Empty state */}
      {allVideos.length === 0 && !trendingLoading && (
        <div className="trending-empty">
          <FontAwesomeIcon icon={faFire} className="trending-empty-icon" />
          <h3>Aucune vidéo tendance</h3>
          <p>Revenez plus tard pour découvrir les vidéos populaires</p>
        </div>
      )}
      <div>
<HeaderVideo/>
      </div>
    </div>
  );
};

export default TrendingVideos;
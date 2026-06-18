// components/Video/VideoCard.jsx
import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { PlayFill, Heart, HeartFill, Eye, Clock, Share, Bookmark, BookmarkFill, InfoCircle } from 'react-bootstrap-icons';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { likeVideo } from '../../redux/actions/videoAction';
import moment from 'moment';
import 'moment/locale/fr';

// Data URL para placeholder (no requiere petición HTTP)
const DEFAULT_THUMBNAIL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%23333333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23ffffff" font-size="16"%3E🎬 Vidéo%3C/text%3E%3C/svg%3E';

const VideoCard = ({ video, showActions = true, onVideoClick }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const [liked, setLiked] = useState(video?.liked || false);
  const [likesCount, setLikesCount] = useState(video?.likes?.length || 0);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [imgError, setImgError] = useState(false);

  moment.locale('fr');

  // Determinar tipo de video y obtener thumbnail
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

  const handlePlay = () => {
    if (onVideoClick) {
      onVideoClick(video);
    } else {
      history.push(`/video/${video._id}`);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!auth.token) {
      history.push('/login');
      return;
    }
    
    const result = await dispatch(likeVideo(video._id, auth.token));
    if (result?.liked !== undefined) {
      setLiked(result.liked);
      setLikesCount(result.likes);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShare(!showShare);
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: `${window.location.origin}/video/${video._id}`
      });
    }
  };

  // ✅ NUEVA FUNCIÓN: Ver detalles del video comercial
  const handleViewDetails = (e) => {
    e.stopPropagation();
    // Guardar posición para volver al feed después
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    history.push(`/video/${video._id}`);
  };

  const copyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/video/${video._id}`);
    setShowShare(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Card className="video-card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }} onClick={handlePlay}>
      {/* Thumbnail con overlay de play */}
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
        
        <div className="play-overlay d-flex align-items-center justify-content-center">
          <div className="play-button">
            <PlayFill size={48} className="text-white" />
          </div>
        </div>
        
        {video.duration > 0 && (
          <Badge bg="dark" className="position-absolute bottom-0 end-0 m-2 opacity-75">
            <Clock size={12} className="me-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}
        
        <Badge bg="primary" className="position-absolute top-0 start-0 m-2">
          {video.videoType === 'youtube' ? 'YouTube' : video.videoType === 'vimeo' ? 'Vimeo' : 'Vidéo'}
        </Badge>
      </div>
      
      <Card.Body>
        <Card.Title className="fs-6 fw-bold mb-2" style={{ lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.title}
        </Card.Title>
        
        <Card.Text className="small text-muted mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.description || 'Aucune description'}
        </Card.Text>
        
        {/* Información del usuario */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <img
            src={video.user?.avatar || '/default-avatar.png'}
            alt={video.user?.username}
            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/default-avatar.png'; }}
          />
          <small className="text-muted">{video.user?.username || 'Utilisateur'}</small>
          <small className="text-muted">•</small>
          <small className="text-muted">{moment(video.createdAt).fromNow()}</small>
        </div>
        
        {/* Estadísticas y acciones */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="d-flex gap-3">
            <span className="small text-muted">
              <Eye size={14} className="me-1" /> {formatNumber(video.views)}
            </span>
            <span className="small text-muted" onClick={handleLike} style={{ cursor: 'pointer' }}>
              {liked ? <HeartFill size={14} className="me-1 text-danger" /> : <Heart size={14} className="me-1" />}
              {formatNumber(likesCount)}
            </span>
          </div>
          
          {showActions && (
            <div className="d-flex gap-2">
              {/* ✅ NUEVO BOTÓN DE DETALLES */}
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-muted" 
                onClick={handleViewDetails}
                title="Voir les détails"
              >
                <InfoCircle size={16} />
              </Button>
              
              <Button variant="link" size="sm" className="p-0 text-muted" onClick={handleSave}>
                {saved ? <BookmarkFill size={16} /> : <Bookmark size={16} />}
              </Button>
              <Button variant="link" size="sm" className="p-0 text-muted" onClick={handleShare}>
                <Share size={16} />
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
      
      {showShare && (
        <div className="position-absolute bg-white border rounded shadow-sm p-2" style={{ bottom: '60px', right: '10px', zIndex: 10 }}>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-primary" onClick={copyToClipboard}>
              Copier le lien
            </Button>
            <Button size="sm" variant="outline-success" href={`https://wa.me/?text=${encodeURIComponent(video.title)} ${window.location.origin}/video/${video._id}`} target="_blank">
              WhatsApp
            </Button>
          </div>
        </div>
      )}
      
      <style jsx="true">{`
        .video-card:hover .video-thumbnail {
          transform: scale(1.05);
        }
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
        .video-card:hover .play-overlay {
          opacity: 1;
        }
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
        .video-card:hover .play-button {
          transform: scale(1.1);
        }
      `}</style>
    </Card>
  );
};

export default VideoCard;
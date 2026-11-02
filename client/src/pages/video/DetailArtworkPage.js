// src/pages/video/DetailVideoPage.jsx
// 🔥 VERSIÓN CON RESERVA VISUAL

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';
import { ArrowLeft, VolumeUp, VolumeMute, Brush, Rulers, Tag, CartPlus, ZoomIn } from 'react-bootstrap-icons';
import { getVideoById, incrementVideoView, addToCart } from '../../redux/actions/videoAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import moment from 'moment';
import 'moment/locale/fr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import './DetailVideoPage.css';

moment.locale('fr');

const DetailVideoPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const { currentVideo: video, loading } = useSelector(state => state.video || {});

  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const hasRegisteredView = useRef(false);

  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  // ===============================
  // 🔥 NUEVO: Verificar estado de reserva
  // ===============================
  const isReservedByOther = useMemo(() => {
    if (!video?.reservedBy || !auth?.user?._id) return false;
    return video.reservedBy.toString() !== auth.user._id.toString();
  }, [video, auth?.user?._id]);

  const isReservedByMe = useMemo(() => {
    if (!video?.reservedBy || !auth?.user?._id) return false;
    return video.reservedBy.toString() === auth.user._id.toString();
  }, [video, auth?.user?._id]);

  // ===============================
  // ===== Cargar vídeo =====
  useEffect(() => {
    if (id) {
      dispatch(getVideoById(id, null));
    }
  }, [dispatch, id]);

  // ===== Scroll del header =====
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== Barra de progreso =====
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleTimeUpdate = () => {
      if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100);
    };
    vid.addEventListener('timeupdate', handleTimeUpdate);
    return () => vid.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // ===== Registrar vista SOLO UNA VEZ =====
  useEffect(() => {
    if (video && auth?.token && !hasRegisteredView.current) {
      hasRegisteredView.current = true;
      dispatch(incrementVideoView(video._id, auth.token));
    }
  }, [video, auth?.token, dispatch]);

  // ===== Handlers =====
  const handleGoBack = () => history.goBack();

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleAddToCart = () => {
    if (!auth.token) return history.push('/login');
    dispatch(addToCart(video, 1));
    dispatch({ type: GLOBALTYPES.ALERT, payload: { success: 'Ajouté au panier !' } });
  };

  // ===== MANEJAR SRC DE IMÁGENES (seguro) =====
  const getValidImageSrc = (src) => {
    if (!src || typeof src !== 'string') {
      return 'https://via.placeholder.com/400x300?text=Image+non+disponible';
    }
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      return 'https://via.placeholder.com/400x300?text=Image+non+disponible';
    }
    return src;
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
  };

  // ===== Estados de carga =====
  if (loading) {
    return (
      <div className="video-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="pending-video-container">
        <div className="pending-video-card">
          <h2 className="pending-title">Vidéo non trouvée</h2>
          <p className="pending-message">La vidéo que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button variant="primary" onClick={() => history.push('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className="video-detail-container">
      {/* Header */}
      <div className={`video-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="d-flex justify-content-between align-items-center">
          <Button variant="link" className="text-white p-0" onClick={handleGoBack}>
            <ArrowLeft size={24} />
          </Button>
          <h6 className="text-white mb-0">Détail de l'œuvre</h6>
          <div style={{ width: 24 }}></div>
        </div>
      </div>

      {/* Reproductor de vídeo */}
      <div className="video-player-container">
        <video
          ref={videoRef}
          src={video.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="video-player"
          poster={video.thumbnail}
          onClick={togglePlay}
        />
        <div ref={progressBarRef} className="video-progress-bar" onClick={handleProgressClick}>
          <div className="video-progress" style={{ width: `${progress}%` }}></div>
        </div>
        <button onClick={toggleMute} className="video-volume-control">
          {isMuted ? <VolumeMute size={20} /> : <VolumeUp size={20} />}
        </button>
      </div>

      {/* Slider de imágenes adicionales */}
      {video.images && video.images.length > 0 && (
        <div className="video-images-slider">
          <div className="slider-header">
            <h5 className="slider-title">📸 Détails de l'œuvre</h5>
            <small className="zoom-hint"><ZoomIn size={14} /> Appuyez deux fois pour zoomer</small>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Zoom]}
            navigation
            pagination={{ clickable: true }}
            zoom={{ maxRatio: 3, toggle: true }}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 }
            }}
            className="video-images-swiper"
          >
            {video.images.map((img, idx) => {
              let imgSrc = img;
              if (typeof img === 'object' && img !== null) {
                imgSrc = img.url || img.public_id || JSON.stringify(img);
              }
              const validSrc = getValidImageSrc(imgSrc);
              return (
                <SwiperSlide key={idx}>
                  <div className="swiper-zoom-container">
                    <img 
                      src={validSrc}
                      alt={`détail ${idx + 1}`}
                      className="img-fluid rounded shadow"
                      onError={handleImageError}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}

      {/* Información de la obra */}
      <div className="video-info-section">
        <h2 className="video-title">{video.title}</h2>
        <p className="video-description">{video.description}</p>

        <div className="video-details-list">
          <div className="detail-row">
            <div className="detail-label"><Brush size={18} className="detail-icon" /> Technique</div>
            <div className="detail-value">{video.technique}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><Brush size={18} className="detail-icon" /> Style</div>
            <div className="detail-value">{video.style}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><Rulers size={18} className="detail-icon" /> Dimensions (cm)</div>
            <div className="detail-value">{video.width} x {video.height}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label"><Tag size={18} className="detail-icon" /> Prix</div>
            <div className="detail-value price">{video.price.toLocaleString()} DA</div>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label"><Badge bg="info" className="me-2">📦</Badge> Stock</div>
          <div className="detail-value">{video.stock > 0 ? video.stock : 'Épuisé'}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label"><Badge bg="secondary" className="me-2">🏷️</Badge> Statut</div>
          <div className="detail-value">
            <Badge bg={video.status === 'en vente' ? 'success' : video.status === 'en exposition' ? 'warning' : 'danger'}>
              {video.status === 'en vente' ? 'En vente' : video.status === 'en exposition' ? 'En exposition' : 'Vendue'}
            </Badge>
          </div>
        </div>

        {/* 🔥 NUEVO: Fila de reserva */}
        <div className="detail-row">
          <div className="detail-label"><Badge bg="secondary" className="me-2">🔒</Badge> Réservation</div>
          <div className="detail-value">
            {isReservedByOther ? (
              <Badge bg="warning" text="dark">⏳ En cours de réservation par un autre utilisateur</Badge>
            ) : isReservedByMe ? (
              <Badge bg="info">📌 Réservée par vous</Badge>
            ) : (
              <Badge bg="success">Disponible</Badge>
            )}
          </div>
        </div>

        {/* 🔥 Botón de compra con estado de reserva */}
        <Button 
          variant="success" 
          className="video-buy-btn" 
          onClick={handleAddToCart}
          disabled={video.stock === 0 || video.status === 'vendue' || !auth.token || isReservedByOther}
        >
          {isReservedByOther ? (
            '⏳ Réservée'
          ) : video.stock === 0 || video.status === 'vendue' ? (
            'Indisponible'
          ) : (
            'Ajouter au panier'
          )}
        </Button>

        <div className="artist-info">
          <img 
            src={video.user?.avatar || 'https://via.placeholder.com/48?text=Artiste'} 
            alt={video.user?.username} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Artiste'; }}
          />
          <div>
            <strong>@{video.user?.username}</strong>
            <small>{video.user?.bio || "Artiste peintre"}</small>
          </div>
        </div>

        {video.tags?.length > 0 && (
          <div className="video-tags">
            {video.tags.map((tag, idx) => (
              <Badge key={idx} bg="secondary" className="me-1">#{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailVideoPage;
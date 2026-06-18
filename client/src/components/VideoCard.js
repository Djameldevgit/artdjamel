// components/VideoCard.jsx
import React from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

const VideoCard = ({ video }) => {
  const history = useHistory();

  const handleVideoClick = (e) => {
    e.stopPropagation();
    sessionStorage.setItem('returnToFeed', window.location.pathname);
    sessionStorage.setItem('scrollPosition', window.scrollY);
    history.push(`/video/${video._id}`);
  };

  const formatDate = (date) => {
    moment.locale('fr');
    const diff = moment().diff(moment(date), 'days');
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7) return `Il y a ${diff} jours`;
    return moment(date).format('DD/MM/YYYY');
  };

  const categoryName = video.category?.name || (video.category && typeof video.category === 'object' ? video.category.name : null);
  const price = video.price && video.price > 0 ? video.price : null;

  return (
    <div className="video-card-horizontal" onClick={handleVideoClick}>
      {/* Columna izquierda: miniatura */}
      <div className="video-thumbnail-col">
        <img
          src={video.thumbnail || '/video-placeholder.jpg'}
          alt={video.title}
          className="thumbnail-img"
          loading="lazy"
        />
        {video.duration > 0 && (
          <span className="duration-badge">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </span>
        )}
        {price && <span className="price-badge">{price} DA</span>}
      </div>

      {/* Columna derecha: información */}
      <div className="video-info-col">
        <h3 className="video-title">{video.title || 'Sin título'}</h3>
        {categoryName && <div className="video-category">{categoryName}</div>}
        {price && <div className="video-price">{price} DA</div>}
        <div className="video-date">{formatDate(video.createdAt)}</div>
      </div>

      {/* Estilos internos */}
      <style>{`
        .video-card-horizontal {
          display: flex;
          gap: 12px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 12px;
          border: 1px solid #e0e0e0;
        }
        .video-card-horizontal:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        /* Columna miniatura */
        .video-thumbnail-col {
          position: relative;
          flex: 0 0 160px;
          aspect-ratio: 16 / 9;
          background: #000;
        }
        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .duration-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 11px;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        .price-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: #4caf50;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 12px;
        }
        /* Columna información */
        .video-info-col {
          flex: 1;
          padding: 8px 12px 8px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .video-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #212529;
        }
        .video-category {
          font-size: 0.8rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .video-price {
          font-size: 0.9rem;
          font-weight: 700;
          color: #2c7da0;
        }
        .video-date {
          font-size: 0.7rem;
          color: #adb5bd;
        }
        /* Responsive: en móviles la miniatura se reduce un poco */
        @media (max-width: 576px) {
          .video-thumbnail-col {
            flex-basis: 120px;
          }
          .video-title {
            font-size: 0.85rem;
          }
          .video-category, .video-price {
            font-size: 0.7rem;
          }
          .video-date {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCard;
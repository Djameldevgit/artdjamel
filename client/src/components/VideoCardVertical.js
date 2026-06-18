// components/VideoCardVertical.jsx
// 🔥 NIVEL DIOS - SOLO 1 AUTOPLAY REAL EN GRID ANDROID / PC
// Sistema:
// ✅ solo un reel reproduce en toda la pantalla
// ✅ el más cercano al centro viewport gana
// ✅ scroll ultra fluido
// ✅ ideal marketplace VideoCommerce

import React, { useState, useEffect, useRef, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { VolumeMute, VolumeUp } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import './VideoCardVertical.css';

// ===============================
// 🔥 MANAGER GLOBAL
// ===============================
const registry = new Map();
let currentWinner = null;
let ticking = false;

function updateWinner() {
  const centerY = window.innerHeight / 2;

  let bestId = null;
  let bestDistance = Infinity;

  registry.forEach((item, id) => {
    const rect = item.element.getBoundingClientRect();

    // ignorar fuera de pantalla
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const cardCenter = rect.top + rect.height / 2;
    const distance = Math.abs(centerY - cardCenter);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = id;
    }
  });

  if (bestId !== currentWinner) {
    currentWinner = bestId;

    registry.forEach((item, id) => {
      item.setWinner(id === currentWinner);
    });
  }
}

function requestWinnerUpdate() {
  if (ticking) return;

  ticking = true;

  requestAnimationFrame(() => {
    updateWinner();
    ticking = false;
  });
}

// ===============================
// COMPONENTE
// ===============================
const VideoCardVertical = ({ video }) => {
  const history = useHistory();

  const { videoPlaybackMode = 'live' } = useSelector(
    state => state.videoMode || { videoPlaybackMode: 'live' }
  );

  const isLiveMode = videoPlaybackMode === 'live';

  const [isWinner, setIsWinner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const idRef = useRef(video._id);

  // ===============================
  // REGISTRO GLOBAL
  // ===============================
  useEffect(() => {
    if (!isLiveMode) return;

    const element = containerRef.current;
    if (!element) return;

    registry.set(idRef.current, {
      element,
      setWinner: setIsWinner
    });

    requestWinnerUpdate();

    window.addEventListener('scroll', requestWinnerUpdate, {
      passive: true
    });

    window.addEventListener('resize', requestWinnerUpdate);

    return () => {
      registry.delete(idRef.current);

      window.removeEventListener(
        'scroll',
        requestWinnerUpdate
      );

      window.removeEventListener(
        'resize',
        requestWinnerUpdate
      );
    };
  }, [isLiveMode]);

  // ===============================
  // CONTROL PLAYBACK
  // ===============================
  useEffect(() => {
    if (!isLiveMode) return;

    const player = videoRef.current;
    if (!player) return;

    if (isWinner) {
      player.muted = isMuted;

      player.play().catch(() => {});
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [isWinner, isMuted, isLiveMode]);

  // ===============================
  // AUDIO
  // ===============================
  const toggleMute = e => {
    e.stopPropagation();

    const player = videoRef.current;
    if (!player) return;

    const next = !isMuted;

    player.muted = next;
    setIsMuted(next);
  };

  // ===============================
  // NAV
  // ===============================
  const handleClick = () => {
    sessionStorage.setItem(
      'returnToFeed',
      window.location.pathname
    );

    sessionStorage.setItem(
      'scrollPosition',
      window.scrollY
    );

    const categorySlug = video.category?.slug;

    if (categorySlug) {
      history.push(`/${categorySlug}/1`);
    } else {
      history.push(`/video/${video._id}`);
    }
  };

  const goToChannel = e => {
    e.stopPropagation();

    if (video.channel?._id) {
      history.push(`/channel/${video.channel._id}`);
    }
  };

  const formatPrice = price => {
    if (!price || price === 0) return null;

    return (
      new Intl.NumberFormat('fr-DZ').format(price) +
      ' DA'
    );
  };

  const channelName =
    video.channel?.name ||
    video.nom_entreprise ||
    'Tienda';

  // ===============================
  // STATIC MODE
  // ===============================
  if (!isLiveMode) {
    return (
      <div
        className="video-card-vertical static-mode"
        onClick={handleClick}
      >
        <div className="video-thumbnail-wrapper">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="thumbnail-img"
          />

          <div className="info-overlay">
            <div
              className="channel-info"
              onClick={goToChannel}
            >
              <div className="business-name">
                {channelName}
              </div>
            </div>

            <div className="video-title">
              {video.title}
            </div>

            {formatPrice(video.price) && (
              <div className="price">
                {formatPrice(video.price)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // LIVE MODE
  // ===============================
  return (
    <div
      ref={containerRef}
      className="video-card-vertical live-mode"
      onClick={handleClick}
    >
      <div className="video-thumbnail-wrapper">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          muted={isMuted}
          preload="metadata"
          playsInline
          className="video-element"
          style={{
            opacity: isWinner ? 1 : 0
          }}
        />

        <img
          src={video.thumbnail}
          alt={video.title}
          className="thumbnail-img"
          style={{
            opacity: isWinner ? 0 : 1
          }}
        />

        {isWinner && (
          <button
            className="volume-btn"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeMute size={18} />
            ) : (
              <VolumeUp size={18} />
            )}
          </button>
        )}

        <div className="info-overlay">
          <div
            className="channel-info"
            onClick={goToChannel}
          >
            <div className="business-name">
              {channelName}
            </div>
          </div>

          <div className="video-title">
            {video.title}
          </div>

          {formatPrice(video.price) && (
            <div className="price">
              {formatPrice(video.price)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(VideoCardVertical);
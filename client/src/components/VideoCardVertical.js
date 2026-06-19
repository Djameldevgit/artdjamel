// components/VideoCardVertical.jsx
// 🔥 VERSIÓN COMPLETA Y FINAL

import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { VolumeMute, VolumeUp, Heart, HeartFill, CartPlus, CartCheck } from 'react-bootstrap-icons';
import { GLOBALTYPES } from '../redux/actions/globalTypes';
import { likeVideo } from '../redux/actions/videoAction';
import { addToCart } from '../redux/actions/cartAction';
import './VideoCardVertical.css';

// ===============================
// 🔥 MANAGER GLOBAL (autoplay)
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
  const dispatch = useDispatch();

  // Redux
  const auth = useSelector(state => state.auth) || { user: null, token: null };
  const cart = useSelector(state => state.cart) || { items: [] };
  const { videoPlaybackMode = 'live' } = useSelector(
    state => state.videoMode || { videoPlaybackMode: 'live' }
  );

  const isLiveMode = videoPlaybackMode === 'live';

  // Estados locales
  const [isWinner, setIsWinner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const idRef = useRef(video?._id);

  // ===============================
  // Verificar si ya está en carrito y cantidad
  // ===============================
  const isInCart = useMemo(() => {
    if (!video?._id) return false;
    return cart.items.some(item => item.videoId === video._id);
  }, [cart.items, video]);

  const cartQty = useMemo(() => {
    if (!video?._id) return 0;
    const item = cart.items.find(item => item.videoId === video._id);
    return item?.quantity || 0;
  }, [cart.items, video]);

  const stock = video?.stock || 0;
  const isOutOfStock = stock <= 0;
  const isMaxReached = stock > 0 && cartQty >= stock;
  const isAddDisabled = isOutOfStock || isMaxReached || addingToCart;

  const getCartButtonTitle = () => {
    if (isOutOfStock) return 'Œuvre épuisée';
    if (isMaxReached) return 'Stock maximum atteint';
    if (isInCart) return 'Déjà dans le panier';
    return 'Ajouter au panier';
  };

  // ===============================
  // Sincronizar like con props
  // ===============================
  useEffect(() => {
    if (!video) return;
    const userId = auth?.user?._id;
    const userLiked = userId && video.likes?.some(id => id.toString() === userId.toString()) || false;
    setLiked(userLiked);
    setLikesCount(video.likes?.length || 0);
  }, [video, auth?.user?._id]);

  // ===============================
  // Registro global (autoplay)
  // ===============================
  useEffect(() => {
    if (!isLiveMode || !video) return;
    const element = containerRef.current;
    if (!element) return;

    registry.set(idRef.current, {
      element,
      setWinner: setIsWinner
    });

    requestWinnerUpdate();
    window.addEventListener('scroll', requestWinnerUpdate, { passive: true });
    window.addEventListener('resize', requestWinnerUpdate);

    return () => {
      registry.delete(idRef.current);
      window.removeEventListener('scroll', requestWinnerUpdate);
      window.removeEventListener('resize', requestWinnerUpdate);
    };
  }, [isLiveMode, video]);

  // ===============================
  // Control de reproducción
  // ===============================
  useEffect(() => {
    if (!isLiveMode || !video) return;
    const player = videoRef.current;
    if (!player) return;

    if (isWinner) {
      player.muted = isMuted;
      player.play().catch(() => {});
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [isWinner, isMuted, isLiveMode, video]);

  // ===============================
  // Manejadores
  // ===============================
  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    const player = videoRef.current;
    if (!player) return;
    const next = !isMuted;
    player.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  const handleClick = useCallback(() => {
    if (!video) return;
    sessionStorage.setItem('returnToFeed', window.location.pathname);
    sessionStorage.setItem('scrollPosition', window.scrollY);
    const categorySlug = video.category?.slug;
    if (categorySlug) {
      history.push(`/${categorySlug}/1`);
    } else {
      history.push(`/video/${video._id}`);
    }
  }, [history, video]);

  const goToChannel = useCallback((e) => {
    e.stopPropagation();
    if (video?.channel?._id) {
      history.push(`/channel/${video.channel._id}`);
    }
  }, [history, video]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (!auth?.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour liker" } });
      history.push('/login');
      return;
    }
    if (!video || liking) return;
    setLiking(true);

    try {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

      const res = await dispatch(likeVideo(video._id, auth.token, auth, null, video));

      if (res?.liked !== undefined) {
        setLiked(res.liked);
        setLikesCount(res.likes);
        if (res.liked) createHeartEffect();
      } else {
        setLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('❌ Error en handleLike:', error);
      const wasLiked = liked;
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    } finally {
      setLiking(false);
    }
  }, [auth?.token, auth, video, dispatch, history, liked, liking]);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    if (isAddDisabled) return;

    if (!auth?.token) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Connectez-vous pour ajouter au panier" } });
      history.push('/login');
      return;
    }
    if (!video || addingToCart) return;
    setAddingToCart(true);
    try {
      await dispatch(addToCart(video._id, 1));
    } catch (error) {
      console.error('❌ Error addToCart:', error);
    } finally {
      setAddingToCart(false);
    }
  }, [auth?.token, dispatch, history, video, addingToCart, isAddDisabled]);

  const createHeartEffect = () => {
    const h = document.createElement('div');
    h.className = 'vr-floating-heart';
    h.textContent = '❤️';
    h.style.cssText = `
      position: fixed;
      pointer-events: none;
      font-size: 2rem;
      z-index: 9999;
      animation: floatUp 0.8s ease-out forwards;
    `;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      h.style.left = (rect.left + rect.width / 2 - 20 + (Math.random() - 0.5) * 40) + 'px';
      h.style.top = (rect.top + rect.height / 2 - 20) + 'px';
    } else {
      h.style.left = '50%';
      h.style.top = '50%';
    }
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 800);
  };

  // ===============================
  // Formateadores
  // ===============================
  const formatPrice = (price) => {
    if (!price || price === 0) return null;
    return new Intl.NumberFormat('fr-DZ').format(price) + ' DA';
  };

  const formatNumber = (n) => {
    if (!n && n !== 0) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  };

  if (!video) return null;

  const channelName = video.channel?.name || video.nom_entreprise || 'Tienda';
  const isUnique = stock === 1;
  const showOutOfStock = isOutOfStock;

  // ===============================
  // RENDER ESTÁTICO
  // ===============================
  if (!isLiveMode) {
    return (
      <div className="video-card-vertical static-mode" onClick={handleClick}>
        <div className="video-thumbnail-wrapper">
          <img src={video.thumbnail} alt={video.title} className="thumbnail-img" />
          <div className="info-overlay">
            <div className="channel-info" onClick={goToChannel}>
              <div className="business-name">{channelName}</div>
            </div>
            <div className="video-title">{video.title}</div>
            <div className="price">
              {formatPrice(video.price)}
              {isUnique && <span className="unique-badge">Œuvre unique</span>}
              {showOutOfStock && <span className="out-of-stock-badge">Épuisé</span>}
            </div>
            <div className="card-actions">
              <button
                className={`action-btn like-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                disabled={liking}
              >
                {liked ? <HeartFill size={18} /> : <Heart size={18} />}
                <span className="action-count">{formatNumber(likesCount)}</span>
              </button>
              <button
                className={`action-btn cart-btn ${isInCart ? 'in-cart' : ''} ${isAddDisabled ? 'disabled-btn' : ''}`}
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                title={getCartButtonTitle()}
              >
                {showOutOfStock ? (
                  <span style={{ fontSize: '0.7rem' }}>Épuisé</span>
                ) : isInCart ? (
                  <CartCheck size={18} />
                ) : (
                  <CartPlus size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // RENDER LIVE
  // ===============================
  return (
    <div ref={containerRef} className="video-card-vertical live-mode" onClick={handleClick}>
      <div className="video-thumbnail-wrapper">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          muted={isMuted}
          preload="metadata"
          playsInline
          className="video-element"
          style={{ opacity: isWinner ? 1 : 0 }}
        />

        <img
          src={video.thumbnail}
          alt={video.title}
          className="thumbnail-img"
          style={{ opacity: isWinner ? 0 : 1 }}
        />

        {isWinner && (
          <button className="volume-btn" onClick={toggleMute}>
            {isMuted ? <VolumeMute size={18} /> : <VolumeUp size={18} />}
          </button>
        )}

        <div className="info-overlay">
          <div className="channel-info" onClick={goToChannel}>
            <div className="business-name">{channelName}</div>
          </div>

          <div className="video-title">{video.title}</div>

          <div className="price">
            {formatPrice(video.price)}
            {isUnique && <span className="unique-badge">Œuvre unique</span>}
            {showOutOfStock && <span className="out-of-stock-badge">Épuisé</span>}
          </div>

          <div className="card-actions">
            <button
              className={`action-btn like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking}
            >
              {liked ? <HeartFill size={18} /> : <Heart size={18} />}
              <span className="action-count">{formatNumber(likesCount)}</span>
            </button>
            <button
              className={`action-btn cart-btn ${isInCart ? 'in-cart' : ''} ${isAddDisabled ? 'disabled-btn' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              title={getCartButtonTitle()}
            >
              {showOutOfStock ? (
                <span style={{ fontSize: '0.7rem' }}>Épuisé</span>
              ) : isInCart ? (
                <CartCheck size={18} />
              ) : (
                <CartPlus size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VideoCardVertical);
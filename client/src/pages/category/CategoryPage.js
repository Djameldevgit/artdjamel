// pages/CategoryPage.jsx - SIN LOGS DE CANALES (versión limpia)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { Container, Spinner, Row, Col, Button } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import { Funnel, ArrowUp, Grid3x3, Film, CameraVideo, PlusCircle } from 'react-bootstrap-icons';
import VideoCard from "../../components/VideoCard";
import VideoReelItem from "../video/Feed";
import { getSliderCategories, getVideosByCategory } from "../../redux/actions/categoryAction";
import FilterDrawer from "./FilterDrawer";

const VIDEO_VIEW_MODE = {
  REEL: 'reel',
  GRID: 'grid'
};

const CategoryPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { slug, subSlug, page } = useParams();

  const { sliderCategories, loadingSlider } = useSelector(state => state.category || { sliderCategories: [], loadingSlider: false });

  // Cargar categorías para el slider
  useEffect(() => {
    if (!sliderCategories || sliderCategories.length === 0) {
      dispatch(getSliderCategories());
    }
  }, [dispatch, sliderCategories]);

  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  const [videoViewMode, setVideoViewMode] = useState(VIDEO_VIEW_MODE.REEL);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const videoReelsRef = useRef(null);
  const isScrollingRef = useRef(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentSub, setCurrentSub] = useState(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [filterMetadata, setFilterMetadata] = useState({
    wilayas: [],
    priceRange: { min: 0, max: 1000000 },
    appliedFilters: {}
  });

  // Estados de paginación
  const [filters, setFilters] = useState({
    page: page ? parseInt(page) : 1
  });

  // Selector - state.category
  const categoryState = useSelector(state => state.category);
  const videos = categoryState.videos || [];
  const videosLoading = categoryState.videosLoading || false;
  const hasMoreVideos = categoryState.hasMoreVideos || false;
  const totalVideos = categoryState.totalVideos || 0;
  const currentPage = categoryState.videosCurrentPage || 1;
  const categoryInfo = categoryState.categoryInfo || {};

  // Redirigir si no hay página en la URL
  useEffect(() => {
    if (!page && !subSlug) {
      history.replace(`/${slug}/1${location.search}`);
      return;
    }
    if (subSlug && !page) {
      history.replace(`/${slug}/${subSlug}/1${location.search}`);
      return;
    }
  }, [slug, subSlug, page, history, location.search]);

  // ============================================
  // FUNCIÓN PARA CARGAR VIDEOS
  // ============================================
  const loadVideos = useCallback(async (pageNum = 1) => {
    if (!slug) return;

    try {
      const result = await dispatch(getVideosByCategory(
        slug, pageNum, 12,
        activeFilters?.wilaya || null,
        activeFilters?.minPrice || null,
        activeFilters?.maxPrice || null,
        activeFilters?.sortBy || 'recent'
      ));
      setIsInitialLoad(false);
    } catch (err) {
      console.error('❌ [loadVideos] Error:', err);
      setError(err.message);
      setIsInitialLoad(false);
    }
  }, [dispatch, slug, activeFilters]);

  // Cargar videos cuando cambia el slug o la página
  useEffect(() => {
    if (slug) {
      loadVideos(filters.page);
    }
  }, [slug, filters.page, loadVideos]);

  // Sincronizar página desde URL
  useEffect(() => {
    if (page) {
      setFilters(prev => ({ ...prev, page: parseInt(page) }));
    }
  }, [page]);

  // ============================================
  // MANEJAR CLIC EN EL SLIDER
  // ============================================
  const handleCategoryClick = useCallback((category) => {
    const categorySlug = category?.slug || category;
    if (!categorySlug) return;

    setFilters({ page: 1 });
    setActiveVideoIndex(0);
    setCurrentReelIndex(0);
    setIsInitialLoad(true);
    setError(null);
    setCurrentSub(null);

    dispatch({ type: 'CLEAR_CATEGORY_VIDEOS' });
    history.push(`/${categorySlug}/1`);
  }, [dispatch, history]);

  // ============================================
  // CARGAR MÁS VIDEOS (INFINITE SCROLL)
  // ============================================
  const loadMoreVideos = useCallback(() => {
    if (!hasMoreVideos || videosLoading) return;

    const nextPage = currentPage + 1;

    setFilters(prev => ({ ...prev, page: nextPage }));
    history.replace(`/${slug}/${nextPage}`);

    dispatch(getVideosByCategory(
      slug, nextPage, 12,
      activeFilters?.wilaya || null,
      activeFilters?.minPrice || null,
      activeFilters?.maxPrice || null,
      activeFilters?.sortBy || 'recent'
    ));
  }, [hasMoreVideos, videosLoading, currentPage, slug, dispatch, activeFilters, history]);

  // ============================================
  // MODO REEL - MANEJO DE SCROLL
  // ============================================
  useEffect(() => {
    if (videoViewMode !== VIDEO_VIEW_MODE.REEL) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const container = videoReelsRef.current;
      if (!container) return;
      const scrollTop = container.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / videoHeight);
      if (newIndex !== activeVideoIndex && newIndex >= 0 && newIndex < videos.length) {
        setActiveVideoIndex(newIndex);
        setCurrentReelIndex(newIndex);
      }
      setShowScrollTop(scrollTop > window.innerHeight * 2);
    };

    const container = videoReelsRef.current;
    if (container && videos.length > 0) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [videos.length, activeVideoIndex, videoViewMode]);

  useEffect(() => {
    setCurrentReelIndex(activeVideoIndex);
  }, [activeVideoIndex]);

  const handleNextVideo = useCallback(() => {
    if (currentReelIndex < videos.length - 1) {
      const newIndex = currentReelIndex + 1;
      setCurrentReelIndex(newIndex);
      setActiveVideoIndex(newIndex);
      if (videoReelsRef.current) {
        const nextVideoTop = newIndex * window.innerHeight;
        videoReelsRef.current.scrollTo({ top: nextVideoTop, behavior: 'smooth' });
      }
    }
  }, [currentReelIndex, videos.length]);

  const handlePreviousVideo = useCallback(() => {
    if (currentReelIndex > 0) {
      const newIndex = currentReelIndex - 1;
      setCurrentReelIndex(newIndex);
      setActiveVideoIndex(newIndex);
      if (videoReelsRef.current) {
        const prevVideoTop = newIndex * window.innerHeight;
        videoReelsRef.current.scrollTo({ top: prevVideoTop, behavior: 'smooth' });
      }
    }
  }, [currentReelIndex]);

  const scrollToTop = () => {
    if (videoReelsRef.current) {
      videoReelsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveVideoIndex(0);
      setCurrentReelIndex(0);
    }
  };

  // ============================================
  // FILTROS Y URL
  // ============================================
  const updateUrl = useCallback((newFilters, customActiveFilters = null) => {
    let basePath = `/${slug}`;
    if (newFilters.sub) basePath += `/${newFilters.sub}`;
    basePath += `/${newFilters.page || 1}`;
    const filtersToUse = customActiveFilters || activeFilters;
    const searchParams = new URLSearchParams();
    if (filtersToUse?.searchTerm) searchParams.set('searchTerm', filtersToUse.searchTerm);
    if (filtersToUse?.wilaya) searchParams.set('wilaya', filtersToUse.wilaya);
    if (filtersToUse?.commune) searchParams.set('commune', filtersToUse.commune);
    if (filtersToUse?.sortBy && filtersToUse.sortBy !== 'recent') searchParams.set('sortBy', filtersToUse.sortBy);
    const finalPath = searchParams.toString() ? `${basePath}?${searchParams.toString()}` : basePath;
    history.push(finalPath);
  }, [slug, history, activeFilters]);

  // Sincronizar estado con URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const wilaya = searchParams.get('wilaya') || '';
    const commune = searchParams.get('commune') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const searchTerm = searchParams.get('searchTerm') || '';
    const newPage = page ? parseInt(page) : 1;
    setFilters({ page: newPage });
    setCurrentSub(subSlug || null);
    setActiveFilters({ wilaya, commune, sortBy, searchTerm });
  }, [subSlug, page, location.search]);

  const handleApplyFilters = useCallback((filtersFromDrawer) => {
    const newFilters = { page: 1 };
    const newActiveFilters = {
      wilaya: filtersFromDrawer.wilaya || '',
      commune: filtersFromDrawer.commune || '',
      sortBy: filtersFromDrawer.sortBy || 'recent',
      searchTerm: filtersFromDrawer.searchTerm || ''
    };
    setActiveFilters(newActiveFilters);
    setFilters(newFilters);
    updateUrl(newFilters, newActiveFilters);
    dispatch(getVideosByCategory(
      slug, 1, 12,
      newActiveFilters.wilaya || null,
      null, null,
      newActiveFilters.sortBy
    ));
    setShowFilterDrawer(false);
  }, [slug, dispatch, updateUrl]);

  const handleVideoDeleted = useCallback(() => {
    loadVideos(1);
  }, [loadVideos]);

  const countActiveFilters = () => {
    if (!activeFilters) return 0;
    let count = 0;
    if (activeFilters.wilaya && activeFilters.wilaya !== '') count++;
    if (activeFilters.commune && activeFilters.commune !== '') count++;
    if (activeFilters.sortBy && activeFilters.sortBy !== 'recent') count++;
    if (activeFilters.searchTerm && activeFilters.searchTerm !== '') count++;
    return count;
  };

  // ============================================
  // COMPONENTE EMPTY STATE
  // ============================================
  const EmptyState = () => {
    const categoryName = categoryInfo?.name || slug;

    return (
      <div className="text-center py-5 my-5">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#f5f5f5',
            borderRadius: '50%'
          }}
        >
          <CameraVideo size={40} className="text-muted" />
        </div>

        <h4 className="fw-semibold mb-3">
          Aucune œuvre dans {categoryName}
        </h4>

        <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          Soyez le premier à publier une œuvre dans cette catégorie.
        </p>

        <Button
          variant="primary"
          className="rounded-pill px-4 py-2"
          onClick={() => history.push('/create-video-page')}
          style={{
            backgroundColor: '#fe2c55',
            border: 'none',
            fontWeight: '500'
          }}
        >
          <PlusCircle size={18} className="me-2" />
          Publier une œuvre
        </Button>
      </div>
    );
  };

  // ============================================
  // RENDER GRID
  // ============================================
  const renderVideoGrid = () => {
    if (error) {
      return (
        <div className="text-center py-5">
          <h5 className="text-danger">Erreur</h5>
          <p className="text-muted">{error}</p>
          <Button onClick={() => loadVideos(1)}>Réessayer</Button>
        </div>
      );
    }

    if (videosLoading && videos.length === 0 && isInitialLoad) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement des œuvres de {slug}...</p>
        </div>
      );
    }

    if (videos.length > 0) {
      return (
        <>
          <InfiniteScroll
            dataLength={videos.length}
            hasMore={hasMoreVideos}
            loader={
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="text-muted small mt-2">Chargement supplémentaire...</p>
              </div>
            }
            next={loadMoreVideos}
            scrollThreshold={0.9}
          >
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {videos.map((video) => (
                <Col key={video._id}>
                  <VideoCard video={video} showActions={true} />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        </>
      );
    }

    if (!videosLoading && videos.length === 0 && !isInitialLoad) {
      return <EmptyState />;
    }

    return null;
  };

  // ============================================
  // RENDER MODO REEL
  // ============================================
  if (videoViewMode === VIDEO_VIEW_MODE.REEL) {
    if (!videosLoading && videos.length === 0 && !isInitialLoad) {
      return (
        <>
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)'
          }}>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 140px)',
            flexDirection: 'column',
            padding: '20px'
          }}>
            <EmptyState />
          </div>
        </>
      );
    }

    return (
      <>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)'
        }}>
        </div>

        <button
          onClick={() => setVideoViewMode(VIDEO_VIEW_MODE.GRID)}
          style={{
            position: 'fixed',
            top: '7px',
            right: '150px',
            zIndex: 1001,
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)'
          }}
        >
          <Grid3x3 size={18} />
        </button>

        <div
          ref={videoReelsRef}
          className="video-reels-container"
          style={{
            height: 'calc(100vh - 70px)',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
            backgroundColor: '#000',
            paddingBottom: '70px'
          }}
        >
          {videos.map((video, index) => (
            <VideoReelItem
              key={video._id}
              video={video}
              isActive={index === currentReelIndex}
              onVideoDeleted={handleVideoDeleted}
              onNextVideo={handleNextVideo}
              onPreviousVideo={handlePreviousVideo}
              hasNext={index < videos.length - 1}
              hasPrev={index > 0}
            />
          ))}
        </div>

        {showScrollTop && videos.length > 3 && (
          <button
            onClick={scrollToTop}
            className="scroll-top-btn"
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1000,
              backdropFilter: 'blur(5px)'
            }}
          >
            <ArrowUp size={22} />
          </button>
        )}

        <style>{`
          .video-reels-container {
            scroll-snap-type: y mandatory;
            overflow-y: scroll;
            height: calc(100vh - 70px);
            scrollbar-width: none;
          }
          .video-reels-container::-webkit-scrollbar {
            display: none;
          }
          .scroll-top-btn {
            animation: fadeInUp 0.3s ease;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  // ============================================
  // RENDER MODO GRID
  // ============================================
  return (
    <div className="category-page">
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0'
      }}>
      </div>

      <main className="category-content" style={{ paddingBottom: '80px' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">
                Œuvres de {categoryInfo?.name || slug}
              </h2>
              {totalVideos > 0 && (
                <small className="text-muted">{totalVideos} œuvres</small>
              )}
            </div>
            <Button
              variant="outline-primary"
              onClick={() => setVideoViewMode(VIDEO_VIEW_MODE.REEL)}
              className="d-flex align-items-center gap-2"
            >
              <Film size={16} />
              Mode Reel
            </Button>
          </div>

          {totalVideos > 0 && (
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="mb-0">
                  Œuvres
                  {currentSub && <span className="text-muted ms-2">- {currentSub.name}</span>}
                </h4>
                {countActiveFilters() > 0 && (
                  <small className="text-muted">
                    {countActiveFilters()} filtre{countActiveFilters() > 1 ? 's' : ''} actif
                  </small>
                )}
              </div>

              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">{videos.length} résultat{videos.length > 1 ? 's' : ''}</span>
                <Button
                  variant={countActiveFilters() > 0 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setShowFilterDrawer(true)}
                  className="d-flex align-items-center gap-2 rounded-pill"
                >
                  <Funnel size={16} />
                  Filtres
                  {countActiveFilters() > 0 && (
                    <span className="filter-badge">{countActiveFilters()}</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          <section className="content-section">
            {renderVideoGrid()}
          </section>
        </Container>
      </main>

      <FilterDrawer
        show={showFilterDrawer}
        onHide={() => setShowFilterDrawer(false)}
        onApplyFilters={handleApplyFilters}
        initialWilaya={activeFilters?.wilaya || ''}
        initialCommune={activeFilters?.commune || ''}
        initialSearchTerm={activeFilters?.searchTerm || ''}
        initialSortBy={activeFilters?.sortBy || 'recent'}
        isVideo={true}
      />

      <style>{`
        .filter-badge {
          background-color: white;
          color: #667eea;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;
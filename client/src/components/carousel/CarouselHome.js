import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Dropdown, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaEllipsisV, FaEdit, FaTrash, FaPlus, FaImage, FaExternalLinkAlt, FaLink } from 'react-icons/fa';
import { getHomeCarousel, deleteCarouselImage } from '../../redux/actions/carouselHomeAction';

const CarouselHome = memo(() => {
  const { t } = useTranslation('CarouselHome');
  const dispatch = useDispatch();
  const history = useHistory();

  const { homeImages, loading } = useSelector(state => state.carousel || { homeImages: [], loading: false });
  const authState = useSelector(state => state.auth);

  const token = authState?.token || authState?.auth?.token;
  const user = authState?.user || authState?.auth?.user;
  const isAdmin = user?.role === 'admin' || authState?.user?.role === 'admin';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);

  const sideImages = [
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122901/carousjhjhj_rdunbx.png",
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122893/carousjhjhj2_ra5znt.png",
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122901/carousjhjhj_rdunbx.png"
  ];

  // Solo imágenes con URL válida
  const validSlides = Array.isArray(homeImages)
    ? homeImages.filter(img => img?.image?.url)
    : [];
  const mainImages = validSlides.map(img => img.image.url);

  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const isMountedRef = useRef(true);
  const carouselPausedRef = useRef(false);

  // Helper centralizado para datos de cada slide
  const getSlideData = useCallback((index) => {
    const slide = validSlides[index];
    return {
      title: slide?.title || 'Bienvenue sur Tassili Market',
      description: slide?.description || 'Votre destination mode préférée en Algérie',
      link: slide?.link || null,
      linkType: slide?.linkType || 'none',
      slideId: slide?._id || null,
      publicId: slide?.image?.public_id || null,
    };
  }, [validSlides]);

  useEffect(() => { dispatch(getHomeCarousel()); }, [dispatch]);

  useEffect(() => {
    let resizeTimeout;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    const handleResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(checkMobile, 100); };
    checkMobile();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(resizeTimeout); };
  }, []);

  const goToNextSlide = useCallback(() => {
    if (!isMountedRef.current || carouselPausedRef.current || mainImages.length === 0) return;
    if (isMobile) setMobileCurrentIndex(prev => (prev + 1) % mainImages.length);
    else setCurrentIndex(prev => (prev + 1) % mainImages.length);
    lastUpdateRef.current = Date.now();
  }, [isMobile, mainImages.length]);

  const scheduleNextSlide = useCallback(() => {
    if (!isMountedRef.current || carouselPausedRef.current || mainImages.length === 0) return;
    const INTERVAL = 4000;
    const elapsed = Date.now() - lastUpdateRef.current;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (elapsed >= INTERVAL) {
      animationFrameRef.current = requestAnimationFrame(() => { goToNextSlide(); scheduleNextSlide(); });
    } else {
      timeoutRef.current = setTimeout(scheduleNextSlide, Math.max(100, INTERVAL - elapsed));
    }
  }, [goToNextSlide, mainImages.length]);

  useEffect(() => {
    if (mainImages.length > 0) {
      isMountedRef.current = true;
      lastUpdateRef.current = Date.now();
      const tid = setTimeout(scheduleNextSlide, 500);
      return () => { clearTimeout(tid); isMountedRef.current = false; };
    }
  }, [scheduleNextSlide, mainImages.length]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handleMouseEnter = useCallback(() => {
    carouselPausedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    carouselPausedRef.current = false;
    lastUpdateRef.current = Date.now();
    scheduleNextSlide();
  }, [scheduleNextSlide]);

  const handleMainSelect = useCallback((index) => {
    if (isMobile) setMobileCurrentIndex(index); else setCurrentIndex(index);
    lastUpdateRef.current = Date.now();
  }, [isMobile]);

  const handleSideSelect = useCallback((index) => {
    if (isMobile) setMobileCurrentIndex(index); else setCurrentIndex(index);
    lastUpdateRef.current = Date.now();
  }, [isMobile]);

  const handleEdit = useCallback((slideId, e) => {
    e.stopPropagation();
    if (slideId) history.push(`/admin/carousel/edit/${slideId}`);
  }, [history]);

  const handleDelete = useCallback(async (slideId, publicId, e) => {
    e.stopPropagation();
    if (!slideId || !window.confirm('¿Eliminar esta imagen del carrusel?')) return;
    if (!token) return alert('Error de autenticación');
    await dispatch(deleteCarouselImage(slideId, { token, user }));
    await dispatch(getHomeCarousel());
  }, [token, user, dispatch]);

  const handleCreate = useCallback((e) => {
    if (e) e.stopPropagation();
    history.push('/admin/carousel/create');
  }, [history]);

  const handleLinkClick = useCallback((link, linkType, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!link) return;
    if (linkType === 'external') window.open(link, '_blank', 'noopener,noreferrer');
    else history.push(link);
  }, [history]);

  // ─── COMPONENTES INTERNOS ─────────────────────────────

  // Dropdown 3 puntos — z-index alto para superar Bootstrap carousel
  const AdminDropdown = ({ slideId, publicId, size = 'md' }) => {
    if (!isAdmin) return null;
    const iconSize = size === 'sm' ? 12 : 14;
    return (
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 200 }}>
        <Dropdown>
          <Dropdown.Toggle
            variant="dark" size="sm"
            style={{
              backgroundColor: 'rgba(0,0,0,0.75)', border: 'none',
              borderRadius: '8px', padding: size === 'sm' ? '4px 8px' : '8px 12px',
              pointerEvents: 'all'
            }}
          >
            <FaEllipsisV size={iconSize} color="white" />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end" style={{ zIndex: 9999 }}>
            <Dropdown.Item onClick={(e) => handleEdit(slideId, e)}>
              <FaEdit className="me-2 text-primary" size={iconSize} /> Editar
            </Dropdown.Item>
            <Dropdown.Item onClick={(e) => handleDelete(slideId, publicId, e)} className="text-danger">
              <FaTrash className="me-2" size={iconSize} /> Eliminar
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleCreate}>
              <FaPlus className="me-2 text-success" size={iconSize} /> Agregar nueva imagen
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  // Botón "Voir la page" — FUERA del Carousel.Caption para evitar pointer-events:none de Bootstrap
  const VoirLaPageButton = ({ link, linkType, mobile = false }) => {
    if (!link || linkType === 'none') return null;
    return (
      <div style={{
        position: 'absolute',
        bottom: mobile ? '8px' : '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'all'
      }}>
        <Button
          variant="light"
          size={mobile ? 'sm' : 'sm'}
          onClick={(e) => handleLinkClick(link, linkType, e)}
          style={{
            borderRadius: '50px',
            padding: mobile ? '4px 14px' : '6px 18px',
            fontWeight: '600',
            fontSize: mobile ? '0.75rem' : '0.85rem',
            backgroundColor: 'rgba(255,255,255,0.92)',
            border: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
            whiteSpace: 'nowrap'
          }}
        >
          {linkType === 'external' ? <FaExternalLinkAlt size={10} /> : <FaLink size={10} />}
          Voir la page
        </Button>
      </div>
    );
  };

  // Estado vacío — SIEMPRE fondo gris, con botón para admin
  // BUG FIX: antes desaparecía cuando homeImages=[] tras eliminar todo
  const EmptyCarousel = ({ height = '40vh', maxHeight = '350px', minHeight = '250px' }) => (
    <div
      onClick={isAdmin ? handleCreate : undefined}
      style={{
        height, maxHeight, minHeight,
        backgroundColor: '#CACECF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '12px',
        cursor: isAdmin ? 'pointer' : 'default',
        transition: 'background-color 0.3s ease'
      }}
      onMouseEnter={isAdmin ? (e) => { e.currentTarget.style.backgroundColor = '#b8b9ba'; } : undefined}
      onMouseLeave={isAdmin ? (e) => { e.currentTarget.style.backgroundColor = '#CACECF'; } : undefined}
    >
      {isAdmin ? (
        <div className="text-center">
          <Button
            variant="primary" size="lg"
            onClick={(e) => { e.stopPropagation(); handleCreate(e); }}
            style={{ borderRadius: '50px', padding: '12px 30px', pointerEvents: 'all' }}
          >
            <FaPlus className="me-2" />
            {t('addFirstImage') || 'Ajouter votre première image'}
          </Button>
          <p className="mt-3 text-muted small">
            {t('clickToAdd') || 'Cliquez pour ajouter des images au carrousel'}
          </p>
        </div>
      ) : (
        <div className="text-center text-muted">
          <FaImage size={48} className="mb-3 opacity-50" />
          <p>{t('noImages') || 'Aucune image disponible'}</p>
        </div>
      )}
    </div>
  );

  // Botón flotante
  const AdminFloatingButton = () => {
    if (!isAdmin) return null;
    return (
      <div className="position-fixed" style={{ bottom: '30px', right: '30px', zIndex: 1050 }}>
        <Button
          variant="primary" onClick={handleCreate}
          style={{
            borderRadius: '50px', padding: '12px 24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
          }}
        >
          <FaPlus size={16} />
          {t('addImage') || 'Ajouter une image'}
        </Button>
      </div>
    );
  };

  // ─── RENDER SLIDE DESKTOP ─────────────────────────────
  // CLAVE: no usamos Carousel.Caption — Bootstrap le aplica pointer-events:none
  // Todo va dentro del div contenedor con position:relative
  const renderMainSlide = useCallback((image, index) => {
    const { title, description, link, linkType, slideId, publicId } = getSlideData(index);
    const hasLink = link && linkType !== 'none';

    return (
      <Carousel.Item key={index}>
        <div style={{
          height: '40vh', maxHeight: '350px', minHeight: '250px',
          overflow: 'hidden', borderRadius: '12px', position: 'relative'
        }}>
          <img
            src={image} alt={title}
            loading={index < 2 ? "eager" : "lazy"}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />

          {/* Dropdown admin — esquina superior derecha */}
          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 200 }}>
            <AdminDropdown slideId={slideId} publicId={publicId} size="md" />
          </div>

          {/* Texto del slide — sin pointer-events para no bloquear clicks */}
          <div style={{
            position: 'absolute',
            bottom: hasLink ? '68px' : '25px',
            left: '50%', transform: 'translateX(-50%)',
            width: '85%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(2px)',
            borderRadius: '10px', padding: '15px 20px',
            textAlign: 'center', zIndex: 10,
            pointerEvents: 'none'
          }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: 0 }}>{title}</h3>
            <p style={{ fontSize: '1.1rem', color: '#f8f8f8', margin: '4px 0 0' }}>{description}</p>
          </div>

          {/* Botón "Voir la page" — posición absoluta propia, con pointer-events activos */}
          <VoirLaPageButton link={link} linkType={linkType} />
        </div>
      </Carousel.Item>
    );
  }, [getSlideData, isAdmin]);

  // ─── RENDER SLIDE LATERAL ─────────────────────────────
  const sideSlides = useRef([
    { title: 'Promo -30%', color: '#dc3545' },
    { title: 'Livraison Rapide', color: '#198754' },
    { title: 'Nouveautés', color: '#0d6efd' },
    { title: 'Collection Été', color: '#fd7e14' },
    { title: 'Accessoires', color: '#6f42c1' },
    { title: 'Soldes Flash', color: '#20c997' }
  ]);

  const renderSideSlide = useCallback((image, index) => {
    const slide = sideSlides.current[index] || { title: 'Promo', color: '#8b5cf6' };
    return (
      <Carousel.Item key={index}>
        <div
          style={{
            height: '40vh', maxHeight: '350px', minHeight: '250px',
            overflow: 'hidden', position: 'relative', borderRadius: '12px', cursor: 'pointer'
          }}
          onClick={() => handleSideSelect(index)}
        >
          <img
            src={image} alt={slide.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px',
              color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>{slide.title}</div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: currentIndex === index ? 'white' : 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: currentIndex === index ? slide.color : 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>{index + 1}</div>
          </div>
        </div>
      </Carousel.Item>
    );
  }, [currentIndex, handleSideSelect]);

  // ─── LOADING ─────────────────────────────────────────
  if (loading && validSlides.length === 0) {
    return (
      <Container fluid style={{ padding: '5px', backgroundColor: '#CACECF' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  // ─── MÓVIL ────────────────────────────────────────────
  if (isMobile) {
    return (
      <Container fluid style={{ padding: '10px 5px 5px 5px', backgroundColor: '#CACECF' }}>
        <Row className="g-0">
          <Col xs={12}>
            {validSlides.length === 0
              ? <EmptyCarousel height="22vh" maxHeight="180px" minHeight="140px" />
              : (
                <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <Carousel
                    activeIndex={mobileCurrentIndex} onSelect={handleMainSelect}
                    fade indicators controls interval={null}
                  >
                    {validSlides.map((slide, idx) => {
                      const { title, link, linkType, slideId, publicId } = getSlideData(idx);
                      const hasLink = link && linkType !== 'none';
                      return (
                        <Carousel.Item key={slide._id || idx}>
                          <div style={{
                            height: '22vh', maxHeight: '180px', minHeight: '140px',
                            overflow: 'hidden', borderRadius: '8px', position: 'relative'
                          }}>
                            <img
                              src={slide.image.url} alt={title}
                              loading={idx < 2 ? "eager" : "lazy"}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div className="position-absolute top-0 end-0 m-1" style={{ zIndex: 200 }}>
                              <AdminDropdown slideId={slideId} publicId={publicId} size="sm" />
                            </div>
                            {/* Texto */}
                            <div style={{
                              position: 'absolute',
                              bottom: hasLink ? '40px' : '10px',
                              left: '50%', transform: 'translateX(-50%)',
                              width: '90%',
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              backdropFilter: 'blur(2px)',
                              borderRadius: '6px', padding: '6px 10px',
                              textAlign: 'center', zIndex: 10, pointerEvents: 'none'
                            }}>
                              <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', margin: 0 }}>{title}</h3>
                            </div>
                            {/* Botón link móvil */}
                            <VoirLaPageButton link={link} linkType={linkType} mobile={true} />
                          </div>
                        </Carousel.Item>
                      );
                    })}
                  </Carousel>
                </div>
              )
            }
          </Col>
        </Row>
        <AdminFloatingButton />
      </Container>
    );
  }

  // ─── DESKTOP ──────────────────────────────────────────
  return (
    <Container fluid style={{ padding: '10px 5px 5px 5px', backgroundColor: '#CACECF' }}>
      <Row className="g-0">
        <Col lg={9} md={12} style={{ paddingRight: '5px' }}>
          {validSlides.length === 0
            ? <EmptyCarousel />
            : (
              <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Carousel
                  activeIndex={currentIndex} onSelect={handleMainSelect}
                  fade indicators controls interval={null}
                  className="main-carousel"
                >
                  {mainImages.map((img, idx) => renderMainSlide(img, idx))}
                </Carousel>
              </div>
            )
          }
        </Col>
        <Col lg={3} md={0} className="d-none d-lg-block" style={{ paddingLeft: 0 }}>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Carousel
              activeIndex={currentIndex} onSelect={handleSideSelect}
              indicators={false} controls={false} interval={null}
              className="side-carousel"
            >
              {sideImages.map((img, idx) => renderSideSlide(img, idx))}
            </Carousel>
          </div>
        </Col>
      </Row>
      <AdminFloatingButton />
    </Container>
  );
});

CarouselHome.displayName = 'CarouselHome';
export default CarouselHome;

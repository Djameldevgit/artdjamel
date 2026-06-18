// HeaderCarousel.jsx - VERSIÓN CON URLs DIRECTAS DE CLOUDINARY
// PADDING CORREGIDO: 5px en móvil, en desktop: 5px arriba/lados y 2px abajo

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col } from 'react-bootstrap';

const HeaderCarousel = memo(() => {
  const { t } = useTranslation('headercarousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  
  // ===== URLs DIRECTAS DE CLOUDINARY =====
  const mainImages = [
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773265475/automobile_sxuh2c.png",
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773265553/immobiler_ukz4xk.png",
     "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122713/caoumiajj2_isoynj.jpg"
    
  ];

  const sideImages = [
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122901/carousjhjhj_rdunbx.png",
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122893/carousjhjhj2_ra5znt.png",
    "https://res.cloudinary.com/dfjipgj2o/image/upload/v1773122901/carousjhjhj_rdunbx.png"
    
  ];

  const [images] = useState({
    main: mainImages,
    side: sideImages
  });

  // Refs para el auto-play
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const isMountedRef = useRef(true);
  const carouselPausedRef = useRef(false);

  // Textos del carrusel principal
  const mainSlides = useRef([
    { title: t('carousel.title1', 'Nouvelle Collection Printemps'), description: t('carousel.desc1', 'Découvrez les dernières tendances de la saison') },
    { title: t('carousel.title2', 'Soldes Exceptionnelles'), description: t('carousel.desc2', 'Jusqu\'à -50% sur toute la boutique') },
    { title: t('carousel.title3', 'Livraison Gratuite'), description: t('carousel.desc3', 'Partout en Algérie à partir de 3000 DZD') },
    { title: t('carousel.title4', 'Mode Homme & Femme'), description: t('carousel.desc4', 'Des styles uniques pour tous les goûts') },
    { title: t('carousel.title5', 'Qualité Garantie'), description: t('carousel.desc5', 'Des matériaux premium et une confection soignée') },
    { title: t('carousel.title6', 'Nouveautés Quotidiennes'), description: t('carousel.desc6', 'Découvrez nos nouvelles arrivées chaque jour') }
  ]);

  // Textos del carrusel lateral
  const sideSlides = useRef([
    { title: 'Promo -30%', color: '#dc3545' },
    { title: 'Livraison Rapide', color: '#198754' },
    { title: 'Nouveautés', color: '#0d6efd' },
    { title: 'Collection Été', color: '#fd7e14' },
    { title: 'Accessoires', color: '#6f42c1' },
    { title: 'Soldes Flash', color: '#20c997' }
  ]);

  // Detectar tamaño de pantalla para responsive
  useEffect(() => {
    let resizeTimeout;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };
    checkMobile();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Función para avanzar al siguiente slide
  const goToNextSlide = useCallback(() => {
    if (!isMountedRef.current || carouselPausedRef.current || images.main.length === 0) return;
    
    if (isMobile) {
      setMobileCurrentIndex(prev => (prev + 1) % images.main.length);
    } else {
      setCurrentIndex(prev => (prev + 1) % images.main.length);
    }
    lastUpdateRef.current = Date.now();
  }, [isMobile, images.main.length]);

  // Programar el siguiente slide
  const scheduleNextSlide = useCallback(() => {
    if (!isMountedRef.current || carouselPausedRef.current) return;
    const INTERVAL_DURATION = 4000;
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (timeSinceLastUpdate >= INTERVAL_DURATION) {
      animationFrameRef.current = requestAnimationFrame(() => {
        goToNextSlide();
        scheduleNextSlide();
      });
    } else {
      const timeToWait = INTERVAL_DURATION - timeSinceLastUpdate;
      timeoutRef.current = setTimeout(scheduleNextSlide, Math.max(100, timeToWait));
    }
  }, [goToNextSlide]);

  // Iniciar auto-play
  useEffect(() => {
    isMountedRef.current = true;
    lastUpdateRef.current = Date.now();
    const initialDelay = setTimeout(scheduleNextSlide, 500);
    return () => {
      clearTimeout(initialDelay);
      isMountedRef.current = false;
    };
  }, [scheduleNextSlide]);

  // Limpiar timeouts al desmontar
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // Pausar al pasar el mouse
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

  // Manejadores de selección
  const handleMainSelect = useCallback((index) => {
    if (isMobile) setMobileCurrentIndex(index);
    else setCurrentIndex(index);
    lastUpdateRef.current = Date.now();
  }, [isMobile]);

  const handleSideSelect = useCallback((index) => {
    if (isMobile) setMobileCurrentIndex(index);
    else setCurrentIndex(index);
    lastUpdateRef.current = Date.now();
  }, [isMobile]);

  // Renderizar slide principal
  const renderMainSlide = useCallback((image, index) => {
    const slide = mainSlides.current[index] || { 
      title: 'Tassili Fashion', 
      description: 'Votre destination mode préférée' 
    };
    
    return (
      <Carousel.Item key={index}>
        <div style={{ 
          height: '40vh', 
          maxHeight: '350px', 
          minHeight: '250px', 
          overflow: 'hidden', 
          borderRadius: '12px', 
          position: 'relative' 
        }}>
          <img 
            src={image} 
            alt={slide.title} 
            loading={index < 2 ? "eager" : "lazy"} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '12px' 
            }} 
          />
        </div>
        <Carousel.Caption style={{ 
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(2px)',
          borderRadius: '10px', 
          padding: '15px 20px', 
          bottom: '25px' 
        }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{slide.title}</h3>
          <p style={{ fontSize: '1.1rem', color: '#f8f8f8' }}>{slide.description}</p>
        </Carousel.Caption>
      </Carousel.Item>
    );
  }, []);

  // Renderizar slide lateral (sin degradado, con sombra)
  const renderSideSlide = useCallback((image, index) => {
    const slide = sideSlides.current[index] || { title: 'Promo', color: '#8b5cf6' };
    
    return (
      <Carousel.Item key={index}>
        <div style={{ 
          height: '40vh', 
          maxHeight: '350px', 
          minHeight: '250px', 
          overflow: 'hidden', 
          position: 'relative', 
          borderRadius: '12px', 
          cursor: 'pointer' 
        }} onClick={() => handleSideSelect(index)}>
          <img 
            src={image} 
            alt={slide.title} 
            loading="lazy" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: '12px' 
            }} 
          />
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            borderRadius: '12px' 
          }}>
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: '700', 
              marginBottom: '10px', 
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}>{slide.title}</div>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              backgroundColor: currentIndex === index ? 'white' : 'rgba(0,0,0,0.5)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: currentIndex === index ? slide.color : 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>{index + 1}</div>
          </div>
        </div>
      </Carousel.Item>
    );
  }, [currentIndex, handleSideSelect]);

  // Estado de carga
  if (images.main.length === 0) {
    return (
      <Container fluid style={{ padding: '5px', backgroundColor: '#9E9B9B' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando carousel...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Versión móvil (solo carrusel principal)
  if (isMobile) {
    return (
      <Container  fluid style={{ padding: '10px 5px 5px 5px', backgroundColor: '#CACECF' }}>
        <Row className="g-0">
          <Col xs={12}>
            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <Carousel 
                activeIndex={mobileCurrentIndex} 
                onSelect={handleMainSelect} 
                fade 
                indicators 
                controls 
                interval={null}
              >
                {images.main.map((img, idx) => {
                  const slide = mainSlides.current[idx] || { title: 'Tassili Fashion' };
                  
                  return (
                    <Carousel.Item key={idx}>
                      <div style={{ 
                        height: '22vh', 
                        maxHeight: '180px', 
                        minHeight: '140px', 
                        overflow: 'hidden', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px' 
                      }}>
                        <img 
                          src={img} 
                          alt={slide.title} 
                          loading={idx < 2 ? "eager" : "lazy"} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            borderRadius: '8px' 
                          }} 
                        />
                      </div>
                      <Carousel.Caption style={{ 
                        backgroundColor: 'rgba(0,0,0,0.3)', 
                        backdropFilter: 'blur(2px)', 
                        borderRadius: '6px', 
                        padding: '6px 10px', 
                        bottom: '10px' 
                      }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>{slide.title}</h3>
                      </Carousel.Caption>
                    </Carousel.Item>
                  );
                })}
              </Carousel>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // Versión desktop (carrusel principal + lateral)
  return (
    <Container fluid style={{ padding: '10px 5px 5px 5px', backgroundColor: '#CACECF' }}>
      <Row className="g-0">
        {/* CARRUSEL PRINCIPAL: con padding right 5px para separación del lateral */}
        <Col lg={9} md={12} style={{ paddingRight: '5px' }}>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Carousel 
              activeIndex={currentIndex} 
              onSelect={handleMainSelect} 
              fade 
              indicators 
              controls 
              interval={null} 
              className="main-carousel"
            >
              {images.main.map((img, idx) => renderMainSlide(img, idx))}
            </Carousel>
          </div>
        </Col>

        {/* CARRUSEL LATERAL: sin padding extra, solo visible en lg */}
        <Col lg={3} md={0} className="d-none d-lg-block" style={{ paddingLeft: 0 }}>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Carousel 
              activeIndex={currentIndex} 
              onSelect={handleSideSelect} 
              indicators={false} 
              controls={false} 
              interval={null} 
              className="side-carousel"
            >
              {images.side.map((img, idx) => renderSideSlide(img, idx))}
            </Carousel>
          </div>
          
        </Col>
      </Row>
    </Container>
  );
});

HeaderCarousel.displayName = 'HeaderCarousel';
export default HeaderCarousel;
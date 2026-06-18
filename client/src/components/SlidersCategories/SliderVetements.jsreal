import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Mapa de colores para cada categoría
const colorMap = {
  primary: '#667eea',
  secondary: '#48c6ef',
  success: '#37ecba',
  warning: '#f5576c',
  info: '#6a11cb',
  dark: '#2d3748',
  danger: '#ff9a9e'
};

// Subcategorías de vestimenta
const vetementsData = [
  { id: 'vetements_homme', name: 'Homme', emoji: '👔', color: 'primary' },
  { id: 'vetements_femme', name: 'Femme', emoji: '👗', color: 'danger' },
  { id: 'chaussures_homme', name: 'Chaussures Homme', emoji: '👞', color: 'secondary' },
  { id: 'chaussures_femme', name: 'Chaussures Femme', emoji: '👠', color: 'warning' },
  { id: 'garcons', name: 'Garçons', emoji: '👦', color: 'info' },
  { id: 'filles', name: 'Filles', emoji: '👧', color: 'danger' },
  { id: 'bebe', name: 'Bébé', emoji: '👶', color: 'success' },
  { id: 'tenues_pro', name: 'Tenues Pro', emoji: '👔', color: 'dark' },
  { id: 'sacs', name: 'Sacs', emoji: '👜', color: 'warning' },
  { id: 'montres', name: 'Montres', emoji: '⌚', color: 'secondary' },
  { id: 'lunettes', name: 'Lunettes', emoji: '👓', color: 'info' },
  { id: 'bijoux', name: 'Bijoux', emoji: '💎', color: 'primary' }
];

const SliderVetements = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const rowsContainerRef = useRef(null);

  // Configuración responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Reset scroll position en mobile
      if (mobile && scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
        setScrollPosition(0);
        updateScrollButtons();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configuración inicial de filas
  const itemsPerRow = isMobile ? 6 : 8;
  const firstRow = vetementsData.slice(0, itemsPerRow);
  const secondRow = vetementsData.slice(itemsPerRow);

  // Actualizar estado de botones de scroll
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll functions para mobile
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Manejar scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
      updateScrollButtons();
    }
  };

  // Renderizar fila de emojis - Versión minimalista
  const renderEmojiRow = (row, rowIndex) => {
    const marginBottom = rowIndex === 0 ? (isMobile ? '6px' : '8px') : '0px';
    
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '4px' : '15px',
          padding: isMobile ? '10px 8px' : '15px 20px',
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto',
          marginBottom: marginBottom
        }}
      >
        {row.map((category) => {
          const colorHex = colorMap[category.color] || colorMap.primary;
          
          return (
            <Link
              key={`${category.id}-${rowIndex}`}
              to={`/vetements/${category.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '70px' : '90px',
                padding: '5px'
              }}
            >
              {/* Círculo del emoji - Minimalista */}
              <div
                style={{
                  width: isMobile ? '60px' : '70px',
                  height: isMobile ? '60px' : '70px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorHex}10 0%, ${colorHex}05 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `1.5px solid ${colorHex}20`,
                  marginBottom: '6px',
                  transition: 'transform 0.2s ease'
                }}
              >
                <span 
                  style={{ 
                    fontSize: isMobile ? '1.8rem' : '2rem',
                    lineHeight: 1
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría - Texto más pequeño */}
              <div style={{
                textAlign: 'center',
                width: '100%'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: '500',
                  color: '#555',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.1'
                }}>
                  {isMobile && category.name.length > 8 
                    ? `${category.name.substring(0, 6)}...` 
                    : category.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="vetements-slider-container">
      {/* Card contenedor - Sin títulos, más compacto */}
      <div style={{
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.04)'
      }}>
        {/* Contenido con scroll horizontal en mobile - SIN TÍTULO */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '15px 0' : '20px 0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            minHeight: isMobile ? 'auto' : '160px'
          }}
        >
          {/* Contenedor de filas */}
          <div ref={rowsContainerRef} style={{
            position: 'relative'
          }}>
            {/* Primera fila */}
            {firstRow.length > 0 && renderEmojiRow(firstRow, 0)}

            {/* Segunda fila */}
            {secondRow.length > 0 && renderEmojiRow(secondRow, 1)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile - Más discretos */}
        {isMobile && (
          <>
            {/* Botón izquierdo */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#667eea',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronLeft size={14} />
              </button>
            )}

            {/* Botón derecho */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#667eea',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronRight size={14} />
              </button>
            )}

            {/* Indicadores de scroll (dots) - Más discretos */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '5px',
              padding: '5px 0 10px 0',
              position: 'relative',
              zIndex: 10
            }}>
              {[0, 1].map((dot, index) => {
                const isActive = index === Math.floor(scrollPosition / 300);
                return (
                  <div
                    key={index}
                    style={{
                      width: isActive ? '6px' : '5px',
                      height: isActive ? '6px' : '5px',
                      borderRadius: '50%',
                      background: isActive ? '#667eea' : '#e0e0e0',
                      transition: 'all 0.3s ease',
                      opacity: isActive ? 1 : 0.5
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Footer muy minimalista - Solo borde sutil */}
        <div style={{
          padding: isMobile ? '5px 12px' : '8px 20px',
          borderTop: '1px solid rgba(0,0,0,0.03)',
          background: 'rgba(248, 249, 250, 0.3)',
          height: '4px'
        }} />
      </div>

      {/* Estilos CSS minimalistas */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .vetements-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Efecto de press muy sutil */
        .vetements-slider-container a:active div:first-child {
          transform: scale(0.92);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .vetements-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .vetements-slider-container {
          contain: content;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .vetements-slider-container > div > div:first-child::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 15px;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
          
          .vetements-slider-container > div > div:first-child::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 15px;
            height: 100%;
            background: linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
        }
        
        /* Optimización para pantallas muy pequeñas */
        @media (max-width: 380px) {
          .vetements-slider-container a {
            width: 60px !important;
          }
          
          .vetements-slider-container a > div:first-child {
            width: 50px !important;
            height: 50px !important;
          }
          
          .vetements-slider-container a > div:first-child span {
            font-size: 1.6rem !important;
          }
          
          /* Botones más pequeños y discretos */
          .vetements-slider-container button {
            width: 28px !important;
            height: 28px !important;
            background: rgba(255, 255, 255, 0.9) !important;
          }
          
          .vetements-slider-container button svg {
            width: 12px !important;
            height: 12px !important;
          }
        }
        
        /* Smooth transitions muy ligeras */
        .vetements-slider-container button,
        .vetements-slider-container a:active div:first-child {
          transition: all 0.15s ease;
        }
        
        /* Sin efectos hover */
        @media (hover: hover) and (pointer: fine) {
          .vetements-slider-container a div:first-child,
          .vetements-slider-container a span {
            transition: none !important;
          }
        }
        
        /* Asegurar que los emojis se muestren correctamente */
        .vetements-slider-container span[role="img"] {
          display: inline-block;
          font-style: normal;
        }
        
        /* Para pantallas medianas */
        @media (min-width: 768px) and (max-width: 1024px) {
          .vetements-slider-container a {
            width: 80px !important;
          }
          
          .vetements-slider-container a > div:first-child {
            width: 65px !important;
            height: 65px !important;
          }
          
          .vetements-slider-container a > div:first-child span {
            font-size: 1.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderVetements;
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Mapa de colores para cada categoría
const colorMap = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  dark: '#343a40',
  danger: '#dc3545'
};

// Subcategorías de teléfonos
const telephonesData = [
  { id: 'smartphones', name: 'Smartphones', emoji: '📱', color: 'primary' },
  { id: 'telephones_cellulaires', name: 'Téléphones Cellulaires', emoji: '📞', color: 'secondary' },
  { id: 'tablettes', name: 'Tablettes', emoji: '📟', color: 'success' },
  { id: 'fixes_fax', name: 'Fixes & Fax', emoji: '☎️', color: 'warning' },
  { id: 'smartwatchs', name: 'Smartwatchs', emoji: '⌚', color: 'info' },
  { id: 'protection_antichoc', name: 'Protection Antichoc', emoji: '🛡️', color: 'dark' },
  { id: 'ecouteurs_son', name: 'Écouteurs & Son', emoji: '🎧', color: 'primary' },
  { id: 'chargeurs_cables', name: 'Chargeurs & Câbles', emoji: '⚡', color: 'warning' },
  { id: 'supports_stabilisateurs', name: 'Supports & Stabilisateurs', emoji: '📐', color: 'secondary' },
  { id: 'manettes', name: 'Manettes', emoji: '🎮', color: 'danger' },
  { id: 'vr', name: 'VR', emoji: '🥽', color: 'info' },
  { id: 'power_banks', name: 'Power Banks', emoji: '🔋', color: 'success' },
  { id: 'stylets', name: 'Stylets', emoji: '✏️', color: 'dark' },
  { id: 'cartes_memoire', name: 'Cartes Mémoire', emoji: '💾', color: 'primary' },
  { id: 'accessoires', name: 'Accessoires', emoji: '🎁', color: 'secondary' },
  { id: 'pieces_rechange', name: 'Pièces de Rechange', emoji: '🔧', color: 'warning' },
  { id: 'offres_abonnements', name: 'Offres & Abonnements', emoji: '📅', color: 'info' }
];

const SliderTelephones = () => {
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

  // Configuración inicial de filas - SIN MARGIN Y
  const itemsPerRow = isMobile ? 6 : 9;
  const firstRow = telephonesData.slice(0, itemsPerRow);
  const secondRow = telephonesData.slice(itemsPerRow);

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

  // Renderizar fila de emojis - COMPACTO, SIN MARGIN Y
  const renderEmojiRow = (row, rowIndex) => {
    // Sin marginBottom entre filas
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '3px' : '12px', // Menos gap
          padding: isMobile ? '5px 8px' : '10px 20px', // Menos padding vertical
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto'
        }}
      >
        {row.map((category) => {
          const colorHex = colorMap[category.color] || colorMap.primary;
          
          return (
            <Link
              key={`${category.id}-${rowIndex}`}
              to={`/telephones/${category.slug}/1`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '65px' : '85px',
                padding: '2px' // Padding mínimo
              }}
            >
              {/* Círculo del emoji - Más compacto */}
              <div
                style={{
                  width: isMobile ? '55px' : '65px',
                  height: isMobile ? '55px' : '65px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorHex}10 0%, ${colorHex}05 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `1.5px solid ${colorHex}25`,
                  marginBottom: '5px', // Menos espacio debajo del icono
                  transition: 'transform 0.2s ease'
                }}
              >
                <span 
                  style={{ 
                    fontSize: isMobile ? '1.6rem' : '1.8rem',
                    lineHeight: 1
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría - Texto compacto */}
              <div style={{
                textAlign: 'center',
                width: '100%',
                height: '28px', // Altura fija para alinear
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.65rem' : '0.7rem',
                  fontWeight: '500',
                  color: '#444',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.1',
                  width: '100%'
                }}>
                  {isMobile 
                    ? (category.name.length > 9 
                        ? `${category.name.substring(0, 8)}...` 
                        : category.name)
                    : (category.name.length > 12 
                        ? `${category.name.substring(0, 11)}...` 
                        : category.name)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="telephones-slider-container">
      {/* Card contenedor - Ultra compacto */}
      <div style={{
        position: 'relative',
        maxWidth: '1300px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '14px',
        boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.03)'
      }}>
        {/* Contenido con scroll horizontal en mobile - COMPACTO */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '8px 0' : '12px 0', // Padding vertical mínimo
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            minHeight: isMobile ? '130px' : '150px' // Altura mínima reducida
          }}
        >
          {/* Contenedor de filas */}
          <div ref={rowsContainerRef} style={{
            position: 'relative'
          }}>
            {/* Primera fila */}
            {firstRow.length > 0 && renderEmojiRow(firstRow, 0)}

            {/* Segunda fila - PEGADA a la primera */}
            {secondRow.length > 0 && renderEmojiRow(secondRow, 1)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile - Compactos */}
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
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#007bff',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaChevronLeft size={12} />
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
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#007bff',
                  transition: 'all 0.15s ease'
                }}
              >
                <FaChevronRight size={12} />
              </button>
            )}

            {/* Indicadores de scroll (dots) - Minimalistas */}
            {secondRow.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                padding: '4px 0 8px 0',
                position: 'relative',
                zIndex: 10
              }}>
                {[0, 1].map((dot, index) => {
                  const isActive = index === Math.floor(scrollPosition / 300);
                  return (
                    <div
                      key={index}
                      style={{
                        width: isActive ? '5px' : '4px',
                        height: isActive ? '5px' : '4px',
                        borderRadius: '50%',
                        background: isActive ? '#007bff' : '#ddd',
                        transition: 'all 0.2s ease',
                        opacity: isActive ? 1 : 0.6
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Footer ultra minimalista - Solo línea muy sutil */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.02), transparent)'
        }} />
      </div>

      {/* Estilos CSS ultra compactos */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .telephones-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Efecto de press muy ligero */
        .telephones-slider-container a:active div:first-child {
          transform: scale(0.9);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .telephones-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .telephones-slider-container {
          contain: content;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .telephones-slider-container > div > div:first-child::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 12px;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
          
          .telephones-slider-container > div > div:first-child::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 12px;
            height: 100%;
            background: linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
        }
        
        /* Optimización para pantallas muy pequeñas */
        @media (max-width: 380px) {
          .telephones-slider-container a {
            width: 55px !important;
          }
          
          .telephones-slider-container a > div:first-child {
            width: 45px !important;
            height: 45px !important;
          }
          
          .telephones-slider-container a > div:first-child span {
            font-size: 1.4rem !important;
          }
          
          .telephones-slider-container a > div:last-child {
            height: 24px !important;
          }
          
          .telephones-slider-container a span {
            font-size: 0.6rem !important;
          }
          
          /* Botones más pequeños */
          .telephones-slider-container button {
            width: 26px !important;
            height: 26px !important;
          }
          
          .telephones-slider-container button svg {
            width: 10px !important;
            height: 10px !important;
          }
        }
        
        /* Para pantallas medianas */
        @media (min-width: 768px) and (max-width: 1024px) {
          .telephones-slider-container a {
            width: 75px !important;
          }
          
          .telephones-slider-container a > div:first-child {
            width: 60px !important;
            height: 60px !important;
          }
          
          .telephones-slider-container a > div:first-child span {
            font-size: 1.7rem !important;
          }
        }
        
        /* Sin efectos hover */
        @media (hover: hover) and (pointer: fine) {
          .telephones-slider-container a div:first-child,
          .telephones-slider-container a span {
            transition: none !important;
          }
        }
        
        /* Asegurar que los emojis se muestren correctamente */
        .telephones-slider-container span[role="img"] {
          display: inline-block;
          font-style: normal;
        }
        
        /* Compactar aún más en desktop grande */
        @media (min-width: 1025px) {
          .telephones-slider-container > div {
            max-width: 1200px !important;
          }
          
          .telephones-slider-container a {
            width: 80px !important;
          }
          
          .telephones-slider-container a > div:first-child {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderTelephones;
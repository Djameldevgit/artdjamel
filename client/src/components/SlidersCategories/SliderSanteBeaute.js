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
  danger: '#ff9a9e',
  pink: '#e83e8c'
};

// Subcategorías de santé & beauté
const santeBeauteData = [
  { id: 'cosmetiques_beaute', name: 'Cosmétiques & Beauté', emoji: '💄', color: 'pink' },
  { id: 'parfums_deodorants_femme', name: 'Parfums Femme', emoji: '🌸', color: 'danger' },
  { id: 'parfums_deodorants_homme', name: 'Parfums Homme', emoji: '🌿', color: 'primary' },
  { id: 'parapharmacie_sante', name: 'Parapharmacie & Santé', emoji: '💊', color: 'success' }
];

const SliderSanteBeaute = () => {
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
  const itemsPerRow = isMobile ? 4 : 4; // Solo 4 categorías, todas en una fila
  const firstRow = santeBeauteData.slice(0, itemsPerRow);

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

  // Renderizar fila de emojis - SIN HOVER
  const renderEmojiRow = (row, rowIndex) => {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '15px' : '30px',
          padding: isMobile ? '15px 8px' : '25px 20px',
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto'
        }}
      >
        {row.map((category) => {
          const colorHex = colorMap[category.color] || colorMap.primary;
          
          return (
            <Link
              key={`${category.id}-${rowIndex}`}
              to={`/sante-beaute/${category.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '100px' : '150px'
              }}
            >
              {/* Círculo del emoji - Más grande para pocas categorías */}
              <div
                style={{
                  width: isMobile ? '85px' : '120px',
                  height: isMobile ? '85px' : '120px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorHex}15 0%, ${colorHex}10 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `2px solid ${colorHex}30`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  marginBottom: '12px',
                  transition: 'transform 0.2s ease'
                }}
              >
                <span 
                  style={{ 
                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría - Más espacio para texto */}
              <div style={{
                textAlign: 'center',
                width: '100%'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.85rem' : '1rem',
                  fontWeight: '600',
                  color: '#333',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  padding: '0 2px',
                  lineHeight: '1.3',
                  height: isMobile ? '38px' : '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="sante-beaute-slider-container">
      {/* Card contenedor - Misma estructura pero con colores de belleza */}
      <div style={{
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)'
      }}>
        {/* Título de la sección - Colores de belleza */}
        <div style={{
          padding: isMobile ? '15px 12px 5px' : '20px 20px 10px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          background: 'linear-gradient(135deg, #e83e8c10 0%, #d6338410 100%)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: '700',
            color: '#e83e8c',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.2em' }}>💄</span>
            {isMobile ? 'Santé & Beauté' : 'Toutes les catégories santé & beauté'}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#666'
          }}>
            Découvrez nos produits de beauté et santé
          </p>
        </div>

        {/* Contenido con scroll horizontal en mobile */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '15px 0' : '25px 0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            minHeight: isMobile ? 'auto' : '220px'
          }}
        >
          {/* Contenedor de filas */}
          <div ref={rowsContainerRef} style={{
            position: 'relative'
          }}>
            {/* Solo una fila (4 categorías) */}
            {firstRow.length > 0 && renderEmojiRow(firstRow, 0)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile - Colores rosas */}
        {isMobile && (
          <>
            {/* Botón izquierdo */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e83e8c 0%, #d63384 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(232, 62, 140, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronLeft size={18} color="white" />
              </button>
            )}

            {/* Botón derecho */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e83e8c 0%, #d63384 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(232, 62, 140, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronRight size={18} color="white" />
              </button>
            )}
          </>
        )}

        {/* Footer minimalista - Colores rosas */}
        <div style={{
          padding: isMobile ? '8px 12px' : '10px 20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(248, 249, 250, 0.4)',
          textAlign: 'center'
        }}>
          <Link 
            to="/sante-beaute"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              color: '#e83e8c',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(232, 62, 140, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            Voir tous les produits santé & beauté
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Estilos CSS - SIN HOVER EFFECTS */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .sante-beaute-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Solo efecto de press para mobile/touch */
        .sante-beaute-slider-container a:active div:first-child {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .sante-beaute-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .sante-beaute-slider-container {
          contain: content;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .sante-beaute-slider-container > div > div:nth-child(2)::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
          
          .sante-beaute-slider-container > div > div:nth-child(2)::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
        }
        
        /* Optimización para pantallas muy pequeñas */
        @media (max-width: 380px) {
          .sante-beaute-slider-container a {
            width: 85px !important;
          }
          
          .sante-beaute-slider-container a > div:first-child {
            width: 70px !important;
            height: 70px !important;
          }
          
          .sante-beaute-slider-container a > div:first-child span {
            font-size: 2rem !important;
          }
          
          .sante-beaute-slider-container a span {
            font-size: 0.75rem !important;
            height: 32px !important;
          }
          
          /* Botones más pequeños en pantallas muy pequeñas */
          .sante-beaute-slider-container button {
            width: 32px !important;
            height: 32px !important;
          }
          
          .sante-beaute-slider-container button svg {
            width: 16px !important;
            height: 16px !important;
          }
        }
        
        /* Smooth transitions solo para elementos necesarios */
        .sante-beaute-slider-container button,
        .sante-beaute-slider-container a:active div:first-child {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mejor visualización en PCs grandes */
        @media (min-width: 1200px) {
          .sante-beaute-slider-container > div {
            max-width: 1200px !important;
          }
        }
        
        /* SIN EFECTOS HOVER PARA PCs */
        @media (hover: hover) and (pointer: fine) {
          .sante-beaute-slider-container a div:first-child,
          .sante-beaute-slider-container a span,
          .sante-beaute-slider-container a {
            transition: none !important;
          }
          
          .sante-beaute-slider-container a div:first-child:hover,
          .sante-beaute-slider-container a:hover {
            transform: none !important;
          }
          
          .sante-beaute-slider-container a:hover {
            opacity: 1 !important;
          }
        }
        
        /* Asegurar que los emojis se muestren correctamente */
        .sante-beaute-slider-container span[role="img"] {
          display: inline-block;
          font-style: normal;
        }
        
        /* Para pocas categorías en desktop */
        @media (min-width: 768px) {
          .sante-beaute-slider-container a {
            width: 180px !important;
          }
          
          .sante-beaute-slider-container a > div:first-child {
            width: 130px !important;
            height: 130px !important;
          }
          
          .sante-beaute-slider-container a > div:first-child span {
            font-size: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderSanteBeaute;
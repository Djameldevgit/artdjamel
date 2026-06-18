import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Subcategorías de emploi
const emploiData = [
  { id: 'offres_emploi', name: 'Offres d\'emploi', emoji: '💼', color: 'primary' },
  { id: 'demandes_emploi', name: 'Demandes d\'emploi', emoji: '📋', color: 'info' }
];

const SliderEmploi = () => {
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
  const itemsPerRow = isMobile ? 2 : 2; // Solo 2 categorías
  const firstRow = emploiData.slice(0, itemsPerRow);

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
          gap: isMobile ? '30px' : '60px',
          padding: isMobile ? '15px 8px' : '25px 20px',
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto'
        }}
      >
        {row.map((category) => {
          const colorHex = category.color === 'info' ? '#6a11cb' : '#667eea';
          
          return (
            <Link
              key={`${category.id}-${rowIndex}`}
              to={`/emploi/${category.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '150px' : '250px'
              }}
            >
              {/* Círculo del emoji - Más grande para pocas categorías */}
              <div
                style={{
                  width: isMobile ? '100px' : '150px',
                  height: isMobile ? '100px' : '150px',
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
                    fontSize: isMobile ? '3rem' : '4rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría - Más espacio */}
              <div style={{
                textAlign: 'center',
                width: '100%'
              }}>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '600',
                  color: '#333',
                  display: 'block',
                  whiteSpace: 'normal',
                  padding: '0 2px',
                  lineHeight: '1.3'
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
    <div ref={containerRef} className="emploi-slider-container">
      {/* Card contenedor - Misma estructura */}
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
        {/* Título de la sección */}
        <div style={{
          padding: isMobile ? '15px 12px 5px' : '20px 20px 10px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: '700',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.2em' }}>💼</span>
            {isMobile ? 'Emploi' : 'Offres et demandes d\'emploi'}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#666'
          }}>
            Découvrez nos catégories d'emploi
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
            {/* Solo una fila (2 categorías) */}
            {firstRow.length > 0 && renderEmojiRow(firstRow, 0)}
          </div>
        </div>

        {/* Footer minimalista */}
        <div style={{
          padding: isMobile ? '8px 12px' : '10px 20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(248, 249, 250, 0.4)',
          textAlign: 'center'
        }}>
          <Link 
            to="/emploi"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              color: '#667eea',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(102, 126, 234, 0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            Voir toutes les offres d'emploi
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Estilos CSS - SIN HOVER EFFECTS */}
      <style>{`
        .emploi-slider-container ::-webkit-scrollbar { display: none; }
        .emploi-slider-container a:active div:first-child {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        .emploi-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        @media (max-width: 380px) {
          .emploi-slider-container a { width: 120px !important; }
          .emploi-slider-container a > div:first-child { 
            width: 80px !important; height: 80px !important; 
          }
          .emploi-slider-container a > div:first-child span { 
            font-size: 2.5rem !important; 
          }
        }
        @media (hover: hover) and (pointer: fine) {
          .emploi-slider-container a div:first-child,
          .emploi-slider-container a span,
          .emploi-slider-container a {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderEmploi;
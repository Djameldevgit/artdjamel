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
  pink: '#e83e8c',
  brown: '#795548',
  light: '#f8f9fa'
};

// Subcategorías de alimentaires
const alimentairesData = [
  { id: 'produits_laitiers', name: 'Produits Laitiers', emoji: '🥛', color: 'light' },
  { id: 'fruits_secs', name: 'Fruits Secs', emoji: '🥜', color: 'brown' },
  { id: 'graines_riz_cereales', name: 'Graines & Céréales', emoji: '🌾', color: 'warning' },
  { id: 'sucres_produits_sucres', name: 'Sucres & Produits Sucrés', emoji: '🍬', color: 'pink' },
  { id: 'boissons', name: 'Boissons', emoji: '🥤', color: 'info' },
  { id: 'viandes_poissons', name: 'Viandes & Poissons', emoji: '🍖', color: 'danger' },
  { id: 'cafe_the_infusion', name: 'Café & Thé', emoji: '☕', color: 'brown' },
  { id: 'complements_alimentaires', name: 'Compléments Alimentaires', emoji: '💊', color: 'success' },
  { id: 'miel_derives', name: 'Miel & Dérivés', emoji: '🍯', color: 'warning' },
  { id: 'fruits_legumes', name: 'Fruits & Légumes', emoji: '🍎', color: 'success' },
  { id: 'ble_farine', name: 'Blé & Farine', emoji: '🌾', color: 'light' },
  { id: 'bonbons_chocolat', name: 'Bonbons & Chocolat', emoji: '🍫', color: 'brown' },
  { id: 'boulangerie_viennoiserie', name: 'Boulangerie & Viennoiserie', emoji: '🥐', color: 'warning' },
  { id: 'ingredients_cuisine_patisserie', name: 'Ingrédients Cuisine', emoji: '🧂', color: 'secondary' },
  { id: 'noix_graines', name: 'Noix & Graines', emoji: '🌰', color: 'brown' },
  { id: 'plats_cuisines', name: 'Plats Cuisinés', emoji: '🍲', color: 'danger' },
  { id: 'sauces_epices_condiments', name: 'Sauces & Épices', emoji: '🌶️', color: 'warning' },
  { id: 'oeufs', name: 'Œufs', emoji: '🥚', color: 'light' },
  { id: 'huiles', name: 'Huiles', emoji: '🫒', color: 'warning' },
  { id: 'pates', name: 'Pâtes', emoji: '🍝', color: 'light' },
  { id: 'gateaux', name: 'Gâteaux', emoji: '🎂', color: 'pink' },
  { id: 'emballage', name: 'Emballage', emoji: '📦', color: 'secondary' },
  { id: 'aliments_bebe', name: 'Aliments Bébé', emoji: '👶', color: 'pink' },
  { id: 'aliments_dietetiques', name: 'Aliments Diététiques', emoji: '🥗', color: 'success' }
];

const SliderAlimentaires = () => {
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
  const itemsPerRow = isMobile ? 4 : 8;
  const firstRow = alimentairesData.slice(0, itemsPerRow);
  const secondRow = alimentairesData.slice(itemsPerRow, itemsPerRow * 2);
  const thirdRow = alimentairesData.slice(itemsPerRow * 2);

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
    const marginBottom = rowIndex < 2 ? (isMobile ? '8px' : '10px') : '0px';
    
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '8px' : '15px',
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
              to={`/alimentaires/${category.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '85px' : '110px'
              }}
            >
              {/* Círculo del emoji - SIN HOVER EFFECTS */}
              <div
                style={{
                  width: isMobile ? '70px' : '85px',
                  height: isMobile ? '70px' : '85px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorHex}15 0%, ${colorHex}10 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `2px solid ${colorHex}30`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  marginBottom: '8px',
                  transition: 'transform 0.2s ease'
                }}
              >
                <span 
                  style={{ 
                    fontSize: isMobile ? '2rem' : '2.3rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría */}
              <div style={{
                textAlign: 'center',
                width: '100%'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  fontWeight: '600',
                  color: '#333',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '0 2px',
                  lineHeight: '1.2'
                }}>
                  {isMobile && category.name.length > 12 
                    ? `${category.name.substring(0, 10)}...` 
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
    <div ref={containerRef} className="alimentaires-slider-container">
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
            <span style={{ fontSize: '1.2em' }}>🍎</span>
            {isMobile ? 'Alimentaires' : 'Toutes les catégories alimentaires'}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#666'
          }}>
            Découvrez nos catégories d'aliments et produits alimentaires
          </p>
        </div>

        {/* Contenido con scroll horizontal en mobile */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '12px 0' : '20px 0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            minHeight: isMobile ? 'auto' : '180px'
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

            {/* Tercera fila (si existe) */}
            {thirdRow.length > 0 && renderEmojiRow(thirdRow, 2)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile */}
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
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

            {/* Indicadores de scroll (dots) */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 0 12px 0',
              position: 'relative',
              zIndex: 10
            }}>
              {[0, 1, 2].map((dot, index) => {
                const isActive = index === Math.floor(scrollPosition / 300);
                return (
                  <div
                    key={index}
                    style={{
                      width: isActive ? '8px' : '6px',
                      height: isActive ? '8px' : '6px',
                      borderRadius: '50%',
                      background: isActive 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : '#e0e0e0',
                      transition: 'all 0.3s ease',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Footer minimalista */}
        <div style={{
          padding: isMobile ? '8px 12px' : '10px 20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(248, 249, 250, 0.4)',
          textAlign: 'center'
        }}>
          <Link 
            to="/alimentaires"
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
            Voir tous les produits alimentaires
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Estilos CSS - SIN HOVER EFFECTS */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .alimentaires-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Solo efecto de press para mobile/touch */
        .alimentaires-slider-container a:active div:first-child {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .alimentaires-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .alimentaires-slider-container {
          contain: content;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .alimentaires-slider-container > div > div:nth-child(2)::before {
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
          
          .alimentaires-slider-container > div > div:nth-child(2)::after {
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
          .alimentaires-slider-container a {
            width: 75px !important;
          }
          
          .alimentaires-slider-container a > div:first-child {
            width: 58px !important;
            height: 58px !important;
          }
          
          .alimentaires-slider-container a > div:first-child span {
            font-size: 1.8rem !important;
          }
          
          /* Botones más pequeños en pantallas muy pequeñas */
          .alimentaires-slider-container button {
            width: 32px !important;
            height: 32px !important;
          }
          
          .alimentaires-slider-container button svg {
            width: 16px !important;
            height: 16px !important;
          }
        }
        
        /* Smooth transitions solo para elementos necesarios */
        .alimentaires-slider-container button,
        .alimentaires-slider-container a:active div:first-child {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mejor visualización en PCs grandes */
        @media (min-width: 1200px) {
          .alimentaires-slider-container > div {
            max-width: 1200px !important;
          }
        }
        
        /* SIN EFECTOS HOVER PARA PCs */
        @media (hover: hover) and (pointer: fine) {
          .alimentaires-slider-container a div:first-child,
          .alimentaires-slider-container a span,
          .alimentaires-slider-container a {
            transition: none !important;
          }
          
          .alimentaires-slider-container a div:first-child:hover,
          .alimentaires-slider-container a:hover {
            transform: none !important;
          }
          
          .alimentaires-slider-container a:hover {
            opacity: 1 !important;
          }
        }
        
        /* Asegurar que los emojis se muestren correctamente */
        .alimentaires-slider-container span[role="img"] {
          display: inline-block;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default SliderAlimentaires ;
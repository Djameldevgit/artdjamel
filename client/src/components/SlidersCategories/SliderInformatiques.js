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

// Subcategorías de informática
const informatiqueData = [
  { id: 'ordinateurs_portables', name: 'Ordinateurs Portables', emoji: '💻', color: 'primary' },
  { id: 'ordinateurs_bureau', name: 'Ordinateurs Bureau', emoji: '🖥️', color: 'secondary' },
  { id: 'serveurs', name: 'Serveurs', emoji: '🗄️', color: 'dark' },
  { id: 'ecrans', name: 'Écrans', emoji: '🖥️', color: 'info' },
  { id: 'composants_pc_fixe', name: 'Composants PC Fixe', emoji: '⚙️', color: 'warning' },
  { id: 'composants_pc_portable', name: 'Composants PC Portable', emoji: '💻', color: 'success' },
  { id: 'composants_serveur', name: 'Composants Serveur', emoji: '💽', color: 'danger' },
  { id: 'imprimantes_cartouches', name: 'Imprimantes & Cartouches', emoji: '🖨️', color: 'primary' },
  { id: 'reseau_connexion', name: 'Réseau & Connexion', emoji: '📡', color: 'info' },
  { id: 'stockage_externe_racks', name: 'Stockage Externe', emoji: '💾', color: 'secondary' },
  { id: 'onduleurs_stabilisateurs', name: 'Onduleurs & Stabilisateurs', emoji: '🔌', color: 'warning' },
  { id: 'compteuses_billets', name: 'Compteuses Billets', emoji: '💰', color: 'success' },
  { id: 'claviers_souris', name: 'Claviers & Souris', emoji: '⌨️', color: 'dark' },
  { id: 'casques_son', name: 'Casques & Son', emoji: '🎧', color: 'primary' },
  { id: 'webcam_videoconference', name: 'Webcam & Vidéoconférence', emoji: '📹', color: 'info' },
  { id: 'data_shows', name: 'Data Shows', emoji: '📽️', color: 'secondary' },
  { id: 'cables_adaptateurs', name: 'Câbles & Adaptateurs', emoji: '🔌', color: 'warning' },
  { id: 'stylets_tablettes', name: 'Stylets & Tablettes', emoji: '✏️', color: 'success' },
  { id: 'cartables_sacoches', name: 'Cartables & Sacoches', emoji: '💼', color: 'primary' },
  { id: 'manettes_simulateurs', name: 'Manettes & Simulateurs', emoji: '🎮', color: 'danger' },
  { id: 'vr', name: 'VR', emoji: '🥽', color: 'info' }
];

const SliderInformatiques = () => {
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
  const itemsPerRow = isMobile ? 5 : 7;
  const firstRow = informatiqueData.slice(0, itemsPerRow);
  const secondRow = informatiqueData.slice(itemsPerRow, itemsPerRow * 2);
  const thirdRow = informatiqueData.slice(itemsPerRow * 2);

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

  // Renderizar fila de emojis
  const renderEmojiRow = (row, rowIndex) => {
    const marginBottom = rowIndex < 2 ? (isMobile ? '5px' : '8px') : '0px';
    
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '3px' : '10px',
          padding: isMobile ? '8px 6px' : '12px 15px',
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
              to={`/informatique/${category.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '72px' : '85px',
                padding: '3px'
              }}
            >
              {/* Círculo del emoji - Estilo tecnológico */}
              <div
                style={{
                  width: isMobile ? '60px' : '70px',
                  height: isMobile ? '60px' : '70px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colorHex}15 0%, ${colorHex}08 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: `1.5px solid ${colorHex}30`,
                  marginBottom: '6px',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.05)'
                }}
              >
                <span 
                  style={{ 
                    fontSize: isMobile ? '1.7rem' : '1.9rem',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }}
                >
                  {category.emoji}
                </span>
              </div>

              {/* Nombre de la categoría - Optimizado para texto largo */}
              <div style={{
                textAlign: 'center',
                width: '100%',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.68rem' : '0.75rem',
                  fontWeight: '500',
                  color: '#333',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  lineHeight: '1.1',
                  width: '100%',
                  maxHeight: '28px'
                }}>
                  {isMobile 
                    ? (category.name.length > 12 
                        ? `${category.name.substring(0, 10)}...` 
                        : category.name)
                    : (category.name.length > 15 
                        ? `${category.name.substring(0, 14)}...` 
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
    <div ref={containerRef} className="informatique-slider-container">
      {/* Card contenedor - Estilo tecnológico */}
      <div style={{
        position: 'relative',
        maxWidth: '1300px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)'
      }}>
        {/* Título minimalista */}
        <div style={{
          padding: isMobile ? '12px 12px 8px' : '15px 20px 10px',
          borderBottom: '1px solid rgba(0,123,255,0.1)',
          background: 'rgba(0, 123, 255, 0.03)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0,123,255,0.2)'
            }}>
              <span style={{ fontSize: '1.3rem', color: 'white' }}>💻</span>
            </div>
            <div>
              <h5 style={{
                margin: 0,
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '700',
                color: '#007bff'
              }}>
                {isMobile ? 'Informática' : 'Categorías de Informática'}
              </h5>
              <p style={{
                margin: '2px 0 0 0',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                color: '#666'
              }}>
                {isMobile ? '21 subcategorías' : 'Explora todas las subcategorías tecnológicas'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido con scroll horizontal en mobile */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '10px 0' : '15px 0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            position: 'relative',
            minHeight: isMobile ? 'auto' : '190px'
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

        {/* Botones de scroll solo en mobile - Estilo tecnológico */}
        {isMobile && (
          <>
            {/* Botón izquierdo */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(0,123,255,0.2)',
                  boxShadow: '0 3px 12px rgba(0,123,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#007bff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,123,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.98)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
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
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(0,123,255,0.2)',
                  boxShadow: '0 3px 12px rgba(0,123,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#007bff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,123,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.98)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <FaChevronRight size={14} />
              </button>
            )}

            {/* Indicadores de scroll (dots) */}
            {thirdRow.length > 0 && (
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
                          ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' 
                          : '#e0e0e0',
                        transition: 'all 0.3s ease',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Footer con enlace a todas las categorías */}
        <div style={{
          padding: isMobile ? '8px 12px' : '12px 20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(248, 249, 250, 0.6)',
          textAlign: 'center'
        }}>
          <Link 
            to="/informatique"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              color: '#007bff',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(0, 123, 255, 0.08)',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(0,123,255,0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 123, 255, 0.12)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 123, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Ver todas las subcategorías
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Estilos CSS */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .informatique-slider-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Efecto de press sutil */
        .informatique-slider-container a:active div:first-child {
          transform: scale(0.92);
          transition: transform 0.1s ease;
        }
        
        /* Prevenir zoom en doble tap */
        .informatique-slider-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .informatique-slider-container {
          contain: content;
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) */
        @media (max-width: 767px) {
          .informatique-slider-container > div > div:nth-child(2)::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
          
          .informatique-slider-container > div > div:nth-child(2)::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
            pointer-events: none;
            z-index: 15;
          }
        }
        
        /* Optimización para pantallas muy pequeñas */
        @media (max-width: 380px) {
          .informatique-slider-container a {
            width: 65px !important;
          }
          
          .informatique-slider-container a > div:first-child {
            width: 52px !important;
            height: 52px !important;
          }
          
          .informatique-slider-container a > div:first-child span {
            font-size: 1.5rem !important;
          }
          
          .informatique-slider-container a > div:last-child {
            min-height: 28px !important;
          }
          
          .informatique-slider-container a span {
            font-size: 0.65rem !important;
          }
          
          /* Botones más pequeños */
          .informatique-slider-container button {
            width: 30px !important;
            height: 30px !important;
          }
          
          .informatique-slider-container button svg {
            width: 12px !important;
            height: 12px !important;
          }
        }
        
        /* Para pantallas medianas */
        @media (min-width: 768px) and (max-width: 1024px) {
          .informatique-slider-container a {
            width: 80px !important;
          }
          
          .informatique-slider-container a > div:first-child {
            width: 65px !important;
            height: 65px !important;
          }
          
          .informatique-slider-container a > div:first-child span {
            font-size: 1.8rem !important;
          }
        }
        
        /* Sin efectos hover para móviles */
        @media (hover: hover) and (pointer: fine) {
          .informatique-slider-container a div:first-child:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
          }
        }
        
        /* Asegurar que los emojis se muestren correctamente */
        .informatique-slider-container span[role="img"] {
          display: inline-block;
          font-style: normal;
        }
        
        /* Compactar en desktop grande */
        @media (min-width: 1025px) {
          .informatique-slider-container > div {
            max-width: 1200px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderInformatiques;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import categoryMeubles from '../CATEGORIES/categoryNivel/categoryMeubles';

// Mapa de colores
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
  green: '#28a745'
};

const SliderMeubles = () => {
  const { subcategorySlug, subsubcategorySlug } = useParams();
  const history = useHistory();
  
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1); // 1: subcategorías, 2: sub-subcategorías
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const rowsContainerRef = useRef(null);

  // Determinar nivel inicial basado en URL
  useEffect(() => {
    if (subsubcategorySlug && subsubcategorySlug !== 'undefined') {
      // Estamos en nivel 3: sub-subcategoría
      const parentCategory = categoryMeubles.categories.find(
        cat => categoryMeubles.subcategories[cat.id]?.some(
          sub => sub.id === subsubcategorySlug
        )
      );
      
      if (parentCategory) {
        setSelectedCategory(parentCategory);
        setCurrentLevel(2);
      }
    } else if (subcategorySlug && subcategorySlug !== 'undefined') {
      // Estamos en nivel 2: subcategoría
      const category = categoryMeubles.categories.find(
        cat => cat.id === subcategorySlug
      );
      
      if (category) {
        if (category.hasSublevel) {
          setSelectedCategory(category);
          setCurrentLevel(2);
        }
        // Si no tiene subniveles, quedamos en nivel 1
      }
    }
    
    // Configuración responsive
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile && scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
        setScrollPosition(0);
        updateScrollButtons();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [subcategorySlug, subsubcategorySlug]);

  // Obtener datos según nivel actual
  const getCurrentData = () => {
    if (currentLevel === 1) {
      return categoryMeubles.categories || [];
    } else if (currentLevel === 2 && selectedCategory) {
      return categoryMeubles.subcategories[selectedCategory.id] || [];
    }
    return [];
  };

  // Calcular distribución en dos filas - EXACTO como SliderElectromenager
  const currentData = getCurrentData();
  const halfIndex = Math.ceil(currentData.length / 2);
  const firstRow = currentData.slice(0, halfIndex);
  const secondRow = currentData.slice(halfIndex);

  // Función para obtener la ruta del icono
  const getIconPath = (iconName) => {
    if (currentLevel === 1) {
      return `/icons/meubles/${iconName}`;
    } else {
      return `/icons/meubles/${selectedCategory?.id || 'default'}/${iconName}`;
    }
  };

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

  // Manejar clic en un ítem
  const handleItemClick = (item) => {
    if (currentLevel === 1) {
      if (item.hasSublevel) {
        // Tiene sub-subcategorías: mostrar nivel 2
        setSelectedCategory(item);
        setCurrentLevel(2);
        // Resetear scroll
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = 0;
          setScrollPosition(0);
          updateScrollButtons();
        }
      } else {
        // No tiene subniveles: navegar a página de subcategoría
        history.push(`/meubles/${item.id}/1`);
      }
    } else if (currentLevel === 2) {
      // En nivel 2: navegar a página de sub-subcategoría
      history.push(`/meubles/${selectedCategory.id}/${item.id}/1`);
    }
  };

  // Volver al nivel anterior
  const handleBackClick = () => {
    if (currentLevel === 2) {
      setCurrentLevel(1);
      setSelectedCategory(null);
      // Resetear scroll
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
        setScrollPosition(0);
        updateScrollButtons();
      }
      // Navegar de vuelta a categoría principal
      history.push('/meubles/1');
    }
  };

  // Renderizar fila de iconos - IDÉNTICO a SliderElectromenager
  const renderIconRow = (row, rowIndex) => {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'space-around',
          gap: isMobile ? '12px' : '5px',
          padding: isMobile ? '6px 12px' : '8px 5px',
          flexShrink: 0,
          minWidth: isMobile ? 'min-content' : 'auto',
          width: '100%'
        }}
      >
        {row.map((item) => {
          const colorHex = colorMap[item.color] || colorMap.primary;
          const hasSubcats = currentLevel === 1 ? item.hasSublevel : false;
          
          return (
            <div
              key={`${item.id}-${rowIndex}`}
              onClick={() => handleItemClick(item)}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '80px' : '95px',
                flex: '1 1 0%',
                minWidth: '70px',
                maxWidth: '110px',
                padding: '4px 2px',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* CONTENEDOR DE ICONO - EXACTO como SliderElectromenager */}
              <div
                style={{
                  width: isMobile ? '70px' : '85px',
                  height: isMobile ? '70px' : '85px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  border: `3px solid ${colorHex}20`,
                  background: `linear-gradient(135deg, ${colorHex}15, ${colorHex}08)`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  padding: '8px',
                  position: 'relative'
                }}
                className="icon-container"
              >
                {/* Emoji o icono */}
                {item.emoji ? (
                  <span 
                    style={{ 
                      fontSize: isMobile ? '2rem' : '2.3rem',
                      lineHeight: 1,
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
                    }}
                  >
                    {item.emoji}
                  </span>
                ) : (
                  <img
                    src={getIconPath(item.icon || 'default.png')}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      transition: 'transform 0.3s ease'
                    }}
                    onLoad={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onError={(e) => {
                      console.error(`Error loading icon: ${item.icon}`);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <span style="font-size: 2rem; color: ${colorHex}">
                          ${item.name.charAt(0)}
                        </span>`;
                    }}
                  />
                )}
                
                {/* Indicador de subcategorías (solo nivel 1) */}
                {currentLevel === 1 && hasSubcats && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: colorHex,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    +
                  </div>
                )}
              </div>

              {/* Nombre - EXACTO como SliderElectromenager */}
              <div style={{
                textAlign: 'center',
                width: '100%',
                padding: '0 2px'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: '600',
                  color: '#333',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}>
                  {item.name}
                </span>
                
                {/* Badge de subcategorías */}
                {currentLevel === 1 && hasSubcats && (
                  <span style={{
                    fontSize: '0.65rem',
                    color: colorHex,
                    fontWeight: '500',
                    display: 'block',
                    marginTop: '2px'
                  }}>
                    + sous-catégories
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="category-grid-container">
      {/* Card contenedor - EXACTO como SliderElectromenager */}
      <div style={{
        position: 'relative',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        marginTop: '0',
        marginBottom: '0'
      }}>
        {/* Encabezado con navegación */}
        <div style={{
          padding: isMobile ? '12px 12px 4px' : '16px 20px 8px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              fontWeight: '700',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {currentLevel === 1 ? (
                <>
                  <span style={{ fontSize: '1.2em' }}>🛋️</span>
                  {isMobile ? 'Meubles & Maison' : 'Tous les meubles et articles maison'}
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.2em' }}>{selectedCategory?.emoji}</span>
                  {selectedCategory?.name}
                </>
              )}
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              color: '#666'
            }}>
              {currentLevel === 1 
                ? 'Découvrez nos catégories de meubles et articles maison' 
                : `Explorez les sous-catégories de ${selectedCategory?.name}`}
            </p>
          </div>
          
          {/* Botón para volver atrás (solo en nivel 2) */}
          {currentLevel === 2 && (
            <button
              onClick={handleBackClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(102, 126, 234, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              }}
            >
              <FaArrowLeft size={14} />
              Retour
            </button>
          )}
        </div>

        {/* Contenido con scroll horizontal - EXACTO */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'block',
            padding: isMobile ? '12px 0' : '16px 0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {/* Contenedor de filas */}
          <div ref={rowsContainerRef}>
            {/* Primera fila */}
            {firstRow.length > 0 && renderIconRow(firstRow, 0)}
            {/* Segunda fila */}
            {secondRow.length > 0 && renderIconRow(secondRow, 1)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile - EXACTO */}
        {isMobile && (
          <>
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
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#667eea',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronLeft size={18} />
              </button>
            )}

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
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#667eea',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronRight size={18} />
              </button>
            )}

            {/* Indicadores de scroll (dots) - EXACTO */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
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
                      width: isActive ? '8px' : '6px',
                      height: isActive ? '8px' : '6px',
                      borderRadius: '50%',
                      background: isActive 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : '#e0e0e0',
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Footer minimalista - EXACTO */}
        <div style={{
          padding: isMobile ? '6px 12px' : '8px 20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(248, 249, 250, 0.4)',
          textAlign: 'center',
          display: currentLevel === 1 ? 'block' : 'none' // Mostrar solo en nivel 1
        }}>
          <Link 
            to="/meubles"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
            }}
          >
            Voir tous les meubles et articles maison
            <FaChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Estilos CSS COPIADOS EXACTAMENTE de SliderElectromenager */}
      <style>{`
        /* Ocultar scrollbar pero mantener funcionalidad */
        .category-grid-container ::-webkit-scrollbar {
          display: none;
        }
        
        /* Prevenir zoom en doble tap */
        .category-grid-container * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mejorar rendimiento */
        .category-grid-container {
          contain: content;
        }
        
        /* Efectos hover - EXACTAMENTE IGUAL */
        .icon-container:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        
        .icon-container:hover img {
          transform: scale(1.1);
        }
        
        /* EMOJIS MÁS GRANDES PARA DESKTOP - AJUSTADO */
        @media (min-width: 768px) {
          .category-grid-container a,
          .category-grid-container div[onClick] {
            flex: 1 !important;
            min-width: 0 !important;
          }
          
          .icon-container {
            width: 85px !important;
            height: 85px !important;
          }
        }
        
        /* ICONOS EXTRA GRANDES PARA PANTALLAS GRANDES */
        @media (min-width: 1200px) {
          .icon-container {
            width: 95px !important;
            height: 95px !important;
          }
        }
        
        /* Optimización para pantallas pequeñas */
        @media (max-width: 380px) {
          .category-grid-container a,
          .category-grid-container div[onClick] {
            width: 75px !important;
          }
          
          .icon-container {
            width: 65px !important;
            height: 65px !important;
          }
          
          /* Botones más pequeños en pantallas muy pequeñas */
          .category-grid-container button {
            width: 28px !important;
            height: 28px !important;
          }
          
          .category-grid-container button svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
        
        /* Gradientes en los bordes del scroll (solo mobile) - EXACTO */
        @media (max-width: 767px) {
          .category-grid-container > div > div:nth-child(2)::before {
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
          
          .category-grid-container > div > div:nth-child(2)::after {
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
        
        /* Transición suave entre niveles */
        .category-grid-container > div {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default SliderMeubles;
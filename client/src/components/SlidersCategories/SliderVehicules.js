import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// 🚨 IMPORTANTE: Verificar que estos slugs coincidan con tu backend
const vehiculesData = [
  { 
    id: 1, 
    name: 'Voitures', 
    slug: 'voitures', 
    icon: 'automobile.png', 
    color: '#667eea',
    hasSubcategories: true,
    debugSlug: 'vehicules/voitures/1' // Para debug
  },
  { 
    id: 2, 
    name: 'Utilitaires', 
    slug: 'utilitaires', 
    icon: 'utilitaire.png', 
    color: '#f093fb',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 3, 
    name: 'Motos', 
    slug: 'motos', 
    icon: 'moto.png', 
    color: '#f5576c',
    hasSubcategories: true,
    debugSlug: 'vehicules/motos/1'
  },
  { 
    id: 4, 
    name: 'Quads', 
    slug: 'quads', 
    icon: 'quad.png', 
    color: '#48c6ef',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 5, 
    name: 'Fourgons', 
    slug: 'fourgons', 
    icon: 'fourgon.png', 
    color: '#6a11cb',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 6, 
    name: 'Camions', 
    slug: 'camions', 
    icon: 'camion.png', 
    color: '#37ecba',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 7, 
    name: 'Bus', 
    slug: 'bus', 
    icon: 'bus.png', 
    color: '#ff9a9e',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 8, 
    name: 'Engins', 
    slug: 'engins', 
    icon: 'engin.png', 
    color: '#a18cd1',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 9, 
    name: 'Tracteurs', 
    slug: 'tracteurs', 
    icon: 'tracteur.png', 
    color: '#fbc2eb',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 10, 
    name: 'Remorques', 
    slug: 'remorques', 
    icon: 'remorque.png', 
    color: '#667eea',
    hasSubcategories: false,
    debugSlug: 'filtro local'
  },
  { 
    id: 11, 
    name: 'Bateaux', 
    slug: 'bateaux', 
    icon: 'bateau.png', 
    color: '#f093fb',
    hasSubcategories: true,
    debugSlug: 'vehicules/bateaux/1'
  }
];

const SliderVehicule = ({ onItemSelect, activeFilter }) => {
  const history = useHistory();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const rowsContainerRef = useRef(null);

  // Calcular distribución en dos filas
  const halfIndex = Math.ceil(vehiculesData.length / 2);
  const firstRow = vehiculesData.slice(0, halfIndex);
  const secondRow = vehiculesData.slice(halfIndex);

  // Función para obtener la ruta del icono
  const getIconPath = (iconName) => {
    return `/icons/vehicules/${iconName}`;
  };

  // Configuración responsive
  useEffect(() => {
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
  }, []);

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

  // 🎯 FUNCIÓN MEJORADA: Manejar clic en categoría
  const handleCategoryClick = (category) => {
    console.log('🎯 Click en categoría:', {
      name: category.name,
      slug: category.slug,
      hasSubcategories: category.hasSubcategories,
      debugSlug: category.debugSlug,
      currentPath: location.pathname,
      currentSearch: location.search
    });
    
    if (category.hasSubcategories) {
      // 🚨 VERIFICAR: ¿Existe realmente esta ruta en tu App.js?
      // La ruta debe coincidir con tus rutas definidas
      const targetPath = `/vehicules/${category.slug}/1`;
      console.log(`📤 Navegando a: ${targetPath}`);
      
      // Navegar a nueva página (esto ocultará el slider actual)
      history.push(targetPath);
    } else {
      // 🎯 Filtrar LOCALMENTE sin recargar la página
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('filter', category.slug);
      queryParams.set('filterLabel', category.name);
      
      const newSearch = queryParams.toString();
      console.log(`🎯 Actualizando URL con filtro: ${newSearch}`);
      
      // Actualizar la URL SIN recargar la página
      history.replace({
        pathname: location.pathname,
        search: newSearch
      });
      
      // Notificar al componente padre (CategoryPage)
      if (onItemSelect) {
        onItemSelect(category, false);
      }
    }
  };

  // Renderizar icono con mejor debug
  const renderIcon = (category, rowIndex) => {
    const isActive = activeFilter === category.slug;
    
    return (
      <button
        key={`${category.id}-${rowIndex}`}
        onClick={() => handleCategoryClick(category)}
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
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          outline: 'none',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        aria-label={`${category.name} (${category.hasSubcategories ? 'Navegar' : 'Filtrar'})`}
        title={`${category.name}\n${category.hasSubcategories ? 'Tiene subcategorías - Click para navegar' : 'Filtrar en esta página'}`}
      >
        {/* Indicador visual del tipo de acción */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: category.hasSubcategories ? '#4CAF50' : '#2196F3',
          border: '1px solid white',
          zIndex: 2
        }} />
        
        {/* Contenedor de icono */}
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
            border: isActive 
              ? `3px solid ${category.color}`
              : `3px solid ${category.color}20`,
            background: isActive
              ? `linear-gradient(135deg, ${category.color}25, ${category.color}15)`
              : `linear-gradient(135deg, ${category.color}15, ${category.color}08)`,
            boxShadow: isActive
              ? '0 6px 20px rgba(0,0,0,0.15)'
              : '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            padding: '8px'
          }}
          className="icon-container"
        >
          <img
            src={getIconPath(category.icon)}
            alt={category.name}
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
              console.error(`Error loading icon: ${category.icon}`);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <span style="font-size: 1.8rem; color: ${category.color}; font-weight: bold">
                  ${category.name.charAt(0)}
                </span>
              `;
            }}
          />
        </div>

        {/* Nombre de categoría */}
        <div style={{
          textAlign: 'center',
          width: '100%',
          padding: '0 2px'
        }}>
          <span style={{
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            fontWeight: isActive ? '700' : '600',
            color: isActive ? category.color : '#333',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.2'
          }}>
            {category.name}
          </span>
          
          {/* Indicador de acción */}
          <span style={{
            fontSize: '0.6rem',
            color: category.hasSubcategories ? '#4CAF50' : '#2196F3',
            fontWeight: 'bold',
            display: 'block',
            marginTop: '2px'
          }}>
            {category.hasSubcategories ? '››' : '✓'}
          </span>
        </div>
      </button>
    );
  };

  // Renderizar fila de iconos
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
        {row.map((category) => renderIcon(category, rowIndex))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="category-grid-container">
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
        {/* Header informativo */}
        <div style={{
          padding: '10px 15px',
          background: 'linear-gradient(90deg, #667eea0d, #764ba20d)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          fontSize: '0.85rem',
          color: '#555'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="fas fa-car me-1" style={{ color: '#667eea' }}></i>
              <strong>Sous-catégories Véhicules</strong>
            </div>
            <div className="d-flex gap-2">
              <span style={{ fontSize: '0.75rem' }}>
                <span className="badge bg-success me-1">››</span>
                <span>Navegar</span>
              </span>
              <span style={{ fontSize: '0.75rem' }}>
                <span className="badge bg-primary me-1">✓</span>
                <span>Filtrar</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Contenido con scroll horizontal */}
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
            {renderIconRow(firstRow, 0)}
            {/* Segunda fila */}
            {renderIconRow(secondRow, 1)}
          </div>
        </div>

        {/* Botones de scroll solo en mobile */}
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
                  transition: 'all 0.2s ease'
                }}
              >
                <FaChevronRight size={18} />
              </button>
            )}

            {/* Indicadores de scroll (dots) */}
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
      </div>

      {/* Estilos CSS */}
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
        
        /* Efectos hover */
        .icon-container:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        
        .icon-container:hover img {
          transform: scale(1.1);
        }
        
        /* EMOJIS MÁS GRANDES PARA DESKTOP */
        @media (min-width: 768px) {
          .category-grid-container button {
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
          .category-grid-container button {
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
      `}</style>
    </div>
  );
};

export default SliderVehicule;
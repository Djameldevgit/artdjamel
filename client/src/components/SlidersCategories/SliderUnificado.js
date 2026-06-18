// 📂 frontend/src/components/SliderUnificado.jsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";

/**
 * SliderUnificado - Slider premium para categorías, subcategorías y artículos
 */
const SliderUnificado = ({
  title,
  items = [],
  activeItem,
  onItemClick,
  variant = "categoryPage",
  showCount = false,
  maxRows = 2,
  compact = false,
}) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const colorPalette = useMemo(() => [
    '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#b5179e',
    '#7209b7', '#560bad', '#480ca8', '#3f37c9', '#4895ef',
    '#e63946', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
    '#6d597a', '#b56576', '#e56b6f', '#9c89b8', '#ef476f',
    '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#fb8b24',
    '#d90429', '#ff9770', '#6a994e', '#bc4c51', '#5e548e'
  ], []);

  const generateColorFromName = useCallback((name) => {
    if (!name) return colorPalette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  }, [colorPalette]);

  const generateGradient = useCallback((color) => {
    return `linear-gradient(145deg, ${color}dd, ${color}aa)`;
  }, []);

  // 📏 Verificar scroll
  useEffect(() => {
    const checkScroll = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        const pageWidth = clientWidth * 0.8;
        setCurrentPage(Math.round(scrollLeft / pageWidth));
      }
    };
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  // 🖱️ Drag to scroll
  const handleMouseDown = (e) => {
    if (window.innerWidth > 768) {
      setIsDragging(true);
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeftStart(sliderRef.current.scrollLeft);
      sliderRef.current.style.cursor = 'grabbing';
      sliderRef.current.style.scrollBehavior = 'auto';
    }
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftStart - walk;
  };
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollBehavior = 'smooth';
    }
  };
  const handleMouseLeave = () => handleMouseUp();

  // ⬅️➡️ Scroll
  const scrollLeft = useCallback(() => {
    if (sliderRef.current && canScrollLeft) {
      const scrollAmount = window.innerWidth <= 768 ? 250 : 350;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [canScrollLeft]);
  const scrollRight = useCallback(() => {
    if (sliderRef.current && canScrollRight) {
      const scrollAmount = window.innerWidth <= 768 ? 250 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [canScrollRight]);
  const handleScroll = useCallback(() => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const pageWidth = clientWidth * 0.8;
      setCurrentPage(Math.round(scrollLeft / pageWidth));
    }
  }, []);

  // ⚠️ Manejar error de imagen
  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // 📁 Obtener ruta de imagen
  const getImagePath = useCallback((item) => {
    if (!item) return null;
    if (item.icon) return item.icon;
    return `/uploads/categories/${item.parentSlug || item.slug}/level${item.level || 1}/${item.slug}.png`;
  }, []);

  // 🏷️ Mostrar nombre completo con saltos de línea si es largo
  const formatName = useCallback((name) => {
    if (!name) return "";
    if (compact || window.innerWidth <= 480) return name.length > 8 ? name.substring(0, 8) + "…" : name;
    if (window.innerWidth <= 768) return name.length > 10 ? name.substring(0, 10) + "…" : name;
    const words = name.split(" ");
    return words.length > 1 ? words.join("\n") : name;
  }, [compact]);

  const contentType = useMemo(() => {
    if (variant === "home") return "main-categories";
    if (variant === "categoryPage") return "subcategories";
    if (variant === "subcategories") return "sub-subcategories";
    if (variant === "articles") return "articles";
    return "categories";
  }, [variant]);

  const itemsPerRow = useMemo(() => {
    if (window.innerWidth <= 480) return 3;
    if (window.innerWidth <= 768) return 4;
    if (window.innerWidth <= 1024) return 6;
    return 8;
  }, []);

  const needsScroll = useMemo(() => items.length > itemsPerRow * maxRows, [items.length, itemsPerRow, maxRows]);
  const totalPages = useMemo(() => needsScroll ? Math.ceil(items.length / (itemsPerRow * maxRows)) : 1, [items.length, itemsPerRow, maxRows, needsScroll]);

  // ================== RENDER ==================
  if (!items || items.length === 0) {
    return (
      <div className="slider-unificado-empty">
        <div className="empty-icon">📭</div>
        <span className="empty-text">Aucun élément disponible</span>
      </div>
    );
  }

  return (
    <div className={`slider-unificado-wrapper ${variant} ${compact ? 'compact' : ''}`}>
      {(title || needsScroll) && (
        <div className="slider-unificado-header">
          {title && (
            <div className="slider-title-group">
              <h3 className="slider-title">{title}</h3>
              <span className="slider-count">{items.length} {contentType === 'subcategories' ? 'sous-catégories' : contentType === 'main-categories' ? 'catégories' : contentType === 'sub-subcategories' ? 'articles' : 'éléments'}</span>
            </div>
          )}
          {needsScroll && window.innerWidth > 768 && (
            <div className="slider-nav-buttons">
              <button className={`nav-btn ${!canScrollLeft ? 'disabled' : ''}`} onClick={scrollLeft} disabled={!canScrollLeft} aria-label="Précédent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className={`nav-btn ${!canScrollRight ? 'disabled' : ''}`} onClick={scrollRight} disabled={!canScrollRight} aria-label="Suivant">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
      )}

      <div
       ref={sliderRef} 
       className={`slider-unificado-track ${needsScroll ? 'has-scroll' : ''}`} 
       onScroll={handleScroll} 
       onMouseDown={handleMouseDown} 
       onMouseMove={handleMouseMove} 
       onMouseUp={handleMouseUp} 
       onMouseLeave={handleMouseLeave} 
       data-rows={window.innerWidth >= 1024 ? 1 : maxRows}  
       data-content={contentType} 
       style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {items.map((item, index) => {
          const isActive = activeItem && (activeItem._id === item._id || activeItem.slug === item.slug || activeItem.name === item.name);
          const itemCount = showCount ? (item.posts?.length || item.postCount || 0) : 0;
          const imagePath = getImagePath(item);
          const hasError = imageErrors[item._id || item.slug];
          const bgColor = generateColorFromName(item.name);
          const gradient = generateGradient(bgColor);

          return (
            <div key={item._id || item.slug || `item-${index}`} className={`slider-unificado-item ${isActive ? 'active' : ''}`} onClick={() => onItemClick(item)} style={{ animationDelay: `${index * 0.03}s` }} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
              <div className="item-icon-wrapper" style={{ background: (!imagePath || hasError) ? gradient : 'white', boxShadow: isActive ? `0 8px 20px ${bgColor}40` : `0 6px 14px ${bgColor}30` }}>
                {!hasError && imagePath ? <img src={imagePath} alt={item.name} className="item-image" loading="lazy" onError={() => handleImageError(item._id || item.slug)} /> : item.emoji ? <span className="item-emoji">{item.emoji}</span> : <span className="item-fallback">{item.name?.charAt(0).toUpperCase() || '📁'}</span>}
                {itemCount > 0 && <span className="item-count-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
                {hoveredIndex === index && <span className="item-hover-effect"></span>}
                {isActive && <span className="item-active-indicator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="white"/><path d="M8 12L11 15L16 9" stroke={bgColor} strokeWidth="3" strokeLinecap="round"/></svg></span>}
              </div>
              <div className="item-name-wrapper">
                <span className="item-name" title={item.name}>{formatName(item.name)}</span>
                {isActive && variant === "categoryPage" && <span className="active-label">Actif</span>}
              </div>
            </div>
          );
        })}
      </div>

      {needsScroll && totalPages > 1 && (
        <div className="slider-pagination">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button key={idx} className={`pagination-dot ${currentPage === idx ? 'active' : ''}`} onClick={() => {
              if (sliderRef.current) {
                const pageWidth = sliderRef.current.clientWidth * 0.8;
                sliderRef.current.scrollTo({ left: pageWidth * idx, behavior: 'smooth' });
              }
            }} aria-label={`Page ${idx + 1}`}></button>
          ))}
        </div>
      )}
    </div>
  );
};

SliderUnificado.defaultProps = {
  title: "",
  items: [],
  activeItem: null,
  onItemClick: () => {},
  variant: "categoryPage",
  showCount: false,
  maxRows: 2,
  compact: false,
};

export default React.memo(SliderUnificado);
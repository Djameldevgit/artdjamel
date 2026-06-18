import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";

/**
 * CategorySlider - Slider horizontal de categorías con imágenes PNG
 */
const CategorySlider = ({ 
  categories = [], 
  onCategoryClick, 
  variant = 'home',
  showCount = false 
}) => {
  const history = useHistory();
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // 📏 Verificar capacidad de scroll
  useEffect(() => {
    const checkScroll = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const pageWidth = clientWidth * 0.9;
        const currentPageCalc = Math.round(scrollLeft / pageWidth);
        setCurrentPage(currentPageCalc);
      }
    };
    
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

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

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollBehavior = 'smooth';
    }
  };

  // ⬅️➡️ Scroll handlers
  const scrollLeft = useCallback(() => {
    if (sliderRef.current && canScrollLeft) {
      const scrollAmount = window.innerWidth <= 768 ? 280 : 350;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [canScrollLeft]);

  const scrollRight = useCallback(() => {
    if (sliderRef.current && canScrollRight) {
      const scrollAmount = window.innerWidth <= 768 ? 280 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [canScrollRight]);

  const handleScroll = useCallback(() => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      const pageWidth = clientWidth * 0.9;
      const newPage = Math.round(scrollLeft / pageWidth);
      if (newPage !== currentPage) setCurrentPage(newPage);
    }
  }, [currentPage]);

  // Manejar error de imagen
  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  // ========== ÚNICA FUNCIÓN MODIFICADA ==========
  // Obtener ruta de la imagen (ahora usa Cloudinary)
  const getImagePath = useCallback((category) => {
    if (!category || !category.slug) return null;
    
    // ✅ Usar category.icon (URL de Cloudinary)
    if (category.icon) {
      return category.icon;
    }
    
    // Si no hay icon, retornar null (se mostrará el fallback)
    return null;
  }, []);
  // ==============================================

  // 🧮 Agrupar en pares SOLO para variante 'home'
  const displayItems = useMemo(() => {
    if (variant === 'home') {
      const grouped = [];
      for (let i = 0; i < categories.length; i += 2) {
        grouped.push({
          top: categories[i],
          bottom: categories[i + 1] || null
        });
      }
      return grouped;
    }
    return categories;
  }, [categories, variant]);

  // 📏 Verificar si necesita scroll
  const needsScroll = useMemo(() => {
    if (!categories.length) return false;
    if (variant === 'home') return displayItems.length > 4;
    return categories.length > 8;
  }, [categories.length, displayItems.length, variant]);

  // 📊 Número de páginas para paginación
  const totalPages = useMemo(() => {
    if (!needsScroll) return 1;
    if (variant === 'home') return Math.ceil(displayItems.length / 4);
    return Math.ceil(categories.length / 8);
  }, [needsScroll, variant, displayItems.length, categories.length]);

  // Renderizar un item de categoría (reutilizable)
  const renderCategoryItem = (category, index, position = '') => {
    if (!category) return null;
    
    const imagePath = getImagePath(category);
    const hasError = imageErrors[category._id || category.slug];
    const key = `${category.slug}-${position}-${index}`;
    
    return (
      <div className="category-item">
        <div 
          className="category-icon-wrapper"
          onClick={() => onCategoryClick ? onCategoryClick(category) : history.push(`/category/${category.slug}`)}
        >
          {!hasError && imagePath ? (
            <img 
              src={imagePath} 
              alt={category.name}
              className="category-image"
              onError={() => handleImageError(category._id || category.slug)}
            />
          ) : (
            <span className="category-fallback">
              {category.name?.charAt(0).toUpperCase() || '📁'}
            </span>
          )}

          {showCount && (category.posts?.length || category.postCount || 0) > 0 && (
            <span className="category-badge">
              {category.posts?.length || category.postCount || 0}
            </span>
          )}
        </div>
        <div 
          className="category-name"
          onClick={() => onCategoryClick ? onCategoryClick(category) : history.push(`/category/${category.slug}`)}
        >
          {category.name}
        </div>
      </div>
    );
  };

  // =================== RENDER PRINCIPAL ===================
  if (!categories || categories.length === 0) {
    return (
      <div className="category-slider-empty">
        <span className="empty-emoji">📭</span>
        <span className="empty-text">Aucune catégorie disponible</span>
      </div>
    );
  }

  return (
    <div className={`category-slider-wrapper ${variant}`}>
      {/* Botones de navegación (solo desktop) */}
      {needsScroll && window.innerWidth > 768 && (
        <>
          <button 
            className={`nav-btn prev ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Précédent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className={`nav-btn next ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Suivant"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Slider principal */}
      <div 
        ref={sliderRef}
        className="category-slider"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {variant === 'home'
          ? displayItems.map((group, index) => (
              <div key={`group-${group.top?.slug || index}`} className="category-slider-item-group">
                {renderCategoryItem(group.top, index, 'top')}
                {group.bottom && renderCategoryItem(group.bottom, index, 'bottom')}
              </div>
            ))
          : categories.map((cat, idx) => renderCategoryItem(cat, idx))
        }
      </div>

      {/* PAGINACIÓN */}
      {needsScroll && totalPages > 1 && (
        <div className="category-pagination">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${currentPage === idx ? 'active' : ''}`}
              onClick={() => {
                if (sliderRef.current) {
                  const pageWidth = sliderRef.current.clientWidth * 0.9;
                  sliderRef.current.scrollTo({
                    left: pageWidth * idx,
                    behavior: 'smooth'
                  });
                }
              }}
              aria-label={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(CategorySlider);
// 📂 frontend/src/components/CategorySlider.jsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
 
/**
 * CategorySlider - Slider horizontal de categorías con emojis y colores dinámicos
 * @param {Array} categories - Array de categorías [{ name, slug, emoji, level, ... }]
 * @param {Function} onCategoryClick - Callback cuando se hace clic en una categoría
 * @param {string} variant - 'home' | 'category' | 'subcategory'
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
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // 🎨 Paleta de colores vibrantes
  const colorPalette = useMemo(() => [
    '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#b5179e',
    '#7209b7', '#560bad', '#480ca8', '#3f37c9', '#4895ef',
    '#e63946', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
    '#6d597a', '#b56576', '#e56b6f', '#9c89b8', '#ef476f',
    '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#fb8b24',
  ], []);

  // 🎨 Generar color único basado en el nombre
  const generateColorFromName = useCallback((name) => {
    if (!name) return colorPalette[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  }, [colorPalette]);

  // 🎨 Generar degradado suave
  const generateGradient = useCallback((color) => {
    return `linear-gradient(145deg, ${color}dd, ${color}aa)`;
  }, []);

  // 📏 Verificar capacidad de scroll
  useEffect(() => {
    const checkScroll = () => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        
        // Calcular página actual
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
    if (variant === 'home') {
      return displayItems.length > 4;
    }
    return categories.length > 8;
  }, [categories.length, displayItems.length, variant]);

  // 📊 Número de páginas para paginación
  const totalPages = useMemo(() => {
    if (!needsScroll) return 1;
    if (variant === 'home') {
      return Math.ceil(displayItems.length / 4);
    }
    return Math.ceil(categories.length / 8);
  }, [needsScroll, variant, displayItems.length, categories.length]);

  // 🏷️ Formatear nombre según dispositivo
  const formatName = useCallback((name) => {
    if (!name) return "";
    const maxLength = window.innerWidth <= 480 ? 8 : 
                     window.innerWidth <= 768 ? 10 : 16;
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "…";
  }, []);

  if (!categories || categories.length === 0) {
    return (
      <div className="category-slider-empty">
        <span className="empty-emoji">📭</span>
        <span className="empty-text">Aucune catégorie disponible</span>
      </div>
    );
  }

  // ========== RENDER PARA VARIANTE 'HOME' (PARES) ==========
  if (variant === 'home') {
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

        {/* Slider principal - AHORA PERFECTAMENTE CENTRADO EN MÓVIL */}
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
          {displayItems.map((group, index) => (
            <div
              key={`group-${group.top?.slug || index}`}
              className="category-slider-item-group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Categoría superior */}
              <div className="category-item">
                <div 
                  className="category-icon-wrapper"
                  style={{ 
                    background: generateGradient(generateColorFromName(group.top.name)),
                    boxShadow: `0 8px 16px ${generateColorFromName(group.top.name)}30`
                  }}
                  onClick={() => onCategoryClick ? onCategoryClick(group.top) : history.push(`/category/${group.top.slug}`)}
                  onMouseEnter={() => setHoveredIndex(`top-${index}`)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="category-emoji">
                    {group.top.emoji || '📁'}
                  </span>
                  {showCount && (group.top.posts?.length || group.top.postCount || 0) > 0 && (
                    <span className="category-badge">
                      {group.top.posts?.length || group.top.postCount || 0}
                    </span>
                  )}
                  {hoveredIndex === `top-${index}` && (
                    <span className="category-hover-effect"></span>
                  )}
                </div>
                <div 
                  className="category-name"
                  onClick={() => onCategoryClick ? onCategoryClick(group.top) : history.push(`/category/${group.top.slug}`)}
                >
                  {formatName(group.top.name)}
                </div>
              </div>

              {/* Categoría inferior (si existe) */}
              {group.bottom && (
                <div className="category-item">
                  <div 
                    className="category-icon-wrapper"
                    style={{ 
                      background: generateGradient(generateColorFromName(group.bottom.name)),
                      boxShadow: `0 8px 16px ${generateColorFromName(group.bottom.name)}30`
                    }}
                    onClick={() => onCategoryClick ? onCategoryClick(group.bottom) : history.push(`/category/${group.bottom.slug}`)}
                    onMouseEnter={() => setHoveredIndex(`bottom-${index}`)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <span className="category-emoji">
                      {group.bottom.emoji || '📁'}
                    </span>
                    {showCount && (group.bottom.posts?.length || group.bottom.postCount || 0) > 0 && (
                      <span className="category-badge">
                        {group.bottom.posts?.length || group.bottom.postCount || 0}
                      </span>
                    )}
                    {hoveredIndex === `bottom-${index}` && (
                      <span className="category-hover-effect"></span>
                    )}
                  </div>
                  <div 
                    className="category-name"
                    onClick={() => onCategoryClick ? onCategoryClick(group.bottom) : history.push(`/category/${group.bottom.slug}`)}
                  >
                    {formatName(group.bottom.name)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PAGINACIÓN - IGUAL QUE SLIDERUNIFICADO */}
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

        {/* INDICADOR DE SCROLL MÓVIL - IGUAL QUE SLIDERUNIFICADO */}
        {needsScroll && window.innerWidth <= 768 && (
          <div className="category-scroll-hint">
            <span>← Glisser pour voir plus →</span>
          </div>
        )}
      </div>
    );
  }

  // ========== RENDER PARA VARIANTE 'CATEGORY' (INDIVIDUALES) ==========
  return (
    <div className={`category-slider-wrapper ${variant}`}>
      {/* Botones de navegación */}
      {needsScroll && window.innerWidth > 768 && (
        <>
          <button 
            className={`nav-btn prev ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className={`nav-btn next ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}

      {/* Slider principal - AHORA PERFECTAMENTE CENTRADO EN MÓVIL */}
      <div 
        ref={sliderRef}
        className="category-slider"
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {displayItems.map((category, index) => (
          <div
            key={category.slug || `cat-${index}`}
            className="category-slider-item"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div 
              className="category-icon-wrapper"
              style={{ 
                background: generateGradient(generateColorFromName(category.name)),
                boxShadow: `0 8px 16px ${generateColorFromName(category.name)}30`
              }}
              onClick={() => onCategoryClick ? onCategoryClick(category) : history.push(`/category/${category.slug}`)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="category-emoji">
                {category.emoji || '📁'}
              </span>
              {showCount && (category.posts?.length || category.postCount || 0) > 0 && (
                <span className="category-badge">
                  {category.posts?.length || category.postCount || 0}
                </span>
              )}
              {hoveredIndex === index && (
                <span className="category-hover-effect"></span>
              )}
            </div>
            <div 
              className="category-name"
              onClick={() => onCategoryClick ? onCategoryClick(category) : history.push(`/category/${category.slug}`)}
            >
              {formatName(category.name)}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINACIÓN - IGUAL QUE SLIDERUNIFICADO */}
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

      {/* INDICADOR DE SCROLL MÓVIL - IGUAL QUE SLIDERUNIFICADO */}
      {needsScroll && window.innerWidth <= 768 && (
        <div className="category-scroll-hint">
          <span>← Glisser pour voir plus →</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(CategorySlider);
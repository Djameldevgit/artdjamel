import React, { useState, useMemo, useCallback } from 'react';
import './HomeSlider.css';

// ✅ Categorías que NO deben aparecer en el slider
const EXCLUDED_SLUGS = ['tutorials', 'channels'];

const HomeSlider = ({
  categories = [],
  onCategoryClick,
  activeCategoryId = null
}) => {
  const [internalActiveId, setInternalActiveId] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const activeId = activeCategoryId ?? internalActiveId;

  // ✅ Filtrar categorías: eliminar las excluidas
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => !EXCLUDED_SLUGS.includes(cat.slug));
  }, [categories]);

  // ===============================
  // IMAGE RESOLVER OPTIMIZADO
  // ===============================
  const getImageUrl = useCallback(
    (category) => {
      if (!category) return null;
      const slugUrl = `/categories/${category.slug}/${category.slug}.png`;
      return category.imageUrl || slugUrl;
    },
    []
  );

  // ===============================
  // CLICK OPTIMIZADO
  // ===============================
  const handleClick = useCallback(
    (cat) => {
      setInternalActiveId(cat._id);
      onCategoryClick?.(cat);
    },
    [onCategoryClick]
  );

  // ===============================
  // ERROR IMAGES OPTIMIZADO
  // ===============================
  const handleImageError = useCallback(
    (id, url) => {
      setFailedImages(prev => ({
        ...prev,
        [id]: true
      }));
    },
    []
  );

  // ===============================
  // MEMO CATEGORIES (CRÍTICO) - Usamos filteredCategories
  // ===============================
  const renderedCategories = useMemo(
    () =>
      filteredCategories.map(cat => {
        const imageUrl = getImageUrl(cat);
        const isActive = activeId === cat._id;
        const initial = cat.name?.[0] || '?';

        return (
          <button
            key={cat._id}
            className={`catslider-item ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(cat)}
          >
            <div className="catslider-ring">
              <div className="catslider-inner">
                {imageUrl && !failedImages[cat._id] ? (
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    onError={() => handleImageError(cat._id, imageUrl)}
                  />
                ) : (
                  <span className="catslider-initial">
                    {initial}
                  </span>
                )}
              </div>
              <span className="catslider-dot" />
            </div>
            <span className="catslider-label">
              {cat.name}
            </span>
          </button>
        );
      }),
    [
      filteredCategories,
      activeId,
      failedImages,
      handleClick,
      getImageUrl,
      handleImageError
    ]
  );

  if (!filteredCategories?.length) return null;

  return (
    <div className="catslider-row">
      {renderedCategories}
    </div>
  );
};

export default React.memo(HomeSlider);
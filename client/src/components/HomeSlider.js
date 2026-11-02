import React, { useState, useMemo, useCallback } from 'react';
import './HomeSlider.css';

// ✅ Categorías que NO deben aparecer en el slider
const EXCLUDED_SLUGS = ['tutorials', 'channels'];

const HomeSlider = ({ categories = [], onCategoryClick, activeCategoryId = null }) => {
  const [internalActiveId, setInternalActiveId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const activeId = activeCategoryId ?? internalActiveId;
  const EXCLUDED_SLUGS = ['tutorials', 'channels'];

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => !EXCLUDED_SLUGS.includes(cat.slug));
  }, [categories]);

  const handleImageError = useCallback((id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }, []);

  // 🔥 NUEVO: Resuelve la URL y devuelve un objeto con la info
  const getCategoryDisplay = useCallback((cat) => {
    const initial = cat.name?.charAt(0) || '?';
    const imageUrl = cat.imageUrl || `/categories/${cat.slug}/${cat.slug}.png`;
    const hasError = imageErrors[cat._id];

    return { initial, imageUrl, hasError };
  }, [imageErrors]);

  if (!filteredCategories?.length) return null;

  return (
    <div className="catslider-row">
      {filteredCategories.map(cat => {
        const { initial, imageUrl, hasError } = getCategoryDisplay(cat);
        const isActive = activeId === cat._id;

        return (
          <button
            key={cat._id}
            className={`catslider-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setInternalActiveId(cat._id);
              onCategoryClick?.(cat);
            }}
          >
            <div className="catslider-ring">
              <div className="catslider-inner">
                {/* 🔥 Si hay error O la URL no es válida, muestra la inicial */}
                {!hasError ? (
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    onError={() => handleImageError(cat._id)}
                    style={{ display: 'block' }} // Para asegurar que se vea
                  />
                ) : null}
                {/* 👇 SIEMPRE renderiza la inicial, pero oculta con CSS o muestra condicional */}
                <span 
                  className="catslider-initial" 
                  style={{ 
                    display: hasError ? 'flex' : 'none', // 👈 MUESTRA SOLO SI HAY ERROR
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    background: '#f0f0f0'
                  }}
                >
                  {initial}
                </span>
              </div>
              <span className="catslider-dot" />
            </div>
            <span className="catslider-label">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(HomeSlider);
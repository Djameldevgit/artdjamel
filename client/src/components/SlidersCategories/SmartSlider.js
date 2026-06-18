// components/SlidersCategories/SmartSlider.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getCategoryProducts, getCategoryChildren } from '../../redux/actions/categoryAction';

const SmartSlider = ({ categorySlug, initialData = [] }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  const { categoryState } = useSelector(state => ({
    categoryState: state.category || {}
  }));

  // Cargar datos si no vienen por props
  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      loadCategoryData();
    }
  }, [categorySlug]);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      // Intentar cargar desde Redux primero
      const cachedData = categoryState[categorySlug]?.children;
      
      if (cachedData) {
        setItems(cachedData);
      } else {
        // Cargar desde API
        const children = await dispatch(getCategoryChildren(categorySlug));
        setItems(children);
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    // Primero, verificar si tiene hijos
    if (item.hasChildren && !item.isProductCategory) {
      // Navegar a página de subcategorías
      history.push(`/${categorySlug}/${item.slug}/subcategories`);
    } else {
      // Obtener productos de esta categoría
      const result = await dispatch(getCategoryProducts(item.slug, 1));
      
      if (result && result.posts && result.posts.length > 0) {
        // Si hay productos, navegar a página de productos
        history.push(`/${categorySlug}/${item.slug}/1`);
      } else if (result.hasChildren) {
        // Si no hay productos pero tiene hijos, mostrar hijos
        history.push(`/${categorySlug}/${item.slug}/subcategories`);
      } else {
        // No hay productos ni hijos
        history.push(`/${categorySlug}/${item.slug}/empty`);
      }
    }
  };

  const renderItem = (item, index) => (
    <div 
      key={item._id || index}
      className="slider-item"
      onClick={() => handleItemClick(item)}
      style={{
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Icono/Emoji */}
      <div className="item-icon">
        {item.emoji ? (
          <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
        ) : item.icon ? (
          <img src={item.icon} alt={item.name} />
        ) : (
          <div style={{ 
            background: item.color || '#667eea',
            width: '50px',
            height: '50px',
            borderRadius: '25px'
          }} />
        )}
      </div>
      
      {/* Nombre */}
      <div className="item-name">{item.name}</div>
      
      {/* Indicador de hijos */}
      {item.hasChildren && !item.isProductCategory && (
        <div className="children-indicator">
          <span className="badge">+{item.childCount || ''}</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="smart-slider">
      <div className="slider-items">
        {items.map(renderItem)}
      </div>
    </div>
  );
};

export default SmartSlider;
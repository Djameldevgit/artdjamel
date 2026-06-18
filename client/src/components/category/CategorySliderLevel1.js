import React from 'react';
import { Link } from 'react-router-dom';
import { buildSubcategoryUrl } from '../../utils/urlBuilder';

const CategorySliderLevel1 = ({ categorySlug, subcategories }) => {
  return (
    <div className="category-slider-level1 mb-4">
      <h3 className="mb-3">Toutes les catégories</h3>
      <div className="d-flex flex-wrap gap-3">
        {subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            to={buildSubcategoryUrl(categorySlug, subcategory.id, 1)}
            className="category-card-level1 text-decoration-none text-dark"
            style={{
              flex: '0 0 auto',
              width: '120px',
              textAlign: 'center'
            }}
          >
            <div 
              className="icon-container rounded-circle p-3 mb-2"
              style={{
                background: '#f8f9fa',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                width: '100px',
                margin: '0 auto'
              }}
            >
              <span>{subcategory.emoji}</span>
            </div>
            <div className="category-name mt-2">
              <small className="fw-medium" style={{ fontSize: '0.8rem' }}>
                {subcategory.name}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySliderLevel1;
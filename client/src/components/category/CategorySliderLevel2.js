import React from 'react';
import { Link } from 'react-router-dom';
import { buildSubcategory2Url } from '../../utils/urlBuilder';

const CategorySliderLevel2 = ({ categorySlug, subcategory1Slug, subcategories }) => {
  return (
    <div className="category-slider-level2 mb-4">
      <h4 className="mb-3">Sous-catégories</h4>
      <div className="d-flex flex-wrap gap-3">
        {subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            to={buildSubcategory2Url(categorySlug, subcategory1Slug, subcategory.id, 1)}
            className="category-card-level2 text-decoration-none text-dark"
            style={{
              flex: '0 0 auto',
              width: '110px',
              textAlign: 'center'
            }}
          >
            <div 
              className="icon-container rounded-circle p-3 mb-2"
              style={{
                background: '#f8f9fa',
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80px',
                width: '80px',
                margin: '0 auto'
              }}
            >
              <span>{subcategory.emoji}</span>
            </div>
            <div className="category-name mt-1">
              <small className="fw-medium" style={{ fontSize: '0.75rem' }}>
                {subcategory.name}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySliderLevel2;
import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

const CategorySubcategorySlider = ({ categorySlug, subcategories }) => {
  // Limitar a mostrar máximo 10 subcategorías en el slider
  const displaySubcategories = subcategories.slice(0, 10);

  return (
    <div className="subcategory-slider mb-4">
      <h5 className="mb-3">Sous-catégories :</h5>
      <Row className="g-2">
        {displaySubcategories.map((subcategory, index) => (
          <Col xs={6} sm={4} md={3} lg={2} key={subcategory._id || index}>
            <Link 
              to={`/${categorySlug}/${subcategory.slug || subcategory.name.toLowerCase()}/1`}
              className="text-decoration-none"
            >
              <div className="subcategory-card text-center p-3 border rounded hover-shadow">
                <div className="mb-2">
                  <span className="fs-4">{subcategory.emoji || '📂'}</span>
                </div>
                <div className="subcategory-name text-truncate small">
                  {subcategory.name}
                </div>
              </div>
            </Link>
          </Col>
        ))}
        
        {/* Ver todas las subcategorías */}
        {subcategories.length > 10 && (
          <Col xs={6} sm={4} md={3} lg={2}>
            <Link 
              to={`/${categorySlug}/all-subcategories`}
              className="text-decoration-none"
            >
              <div className="subcategory-card text-center p-3 border rounded hover-shadow bg-light">
                <div className="mb-2">
                  <span className="fs-4">📋</span>
                </div>
                <div className="subcategory-name text-truncate small">
                  Voir tout ({subcategories.length})
                </div>
              </div>
            </Link>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CategorySubcategorySlider;
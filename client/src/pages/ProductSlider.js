// src/components/Sliders/ProductSlider.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Card } from 'react-bootstrap';
import { StarFill, Eye } from 'react-bootstrap-icons';
import 'swiper/css';

const ProductSlider = ({ products = [], onProductClick }) => {
  if (!products || products.length === 0) return null;
  
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Precio';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        992: { slidesPerView: 5 },
        1200: { slidesPerView: 6 }
      }}
    >
      {products.map(product => (
        <SwiperSlide key={product._id}>
          <Card 
            className="h-100 border-0 shadow-sm"
            onClick={() => onProductClick && onProductClick(product)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ height: '150px', overflow: 'hidden' }}>
              {product.images && product.images[0] ? (
                <Card.Img
                  variant="top"
                  src={product.images[0]}
                  alt={product.title}
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center bg-light">
                  <div className="text-muted">📦</div>
                </div>
              )}
            </div>
            
            <Card.Body className="p-3">
              <Card.Title className="h6 mb-2 text-truncate">
                {product.title}
              </Card.Title>
              
              <div className="d-flex justify-content-between align-items-center">
                <span className="h5 text-primary fw-bold">
                  {formatPrice(product.price)}
                </span>
                {product.rating && (
                  <small className="text-warning">
                    <StarFill size={12} /> {product.rating}
                  </small>
                )}
              </div>
              
              <div className="mt-2 d-flex justify-content-between">
                <small className="text-muted">
                  <Eye size={12} className="me-1" />
                  {product.views || 0}
                </small>
              </div>
            </Card.Body>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductSlider;
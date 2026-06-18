// src/components/CategorySection/CategorySection.jsx - MEJORADO
import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { ArrowRight, Heart, HeartFill, Star, StarFill } from 'react-bootstrap-icons';
import { useHistory } from 'react-router-dom';

const CategorySection = ({ category, onViewMore, onPostClick }) => {
  const history = useHistory();
  const [hoveredPost, setHoveredPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Consultar';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleLike = (postId, e) => {
    e.stopPropagation();
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    // Aquí deberías llamar a tu acción Redux para like
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <section className="mb-5">
      {/* Encabezado de categoría */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div 
            className="rounded-circle p-3"
            style={{
              background: `linear-gradient(135deg, ${category.color || '#6c757d'}20, ${category.color || '#6c757d'}40)`,
              border: `2px solid ${category.color || '#6c757d'}`
            }}
          >
            <i className={`fas fa-${category.icon || 'tag'} fa-lg`} style={{ color: category.color || '#6c757d' }}></i>
          </div>
          <div>
            <h3 className="h4 fw-bold mb-0">{category.name}</h3>
            <p className="text-muted mb-0">
              {category.description || `${category.posts?.length || 0} productos disponibles`}
            </p>
          </div>
        </div>
        
        <Button 
          variant="link" 
          className="text-decoration-none fw-semibold"
          onClick={() => onViewMore(category.slug)}
        >
          Ver todos
          <ArrowRight className="ms-2" />
        </Button>
      </div>

      {/* Grid de productos */}
      {category.posts && category.posts.length > 0 ? (
        <Row className="g-3">
          {category.posts.slice(0, 6).map((post) => (
            <Col key={post._id} xs={6} md={4} lg={2}>
              <Card 
                className="h-100 border-0 shadow-sm overflow-hidden transition-all"
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
                onClick={() => onPostClick(post._id)}
                style={{ 
                  cursor: 'pointer',
                  transform: hoveredPost === post._id ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Contenedor de imagen */}
                <div 
                  className="position-relative" 
                  style={{ 
                    paddingTop: '75%',
                    backgroundColor: '#f8f9fa',
                    overflow: 'hidden'
                  }}
                >
                  {post.images && post.images[0] ? (
                    <>
                      <Card.Img
                        variant="top"
                        src={post.images[0]}
                        alt={post.title}
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;


                          
                          }}
                      />
                      
                      {/* Efecto hover en imagen */}
                      {hoveredPost === post._id && (
                        <div 
                          className="position-absolute top-0 start-0 w-100 h-100"
                          style={{
                            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7))',
                            zIndex: 1
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fas fa-image fa-3x text-muted mb-3"></i>
                        <p className="text-muted small">Sin imagen</p>
                      </div>
                    </div>
                  )}

                  {/* Badges superpuestos */}
                  <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                    {post.isNew && (
                      <Badge bg="success" className="rounded-pill px-2">
                        Nuevo
                      </Badge>
                    )}
                    {post.isPromoted && (
                      <Badge bg="warning" className="rounded-pill px-2">
                        Destacado
                      </Badge>
                    )}
                  </div>

                  {/* Botón de favoritos */}
                  <button 
                    className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light rounded-circle shadow-sm"
                    onClick={(e) => handleLike(post._id, e)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    {likedPosts[post._id] ? (
                      <HeartFill size={14} className="text-danger" />
                    ) : (
                      <Heart size={14} className="text-muted" />
                    )}
                  </button>
                </div>

                {/* Contenido de la card */}
                <Card.Body className="p-3 d-flex flex-column">
                  <Card.Title 
                    className="h6 mb-2 fw-semibold"
                    title={post.title}
                  >
                    {truncateText(post.title, 40)}
                  </Card.Title>
                  
                  <Card.Text className="small text-muted mb-3 flex-grow-1">
                    {truncateText(post.description || '', 60)}
                  </Card.Text>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 fw-bold text-primary mb-0">
                        {formatPrice(post.price)}
                      </span>
                      
                      {post.location && (
                        <small className="text-muted text-truncate ms-2">
                          <i className="fas fa-map-marker-alt fa-xs me-1"></i>
                          {post.location.city || post.location}
                        </small>
                      )}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      {post.rating ? (
                        <div className="d-flex align-items-center gap-1">
                          <StarFill size={12} className="text-warning" />
                          <small className="fw-semibold">{post.rating.toFixed(1)}</small>
                          <small className="text-muted">({post.reviewCount || 0})</small>
                        </div>
                      ) : (
                        <small className="text-muted">Sin valoraciones</small>
                      )}
                      
                      <small className="text-muted">
                        <i className="far fa-clock fa-xs me-1"></i>
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        }) : 'Hoy'}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="fas fa-box-open fa-3x text-muted"></i>
          </div>
          <h4 className="h5 mb-2">Sin productos aún</h4>
          <p className="text-muted mb-4">Esta categoría está esperando su primer producto</p>
          <Button 
            variant="outline-primary"
            onClick={() => history.push(`/category/${category.slug}/create`)}
          >
            <i className="fas fa-plus me-2"></i>
            Crear primer producto
          </Button>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
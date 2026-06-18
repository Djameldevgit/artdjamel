import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, Button, Badge, Carousel, Spinner } from 'react-bootstrap';
import { FaStore, FaArrowRight, FaCrown, FaChartLine } from 'react-icons/fa';

const SliderStores = () => {
  const history = useHistory();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchFeaturedStores();
  }, []);
  
  const fetchFeaturedStores = async () => {
    try {
      const response = await fetch('/api/stores/public/featured?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setStores(data.featuredStores || []);
      } else {
        setError(data.message || 'Erreur de chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error fetching featured stores:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStoreClick = (storeId) => {
    history.push(`/store/${storeId}`);
  };
  
  const handleCategoryClick = (category) => {
    history.push(`/stores/category/${category}`);
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement des boutiques...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-warning">
          <FaStore className="me-2" />
          {error}
        </div>
      </div>
    );
  }
  
  if (stores.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-info">
          <h5>Aucune boutique en vedette</h5>
          <p className="mb-0">Les boutiques en vedette apparaîtront ici.</p>
        </div>
      </div>
    );
  }
  
  // Agrupar stores en chunks de 4 para el carrusel
  const chunkSize = 4;
  const storeChunks = [];
  for (let i = 0; i < stores.length; i += chunkSize) {
    storeChunks.push(stores.slice(i, i + chunkSize));
  }
  
  return (
    <div className="stores-slider-container">
      {/* Header del slider */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <FaCrown className="me-2 text-warning" />
            Boutiques en vedette
          </h4>
          <p className="text-muted mb-0">
            Découvrez nos boutiques premium les plus populaires
          </p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => history.push('/stores')}
          className="d-flex align-items-center"
        >
          Voir toutes
          <FaArrowRight className="ms-2" />
        </Button>
      </div>
      
      {/* Carrusel de stores */}
      <Carousel 
        indicators={false}
        interval={5000}
        className="stores-carousel"
      >
        {storeChunks.map((chunk, chunkIndex) => (
          <Carousel.Item key={chunkIndex}>
            <div className="row g-4">
              {chunk.map(store => (
                <div key={store._id} className="col-md-3">
                  <Card 
                    className="h-100 border-0 shadow-sm hover-lift cursor-pointer"
                    onClick={() => handleStoreClick(store._id)}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-start mb-3">
                        {store.logo ? (
                          <img 
                            src={store.logo} 
                            alt={store.name}
                            className="rounded-circle me-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                               style={{ width: '60px', height: '60px' }}>
                            <FaStore size={24} />
                          </div>
                        )}
                        
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-truncate">{store.name}</h6>
                          <div className="d-flex align-items-center mb-2">
                            <Badge bg="warning" className="me-2 small">
                              Premium
                            </Badge>
                            {store.categories && store.categories.length > 0 && (
                              <small className="text-muted text-truncate">
                                {store.categories[0]}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="small text-muted mb-3">
                        {store.description?.substring(0, 60) || 'Boutique premium...'}
                        {store.description?.length > 60 ? '...' : ''}
                      </p>
                      
                      <div className="d-flex justify-content-between small text-muted">
                        <div className="d-flex align-items-center">
                          <FaChartLine className="me-1" />
                          <span>{store.stats?.totalViews || 0}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaStore className="me-1" />
                          <span>{store.stats?.totalProducts || 0} produits</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
      
      {/* Categorías populares */}
      <div className="mt-5 pt-4 border-top">
        <h5 className="mb-3">Explorez par catégorie</h5>
        <div className="d-flex flex-wrap gap-2">
          {[
            'Vêtements', 'Électronique', 'Maison', 'Santé & Beauté',
            'Sport', 'Alimentaire', 'Services', 'Automobile'
          ].map((category, idx) => (
            <Badge 
              key={idx}
              bg="light" 
              text="dark" 
              className="border hover-pointer px-3 py-2"
              onClick={() => handleCategoryClick(category)}
              style={{ cursor: 'pointer' }}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Estilos CSS */}
      <style jsx>{`
        .stores-slider-container {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 15px;
        }
        
        .hover-lift {
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .hover-pointer:hover {
          background: #0d6efd !important;
          color: white !important;
          border-color: #0d6efd !important;
        }
        
        .stores-carousel .carousel-control-prev,
        .stores-carousel .carousel-control-next {
          width: 40px;
          height: 40px;
          background: rgba(0,0,0,0.1);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .stores-carousel .carousel-control-prev {
          left: -20px;
        }
        
        .stores-carousel .carousel-control-next {
          right: -20px;
        }
        
        @media (max-width: 768px) {
          .stores-carousel .carousel-control-prev,
          .stores-carousel .carousel-control-next {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SliderStores;
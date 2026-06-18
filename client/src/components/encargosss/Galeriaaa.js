import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { FaSearch, FaPalette, FaEye, FaCopy, FaPlayCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// Importar el JSON de obras
import obrasData from './obrasData.json';

const Galeriaaa = () => {
  const [selectedTheme, setSelectedTheme] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [obras, setObras] = useState([]);
  
  const { t, i18n } = useTranslation('encargos');
  const { languageReducer } = useSelector(state => state);
  
  const lang = languageReducer?.language || 'es';
  
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Procesar las obras con las traducciones - CORREGIDO
  useEffect(() => {
    const obrasArray = [];
    
    if (obrasData.works) {
      Object.keys(obrasData.works).forEach(theme => {
        Object.keys(obrasData.works[theme]).forEach(obraKey => {
          const obra = obrasData.works[theme][obraKey];
          obrasArray.push({
            id: `${theme}-${obraKey}`,
            title: t(`works.${theme}.${obraKey}.title`, { defaultValue: obra.title }),
            theme: theme,
            technique: t('techniques.oil', { defaultValue: "Óleo sobre lienzo" }),
            image: obra.image || `/images/${obraKey}.jpg`,
            videoUrl: obra.videoUrl, // Añadir videoUrl
            description: t(`works.${theme}.${obraKey}.description`, { defaultValue: obra.description })
          });
        });
      });
    }
    
    setObras(obrasArray);
  }, [t, lang]);

  // Función para verificar si tiene video
  const hasVideo = (obra) => {
    return obra && obra.videoUrl;
  };

  // Temas disponibles para filtro
  const temas = [
    { value: 'todos', label: t('filters.all', { defaultValue: '🎨 Todos los Temas' }) },
    { value: 'retratos', label: t('filters.retratos', { defaultValue: '👤 Retratos' }) },
    { value: 'paisajes', label: t('filters.paisajes', { defaultValue: '🏞️ Paisajes' }) },
    { value: 'marinas', label: t('filters.marinas', { defaultValue: '🌊 Marinas' }) },
    { value: 'bodegones', label: t('filters.bodegones', { defaultValue: '🍎 Bodegones' }) },
    { value: 'animales', label: t('filters.animales', { defaultValue: '🐾 Animales' }) },
    { value: 'flores', label: t('filters.flores', { defaultValue: '🌹 Flores' }) },
    { value: 'naturaleza-muerta', label: t('filters.naturalezaMuerta', { defaultValue: '📚 Naturaleza Muerta' }) },
    { value: 'oriental', label: t('filters.oriental', { defaultValue: '🎎 Pintura Oriental' }) }
  ];

  // Filtrar obras
  const filteredObras = obras.filter(obra => {
    if (!obra) return false;
    
    const matchesTheme = selectedTheme === 'todos' || obra.theme === selectedTheme;
    
    const title = obra.title || '';
    const technique = obra.technique || '';
    const description = obra.description || '';
    const search = searchTerm || '';
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) ||
                         technique.toLowerCase().includes(search.toLowerCase()) ||
                         description.toLowerCase().includes(search.toLowerCase());
    
    return matchesTheme && matchesSearch;
  });

  // Copiar referencia
  const copyReference = (obra) => {
    if (!obra) return;
    
    const referenceText = t('referenceText', { 
      title: obra.title || '', 
      theme: t(`themes.${obra.theme}`, { defaultValue: obra.theme }) || '', 
      technique: obra.technique || '' 
    });
    
    navigator.clipboard.writeText(referenceText)
      .then(() => {
        setCopySuccess(t('copySuccess'));
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        setCopySuccess(t('copyError'));
      });
  };

  // Abrir modal con imagen
  const openImageModal = (obra) => {
    setSelectedImage(obra);
    setShowModal(true);
  };

  return (
    <Container className="py-5" style={{
      direction: lang === 'ar' ? 'rtl' : 'ltr',
      textAlign: lang === 'ar' ? 'right' : 'left'
    }}>
      {/* Header */}
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-5 fw-bold text-primary mb-3">
            <FaPalette className="me-3" />
            {t('title')}
          </h1>
          <p className="lead">{t('subtitle')}</p>
          <Badge bg="info" className="fs-6 p-2 mb-2">
            {t('inspirationBadge')}
          </Badge>
          <p className="text-muted">{t('description')}</p>
        </Col>
      </Row>

      {/* Filtros y Búsqueda */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>{t('filterByTheme')}</strong></Form.Label>
            <Form.Select 
              value={selectedTheme} 
              onChange={(e) => setSelectedTheme(e.target.value)}
            >
              {temas.map(tema => (
                <option key={tema.value} value={tema.value}>
                  {tema.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>{t('searchPlaceholder')}</strong></Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Información importante */}
      <Row className="mb-4">
        <Col>
          <div className="alert alert-warning">
            <h6>💡 {t('howToUseTitle')}</h6>
            <p className="mb-2">{t('howToUseDescription')}</p>
            <small>
              <strong>📝 {t('usageSteps.title')}:</strong><br />
              1. {t('usageSteps.step1')}<br />
              2. {t('usageSteps.step2')}<br />
              3. {t('usageSteps.step3')}<br />
              4. {t('usageSteps.step4')}
            </small>
          </div>
        </Col>
      </Row>

      {/* Contador de resultados */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              {t('resultsCount', { count: filteredObras.length })}
              {filteredObras.filter(hasVideo).length > 0 && (
                <span className="text-info ms-2">
                  • {filteredObras.filter(hasVideo).length} con video
                </span>
              )}
            </span>
            {selectedTheme !== 'todos' && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setSelectedTheme('todos')}
              >
                {t('clearFilter')}
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Galería de Obras */}
      <Row>
        {filteredObras.length > 0 ? (
          filteredObras.map(obra => (
            <Col lg={4} md={6} key={obra.id} className="mb-4">
              <Card className="h-100 shadow-sm hover-card">
                <div 
                  className="card-image-container"
                  style={{ 
                    height: '250px', 
                    overflow: 'hidden', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => openImageModal(obra)}
                >
                  <Card.Img 
                    variant="top" 
                    src={obra.image}
                    alt={obra.title}
                    style={{ 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div className="image-overlay">
                    <FaEye size={30} className="text-white" />
                    {hasVideo(obra) && (
                      <div className="video-badge">
                        <FaPlayCircle size={20} className="text-warning" />
                      </div>
                    )}
                  </div>
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6">
                    {obra.title}
                    {hasVideo(obra) && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        🎬
                      </Badge>
                    )}
                  </Card.Title>
                  
                  <div className="mb-2">
                    <Badge bg="primary" className="me-1">
                      {t(`themes.${obra.theme}`, { defaultValue: obra.theme })}
                    </Badge>
                    <Badge bg="secondary">
                      {obra.technique}
                    </Badge>
                    {hasVideo(obra) && (
                      <Badge bg="success" className="ms-1">
                        Video
                      </Badge>
                    )}
                  </div>
                  
                  <Card.Text className="small text-muted flex-grow-1">
                    {obra.description}
                  </Card.Text>
                  
                  <div className="d-grid gap-2">
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => openImageModal(obra)}
                        className="flex-fill"
                      >
                        <FaEye className="me-1" />
                        {t('viewDetails')}
                      </Button>
                      
                      {hasVideo(obra) && (
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          as={Link}
                          to={`/video/${obra.id}`}
                          className="flex-fill"
                        >
                          <FaPlayCircle className="me-1" />
                          Ver Video
                        </Button>
                      )}
                    </div>
                    
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => copyReference(obra)}
                    >
                      <FaCopy className="me-1" />
                      {t('useAsReference')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center py-5">
            <h5>🔍 {t('noResults')}</h5>
            <p className="text-muted">{t('tryDifferentSearch')}</p>
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setSelectedTheme('todos');
                setSearchTerm('');
              }}
            >
              {t('showAllWorks')}
            </Button>
          </Col>
        )}
      </Row>

      {/* Modal para imagen ampliada */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedImage?.title}
            {selectedImage && hasVideo(selectedImage) && (
              <Badge bg="info" className="ms-2">
                🎬 Video Disponible
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img 
            src={selectedImage?.image} 
            alt={selectedImage?.title}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
          <div className="mt-3">
            <h6>📋 {t('workDetails')}</h6>
            <p><strong>{t('theme')}:</strong> {t(`themes.${selectedImage?.theme}`, { defaultValue: selectedImage?.theme })}</p>
            <p><strong>{t('technique')}:</strong> {selectedImage?.technique}</p>
            <p><strong>{t('description')}:</strong> {selectedImage?.description}</p>
            
            {selectedImage && hasVideo(selectedImage) && (
              <div className="mt-3 p-3 bg-light rounded">
                <h6>🎬 Video Demostrativo Disponible</h6>
                <Button 
                  as={Link} 
                  to={`/video/${selectedImage.id}`}
                  variant="info" 
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  <FaPlayCircle className="me-1" />
                  Ver Video Demo
                </Button>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('close')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              copyReference(selectedImage);
              setShowModal(false);
            }}
          >
            <FaCopy className="me-1" />
            {t('useAsReference')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mensaje de copia exitosa */}
      {copySuccess && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" style={{zIndex: 1050}}>
          {copySuccess}
        </div>
      )}

      {/* Estilos CSS */}
      <style>
        {`
          .hover-card:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          }
          
          .card-image-container {
            position: relative;
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .card-image-container:hover .image-overlay {
            opacity: 1;
          }
          
          .video-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>
    </Container>
  );
};

export default Galeriaaa;
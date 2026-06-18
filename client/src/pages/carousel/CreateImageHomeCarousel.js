import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
  Container, Row, Col, Form, Button, Card,
  Alert, Badge, Tabs, Tab, Spinner
} from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaTrash, FaImage, FaLink, FaPlus } from 'react-icons/fa';
import {
  createCarouselImage, updateCarouselImage, deleteCarouselImage,
  getAllCarouselImages, getHomeCarousel
} from '../../redux/actions/carouselHomeAction';
import ImagesStepCarouselHome from '../../components/CATEGORIES/camposComun/ImagesStep';

// Estado inicial limpio — reutilizado para reset tras submit
const EMPTY_FORM = { title: '', description: '', link: '', linkType: 'none' };

const CreateImageHomeCarousel = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();
  const isEditMode = !!id;

  const authState = useSelector(state => state.auth);
  const { allImages, loading } = useSelector(state => state.carousel || { allImages: [], loading: false });

  const token = authState?.token || authState?.auth?.token;
  const user = authState?.user || authState?.auth?.user;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImageData, setExistingImageData] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  // BUG 4/5 FIX: clave para forzar re-mount del ImageStep y limpiar preview
  const [imageStepKey, setImageStepKey] = useState(0);

  // Cargar imágenes existentes
  useEffect(() => {
    if (token) dispatch(getAllCarouselImages());
  }, [dispatch, token]);

  // Cargar datos en modo edición
  useEffect(() => {
    if (isEditMode && allImages && allImages.length > 0) {
      const imageToEdit = allImages.find(img => img._id === id);
      if (imageToEdit) {
        setFormData({
          title: imageToEdit.title || '',
          description: imageToEdit.description || '',
          link: imageToEdit.link || '',
          linkType: imageToEdit.linkType || 'none'
        });
        setExistingImageData(imageToEdit.image);
        setImages([{
          url: imageToEdit.image.url,
          public_id: imageToEdit.image.public_id,
          isExisting: true,
          file: null
        }]);
      }
    }
  }, [isEditMode, allImages, id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    // BUG 6 FIX: description es requerida según especificación
    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (images.length === 0 && !existingImageData) {
      newErrors.image = 'Debes seleccionar una imagen';
    }

    // link es opcional — solo validar formato si se ingresó algo
    if (formData.link?.trim()) {
      if (formData.linkType === 'external' && !isValidUrl(formData.link.trim())) {
        newErrors.link = 'Ingresa una URL válida (ej: https://ejemplo.com)';
      }
      if (formData.linkType === 'internal' && !formData.link.trim().startsWith('/')) {
        newErrors.link = 'Las rutas internas deben comenzar con "/"';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images, existingImageData]);

  // Función auxiliar para validar URLs
  const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
  };

  const handleSave = useCallback(async (e) => {
    e?.preventDefault?.();

    if (!token) {
      alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
      history.push('/login');
      return;
    }

    if (!validateForm()) return;

    // Construir imageFile para la action
    let imageFile = null;
    if (images.length > 0) {
      imageFile = images[0]; // puede ser { file, url, isExisting } o { isExisting, url, public_id }
    } else if (existingImageData) {
      imageFile = {
        url: existingImageData.url,
        public_id: existingImageData.public_id,
        isExisting: true
      };
    }

    if (!imageFile) {
      setErrors(prev => ({ ...prev, image: 'Debes seleccionar una imagen' }));
      return;
    }

    setIsSubmitting(true);

    const dataToSubmit = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      link: formData.link?.trim() || '',
      linkType: formData.linkType,
      imageFile
    };

    const authObject = { token, user };

    let result;
    if (isEditMode) {
      result = await dispatch(updateCarouselImage(id, dataToSubmit, authObject));
    } else {
      result = await dispatch(createCarouselImage(dataToSubmit, authObject));
    }

    if (result?.success) {
      await dispatch(getAllCarouselImages());
      await dispatch(getHomeCarousel());

      if (!isEditMode) {
        // BUG 4 & 5 FIX: limpiar todo el estado del form + forzar re-mount del ImageStep
        setFormData(EMPTY_FORM);
        setImages([]);
        setExistingImageData(null);
        setErrors({});
        setImageStepKey(prev => prev + 1); // fuerza re-mount → borra preview colgada
        setActiveTab('list');
      } else {
        setTimeout(() => history.push('/admin/carousel'), 1500);
      }
    }

    setIsSubmitting(false);
  }, [formData, images, existingImageData, isEditMode, id, token, user, dispatch, validateForm, history]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('¿Eliminar esta imagen permanentemente?')) return;
    if (!token) return;

    const result = await dispatch(deleteCarouselImage(id, { token, user }));
    if (result?.success) {
      await dispatch(getAllCarouselImages());
      await dispatch(getHomeCarousel());
      history.push('/admin/carousel');
    }
  }, [id, token, user, dispatch, history]);

  const handleCancel = useCallback(() => {
    history.push('/admin/carousel');
  }, [history]);

  const renderImageList = () => {
    if (loading && !allImages) {
      return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (!allImages || allImages.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No hay imágenes</Alert.Heading>
          <p>Comienza creando tu primera imagen para el carrusel.</p>
          <Button variant="primary" onClick={() => setActiveTab('create')}>
            <FaPlus className="me-2" /> Crear primera imagen
          </Button>
        </Alert>
      );
    }

    return (
      <div className="mt-4">
        <Row>
          {allImages.map(img => (
            <Col md={6} lg={4} key={img._id} className="mb-3">
              <Card className="h-100 shadow-sm">
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={img.image?.url}
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+disponible'; }}
                  />
                </div>
                <Card.Body>
                  <Card.Title className="h6 fw-bold">{img.title}</Card.Title>
                  <Card.Text className="small text-muted">
                    {img.description?.substring(0, 80)}{img.description?.length > 80 ? '...' : ''}
                  </Card.Text>
                  {/* Mostrar link si existe */}
                  {img.link && (
                    <div className="mb-2">
                      <Badge bg="info" className="me-1">
                        {img.linkType === 'external' ? '🌐' : '🔗'} {img.link.substring(0, 30)}{img.link.length > 30 ? '...' : ''}
                      </Badge>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <Badge bg={img.linkType === 'none' ? 'secondary' : 'info'}>
                      {img.linkType === 'internal' ? '🔗 Interno' : img.linkType === 'external' ? '🌐 Externo' : '📌 Sin enlace'}
                    </Badge>
                    <div>
                      <Button
                        variant="outline-primary" size="sm" className="me-2"
                        onClick={() => history.push(`/admin/carousel/edit/${img._id}`)}
                      >
                        <FaImage className="me-1" /> Editar
                      </Button>
                      <Button
                        variant="outline-danger" size="sm"
                        onClick={async () => {
                          if (window.confirm('¿Eliminar esta imagen del carrusel?')) {
                            if (!token) return;
                            await dispatch(deleteCarouselImage(img._id, { token, user }));
                            await dispatch(getAllCarouselImages());
                            await dispatch(getHomeCarousel());
                          }
                        }}
                      >
                        <FaTrash size={12} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  if (!token) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error de autenticación</Alert.Heading>
          <p>Por favor, inicia sesión nuevamente para acceder a esta página.</p>
          <Button variant="danger" onClick={() => history.push('/login')}>Ir a login</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={12}>
          <div className="d-flex align-items-center mb-4">
            <Button variant="outline-secondary" className="me-3" onClick={handleCancel}>
              <FaArrowLeft className="me-2" /> Volver
            </Button>
            <h2 className="mb-0">
              <FaImage className="me-2 text-primary" />
              {isEditMode ? 'Editar Imagen del Carrusel' : 'Crear Imagen del Carrusel'}
            </h2>
          </div>

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="create" title={isEditMode ? '✏️ Editar' : '➕ Crear'}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSave}>

                    {/* Título — requerido */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Título <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ej: Nuevos Productos 2024"
                        isInvalid={!!errors.title}
                      />
                      <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                    </Form.Group>

                    {/* Descripción — requerida */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Descripción <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripción del contenido..."
                        isInvalid={!!errors.description}
                      />
                      <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Aparecerá junto a la imagen en el carrusel
                      </Form.Text>
                    </Form.Group>

                    {/* Imagen — requerida */}
                    <div className="mb-4">
                      <Form.Label className="fw-bold">Imagen <span className="text-danger">*</span></Form.Label>
                      {/* BUG 5 FIX: key fuerza re-mount y limpia preview tras submit */}
                      <ImagesStepCarouselHome
                        key={imageStepKey}
                        images={images}
                        setImages={setImages}
                        onComplete={handleSave}
                        onBack={() => {}}
                      />
                      {errors.image && (
                        <Form.Text className="text-danger d-block mt-2">{errors.image}</Form.Text>
                      )}
                    </div>

                    {/* Link — opcional */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">
                        <FaLink className="me-1" /> Enlace <span className="text-muted fw-normal">(opcional)</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        placeholder="/boutique/123 o https://ejemplo.com"
                        isInvalid={!!errors.link}
                      />
                      <Form.Text className="text-muted">
                        URL externa o ruta interna — deja vacío si no quieres enlace
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">{errors.link}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Tipo de enlace</Form.Label>
                      <Form.Select name="linkType" value={formData.linkType} onChange={handleChange}>
                        <option value="none">Sin enlace</option>
                        <option value="internal">Interno (ruta de la app)</option>
                        <option value="external">Externo (URL completa)</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex gap-2 mt-4">
                      <Button type="submit" variant="success" disabled={loading || isSubmitting} className="px-4">
                        {isSubmitting ? (
                          <><Spinner size="sm" className="me-2" />Guardando...</>
                        ) : (
                          <><FaSave className="me-2" />{isEditMode ? 'Actualizar' : 'Guardar'}</>
                        )}
                      </Button>

                      {isEditMode && (
                        <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                          <FaTrash className="me-2" /> Eliminar
                        </Button>
                      )}

                      <Button type="button" variant="secondary" onClick={handleCancel}>
                        Cancelar
                      </Button>
                    </div>

                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="list" title={`📋 Lista de Imágenes (${allImages?.length || 0})`}>
              {renderImageList()}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateImageHomeCarousel;

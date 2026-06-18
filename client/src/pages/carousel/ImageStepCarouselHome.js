import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FaCloudUploadAlt, FaTrash, FaPlus, FaImage, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ImagesStepCarouselHome = ({ images, setImages, onComplete, onBack, isSubmitting = false }) => {
  const { t } = useTranslation('ImagesStep');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Para carrusel solo necesitamos UNA imagen
  // Pero manejamos como array para mantener consistencia

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Para carrusel, solo tomamos la PRIMERA imagen
      processImageFile(imageFiles[0]);
    }
  }, []);

  const processImageFile = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecciona una imagen válida');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe exceder los 5MB');
      return;
    }
    
    setUploadError(null);
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // Reemplazar la imagen existente (solo una para carrusel)
      setImages([{
        file: file,
        url: e.target.result,
        public_id: null,
        isExisting: false
      }]);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Error al leer la imagen');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }, [setImages]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  }, [processImageFile]);

  const handleRemoveImage = useCallback((index) => {
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setImages]);

  const handleAddClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const currentImage = images && images.length > 0 ? images[0] : null;

  return (
    <div className="images-step-container">
      <div className="mb-3">
        <Form.Label className="fw-bold">
          <FaImage className="me-2 text-primary" />
          Imagen principal *
        </Form.Label>
        <Form.Text className="text-muted d-block mb-2">
          Selecciona una imagen para el carrusel. Formatos: JPG, PNG, WEBP. Máx 5MB.
        </Form.Text>
      </div>

      {uploadError && (
        <Alert variant="danger" className="mb-3" dismissible onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      <div
        className={`image-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#6366F1' : '#dee2e6'}`,
          borderRadius: '12px',
          padding: currentImage ? '20px' : '40px 20px',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : '#f8f9fa',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          minHeight: currentImage ? 'auto' : '200px'
        }}
        onClick={handleAddClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Subiendo imagen...</p>
          </div>
        ) : currentImage ? (
          <div className="position-relative">
            <Card className="border-0 shadow-sm">
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                <Card.Img
                  variant="top"
                  src={currentImage.url}
                  style={{
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                  alt="Imagen del carrusel"
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  style={{ borderRadius: '50px', zIndex: 10 }}
                >
                  <FaTrash size={12} />
                </Button>
                <div className="position-absolute bottom-0 start-0 m-2">
                  <Badge bg="success" className="px-2 py-1">
                    <FaCheck className="me-1" size={10} /> Image sélectionnée
                  </Badge>
                </div>
              </div>
              <Card.Body className="text-center p-3">
                <Card.Title className="h6 mb-1">
                  {currentImage.file?.name || 'Image du carrousel'}
                </Card.Title>
                <Card.Text className="small text-muted">
                  Cliquez pour changer l'image
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <div>
            <FaCloudUploadAlt size={48} className="text-muted mb-3" />
            <h6 className="mb-2">Glissez-déposez une image ici</h6>
            <p className="text-muted small mb-0">ou cliquez pour parcourir</p>
            <Button variant="outline-primary" size="sm" className="mt-3">
              <FaPlus className="me-1" /> Sélectionner une image
            </Button>
          </div>
        )}
      </div>

      <style>{`
        .image-dropzone {
          transition: all 0.3s ease;
        }
        .image-dropzone.drag-active {
          border-color: #6366F1 !important;
          background-color: rgba(99, 102, 241, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ImagesStepCarouselHome;
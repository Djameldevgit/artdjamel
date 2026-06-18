// components/CATEGORIES/camposComun/ImagesStep.jsx

import React, { useCallback, useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';

const ImagesStep = ({ images, setImages, onComplete, onBack }) => {
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'info' });
  
  // Función checkImage
  const checkImage = (files, currentCount) => {
    const maxSize = 1024 * 1024 * 5;
    const maxCount = 10;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (currentCount + files.length > maxCount) {
      return `Maximum ${maxCount} images allowed. You have ${currentCount} already.`;
    }
    
    for (let file of files) {
      if (file.size > maxSize) {
        return `The image ${file.name} is too large. Maximum size is 5MB.`;
      }
      
      if (!allowedTypes.includes(file.type)) {
        return `The image ${file.name} is not a supported format. Use JPEG, PNG, or WebP.`;
      }
    }
    
    return null;
  };
  
  // Handler para subir imágenes
  const handleChangeImages = useCallback((e) => {
    const files = [...e.target.files];
    if (files.length === 0) return;

    const error = checkImage(files, images.length);
    if (error) {
      setAlert({ show: true, message: error, variant: 'danger' });
      setTimeout(() => setAlert({ show: false, message: '', variant: 'info' }), 3000);
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
      public_id: ''
    }));

    setImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  }, [images.length, setImages]);

  // Eliminar imagen
  const deleteImages = useCallback((index) => {
    setImages(prev => {
      const newImages = [...prev];
      const removedImage = newImages.splice(index, 1)[0];
      if (removedImage && !removedImage.isExisting && removedImage.url) {
        URL.revokeObjectURL(removedImage.url);
      }
      return newImages;
    });
  }, [setImages]);

  // 🔥 HANDLER CORREGIDO para el botón de continuar
  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📸 ImagesStep - Botón "Continue" clickeado');
    console.log('📸 Imágenes actuales:', images.length);
    console.log('📸 onComplete existe:', !!onComplete);
    
    if (onComplete) {
      onComplete(e);
    } else {
      console.error('❌ onComplete no está definido');
    }
  };

  // 🔥 HANDLER CORREGIDO para el botón de retroceder
  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📸 ImagesStep - Botón "Back" clickeado');
    if (onBack) {
      onBack();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded shadow"
    >
      <h3 className="mb-4">📸 Step 5: Upload Images</h3>
      
      {alert.show && (
        <Alert variant={alert.variant} className="mb-3">
          {alert.message}
        </Alert>
      )}
      
      {/* INPUT DE IMÁGENES */}
      <Card className="mb-4">
        <Card.Body>
          <div className="mb-3">
            <label className="form-label fw-bold">
              Upload Images *
              <span className="text-muted ms-2">
                ({images.length}/10 images)
              </span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleChangeImages}
              className="form-control"
              disabled={images.length >= 10}
            />
            <div className="form-text">
              Max 10 images • Max 5MB each • JPEG, PNG, WebP formats
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* VISTA PREVIA */}
      {images.length > 0 && (
        <div className="mb-4">
          <h6 className="mb-3">Preview ({images.length} images)</h6>
          <div className="row g-2">
            {images.map((img, index) => (
              <div key={index} className="col-4 col-md-3 col-lg-2">
                <div className="position-relative">
                  <img
                    src={img.url}
                    alt={`Preview ${index + 1}`}
                    className="img-thumbnail"
                    style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                    style={{ transform: 'translate(30%, -30%)' }}
                    onClick={() => deleteImages(index)}
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <div className="position-absolute bottom-0 start-0 bg-primary text-white px-2 py-1 small">
                      Cover
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 🔥 BOTONES CORREGIDOS */}
      <div className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={handleBack}
          type="button"
        >
          ← Back
        </Button>
        <Button 
          variant={images.length > 0 ? "success" : "secondary"} 
          onClick={handleContinue}
          disabled={images.length === 0}
          type="button"
        >
          {images.length > 0 ? `Continue (${images.length} images)` : 'Skip Images'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ImagesStep;
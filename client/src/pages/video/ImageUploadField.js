// frontend/src/components/ImageUploadField.jsx
import React, { useState, useEffect } from 'react';

const ImageUploadField = ({ 
  images = [],  // Puede ser array de Files o array de objetos
  setImages, 
  label = 'Imagen',
  multiple = false,
  maxImages = 1
}) => {
  const [error, setError] = useState('');

  // ✅ Normalizar imágenes para trabajar siempre con objetos
  const normalizeImages = (imgs) => {
    if (!Array.isArray(imgs)) return [];
    
    return imgs.map(img => {
      // Si ya es un objeto con propiedades, devolverlo
      if (img && typeof img === 'object' && (img.url || img.public_id)) {
        return img;
      }
      // Si es un File, convertirlo a objeto
      if (img instanceof File) {
        return {
          file: img,
          url: URL.createObjectURL(img),
          name: img.name,
          isExisting: false
        };
      }
      // Si es string (URL), convertirlo a objeto
      if (typeof img === 'string') {
        return {
          url: img,
          isExisting: true,
          isUrl: true
        };
      }
      return img;
    });
  };

  const safeImages = normalizeImages(images);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validar límite
    if (safeImages.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imagen(es)`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Validar cada archivo
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten imágenes');
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen no debe superar 2MB');
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      // ✅ Convertir cada File a objeto con propiedades
      const newImages = validFiles.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        isExisting: false
      }));
      
      setImages([...safeImages, ...newImages]);
      setError('');
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = [...safeImages];
    // Liberar URL object si existe
    if (newImages[index]?.url && newImages[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const getPreviewUrl = (image) => {
    if (!image) return '';
    // Si tiene url en el objeto
    if (image.url) return image.url;
    // Si es File
    if (image instanceof File) return URL.createObjectURL(image);
    // Si es string
    if (typeof image === 'string') return image;
    return '';
  };

  // ✅ Limpiar URLs al desmontar
  useEffect(() => {
    return () => {
      safeImages.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  return (
    <div className="image-upload-field mb-3">
      <label className="form-label fw-bold">{label}</label>
      
      {/* Preview de imágenes */}
      {safeImages.length > 0 && (
        <div className="d-flex gap-3 mb-3 flex-wrap">
          {safeImages.map((img, idx) => (
            <div key={idx} className="position-relative">
              <img 
                src={getPreviewUrl(img)} 
                alt={`preview-${idx}`}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                onClick={() => removeImage(idx)}
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  fontSize: '12px', 
                  padding: 0,
                  transform: 'translate(30%, -30%)'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input de archivo */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
        onChange={handleFileChange}
        multiple={multiple}
        className="form-control"
      />
      
      {error && <div className="text-danger small mt-1">{error}</div>}
      <small className="text-muted">
        Formatos: JPG, PNG, GIF, WEBP (Máx. 2MB)
        {!multiple && ' - Solo una imagen'}
      </small>
    </div>
  );
};

export default ImageUploadField;
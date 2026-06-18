// src/components/Channel/ChannelImagesStep.jsx
import React, { useCallback } from 'react';
import { Form, Row, Col, Image, Button } from 'react-bootstrap';
import { Trash, Upload, Image as ImageIcon } from 'react-bootstrap-icons';

const ChannelImagesStep = ({ avatar, cover, setAvatar, setCover, isRTL = false }) => {
  
  // Manejar cambio de avatar
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar({
        preview: reader.result,
        file: reader.result,
        name: file.name,
        isNew: true
      });
    };
    reader.readAsDataURL(file);
  }, [setAvatar]);

  // Manejar cambio de cover
  const handleCoverChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image de couverture ne doit pas dépasser 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCover({
        preview: reader.result,
        file: reader.result,
        name: file.name,
        isNew: true
      });
    };
    reader.readAsDataURL(file);
  }, [setCover]);

  // Eliminar avatar
  const handleRemoveAvatar = useCallback(() => {
    setAvatar(null);
  }, [setAvatar]);

  // Eliminar cover
  const handleRemoveCover = useCallback(() => {
    setCover(null);
  }, [setCover]);

  return (
    <div className="channel-images-step" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="step-header mb-4">
        <h2 className="fw-bold">🖼️ Images du canal</h2>
        <p className="text-muted">Ajoutez un avatar et une image de couverture pour votre canal</p>
      </div>

      <Row className="g-4">
        {/* Avatar Section */}
        <Col md={6}>
          <div className="card h-100 p-4 shadow-sm text-center">
            <h5 className="fw-bold mb-3">
              <ImageIcon className="me-2" />
              Avatar du canal
            </h5>
            <p className="text-muted small mb-3">
              Format carré recommandé 500x500px (max 2MB)
            </p>
            
            <div 
              className="avatar-upload-area mx-auto"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '2px dashed #ccc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: '#f8f9fa',
                position: 'relative'
              }}
              onClick={() => document.getElementById('avatar-input')?.click()}
            >
              <input
                type="file"
                id="avatar-input"
                accept="image/jpeg, image/png, image/jpg, image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              
              {avatar?.preview ? (
                <>
                  <Image 
                    src={avatar.preview} 
                    alt="Avatar preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    fluid
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-muted mb-2" />
                  <span className="small text-muted">Cliquez pour uploader</span>
                </>
              )}
            </div>
            
            {avatar?.isNew === false && avatar?.preview && (
              <div className="mt-2">
                <small className="text-success">✅ Image existante</small>
              </div>
            )}
          </div>
        </Col>

        {/* Cover Section */}
        <Col md={6}>
          <div className="card h-100 p-4 shadow-sm text-center">
            <h5 className="fw-bold mb-3">
              <ImageIcon className="me-2" />
              Image de couverture
            </h5>
            <p className="text-muted small mb-3">
              Format large recommandé 1500x500px (max 5MB)
            </p>
            
            <div 
              className="cover-upload-area mx-auto"
              style={{
                width: '100%',
                height: '150px',
                borderRadius: '12px',
                border: '2px dashed #ccc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                background: '#f8f9fa',
                position: 'relative'
              }}
              onClick={() => document.getElementById('cover-input')?.click()}
            >
              <input
                type="file"
                id="cover-input"
                accept="image/jpeg, image/png, image/jpg, image/gif"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
              
              {cover?.preview ? (
                <>
                  <Image 
                    src={cover.preview} 
                    alt="Cover preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    fluid
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCover();
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-muted mb-2" />
                  <span className="small text-muted">Cliquez pour uploader</span>
                </>
              )}
            </div>
            
            {cover?.isNew === false && cover?.preview && (
              <div className="mt-2">
                <small className="text-success">✅ Image existante</small>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .channel-images-step {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          border: none;
          border-radius: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .avatar-upload-area:hover,
        .cover-upload-area:hover {
          border-color: #4f46e5 !important;
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ChannelImagesStep;
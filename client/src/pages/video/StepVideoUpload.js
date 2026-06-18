// components/Video/StepVideoUpload.jsx - VERSIÓN MODIFICADA (solo añade tipos de video)
import React, { useState, useRef } from 'react';
import { Button, Alert, Form, Card } from 'react-bootstrap';
import { Images, Camera, Link, Trash, MusicNote, Briefcase, CheckCircle } from 'react-bootstrap-icons';

const StepVideoUpload = ({ 
  wizardData, 
  updateData, 
  maxDuration, 
  isProActive,
  isEditing = false,
  existingVideo = null,
  keepExistingVideo = true,
  onKeepExisting,
  onChangeVideo,
  videoType,           // ← NUEVO: recibe el tipo actual
  onVideoTypeChange    // ← NUEVO: función para cambiar tipo
}) => {
  const [linkError, setLinkError] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleVideoFile = (file) => {
    if (!file) return;

    const validationErr = checkVideo(file, isProActive);
    if (validationErr) {
      alert(validationErr);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (duration > maxDuration) {
        alert(`La vidéo ne doit pas dépasser ${maxDuration} secondes`);
        URL.revokeObjectURL(previewUrl);
        return;
      }
      updateData({
        videoFile: file,
        videoPreview: previewUrl,
        videoDuration: duration,
        videoSource: fileInputRef.current?.getAttribute('data-source') || 'gallery',
        videoUrl: '',
        videoId: null,
        videoType: 'local'
      });
      setShowLinkInput(false);
    };
    video.onerror = () => {
      alert('Erreur lors de la lecture de la vidéo');
      URL.revokeObjectURL(previewUrl);
    };
    video.src = previewUrl;
  };

  const handleFileSelect = (e, source = 'gallery') => {
    const file = e.target.files[0];
    if (file) {
      fileInputRef.current?.setAttribute('data-source', source);
      handleVideoFile(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      cameraInputRef.current?.setAttribute('data-source', 'camera');
      handleVideoFile(file);
    }
  };

  const handleLinkSubmit = () => {
    const url = wizardData.videoUrl;
    if (!url) {
      setLinkError('Veuillez entrer un lien');
      return;
    }

    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');

    if (!isYoutube && !isVimeo) {
      setLinkError('Seuls les liens YouTube et Vimeo sont acceptés');
      return;
    }

    let videoId = null;
    let videoType = null;

    if (isYoutube) {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : null;
      videoType = 'youtube';
    } else if (isVimeo) {
      const match = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
      videoId = match ? match[1] : null;
      videoType = 'vimeo';
    }

    if (!videoId) {
      setLinkError('Lien invalide');
      return;
    }

    setLinkError(null);
    updateData({
      videoUrl: url,
      videoType,
      videoId,
      videoSource: 'link',
      videoPreview: isYoutube ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '',
      videoDuration: 0,
      videoFile: null
    });
  };

  const clearVideo = () => {
    if (wizardData.videoPreview && wizardData.videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(wizardData.videoPreview);
    }
    updateData({
      videoFile: null,
      videoPreview: null,
      videoUrl: '',
      videoId: null,
      videoSource: null,
      videoDuration: 0
    });
    setShowLinkInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="step-video-upload" style={{ padding: '0 8px' }}>
      
      {/* ============================================ */}
      {/* NUEVO: FILA DE TIPO DE VIDEO (Social/Commercial) */}
      {/* ============================================ */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {/* Opción Social */}
        <div
          onClick={() => onVideoTypeChange?.('social')}
          style={{
            flex: 1,
            background: videoType === 'social' 
              ? 'linear-gradient(135deg, #f093fb, #f5576c)' 
              : 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: videoType === 'social' ? '2px solid #f093fb' : '2px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MusicNote size={28} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white' }}>Social</h5>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>Style TikTok/Reels</span>
          </div>
          {videoType === 'social' && (
            <CheckCircle size={20} color="#28a745" style={{ position: 'absolute', top: '8px', right: '8px' }} />
          )}
        </div>

        {/* Opción Commercial */}
        <div
          onClick={() => onVideoTypeChange?.('commercial')}
          style={{
            flex: 1,
            background: videoType === 'commercial' 
              ? 'linear-gradient(135deg, #667eea, #764ba2)' 
              : 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: videoType === 'commercial' ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={28} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white' }}>Commercial</h5>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>Marketplace</span>
          </div>
          {videoType === 'commercial' && (
            <CheckCircle size={20} color="#28a745" style={{ position: 'absolute', top: '8px', right: '8px' }} />
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* TÍTULO DINÁMICO */}
      {/* ============================================ */}
      <h5 className="mb-4 text-center">
        {videoType === 'commercial' ? '🛍️ Vidéo Commerciale' : '🎵 Vidéo Sociale'}
      </h5>

      {/* ============================================ */}
      {/* FILA DE TRES ICONOS (Galerie, Caméra, Lien) */}
      {/* ============================================ */}
      {/* MOSTRAR VIDEO EXISTENTE SI ES EDICIÓN */}
      {isEditing && keepExistingVideo && existingVideo && !wizardData.videoFile && (
        <div className="existing-video-preview mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <span><strong>📹 Vidéo actuelle</strong></span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={onChangeVideo}
                className="text-danger"
              >
                Changer de vidéo
              </Button>
            </Card.Header>
            <Card.Body className="text-center p-3">
              <video
                src={existingVideo.videoUrl}
                controls
                className="rounded"
                style={{ maxHeight: '300px', width: '100%' }}
                poster={existingVideo.thumbnail}
              />
              {existingVideo.duration > 0 && (
                <div className="mt-2 text-muted small">
                  Durée: {Math.floor(existingVideo.duration / 60)}:
                  {(existingVideo.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* SI NO ES EDICIÓN O SE CAMBIÓ VIDEO, MOSTRAR ICONOS */}
      {(!isEditing || !keepExistingVideo || !existingVideo) && (
        <>
          {/* FILA DE TRES ICONOS */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '60px',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
              >
                <Images size={36} color="#555" />
              </button>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Galerie</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '60px',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <Camera size={36} color="#555" />
              </button>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Caméra</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '60px',
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <Link size={36} color="#555" />
              </button>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>Lien</div>
            </div>
          </div>

          {/* Inputs ocultos */}
          <input
            type="file"
            ref={fileInputRef}
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'gallery')}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleCameraCapture}
          />

          {/* INPUT DE LINK */}
          {showLinkInput && (
            <div className="link-input-area" style={{ marginBottom: '24px' }}>
              <Form.Group>
                <Form.Label>Lien YouTube ou Vimeo</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={wizardData.videoUrl}
                    onChange={(e) => updateData({ videoUrl: e.target.value })}
                  />
                  <Button onClick={handleLinkSubmit} variant="primary">
                    Valider
                  </Button>
                </div>
                {linkError && <Alert variant="danger" className="mt-2">{linkError}</Alert>}
              </Form.Group>
            </div>
          )}
        </>
      )}

      {/* PREVIEW DEL VIDEO SUBIDO (nuevo) - ESTO SIGUE IGUAL Y FUNCIONA */}
      {wizardData.videoPreview && !(isEditing && keepExistingVideo && existingVideo) && (
        <div className="video-preview mt-3">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Nouvelle vidéo</span>
              <Button variant="link" size="sm" onClick={clearVideo} className="text-danger">
                <Trash size={16} /> Supprimer
              </Button>
            </Card.Header>
            <Card.Body>
              {wizardData.videoSource === 'link' ? (
                <img src={wizardData.videoPreview} alt="Preview" className="img-fluid rounded" />
              ) : (
                <video
                  src={wizardData.videoPreview}
                  controls
                  className="w-100 rounded"
                  style={{ maxHeight: '300px' }}
                />
              )}
              {wizardData.videoDuration > 0 && (
                <div className="mt-2 text-muted small">
                  Durée: {Math.floor(wizardData.videoDuration / 60)}:
                  {Math.floor(wizardData.videoDuration % 60).toString().padStart(2, '0')}
                  {wizardData.videoDuration > maxDuration && (
                    <span className="text-danger ms-2">
                      ⚠️ Dépasse la limite de {maxDuration}s
                    </span>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

// Función checkVideo
const checkVideo = (file, isProActive) => {
  const maxSize = isProActive ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return `La vidéo ne doit pas dépasser ${maxSize / 1024 / 1024} MB`;
  }
  return null;
};

export default StepVideoUpload;
// src/pages/artwork/CreateArtworkWizard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Alert, Spinner, Card, ProgressBar, Badge } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, CloudUpload, Camera, X, Image } from 'react-bootstrap-icons';
import StepIndicator from './StepIndicator';
import StepMusicSelection from './StepMusicSelection';
import ImageUploadField from './ImageUploadField';
import { createVideo } from '../../redux/actions/videoAction';
import { getSliderCategories } from '../../redux/actions/categoryAction';
import { videoUpload } from '../../utils/imageUpload';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import './CreateVideoWizard.css';

const CreateArtworkWizard = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const { sliderCategories = [], sliderLoading = false } = useSelector(state => state.category || {});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const isMountedRef = useRef(true);

  // Vídeo
  const [videoData, setVideoData] = useState({
    videoFile: null,
    videoPreview: null,
    videoDuration: 0,
    videoUrl: '',
    videoPublicId: '',
    thumbnail: '',
  });

  // Datos de la obra
  const [artworkData, setArtworkData] = useState({
    title: '',
    category: '',
    description: '',
    technique: '',
    style: '',
    width: '',
    height: '',
    price: '',
    status: 'en vente',   // ✅ NUEVO
    stock: 1,             // ✅ NUEVO
  });

  const [additionalImages, setAdditionalImages] = useState([]);
  const [musicData, setMusicData] = useState({
    selectedMusic: null,
    musicVolume: 70,
    originalAudio: true,
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const maxDuration = 60;

  // Cargar categorías
  useEffect(() => {
    if (sliderCategories.length === 0 && !sliderLoading) {
      dispatch(getSliderCategories());
    }
  }, [dispatch, sliderCategories.length, sliderLoading]);

  useEffect(() => {
    return () => {
      if (videoData.videoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(videoData.videoPreview);
      }
    };
  }, [videoData.videoPreview]);

  // Validaciones
  const isStep1Valid = videoData.videoUrl && videoData.videoDuration <= maxDuration;
  const isStep3Valid =
    artworkData.title.trim() !== '' &&
    artworkData.category !== '' &&
    artworkData.technique !== '' &&
    artworkData.style !== '' &&
    artworkData.width > 0 &&
    artworkData.height > 0 &&
    artworkData.price > 0;

  // Manejadores de vídeo
  const handleGallerySelect = () => fileInputRef.current?.click();
  const handleCameraSelect = () => cameraInputRef.current?.click();

  const handleFileChange = useCallback(async (e, isCamera = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Veuillez sélectionner un fichier vidéo valide');
      return;
    }
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(tempVideo.src);
      const duration = tempVideo.duration;
      if (duration > maxDuration) {
        setError(`La vidéo ne doit pas dépasser ${maxDuration} secondes`);
        return;
      }
      setLoading(true);
      setUploadProgress(0);
      videoUpload(file, (progress) => setUploadProgress(progress))
        .then(result => {
          if (isMountedRef.current) {
            setVideoData({
              videoFile: file,
              videoPreview: URL.createObjectURL(file),
              videoDuration: duration,
              videoUrl: result.url,
              videoPublicId: result.public_id,
              thumbnail: result.thumbnail,
            });
            setError(null);
          }
        })
        .catch(err => {
          console.error(err);
          setError('Erreur lors du téléchargement de la vidéo');
        })
        .finally(() => {
          if (isMountedRef.current) setLoading(false);
        });
    };
    tempVideo.onerror = () => {
      URL.revokeObjectURL(tempVideo.src);
      setError('Erreur lors de la lecture de la vidéo');
    };
    tempVideo.src = URL.createObjectURL(file);
  }, [maxDuration]);

  const clearVideo = () => {
    if (videoData.videoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(videoData.videoPreview);
    }
    setVideoData({
      videoFile: null,
      videoPreview: null,
      videoDuration: 0,
      videoUrl: '',
      videoPublicId: '',
      thumbnail: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const updateArtworkField = (field, value) => {
    setArtworkData(prev => ({ ...prev, [field]: value }));
  };

  const updateMusicData = (newData) => {
    setMusicData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !isStep1Valid) {
      setError('Veuillez sélectionner et télécharger une vidéo valide');
      return;
    }
    if (currentStep === 3 && !isStep3Valid) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setError(null);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!isStep3Valid) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSubmitting(true);

    const payload = {
      title: artworkData.title,
      description: artworkData.description,
      category: artworkData.category,
      videoUrl: videoData.videoUrl,
      videoPublicId: videoData.videoPublicId,
      thumbnail: videoData.thumbnail || '',
      duration: videoData.videoDuration,
      technique: artworkData.technique,
      style: artworkData.style,
      width: Number(artworkData.width),
      height: Number(artworkData.height),
      price: Number(artworkData.price),
      status: artworkData.status,      // ✅ AÑADIDO
      stock: Number(artworkData.stock), // ✅ AÑADIDO
      music: musicData.selectedMusic ? {
        id: musicData.selectedMusic.id,
        title: musicData.selectedMusic.title,
        artist: musicData.selectedMusic.artist,
        audioUrl: musicData.selectedMusic.audioUrl,
        audioPublicId: musicData.selectedMusic.audioPublicId || musicData.selectedMusic.publicId,
        volume: musicData.musicVolume
      } : null,
      images: additionalImages,
    };

    try {
      const res = await dispatch(createVideo(payload, auth.token));
      if (res?.success) {
        dispatch({ type: GLOBALTYPES.ALERT, payload: { success: '✅ Œuvre publiée avec succès !' } });
        history.push('/');
        if (onSuccess) onSuccess();
      } else {
        setError(res?.message || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau, veuillez réessayer');
    } finally {
      setSubmitting(false);
    }
  };

  // ====== RENDER PASO 1 ======
  const renderStep1 = () => (
    <div className="unified-step-1">
      <div className="video-source-row">
        <div className="video-source-option" onClick={handleGallerySelect}>
          <Image size={28} />
          <span>Galerie</span>
        </div>
        <div className="video-source-option" onClick={handleCameraSelect}>
          <Camera size={28} />
          <span>Caméra</span>
        </div>
      </div>

      <input type="file" ref={fileInputRef} accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, false)} />
      <input type="file" ref={cameraInputRef} accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, true)} />

      {loading && uploadProgress > 0 && (
        <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} striped animated className="mt-3" style={{ borderRadius: '20px', height: '6px' }} />
      )}

      {videoData.videoPreview && (
        <div className="video-preview-container">
          <div className="video-preview-header">
            <Badge bg="info">📹 {Math.floor(videoData.videoDuration)}s</Badge>
            <Badge bg="success">✅ Prêt</Badge>
          </div>
          <video src={videoData.videoPreview} controls className="video-preview-element" />
          <Button variant="outline-danger" onClick={clearVideo} className="mt-3">
            <X size={16} /> Changer la vidéo
          </Button>
        </div>
      )}

      {!videoData.videoPreview && !loading && (
        <div className="text-center mt-4 p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
          <Camera size={48} style={{ opacity: 0.5 }} />
          <p className="mt-2">Sélectionnez une vidéo de présentation</p>
          <small className="text-muted">Max {maxDuration} secondes</small>
        </div>
      )}
    </div>
  );

  // ====== RENDER PASO 2 ======
  const renderStep2 = () => (
    <StepMusicSelection 
      wizardData={{ 
        selectedMusic: musicData.selectedMusic, 
        musicVolume: musicData.musicVolume,
        originalAudio: musicData.originalAudio
      }} 
      updateData={updateMusicData} 
    />
  );

  // ====== RENDER PASO 3 (CON STATUS Y STOCK) ======
  const renderStep3 = () => (
    <div className="step3-container" style={{ background: '#ffffff', padding: '20px', borderRadius: '16px' }}>
      <h5 className="mb-4" style={{ color: '#212529', fontWeight: 'bold' }}>🎨 Détails de l'œuvre</h5>

      {/* Título */}
      <div className="mb-3">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>Titre *</label>
        <input 
          type="text" 
          className="form-control" 
          value={artworkData.title} 
          onChange={e => updateArtworkField('title', e.target.value)}
          style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
        />
      </div>

      {/* Categoría */}
      <div className="mb-3">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>Thème / Catégorie *</label>
        <select 
          className="form-select" 
          value={artworkData.category} 
          onChange={e => updateArtworkField('category', e.target.value)}
          style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
        >
          <option value="">Sélectionner un thème</option>
          {sliderCategories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        <small className="text-muted">Le thème artistique de votre œuvre (paysage, portrait, marine...)</small>
      </div>

      {/* Descripción */}
      <div className="mb-3">
        <label className="form-label" style={{ color: '#212529' }}>Description</label>
        <textarea 
          rows="3" 
          className="form-control" 
          value={artworkData.description} 
          onChange={e => updateArtworkField('description', e.target.value)}
          style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529', resize: 'vertical' }}
        />
      </div>

      {/* Técnica y Estilo */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Technique *</label>
          <select 
            className="form-select" 
            value={artworkData.technique} 
            onChange={e => updateArtworkField('technique', e.target.value)}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          >
            <option value="">Choisir</option>
            <option value="Huile">Huile</option>
            <option value="Acrylique">Acrylique</option>
            <option value="Tempera">Tempera</option>
            <option value="Aquarelle">Aquarelle</option>
            <option value="Pastel">Pastel</option>
            <option value="Encre">Encre</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Style *</label>
          <select 
            className="form-select" 
            value={artworkData.style} 
            onChange={e => updateArtworkField('style', e.target.value)}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          >
            <option value="">Choisir</option>
            <option value="Réalisme">Réalisme</option>
            <option value="Impressionnisme">Impressionnisme</option>
            <option value="Expressionnisme">Expressionnisme</option>
            <option value="Abstrait">Abstrait</option>
            <option value="Cubisme">Cubisme</option>
            <option value="Surréalisme">Surréalisme</option>
          </select>
        </div>
      </div>

      {/* Dimensiones */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Largeur (cm) *</label>
          <input 
            type="number" 
            className="form-control" 
            value={artworkData.width} 
            onChange={e => updateArtworkField('width', e.target.value)}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Hauteur (cm) *</label>
          <input 
            type="number" 
            className="form-control" 
            value={artworkData.height} 
            onChange={e => updateArtworkField('height', e.target.value)}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          />
        </div>
      </div>

      {/* Precio */}
      <div className="mb-3">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>Prix (DZD) *</label>
        <input 
          type="number" 
          className="form-control" 
          value={artworkData.price} 
          onChange={e => updateArtworkField('price', e.target.value)}
          style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
        />
      </div>

      {/* ✅ NUEVOS CAMPOS: STATUS Y STOCK */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Statut *</label>
          <select 
            className="form-select" 
            value={artworkData.status} 
            onChange={e => updateArtworkField('status', e.target.value)}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          >
            <option value="en vente">En vente</option>
            <option value="en exposition">En exposition</option>
            <option value="vendue">Vendue</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Stock *</label>
          <input 
            type="number" 
            className="form-control" 
            min="0"
            value={artworkData.stock} 
            onChange={e => updateArtworkField('stock', Number(e.target.value))}
            style={{ background: '#fff', border: '1px solid #ced4da', color: '#212529' }}
          />
        </div>
      </div>

      {/* Imágenes adicionales */}
      <div className="mb-4">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>
          🖼️ Photos supplémentaires (max 5)
        </label>
        <ImageUploadField 
          images={additionalImages} 
          setImages={setAdditionalImages} 
          multiple={true} 
          maxImages={5} 
        />
        <small className="text-muted">Jusqu'à 5 images (JPG, PNG). La première servira de miniature si la vidéo n'en fournit pas.</small>
      </div>
    </div>
  );

  const stepLabels = ['Vidéo', 'Musique', 'Œuvre'];

  return (
    <div className="create-artwork-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '12px' }}>
      <Card className="border-0 shadow-lg" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px' }}>
        <Card.Body className="p-3">
          <div className="cw-header px-2 pt-2 pb-0">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h3 className="cw-header-title" style={{ color: 'white', fontWeight: 'bold' }}>🎨 Nouvelle œuvre</h3>
              <Badge bg="primary" className="p-2">📹 {maxDuration}s max</Badge>
            </div>
            <StepIndicator currentStep={currentStep} totalSteps={3} labels={stepLabels} />
          </div>
          <div className="cw-step-content px-2 mt-3">
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
          <div className="cw-footer mt-3 p-3 d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={prevStep} disabled={loading || submitting || currentStep === 1}>← Retour</Button>
            {currentStep < 3 ? (
              <Button variant="primary" onClick={nextStep} disabled={loading || (currentStep === 1 && !isStep1Valid)}>Suivant →</Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} disabled={submitting || !isStep3Valid}>
                {submitting ? <Spinner size="sm" className="me-2" /> : <CloudUpload className="me-2" />}
                {submitting ? 'Publication...' : 'Publier l\'œuvre'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateArtworkWizard;
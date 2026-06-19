// src/pages/artwork/EditVideoWizard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Alert, Spinner, Card, ProgressBar, Badge } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, CloudUpload, PencilFill, Trash, X } from 'react-bootstrap-icons';
import StepIndicator from './StepIndicator';
import StepMusicSelection from './StepMusicSelection';
import ImageUploadField from './ImageUploadField';
import { getVideoById, updateVideo } from '../../redux/actions/videoAction';
import { getSliderCategories } from '../../redux/actions/categoryAction';
import { videoUpload } from '../../utils/imageUpload';
import { imageUpload2 } from '../../utils/imageUpload2';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import './CreateVideoWizard.css';

const EditVideoWizard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const { currentVideo: video, loading: videoLoading } = useSelector(state => state.video || {});
  const { sliderCategories = [] } = useSelector(state => state.category || {});

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [keepExistingVideo, setKeepExistingVideo] = useState(true);

  const [artworkData, setArtworkData] = useState({
    videoFile: null,
    videoPreview: null,
    videoDuration: 0,
    videoUrl: '',
    videoPublicId: '',
    thumbnail: '',
    selectedMusic: null,
    musicVolume: 70,
    originalAudio: true,
    title: '',
    description: '',
    category: '',
    technique: '',
    style: '',
    width: '',
    height: '',
    price: '',
    status: 'en vente',
    stock: 1,
    existingImages: [],
    newImages: [],
  });

  const fileInputRef = useRef(null);
  const maxDuration = 60;

  // Cargar categorías
  useEffect(() => {
    if (sliderCategories.length === 0) {
      dispatch(getSliderCategories());
    }
  }, [dispatch, sliderCategories.length]);

  // Cargar video por ID
  useEffect(() => {
    if (id) {
      dispatch(getVideoById(id));
    }
  }, [dispatch, id]);

  // Rellenar formulario
  useEffect(() => {
    if (video && !videoLoading) {
      const existingImages = (video.images || []).map(img => {
        let url = '';
        let public_id = '';
        if (typeof img === 'string') {
          url = img;
          public_id = url.split('/').pop().split('.')[0] || 'image';
        } else if (img && typeof img === 'object') {
          url = img.url || '';
          public_id = img.public_id || url.split('/').pop().split('.')[0] || 'image';
        }
        return { url, isExisting: true, public_id };
      }).filter(img => img.url);

      setArtworkData({
        videoFile: null,
        videoPreview: video.videoUrl,
        videoDuration: video.duration || 0,
        videoUrl: video.videoUrl,
        videoPublicId: video.videoPublicId || '',
        thumbnail: video.thumbnail || '',
        selectedMusic: video.music || null,
        musicVolume: video.music?.volume || 70,
        title: video.title || '',
        description: video.description || '',
        category: video.category?._id || video.category || '',
        technique: video.technique || '',
        style: video.style || '',
        width: video.width || '',
        height: video.height || '',
        price: video.price || '',
        status: video.status || 'en vente',
        stock: video.stock !== undefined ? video.stock : 1,
        existingImages: existingImages,
        newImages: [],
      });
    }
  }, [video, videoLoading]);

  const updateArtworkField = useCallback((newData) => {
    setArtworkData(prev => ({ ...prev, ...newData }));
    if (newData.videoFile) setKeepExistingVideo(false);
  }, []);

  const removeExistingImage = useCallback((index) => {
    setArtworkData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  }, []);

  const validateStep = useCallback((step) => {
    switch (step) {
      case 1:
        if (!keepExistingVideo && !artworkData.videoFile) {
          setError('Veuillez sélectionner une nouvelle vidéo');
          return false;
        }
        if (!keepExistingVideo && artworkData.videoDuration > maxDuration) {
          setError(`La vidéo ne doit pas dépasser ${maxDuration} secondes`);
          return false;
        }
        break;
      case 2:
        break;
      case 3:
        if (!artworkData.title.trim()) {
          setError('Le titre est obligatoire');
          return false;
        }
        if (!artworkData.category) {
          setError('Veuillez sélectionner une catégorie');
          return false;
        }
        if (!artworkData.technique) {
          setError('La technique est obligatoire');
          return false;
        }
        if (!artworkData.style) {
          setError('Le style est obligatoire');
          return false;
        }
        if (!artworkData.width || artworkData.width <= 0) {
          setError('La largeur est obligatoire et doit être > 0');
          return false;
        }
        if (!artworkData.height || artworkData.height <= 0) {
          setError('La hauteur est obligatoire et doit être > 0');
          return false;
        }
        if (!artworkData.price || artworkData.price <= 0) {
          setError('Le prix est obligatoire et doit être > 0');
          return false;
        }
        break;
      default:
        break;
    }
    setError(null);
    return true;
  }, [keepExistingVideo, artworkData, maxDuration]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo(0, 0);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let videoUrl = artworkData.videoUrl;
      let videoPublicId = artworkData.videoPublicId;
      let thumbnail = artworkData.thumbnail;
      let videoDuration = artworkData.videoDuration;

      if (!keepExistingVideo && artworkData.videoFile) {
        const result = await videoUpload(artworkData.videoFile, (progress) => setUploadProgress(progress));
        videoUrl = result.url;
        videoPublicId = result.public_id;
        thumbnail = result.thumbnail;
        videoDuration = artworkData.videoDuration;
      }

      let uploadedNewImages = [];
      if (artworkData.newImages && artworkData.newImages.length > 0) {
        const newImageObjects = artworkData.newImages.filter(img => !img.isExisting);
        if (newImageObjects.length > 0) {
          const uploadArray = newImageObjects.map(img => ({ file: img.file, isExisting: false }));
          uploadedNewImages = await imageUpload2(uploadArray);
        }
      }

      const existingUrls = artworkData.existingImages.map(img => img.url);
      const finalImages = [...existingUrls, ...uploadedNewImages];

      let musicData = null;
      if (artworkData.selectedMusic) {
        musicData = {
          id: artworkData.selectedMusic.id,
          title: artworkData.selectedMusic.title,
          artist: artworkData.selectedMusic.artist,
          audioUrl: artworkData.selectedMusic.audioUrl,
          audioPublicId: artworkData.selectedMusic.audioPublicId,
          volume: artworkData.musicVolume
        };
      }

      const payload = {
        title: artworkData.title,
        description: artworkData.description,
        category: artworkData.category,
        technique: artworkData.technique,
        style: artworkData.style,
        width: Number(artworkData.width),
        height: Number(artworkData.height),
        price: Number(artworkData.price),
        status: artworkData.status,
        stock: Number(artworkData.stock),
        videoUrl,
        videoPublicId,
        thumbnail,
        duration: videoDuration,
        images: finalImages,
        music: musicData,
      };

      const res = await dispatch(updateVideo(id, payload, auth.token));
      if (res?.success) {
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: '✏️ Œuvre modifiée avec succès !' }
        });
        history.push('/'); // ✅ Redirigir al HOME
      } else {
        setError(res?.message || 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.message || err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [artworkData, keepExistingVideo, id, auth.token, dispatch, history, validateStep]);

  // ===== RENDER PASO 1 =====
  const renderStep1 = () => (
    <div className="unified-step-1">
      {keepExistingVideo && video && (
        <div className="mb-4 p-3" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ color: 'white', margin: 0 }}>📹 Vidéo actuelle</h6>
            <Button variant="outline-danger" size="sm" onClick={() => setKeepExistingVideo(false)}>
              <Trash size={14} className="me-1" /> Changer
            </Button>
          </div>
          <video src={video.videoUrl} controls style={{ width: '100%', maxHeight: '300px', borderRadius: '12px' }} poster={video.thumbnail} />
          <div className="mt-2 text-muted small">Durée: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</div>
        </div>
      )}

      {!keepExistingVideo && (
        <>
          <div className="video-source-row">
            <div className="video-source-option" onClick={() => fileInputRef.current?.click()}>
              <CloudUpload size={28} />
              <span>Nouvelle vidéo</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} accept="video/*" style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                const vid = document.createElement('video');
                vid.preload = 'metadata';
                vid.onloadedmetadata = () => {
                  const dur = vid.duration;
                  if (dur > maxDuration) {
                    setError(`Durée max ${maxDuration}s`);
                    URL.revokeObjectURL(previewUrl);
                    return;
                  }
                  updateArtworkField({
                    videoFile: file,
                    videoPreview: previewUrl,
                    videoDuration: dur,
                    videoUrl: '',
                    videoPublicId: '',
                    thumbnail: ''
                  });
                  setError(null);
                };
                vid.src = URL.createObjectURL(file);
              }
            }}
          />
          {artworkData.videoPreview && (
            <div className="video-preview-container">
              <video src={artworkData.videoPreview} controls className="video-preview-element" />
              <Button variant="outline-danger" size="sm" className="mt-2" onClick={() => {
                updateArtworkField({ videoFile: null, videoPreview: null, videoDuration: 0 });
                setKeepExistingVideo(true);
              }}>Annuler</Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ===== RENDER PASO 2 =====
  const renderStep2 = () => (
    <StepMusicSelection
      wizardData={{
        selectedMusic: artworkData.selectedMusic,
        musicVolume: artworkData.musicVolume,
        originalAudio: artworkData.originalAudio
      }}
      updateData={updateArtworkField}
    />
  );

  // ===== RENDER PASO 3 =====
  const renderStep3 = () => (
    <div className="step3-container" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px' }}>
      <h5 className="mb-4" style={{ color: '#212529', fontWeight: 'bold' }}>🎨 Détails de l'œuvre</h5>

      <div className="mb-3">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>Titre *</label>
        <input type="text" className="form-control" style={{ border: '1px solid #ced4da' }} value={artworkData.title} onChange={e => updateArtworkField({ title: e.target.value })} />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold" style={{ color: '#212529' }}>Thème *</label>
        <select className="form-select" style={{ border: '1px solid #ced4da' }} value={artworkData.category} onChange={e => updateArtworkField({ category: e.target.value })}>
          <option value="">Sélectionner</option>
          {sliderCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label" style={{ color: '#212529' }}>Description</label>
        <textarea rows="3" className="form-control" style={{ border: '1px solid #ced4da' }} value={artworkData.description} onChange={e => updateArtworkField({ description: e.target.value })} />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label style={{ color: '#212529' }}>Technique *</label>
          <select className="form-select" style={{ border: '1px solid #ced4da' }} value={artworkData.technique} onChange={e => updateArtworkField({ technique: e.target.value })}>
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
          <label style={{ color: '#212529' }}>Style *</label>
          <select className="form-select" style={{ border: '1px solid #ced4da' }} value={artworkData.style} onChange={e => updateArtworkField({ style: e.target.value })}>
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

      <div className="row">
        <div className="col-md-6 mb-3">
          <label style={{ color: '#212529' }}>Largeur (cm) *</label>
          <input type="number" className="form-control" style={{ border: '1px solid #ced4da' }} value={artworkData.width} onChange={e => updateArtworkField({ width: e.target.value })} />
        </div>
        <div className="col-md-6 mb-3">
          <label style={{ color: '#212529' }}>Hauteur (cm) *</label>
          <input type="number" className="form-control" style={{ border: '1px solid #ced4da' }} value={artworkData.height} onChange={e => updateArtworkField({ height: e.target.value })} />
        </div>
      </div>

      <div className="mb-3">
        <label style={{ color: '#212529' }}>Prix (DZD) *</label>
        <input type="number" className="form-control" style={{ border: '1px solid #ced4da' }} value={artworkData.price} onChange={e => updateArtworkField({ price: e.target.value })} />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Statut *</label>
          <select className="form-select" style={{ border: '1px solid #ced4da' }} value={artworkData.status} onChange={e => updateArtworkField({ status: e.target.value })}>
            <option value="en vente">En vente</option>
            <option value="en exposition">En exposition</option>
            <option value="vendue">Vendue</option>
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>Stock *</label>
          <input type="number" className="form-control" min="0" style={{ border: '1px solid #ced4da' }} value={artworkData.stock} onChange={e => updateArtworkField({ stock: Number(e.target.value) })} />
        </div>
      </div>

      {artworkData.existingImages.length > 0 && (
        <div className="mb-3">
          <label className="form-label fw-bold" style={{ color: '#212529' }}>🖼️ Images existantes</label>
          <div className="d-flex gap-3 flex-wrap">
            {artworkData.existingImages.map((img, idx) => (
              <div key={idx} className="position-relative" style={{ width: '100px', height: '100px' }}>
                <img
                  src={img.url}
                  alt={`existing-${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                  onClick={() => removeExistingImage(idx)}
                  style={{ width: '24px', height: '24px', fontSize: '12px', padding: 0, transform: 'translate(30%, -30%)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <small className="text-muted">Cliquez sur la ✕ pour supprimer une image existante.</small>
        </div>
      )}

      <div className="mb-4">
        <label style={{ color: '#212529' }}>🖼️ Ajouter des photos (max 5)</label>
        <ImageUploadField
          images={artworkData.newImages}
          setImages={(newImages) => updateArtworkField({ newImages })}
          multiple={true}
          maxImages={5}
        />
        <small className="text-muted d-block mt-2">
          Vous pouvez ajouter jusqu'à 5 nouvelles images.
        </small>
      </div>
    </div>
  );

  const stepLabels = ['Vidéo', 'Musique', 'Œuvre'];

  if (videoLoading && !video) {
    return (
      <div className="create-artwork-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '12px' }}>
        <Card className="border-0 shadow-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Card.Body className="p-5 text-center">
            <Spinner animation="border" variant="light" />
            <p className="mt-3 text-white">Chargement de l'œuvre...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!video && !videoLoading) {
    return (
      <div className="create-artwork-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '12px' }}>
        <Card className="border-0 shadow-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Card.Body className="p-5 text-center">
            <p className="text-white">Œuvre non trouvée</p>
            <Button onClick={() => history.push('/')}>Retour</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="create-artwork-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '12px' }}>
      <Card className="border-0 shadow-lg" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px' }}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h3 className="mb-0" style={{ color: 'white', fontWeight: 'bold' }}>
                <PencilFill className="me-2" /> Modifier l'œuvre
              </h3>
              <small className="text-muted">{video?.title}</small>
            </div>
            <Badge bg="primary" className="p-2">📹 {maxDuration}s max</Badge>
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={3} labels={stepLabels} />

          {error && <Alert variant="danger" className="mt-3" onClose={() => setError(null)} dismissible>{error}</Alert>}

          <div className="mt-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          <div className="mt-4 pt-3 d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={currentStep === 1 ? () => history.push('/') : prevStep} disabled={loading}
              style={{ borderRadius: '40px', padding: '8px 20px' }}>
              <ArrowLeft className="me-2" /> {currentStep === 1 ? 'Annuler' : 'Retour'}
            </Button>
            {currentStep < 3 ? (
              <Button variant="primary" onClick={nextStep} disabled={loading}
                style={{ borderRadius: '40px', padding: '8px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}>
                Suivant <ArrowRight className="ms-2" />
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} disabled={loading}
                style={{ borderRadius: '40px', padding: '8px 20px', background: 'linear-gradient(135deg, #28a745, #20c997)', border: 'none' }}>
                {loading ? (
                  <><Spinner size="sm" className="me-2" /> {uploadProgress > 0 ? `Upload ${uploadProgress}%...` : 'Mise à jour...'}</>
                ) : (
                  <><CloudUpload className="me-2" /> Mettre à jour</>
                )}
              </Button>
            )}
          </div>
          {loading && uploadProgress > 0 && <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} striped animated className="mt-3" />}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditVideoWizard;
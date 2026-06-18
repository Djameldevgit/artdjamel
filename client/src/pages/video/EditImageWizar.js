// pages/video/EditImageWizard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Alert, Spinner, Card, ProgressBar, Badge } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, CloudUpload, PencilFill, Trash, Image } from 'react-bootstrap-icons';
import StepIndicator from './StepIndicator';
import StepMusicSelection from './StepMusicSelection';
import { getImageById, updateImage } from '../../redux/actions/imageAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { imageUpload } from '../../utils/imageUpload';

const EditImageWizard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth } = useSelector(state => state);
  const { currentImage: image, loading: imageLoading } = useSelector(state => state.image || {});
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  
  const [wizardData, setWizardData] = useState({
    imageSource: 'existing',
    imageFile: null,
    imagePreview: null,
    selectedMusic: null,
    musicVolume: 70,
    title: '',
    description: ''
  });
  
  // Charger les données de l'image existante
  useEffect(() => {
    if (id) {
      dispatch(getImageById(id));
    }
  }, [dispatch, id]);
  
  // Remplir le wizard avec les données existantes
  useEffect(() => {
    if (image && !imageLoading) {
      console.log('🖼️ Image chargée pour édition:', image);
      setWizardData({
        imageSource: 'existing',
        imageFile: null,
        imagePreview: image.imageUrl || null,
        selectedMusic: image.music || null,
        musicVolume: image.music?.volume || 70,
        title: image.title || '',
        description: image.description || ''
      });
    }
  }, [image, imageLoading]);
  
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!keepExistingImage && !wizardData.imageFile) {
          setError('Veuillez sélectionner une nouvelle image');
          return false;
        }
        break;
      case 2:
        break;
      case 3:
        if (!wizardData.title.trim()) {
          setError('Veuillez ajouter un titre');
          return false;
        }
        break;
      default:
        return true;
    }
    setError(null);
    return true;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };
  
  const updateWizardData = (newData) => {
    setWizardData(prev => ({ ...prev, ...newData }));
    if (newData.imageFile) {
      setKeepExistingImage(false);
    }
  };
  
  const handleCancel = () => {
    history.push('/videos/1');
  };
  
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      let imageUrl, imageId;
      
      if (keepExistingImage && wizardData.imageSource === 'existing') {
        // Garder l'image existante
        imageUrl = image.imageUrl;
        imageId = image.imageId;
      } 
      else if (wizardData.imageFile) {
        // Upload nouvelle image
        const result = await imageUpload(wizardData.imageFile, (progress) => {
          setUploadProgress(progress);
        });
        imageUrl = result.url;
        imageId = result.public_id;
      } else {
        throw new Error('Aucune source image valide');
      }
      
      const imageData = {
        title: wizardData.title,
        description: wizardData.description,
        imageUrl,
        imageId,
        music: wizardData.selectedMusic ? {
          id: wizardData.selectedMusic.id,
          title: wizardData.selectedMusic.title,
          volume: wizardData.musicVolume
        } : null
      };
      
      const result = await dispatch(updateImage(id, imageData, auth.token));
      
      if (result?.success) {
        if (wizardData.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(wizardData.imagePreview);
        }
        
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: '✏️ Image modifiée avec succès !' }
        });
        
        // Rediriger vers le feed
        history.push('/videos/1');
      } else {
        setError(result?.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  // Render Step 1 - Édition image
  const renderStep1 = () => (
    <div className="step1-container" style={{ padding: '0 8px' }}>
      {keepExistingImage && image && (
        <div className="existing-image mb-4">
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ color: 'white', margin: 0 }}>🖼️ Image actuelle</h6>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => {
                  setKeepExistingImage(false);
                  updateWizardData({ imageSource: null, imageFile: null, imagePreview: null });
                }}
              >
                <Trash size={14} className="me-1" />
                Changer
              </Button>
            </div>
            <img
              src={image.imageUrl}
              alt={image.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '12px',
                background: '#000'
              }}
            />
          </div>
        </div>
      )}
      
      {!keepExistingImage && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '30px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <input
                type="file"
                id="imageInput"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setError("L'image ne doit pas dépasser 10MB");
                      return;
                    }
                    const previewUrl = URL.createObjectURL(file);
                    updateWizardData({
                      imageFile: file,
                      imagePreview: previewUrl,
                      imageSource: 'gallery'
                    });
                    setError(null);
                  }
                }}
              />
              <label htmlFor="imageInput" style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '60px',
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                margin: '0 auto'
              }}>
                <CloudUpload size={36} color="white" />
              </label>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#fff' }}>Nouvelle image</div>
            </div>
          </div>
          
          {wizardData.imagePreview && (
            <div style={{ marginTop: '20px', position: 'relative' }}>
              <img
                src={wizardData.imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  background: '#000'
                }}
              />
              <Button 
                variant="outline-danger" 
                size="sm"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  borderRadius: '30px'
                }}
                onClick={() => {
                  updateWizardData({ imageFile: null, imagePreview: null });
                  setKeepExistingImage(true);
                }}
              >
                Annuler
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  // Render Step 3 - Titre et description
  const renderStep3 = () => (
    <div className="step3-container" style={{ padding: '20px' }}>
      <h5 className="mb-4" style={{ color: 'white', fontWeight: 'bold' }}>
        ✏️ Modifier les détails
      </h5>
      
      <div className="mb-4">
        <label className="form-label" style={{ color: 'white', fontWeight: 500 }}>
          Titre *
        </label>
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Titre de l'image..."
          value={wizardData.title}
          onChange={(e) => updateWizardData({ title: e.target.value })}
          maxLength="100"
          style={{ 
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: 'white'
          }}
        />
        <small className="text-muted mt-1 d-block">
          {wizardData.title.length}/100 caractères
        </small>
      </div>
      
      <div className="mb-4">
        <label className="form-label" style={{ color: 'white', fontWeight: 500 }}>
          Description
        </label>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Description de l'image..."
          value={wizardData.description}
          onChange={(e) => updateWizardData({ description: e.target.value })}
          maxLength="500"
          style={{ 
            borderRadius: '12px',
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            resize: 'none'
          }}
        />
        <small className="text-muted mt-1 d-block">
          {wizardData.description.length}/500 caractères
        </small>
      </div>
      
      {/* Aperçu */}
      {(keepExistingImage && image) || wizardData.imagePreview ? (
        <div className="mt-4 p-3" style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px'
        }}>
          <label className="form-label" style={{ color: 'white', fontWeight: 500 }}>
            Aperçu
          </label>
          <img
            src={keepExistingImage ? image?.imageUrl : wizardData.imagePreview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        </div>
      ) : null}
    </div>
  );
  
  const stepLabels = ['Image', 'Musique', 'Infos'];
  
  if (imageLoading && !image) {
    return (
      <div className="create-video-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '16px' }}>
        <Card className="border-0 shadow-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Card.Body className="p-5 text-center">
            <Spinner animation="border" variant="light" />
            <p className="mt-3 text-white">Chargement de l'image...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="create-video-wizard" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '16px'
    }}>
      <Card className="border-0 shadow-lg" style={{ 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px'
      }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="mb-0" style={{ color: 'white', fontWeight: 'bold' }}>
                <PencilFill className="me-2" style={{ fontSize: '1.2rem' }} />
                Modifier l'image
              </h3>
              <small className="text-muted">{image?.title}</small>
            </div>
            <Badge bg="info" className="p-2">
              🖼️ Image
            </Badge>
          </div>
          
          <StepIndicator currentStep={currentStep} totalSteps={3} labels={stepLabels} />
          
          {error && (
            <Alert variant="danger" className="mt-3" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <div className="mt-4">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && (
              <StepMusicSelection 
                wizardData={wizardData}
                updateData={updateWizardData}
                videoType="image"
              />
            )}
            {currentStep === 3 && renderStep3()}
          </div>
          
          <div className="mt-4 pt-3 d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={currentStep === 1 ? handleCancel : prevStep} 
              disabled={loading}
              style={{ borderRadius: '40px', padding: '10px 24px' }}
            >
              <ArrowLeft className="me-2" />
              {currentStep === 1 ? 'Annuler' : 'Retour'}
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                variant="primary" 
                onClick={nextStep} 
                disabled={loading}
                style={{ borderRadius: '40px', padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
              >
                Suivant <ArrowRight className="ms-2" />
              </Button>
            ) : (
              <Button 
                variant="success" 
                onClick={handleSubmit} 
                disabled={loading}
                style={{ borderRadius: '40px', padding: '10px 24px', background: 'linear-gradient(135deg, #28a745, #20c997)', border: 'none' }}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {uploadProgress > 0 ? `Upload ${uploadProgress}%...` : 'Mise à jour...'}
                  </>
                ) : (
                  <>
                    <CloudUpload className="me-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            )}
          </div>
          
          {loading && uploadProgress > 0 && (
            <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} striped animated className="mt-3" />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditImageWizard;
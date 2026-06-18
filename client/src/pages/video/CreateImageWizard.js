// pages/video/CreateImageWizard.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Button, Alert, Spinner, Card, ProgressBar, Badge } from 'react-bootstrap';
import { 
  ArrowLeft, 
  ArrowRight,
  CloudUpload,
  MusicNote,
  Image as ImageIcon,
  Camera,
  X,
  CheckCircle
} from 'react-bootstrap-icons';
import StepIndicator from './StepIndicator';
import StepMusicSelection from './StepMusicSelection';
import { createImagePost } from '../../redux/actions/imageAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';
import { imageUpload2 } from '../../utils/imageUpload2';
  
const CreateImageWizard = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth, socket } = useSelector(state => state);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const isMountedRef = useRef(true);
  
  const [wizardData, setWizardData] = useState({
    imageSource: null,
    imageFile: null,
    imagePreview: null,
    selectedMusic: null,
    musicVolume: 70,
    title: '',
    description: ''
  });
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (wizardData.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(wizardData.imagePreview);
      }
    };
  }, [wizardData.imagePreview]);
  
  const isStep1Valid = useMemo(() => {
    if (!wizardData.imageSource) return false;
    if (!wizardData.imageFile && !wizardData.imagePreview) return false;
    return true;
  }, [wizardData.imageSource, wizardData.imageFile, wizardData.imagePreview]);
  
  const isStep3Valid = useMemo(() => {
    if (!wizardData.title.trim()) return false;
    return true;
  }, [wizardData.title]);
  
  const handleGallerySelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleCameraSelect = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);
  
  const handleFileChange = useCallback(async (e, isCamera = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }
    
    // Vérifier taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10MB");
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    
    setWizardData(prev => ({
      ...prev,
      imageSource: isCamera ? 'camera' : 'gallery',
      imageFile: file,
      imagePreview: previewUrl
    }));
    
    setError(null);
  }, []);
  
  const clearImage = useCallback(() => {
    if (wizardData.imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(wizardData.imagePreview);
    }
    setWizardData(prev => ({
      ...prev,
      imageSource: null,
      imageFile: null,
      imagePreview: null
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, [wizardData.imagePreview]);
  
  const nextStep = useCallback(() => {
    if (currentStep === 1 && !isStep1Valid) {
      setError('Veuillez sélectionner une image');
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }
    if (currentStep === 3 && !isStep3Valid) {
      setError('Veuillez ajouter un titre');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setError(null);
    window.scrollTo(0, 0);
  }, [currentStep, isStep1Valid, isStep3Valid]);
  
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
    window.scrollTo(0, 0);
  }, []);
  
  const updateWizardData = useCallback((newData) => {
    if (isMountedRef.current) {
      setWizardData(prev => ({ ...prev, ...newData }));
    }
  }, []);
  
  // ✅ HANDLE SUBMIT CORREGIDO - Usando imageUpload2
  const handleSubmit = useCallback(async () => {
    if (!isStep3Valid) {
      setError('Veuillez ajouter un titre');
      return;
    }
    
    if (!wizardData.imageFile && !wizardData.imagePreview) {
      setError('Aucune image sélectionnée');
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // ✅ Preparar el objeto imagen para imageUpload2
      const imageObject = {
        url: wizardData.imagePreview,  // blob URL
        name: wizardData.imageFile?.name || 'image.jpg',
        isExisting: false
      };
      
      console.log('📸 Subiendo imagen con imageUpload2...');
      console.log('📸 Image object:', imageObject);
      
      // ✅ Usar imageUpload2 en lugar de imageUpload
      const result = await imageUpload2(imageObject);
      
      console.log('📸 Resultado de upload:', result);
      
      if (!result || !result.url) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
      
      const imageData = {
        title: wizardData.title,
        description: wizardData.description,
        imageUrl: result.url,
        imageId: result.public_id,
        music: wizardData.selectedMusic ? {
          id: wizardData.selectedMusic.id,
          title: wizardData.selectedMusic.title,
          volume: wizardData.musicVolume
        } : null
      };
      
      const actionResult = await dispatch(createImagePost(imageData, auth.token));
      
      if (actionResult?.success && isMountedRef.current) {
        if (wizardData.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(wizardData.imagePreview);
        }
        
        dispatch({
          type: GLOBALTYPES.ALERT,
          payload: { success: '🖼️ Image publiée avec succès !' }
        });
        
        setTimeout(() => {
          history.push('/videos/1');
        }, 1500);
      } else {
        setError(actionResult?.error || "Erreur lors de la publication");
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setUploadProgress(0);
      }
    }
  }, [wizardData, isStep3Valid, dispatch, auth, history]);
  
  // Render Step 1 - Sélection image (style TikTok)
  const renderStep1 = () => (
    <div className="unified-step-1" style={{ padding: '0 8px' }}>
      {/* Deux icônes sur la même ligne */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        marginBottom: '30px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGallerySelect}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '60px',
              width: '70px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ImageIcon size={36} color="white" />
          </button>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#fff' }}>Galerie</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleCameraSelect}
            style={{
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              border: 'none',
              borderRadius: '60px',
              width: '70px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Camera size={36} color="white" />
          </button>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#fff' }}>Caméra</div>
        </div>
      </div>
      
      {/* Inputs cachés */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, false)}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, true)}
      />
      
      {/* Preview de l'image - occupe tout le reste de l'écran */}
      {wizardData.imagePreview && (
        <div className="image-preview-container" style={{ marginTop: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={wizardData.imagePreview} 
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '16px',
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
              onClick={clearImage}
            >
              <X size={16} className="me-1" />
              Changer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  const stepLabels = ['Image', 'Musique', 'Infos'];
  
  return (
    <div className="create-video-wizard" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
      <Card className="border-0 shadow-lg" style={{ background: 'transparent' }}>
        <Card.Body className="p-4">
          <div className="cw-header">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h3 className="cw-header-title" style={{ color: 'white' }}>
                🖼️ Nouvelle image
              </h3>
            </div>
            <StepIndicator currentStep={currentStep} totalSteps={3} labels={stepLabels} />
          </div>
          
          {error && (
            <Alert variant="danger" className="cw-alert mt-3" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <div className="cw-step-content mt-4">
            {currentStep === 1 && renderStep1()}
            
            {currentStep === 2 && (
              <StepMusicSelection 
                wizardData={wizardData}
                updateData={updateWizardData}
                videoType="image"
              />
            )}
            
            {currentStep === 3 && (
              <div className="step-video-info" style={{ padding: '20px' }}>
                <h5 className="mb-4" style={{ color: 'white' }}>📝 Détails de l'image</h5>
                
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'white' }}>Titre *</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Donnez un titre à votre image..."
                    value={wizardData.title}
                    onChange={(e) => updateWizardData({ title: e.target.value })}
                    maxLength="100"
                    style={{ borderRadius: '12px' }}
                  />
                  <small className="text-muted">{wizardData.title.length}/100</small>
                </div>
                
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'white' }}>Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Décrivez votre image..."
                    value={wizardData.description}
                    onChange={(e) => updateWizardData({ description: e.target.value })}
                    maxLength="500"
                    style={{ borderRadius: '12px' }}
                  />
                  <small className="text-muted">{wizardData.description.length}/500</small>
                </div>
                
                {/* Aperçu de l'image */}
                {wizardData.imagePreview && (
                  <div className="mt-3">
                    <label className="form-label" style={{ color: 'white' }}>Aperçu</label>
                    <img 
                      src={wizardData.imagePreview} 
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="cw-footer mt-4 d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={prevStep}
              disabled={loading || currentStep === 1}
              style={{ borderRadius: '40px', padding: '10px 24px' }}
            >
              <ArrowLeft className="me-2" />
              Retour
            </Button>
            
            {currentStep < 3 ? (
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={loading || (currentStep === 1 && !isStep1Valid)}
                style={{ borderRadius: '40px', padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
              >
                Suivant
                <ArrowRight className="ms-2" />
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={loading || !isStep3Valid}
                style={{ borderRadius: '40px', padding: '10px 24px', background: 'linear-gradient(135deg, #28a745, #20c997)', border: 'none' }}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {uploadProgress > 0 ? `Upload ${uploadProgress}%...` : 'Publication...'}
                  </>
                ) : (
                  <>
                    <CloudUpload className="me-2" />
                    Publier
                  </>
                )}
              </Button>
            )}
          </div>
          
          {loading && uploadProgress > 0 && (
            <ProgressBar 
              now={uploadProgress} 
              label={`${uploadProgress}%`} 
              striped 
              animated 
              className="cw-progress mt-3"
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateImageWizard;
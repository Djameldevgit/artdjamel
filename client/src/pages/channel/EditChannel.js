// src/pages/channel/EditChannel.jsx - VERSIÓN CON MENSAJE PARA CANAL PENDIENTE

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Tv, ArrowLeft, InfoCircle, Save, CheckCircle, Image, Upload, HourglassSplit } from 'react-bootstrap-icons';
import { getChannelById, updateChannel } from '../../redux/actions/channelAction';
import { getMainCategories } from '../../redux/actions/categoryAction';
import WilayaCommuneField from './WilayaCommuneField';
import { imageUpload2 } from '../../utils/imageUpload2';

const EditChannel = () => {
  const { channelId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const { channel, loading: channelLoading } = useSelector(state => state.channel);
  const { auth } = useSelector(state => state);
  const { categories, loading: loadingCategories } = useSelector(state => state.category);
  
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    description: '',
    wilaya: '',
    commune: '',
    phone: '',
    email: '',
    website: ''
  });
  
  // Estados para imágenes
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removedAvatar, setRemovedAvatar] = useState(false);
  const [removedCover, setRemovedCover] = useState(false);
  
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // ✅ Estado para saber si el canal está pendiente
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Cargar categorías si no están
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(getMainCategories(1, 100, false));
    }
  }, [dispatch, categories]);
// src/pages/channel/EditChannel.jsx - Modifica el useEffect

useEffect(() => {
  const loadChannelData = async () => {
      if (!channelId) return;
      
      try {
          // ✅ Usar isOwnerView = true para cargar canales pendientes
          console.log('📺 Canal cargado:', result?.channel);
          
          if (result?.channel) {
              setIsPending(result.channel.pendiente === true);
              setIsRejected(result.channel.status === 'rejected');
              setRejectionReason(result.channel.rejectionReason || '');
          }
      } catch (err) {
          console.error('Error cargando canal:', err);
          setError('Error al cargar los datos del canal');
      }
  };
  
  if (channelId && auth?.token) {
      loadChannelData();
  }
}, [channelId, dispatch, auth?.token]);
  // Cargar datos del canal
  useEffect(() => {
    const loadChannelData = async () => {
      if (!channelId) return;
      
      try {
        if (!channel || channel._id !== channelId) {
          const result = await dispatch(getChannelById(channelId, auth?.token, true)); // true = isOwnerView
          console.log('📺 Canal cargado:', result?.channel);
          
          // ✅ Verificar estado del canal
          if (result?.channel) {
            setIsPending(result.channel.pendiente === true);
            setIsRejected(result.channel.status === 'rejected');
            setRejectionReason(result.channel.rejectionReason || '');
          }
        }
      } catch (err) {
        console.error('Error cargando canal:', err);
        setError('Error al cargar los datos del canal');
      }
    };
    
    loadChannelData();
  }, [channelId, dispatch, auth?.token]);

  // Actualizar formulario cuando el canal está disponible
  useEffect(() => {
    if (channel && channel._id === channelId && initialLoad && !isPending) {
      console.log('📝 Datos del canal:', {
        name: channel.name,
        avatar: channel.avatar,
        cover: channel.cover
      });
      
      setFormData({
        name: channel.name || '',
        activity: channel.activity || '',
        description: channel.description || '',
        wilaya: channel.wilaya || '',
        commune: channel.commune || '',
        phone: channel.phone || '',
        email: channel.email || '',
        website: channel.website || ''
      });
      
      // Establecer previsualizaciones con las URLs existentes
      setAvatarPreview(channel.avatar || '');
      setCoverPreview(channel.cover || '');
      setInitialLoad(false);
    }
  }, [channel, channelId, initialLoad, isPending]);

  // Manejar cambio de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2MB");
      return;
    }

    setUploadingAvatar(true);
    setAvatarFile(file);
    setRemovedAvatar(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setUploadingAvatar(false);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Manejar cambio de cover
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image de couverture ne doit pas dépasser 5MB");
      return;
    }

    setUploadingCover(true);
    setCoverFile(file);
    setRemovedCover(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
      setUploadingCover(false);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarFile(null);
    setRemovedAvatar(true);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Eliminar cover
  const handleRemoveCover = () => {
    setCoverPreview('');
    setCoverFile(null);
    setRemovedCover(true);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ No permitir edición si está pendiente
    if (isPending) {
      setError("❌ Impossible de modifier : votre chaîne est en attente d'approbation");
      return;
    }
    
    if (!formData.name.trim()) {
      setError("Le nom de la chaîne est obligatoire");
      return;
    }
    
    if (!formData.activity) {
      setError("Veuillez sélectionner une activité/secteur");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let avatarArray = [];
      let coverArray = [];
      
      if (!removedAvatar) {
        if (avatarFile) {
          const uploaded = await imageUpload2([avatarFile]);
          avatarArray = uploaded;
        } else if (avatarPreview && avatarPreview.includes('cloudinary.com')) {
          avatarArray = [{ url: avatarPreview, public_id: `avatar_${channelId}` }];
        }
      }
      
      if (!removedCover) {
        if (coverFile) {
          const uploaded = await imageUpload2([coverFile]);
          coverArray = uploaded;
        } else if (coverPreview && coverPreview.includes('cloudinary.com')) {
          coverArray = [{ url: coverPreview, public_id: `cover_${channelId}` }];
        }
      }
      
      const updateData = {
        name: formData.name,
        activity: formData.activity,
        description: formData.description || '',
        wilaya: formData.wilaya || '',
        commune: formData.commune || '',
        phone: formData.phone || '',
        email: formData.email || '',
        website: formData.website || '',
        avatar: avatarArray,
        cover: coverArray
      };
      
      const result = await dispatch(updateChannel({
        channelId,
        channelData: updateData,
        avatar: avatarArray,
        cover: coverArray,
        auth
      }));
      
      if (result?.success) {
        setSuccess(true);
        setTimeout(() => {
          history.push(`/channel/${channelId}`);
        }, 2000);
      } else {
        setError(result?.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // ✅ PANTALLA PARA CANAL PENDIENTE
  if (isPending && !initialLoad) {
    return (
      <div className="bg-light" style={{ minHeight: '100vh' }}>
        <Container className="py-5">
          <div className="text-center" style={{ maxWidth: '550px', margin: '0 auto' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              backgroundColor: '#fef3c7', 
              borderRadius: '50%', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <HourglassSplit size={48} color="#f59e0b" />
            </div>
            
            <h3 style={{ color: '#92400e', marginBottom: '15px', fontWeight: 'bold' }}>
              ⏳ Chaîne en attente d'approbation
            </h3>
            
            <div style={{ 
              backgroundColor: '#fef3c7', 
              borderLeft: '4px solid #f59e0b', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'left',
              marginBottom: '25px'
            }}>
              <p style={{ color: '#78350f', marginBottom: '12px', fontSize: '15px' }}>
                <strong>❌ Vous ne pouvez pas modifier cette chaîne pour le moment.</strong>
              </p>
              <p style={{ color: '#78350f', marginBottom: '12px', fontSize: '14px' }}>
                Votre chaîne <strong>"{channel?.name || formData.name}"</strong> est actuellement en cours de vérification par notre équipe administrative.
              </p>
              <p style={{ color: '#78350f', marginBottom: '0', fontSize: '14px' }}>
                Une fois approuvée, vous pourrez modifier ses informations, ajouter des vidéos et la rendre visible au public.
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#e7f3ff', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '25px',
              fontSize: '13px',
              color: '#004085'
            }}>
              <strong>💡 Information :</strong> La vérification prend généralement 24 à 48 heures. Vous serez notifié par email dès que votre chaîne sera approuvée.
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outline-secondary" 
                onClick={() => history.push(`/profile/${auth.user?._id}`)}
                style={{ padding: '10px 24px' }}
              >
                Retour à mon profil
              </Button>
              <Button 
                variant="primary" 
                onClick={() => history.push('/')}
                style={{ padding: '10px 24px' }}
              >
                Accueil
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ✅ PANTALLA PARA CANAL RECHAZADO
  if (isRejected && !initialLoad) {
    return (
      <div className="bg-light" style={{ minHeight: '100vh' }}>
        <Container className="py-5">
          <div className="text-center" style={{ maxWidth: '550px', margin: '0 auto' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              backgroundColor: '#fee2e2', 
              borderRadius: '50%', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <span style={{ fontSize: '48px' }}>❌</span>
            </div>
            
            <h3 style={{ color: '#dc2626', marginBottom: '15px', fontWeight: 'bold' }}>
              Chaîne rejetée
            </h3>
            
            <div style={{ 
              backgroundColor: '#fee2e2', 
              borderLeft: '4px solid #dc2626', 
              padding: '20px', 
              borderRadius: '12px',
              textAlign: 'left',
              marginBottom: '25px'
            }}>
              <p style={{ color: '#7f1d1d', marginBottom: '12px', fontSize: '15px' }}>
                <strong>❌ Votre chaîne n'a pas été approuvée.</strong>
              </p>
              {rejectionReason && (
                <p style={{ color: '#7f1d1d', marginBottom: '12px', fontSize: '14px' }}>
                  <strong>Motif :</strong> {rejectionReason}
                </p>
              )}
              <p style={{ color: '#7f1d1d', marginBottom: '0', fontSize: '14px' }}>
                Veuillez corriger les problèmes mentionnés et soumettre à nouveau votre chaîne.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outline-secondary" 
                onClick={() => history.push(`/profile/${auth.user?._id}`)}
                style={{ padding: '10px 24px' }}
              >
                Retour à mon profil
              </Button>
              <Button 
                variant="primary" 
                onClick={() => history.push('/channel/new')}
                style={{ padding: '10px 24px' }}
              >
                Créer une nouvelle chaîne
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Mostrar loading mientras se carga el canal
  if ((channelLoading || initialLoad) && !channel) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Chargement du canal...</span>
      </div>
    );
  }

  // ✅ FORMULARIO NORMAL (solo para canales aprobados)
  return (
    <div className="bg-light" style={{ minHeight: '100vh' }}>
      <Container className="py-4">
        <Button 
          variant="link" 
          className="text-decoration-none mb-3 d-inline-flex align-items-center gap-1"
          onClick={() => history.goBack()}
        >
          <ArrowLeft size={16} /> Retour
        </Button>

        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <Tv size={28} className="text-primary" />
                  <h2 className="h4 fw-bold mb-0">Modifier la chaîne</h2>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
                    <strong>Erreur :</strong> {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert variant="success" className="mb-4" onClose={() => setSuccess(false)} dismissible>
                    <strong>✅ Chaîne mise à jour avec succès !</strong>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* SECCIÓN DE IMÁGENES */}
                  <div className="mb-4 pb-2 border-bottom">
                    <Row>
                      <Col md={6} className="mb-3 text-center">
                        <Form.Label className="fw-semibold">Avatar</Form.Label>
                        <div 
                          className="avatar-upload-box mx-auto"
                          style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            border: '2px dashed #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            background: '#f8f9fa'
                          }}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={avatarInputRef}
                            accept="image/jpeg, image/png, image/jpg, image/gif"
                            onChange={handleAvatarChange}
                            disabled={uploadingAvatar}
                            style={{ display: 'none' }}
                          />
                          
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <>
                              <Image size={32} className="text-muted mb-2" />
                              <span className="small text-muted">Cliquez pour uploader</span>
                            </>
                          )}
                        </div>
                        {avatarPreview && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="mt-2"
                            onClick={handleRemoveAvatar}
                          >
                            Supprimer
                          </Button>
                        )}
                      </Col>

                      <Col md={6}>
                        <Form.Label className="fw-semibold">Image de couverture</Form.Label>
                        <div 
                          className="cover-upload-box"
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
                            background: '#f8f9fa'
                          }}
                          onClick={() => coverInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={coverInputRef}
                            accept="image/jpeg, image/png, image/jpg, image/gif"
                            onChange={handleCoverChange}
                            disabled={uploadingCover}
                            style={{ display: 'none' }}
                          />
                          
                          {coverPreview ? (
                            <img 
                              src={coverPreview} 
                              alt="Cover"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <>
                              <Upload size={24} className="text-muted mb-2" />
                              <span className="small text-muted">Cliquez pour uploader</span>
                            </>
                          )}
                        </div>
                        {coverPreview && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="mt-2"
                            onClick={handleRemoveCover}
                          >
                            Supprimer
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>

                  {/* INFORMACIÓN BÁSICA */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Informations générales</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Nom de la chaîne *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Activité *</Form.Label>
                          <Form.Select
                            name="activity"
                            value={formData.activity}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Sélectionnez une activité</option>
                            {categories?.map(cat => (
                              <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* LOCALISATION */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Localisation</h5>
                    <WilayaCommuneField
                      wilaya={formData.wilaya}
                      commune={formData.commune}
                      onWilayaChange={(w) => setFormData(prev => ({ ...prev, wilaya: w }))}
                      onCommuneChange={(c) => setFormData(prev => ({ ...prev, commune: c }))}
                    />
                  </div>

                  {/* COORDONNÉES */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Coordonnées</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Téléphone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Site web</Form.Label>
                          <Form.Control
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button variant="secondary" onClick={() => history.push('/my-channels')}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? <Spinner size="sm" animation="border" /> : <Save className="me-2" /> }
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditChannel;
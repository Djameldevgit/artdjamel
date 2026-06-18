// src/pages/ProfileSettings.jsx - VERSIÓN CON AVATAR POR DEFECTO

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Spinner, 
  Alert,
  Card
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { 
  Person, 
  Telephone, 
  GeoAlt, 
  Globe,
  Save,
  CheckCircle,
  ExclamationTriangle,
  Calendar,
  Camera
} from 'react-bootstrap-icons';
import { updateProfileUser } from '../../redux/actions/profileAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';

// ✅ URL del avatar por defecto (misma que en Profile y Navbar)
const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dzd58nm3l/image/upload/v1780538635/defalut-avatar_tfvwxr.png';
 
const ProfileSettings = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { auth, theme = 'light' } = useSelector(state => state);
  const { alert } = useSelector(state => state);
  
  const [loading, setLoading] = useState(false);
  
  const [userData, setUserData] = useState({
    fullname: '',
    mobile: '',
    address: '',
    website: '',
    story: ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    if (auth.user) {
      setUserData({
        fullname: auth.user.fullname || '',
        mobile: auth.user.mobile || '',
        address: auth.user.address || '',
        website: auth.user.website || '',
        story: auth.user.story || ''
      });
      
      // ✅ Usar avatar del usuario o el por defecto
      if (auth.user.avatar) {
        setPreviewAvatar(auth.user.avatar);
      } else {
        setPreviewAvatar(DEFAULT_AVATAR_URL);
      }
    }
  }, [auth.user]);

  useEffect(() => {
    if (alert.success) {
      setAvatarFile(null);
      setTimeout(() => {
        dispatch({ type: GLOBALTYPES.ALERT, payload: {} });
      }, 3000);
    }
  }, [alert.success, dispatch]);

  const changeAvatar = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.match(/image.*/)) {
      return dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: {error: "Veuillez sélectionner une image valide"}
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: {error: "L'image ne peut pas dépasser 5MB"}
      });
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fullname' && value.length > 25) return;
    if (name === 'story' && value.length > 200) return;
    
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const cancelAvatarChange = () => {
    setAvatarFile(null);
    // ✅ Volver al avatar original o al por defecto
    setPreviewAvatar(auth.user?.avatar || DEFAULT_AVATAR_URL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.fullname && userData.fullname.length > 25) {
      return dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: {error: "Le nom complet est trop long (max 25 caractères)"}
      });
    }

    if (userData.story && userData.story.length > 200) {
      return dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: {error: "La description est trop longue (max 200 caractères)"}
      });
    }

    setLoading(true);
    
    try {
      const result = await dispatch(updateProfileUser({ 
        userData: userData,
        avatar: avatarFile,
        auth 
      }));
      
      if (result && result.success) {
        setAvatarFile(null);
        
        setTimeout(() => {
          history.push(`/profile/${auth.user._id}`);
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const userStats = {
    memberSince: auth.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A'
  };

  if (!auth.token || !auth.user) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Authentification requise</h4>
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
          <Button variant="primary" onClick={() => history.push('/login')}>
            Se connecter
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className={`profile-settings ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light'}`}>
      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="h3 fw-bold mb-1">Paramètres du profil</h2>
            <p className="text-muted mb-0">
              Gérez vos informations personnelles
            </p>
          </div>
          
          <Button 
            variant="outline-primary" 
            onClick={() => history.push(`/profile/${auth.user._id}`)}
            className="rounded-pill px-4"
          >
            <Person className="me-2" size={16} />
            Voir le profil
          </Button>
        </div>

        {alert.success && (
          <Alert variant="success" className="d-flex align-items-center mb-4" dismissible>
            <CheckCircle className="me-2" size={20} />
            {alert.success}
          </Alert>
        )}
        
        {alert.error && (
          <Alert variant="danger" className="d-flex align-items-center mb-4" dismissible>
            <ExclamationTriangle className="me-2" size={20} />
            {alert.error}
          </Alert>
        )}

        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <Calendar className="text-warning" size={20} />
                </div>
                <div>
                  <small className="text-muted d-block">Membre depuis</small>
                  <h6 className="mb-0 fw-bold">{userStats.memberSince}</h6>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h4 className="mb-4">Modifier le profil</h4>
            
            <Form onSubmit={handleSubmit}>
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div className="avatar-container">
                    {/* ✅ Misma lógica que en Profile: avatar del usuario o imagen por defecto */}
                    <img 
                      src={previewAvatar || DEFAULT_AVATAR_URL}
                      alt="avatar" 
                      className="avatar-image"
                      onError={(e) => {
                        console.error('❌ Error cargando avatar:', previewAvatar);
                        e.target.src = DEFAULT_AVATAR_URL;
                      }}
                    />
                    
                    <label htmlFor="avatar-upload" className="avatar-overlay">
                      <Camera size={24} />
                      <span>Changer</span>
                    </label>
                    
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={changeAvatar}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                
                {avatarFile && (
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={cancelAvatarChange}
                      className="text-danger"
                    >
                      Annuler
                    </Button>
                  </div>
                )}
                
                <p className="text-muted small mt-2">
                  JPG, PNG ou GIF. Maximum 5MB.
                </p>
              </div>

              {/* Champs du formulaire */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Nom complet</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      name="fullname"
                      value={userData.fullname}
                      onChange={handleInput}
                      placeholder="Votre nom complet"
                      maxLength="25"
                    />
                    <small className="character-count">
                      {userData.fullname?.length || 0}/25
                    </small>
                  </div>
                </Col>
                
                <Col md={6} className="mb-3">
                  <Form.Label>
                    <Telephone className="me-2" size={14} />
                    Téléphone
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    value={userData.mobile}
                    onChange={handleInput}
                    placeholder="+33 6 12 34 56 78"
                  />
                </Col>
                
                <Col md={6} className="mb-3">
                  <Form.Label>
                    <GeoAlt className="me-2" size={14} />
                    Adresse
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInput}
                    placeholder="Ville, Pays"
                  />
                </Col>
                
                <Col md={6} className="mb-3">
                  <Form.Label>
                    <Globe className="me-2" size={14} />
                    Site web
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="website"
                    value={userData.website}
                    onChange={handleInput}
                    placeholder="https://votresite.com"
                  />
                </Col>
                
                <Col xs={12} className="mb-4">
                  <Form.Label>Histoire / À propos</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      as="textarea"
                      name="story"
                      value={userData.story}
                      onChange={handleInput}
                      placeholder="Parlez-nous de vous..."
                      rows={4}
                      maxLength="200"
                    />
                    <small className="character-count bottom">
                      {userData.story?.length || 0}/200
                    </small>
                  </div>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary"
                  onClick={() => history.push(`/profile/${auth.user._id}`)}
                  className="rounded-pill px-4"
                >
                  Annuler
                </Button>
                
                <Button 
                  type="submit"
                  variant="primary"
                  disabled={loading || alert.loading}
                  className="rounded-pill px-4"
                  style={{ minWidth: '200px' }}
                >
                  {loading || alert.loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="me-2" size={16} />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <style jsx="true">{`
        .avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .avatar-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transform: translateY(100%);
          transition: transform 0.3s;
          cursor: pointer;
        }

        .avatar-container:hover .avatar-overlay {
          transform: translateY(0);
        }

        .avatar-container:hover .avatar-image {
          transform: scale(1.1);
        }

        .character-count {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          color: #dc3545;
          font-size: 0.75rem;
        }

        .character-count.bottom {
          top: auto;
          bottom: -20px;
          right: 0;
          transform: none;
        }

        .bg-opacity-10 {
          --bs-bg-opacity: 0.1;
        }
        
        .profile-settings {
          min-height: 100vh;
          padding-bottom: 2rem;
        }
        
        @media (max-width: 768px) {
          .avatar-container {
            width: 120px;
            height: 120px;
          }
          
          .character-count {
            position: static;
            display: block;
            text-align: right;
            margin-top: 4px;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
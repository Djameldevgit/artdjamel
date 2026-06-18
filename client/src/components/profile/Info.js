import React from 'react'
import { useSelector } from 'react-redux'
import { Card, Badge, Button } from 'react-bootstrap'
import { 
    PersonCircle,
    Calendar,
    GeoAlt,
    Envelope,
    Telephone,
    CheckCircle,
    Star,
    StarFill
} from 'react-bootstrap-icons'

const Info = ({ auth, profile, dispatch, id }) => {
    const { theme } = useSelector(state => state)
    
    // Verificar datos
    if (!profile.users || !Array.isArray(profile.users)) {
        return (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2">Chargement des informations...</p>
                </Card.Body>
            </Card>
        )
    }

    const userData = profile.users.find(user => user._id === id)
    
    if (!userData) {
        return (
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                    <PersonCircle size={48} className="text-muted mb-3" />
                    <h5>Utilisateur non trouvé</h5>
                </Card.Body>
            </Card>
        )
    }

    const isOwnProfile = auth.user?._id === id
    const isVerified = userData.verified || false
    const isPremium = userData.premium || false

    return (
        <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
                <div className="row align-items-center">
                    {/* Avatar */}
                    <div className="col-md-3 text-center mb-4 mb-md-0">
                        <div className="position-relative d-inline-block">
                            <img 
                                src={userData.avatar || `https://ui-avatars.com/api/?name=${userData.username}&background=random`}
                                alt={userData.username}
                                className="rounded-circle shadow"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    border: `3px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                                }}
                            />
                            
                            {/* Badges de verificación */}
                            {isVerified && (
                                <div className="position-absolute bottom-0 end-0">
                                    <Badge 
                                        bg="success" 
                                        className="rounded-circle p-2"
                                        title="Compte vérifié"
                                    >
                                        <CheckCircle size={16} />
                                    </Badge>
                                </div>
                            )}
                            
                            {isPremium && (
                                <div className="position-absolute top-0 end-0">
                                    <Badge 
                                        bg="warning" 
                                        className="rounded-circle p-2"
                                        title="Compte premium"
                                    >
                                        <StarFill size={16} />
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información */}
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h2 className="h3 mb-1">
                                    {userData.fullname || userData.username}
                                    {isVerified && (
                                        <CheckCircle 
                                            size={20} 
                                            className="ms-2 text-success" 
                                            title="Vérifié"
                                        />
                                    )}
                                </h2>
                                
                                <p className="text-muted mb-2">
                                    @{userData.username}
                                </p>
                                
                                <div className="d-flex flex-wrap gap-3 mb-3">
                                    <Badge bg="primary" className="px-3 py-2">
                                        <i className="fas fa-images me-1"></i>
                                        {userData.postCount || 0} publications
                                    </Badge>
                                    
                                    <Badge bg="secondary" className="px-3 py-2">
                                        <i className="fas fa-users me-1"></i>
                                        {userData.followers?.length || 0} followers
                                    </Badge>
                                    
                                    <Badge bg="info" className="px-3 py-2">
                                        <i className="fas fa-user-friends me-1"></i>
                                        {userData.following?.length || 0} abonnements
                                    </Badge>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            {!isOwnProfile && (
                                <div>
                                    <Button 
                                        variant={userData.followers?.includes(auth.user?._id) ? "outline-primary" : "primary"}
                                        size="sm"
                                        className="rounded-pill px-4"
                                    >
                                        {userData.followers?.includes(auth.user?._id) ? (
                                            <>
                                                <i className="fas fa-user-check me-2"></i>
                                                Suivi
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-user-plus me-2"></i>
                                                Suivre
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        {userData.bio && (
                            <div className="mb-4">
                                <p className="mb-0">{userData.bio}</p>
                            </div>
                        )}

                        {/* Información de contacto */}
                        <div className="row g-3">
                            {userData.email && (
                                <div className="col-sm-6 col-lg-4">
                                    <div className="d-flex align-items-center">
                                        <Envelope size={16} className="text-muted me-2" />
                                        <small>{userData.email}</small>
                                    </div>
                                </div>
                            )}
                            
                            {userData.mobile && (
                                <div className="col-sm-6 col-lg-4">
                                    <div className="d-flex align-items-center">
                                        <Telephone size={16} className="text-muted me-2" />
                                        <small>{userData.mobile}</small>
                                    </div>
                                </div>
                            )}
                            
                            {userData.address && (
                                <div className="col-sm-6 col-lg-4">
                                    <div className="d-flex align-items-center">
                                        <GeoAlt size={16} className="text-muted me-2" />
                                        <small>{userData.address}</small>
                                    </div>
                                </div>
                            )}
                            
                            {userData.createdAt && (
                                <div className="col-sm-6 col-lg-4">
                                    <div className="d-flex align-items-center">
                                        <Calendar size={16} className="text-muted me-2" />
                                        <small>
                                            Membre depuis {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}

export default Info
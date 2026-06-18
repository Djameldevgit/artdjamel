import React from 'react';
import Avatar from './Avatar';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';

const UserCard = ({children, user, border, handleClose, setShowFollowers, setShowFollowing }) => {
    
    const handleCloseAll = () => {
        if(handleClose) handleClose();
        if(setShowFollowers) setShowFollowers(false);
        if(setShowFollowing) setShowFollowing(false);
    };

    return (
        <div className={`d-flex p-2 align-items-center justify-content-between w-100 ${border}`}
        style={{
            transition: 'all 0.2s ease',
            borderRadius: '10px'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
            <div className="flex-grow-1">
                {/* ✅ RUTA CAMBIADA: de /profile/:id a /video/userVideo/:id */}
                <Link 
                    to={`/video/userVideo/${user._id}`} 
                    onClick={handleCloseAll}
                    className="d-flex align-items-center text-decoration-none"
                    style={{ gap: '12px' }}
                >
                    {/* Avatar con efectos mejorados */}
                    <div style={{
                        position: 'relative',
                        flexShrink: 0
                    }}>
                        <div style={{
                            borderRadius: '50%',
                            padding: '3px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                        >
                            <div style={{
                                borderRadius: '50%',
                                padding: '2px',
                                backgroundColor: 'white'
                            }}>
                                <Avatar src={user.avatar} size="big-avatar" />
                            </div>
                        </div>
                        
                        {/* Indicador de verificación (opcional) */}
                        {user.isVerified && (
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                backgroundColor: '#1DA1F2',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                                <i className="fas fa-check" style={{ 
                                    color: 'white', 
                                    fontSize: '10px' 
                                }}></i>
                            </div>
                        )}
                    </div>
                    
                    {/* Información del usuario */}
                    <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-1">
                            <span className="fw-semibold text-dark" style={{
                                fontSize: '15px',
                                lineHeight: '1.3',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '150px'
                            }}>
                                {user.username}
                            </span>
                            
                            {/* Badge de rol (opcional) */}
                            {user.role === 'admin' && (
                                <Badge 
                                    bg="primary" 
                                    style={{
                                        fontSize: '9px',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Admin
                                </Badge>
                            )}
                        </div>
                        
                        <small className="text-muted" style={{
                            fontSize: '13px',
                            lineHeight: '1.3',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px'
                        }}>
                            
                        </small>
                    </div>
                </Link>
            </div>
            
            {/* Acciones adicionales (children) */}
            {children && (
                <div className="ms-2" style={{ flexShrink: 0 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default UserCard;
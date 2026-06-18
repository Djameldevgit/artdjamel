import React from 'react';
 
const AuthModalAddLikesCommentsSave = ({ showModal, closeModal, redirectToLogin, redirectToRegister }) => {
    if (!showModal) return null;

    return (
        <div className="auth-modal-overlay" onClick={closeModal}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Botón de cierre (X) en la esquina superior derecha */}
                <button className="auth-modal-close" onClick={closeModal}>
                    &times;
                </button>
  
                {/* Título y descripción en francés */}
                <h2>Veuillez vous connecter ou vous inscrire</h2>
                <p>Pour effectuer cette action, vous avez besoin d'un compte. C'est rapide et facile !</p>
  
                {/* Botones de acción */}
                <div className="auth-modal-buttons">
                    <button className="auth-button login" onClick={redirectToLogin}>Se connecter</button>
                    <button className="auth-button register" onClick={redirectToRegister}>S'inscrire</button>
                </div>
            </div>
        </div>
    );
};

export default AuthModalAddLikesCommentsSave;
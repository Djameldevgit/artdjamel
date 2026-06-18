// CreateChannelModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const CreateChannelModal = ({ show, onClose }) => {
  const history = useHistory();

  const handleCreateChannel = () => {
    // Cerrar modal
    onClose();
    
    // Pequeño retraso para que el modal se cierre antes de navegar
    setTimeout(() => {
      history.push('/channel/new');
    }, 100);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Modal.Title>🎬 Créer votre chaîne</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center py-4">
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          ⚠️ Vous n'avez pas encore de chaîne.
        </p>
        <p className="text-muted">
          Pour publier des vidéos, vous devez d'abord créer une chaîne.
        </p>
      </Modal.Body>
      
      <Modal.Footer className="d-flex justify-content-center border-0 pb-4">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        
        <Button 
          variant="success" 
          onClick={handleCreateChannel}
          style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', border: 'none' }}
        >
          ✨ Créer ma chaîne
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateChannelModal;
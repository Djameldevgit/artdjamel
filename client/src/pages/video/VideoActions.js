// components/Video/VideoActions.jsx - VERSIÓN QUE REDIRIGE AL EDIT VIDEO WIZARD (Formato Android)
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Dropdown, Modal, Button, Form } from 'react-bootstrap';
import { ThreeDotsVertical, Pencil, Trash2, Flag } from 'react-bootstrap-icons';
import { deleteVideo } from '../../redux/actions/videoAction';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';

const VideoActions = ({ video, onVideoUpdate, onVideoDelete }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { auth, socket } = useSelector(state => state);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ EDITAR - Redirige al EditVideoWizard (NO MODAL)
  const handleEdit = () => {
    // Guardar información para volver al feed después de editar
    sessionStorage.setItem('returnToFeed', 'true');
    sessionStorage.setItem('feedScrollPosition', window.scrollY.toString());
    // Redirigir al wizard de edición (mismo formato que creación)
    history.push(`/edit-video/${video._id}`);
  };
  
  // ✅ Eliminar video CON SOCKET
  const handleDelete = async () => {
    setLoading(true);
    const result = await dispatch(deleteVideo(
      video._id, 
      auth.token,
      auth,
      socket,
      video
    ));
    
    if (result?.success) {
      setShowDeleteModal(false);
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { success: 'Vidéo supprimée avec succès' }
      });
      if (onVideoDelete) onVideoDelete(video._id);
      // Redirigir al feed después de eliminar
      history.push('/videos/1');
    }
    setLoading(false);
  };
  
  const handleReport = () => {
    dispatch({
      type: GLOBALTYPES.ALERT,
      payload: { info: 'Video signalé aux administrateurs' }
    });
  };
  
  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle 
          variant="link" 
          className="tiktok-action-btn p-0"
          style={{ 
            textDecoration: 'none', 
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            color: 'white'
          }}
        >
          <ThreeDotsVertical size={24} />
        </Dropdown.Toggle>
        
        <Dropdown.Menu 
          align="end"
          style={{ 
            background: '#1a1a1a', 
            border: '1px solid #333',
            borderRadius: '12px',
            minWidth: '200px'
          }}
        >
          <Dropdown.Item onClick={handleEdit} style={{ color: '#fff' }}>
            <Pencil size={16} className="me-2" /> Modifier
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setShowDeleteModal(true)} style={{ color: '#f44336' }}>
            <Trash2 size={16} className="me-2" /> Supprimer
          </Dropdown.Item>
          <Dropdown.Divider style={{ borderColor: '#333' }} />
          <Dropdown.Item onClick={handleReport} style={{ color: '#ff9800' }}>
            <Flag size={16} className="me-2" /> Signaler
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      
      {/* Modal de eliminación (único modal que queda) */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}>
          <Modal.Title>Supprimer la vidéo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a1a', color: '#fff' }}>
          <p>Êtes-vous sûr de vouloir supprimer cette vidéo ?</p>
          <p className="text-muted small">Cette action est irréversible.</p>
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1a1a', borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VideoActions;
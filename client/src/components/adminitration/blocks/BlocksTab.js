// 📂 components/Admin/BlocksTab.jsx - VERSIÓN CORREGIDA CON LÓGICA INDEPENDIENTE

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Button, Modal, Form, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import {
  activateUser,
  deactivateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getUsers
} from '../../../redux/actions/userAction';
import { GLOBALTYPES } from '../../../redux/actions/globalTypes';

const BlocksTab = () => {
  const dispatch = useDispatch();
  const { auth } = useSelector(state => state);
  const { users, loading } = useSelector(state => state.homeUsers);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // Tab activa
  
  const [blockFormData, setBlockFormData] = useState({
    reason: '',
    description: '',
    blockExpiryDate: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  // Motivos de bloqueo
  const blockReasons = [
    { value: 'Comportement abusif', label: '⚠️ Comportement abusif' },
    { value: 'Spam', label: '📧 Spam' },
    { value: 'Violation des conditions', label: '📜 Violation des conditions' },
    { value: 'Langage offensant', label: '🤬 Langage offensant' },
    { value: 'Fraude', label: '💳 Fraude' },
    { value: 'Usurpation d\'identité', label: '🎭 Usurpation d\'identité' },
    { value: 'Contenu inapproprié', label: '🔞 Contenu inapproprié' },
    { value: 'Autre', label: '📌 Autre' }
  ];

  useEffect(() => {
    if (auth?.token) {
      dispatch(getUsers(auth.token));
    }
  }, [dispatch, auth?.token]);

  // ============================================
  // FILTROS POR TAB
  // ============================================
  
  // Usuarios ACTIVOS (isActive = true, isBlocked = false)
  const activeUsers = users?.filter(user => 
    user.isActive === true && user.isBlocked === false
  ) || [];
  
  // Usuarios DESACTIVADOS (isActive = false, isBlocked = false)
  const inactiveUsers = users?.filter(user => 
    user.isActive === false && user.isBlocked === false
  ) || [];
  
  // Usuarios BLOQUEADOS (isBlocked = true)
  const blockedUsers = users?.filter(user => 
    user.isBlocked === true
  ) || [];
  
  // Todos los usuarios con búsqueda
  const allUsers = users?.filter(user => {
    return user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Usuarios filtrados según la tab activa y búsqueda
  const getFilteredUsers = () => {
    let filtered = [];
    
    switch (activeTab) {
      case 'active':
        filtered = activeUsers;
        break;
      case 'inactive':
        filtered = inactiveUsers;
        break;
      case 'blocked':
        filtered = blockedUsers;
        break;
      default:
        filtered = allUsers;
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // ============================================
  // ACCIONES INDEPENDIENTES
  // ============================================
  
  // ACTIVAR / DESACTIVAR (solo cambia isActive)
  const handleActivate = (userId) => {
    if (window.confirm('✅ Activer cet utilisateur ? Il pourra se connecter normalement.')) {
      dispatch(activateUser(userId, auth.token));
    }
  };

  const handleDeactivate = (userId) => {
    if (window.confirm('⚠️ Désactiver cet utilisateur ? Il ne pourra plus se connecter.')) {
      dispatch(deactivateUser(userId, auth.token));
    }
  };

  // BLOQUEAR / DESBLOQUEAR (cambia isBlocked y también afecta isActive)
  const handleOpenBlockModal = (user) => {
    setSelectedUser(user);
    setBlockFormData({
      reason: '',
      description: '',
      blockExpiryDate: ''
    });
    setShowBlockModal(true);
  };

  const handleConfirmBlock = () => {
    if (!blockFormData.reason) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Veuillez sélectionner un motif de blocage' }
      });
      return;
    }

    if (!blockFormData.description) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Veuillez fournir une description du blocage' }
      });
      return;
    }

    if (!blockFormData.blockExpiryDate) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'Veuillez sélectionner une date de déblocage' }
      });
      return;
    }

    const selectedDate = new Date(blockFormData.blockExpiryDate);
    if (selectedDate <= new Date()) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: 'La date de déblocage doit être dans le futur' }
      });
      return;
    }

    dispatch(blockUser(
      selectedUser._id,
      {
        reason: blockFormData.reason,
        description: blockFormData.description,
        blockExpiryDate: blockFormData.blockExpiryDate
      },
      auth.token
    ));
    
    setShowBlockModal(false);
    setSelectedUser(null);
  };

  const handleUnblock = (userId) => {
    if (window.confirm('🔓 Débloquer cet utilisateur ? Il retrouvera son accès normal.')) {
      dispatch(unblockUser(userId, auth.token));
    }
  };

  // ELIMINAR (acción destructiva)
  const handleDelete = (userId, username) => {
    if (window.confirm(`🗑️ Supprimer définitivement "${username}" ? Cette action est IRRÉVERSIBLE.`)) {
      dispatch(deleteUser({ id: userId, auth }));
    }
  };

  // ============================================
  // RENDER DE BADGES E INFO
  // ============================================
  
  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return <span className="badge bg-danger">🔒 Bloqué</span>;
    }
    if (!user.isActive) {
      return <span className="badge bg-warning text-dark">⏸️ Désactivé</span>;
    }
    return <span className="badge bg-success">✅ Actif</span>;
  };

  const getBlockInfo = (user) => {
    if (!user.isBlocked || !user.blockDetails) return <span className="text-muted">—</span>;
    
    const expiryDate = user.blockDetails.blockExpiryDate;
    const isExpired = expiryDate && new Date(expiryDate) < new Date();
    
    return (
      <div className="small">
        <div><strong>Motif:</strong> {user.blockDetails.reason}</div>
        {user.blockDetails.description && (
          <div><strong>Détails:</strong> {user.blockDetails.description}</div>
        )}
        {expiryDate && (
          <div>
            <strong>Expire le:</strong> {new Date(expiryDate).toLocaleDateString('fr-FR')}
            {isExpired && <span className="text-danger"> (Expiré)</span>}
          </div>
        )}
      </div>
    );
  };

  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  // ============================================
  // RENDER DE LA TABLA CON DROPDOWN SEGÚN CONTEXTO
  // ============================================
  
  const renderUserRow = (user) => {
    // Determinar qué acciones mostrar según el estado del usuario
    const isActive = user.isActive === true && user.isBlocked === false;
    const isInactive = user.isActive === false && user.isBlocked === false;
    const isBlocked = user.isBlocked === true;

    return (
      <tr key={user._id}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="avatar"
            />
            <strong>{user.username}</strong>
          </div>
        </td>
        <td>{user.email}</td>
        <td>{getStatusBadge(user)}</td>
        <td>{getBlockInfo(user)}</td>
        <td>
          <Dropdown>
            <Dropdown.Toggle variant="primary" size="sm">
              ⚙️ Actions
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {/* Opciones para usuarios ACTIVOS */}
              {isActive && (
                <>
                  <Dropdown.Item onClick={() => handleDeactivate(user._id)}>
                    ⏸️ Désactiver le compte
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleOpenBlockModal(user)}>
                    🔒 Bloquer l'utilisateur
                  </Dropdown.Item>
                </>
              )}

              {/* Opciones para usuarios DESACTIVADOS */}
              {isInactive && (
                <>
                  <Dropdown.Item onClick={() => handleActivate(user._id)}>
                    ✅ Activer le compte
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleOpenBlockModal(user)}>
                    🔒 Bloquer l'utilisateur
                  </Dropdown.Item>
                </>
              )}

              {/* Opciones para usuarios BLOQUEADOS */}
              {isBlocked && (
                <>
                  <Dropdown.Item onClick={() => handleUnblock(user._id)}>
                    🔓 Débloquer l'utilisateur
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleActivate(user._id)}>
                    ✅ Activer le compte (après déblocage)
                  </Dropdown.Item>
                </>
              )}

              <Dropdown.Divider />

              {/* Eliminar - siempre visible */}
              <Dropdown.Item 
                onClick={() => handleDelete(user._id, user.username)}
                className="text-danger"
              >
                🗑️ Supprimer définitivement
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    );
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="blocks-tab p-3">
      <style jsx="true">{`
        .blocks-tab {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .search-box input {
          padding: 8px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 250px;
          font-size: 14px;
        }
        .table-container {
          overflow-x: auto;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        tr:hover {
          background: #f8f9fa;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }
        .bg-danger { background: #dc3545; color: white; }
        .bg-warning { background: #ffc107; color: #333; }
        .bg-success { background: #28a745; color: white; }
        .text-danger { color: #dc3545; }
        .text-muted { color: #6c757d; }
        .small { font-size: 12px; }
        .text-center { text-align: center; }
        .py-5 { padding: 48px 0; }
        .tab-count {
          margin-left: 8px;
          padding: 2px 8px;
          border-radius: 20px;
          background: #e9ecef;
          font-size: 12px;
        }
      `}</style>

      {/* Búsqueda */}
      <div className="table-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs con React-Bootstrap */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="all" title={
          <span>📋 Tous <span className="tab-count">{allUsers.length}</span></span>
        } />
        <Tab eventKey="active" title={
          <span>✅ Actifs <span className="tab-count">{activeUsers.length}</span></span>
        } />
        <Tab eventKey="inactive" title={
          <span>⏸️ Désactivés <span className="tab-count">{inactiveUsers.length}</span></span>
        } />
        <Tab eventKey="blocked" title={
          <span>🔒 Bloqués <span className="tab-count">{blockedUsers.length}</span></span>
        } />
      </Tabs>

      {/* Tabla de usuarios */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Info Blocage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  Aucun utilisateur ne correspond aux critères
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => renderUserRow(user))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Bloqueo */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            🔒 Bloquer l'utilisateur
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Alert variant="info">
            <strong>Utilisateur:</strong> {selectedUser?.username} ({selectedUser?.email})
            <br />
            <small className="text-muted">Le blocage désactivera également le compte automatiquement.</small>
          </Alert>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Motif du blocage *</Form.Label>
              <Form.Select
                value={blockFormData.reason}
                onChange={(e) => setBlockFormData({...blockFormData, reason: e.target.value})}
              >
                <option value="">-- Sélectionnez un motif --</option>
                {blockReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description détaillée *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Décrivez les raisons spécifiques de ce blocage..."
                value={blockFormData.description}
                onChange={(e) => setBlockFormData({...blockFormData, description: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date de déblocage *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={blockFormData.blockExpiryDate}
                onChange={(e) => setBlockFormData({...blockFormData, blockExpiryDate: e.target.value})}
                min={getMinDateTime()}
              />
              <Form.Text className="text-muted">
                L'utilisateur restera bloqué jusqu'à cette date et heure.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmBlock}>
            Confirmer le blocage
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BlocksTab;
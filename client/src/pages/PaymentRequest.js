// client/src/components/admin/PaymentRequest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaEye, 
  FaUserCheck, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCreditCard, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaEnvelope,
  FaPhoneAlt,
  FaIdCard,
  FaClock,
  FaBan,
  FaCheckCircle,
  FaExclamationTriangle,
  FaWhatsapp,
  FaUserCircle
} from 'react-icons/fa';
import './PaymentRequest.css';

const PaymentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [verifyingId, setVerifyingId] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    smsDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
    // Refresh cada 30 segundos
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [filter, selectedPlan]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      let url = `/api/admin/payment-requests?status=${filter}`;
      if (selectedPlan !== 'all') {
        url += `&plan=${selectedPlan}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data?.requests || response.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (requestId) => {
    if (!window.confirm('¿Confirmar que has recibido el SMS de pago?')) return;
    
    setVerifyingId(requestId);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/payment-requests/${requestId}/verify`, 
        verificationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      await fetchRequests();
      setShowVerificationModal(false);
      setVerificationData({ smsDate: '', notes: '' });
      alert('¡Pago verificado correctamente!');
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Error al verificar el pago');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleActivatePlan = async (requestId, userId, planName, planId, duration) => {
    if (!window.confirm(`¿Activar el plan ${planName} para este usuario?`)) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('/api/admin/activate-plan', {
        requestId,
        userId,
        planId,
        duration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchRequests();
      setSelectedRequest(null);
      alert('¡Plan activado correctamente!');
    } catch (err) {
      console.error('Error activating plan:', err);
      alert('Error al activar el plan');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    if (!window.confirm('¿Rechazar esta solicitud?')) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/payment-requests/${requestId}/reject`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchRequests();
      alert('Solicitud rechazada');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Error al rechazar la solicitud');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: '⏳ Pendiente', icon: <FaClock /> },
      processing: { class: 'badge-info', text: '🔄 Procesando', icon: <FaSpinner /> },
      verified: { class: 'badge-primary', text: '✅ Verificado', icon: <FaCheckCircle /> },
      completed: { class: 'badge-success', text: '✔️ Completado', icon: <FaCheck /> },
      rejected: { class: 'badge-danger', text: '❌ Rechazado', icon: <FaTimes /> }
    };
    return badges[status] || badges.pending;
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.userInfo?.fullName?.toLowerCase().includes(searchLower) ||
      request.userInfo?.email?.toLowerCase().includes(searchLower) ||
      request.userInfo?.phoneNumber?.includes(searchTerm) ||
      request.transactionRef?.toLowerCase().includes(searchLower) ||
      request.planName?.toLowerCase().includes(searchLower)
    );
  });

  const openVerificationModal = (request) => {
    setSelectedRequest(request);
    setVerificationData({
      smsDate: new Date().toISOString().slice(0, 16),
      notes: ''
    });
    setShowVerificationModal(true);
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <FaSpinner className="spinner" />
        <p>Cargando solicitudes de pago...</p>
      </div>
    );
  }

  return (
    <div className="payment-request-container">
      <div className="payment-header">
        <h1>
          <FaMoneyBillWave className="header-icon" />
          Solicitudes de Pago
        </h1>
        <div className="header-stats">
          <div className="stat-card pending-stat">
            <span className="stat-value">{requests.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card verified-stat">
            <span className="stat-value">{requests.filter(r => r.status === 'verified').length}</span>
            <span className="stat-label">Verificados</span>
          </div>
          <div className="stat-card completed-stat">
            <span className="stat-value">{requests.filter(r => r.status === 'completed').length}</span>
            <span className="stat-label">Completados</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <FaClock /> Pendientes
          </button>
          <button 
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            <FaCheckCircle /> Verificados
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <FaCheck /> Completados
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <FaTimes /> Rechazados
          </button>
        </div>

        <div className="plan-filter">
          <FaFilter className="filter-icon" />
          <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
            <option value="all">Todos los planes</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <div className="requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="no-results">
            <FaSearch className="no-results-icon" />
            <p>No hay solicitudes que coincidan con los criterios de búsqueda</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request._id} className={`request-card status-${request.status}`}>
              <div className="request-header">
                <div className="plan-info">
                  <div className={`plan-badge plan-${request.planId}`}>
                    {request.planName}
                  </div>
                  <span className="request-date">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`status-badge ${getStatusBadge(request.status).class}`}>
                  {getStatusBadge(request.status).icon}
                  {getStatusBadge(request.status).text}
                </span>
              </div>
              
              <div className="user-info-section">
                <div className="user-avatar">
                  <FaUserCircle />
                </div>
                <div className="user-details">
                  <h4>{request.userInfo?.fullName}</h4>
                  <div className="user-contact">
                    <span><FaEnvelope /> {request.userInfo?.email}</span>
                    <span><FaPhoneAlt /> {request.userInfo?.phoneNumber}</span>
                  </div>
                </div>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <FaMoneyBillWave className="detail-icon" />
                  <span className="detail-label">Monto:</span>
                  <span className="detail-value amount">{request.totalPrice} DA</span>
                </div>
                <div className="detail-row">
                  <FaCreditCard className="detail-icon" />
                  <span className="detail-label">Método:</span>
                  <span className="detail-value">{request.paymentMethod === 'ccp' ? 'CCP' : 'Transferencia'}</span>
                </div>
                <div className="detail-row">
                  <FaCalendarAlt className="detail-icon" />
                  <span className="detail-label">Fecha pago:</span>
                  <span className="detail-value">{new Date(request.paymentDate).toLocaleDateString()}</span>
                </div>
                {request.duration && (
                  <div className="detail-row">
                    <FaClock className="detail-icon" />
                    <span className="detail-label">Duración:</span>
                    <span className="detail-value">{request.duration} meses</span>
                  </div>
                )}
                {request.transactionRef && (
                  <div className="detail-row highlight">
                    <FaIdCard className="detail-icon" />
                    <span className="detail-label">Referencia:</span>
                    <span className="detail-value ref-value">{request.transactionRef}</span>
                  </div>
                )}
              </div>
              
              {request.userNotes && (
                <div className="request-notes">
                  <strong>📝 Notas del usuario:</strong>
                  <p>{request.userNotes}</p>
                </div>
              )}
              
              {request.verification?.smsReceived && (
                <div className="verification-info">
                  <FaCheckCircle className="verified-icon" />
                  <span>Verificado el {new Date(request.verification.verificationDate).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="request-actions">
                <button 
                  className="btn-view" 
                  onClick={() => setSelectedRequest(request)}
                >
                  <FaEye /> Detalles
                </button>
                
                {request.status === 'pending' && (
                  <>
                    <button 
                      className="btn-verify" 
                      onClick={() => openVerificationModal(request)}
                      disabled={verifyingId === request._id}
                    >
                      {verifyingId === request._id ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                      Verificar SMS
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={updating}
                    >
                      <FaBan /> Rechazar
                    </button>
                  </>
                )}
                
                {request.status === 'verified' && (
                  <button 
                    className="btn-activate" 
                    onClick={() => handleActivatePlan(
                      request._id, 
                      request.userId, 
                      request.planName,
                      request.planId,
                      request.duration
                    )}
                    disabled={updating}
                  >
                    {updating ? <FaSpinner className="spinner" /> : <FaCheck />}
                    Activar Plan
                  </button>
                )}
                
                {request.status === 'completed' && (
                  <button className="btn-completed" disabled>
                    <FaCheck /> Plan Activado
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de verificación SMS */}
      {showVerificationModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal-content verification-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verificar Pago - SMS</h2>
              <button className="modal-close" onClick={() => setShowVerificationModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="verification-instructions">
                <FaWhatsapp className="instruction-icon" />
                <p>
                  <strong>¿Has recibido el SMS de pago del banco CCP?</strong><br />
                  Confirma los siguientes datos antes de verificar:
                </p>
                <ul>
                  <li>El usuario ha realizado el pago correctamente</li>
                  <li>El monto coincide: <strong>{selectedRequest.totalPrice} DA</strong></li>
                  <li>La referencia coincide (si fue proporcionada)</li>
                </ul>
              </div>
              
              <div className="form-group">
                <label>Fecha y hora del SMS:</label>
                <input
                  type="datetime-local"
                  value={verificationData.smsDate}
                  onChange={(e) => setVerificationData({...verificationData, smsDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Notas (opcional):</label>
                <textarea
                  rows="3"
                  placeholder="Información adicional sobre la verificación..."
                  value={verificationData.notes}
                  onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowVerificationModal(false)}>
                Cancelar
              </button>
              <button 
                className="btn-confirm-verify" 
                onClick={() => handleVerifyPayment(selectedRequest._id)}
                disabled={verifyingId === selectedRequest._id}
              >
                {verifyingId === selectedRequest._id ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                Confirmar Verificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles completos */}
      {selectedRequest && !showVerificationModal && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles Completos de la Solicitud</h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            <div className="modal-body">
              <pre>{JSON.stringify(selectedRequest, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setSelectedRequest(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRequest;
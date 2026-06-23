import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Pagination, Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { FaEye, FaEdit, FaSearch, FaDownload, FaFilter } from 'react-icons/fa';
import moment from 'moment';
import { getAllOrders, updateOrderStatus, getOrderDetail } from '../../redux/actions/orderAction';
import './Orders.css';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, total, page, pages, loading, stats } = useSelector(state => state.order);
  const { auth } = useSelector(state => state);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (auth.token && auth.user?.role === 'admin') {
      dispatch(getAllOrders(currentPage, 20, statusFilter, startDate, endDate));
    }
  }, [dispatch, auth.token, currentPage, statusFilter, startDate, endDate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = async (orderId) => {
    const order = await dispatch(getOrderDetail(orderId));
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleEditStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder && newStatus) {
      await dispatch(updateOrderStatus(selectedOrder.orderId, newStatus));
      setShowStatusModal(false);
      // Recargar lista
      dispatch(getAllOrders(currentPage, 20, statusFilter, startDate, endDate));
    }
  };

  const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      shipped: 'info',
      delivered: 'primary',
      cancelled: 'danger',
      refunded: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>📊 Toutes les commandes</h4>
        <div className="stats-summary">
          <span className="badge bg-primary me-2">Total: {stats.totalOrders} commandes</span>
          <span className="badge bg-success">Revenu: {stats.totalAmount?.toLocaleString()} DA</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar mb-3 p-3 bg-light rounded">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label><FaFilter /> Statut</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tous</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Date début</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Date fin</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Form.Group>
          </div>
          <div className="col-md-3">
            <Button variant="outline-secondary" onClick={() => {
              setStatusFilter('');
              setStartDate('');
              setEndDate('');
            }}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      <Table responsive striped hover className="orders-table">
        <thead>
          <tr>
            <th># Commande</th>
            <th>Client</th>
            <th>Date</th>
            <th>Articles</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.orderId}>
              <td className="fw-bold">#{order.orderId.slice(-8)}</td>
              <td>{order.userEmail || order.userId?.username || 'N/A'}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>{order.items.length}</td>
              <td><strong>{order.totalAmount.toLocaleString()} DA</strong></td>
              <td>{getStatusBadge(order.status)}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => handleViewDetail(order.orderId)}
                >
                  <FaEye />
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => handleEditStatus(order)}
                >
                  <FaEdit />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
          <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
          {[...Array(pages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === page}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === pages} />
          <Pagination.Last onClick={() => handlePageChange(pages)} disabled={page === pages} />
        </Pagination>
      )}

      {/* Modal detalle orden (igual que UserOrders) */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails commande #{selectedOrder?.orderId?.slice(-8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="order-meta">
                <p><strong>Client:</strong> {selectedOrder.userEmail || selectedOrder.userId?.username}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Statut:</strong> {getStatusBadge(selectedOrder.status)}</p>
                <p><strong>Total:</strong> {selectedOrder.totalAmount.toLocaleString()} DA</p>
              </div>
              <Table responsive size="sm">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unit.</th>
                    <th>Qté</th>
                    <th>Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.thumbnail && (
                            <img src={item.thumbnail} alt={item.title} style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10, borderRadius: 4 }} />
                          )}
                          <span>{item.title}</span>
                        </div>
                      </td>
                      <td>{item.price.toLocaleString()} DA</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toLocaleString()} DA</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total</strong></td>
                    <td><strong>{selectedOrder.totalAmount.toLocaleString()} DA</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cambiar estado */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Changer le statut</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nouveau statut</Form.Label>
            <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleUpdateStatus}>Mettre à jour</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrders;
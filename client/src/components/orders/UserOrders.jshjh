import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Pagination, Button, Modal } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserOrders, getOrderDetail } from '../../redux/actions/orderAction';
import './Orders.css';

moment.locale('fr');

const UserOrders = () => {
  const dispatch = useDispatch();
  const { orders, total, page, pages, loading } = useSelector(state => state.order);
  const { auth } = useSelector(state => state);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (auth.token) {
      dispatch(getUserOrders(currentPage, 10));
    }
  }, [dispatch, auth.token, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = async (orderId) => {
    const order = await dispatch(getOrderDetail(orderId));
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
  };

  // ✅ ESTADOS TRADUCIDOS AL FRANCÉS
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'En attente', variant: 'warning' },
      paid: { label: 'Payée', variant: 'success' },
      shipped: { label: 'Expédiée', variant: 'info' },
      delivered: { label: 'Livrée', variant: 'primary' },
      cancelled: { label: 'Annulée', variant: 'danger' },
      refunded: { label: 'Remboursée', variant: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Chargement de vos commandes...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-5">
        <h5>Vous n'avez pas encore de commandes</h5>
        <p>Vos achats apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="user-orders-container">
      <h4 className="mb-3">📦 Mes commandes</h4>
      
      <Table responsive striped hover className="orders-table">
        <thead>
          <tr>
            <th># Commande</th>
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
              <td>{formatDate(order.createdAt)}</td>
              <td>{order.items.length} article{order.items.length > 1 ? 's' : ''}</td>
              <td><strong>{order.totalAmount.toLocaleString()} DA</strong></td>
              <td>{getStatusBadge(order.status)}</td> {/* ✅ Mostrará "En attente", "Payée", etc. */}
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleViewDetail(order.orderId)}
                >
                  <FaEye /> Détails
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

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" className="order-detail-modal">
        <Modal.Header closeButton>
          <Modal.Title>Commande #{selectedOrder?.orderId?.slice(-8)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <div className="order-meta">
                <p><strong>Date :</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Statut :</strong> {getStatusBadge(selectedOrder.status)}</p>
                <p><strong>Total :</strong> {selectedOrder.totalAmount.toLocaleString()} DA</p>
              </div>
              <Table responsive size="sm" className="order-items-table">
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
                            <img 
                              src={item.thumbnail} 
                              alt={item.title} 
                              style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10, borderRadius: 4 }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
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
    </div>
  );
};

export default UserOrders;
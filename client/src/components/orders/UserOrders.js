import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FaEye, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserOrders, getOrderDetail, deleteOrder } from '../../redux/actions/orderAction';
import OrderModal from './OrderModal';
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

  const handlePageChange = (page) => setCurrentPage(page);
  
  const handleViewDetail = async (orderId) => {
    const order = await dispatch(getOrderDetail(orderId));
    setSelectedOrder(order);
    setShowDetail(true);
  };

  // ✅ Eliminar orden (solo para pending o cancelled)
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      await dispatch(deleteOrder(orderId));
      dispatch(getUserOrders(currentPage, 10));
    }
  };

  const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');

  const getStatusBadge = (status) => {
    const map = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return <span className={`status-badge status-badge-${status}`}>{map[status] || status}</span>;
  };

  // ✅ Determina si se puede eliminar (solo pending o cancelled)
  const canDeleteOrder = (status) => status === 'pending' || status === 'cancelled';

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
      <div className="text-center py-5 empty-orders">
        <h5>Vous n'avez pas encore de commandes</h5>
        <p>Vos achats apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="user-orders-container">
      <h4 className="mb-3">📦 Mes commandes</h4>
      <div className="d-flex justify-content-between align-items-center mb-3 ml-2">
      
      <Link to="/aide-commandes" className="btn btn-outline-info btn-sm">
        ❓ Aide
      </Link>
    </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover orders-table">
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
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  {/* Botón de detalles siempre visible */}
                  <button
                    className="btn btn-outline-primary btn-sm me-1"
                    onClick={() => handleViewDetail(order.orderId)}
                    title="Voir les détails"
                  >
                    <FaEye />
                  </button>

                  {/* ✅ Botón de eliminar solo si la orden está en pending o cancelled */}
                  {canDeleteOrder(order.status) && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteOrder(order.orderId)}
                      title="Supprimer la commande"
                    >
                      <FaTrash />
                    </button>
                  )}

                  {/* Opcional: mensaje informativo para paid */}
                  {order.status === 'paid' && (
                    <span className="text-muted small ms-2" title="Cette commande est payée. Contactez le support pour toute demande.">
                      🔒 Payée
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación personalizada */}
      {pages > 1 && (
        <div className="orders-pagination-custom">
          <button onClick={() => handlePageChange(1)} disabled={page === 1} className="page-btn">«</button>
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="page-btn">‹</button>
          {[...Array(pages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`page-btn ${i + 1 === page ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(page + 1)} disabled={page === pages} className="page-btn">›</button>
          <button onClick={() => handlePageChange(pages)} disabled={page === pages} className="page-btn">»</button>
        </div>
      )}

      <OrderModal show={showDetail} onHide={() => setShowDetail(false)} order={selectedOrder} />
    </div>
  );
};

export default UserOrders;
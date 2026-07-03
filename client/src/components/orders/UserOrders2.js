// components/UserOrders.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Pagination, Button } from 'react-bootstrap'; // Solo mantenemos lo que usamos
import { FaEye } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/fr';
import { getUserOrders, getOrderDetail } from '../../redux/actions/orderAction';
import OrderModal from './OrderModal'; // Importamos el modal personalizado
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

  const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');

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
              <td>{getStatusBadge(order.status)}</td>
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

      {/* Modal personalizado */}
      <OrderModal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default UserOrders;
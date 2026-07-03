import React, { useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/fr';
import './OrderModal.css';

moment.locale('fr');

const OrderModal = ({ show, onHide, order }) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show || !order) return null;

  const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');

  const getStatusLabel = (status) => {
    const map = {
      pending: 'En attente',
      paid: 'Payée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return map[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge-${status}`;
  };

  return (
    <div className="order-modal-overlay" onClick={onHide}>
      <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <h5 className="order-modal-title">
            Détails commande #{order.orderId?.slice(-8)}
          </h5>
          <button className="order-modal-close" onClick={onHide}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="order-modal-body">
          {/* Metadatos */}
          <div className="order-meta-grid">
            <div><strong>Client :</strong> {order.userEmail || order.userId?.username || 'N/A'}</div>
            <div><strong>Date :</strong> {formatDate(order.createdAt)}</div>
            <div>
              <strong>Statut :</strong>
              <span className={`status-badge ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div><strong>Total :</strong> {order.totalAmount?.toLocaleString()} DA</div>
          </div>

          {/* Tabla de items */}
          <div className="order-items-wrapper">
            <table className="order-items-table-custom">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix unit.</th>
                  <th>Qté</th>
                  <th>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-info">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="item-thumbnail"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td>{item.price?.toLocaleString()} DA</td>
                    <td>{item.quantity}</td>
                    <td>{(item.price * item.quantity)?.toLocaleString()} DA</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total</strong></td>
                  <td><strong>{order.totalAmount?.toLocaleString()} DA</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <button className="btn-close-modal" onClick={onHide}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
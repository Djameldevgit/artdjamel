// components/commission/ArtistCommissionList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getArtistCommissions, respondCommission } from '../../redux/actions/commissionAction';
import CommissionResponseModal from './CommissionResponseModal';

const ArtistCommissionList = () => {
  const dispatch = useDispatch();
  const { artistCommissions, loading } = useSelector(state => state.commissions);
  const { user } = useSelector(state => state.auth);
  const [selectedComm, setSelectedComm] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      dispatch(getArtistCommissions());
    }
  }, [dispatch, user]);

  const openResponseModal = (comm) => {
    setSelectedComm(comm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComm(null);
  };

  const handleRespond = async (id, data) => {
    await dispatch(respondCommission(id, data));
    closeModal();
  };

  if (loading) return <div>Cargando encargos...</div>;
  if (!artistCommissions || artistCommissions.length === 0) {
    return <p>No hay encargos recibidos.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {artistCommissions.map(comm => (
            <tr key={comm._id}>
              <td>{comm.cliente?.nombre || comm.cliente?.email || 'Cliente'}</td>
              <td>{comm.titulo}</td>
              <td>{comm.descripcion?.substring(0, 60)}...</td>
              <td>
                <span className={`badge bg-${getEstadoColor(comm.estado)}`}>
                  {comm.estado}
                </span>
              </td>
              <td>
                {comm.estado === 'pendiente' && (
                  <button className="btn btn-sm btn-primary" onClick={() => openResponseModal(comm)}>
                    Responder
                  </button>
                )}
                {comm.estado === 'respondido' && (
                  <span>Esperando decisión del cliente</span>
                )}
                {comm.estado === 'pagado' && (
                  <span className="text-success">✅ En proceso</span>
                )}
                {comm.estado.includes('rechazado') && (
                  <span className="text-danger">Rechazado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedComm && (
        <CommissionResponseModal
          commission={selectedComm}
          onClose={closeModal}
          onRespond={handleRespond}
        />
      )}
    </div>
  );
};

const getEstadoColor = (estado) => {
  const map = {
    pendiente: 'secondary',
    respondido: 'info',
    aceptado_cliente: 'primary',
    pagado: 'success',
    rechazado_artista: 'danger',
    rechazado_cliente: 'danger'
  };
  return map[estado] || 'light';
};

export default ArtistCommissionList;
// components/commission/ClientCommissionList.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClientCommissions, decideCommission, initiatePayment } from '../../redux/actions/commissionAction';

const ClientCommissionList = () => {
  const dispatch = useDispatch();
  const { clientCommissions, loading } = useSelector(state => state.commissions);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user && user.role === 'user') {
      dispatch(getClientCommissions());
    }
  }, [dispatch, user]);

  const handleDecision = async (id, decision) => {
    const result = await dispatch(decideCommission(id, decision));
    if (decision === 'aceptar' && result) {
      // Iniciar pago automáticamente
      dispatch(initiatePayment(id));
    }
  };

  if (loading) return <div>Cargando tus encargos...</div>;
  if (!clientCommissions || clientCommissions.length === 0) {
    return <p>No tienes encargos aún. ¡Crea uno!</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Título</th>
            <th>Estado</th>
            <th>Respuesta del artista</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientCommissions.map(comm => (
            <tr key={comm._id}>
              <td>{comm.titulo}</td>
              <td>
                <span className={`badge bg-${getEstadoColor(comm.estado)}`}>
                  {comm.estado}
                </span>
              </td>
              <td>
                {comm.respuesta ? (
                  <div>
                    <strong>{comm.respuesta.titulo}</strong>
                    <p>{comm.respuesta.descripcion}</p>
                    <p>Precio: {comm.respuesta.precioTotal} DZD</p>
                    <p>Adelanto (30%): {comm.respuesta.adelantoMonto} DZD</p>
                    <p>Tiempo: {comm.respuesta.tiempoEstimado}</p>
                    {comm.respuesta.imagenes && comm.respuesta.imagenes.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap">
                        {comm.respuesta.imagenes.map((img, i) => (
                          <img key={i} src={img} alt="referencia" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted">Sin respuesta</span>
                )}
              </td>
              <td>
                {comm.estado === 'pendiente' && (
                  <span>Esperando respuesta del artista...</span>
                )}
                {comm.estado === 'respondido' && (
                  <div className="d-flex flex-column gap-1">
                    <button className="btn btn-sm btn-success" onClick={() => handleDecision(comm._id, 'aceptar')}>
                      Aceptar
                    </button>
                    <button className="btn btn-sm btn-warning" onClick={() => handleDecision(comm._id, 'guardar')}>
                      Guardar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDecision(comm._id, 'rechazar')}>
                      Rechazar
                    </button>
                  </div>
                )}
                {comm.estado === 'aceptado_cliente' && (
                  <button className="btn btn-sm btn-primary" onClick={() => dispatch(initiatePayment(comm._id))}>
                    Pagar adelanto
                  </button>
                )}
                {comm.estado === 'pagado' && (
                  <span className="text-success">✅ Pagado - Artista en proceso</span>
                )}
                {comm.estado.includes('rechazado') && (
                  <span className="text-danger">Rechazado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper para colores de estado
const getEstadoColor = (estado) => {
  const map = {
    pendiente: 'secondary',
    respondido: 'info',
    aceptado_cliente: 'primary',
    pagado: 'success',
    rechazado_artista: 'danger',
    rechazado_cliente: 'danger',
    finalizado: 'dark'
  };
  return map[estado] || 'light';
};

export default ClientCommissionList;
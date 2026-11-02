// components/commission/CommissionResponseModal.js
import React, { useState } from 'react';

const CommissionResponseModal = ({ commission, onClose, onRespond }) => {
  const [accion, setAccion] = useState('aceptar');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioTotal, setPrecioTotal] = useState('');
  const [tiempoEstimado, setTiempoEstimado] = useState('');
  const [mensajeRechazo, setMensajeRechazo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (accion === 'aceptar') {
      await onRespond(commission._id, {
        accion: 'aceptar',
        titulo,
        descripcion,
        imagenes: [],
        precioTotal: Number(precioTotal),
        tiempoEstimado
      });
    } else {
      await onRespond(commission._id, {
        accion: 'rechazar',
        mensaje: mensajeRechazo || 'Lo siento, estoy muy ocupado por ahora.'
      });
    }
    setLoading(false);
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Responder a encargo: {commission.titulo}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Decisión</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="aceptar"
                      checked={accion === 'aceptar'}
                      onChange={() => setAccion('aceptar')}
                    />
                    <label className="form-check-label">Aceptar</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      value="rechazar"
                      checked={accion === 'rechazar'}
                      onChange={() => setAccion('rechazar')}
                    />
                    <label className="form-check-label">Rechazar</label>
                  </div>
                </div>
              </div>

              {accion === 'aceptar' ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">Título de la oferta</label>
                    <input
                      type="text"
                      className="form-control"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción (medidas, materiales, etc.)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Precio total (DZD)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={precioTotal}
                      onChange={(e) => setPrecioTotal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tiempo estimado (ej: 2 semanas)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tiempoEstimado}
                      onChange={(e) => setTiempoEstimado(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  <label className="form-label">Mensaje de rechazo (opcional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={mensajeRechazo}
                    onChange={(e) => setMensajeRechazo(e.target.value)}
                    placeholder="Ej: Estoy muy ocupado por ahora..."
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar respuesta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionResponseModal;
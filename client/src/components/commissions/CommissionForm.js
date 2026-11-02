// components/commission/CommissionForm.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCommission } from '../../redux/actions/commissionAction';

const CommissionForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    imagenes: [],
    artistaId: '' // opcional
  });
  const [loading, setLoading] = useState(false);

  // Solo usuarios con rol 'user' pueden ver el formulario
  if (!user || user.role !== 'user') {
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await dispatch(createCommission(form));
    setLoading(false);
    // Limpiar campos o redirigir
    setForm({ titulo: '', descripcion: '', imagenes: [], artistaId: '' });
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Pedir un encargo</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Título</label>
          <input
            name="titulo"
            className="form-control"
            placeholder="Título del encargo"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="4"
            placeholder="Describe el encargo (medidas, estilo, referencias...)"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Imágenes (URLs separadas por comas)</label>
          <input
            name="imagenes"
            className="form-control"
            placeholder="https://ejemplo.com/imagen1.jpg, https://..."
            value={form.imagenes.join(', ')}
            onChange={(e) => setForm({ ...form, imagenes: e.target.value.split(',').map(s => s.trim()) })}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar encargo'}
        </button>
      </form>
    </div>
  );
};

export default CommissionForm;
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCommissionDetail } from '../../redux/actions/commissionAction';

const CommissionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { commissionDetail, loading } = useSelector(state => state.commissions);

  useEffect(() => {
    dispatch(getCommissionDetail(id));
  }, [dispatch, id]);

  if (loading) return <div>Cargando...</div>;
  if (!commissionDetail) return <div>No encontrado</div>;

  return (
    <div>
      <h2>{commissionDetail.titulo}</h2>
      <p>{commissionDetail.descripcion}</p>
      {/* Mostrar más detalles según el estado */}
    </div>
  );
};

export default CommissionDetailPage;
// components/PlanDebugger.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDataAPI } from '../../utils/fetchData';
import { GLOBALTYPES } from '../../redux/actions/globalTypes';

const PlanDebugger = () => {
  const { auth } = useSelector(state => state);
  const [serverData, setServerData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const dispatch = useDispatch();

  const checkServerStatus = async () => {
    if (!auth.token) return;
    
    setChecking(true);
    try {
      const res = await getDataAPI('chargily/check-plan-status', auth.token);
      setServerData(res.data);
      setLastCheck(new Date().toLocaleTimeString());
      
      // 🔍 Comparar Redux vs Servidor
      console.log('🔍 VERIFICACIÓN DE PLAN:');
      console.log('Redux plan:', auth.user?.channelPlan);
      console.log('Servidor plan:', res.data.user.channelPlan);
      console.log('Redux role:', auth.user?.role);
      console.log('Servidor role:', res.data.user.role);
      
      // ⚠️ Si hay diferencia, actualizar Redux automáticamente
      if (res.data.user.channelPlan !== auth.user?.channelPlan ||
          res.data.user.role !== auth.user?.role) {
        
        console.log('⚠️ DIFERENCIA DETECTADA - Actualizando Redux...');
        
        dispatch({
          type: GLOBALTYPES.AUTH,
          payload: {
            ...auth,
            user: {
              ...auth.user,
              channelPlan: res.data.user.channelPlan,
              role: res.data.user.role,
              isPro: res.data.user.isPro,
              channelPlanExpiresAt: res.data.user.expiresAt
            }
          }
        });
        
        console.log('✅ Redux actualizado');
      } else {
        console.log('✅ Redux y servidor coinciden');
      }
      
    } catch (error) {
      console.error('❌ Error verificando plan:', error);
    } finally {
      setChecking(false);
    }
  };

  // Verificar cada 5 segundos
  useEffect(() => {
    checkServerStatus(); // Primera verificación inmediata
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, [auth.token]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#00ff00' }}>
        🛠️ Plan Debugger
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Redux:</strong><br/>
        Plan: {auth.user?.channelPlan || 'free'}<br/>
        Role: {auth.user?.role || 'user'}<br/>
        isPro: {auth.user?.isPro ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '5px', borderTop: '1px solid #333', paddingTop: '5px' }}>
        <strong>Servidor:</strong><br/>
        {serverData ? (
          <>
            Plan: {serverData.user.channelPlan}<br/>
            Role: {serverData.user.role}<br/>
            isPro: {serverData.user.isPro ? '✅' : '❌'}<br/>
            Expira: {serverData.user.expiresAt ? new Date(serverData.user.expiresAt).toLocaleDateString() : 'Nunca'}
          </>
        ) : (
          'Cargando...'
        )}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#999' }}>
        Última verificación: {lastCheck || 'Nunca'}<br/>
        {checking && '⏳ Verificando...'}
        {!checking && serverData && 
          (serverData.user.channelPlan === auth.user?.channelPlan ? 
            '🟢 Sincronizado' : '🔴 Desincronizado')
        }
      </div>
      
      <button 
        onClick={checkServerStatus}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#667eea',
          border: 'none',
          color: 'white',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        🔄 Verificar Ahora
      </button>
    </div>
  );
};

export default PlanDebugger;
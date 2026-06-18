// src/pages/PaymentSuccess.js - MEJORADO
import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getDataAPI } from '../../utils/fetchData';

const PaymentSuccess = () => {
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Obtener session_id de la URL (Chargily lo envía)
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');
        const token = localStorage.getItem('token');
        
        if (!sessionId) {
          console.warn('⚠️ No session_id en URL');
          setLoading(false);
          return;
        }
        
        // Verificar el pago con el backend
        const response = await getDataAPI(`payments/verify/${sessionId}`, token);
        
        if (response.data?.success || response.data?.status === 'paid') {
          setVerified(true);
        }
      } catch (error) {
        console.error('❌ Error verificando pago:', error);
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [location]);
  
  useEffect(() => {
    if (verified) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            history.push('/dashboard');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verified, history]);
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center' }}>
          <FaSpinner style={{ fontSize: '50px', animation: 'spin 1s linear infinite', color: '#28a745' }} />
          <p style={{ marginTop: '20px' }}>Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        {verified ? (
          <>
            <FaCheckCircle style={{ fontSize: '80px', color: '#28a745', marginBottom: '20px' }} />
            <h1 style={{ color: '#28a745', marginBottom: '10px' }}>✅ Paiement réussi !</h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Votre plan a été activé avec succès
            </p>
          </>
        ) : (
          <>
            <h1 style={{ color: '#ffc107', marginBottom: '10px' }}>⏳ En attente</h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Votre paiement est en cours de confirmation...
            </p>
          </>
        )}
        
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0 }}>
            Redirection vers le tableau de bord dans <strong>{countdown}</strong> secondes...
          </p>
        </div>
        
        <button 
          onClick={() => history.push('/')}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Accéder au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
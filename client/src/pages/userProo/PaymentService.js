// src/services/paymentService.js - VERSIÓN CORREGIDA PARA PRODUCCIÓN

// ✅ Usar variable de entorno para la URL base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://videocommerce.onrender.com/api';

export const PaymentService = {
  
  // Crear pago (para planes de pago)
  createPaymentLink: async (paymentData, token) => {
    console.log('📡 Creando pago en:', `${API_BASE_URL}/create-plan-checkout`);
    console.log('💰 Datos de pago:', paymentData);
    
    const response = await fetch(`${API_BASE_URL}/create-plan-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta del servidor:', data);
    return data;
  },

  // Activar plan gratuito
  activateFreePlan: async (planData, token) => {
    console.log('🎁 Activando plan gratuito en:', `${API_BASE_URL}/activate-free-plan`);
    
    const response = await fetch(`${API_BASE_URL}/activate-free-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.msg || 'Error al activar plan gratuito');
    }

    return await response.json();
  },

  // Verificar estado de un pago
  verifyPayment: async (orderId, token) => {
    console.log('🔍 Verificando pago en:', `${API_BASE_URL}/verify-payment/${orderId}`);
    
    const response = await fetch(`${API_BASE_URL}/verify-payment/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.msg || 'Error al verificar el pago');
    }

    return await response.json();
  },

  // Verificar estado del plan del usuario
  checkPlanStatus: async (token) => {
    console.log('📊 Verificando estado del plan en:', `${API_BASE_URL}/check-plan-status`);
    
    const response = await fetch(`${API_BASE_URL}/check-plan-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.msg || 'Error al verificar el plan');
    }

    return await response.json();
  },

  // Obtener historial de transacciones
  getUserTransactions: async (token, page = 1, limit = 10) => {
    console.log('📜 Obteniendo transacciones en:', `${API_BASE_URL}/user-transactions?page=${page}&limit=${limit}`);
    
    const response = await fetch(`${API_BASE_URL}/user-transactions?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.msg || 'Error al obtener transacciones');
    }

    return await response.json();
  }
};
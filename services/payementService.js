// services/paymentService.js
const axios = require('axios');
const crypto = require('crypto');

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY;
const CHARGILY_URL = process.env.CHARGILY_MODE === 'live'
  ? 'https://pay.chargily.net/api/v2/checkouts'
  : 'https://pay.chargily.net/test/api/v2/checkouts';

class PaymentService {
  
  // 1. Crear checkout en Chargily
  async createCheckout(order, userEmail, cartItems, metadata = {}) {
    try {
      const payload = {
        amount: order.totalAmount,
        currency: 'dzd',
        success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
        failure_url: `${process.env.CLIENT_URL}/payment-failure?orderId=${order._id}`,
        webhook_endpoint: `${process.env.BACKEND_URL}/api/webhook`,
        metadata: {
          orderId: order._id.toString(),
          userId: order.userId.toString(),
          cart_items: cartItems,
          ...metadata
        },
        customer: {
          email: userEmail
        }
      };

      const response = await axios.post(CHARGILY_URL, payload, {
        headers: {
          'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.checkout_url;
    } catch (error) {
      console.error("Error en PaymentService.createCheckout:", error.response.data || error.message);
      throw new Error("No se pudo generar el enlace de pago con Chargily");
    }
  }

  // 2. Verificar firma del webhook
  verifyWebhookSignature(signatureHeader, rawBody) {
    if (!signatureHeader) return false;
    
    const computedSignature = crypto
      .createHmac('sha256', CHARGILY_SECRET_KEY)
      .update(JSON.stringify(rawBody))
      .digest('hex');

    return computedSignature === signatureHeader;
  }
}

module.exports = new PaymentService();
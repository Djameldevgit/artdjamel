const axios = require('axios');
const crypto = require('crypto');

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY;
const CHARGILY_URL = process.env.CHARGILY_MODE === 'live'
  ? 'https://pay.chargily.net/api/v2/checkouts'
  : 'https://pay.chargily.net/test/api/v2/checkouts';

class PaymentService {
  
  async createCheckout(order, userEmail, cartItems, metadata = {}) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL || `${process.env.BACKEND_URL}/api/webhook`;

      const payload = {
        amount: order.totalAmount,
        currency: 'dzd',
        success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${order._id}`,
        failure_url: `${process.env.CLIENT_URL}/payment-failure?orderId=${order._id}`,
        webhook_endpoint: webhookUrl,
        metadata: {
          orderId: order._id.toString(),
          userId: order.userId.toString(),
          cart_items: cartItems,
          userEmail: userEmail,  // ✅ Email en metadata
          ...metadata
        }
        // ❌ Eliminado el campo customer
      };

      console.log('📨 Enviando webhook URL a Chargily:', webhookUrl);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(CHARGILY_URL, payload, {
        headers: {
          'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        checkout_url: response.data.checkout_url,
        checkout_id: response.data.id
      };
    } catch (error) {
      const errorMsg = error.response.data || error.message;
      console.error("❌ Error en PaymentService.createCheckout:", errorMsg);
      throw new Error("No se pudo generar el enlace de pago con Chargily");
    }
  }

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
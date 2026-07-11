// controllers/transactionCtrl.js
const Order = require('../models/orderModel');
const Transaction = require('../models/transactionModel');
const Video = require('../models/videoModel');
const paymentService = require('../services/payementService');
 
const transactionCtrl = {

  // 🔥 NUEVO: Manejar webhook de Chargily
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['signature']; // Chargily usa "signature"
      const payload = req.body;

      // 1. Verificar firma
      const isValid = paymentService.verifyWebhookSignature(signature, payload);
      if (!isValid) {
        console.warn("⚠️ Firma inválida en webhook");
        return res.status(403).json({ error: "Invalid signature" });
      }

      const event = payload;
      console.log('📨 Webhook recibido:', event.type);

      // 2. Buscar la transacción asociada al checkout
      const checkoutId = event.data.id;
      const transaction = await Transaction.findOne({ checkout_id: checkoutId });
      if (!transaction) {
        console.warn(`⚠️ Transacción no encontrada para checkout: ${checkoutId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // 3. Buscar la orden asociada
      const order = await Order.findOne({ orderId: transaction.checkout_id });
      if (!order) {
        console.warn(`⚠️ Orden no encontrada para checkout: ${checkoutId}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      // 4. Procesar según el evento
      if (event.type === 'checkout.paid') {
        // ✅ PAGO EXITOSO
        console.log(`🎉 Pago confirmado para orden ${order._id}`);

        // Verificar estado real en Chargily (seguridad extra)
        const isLive = process.env.CHARGILY_MODE === 'live';
        const baseUrl = isLive 
          ? 'https://pay.chargily.net/api/v2/checkouts'
          : 'https://pay.chargily.net/test/api/v2/checkouts';
        const checkResponse = await axios.get(`${baseUrl}/${checkoutId}`, {
          headers: { Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}` }
        });
        if (checkResponse.data.status !== 'paid') {
          console.warn(`⚠️ Checkout no está paid (estado: ${checkResponse.data.status})`);
          return res.status(400).json({ error: 'Checkout not paid' });
        }

        // Actualizar transacción
        transaction.status = 'paid';
        transaction.payment_completed_at = new Date();
        transaction.chargily_payment_id = event.data.payment_intent || checkoutId;
        await transaction.save();

        // Actualizar orden
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();

        // Liberar reservas y reducir stock
        for (const item of order.items) {
          const video = await Video.findById(item.videoId);
          if (video) {
            if (video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
              video.reservedBy = null;
              video.reservedAt = null;
            }
            video.stock = Math.max(0, video.stock - item.quantity);
            if (video.stock <= 0) video.status = 'vendue';
            await video.save();
            console.log(`📦 Video "${video.title}" actualizado: stock=${video.stock}`);
          }
        }

        console.log(`✅ Orden ${order._id} completada`);

      } else if (event.type === 'checkout.failed' || event.type === 'checkout.expired') {
        // ❌ PAGO FALLIDO O EXPIRADO
        console.log(`⏭️ Pago fallido/expiró para orden ${order._id}`);

        // Actualizar transacción
        transaction.status = event.type === 'checkout.expired' ? 'expired' : 'failed';
        await transaction.save();

        // Actualizar orden
        order.status = event.type === 'checkout.expired' ? 'expired' : 'cancelled';
        await order.save();

        // Liberar reservas (devolver stock)
        for (const item of order.items) {
          const video = await Video.findById(item.videoId);
          if (video) {
            if (video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
              video.reservedBy = null;
              video.reservedAt = null;
            }
            // No modificamos stock porque no se redujo
            await video.save();
            console.log(`🔓 Reserva liberada para "${video.title}"`);
          }
        }

        console.log(`🔓 Orden ${order._id} cancelada y stock liberado`);
      }

      // 5. RESPONDER 200 OK
      res.status(200).json({ received: true });

    } catch (error) {
      console.error("❌ Error en handleWebhook:", error);
      res.status(500).json({ error: "Webhook error", details: error.message });
    }
  }
};

module.exports = transactionCtrl;
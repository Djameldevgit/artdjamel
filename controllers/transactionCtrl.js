const axios = require('axios'); // ✅ Agregado
const Order = require('../models/orderModel');
const Transaction = require('../models/transactionModel');
const Video = require('../models/videoModel');
const paymentService = require('../services/payementService');

const transactionCtrl = {

  /**
   * 🔥 MANEJAR WEBHOOK DE CHARGILY
   */
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['signature'];
      const payload = req.body;

      // 1. Verificar firma
      const isValid = paymentService.verifyWebhookSignature(signature, payload);
      if (!isValid) {
        console.warn('⚠️ Firma inválida en webhook');
        return res.status(403).json({ error: 'Invalid signature' });
      }

      const event = payload;
      console.log('📨 Webhook recibido:', event.type);

      // 2. Buscar transacción
      const checkoutId = event.data.id;
      const transaction = await Transaction.findOne({ checkout_id: checkoutId });
      if (!transaction) {
        console.warn(`⚠️ Transacción no encontrada para checkout: ${checkoutId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // 3. Buscar la orden
      const order = await Order.findOne({ orderId: transaction.checkout_id });
      if (!order) {
        console.warn(`⚠️ Orden no encontrada para checkout: ${checkoutId}`);
        return res.status(404).json({ error: 'Order not found' });
      }

      // 4. Procesar según evento
      if (event.type === 'checkout.paid') {
        await this._processPaid(order, transaction, event, checkoutId);
      } else if (event.type === 'checkout.failed' || event.type === 'checkout.expired') {
        await this._processFailedOrExpired(order, transaction, event);
      } else {
        console.log(`⏭️ Evento ignorado: ${event.type}`);
      }

      // 5. Responder 200 OK
      res.status(200).json({ received: true });

    } catch (error) {
      console.error('❌ Error en handleWebhook:', error);
      res.status(500).json({ error: 'Webhook error', details: error.message });
    }
  },

  /**
   * ✅ PROCESAR PAGO EXITOSO
   */
  _processPaid: async (order, transaction, event, checkoutId) => {
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
      throw new Error('Checkout not paid');
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
  },

  /**
   * ❌ PROCESAR PAGO FALLIDO O EXPIRADO
   */
  _processFailedOrExpired: async (order, transaction, event) => {
    console.log(`⏭️ Pago ${event.type} para orden ${order._id}`);

    // Actualizar transacción
    transaction.status = event.type === 'checkout.expired' ? 'expired' : 'failed';
    await transaction.save();

    // Actualizar orden
    order.status = event.type === 'checkout.expired' ? 'expired' : 'cancelled';
    await order.save();

    // Liberar reservas
    for (const item of order.items) {
      const video = await Video.findById(item.videoId);
      if (video) {
        if (video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
          video.reservedBy = null;
          video.reservedAt = null;
        }
        await video.save();
        console.log(`🔓 Reserva liberada para "${video.title}"`);
      }
    }

    console.log(`🔓 Orden ${order._id} cancelada y reservas liberadas`);
  },

  /**
   * 🧹 LIBERAR RESERVAS EXPIRADAS (llamar desde cron job o manualmente)
   */
  releaseExpiredReservations: async (req, res) => {
    try {
      // Solo admin puede ejecutar esto
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      console.log('🔄 Liberando reservas expiradas...');

      // Buscar órdenes pendientes con reserva activa y antigüedad > 30 minutos
      const expiryMinutes = 30;
      const cutoffTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

      const pendingOrders = await Order.find({
        status: 'pending',
        createdAt: { $lt: cutoffTime }
      });

      let releasedCount = 0;

      for (const order of pendingOrders) {
        let released = false;
        for (const item of order.items) {
          const video = await Video.findById(item.videoId);
          if (video && video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
            video.reservedBy = null;
            video.reservedAt = null;
            await video.save();
            released = true;
            console.log(`🔓 Reserva liberada para "${video.title}" (orden ${order._id})`);
          }
        }
        if (released) {
          order.status = 'expired';
          await order.save();
          releasedCount++;
        }
      }

      console.log(`✅ ${releasedCount} reservas expiradas liberadas.`);
      res.json({
        success: true,
        message: `${releasedCount} reservas expiradas liberadas.`,
        releasedCount
      });

    } catch (error) {
      console.error('❌ Error en releaseExpiredReservations:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 🧹 LIMPIEZA PROGRAMADA (CRON JOB) - Exportar para usar en server.js
   */
  cleanExpiredReservations: async () => {
    try {
      console.log('🔄 [CRON] Liberando reservas expiradas...');

      const expiryMinutes = 30;
      const cutoffTime = new Date(Date.now() - expiryMinutes * 60 * 1000);

      const pendingOrders = await Order.find({
        status: 'pending',
        createdAt: { $lt: cutoffTime }
      });

      let releasedCount = 0;

      for (const order of pendingOrders) {
        let released = false;
        for (const item of order.items) {
          const video = await Video.findById(item.videoId);
          if (video && video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
            video.reservedBy = null;
            video.reservedAt = null;
            await video.save();
            released = true;
            console.log(`🔓 [CRON] Reserva liberada para "${video.title}" (orden ${order._id})`);
          }
        }
        if (released) {
          order.status = 'expired';
          await order.save();
          releasedCount++;
        }
      }

      console.log(`✅ [CRON] ${releasedCount} reservas expiradas liberadas.`);
      return { success: true, releasedCount };

    } catch (error) {
      console.error('❌ [CRON] Error en cleanExpiredReservations:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = transactionCtrl;
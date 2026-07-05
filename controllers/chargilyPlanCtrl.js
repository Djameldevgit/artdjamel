const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const Order = require('../models/orderModel');
const Video = require('../models/videoModel');
const Commission = require('../models/commissionModel');

const chargilyPlanCtrl = {

  // ============================================
  // 🛒 RESERVAR OBRAS DEL CARRITO (10 minutos)
  // ============================================
  reserveCartItems: async (cartItems, userId) => {
    const reservedItems = [];
    const errors = [];

    for (const item of cartItems) {
      try {
        const video = await Video.findById(item.videoId);
        if (!video) {
          errors.push({ videoId: item.videoId, error: 'Obra no encontrada' });
          continue;
        }

        // Verificar si la obra ya está reservada por otro usuario (y no expirada)
        if (video.reservedBy && video.reservedBy.toString() !== userId.toString()) {
          const reservedAt = new Date(video.reservedAt);
          const now = new Date();
          const diffMinutes = (now - reservedAt) / (1000 * 60);
          if (diffMinutes < 10) {
            errors.push({
              videoId: item.videoId,
              title: video.title,
              error: `Esta obra está siendo reservada por otro usuario. Intenta en ${Math.ceil(10 - diffMinutes)} minutos.`
            });
            continue;
          }
        }

        // Reservar la obra para este usuario (o renovar reserva si ya era suya)
        video.reservedBy = userId;
        video.reservedAt = new Date();
        await video.save();
        reservedItems.push({ videoId: item.videoId, title: video.title });
      } catch (err) {
        console.error('Error reservando obra:', err);
        errors.push({ videoId: item.videoId, error: err.message });
      }
    }

    return { reservedItems, errors };
  },

  // ============================================
  // 1. CREAR CHECKOUT (CARRITO O ENCARGO)
  // ============================================
  createPlanCheckout: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        plan_id, // 'cart' o 'commission'
        plan_name,
        amount,
        cart_items,
        commission_id
      } = req.body;

      if (!plan_id || !amount) {
        return res.status(400).json({ error: 'Plan et montant requis' });
      }

      const user = await User.findById(userId).select('email username');

      const isLive = process.env.CHARGILY_MODE === 'live';
      const baseUrl = isLive
        ? 'https://pay.chargily.net/api/v2/checkouts'
        : 'https://pay.chargily.net/test/api/v2/checkouts';

      const baseClientUrl = process.env.CLIENT_URL || (isLive
        ? 'https://artdjamel.onrender.com'
        : 'http://localhost:3000');

      const webhookUrl = `${baseClientUrl}/api/webhook`;

      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`💰 Monto: ${amount} DZD`);
      console.log(`📦 Plan: ${plan_id}`);
      console.log(`🌐 Webhook URL: ${webhookUrl}`);

      // 🔥 Asignar tipo según plan_id
      let actualType;
      if (plan_id === 'cart') {
        actualType = 'cart_payment';
      } else if (plan_id === 'commission') {
        actualType = 'commission_payment';
      } else {
        return res.status(400).json({ error: 'Tipo de pago no válido' });
      }

      // 🔥 Si es carrito, reservar las obras antes de crear el checkout
      if (plan_id === 'cart' && cart_items && cart_items.length > 0) {
        const { reservedItems, errors } = await this.reserveCartItems(cart_items, userId);
        if (errors.length > 0) {
          return res.status(409).json({
            error: 'Alguna obra ya no está disponible para reserva',
            details: errors
          });
        }
        console.log(`✅ ${reservedItems.length} obras reservadas para el usuario ${userId}`);
      }

      // Construir metadata
      let metadata = {
        type: actualType,
        user_id: userId.toString(),
        user_email: user.email || '',
        user_username: user.username || '',
        plan_id: plan_id,
        plan_name: plan_name || (plan_id === 'cart' ? 'Panier' : 'Encargo')
      };

      if (plan_id === 'cart') {
        metadata.cart_items = cart_items || [];
        metadata.total_items = cart_items ? cart_items.length : 0;
      } else if (plan_id === 'commission') {
        metadata.commission_id = commission_id;
        if (req.body.commission_title) {
          metadata.commission_title = req.body.commission_title;
        }
      }

      const response = await axios.post(
        baseUrl,
        {
          amount: Number(amount),
          currency: "dzd",
          success_url: `${baseClientUrl}/payment-success`,
          failure_url: `${baseClientUrl}/payment-failure`,
          webhook_endpoint: webhookUrl,
          metadata: metadata
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Crear transacción
      const transaction = new Transaction({
        checkout_id: response.data.id,
        user_id: userId,
        user_email: user.email,
        user_username: user.username,
        plan_id: plan_id,
        plan_name: plan_name || (plan_id === 'cart' ? 'Panier' : 'Encargo'),
        amount: Number(amount),
        currency: 'dzd',
        cart_items: cart_items || [],
        metadata: metadata,
        status: 'pending',
        chargily_response: response.data
      });

      await transaction.save();
      console.log('✅ Transacción registrada:', transaction._id);

      return res.json({
        success: true,
        checkout_url: response.data.checkout_url,
        transaction_id: transaction._id,
        mode: isLive ? 'live' : 'test'
      });

    } catch (err) {
      console.error('❌ Error en createPlanCheckout:', err.message);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        return res.status(err.response.status).json({
          error: err.response.data.message || 'Erreur Chargily'
        });
      }
      return res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 2. WEBHOOK - PROCESAR PAGO EXITOSO
  // ============================================
  handlePlanWebhook: async (req, res) => {
    try {
      console.log('\n🔔 ========================================');
      console.log('🔔 WEBHOOK RECIBIDO');
      console.log('🔔 ========================================');
      console.log('📅 Hora:', new Date().toISOString());
      console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
      console.log('📨 Body:', JSON.stringify(req.body, null, 2));
      console.log('========================================\n');

      const signature = req.headers["signature"];
      const payload = JSON.stringify(req.body);
      const isLive = process.env.CHARGILY_MODE === 'live';

      if (isLive && signature) {
        const computedSignature = crypto
          .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
          .update(payload)
          .digest("hex");
        if (computedSignature !== signature) {
          console.warn('⚠️ Firma inválida!');
          return res.status(403).json({ error: "Invalid signature" });
        }
        console.log('✅ Firma verificada correctamente');
      } else if (isLive && !signature) {
        console.warn('⚠️ No hay firma en modo LIVE!');
      } else {
        console.log('🟡 Modo TEST - verificación de firma omitida');
      }

      const event = req.body;
      console.log('📨 Tipo de evento:', event.type);

      if (event.type === "checkout.paid") {
        const checkoutData = event.data;
        let metadata = checkoutData.metadata || {};
        const checkoutId = checkoutData.id;

        console.log(`🎉 PAGO CONFIRMADO: ${checkoutId}`);
        console.log(`👤 Usuario ID: ${metadata.user_id}`);
        console.log(`💰 Monto: ${checkoutData.amount} ${checkoutData.currency}`);
        console.log(`📦 Plan: ${metadata.plan_id}`);
        console.log(`📋 Tipo original en metadata: ${metadata.type}`);

        // Normalizar tipo si es carrito
        if (metadata.plan_id === 'cart' && metadata.type !== 'cart_payment') {
          console.log(`🔄 Normalizando type: de "${metadata.type}" a "cart_payment"`);
          metadata.type = 'cart_payment';
        }

        console.log(`📋 Tipo final procesado: ${metadata.type}`);

        const transaction = await Transaction.findOne({ checkout_id: checkoutId });
        if (!transaction) {
          console.warn(`⚠️ Transacción NO encontrada para checkout_id: ${checkoutId}`);
          return res.json({ received: true, warning: 'Transaction not found' });
        }

        if (transaction.status === 'paid') {
          console.log('⏭️ Transacción ya procesada');
          return res.json({ received: true });
        }

        // Llamar al procesador de pago
        return await this.processPaidTransaction(transaction, checkoutData, metadata, res);

      } else {
        console.log(`⏭️ Evento ignorado: ${event.type}`);
        return res.json({ received: true });
      }

    } catch (err) {
      console.error('❌ ERROR WEBHOOK:', err);
      return res.status(500).json({ error: "Webhook error", details: err.message });
    }
  },

  // ============================================
  // 3. PROCESAR TRANSACCIÓN PAGADA
  // ============================================
  processPaidTransaction: async (transaction, checkoutData, metadata, res) => {
    try {
      // 🔥 VERIFICACIÓN OBLIGATORIA: Consultar estado real en Chargily
      const isLive = process.env.CHARGILY_MODE === 'live';
      const baseUrl = isLive
        ? 'https://pay.chargily.net/api/v2/checkouts'
        : 'https://pay.chargily.net/test/api/v2/checkouts';

      const checkoutId = checkoutData.id;
      const response = await axios.get(`${baseUrl}/${checkoutId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`
        }
      });

      const realStatus = response.data.status;
      console.log(`🔍 Estado real del checkout (${checkoutId}): ${realStatus}`);

      if (realStatus !== 'paid') {
        console.warn(`⚠️ El checkout no está pagado (estado: ${realStatus}). Ignorando webhook.`);
        return res.json({ received: true, warning: 'Checkout not paid' });
      }

      // ✅ Actualizar transacción a PAID
      transaction.status = 'paid';
      transaction.payment_completed_at = new Date();
      transaction.chargily_payment_id = checkoutData.payment_intent || checkoutData.id;
      transaction.webhook_received = checkoutData;
      await transaction.save();
      console.log('✅ Transacción actualizada a PAID');

      // ============================================
      // PROCESAR SEGÚN TIPO
      // ============================================
      const type = metadata.type || 'cart_payment';
      console.log(`📋 Procesando tipo: ${type}`);

      if (type === 'cart_payment') {
        console.log('🛒 Procesando pago de carrito...');

        let cartItems = transaction.cart_items || [];
        if (cartItems.length === 0 && metadata.cart_items) {
          cartItems = metadata.cart_items;
        }

        if (cartItems.length === 0) {
          console.warn('⚠️ No hay items en el carrito');
          return res.json({ received: true, warning: 'No cart items' });
        }

        console.log(`📦 Items del carrito: ${cartItems.length}`);

        // Verificar si ya existe la orden
        const existingOrder = await Order.findOne({ orderId: checkoutData.id });
        if (existingOrder) {
          console.log(`⏭️ Orden ya existe para checkout_id: ${checkoutData.id}`);
          return res.json({ received: true, warning: 'Order already exists' });
        }

        // Crear la orden
        const order = new Order({
          orderId: checkoutData.id,
          userId: transaction.user_id,
          userEmail: transaction.user_email,
          userName: transaction.user_username,
          items: cartItems.map(item => ({
            videoId: item.videoId,
            title: item.title || 'Sans titre',
            price: item.price || 0,
            quantity: item.quantity || 1,
            thumbnail: item.thumbnail || ''
          })),
          totalAmount: transaction.amount,
          currency: transaction.currency || 'dzd',
          paymentMethod: 'chargily',
          paymentId: transaction.chargily_payment_id,
          checkoutId: checkoutData.id,
          status: 'paid',
          paidAt: new Date()
        });

        await order.save();
        console.log(`✅ ORDEN CREADA: ${order.orderId}`);

        // Actualizar stock y liberar reserva
        for (const item of cartItems) {
          try {
            const video = await Video.findById(item.videoId);
            if (video) {
              // Liberar reserva si existe (para este usuario)
              if (video.reservedBy && video.reservedBy.toString() === order.userId.toString()) {
                video.reservedBy = null;
                video.reservedAt = null;
                await video.save();
                console.log(`✅ Reserva liberada para "${video.title}"`);
              }
              // Reducir stock
              video.stock = Math.max(0, video.stock - (item.quantity || 1));
              if (video.stock <= 0) video.status = 'vendue';
              await video.save();
              console.log(`📦 Video "${video.title}" actualizado: stock=${video.stock}`);
            }
          } catch (err) {
            console.error(`❌ Error actualizando video ${item.videoId}:`, err.message);
          }
        }

        console.log('✅ Procesamiento de carrito completado');
        return res.json({ received: true, orderCreated: true });

      } else if (type === 'commission_payment') {
        console.log('🎨 Procesando pago de encargo...');
        const commissionId = metadata.commission_id;
        if (!commissionId) {
          console.error('❌ No se encontró commission_id en metadata');
          return res.status(400).json({ error: 'Commission ID missing' });
        }

        const Commission = require('../models/commissionModel');
        const commission = await Commission.findById(commissionId);
        if (!commission) {
          console.error(`❌ Encargo ${commissionId} no encontrado`);
          return res.status(404).json({ error: 'Commission not found' });
        }

        commission.estado = 'pagado';
        commission.pago = {
          idChargily: checkoutData.id || transaction.chargily_payment_id,
          monto: transaction.amount,
          estadoPago: 'completado',
          fechaPago: new Date()
        };
        commission.mensajes = commission.mensajes || [];
        commission.mensajes.push({
          emisor: null,
          texto: 'Pago del adelanto confirmado. El artista puede comenzar la obra.'
        });
        await commission.save();
        console.log(`✅ Encargo ${commissionId} actualizado a PAGADO`);

        return res.json({ received: true, commissionUpdated: true });

      } else {
        // Si llega otro tipo, ignorar
        console.warn(`⚠️ Tipo desconocido: ${type}. Ignorando.`);
        return res.json({ received: true, warning: 'Unknown type' });
      }

    } catch (err) {
      console.error('❌ Error en processPaidTransaction:', err);
      return res.status(500).json({ error: 'Error procesando pago', details: err.message });
    }
  },

  // ============================================
  // 4. SINCRONIZAR ÓRDENES (ADMIN)
  // ============================================
  syncPendingOrders: async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
      }

      console.log('🔄 ===== SINCRONIZANDO ÓRDENES =====');

      // Solo transacciones ya pagadas
      const transactions = await Transaction.find({
        plan_id: 'cart',
        status: 'paid'
      }).sort({ created_at: -1 });

      console.log(`📊 Encontradas ${transactions.length} transacciones pagadas de carrito`);

      let created = 0;
      let skipped = 0;
      let errors = 0;

      for (const transaction of transactions) {
        const existingOrder = await Order.findOne({ orderId: transaction.checkout_id });
        if (existingOrder) {
          console.log(`⏭️ Orden ya existe para checkout_id: ${transaction.checkout_id}`);
          skipped++;
          continue;
        }

        try {
          const cartItems = transaction.cart_items || [];
          if (cartItems.length === 0) {
            console.warn(`⚠️ Transacción ${transaction.checkout_id} sin items`);
            skipped++;
            continue;
          }

          console.log(`📦 Creando orden para checkout_id: ${transaction.checkout_id}`);
          console.log(`   Usuario: ${transaction.user_email}`);
          console.log(`   Items: ${cartItems.length}`);
          console.log(`   Total: ${transaction.amount} DA`);

          const order = new Order({
            orderId: transaction.checkout_id,
            userId: transaction.user_id,
            userEmail: transaction.user_email,
            userName: transaction.user_username || 'User',
            items: cartItems.map(item => ({
              videoId: item.videoId,
              title: item.title || 'Sans titre',
              price: item.price || 0,
              quantity: item.quantity || 1,
              thumbnail: item.thumbnail || ''
            })),
            totalAmount: transaction.amount,
            currency: transaction.currency || 'dzd',
            paymentMethod: 'chargily',
            paymentId: transaction.chargily_payment_id || transaction.checkout_id,
            checkoutId: transaction.checkout_id,
            status: 'paid',
            paidAt: transaction.payment_completed_at || new Date()
          });

          await order.save();
          created++;
          console.log(`✅ Orden creada: ${order.orderId}`);

          // Actualizar stock (por si no se hizo en el webhook)
          for (const item of cartItems) {
            try {
              const video = await Video.findById(item.videoId);
              if (video) {
                const oldStock = video.stock || 0;
                const qty = item.quantity || 1;
                video.stock = Math.max(0, oldStock - qty);
                if (video.stock <= 0) video.status = 'vendue';
                await video.save();
                console.log(`📦 Video "${video.title}" actualizado: stock ${oldStock} → ${video.stock}`);
              }
            } catch (err) {
              console.error(`❌ Error actualizando video ${item.videoId}:`, err.message);
            }
          }

        } catch (err) {
          errors++;
          console.error(`❌ Error creando orden para ${transaction.checkout_id}:`, err.message);
        }
      }

      console.log(`\n✅ Sincronización completada:`);
      console.log(`   - ${created} órdenes creadas`);
      console.log(`   - ${skipped} omitidas`);
      console.log(`   - ${errors} errores`);

      res.json({
        success: true,
        message: 'Sincronización completada',
        stats: { totalTransactions: transactions.length, created, skipped, errors }
      });

    } catch (err) {
      console.error('❌ Error en syncPendingOrders:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 5. CREAR CHECKOUT PARA ENCARGO (específico)
  // ============================================
  createCommissionCheckout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { commissionId } = req.body;

      if (!commissionId) {
        return res.status(400).json({ error: 'commissionId es requerido' });
      }

      const commission = await Commission.findById(commissionId);
      if (!commission) {
        return res.status(404).json({ error: 'Encargo no encontrado' });
      }

      if (commission.cliente.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'No eres el cliente de este encargo' });
      }

      if (commission.estado !== 'aceptado_cliente') {
        return res.status(400).json({ error: 'El encargo no está en estado de aceptado para pagar' });
      }

      if (commission.pago && commission.pago.estadoPago === 'completado') {
        return res.status(400).json({ error: 'Este encargo ya ha sido pagado' });
      }

      const monto = commission.respuesta.adelantoMonto;
      if (!monto || monto <= 0) {
        return res.status(400).json({ error: 'Monto de adelanto inválido' });
      }

      const user = await User.findById(userId).select('email username');

      const isLive = process.env.CHARGILY_MODE === 'live';
      const baseUrl = isLive
        ? 'https://pay.chargily.net/api/v2/checkouts'
        : 'https://pay.chargily.net/test/api/v2/checkouts';

      const baseClientUrl = process.env.CLIENT_URL || (isLive
        ? 'https://artdjamel.onrender.com'
        : 'http://localhost:3000');

      const webhookUrl = `${baseClientUrl}/api/webhook`;

      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`💰 Monto adelanto: ${monto} DZD`);
      console.log(`📦 Comisión ID: ${commissionId}`);
      console.log(`🌐 Webhook URL: ${webhookUrl}`);

      const metadata = {
        type: 'commission_payment',
        commission_id: commissionId.toString(),
        user_id: userId.toString(),
        user_email: user.email || '',
        user_username: user.username || '',
        titulo_encargo: commission.titulo || '',
      };

      const response = await axios.post(
        baseUrl,
        {
          amount: Number(monto),
          currency: "dzd",
          success_url: `${baseClientUrl}/mis-encargos?pago=exitoso`,
          failure_url: `${baseClientUrl}/mis-encargos?pago=fallido`,
          webhook_endpoint: webhookUrl,
          metadata: metadata
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transaction = new Transaction({
        checkout_id: response.data.id,
        user_id: userId,
        user_email: user.email,
        user_username: user.username,
        plan_id: 'commission',
        plan_name: `Adelanto encargo: ${commission.titulo}`,
        amount: Number(monto),
        currency: 'dzd',
        duration_months: 0,
        free_months: 0,
        discount_percent: 0,
        category: 'commission',
        cart_items: [],
        status: 'pending',
        chargily_response: response.data,
        metadata: metadata
      });

      await transaction.save();
      console.log('✅ Transacción de comisión registrada:', transaction._id);

      commission.pago = {
        idChargily: response.data.id,
        monto: monto,
        estadoPago: 'pendiente',
        fechaPago: new Date()
      };
      await commission.save();

      return res.json({
        success: true,
        checkout_url: response.data.checkout_url,
        transaction_id: transaction._id,
        mode: isLive ? 'live' : 'test'
      });

    } catch (err) {
      console.error('❌ Error en createCommissionCheckout:', err.message);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        return res.status(err.response.status).json({
          error: err.response.data.message || 'Erreur Chargily'
        });
      }
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = chargilyPlanCtrl;
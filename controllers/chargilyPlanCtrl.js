// controllers/chargilyPlanCtrl.js
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const Order = require('../models/orderModel');
const Video = require('../models/videoModel');

const chargilyPlanCtrl = {
  
  // ============================================
  // 1. CREAR CHECKOUT (PLAN O CARRITO)
  // ============================================
  createPlanCheckout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { plan_id, plan_name, amount, duration_months, discount_percent, free_months, category, cart_items } = req.body;
      
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
      
      const webhookUrl = `${baseClientUrl}/api/webhook`;  // ✅ URL pública del webhook
      
      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`💰 Monto: ${amount} DZD`);
      console.log(`📦 Plan: ${plan_id}`);
      console.log(`🌐 Webhook URL: ${webhookUrl}`);
      
      // Construir metadata
      let metadata = {
        type: plan_id === 'cart' ? 'cart_payment' : 'plan_subscription',
        user_id: userId.toString(),
        user_email: user.email || '',
        user_username: user.username || '',
        plan_id: plan_id,
        plan_name: plan_name || (plan_id === 'cart' ? 'Panier' : 'Plan')
      };
      
      if (plan_id === 'cart') {
        metadata.cart_items = cart_items || [];
        metadata.total_items = cart_items ? cart_items.length : 0;
      } else {
        metadata.duration_months = duration_months || 1;
        metadata.discount_percent = discount_percent || 0;
        metadata.free_months = free_months || 0;
        metadata.category = category || '';
      }
      
      // Llamar a Chargily
      const response = await axios.post(
        baseUrl,
        {
          amount: Number(amount),
          currency: "dzd",
          success_url: `${baseClientUrl}/payment-success`,
          failure_url: `${baseClientUrl}/payment-failure`,
          webhook_endpoint: webhookUrl,  // ← Enviamos la URL del webhook
          metadata: metadata
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Guardar transacción en BD
      const transaction = new Transaction({
        checkout_id: response.data.id,
        user_id: userId,
        user_email: user.email,
        user_username: user.username,
        plan_id: plan_id,
        plan_name: plan_name || (plan_id === 'cart' ? 'Panier' : 'Plan'),
        amount: Number(amount),
        currency: 'dzd',
        duration_months: plan_id === 'cart' ? 0 : (duration_months || 1),
        free_months: free_months || 0,
        discount_percent: discount_percent || 0,
        category: category || '',
        cart_items: cart_items || [],
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
  // 2. WEBHOOK - PROCESAR PAGO EXITOSO (CON LOGS MEJORADOS)
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
      
      // Verificar firma en LIVE
      if (isLive && signature) {
        const computedSignature = crypto
          .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
          .update(payload)
          .digest("hex");
        if (computedSignature !== signature) {
          console.warn('⚠️ Firma inválida!');
          console.warn('   Esperada:', computedSignature);
          console.warn('   Recibida:', signature);
          return res.status(403).json({ error: "Invalid signature" });
        }
        console.log('✅ Firma verificada correctamente');
      } else if (isLive && !signature) {
        console.warn('⚠️ No hay firma en modo LIVE!');
        // Aún así, seguimos procesando (pero deberías verificar)
      } else {
        console.log('🟡 Modo TEST - verificación de firma omitida');
      }
      
      const event = req.body;
      console.log('📨 Tipo de evento:', event.type);
      
      // Solo procesamos eventos de pago exitoso
      if (event.type === "checkout.paid") {
        const checkoutData = event.data;
        const metadata = checkoutData.metadata || {};
        const checkoutId = checkoutData.id;
        
        console.log(`🎉 PAGO CONFIRMADO: ${checkoutId}`);
        console.log(`👤 Usuario ID: ${metadata.user_id}`);
        console.log(`💰 Monto: ${checkoutData.amount} ${checkoutData.currency}`);
        console.log(`📦 Plan: ${metadata.plan_id}`);
        console.log(`📦 Items: ${metadata.cart_items ? metadata.cart_items.length : 0}`);
        
        // Buscar la transacción pendiente
        const transaction = await Transaction.findOne({ checkout_id: checkoutId });
        if (!transaction) {
          console.warn(`⚠️ Transacción NO encontrada para checkout_id: ${checkoutId}`);
          // Buscar por cualquier otro campo (por si acaso)
          const altTransaction = await Transaction.findOne({ 'chargily_response.id': checkoutId });
          if (altTransaction) {
            console.log(`✅ Encontrada por chargily_response.id: ${altTransaction._id}`);
            // Actualizar la transacción con el checkout_id
            altTransaction.checkout_id = checkoutId;
            await altTransaction.save();
            // Usar esta transacción
            return processPaidTransaction(altTransaction, checkoutData, metadata, res);
          }
          return res.json({ received: true, warning: 'Transaction not found' });
        }
        
        if (transaction.status === 'paid') {
          console.log('⏭️ Transacción ya procesada anteriormente');
          return res.json({ received: true });
        }
        
        // Procesar la transacción pagada
        return await processPaidTransaction(transaction, checkoutData, metadata, res);
        
      } else {
        console.log(`⏭️ Evento ignorado: ${event.type}`);
        return res.json({ received: true });
      }
      
    } catch (err) {
      console.error('❌ ERROR WEBHOOK:', err);
      console.error('❌ Stack:', err.stack);
      return res.status(500).json({ error: "Webhook error", details: err.message });
    }
  },
  
  // ============================================
  // 3. VERIFICAR ESTADO DEL PLAN
  // ============================================
  checkPlanStatus: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId)
        .select('channelPlan channelPlanExpiresAt isPro role username email');
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      const now = new Date();
      const isExpired = user.channelPlanExpiresAt && new Date(user.channelPlanExpiresAt) < now;
      
      if (isExpired && user.channelPlan !== 'free') {
        await User.findByIdAndUpdate(userId, {
          channelPlan: 'free',
          channelPlanExpiresAt: null,
          isPro: false,
          role: 'user'
        });
        user.channelPlan = 'free';
        user.role = 'user';
        user.isPro = false;
      }
      
      res.json({
        success: true,
        user: {
          channelPlan: user.channelPlan,
          role: user.role,
          expiresAt: user.channelPlanExpiresAt,
          isExpired: isExpired,
          isPro: user.isPro,
          email: user.email
        }
      });
    } catch (err) {
      console.error('❌ Error checkPlanStatus:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // ============================================
  // 4. HISTORIAL DE TRANSACCIONES DEL USUARIO
  // ============================================
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const transactions = await Transaction.find({ user_id: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Transaction.countDocuments({ user_id: userId });
      
      res.json({
        success: true,
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('❌ Error getUserTransactions:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

// ============================================
// FUNCIÓN AUXILIAR: Procesar transacción pagada
// ============================================
async function processPaidTransaction(transaction, checkoutData, metadata, res) {
  try {
    // Marcar como pagado
    transaction.status = 'paid';
    transaction.payment_completed_at = new Date();
    transaction.chargily_payment_id = checkoutData.payment_intent || checkoutData.id;
    transaction.webhook_received = checkoutData;
    await transaction.save();
    console.log('✅ Transacción actualizada a PAID');
    
    // ============================================
    // 🛒 PROCESAR SEGÚN TIPO DE PAGO
    // ============================================
    if (metadata.plan_id === 'cart') {
      // ---------- PAGO DE CARRITO ----------
      console.log('🛒 Procesando pago de carrito...');
      
      // Usar los items guardados en la transacción o en metadata
      let cartItems = transaction.cart_items || [];
      if (cartItems.length === 0 && metadata.cart_items) {
        cartItems = metadata.cart_items;
        console.log('📦 Usando items de metadata');
      }
      
      if (cartItems.length === 0) {
        console.warn('⚠️ No hay items en el carrito para esta transacción');
        return res.json({ received: true, warning: 'No cart items' });
      }
      
      console.log(`📦 Items del carrito: ${cartItems.length}`);
      
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
      console.log(`✅ ORDEN CREADA: ${order.orderId} para usuario ${transaction.user_id}`);
      
      // ----- ACTUALIZAR STOCK DE VIDEOS -----
      for (const item of cartItems) {
        try {
          const video = await Video.findById(item.videoId);
          if (video) {
            // Reducir stock
            if (video.stock !== undefined && video.stock !== null) {
              video.stock = Math.max(0, video.stock - (item.quantity || 1));
            }
            // Si stock llega a 0, cambiar estado a 'vendue'
            if (video.stock <= 0) {
              video.status = 'vendue';
            }
            await video.save();
            console.log(`📦 Video "${video.title}" actualizado: stock=${video.stock}, status=${video.status}`);
          } else {
            console.warn(`⚠️ Video no encontrado: ${item.videoId}`);
          }
        } catch (err) {
          console.error(`❌ Error actualizando video ${item.videoId}:`, err.message);
        }
      }
      
      console.log('✅ Procesamiento de carrito completado');
      return res.json({ received: true, orderCreated: true });
      
    } else {
      // ---------- PAGO DE PLAN (Suscripción) ----------
      console.log('📦 Procesando pago de plan...');
      
      const totalMonths = (metadata.duration_months || 1) + (metadata.free_months || 0);
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + totalMonths);
      
      transaction.plan_expires_at = expiresAt;
      await transaction.save();
      
      const updatedUser = await User.findByIdAndUpdate(
        transaction.user_id,
        {
          channelPlan: metadata.plan_id,
          channelPlanExpiresAt: expiresAt,
          channelPlanAutoRenew: false,
          isPro: metadata.plan_id !== 'basic',
          role: 'userpro'
        },
        { new: true }
      );
      
      console.log(`✅ Usuario actualizado: ${updatedUser.username} → ${updatedUser.channelPlan}`);
      console.log(`📅 Expira: ${expiresAt.toISOString()}`);
      return res.json({ received: true, userUpdated: true });
    }
    
  } catch (err) {
    console.error('❌ Error procesando transacción pagada:', err);
    // No devolvemos error para que Chargily no reintente
    return res.status(500).json({ error: "Error processing transaction" });
  }
}

module.exports = chargilyPlanCtrl;
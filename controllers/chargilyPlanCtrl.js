// controllers/chargilyPlanCtrl.js
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

const chargilyPlanCtrl = {
  
  // Crear checkout para suscripción o carrito
  createPlanCheckout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { 
        plan_id, plan_name, amount, duration_months, discount_percent, free_months, 
        category, cart_items 
      } = req.body;
      
      // Validaciones básicas
      if (!plan_id || !amount) {
        return res.status(400).json({ error: 'Plan et montant requis' });
      }
      
      // Si es carrito, debe tener items
      if (plan_id === 'cart' && (!cart_items || cart_items.length === 0)) {
        return res.status(400).json({ error: 'Panier vide' });
      }
      
      const user = await User.findById(userId).select('email username');
      
      // Configuración de Chargily
      const isLive = process.env.CHARGILY_MODE === 'live';
      const baseUrl = isLive 
        ? 'https://pay.chargily.net/api/v2/checkouts'
        : 'https://pay.chargily.net/test/api/v2/checkouts';
      
      const baseClientUrl = process.env.CLIENT_URL || (isLive 
        ? 'https://artdjamel.onrender.com' 
        : 'http://localhost:3000');
      
      const webhookUrl = process.env.WEBHOOK_URL 
        ? `${process.env.WEBHOOK_URL}/api/webhook`
        : `${baseClientUrl}/api/webhook`;
      
      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`📦 Plan: ${plan_id} - ${plan_name || ''}`);
      console.log(`💰 Monto: ${amount} DZD`);
      
      // Construir metadata
      const metadata = {
        type: plan_id === 'cart' ? 'cart_purchase' : 'plan_subscription',
        user_id: userId.toString(),
        user_email: user.email || '',
        user_username: user.username || '',
        plan_id: plan_id,
        plan_name: plan_name || '',
        platform: "video_marketplace"
      };
      
      // Si es suscripción, añadir datos de duración
      if (plan_id !== 'cart') {
        metadata.duration_months = duration_months || 1;
        metadata.discount_percent = discount_percent || 0;
        metadata.free_months = free_months || 0;
        metadata.category = category || '';
      } else {
        // Si es carrito, guardar los items en metadata (opcional)
        metadata.cart_items = cart_items.map(item => ({
          videoId: item.videoId,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }));
        // También podemos guardar el total de items
        metadata.total_items = cart_items.reduce((sum, item) => sum + item.quantity, 0);
      }
      
      // Llamar a Chargily
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
      
      // Guardar transacción en BD
      const transactionData = {
        checkout_id: response.data.id,
        user_id: userId,
        user_email: user.email,
        user_username: user.username,
        plan_id: plan_id,
        plan_name: plan_name || '',
        amount: Number(amount),
        currency: 'dzd',
        status: 'pending',
        chargily_response: response.data,
        created_at: new Date()
      };
      
      // Si es suscripción, añadir campos de duración
      if (plan_id !== 'cart') {
        transactionData.duration_months = duration_months || 1;
        transactionData.free_months = free_months || 0;
        transactionData.discount_percent = discount_percent || 0;
        transactionData.category = category || '';
      } else {
        // Si es carrito, guardar los items
        transactionData.cart_items = cart_items || [];
      }
      
      const transaction = new Transaction(transactionData);
      await transaction.save();
      
      console.log('✅ Transacción registrada en BD:', transaction._id);
      
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
  
  // Webhook para procesar pagos exitosos
  handlePlanWebhook: async (req, res) => {
    try {
      console.log('\n🔔 ===== WEBHOOK RECIBIDO =====');
      console.log('📅 Hora:', new Date().toISOString());
      
      const signature = req.headers["signature"];
      const payload = JSON.stringify(req.body);
      const isLive = process.env.CHARGILY_MODE === 'live';
      
      // Verificar firma en modo LIVE
      if (isLive) {
        if (!signature) {
          console.warn('⚠️ No signature provided - REJECTED');
          return res.status(403).json({ error: "Missing signature" });
        }
        const computedSignature = crypto
          .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
          .update(payload)
          .digest("hex");
        if (computedSignature !== signature) {
          console.warn('⚠️ Invalid signature - REJECTED');
          return res.status(403).json({ error: "Invalid signature" });
        }
        console.log('✅ Firma verificada correctamente');
      } else {
        console.log('🟡 Modo TEST - Verificación de firma omitida');
      }
      
      const event = req.body;
      console.log('📨 Tipo de evento:', event.type);
      
      if (event.type === "checkout.paid") {
        const checkoutData = event.data;
        const metadata = checkoutData.metadata;
        const checkoutId = checkoutData.id;
        
        console.log(`🎉 PAGO CONFIRMADO: ${checkoutId}`);
        console.log('👤 User ID:', metadata.user_id);
        console.log('📦 Plan:', metadata.plan_id);
        console.log('💰 Monto:', checkoutData.amount, checkoutData.currency);
        
        // Buscar transacción pendiente
        const transaction = await Transaction.findOne({ checkout_id: checkoutId });
        if (!transaction) {
          console.warn(`⚠️ Transacción no encontrada: ${checkoutId}`);
          return res.json({ received: true, warning: 'Transaction not found' });
        }
        if (transaction.status === 'paid') {
          console.log('⏭️ Transacción ya procesada anteriormente');
          return res.json({ received: true });
        }
        
        // Actualizar transacción
        transaction.status = 'paid';
        transaction.payment_completed_at = new Date();
        transaction.chargily_payment_id = checkoutData.payment_intent || checkoutData.id;
        transaction.webhook_received = event;
        
        // Si es suscripción, calcular expiración
        if (metadata.plan_id !== 'cart') {
          const totalMonths = (parseInt(metadata.duration_months) || 1) + (parseInt(metadata.free_months) || 0);
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + totalMonths);
          transaction.plan_expires_at = expiresAt;
          
          // Actualizar usuario con el plan
          const updatedUser = await User.findByIdAndUpdate(
            transaction.user_id,
            {
              channelPlan: metadata.plan_id,
              channelPlanExpiresAt: expiresAt,
              channelPlanAutoRenew: false,
              isPro: metadata.plan_id !== 'basic',
              role: metadata.plan_id === 'basic' ? 'user' : 'userpro'
            },
            { new: true }
          ).select('username email channelPlan role isPro channelPlanExpiresAt');
          
          console.log('✅ USUARIO ACTUALIZADO CON PLAN:');
          console.log('   ID:', transaction.user_id);
          console.log('   Nombre:', updatedUser.username);
          console.log('   Plan:', updatedUser.channelPlan);
          console.log('   Expira:', expiresAt.toISOString());
        } else {
          // Si es carrito: aquí debes implementar la lógica de confirmación de pedido
          // Por ejemplo, crear órdenes de compra, marcar productos como pagados, etc.
          console.log('🛒 PAGO DE CARRITO CONFIRMADO');
          console.log('   Items:', transaction.cart_items || metadata.cart_items);
          
          
          // Puedes llamar a un servicio de pedidos aquí.
        }
        
        await transaction.save();
        console.log('✅ Transacción actualizada a PAID');
      }
      
      console.log('===== FIN WEBHOOK =====\n');
      return res.json({ received: true });
      
    } catch (err) {
      console.error('❌ ERROR WEBHOOK:', err);
      return res.status(500).json({ error: "Webhook error" });
    }
  },
  
  // Verificar estado del plan del usuario
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
        console.log(`⏰ Plan expiré pour ${user.username}, dégradation à free`);
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

  // Historial de transacciones
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

module.exports = chargilyPlanCtrl;
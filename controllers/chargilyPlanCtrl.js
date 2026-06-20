// controllers/chargilyPlanCtrl.js
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel'); // ← Usamos el modelo correcto

const chargilyPlanCtrl = {
  
  // Crear checkout (para planes O para carrito)
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
        ? 'https://videocommerce.onrender.com' 
        : 'http://localhost:3000');
      
      const webhookUrl = process.env.WEBHOOK_URL 
        ? `${process.env.WEBHOOK_URL}/api/webhook`
        : `${baseClientUrl}/api/webhook`;
      
      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`💰 Monto: ${amount} DZD`);
      console.log(`📦 Plan: ${plan_id}`);
      
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
  
  // Webhook
  handlePlanWebhook: async (req, res) => {
    try {
      console.log('\n🔔 ===== WEBHOOK RECIBIDO =====');
      
      const signature = req.headers["signature"];
      const payload = JSON.stringify(req.body);
      const isLive = process.env.CHARGILY_MODE === 'live';
      
      if (isLive) {
        if (!signature) {
          return res.status(403).json({ error: "Missing signature" });
        }
        const computedSignature = crypto
          .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
          .update(payload)
          .digest("hex");
        if (computedSignature !== signature) {
          return res.status(403).json({ error: "Invalid signature" });
        }
        console.log('✅ Firma verificada');
      } else {
        console.log('🟡 Modo TEST - firma omitida');
      }
      
      const event = req.body;
      console.log('📨 Tipo:', event.type);
      
      if (event.type === "checkout.paid") {
        const checkoutData = event.data;
        const metadata = checkoutData.metadata;
        const checkoutId = checkoutData.id;
        
        console.log(`🎉 PAGO CONFIRMADO: ${checkoutId}`);
        
        // Buscar transacción
        const transaction = await Transaction.findOne({ checkout_id: checkoutId });
        if (!transaction) {
          console.warn(`⚠️ Transacción no encontrada: ${checkoutId}`);
          return res.json({ received: true, warning: 'Transaction not found' });
        }
        
        if (transaction.status === 'paid') {
          console.log('⏭️ Ya procesado');
          return res.json({ received: true });
        }
        
        // Marcar como pagado
        transaction.status = 'paid';
        transaction.payment_completed_at = new Date();
        transaction.chargily_payment_id = checkoutData.payment_intent || checkoutData.id;
        transaction.webhook_received = event;
        await transaction.save();
        console.log('✅ Transacción actualizada a PAID');
        
        // ===== PROCESAR SEGÚN TIPO =====
        if (metadata.plan_id === 'cart') {
          // 🛒 PAGO DE CARRITO
          console.log('🛒 Procesando pago de carrito...');
          console.log('📦 Items:', transaction.cart_items);
          
          // Aquí debes implementar la lógica de tu negocio:
          // 1. Crear órdenes de compra
          // 2. Marcar videos como vendidos (actualizar stock)
          // 3. Vaciar el carrito del usuario
          // 4. Enviar email de confirmación, etc.
          
          // Ejemplo: actualizar stock de cada video
          // const Video = require('../models/Video');
          // for (const item of transaction.cart_items) {
          //   await Video.findByIdAndUpdate(item.videoId, { $inc: { stock: -item.quantity } });
          // }
          
          // También puedes notificar al usuario por socket
          
        } else {
          // 📦 PAGO DE PLAN
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
          
          console.log('✅ Usuario actualizado:', updatedUser.username, '→', updatedUser.channelPlan);
        }
      }
      
      return res.json({ received: true });
      
    } catch (err) {
      console.error('❌ ERROR WEBHOOK:', err);
      return res.status(500).json({ error: "Webhook error" });
    }
  },
  
  // Verificar estado del plan
  checkPlanStatus: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId)
        .select('channelPlan channelPlanExpiresAt isPro role username email');
      
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      
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
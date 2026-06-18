const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

const chargilyPlanCtrl = {
  
  // Crear checkout para suscripción de plan
  createPlanCheckout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { plan_id, plan_name, amount, duration_months, discount_percent, free_months, category } = req.body;
      
      if (!plan_id || !amount) {
        return res.status(400).json({ error: 'Plan et montant requis' });
      }
      
      const user = await User.findById(userId).select('email username');
      
      // 🔥 CONFIGURACIÓN DINÁMICA SEGÚN MODO
      const isLive = process.env.CHARGILY_MODE === 'live';
      
      // URL Base correcta según el modo
      const baseUrl = isLive 
        ? 'https://pay.chargily.net/api/v2/checkouts'      // LIVE: sin /test/
        : 'https://pay.chargily.net/test/api/v2/checkouts'; // TEST: con /test/
      
      // URLs del cliente (frontend)
      const baseClientUrl = process.env.CLIENT_URL || (isLive 
        ? 'https://videocommerce.onrender.com' 
        : 'http://localhost:3000');
      
      // URL del webhook (debe ser pública)
      const webhookUrl = process.env.WEBHOOK_URL 
        ? `${process.env.WEBHOOK_URL}/api/webhook`
        : `${baseClientUrl}/api/webhook`;
      
      console.log(`🎯 Modo: ${isLive ? '🔴 LIVE (dinero real)' : '🟡 TEST (simulación)'}`);
      console.log(`🌐 API URL: ${baseUrl}`);
      console.log(`📡 Webhook URL: ${webhookUrl}`);
      console.log(`💰 Monto: ${amount} DZD`);
      console.log(`👤 Usuario: ${user.email}`);
      
      const response = await axios.post(
        baseUrl,  // ← Ahora usa la variable dinámica
        {
          amount: Number(amount),
          currency: "dzd",
          success_url: `${baseClientUrl}/payment-success`,
          failure_url: `${baseClientUrl}/payment-failure`,
          webhook_endpoint: webhookUrl,
          metadata: {
            type: "plan_subscription",
            user_id: userId.toString(),
            user_email: user.email || '',
            user_username: user.username || '',
            plan_id: plan_id,
            plan_name: plan_name,
            duration_months: duration_months || 1,
            discount_percent: discount_percent || 0,
            free_months: free_months || 0,
            category: category || '',
            platform: "video_marketplace"
          }
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
        plan_name: plan_name,
        duration_months: duration_months || 1,
        free_months: free_months || 0,
        discount_percent: discount_percent || 0,
        category: category || '',
        amount: Number(amount),
        currency: 'dzd',
        status: 'pending',
        checkout_created_at: new Date(),
        chargily_response: response.data
      });
      
      await transaction.save();
      console.log('✅ Transacción registrada en BD:', transaction._id);
      
      // Devolver la URL de checkout al frontend
      return res.json({
        success: true,
        checkout_url: response.data.checkout_url,  // ← Importante para redirigir
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
      
      // 🔐 VERIFICACIÓN DE FIRMA - OBLIGATORIA EN LIVE
      if (isLive) {
        console.log('🔐 Modo LIVE - Verificando firma...');
        
        if (!signature) {
          console.warn('⚠️ No signature provided - REJECTED');
          return res.status(403).json({ error: "Missing signature" });
        }
        
        const computedSignature = crypto
          .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
          .update(payload)
          .digest("hex");
        
        console.log('🔐 Firma esperada:', computedSignature);
        console.log('🔐 Firma recibida:', signature);
        
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
        
        // Calcular fecha de expiración del plan
        const totalMonths = (metadata.duration_months || 1) + (metadata.free_months || 0);
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + totalMonths);
        
        // Actualizar transacción
        transaction.status = 'paid';
        transaction.payment_completed_at = new Date();
        transaction.plan_expires_at = expiresAt;
        transaction.webhook_received = event;
        transaction.chargily_payment_id = checkoutData.payment_intent || checkoutData.id;
        await transaction.save();
        console.log('✅ Transacción actualizada a PAID');
        
        // ✅ ACTUALIZAR USUARIO (liberar el producto/plan)
        const updatedUser = await User.findByIdAndUpdate(
          transaction.user_id,
          {
            channelPlan: transaction.plan_id,
            channelPlanExpiresAt: expiresAt,
            channelPlanAutoRenew: false,
            isPro: transaction.plan_id !== 'basic',
            role: 'userpro'
          },
          { new: true }
        ).select('username email channelPlan role isPro channelPlanExpiresAt');
        
        console.log('✅ USUARIO ACTUALIZADO:');
        console.log('   ID:', transaction.user_id);
        console.log('   Nombre:', updatedUser.username);
        console.log('   Plan:', updatedUser.channelPlan);
        console.log('   Role:', updatedUser.role);
        console.log('   isPro:', updatedUser.isPro);
        console.log('   Expira:', expiresAt.toISOString());
        
        // Aquí puedes agregar lógica adicional:
        // - Enviar email de confirmación
        // - Registrar en sistema de facturación
        // - Actualizar cache, etc.
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
      
      // Si el plan expiró, degradar a free
      if (isExpired && user.channelPlan !== 'free') {
        console.log(`⏰ Plan expirado para usuario ${user.username}, degradando a free`);
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

  // Historial de transacciones del usuario
  getUserTransactions: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const transactions = await Transaction.find({ user_id: userId })
        .sort({ createdAt: -1 })
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
// controllers/orderCtrl.js (extendido)
const Order = require('../models/orderModel');
const Video = require('../models/videoModel');
const Transaction = require('../models/transactionModel');
const paymentService = require('../services/payementService');

const orderCtrl = {
// controllers/orderCtrl.js (fragmento de createOrderAndCheckout)

// controllers/orderCtrl.js - createOrderAndCheckout (VERSIÓN CORREGIDA)

createOrderAndCheckout: async (req, res) => {
  try {
    const userId = req.user._id;
    const { cart_items, totalAmount, amount } = req.body;

    // ✅ Aceptar 'amount' o 'totalAmount'
    let finalTotal = totalAmount || amount;

    // 1️⃣ VALIDACIONES INICIALES
    if (!cart_items || cart_items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide' });
    }

    if (finalTotal === undefined || finalTotal === null || isNaN(finalTotal) || finalTotal <= 0) {
      console.error('❌ totalAmount inválido:', finalTotal);
      console.error('📦 req.body:', req.body);
      return res.status(400).json({ error: 'Le montant total est invalide' });
    }

    finalTotal = Number(finalTotal);
    console.log(`💰 totalAmount recibido: ${finalTotal} DZD`);
    console.log(`📦 Items: ${cart_items.length}`);

    // 2️⃣ VALIDAR DISPONIBILIDAD Y RESERVAR
    for (const item of cart_items) {
      const video = await Video.findById(item.videoId);
      if (!video) {
        return res.status(400).json({ error: `Obra no encontrada: ${item.title}` });
      }
      if (video.stock <= 0) {
        return res.status(400).json({ error: `"${video.title}" ya no está disponible` });
      }
      if (video.reservedBy && video.reservedBy.toString() !== userId.toString()) {
        return res.status(409).json({ error: `"${video.title}" está siendo reservada por otro usuario` });
      }
    }

    // 3️⃣ RESERVAR OBRAS
    for (const item of cart_items) {
      await Video.findByIdAndUpdate(item.videoId, {
        reservedBy: userId,
        reservedAt: new Date()
      });
    }

    // 4️⃣ CREAR ORDEN
    const orderId = `ORD-${Date.now()}`;
    const newOrder = new Order({
      orderId: orderId,
      userId: userId,
      userEmail: req.user.email,
      userName: req.user.username,
      items: cart_items.map(item => ({
        videoId: item.videoId,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        thumbnail: item.thumbnail || ''
      })),
      totalAmount: finalTotal,
      currency: 'dzd',
      paymentMethod: 'chargily',
      status: 'pending',
      createdAt: new Date()
    });
    await newOrder.save();
    console.log(`✅ Orden creada: ${newOrder._id}`);

    // 5️⃣ CREAR CHECKOUT EN CHARGILY (obtiene URL + ID real)
    let checkoutResult;
    try {
      checkoutResult = await paymentService.createCheckout(
        newOrder,
        req.user.email,
        cart_items,
        { plan_id: 'cart', user_id: userId }
      );
    } catch (chargilyError) {
      console.error('❌ Error al crear checkout en Chargily:', chargilyError.message);
      // Liberar reservas y eliminar orden huérfana
      for (const item of cart_items) {
        await Video.findByIdAndUpdate(item.videoId, { reservedBy: null, reservedAt: null });
      }
      await Order.findByIdAndDelete(newOrder._id);
      return res.status(502).json({
        error: 'No se pudo generar el enlace de pago. Intenta de nuevo más tarde.',
        details: chargilyError.message
      });
    }

    const checkoutUrl = checkoutResult.checkout_url;
    const checkoutId = checkoutResult.checkout_id; // ✅ ID real (ej: 01kv...)

    // 6️⃣ CREAR TRANSACCIÓN
    const transaction = new Transaction({
      checkout_id: checkoutId,   // ✅ Ya no será "pay"
      user_id: userId,
      user_email: req.user.email,
      user_username: req.user.username,
      plan_id: 'cart',
      plan_name: 'Panier d\'achat',
      cart_items: cart_items,
      amount: finalTotal,
      currency: 'dzd',
      status: 'pending'
    });
    await transaction.save();
    console.log(`✅ Transacción creada: ${transaction._id}`);

    // 7️⃣ RESPONDER AL FRONTEND
    res.status(201).json({
      success: true,
      checkout_url: checkoutUrl,
      orderId: newOrder._id,
      transactionId: transaction._id
    });

  } catch (error) {
    console.error('❌ Error en createOrderAndCheckout:', error);
    // Liberar reservas en caso de error general
    if (req.body.cart_items) {
      for (const item of req.body.cart_items) {
        await Video.findByIdAndUpdate(item.videoId, { reservedBy: null, reservedAt: null });
      }
    }
    res.status(500).json({ error: error.message || 'Error al procesar la orden' });
  }
},


  getUserOrders: async (req, res) => {
    try {
      // 1️⃣ Verificar usuario autenticado
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }
  
      const userId = req.user._id;
      console.log('🔍 getUserOrders para usuario:', userId);
  
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // 2️⃣ Consultar órdenes (sin populate para evitar errores)
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  
      const total = await Order.countDocuments({ userId });
  
      // 3️⃣ Siempre devolver 200 (incluso con array vacío)
      res.json({
        success: true,
        orders: orders || [],
        pagination: {
          total: total || 0,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)) || 1
        }
      });
  
    } catch (err) {
      console.error('❌ Error getUserOrders:', err);
      
      // 🛡️ Capturar errores de Cast específicamente
      if (err.name === 'CastError') {
        return res.status(400).json({ 
          error: 'ID de usuario inválido. Por favor, cierra sesión y vuelve a iniciar.' 
        });
      }
  
      res.status(500).json({ error: err.message });
    }
   
  },
    // ============================================
    // 3️⃣ OBTENER TODAS LAS ÓRDENES (para admin)
    // ============================================
    getAllOrders: async (req, res) => {
      try {
        // Verificar que el usuario sea admin
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
          return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }
  
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;
        
        const filter = {};
        if (status) filter.status = status;
        if (startDate && endDate) {
          filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(filter)
          .populate('userId', 'username email') // Poblar datos del usuario
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        
        const total = await Order.countDocuments(filter);
        
        // Calcular estadísticas (opcional)
        const totalAmount = await Order.aggregate([
          { $match: filter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        res.json({
          success: true,
          orders,
          stats: {
            totalOrders: total,
            totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0
          },
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
          }
        });
      } catch (err) {
        console.error('❌ Error getAllOrders:', err);
        res.status(500).json({ error: err.message });
      }
    },
  
    // ============================================
    // 4️⃣ OBTENER DETALLE DE UNA ORDEN
    // ============================================
    getOrderById: async (req, res) => {
      try {
        const { orderId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
        
        const order = await Order.findOne({ orderId })
          .populate('userId', 'username email fullname avatar');
        
        if (!order) {
          return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        // Verificar que el usuario sea el propietario o admin
        if (order.userId._id.toString() !== userId.toString() && !isAdmin) {
          return res.status(403).json({ error: 'Accès non autorisé' });
        }
        
        res.json({ success: true, order });
      } catch (err) {
        console.error('❌ Error getOrderById:', err);
        res.status(500).json({ error: err.message });
      }
    },
  
    // ============================================
    // 5️⃣ ACTUALIZAR ESTADO DE ORDEN (admin)
    // ============================================
    updateOrderStatus: async (req, res) => {
      try {
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
          return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }
        
        const { orderId } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
          return res.status(400).json({ error: 'Statut invalide' });
        }
        
        const order = await Order.findOneAndUpdate(
          { orderId },
          { status, updatedAt: new Date() },
          { new: true }
        );
        
        if (!order) {
          return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        res.json({ success: true, order });
      } catch (err) {
        console.error('❌ Error updateOrderStatus:', err);
        res.status(500).json({ error: err.message });
      }
    },
  // ============================================
  // 8️⃣ CANCELAR UNA ORDEN (usuario o admin)
  // ============================================
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
  
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
  
      const isOwner = order.userId.toString() === userId.toString();
      const isAdmin = userRole === 'admin';
  
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à annuler cette commande' });
      }
  
      // No se puede cancelar si ya está entregada o reembolsada
      if (['delivered', 'refunded'].includes(order.status)) {
        return res.status(400).json({ error: 'Cette commande ne peut pas être annulée' });
      }
  
      // Si ya está cancelada, no hacer nada
      if (order.status === 'cancelled') {
        return res.json({ message: 'Commande déjà annulée', order });
      }
  
      // Cambiar estado a cancelled
      order.status = 'cancelled';
      order.updatedAt = new Date();
      await order.save();
  
      // Restaurar stock de los videos
      for (const item of order.items) {
        try {
          const video = await Video.findById(item.videoId);
          if (video) {
            video.stock += item.quantity;
            if (video.status === 'vendue' && video.stock > 0) {
              video.status = 'en vente';
            }
            await video.save();
          }
        } catch (err) {
          console.error('❌ Error restaurando stock:', err.message);
        }
      }
  
      res.json({ success: true, order });
    } catch (err) {
      console.error('❌ Error cancelOrder:', err);
      res.status(500).json({ error: err.message });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      // ✅ Verificar autenticación
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }
  
      const { orderId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
  
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
  
      const isAdmin = userRole === 'admin' || userRole === 'moderator';
      const isOwner = order.userId.toString() === userId.toString();
  
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
  
      if (!isAdmin && order.status !== 'pending' && order.status !== 'cancelled') {
        return res.status(400).json({ error: 'Vous ne pouvez supprimer que les commandes en attente ou annulées' });
      }
  
      await Order.findOneAndDelete({ orderId });
      res.json({ success: true, message: 'Commande supprimée avec succès' });
    } catch (err) {
      console.error('❌ Error deleteOrder:', err);
      res.status(500).json({ error: err.message });
    }
  },
    getSalesStats: async (req, res) => {
      try {
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
          return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
        }
        
        // Ventas por día (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyStats = await Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'paid' } },
          { $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
              total: { $sum: '$totalAmount' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        
        // Top productos vendidos
        const topProducts = await Order.aggregate([
          { $match: { status: 'paid' } },
          { $unwind: '$items' },
          { $group: {
              _id: '$items.videoId',
              title: { $first: '$items.title' },
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 10 }
        ]);
        
        res.json({
          success: true,
          dailyStats,
          topProducts
        });
      } catch (err) {
        console.error('❌ Error getSalesStats:', err);
        res.status(500).json({ error: err.message });
      }
    },

// controllers/videoCtrl.js
   

  };

module.exports = orderCtrl;
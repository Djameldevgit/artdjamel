const Order = require('../models/orderModel');
const Video = require('../models/videoModel'); // Asegúrate de tener el modelo de Video

const orderCtrl = {

  // ============================================
  // 1️⃣ CREAR ORDEN (usado por el webhook)
  // ============================================
  createOrderFromCheckout: async (checkoutData, metadata, transaction) => {
    try {
      const { user_id, cart_items, plan_id } = metadata;
      
      // Solo si es un pago de carrito
      if (plan_id !== 'cart') {
        console.log('⏭️ No es pago de carrito, omitiendo creación de orden.');
        return null;
      }

      // Construir items de la orden
      const items = cart_items.map(item => ({
        videoId: item.videoId,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        thumbnail: item.thumbnail || ''
      }));

      // Calcular total (ya viene en transaction.amount, pero lo recalculamos)
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Crear la orden
      const order = new Order({
        orderId: checkoutData.id, // Usamos el checkout_id de Chargily
        userId: user_id,
        userEmail: transaction.user_email,
        userName: transaction.user_username,
        items: items,
        totalAmount: totalAmount,
        currency: 'dzd',
        paymentMethod: 'chargily',
        paymentId: checkoutData.payment_intent || checkoutData.id,
        checkoutId: checkoutData.id,
        status: 'paid',
        paidAt: new Date()
      });

      await order.save();
      console.log(`✅ Orden creada: ${order.orderId} para usuario ${user_id}`);

      // 🔥 ACTUALIZAR STOCK DE VIDEOS (marcar como vendidos)
      for (const item of items) {
        const video = await Video.findById(item.videoId);
        if (video) {
          // Reducir stock
          if (video.stock !== undefined) {
            video.stock = Math.max(0, video.stock - item.quantity);
          }
          // Si stock llega a 0, cambiar estado a 'vendue'
          if (video.stock <= 0) {
            video.status = 'vendue';
          }
          await video.save();
          console.log(`📦 Video ${video.title} actualizado: stock=${video.stock}, status=${video.status}`);
        }
      }

      return order;

    } catch (error) {
      console.error('❌ Error creando orden desde webhook:', error);
      return null;
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
      const { orderId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
  
      // Buscar la orden
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
  
      // Verificar permisos: admin o propietario
      const isAdmin = userRole === 'admin' || userRole === 'moderator';
      const isOwner = order.userId.toString() === userId.toString();
  
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
  
      // Opcional: solo permitir eliminar si estado es 'pending' o 'cancelled' (para usuarios)
      if (!isAdmin && order.status !== 'pending' && order.status !== 'cancelled') {
        return res.status(400).json({ error: 'Vous ne pouvez supprimer que les commandes en attente ou annulées' });
      }
  
      // Eliminar la orden
      await Order.findOneAndDelete({ orderId });
  
      // Opcional: restaurar stock de los videos (si es necesario)
      // Aquí podrías recorrer order.items y aumentar stock
  
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
  }
};

module.exports = orderCtrl;
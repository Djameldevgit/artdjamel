const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderCtrl = require('../controllers/orderCtrl');

// Todas las rutas requieren autenticación
router.use(auth);

// ✅ Obtener órdenes del usuario autenticado
router.get('/my-orders', orderCtrl.getUserOrders);

// ✅ Obtener todas las órdenes (solo admin)
router.get('/admin/orders', orderCtrl.getAllOrders);

// ✅ Obtener detalle de una orden
router.get('/order/:orderId', orderCtrl.getOrderById);

// ✅ Actualizar estado de una orden (admin)
router.put('/order/:orderId/status', orderCtrl.updateOrderStatus);

// ✅ Estadísticas de ventas (admin)
router.get('/admin/sales-stats', orderCtrl.getSalesStats);

module.exports = router;
// routes/orderRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const orderCtrl = require('../controllers/orderCtrl');
const transactionCtrl = require('../controllers/transactionCtrl');

// 🔥 NUEVA RUTA: Crear orden y checkout
router.post('/create-order-and-checkout', auth, orderCtrl.createOrderAndCheckout);

// Webhook (público)
router.post('/webhook', transactionCtrl.handleWebhook);

// Rutas existentes
router.get('/orders/me', auth, orderCtrl.getUserOrders);
router.get('/admin/orders', auth, orderCtrl.getAllOrders);
router.get('/my-orders', orderCtrl.getUserOrders);

// ✅ Obtener todas las órdenes (solo admin)
router.get('/admin/orders', orderCtrl.getAllOrders);

// ✅ Obtener detalle de una orden
router.get('/order/:orderId', orderCtrl.getOrderById);

// ✅ Actualizar estado de una orden (admin)
router.put('/order/:orderId/status', orderCtrl.updateOrderStatus);

// ✅ Estadísticas de ventas (admin)
router.get('/admin/sales-stats', orderCtrl.getSalesStats);
// ✅ Cancelar una orden (usuario o admin)
router.put('/order/:orderId/cancel', auth, orderCtrl.cancelOrder);
router.delete('/order/:orderId', orderCtrl.deleteOrder);

module.exports = router;
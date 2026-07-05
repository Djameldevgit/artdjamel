// routes/chargilyPlanRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chargilyPlanCtrl = require('../controllers/chargilyPlanCtrl');

// Rutas existentes
router.post('/create-checkout', auth, chargilyPlanCtrl.createPlanCheckout);
router.post('/webhook', chargilyPlanCtrl.handlePlanWebhook);
 
router.post('/sync-pending-orders', auth, chargilyPlanCtrl.syncPendingOrders);
// Liberar reservas expiradas (puede llamarse desde un cron job o manualmente)
 
// 🆕 Ruta para pago de comisión
router.post('/create-commission-payment', auth, chargilyPlanCtrl.createCommissionCheckout);

module.exports = router;
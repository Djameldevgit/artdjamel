// routes/chargilyPlanRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chargilyPlanCtrl = require('../controllers/chargilyPlanCtrl');

// ✅ Ruta para crear checkout
router.post('/create-checkout', auth, chargilyPlanCtrl.createPlanCheckout);

// ✅ Webhook (NO requiere auth - Chargily lo llama)
router.post('/webhook', chargilyPlanCtrl.handlePlanWebhook);

// ✅ Verificar estado del plan
router.get('/check-plan-status', auth, chargilyPlanCtrl.checkPlanStatus);

// ✅ Historial de transacciones
router.get('/user-transactions', auth, chargilyPlanCtrl.getUserTransactions);

// 🆕🆕🆕 RUTA DE SINCRONIZACIÓN (solo admin)
router.post('/sync-pending-orders', auth, chargilyPlanCtrl.syncPendingOrders);

module.exports = router;
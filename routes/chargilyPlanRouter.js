// routes/chargilyPlanRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chargilyPlanCtrl = require('../controllers/chargilyPlanCtrl');

// Rutas existentes
router.post('/create-checkout', auth, chargilyPlanCtrl.createPlanCheckout);
router.post('/webhook', chargilyPlanCtrl.handlePlanWebhook);
router.get('/check-plan-status', auth, chargilyPlanCtrl.checkPlanStatus);
router.get('/user-transactions', auth, chargilyPlanCtrl.getUserTransactions);
router.post('/sync-pending-orders', auth, chargilyPlanCtrl.syncPendingOrders);

// 🆕 Ruta para pago de comisión
router.post('/create-commission-payment', auth, chargilyPlanCtrl.createCommissionCheckout);

module.exports = router;
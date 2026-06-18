// backend/routes/cartRoutes.js
const router = require('express').Router();
const cartCtrl = require('../controllers/cartCtrl');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/cart', auth, cartCtrl.getCart);
router.post('/cart/add', auth, cartCtrl.addToCart);
router.put('/cart/update', auth, cartCtrl.updateCartItem);
router.delete('/cart/remove/:videoId', auth, cartCtrl.removeFromCart);
router.delete('/cart/clear', auth, cartCtrl.clearCart);

module.exports = router;
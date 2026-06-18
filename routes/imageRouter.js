// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageCtrl = require('../controllers/imageCtrl');
const auth = require('../middleware/auth');

// ========== RUTAS PÚBLICAS ==========
// Obtener imagen por ID (pública)
router.get('/public/:id', imageCtrl.getImageByIdPublic);

// Obtener todas las imágenes (feed)
router.get('/', imageCtrl.getImages);

// Obtener imágenes por usuario
router.get('/user/:userId', imageCtrl.getUserImages);

// Obtener imágenes destacadas
router.get('/featured', imageCtrl.getFeaturedImages);

// Obtener imágenes populares
router.get('/popular', imageCtrl.getPopularImages);

// Obtener imágenes tendencia
router.get('/trending', imageCtrl.getTrendingImages);

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========
router.use(auth);

// Obtener imagen por ID (privada)
router.get('/private/:id', imageCtrl.getImageByIdPrivate);

// CRUD
router.post('/images', imageCtrl.createImage);
router.put('/images/:id', imageCtrl.updateImage);
router.delete('/images/:id', imageCtrl.deleteImage);

// Interacciones
router.patch('/images/:id/like', imageCtrl.toggleLikeImage);
router.patch('/images/:id/share', imageCtrl.shareImage);
router.patch('/images/:id/view', imageCtrl.incrementImageView);

// Estadísticas
router.get('/images/user/stats', imageCtrl.getUserImageStats);

// ========== RUTAS DE ADMIN ==========
router.get('/admin/pending', imageCtrl.getPendingImagesAdmin);
router.patch('/admin/:id/approve', imageCtrl.approveImageAdmin);
router.delete('/admin/:id/reject', imageCtrl.rejectImageAdmin);

module.exports = router;
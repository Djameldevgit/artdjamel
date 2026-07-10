const router = require('express').Router();
const videoCtrl = require('../controllers/videoCtrl');
const auth = require('../middleware/auth');

// Públicas
router.get('/videos/:id',  videoCtrl.getArtworkById);
router.get('/videos/category/:categorySlug', videoCtrl.getArtworksByCategory);

// Protegidas
router.post('/videos', auth, videoCtrl.createArtwork);
router.patch('/videos/:id', auth, videoCtrl.updateArtwork);
router.delete('/videos/:id', auth, videoCtrl.deleteArtwork);
router.patch('/videos/:id/like', auth, videoCtrl.toggleLikeArtwork);
router.patch('/videos/:id/share', auth, videoCtrl.shareArtwork);
router.post('/videos/:id/save', auth, videoCtrl.toggleSaveArtwork);
router.patch('/videos/:id/view', auth, videoCtrl.incrementArtworkView);
router.get('/videos/me', auth, videoCtrl.getUserArtworks);

module.exports = router;
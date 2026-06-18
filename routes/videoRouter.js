const router = require('express').Router();
const artworkCtrl = require('../controllers/artWorkCtrl');
const auth = require('../middleware/auth');

// Públicas
router.get('/videos/:id', artworkCtrl.getArtworkById);
router.get('/videos/category/:categorySlug', artworkCtrl.getArtworksByCategory);

// Protegidas
router.post('/videos', auth, artworkCtrl.createArtwork);
router.patch('/videos/:id', auth, artworkCtrl.updateArtwork);
router.delete('/videos/:id', auth, artworkCtrl.deleteArtwork);
router.patch('/videos/:id/like', auth, artworkCtrl.toggleLikeArtwork);
router.patch('/videos/:id/share', auth, artworkCtrl.shareArtwork);
router.post('/videos/:id/save', auth, artworkCtrl.toggleSaveArtwork);
router.patch('/videos/:id/view', auth, artworkCtrl.incrementArtworkView);
router.get('/videos/me', auth, artworkCtrl.getUserArtworks);

module.exports = router;
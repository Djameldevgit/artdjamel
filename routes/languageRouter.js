const router = require('express').Router();
const langCtrl = require('../controllers/langCtrl');

// Ruta pública (sin autenticación) para visitantes
router.post('/language/public', langCtrl.setLanguagePublic);

// Ruta unificada para todos los idiomas
router.put('/language/:lang', langCtrl.updateUserLanguage);

module.exports = router;


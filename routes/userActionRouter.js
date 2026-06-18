// routes/userActionRoutes.js
const router = require('express').Router()
const auth = require("../middleware/auth")
const userActionCtrl = require('../controllers/userActionCtrl');

// ============================================
// 1️⃣ RUTAS ESTÁTICAS (sin parámetros)
// ============================================
router.get('/users/counttotal', auth, userActionCtrl.getUsersCount);
router.get('/users/active-last-24h', auth, userActionCtrl.getActiveUsersLast24h);
router.get('/users/active-last-3h', auth, userActionCtrl.getActiveUsersLast3h);

// ============================================
// 2️⃣ RUTAS DE BÚSQUEDA
// ============================================
router.get('/search', auth, userActionCtrl.searchUser);

// ============================================
// 3️⃣ RUTAS CON PARÁMETROS
// ============================================
router.get('/user/:id', auth, userActionCtrl.getUser);

 
module.exports = router
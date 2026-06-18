// routes/authRoutes.js
const router = require('express').Router()
const authCtrl = require('../controllers/authCtrl')
const auth = require('../middleware/auth')

// ============================================
// 1️⃣ RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Registro y login
router.post('/register', authCtrl.register)
router.post('/login', authCtrl.login)
router.post('/logout', authCtrl.logout)
// En authRoutes.js
//router.get('/current-user', auth, authCtrl.getCurrentUser);
// Token y activación
router.post('/refresh_token', authCtrl.generateAccessToken)
router.post('/activate', authCtrl.activationAccount)
router.post('/send_activation_email', auth, authCtrl.sendActivationEmail);

// Recuperación de contraseña
router.post('/forgot', authCtrl.forgotPassword)
router.post('/reset', auth, authCtrl.resetPassword)

// Login social
router.post('/google_login', authCtrl.googleLogin)
router.post('/facebook_login', authCtrl.facebookLogin)

// ============================================
// 2️⃣ RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Envío de emails a usuarios
router.post('/send-user-emails', auth, authCtrl.sendEmailsParaUsers);

// Verificación de usuario (toggle)
router.patch("/users/:id/toggle-verify", auth, authCtrl.toggleVerification);

module.exports = router
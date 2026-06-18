// routes/userRoutes.js
const router = require('express').Router()
const auth = require("../middleware/auth")
const userCtrl = require('../controllers/userCtrl')

// ============================================
// 1️⃣ RUTAS ESTÁTICAS
// ============================================
router.get('/users', auth, userCtrl.getUsersAction)
router.get('/users/admins', auth, userCtrl.getAdmins)
router.get('/users/search', auth, userCtrl.searchUser)
router.get('/inactive-users', auth, userCtrl.getInactiveUsers)

// ============================================
// 2️⃣ RUTAS DE CONTACTO Y SOPORTE
// ============================================
router.post('/contact-support', auth, userCtrl.contactMailSupport)
router.post('/contact-support-block', auth, userCtrl.contactBlockedSupport)
router.post('/contact-activation-request', auth, userCtrl.contactForActivation)

// ============================================
// 3️⃣ RUTAS DE MODERADORES
// ============================================
router.get('/users/:id/moderator-categories', auth, userCtrl.getModeratorCategories)
router.put('/users/:id/assign-categories', auth, userCtrl.assignCategoriesToModerator)

// ============================================
// 4️⃣ RUTAS DE USUARIO (con parámetros)
// ============================================
router.get('/user/:id', auth, userCtrl.getUser)
router.patch('/user', auth, userCtrl.updateUser)
router.delete('/user/:id', auth, userCtrl.deleteUser)

// ============================================
// 5️⃣ RUTAS DE SEGUIDORES
// ============================================
router.patch('/user/:id/follow', auth, userCtrl.follow)
router.patch('/user/:id/unfollow', auth, userCtrl.unfollow)

// ============================================
// 6️⃣ RUTAS DE ACTIVACIÓN/DESACTIVACIÓN
// ============================================
router.patch('/toggle_active/:id', auth, userCtrl.toggleActiveStatus)
router.patch('/user/:id/activate', auth, userCtrl.activateUser)
router.patch('/user/:id/deactivate', auth, userCtrl.deactivateUser)

// ============================================
// 7️⃣ RUTAS DE BLOQUEO/DESBLOQUEO
// ============================================
router.patch('/user/:id/block', auth, userCtrl.blockUser)
router.patch('/user/:id/unblock', auth, userCtrl.unblockUser)

// ============================================
// 8️⃣ RUTAS DE USUARIO PRO
// ============================================
router.patch('/user/:userId/activate-pro', auth, userCtrl.activatePro)
router.patch('/user/:userId/deactivate-pro', auth, userCtrl.deactivatePro)

// ============================================
// 9️⃣ RUTAS DE PERFIL Y ESTADÍSTICAS
// ============================================
router.get('/user/:userId/followers', auth, userCtrl.getFollowers)
router.get('/user/:userId/following', auth, userCtrl.getFollowing)
router.get('/user/:userId/profile-views', auth, userCtrl.getProfileViews)
router.get('/user/:userId/profile', auth, userCtrl.getUserProfile)
router.get('/channel/:userId', auth, userCtrl.getChannelProfile)
router.patch('/user/:userId/profile-view', auth, userCtrl.registerProfileView)
router.get('/user/:userId/profile-stats', auth, userCtrl.getProfileStats)

// ============================================
// 🔟 RUTAS DE PLANES Y TRANSACCIONES
// ============================================
router.patch('/users/:userId/plan', auth, userCtrl.updateUserPlan)
router.get('/users/:userId/transactions', auth, userCtrl.getUserTransactions)

// ============================================
// 1️⃣1️⃣ RUTAS DE VIDEOS GUARDADOS
// ============================================
router.get('/users/saved-videos', auth, userCtrl.getSavedVideos);
router.get('/users/liked-videos', auth, userCtrl.getLikedVideos);
router.get('/user/check-saved/:videoId', auth, userCtrl.checkSavedVideo)
// ✅ GET - VIDEOS GUARDADOS
 
router.get('/users/:userId/videos', auth, userCtrl.getUserVideos)  // ✅ NUEVA - VIDEOS DEL USUARIO
router.patch('/user/delete', auth, userCtrl.deleteUserAccount)
router.delete('/delete-account', auth, userCtrl.deleteUserProfile);
// O mantén la ruta existente pero actualiza la función
//router.delete('/delete', auth, userCtrl.deleteUserComplete);
module.exports = router
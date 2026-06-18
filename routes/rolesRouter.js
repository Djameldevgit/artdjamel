// routes/roleRoutes.js - VERSIÓN CORREGIDA
const router = require('express').Router()
const roleCtrl = require('../controllers/roleCtrl')
const auth = require("../middleware/auth")

// ============================================
// 1️⃣ RUTAS DE BÚSQUEDA
// ============================================
router.get('/users/search', auth, roleCtrl.searchUser)

// ============================================
// 2️⃣ RUTAS DE ASIGNACIÓN DE ROLES (específicas)
// ============================================
// En tu archivo de rutas (userRoute.js)
router.patch('/update_role/:id', auth, roleCtrl.updateRole);
router.patch('/user/:id/roleuser', auth, roleCtrl.assignUserRole);
router.patch('/user/:id/roleuserpro', auth, roleCtrl.assignUserProRole);  // ✅ Actualizado
router.patch('/user/:id/rolemoderador', auth, roleCtrl.assignModeratorRole);
router.patch('/user/:id/roleadmin', auth, roleCtrl.assignAdminRole);
router.patch('/admin/update-plan/:userId', auth,  roleCtrl.updateUserPlan); // ✅ NUEVA RUTA

// ============================================
// 3️⃣ RUTA GENÉRICA DE ACTUALIZACIÓN
// ============================================
router.patch('/user/:id/role', auth, roleCtrl.updateRole);

module.exports = router
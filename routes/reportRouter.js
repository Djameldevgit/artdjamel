// routes/reportRouter.js
const express = require("express");
const router = express.Router();
const reportCtrl = require("../controllers/reportCtrl");
const auth = require("../middleware/auth");

// Ruta para crear un reporte
router.post("/reports", auth, reportCtrl.createReport);

// Obtener todos los reportes (para admins)
router.get("/reports", auth, reportCtrl.getReports);

// Usuarios más reportados
router.get("/most-reported", auth, reportCtrl.getMostReportedUsers);

// Usuarios que más reportan
router.get("/most-active", auth, reportCtrl.getMostActiveReporters);

module.exports = router;

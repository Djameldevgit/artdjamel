const router = require("express").Router();
const settingsCtrl = require("../controllers/settingsCtrl");
const auth = require("../middleware/auth");

// GET público
router.get("/settings", settingsCtrl.getSettings);

// PATCH protegido
router.patch("/settings", auth, settingsCtrl.updateSettings);

module.exports = router;

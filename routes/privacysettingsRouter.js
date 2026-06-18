const router = require("express").Router();
const privacyCtrl = require("../controllers/privacyCtrl");
const auth = require("../middleware/auth");

// GET público

router.get('/privacy', auth, privacyCtrl.getPrivacySettings);
router.patch('/privacy', auth, privacyCtrl.updatePrivacySettings);

module.exports = router;




 

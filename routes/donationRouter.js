const express = require('express');
const router = express.Router();
const donationCtrl = require('../controllers/donationCtrl');
 
// Public routes
router.post("/checkout",  donationCtrl.createCheckout);
router.post('/webhook', donationCtrl.handleWebhook);

 

module.exports = router;
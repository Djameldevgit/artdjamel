// routes/channelRouter.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// ✅ CORREGIR: el nombre del controlador es 'channelCtrl'
const channelCtrl = require('../controllers/channelCtrl');

 
 
// ========== RUTAS PÚBLICAS (sin auth) ==========
router.get('/public/approved', channelCtrl.getApprovedChannels);
router.get('/channels/:channelId', channelCtrl.getChannelProfile);
router.get('/channels/:channelId/videos', channelCtrl.getChannelVideos);
router.get('/pending/:channelId', auth, channelCtrl.getPendingChannel);

// ========== RUTAS CON AUTENTICACIÓN ==========
router.post('/channels', auth, channelCtrl.createChannel);
router.get('/my-channels', auth, channelCtrl.getMyChannels);
router.get('/users/my-channels', auth, channelCtrl.getMyChannels);
router.patch('/channels/:channelId/follow', auth, channelCtrl.toggleFollowChannel);
router.patch('/channels/:channelId', auth, channelCtrl.updateChannel);
router.delete('/channels/:id', auth, channelCtrl.deleteChannel);
router.get('/channels/owner/:id', auth, channelCtrl.getChannelForOwner);


// ========== NUEVAS RUTAS PARA DROPDOWN ==========
router.post('/channels/:channelId/report', auth, channelCtrl.reportChannel);
router.patch('/channels/:channelId/block', auth, channelCtrl.blockChannel);
router.post('/channels/:channelId/share', auth, channelCtrl.registerShare);
router.get('/channels/:channelId/contact', auth, channelCtrl.getContactInfo);

// ========== RUTAS SOLO ADMIN ==========
router.get('/admin/channels/pending', auth, channelCtrl.getPendingChannels);
router.patch('/admin/channels/:channelId/approve', auth, channelCtrl.approveChannel);
router.patch('/admin/channels/:channelId/reject', auth, channelCtrl.rejectChannel);
 
// ✅ Ruta para que el dueño reenvíe un canal rechazado
router.patch('/:channelId/resubmit', auth, channelCtrl.resubmitChannel);
 router.get('/:id', auth, channelCtrl.getChannelById);
module.exports = router;
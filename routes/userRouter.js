 
const router = require('express').Router()
const auth = require("../middleware/auth")
const userCtrl = require('../controllers/userCtrl')
 
router.get('/users', auth, userCtrl.getUsersAction)
 
router.get('/users/search', auth, userCtrl.searchUser)
 
 
router.post('/contact-support', auth, userCtrl.contactMailSupport)
router.post('/contact-support-block', auth, userCtrl.contactBlockedSupport)
router.post('/contact-activation-request', auth, userCtrl.contactForActivation)
 
router.get('/user/:id', auth, userCtrl.getUser)
router.patch('/user', auth, userCtrl.updateUser)
router.delete('/user/:id', auth, userCtrl.deleteUser)

 
 
router.patch('/user/:id/activate', auth, userCtrl.activateUser)
router.patch('/user/:id/deactivate', auth, userCtrl.deactivateUser)

 
router.patch('/user/:id/block', auth, userCtrl.blockUser)
router.patch('/user/:id/unblock', auth, userCtrl.unblockUser)
 
router.get('/user/:userId/followers', auth, userCtrl.getFollowers)
router.get('/user/:userId/following', auth, userCtrl.getFollowing)
 
router.get('/user/:userId/profile', auth, userCtrl.getUserProfile)
 
router.patch('/user/:userId/profile-view', auth, userCtrl.registerProfileView)
router.get('/user/:userId/profile-stats', auth, userCtrl.getProfileStats)
 
router.get('/users/saved-videos', auth, userCtrl.getSavedVideos);
router.get('/users/liked-videos', auth, userCtrl.getLikedVideos);
router.get('/user/check-saved/:videoId', auth, userCtrl.checkSavedVideo)
// ✅ GET - VIDEOS GUARDADOS
 
router.get('/users/:userId/videos', auth, userCtrl.getUserVideos)  // ✅ NUEVA - VIDEOS DEL USUARIO
router.patch('/user/delete', auth, userCtrl.deleteUserAccount)
router.delete('/delete-account', auth, userCtrl.deleteUserProfile);
 
module.exports = router
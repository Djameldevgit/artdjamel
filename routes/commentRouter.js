// 📂 backend/routes/commentRouter.js

const router = require('express').Router()
const commentCtrl = require('../controllers/commentCtrl')
const auth = require('../middleware/auth')

// ✅ IMPORTANTE: 'auth' DEBE ESTAR PRESENTE
router.post('/comment', auth, commentCtrl.createComment)  // ← Asegurar que 'auth' está aquí

router.patch('/comment/:id', auth, commentCtrl.updateComment)
router.patch('/comment/:id/like', auth, commentCtrl.likeComment)
router.patch('/comment/:id/unlike', auth, commentCtrl.unLikeComment)
router.delete('/comment/:id', auth, commentCtrl.deleteComment)
router.get('/comments', commentCtrl.getComments)

module.exports = router
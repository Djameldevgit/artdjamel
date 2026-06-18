// controllers/blogCommentController.js
const BlogComment = require('../models/BlogComment');
// Opcional: si tienes modelo Notify, úsalo para crear la notify
let Notify;
try { Notify = require('../models/Notify'); } catch (err) { Notify = null; }

const axios = require('axios'); // fallback para POST a /api/notify si tu endpoint existe

// Helpers: adaptar requireAuth middleware según tu proyecto (controller no lo importa)
module.exports = {
  // GET /api/blog/comments
  async getAll(req, res) {
    try {
      const comments = await BlogComment.find()
      .sort('-createdAt')
        .lean();
      return res.json({ success: true, comments });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST /api/blog/comments
  async create(req, res) {
    try {
      const user = req.user; // requiere middleware auth que ponga req.user {id,name,role}
      if (!user) return res.status(401).json({ success: false, message: 'No auth' });

      const { text } = req.body;
      if (!text) return res.status(400).json({ success: false, message: 'Text required' });

      const newComment = new BlogComment({
        user: { 
          id: user._id, 
          name: user.name || 'user', 
          username: user.username || user.name || 'user', // 👈 ahora sí lo enviamos
          role: user.role || 'user' 
        },
        text
      });
      
      await newComment.save();

      // Emitir por socket (si dispones de io en global)
      if (global.io) global.io.emit('blog:comment:new', { comment: newComment });

      // Crear notify si existe tu modelo o endpoint
      if (Notify) {
        try {
          await Notify.create({
            user: user._id, // o el id del admin / destinatario si tu notify tiene otra forma
            text: `Nuevo comentario en blog por ${user.name || user.username}`,
            url: `/blog`,
            isRead: false
          });
        } catch (e) { console.warn('Notify model error', e.message); }
      } else {
        // Fallback: si tienes endpoint POST /api/notify que crea notificaciones
        try {
          await axios.post(`${process.env.BASE_URL || ''}/api/notify`, {
            text: `Nuevo comentario en blog por ${user.name}`,
            url: '/blog'
          }, {
            headers: { Authorization: req.headers.authorization || '' }
          });
        } catch (e) { /* no crítico */ }
      }

      return res.status(201).json({ success: true, comment: newComment });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST reply to comment: POST /api/blog/comments/:id/reply
  async reply(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { text } = req.body;
      if (!user) return res.status(401).json({ success: false, message: 'No auth' });
      if (!text) return res.status(400).json({ success: false, message: 'Text required' });

      const comment = await BlogComment.findById(id);
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

      const reply = {
        user: { id: user._id, name: user.name || user.username || 'User', role: user.role || 'user' },
        text
      };

      comment.replies.push(reply);
      comment.updatedAt = Date.now();
      await comment.save();

      if (global.io) global.io.emit('blog:comment:reply', { commentId: id, reply });

      return res.json({ success: true, comment });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // PUT /api/blog/comments/:id
  async update(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { text } = req.body;
      if (!user) return res.status(401).json({ success: false, message: 'No auth' });

      const comment = await BlogComment.findById(id);
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

      // permiso: dueño o admin
      if (comment.user.id.toString() !== user._id.toString() && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'No permission' });
      }

      comment.text = text || comment.text;
      comment.updatedAt = Date.now();
      await comment.save();

      if (global.io) global.io.emit('blog:comment:update', { commentId: id, text: comment.text });

      return res.json({ success: true, comment });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // DELETE /api/blog/comments/:id
  async remove(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      if (!user) return res.status(401).json({ success: false, message: 'No auth' });

      const comment = await BlogComment.findById(id);
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

      // permiso: dueño o admin
      if (comment.user.id.toString() !== user._id.toString() && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'No permission' });
      }

      await comment.remove();

      if (global.io) global.io.emit('blog:comment:delete', { commentId: id });

      return res.json({ success: true, message: 'Deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  likeComment : async (req, res) => {
    try {
      const commentId = req.params.id;
      const userId = req.user._id; // viene del middleware auth
  
      // Validar ID
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ msg: 'ID de comentario no válido' });
      }
  
      // Buscar comentario
      const comment = await BlogComment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ msg: 'Comentario no encontrado' });
      }
  
      // Evitar duplicados
      const hasLiked = comment.likes.some(
        like => like.toString() === userId.toString()
      );
  
      if (hasLiked) {
        // Si ya dio like → quitarlo
        comment.likes = comment.likes.filter(
          like => like.toString() !== userId.toString()
        );
      } else {
        // Si no ha dado like → añadirlo
        comment.likes.push(userId);
      }
  
      await comment.save();
  
      return res.json({
        msg: hasLiked ? 'Like retirado' : 'Like agregado',
        likesCount: comment.likes.length
      });
  
    } catch (err) {
      console.error('❌ Error en likeComment:', err);
      return res.status(500).json({ msg: 'Error del servidor' });
    }
  },

  // ✅ Quitar like (dislike)
 // ❌ Quitar like (dislike)
dislikeComment: async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id; // viene del middleware auth

    // Validar ID
    if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de comentario no válido' });
    }

    // Buscar comentario
    const comment = await BlogComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    // Verificar si el usuario ya había dado like
    const hasLiked = comment.likes.some(
      like => like.toString() === userId.toString()
    );

    if (!hasLiked) {
      return res.status(400).json({ msg: 'No puedes quitar un like que no diste' });
    }

    // Quitar like
    comment.likes = comment.likes.filter(
      like => like.toString() !== userId.toString()
    );

    await comment.save();

    return res.json({
      msg: 'Like retirado',
      likesCount: comment.likes.length
    });

  } catch (err) {
    console.error('❌ Error en dislikeComment:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
}




};

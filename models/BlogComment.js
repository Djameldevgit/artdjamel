const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'user' }
  },
  text: { type: String, required: true },

  // ✅ Likes y dislikes en replies
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],

  createdAt: { type: Date, default: Date.now }
});

const BlogCommentSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    username: { type: String, required: true },
    role: { type: String, default: 'user' }
  },
  text: { type: String, required: true },

  // ✅ Likes y dislikes en comentarios principales
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],

  replies: [ReplySchema], // un nivel de replies
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// ✅ Virtuals para conteo
BlogCommentSchema.virtual('likesCount').get(function () {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});
BlogCommentSchema.virtual('dislikesCount').get(function () {
  return Array.isArray(this.dislikes) ? this.dislikes.length : 0;
});

// ✅ Transformar en JSON para mostrar solo el conteo
BlogCommentSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.likes = Array.isArray(ret.likes) ? ret.likes.length : 0;
    ret.dislikes = Array.isArray(ret.dislikes) ? ret.dislikes.length : 0;
    return ret;
  }
});

BlogCommentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BlogComment', BlogCommentSchema);

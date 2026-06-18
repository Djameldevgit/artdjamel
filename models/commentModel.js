// 📂 backend/models/commentModel.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    tag: Object,
    reply: { type: mongoose.Types.ObjectId, ref: 'comment' },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    
    // ✅ Campos para el target (video)
    targetId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['video']  // ✅ SOLO VIDEO - Eliminado post y boutique
    },
    targetUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

// Índices
commentSchema.index({ targetId: 1, targetModel: 1, createdAt: -1 });
commentSchema.index({ targetUserId: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('comment', commentSchema);
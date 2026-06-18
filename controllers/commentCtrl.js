console.log('🚨🚨🚨 COMMENTCTRL.JS - NUEVA VERSIÓN 2024-01-15 - 15:30 🚨🚨🚨');

const mongoose = require('mongoose');
const Comments = require('../models/commentModel');
const Video = require('../models/videoModel');

const commentCtrl = {
    getComments: async (req, res) => {
        console.log('📥 getComments ejecutado');
        const targetId = req.query.targetId;
        
        try {
            const comments = await Comments.find({ targetId: targetId, targetModel: 'video', reply: null })
                .populate('user', 'username avatar email')
                .sort({ createdAt: -1 });
            
            const replies = await Comments.find({ targetId: targetId, targetModel: 'video', reply: { $ne: null } })
                .populate('user', 'username avatar email');
            
            res.json({
                success: true,
                data: { comments, replies }
            });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ msg: err.message });
        }
    },

    createComment: async (req, res) => {
        console.log('✍️✍️✍️ createComment EJECUTADO ✍️✍️✍️');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user._id);
        
        try {
            const { targetId, targetModel, content, targetUserId } = req.body;
            
            // Validaciones
            if (!targetId) {
                return res.status(400).json({ msg: "targetId requis" });
            }
            if (!content) {
                return res.status(400).json({ msg: "content requis" });
            }
            
            // Crear comentario
            const newComment = new Comments({
                user: req.user._id,
                content: content,
                targetId: targetId,
                targetModel: 'video',
                targetUserId: targetUserId || req.user._id
            });
            
            await newComment.save();
            console.log('✅ Comentario guardado:', newComment._id);
            
            // Populate
            await newComment.populate('user', 'username avatar email');
            
            res.status(201).json({
                success: true,
                msg: "Commentaire créé!",
                newComment
            });
            
        } catch (err) {
            console.error('❌ Error createComment:', err);
            res.status(500).json({ msg: err.message });
        }
    },

    updateComment: async (req, res) => {
        console.log('📝 updateComment');
        try {
            const { content } = req.body;
            const comment = await Comments.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                { content },
                { new: true }
            );
            res.json({ success: true, comment });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    likeComment: async (req, res) => {
        console.log('❤️ likeComment');
        try {
            await Comments.findByIdAndUpdate(req.params.id, {
                $push: { likes: req.user._id }
            });
            res.json({ success: true, msg: "Commentaire aimé!" });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    unLikeComment: async (req, res) => {
        console.log('💔 unLikeComment');
        try {
            await Comments.findByIdAndUpdate(req.params.id, {
                $pull: { likes: req.user._id }
            });
            res.json({ success: true, msg: "Like supprimé!" });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    },

    deleteComment: async (req, res) => {
        console.log('🗑️ deleteComment');
        try {
            const comment = await Comments.findById(req.params.id);
            if (!comment) {
                return res.status(404).json({ msg: "Commentaire non trouvé" });
            }
            
            await Video.findByIdAndUpdate(comment.targetId, {
                $pull: { comments: req.params.id }
            });
            
            await Comments.findByIdAndDelete(req.params.id);
            res.json({ success: true, msg: "Commentaire supprimé!" });
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    }
};

module.exports = commentCtrl;
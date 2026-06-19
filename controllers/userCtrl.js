// controllers/userCtrl.js
// VERSIÓN SIMPLIFICADA PARA ECOMMERCE DE ARTE PERSONAL
// Eliminado: canales, aprobaciones, moderación, planes UserPro, validaciones de canal

const mongoose = require('mongoose');
const Users = require('../models/userModel');
const Video = require('../models/videoModel');
const Comments = require('../models/commentModel');
const Notifications = require('../models/notifyModel');
const Report = require('../models/reportModel');
const sendMail = require('./sendMail');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const userCtrl = {

  // ============================================
  // 🛒 CARRITO (mantenido igual)
  // ============================================
  // Las funciones de carrito se mantienen en cartCtrl.js
  // Aquí solo las referencias si se necesitan, pero normalmente están en cartCtrl.

  // ============================================
  // ❤️ LIKES Y GUARDADOS
  // ============================================

  getLikedVideos: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const filter = { likes: userId, isActive: true };
      const total = await Video.countDocuments(filter);

      const videos = await Video.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username avatar');

      res.json({
        success: true,
        videos,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + videos.length < total
      });
    } catch (err) {
      console.error('❌ Error getLikedVideos:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getSavedVideos: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const user = await Users.findById(userId).select('savedVideos');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const savedIds = user.savedVideos || [];
      const total = savedIds.length;
      const paginatedIds = savedIds.slice(skip, skip + parseInt(limit));

      const videos = await Video.find({ _id: { $in: paginatedIds }, isActive: true })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 });

      const orderedVideos = paginatedIds.map(id => videos.find(v => v._id.toString() === id.toString())).filter(Boolean);

      res.json({
        success: true,
        videos: orderedVideos,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + orderedVideos.length < total
      });
    } catch (err) {
      console.error('❌ Error getSavedVideos:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  checkSavedVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const user = await Users.findById(req.user._id);
      const saved = user.savedVideos.includes(videoId) || false;
      res.json({ success: true, saved });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  saveVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user._id;
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const isSaved = user.savedVideos.includes(videoId);
      if (isSaved) {
        await Users.findByIdAndUpdate(userId, { $pull: { savedVideos: videoId } });
        return res.json({ success: true, saved: false, message: 'Video eliminado de guardados' });
      } else {
        await Users.findByIdAndUpdate(userId, { $push: { savedVideos: videoId } });
        return res.json({ success: true, saved: true, message: 'Video guardado' });
      }
    } catch (err) {
      console.error('❌ Error saveVideo:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  likeVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user._id;

      const video = await Video.findById(videoId);
      if (!video) return res.status(404).json({ success: false, msg: 'Video no encontrado' });

      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });

      const isLiked = video.likes.includes(userId);

      if (isLiked) {
        await Video.findByIdAndUpdate(videoId, { $pull: { likes: userId } });
        await Users.findByIdAndUpdate(userId, { $pull: { likedVideos: videoId } });
        return res.json({ success: true, isLiked: false, likesCount: video.likes.length - 1 });
      } else {
        await Video.findByIdAndUpdate(videoId, { $push: { likes: userId } });
        await Users.findByIdAndUpdate(userId, { $addToSet: { likedVideos: videoId } });

        // Notificación (solo si no es su propio video)
        if (video.user.toString() !== userId.toString()) {
          const Notifications = require('../models/notifyModel');
          const notification = new Notifications({
            recipients: [video.user],
            sender: userId,
            text: `❤️ ${user.username} a aimé votre œuvre`,
            url: `/video/${videoId}`,
            type: 'video',
            content: video.title
          });
          await notification.save();
        }
        return res.json({ success: true, isLiked: true, likesCount: video.likes.length + 1 });
      }
    } catch (err) {
      console.error('❌ Error likeVideo:', err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  // ============================================
  // 👤 PERFIL DE USUARIO
  // ============================================

  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;
      const user = await Users.findById(userId)
        .select('-password')
        .populate('followers', '_id')
        .populate('following', '_id');

      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const followers = user.followers || [];
      const following = user.following || [];
      let isFollowing = false;
      if (currentUserId && currentUserId.toString() !== userId) {
        isFollowing = followers.some(f => f && f._id && f._id.toString() === currentUserId.toString());
      }

      const videoStats = await Video.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), isActive: true } },
        { $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalViews: { $sum: '$views' },
          totalComments: { $sum: { $size: '$comments' } },
          totalShares: { $sum: { $size: { $ifNull: ['$shares', []] } } }
        }}
      ]);

      res.json({
        success: true,
        profile: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio || '',
          fullname: user.fullname || user.username,
          role: user.role,
          followersCount: followers.length || 0,
          followingCount: following.length || 0,
          profileViewsCount: user.profileViewsCount || 0,
          isFollowing,
          videoStats: videoStats[0] || { totalVideos: 0, totalLikes: 0, totalViews: 0, totalComments: 0, totalShares: 0 }
        }
      });
    } catch (err) {
      console.error('❌ Error getUserProfile:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { avatar, fullname, mobile, address, story, website } = req.body;
      if (!fullname) return res.status(400).json({ msg: "Veuillez fournir votre nom complet" });
      await Users.findOneAndUpdate(
        { _id: req.user._id },
        { avatar, fullname, mobile, address, story, website }
      );
      res.json({ msg: "Profil mis à jour !" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // ============================================
  // 👥 SEGUIR / DEJAR DE SEGUIR
  // ============================================

  toggleFollow: async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user._id;

      if (id === currentUserId.toString()) {
        return res.status(400).json({ success: false, message: "No puedes seguirte a ti mismo" });
      }

      const userToFollow = await Users.findById(id);
      const currentUser = await Users.findById(currentUserId);
      if (!userToFollow || !currentUser) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      const isFollowing = currentUser.following.includes(id);
      if (isFollowing) {
        await Users.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
        await Users.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
      } else {
        await Users.findByIdAndUpdate(currentUserId, { $addToSet: { following: id } });
        await Users.findByIdAndUpdate(id, { $addToSet: { followers: currentUserId } });
      }

      const updatedUser = await Users.findById(id);
      res.json({
        success: true,
        isFollowing: !isFollowing,
        followersCount: updatedUser.followers.length || 0
      });
    } catch (err) {
      console.error('❌ Error toggleFollow:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getFollowers: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate('followers', 'username avatar fullname bio role');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const followersList = user.followers || [];
      const currentUserId = req.user._id;
      let currentUserFollowing = [];
      if (currentUserId) {
        const currentUser = await Users.findById(currentUserId).select('following');
        currentUserFollowing = (currentUser.following || []).map(id => id.toString());
      }

      const followersWithStatus = followersList.map(f => ({
        ...f.toObject(),
        isFollowing: currentUserFollowing.includes(f._id.toString())
      }));

      res.json({ success: true, users: followersWithStatus, count: followersWithStatus.length });
    } catch (err) {
      console.error('❌ Error getFollowers:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getFollowing: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate('following', 'username avatar fullname bio role');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const followingList = user.following || [];
      const currentUserId = req.user._id;
      let currentUserFollowing = [];
      if (currentUserId) {
        const currentUser = await Users.findById(currentUserId).select('following');
        currentUserFollowing = (currentUser.following || []).map(id => id.toString());
      }

      const followingWithStatus = followingList.map(f => ({
        ...f.toObject(),
        isFollowing: currentUserFollowing.includes(f._id.toString())
      }));

      res.json({ success: true, users: followingWithStatus, count: followingWithStatus.length });
    } catch (err) {
      console.error('❌ Error getFollowing:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ============================================
  // 📊 ESTADÍSTICAS DE PERFIL
  // ============================================

  registerProfileView: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;
      if (currentUserId.toString() === userId) return res.json({ success: true, message: 'No se registra vista propia' });

      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const existingView = user.profileViews.find(v => v.user.toString() === currentUserId.toString() && new Date(v.viewedAt) > oneDayAgo);

      if (!existingView) {
        user.profileViews = user.profileViews || [];
        user.profileViews.push({ user: currentUserId, viewedAt: new Date() });
        user.profileViewsCount = (user.profileViewsCount || 0) + 1;
        if (user.profileViews.length > 100) user.profileViews = user.profileViews.slice(-100);
        await user.save();
      }
      res.json({ success: true, count: user.profileViewsCount });
    } catch (err) {
      console.error('❌ Error registerProfileView:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getProfileStats: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).select('profileViewsCount followers following');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

      const weeklyViews = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
        const count = (user.profileViews || []).filter(v => new Date(v.viewedAt) >= day && new Date(v.viewedAt) < nextDay).length || 0;
        weeklyViews.push({ date: day.toLocaleDateString('fr-FR', { weekday: 'short' }), count });
      }

      res.json({
        success: true,
        stats: {
          totalViews: user.profileViewsCount || 0,
          weeklyViews,
          followersCount: user.followers.length || 0,
          followingCount: user.following.length || 0
        }
      });
    } catch (err) {
      console.error('❌ Error getProfileStats:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ============================================
  // 🔍 BÚSQUEDA DE USUARIOS
  // ============================================

  searchUser: async (req, res) => {
    try {
      const users = await Users.find({ username: { $regex: req.query.username } })
        .limit(10)
        .select("username avatar");
      res.json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id)
        .select('-password')
        .populate("followers following", "-password");
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      res.json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserVideos: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
  
      // ✅ Solo filtramos por usuario y activos
      const match = { 
        user: new mongoose.Types.ObjectId(userId), 
        isActive: true 
      };
  
      const videos = await Video.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'username avatar')
        .lean();
  
      const total = await Video.countDocuments(match);
  
      // ✅ Ya no calculamos pendingCount ni approvedCount
      const currentUserId = req.user._id;
      const videosWithStatus = videos.map(v => ({
        ...v,
        liked: v.likes.some(id => id.toString() === currentUserId.toString()) || false
      }));
  
      res.json({
        success: true,
        videos: videosWithStatus,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + videos.length < total
      });
    } catch (err) {
      console.error('❌ Error getUserVideos:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  
deleteUserProfile: async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'Utilisateur non trouvé'
      });
    }

    console.log(`🗑️ Eliminando cuenta de usuario: ${user.email} (${userId})`);

    // ============================================
    // 1. OBTENER VIDEOS DEL USUARIO (sin canales)
    // ============================================
    const videos = await Video.find({ user: userId });
    const videoIds = videos.map(v => v._id);

    console.log(`📹 Videos encontrados: ${videos.length}`);

    // ============================================
    // 2. ELIMINAR REFERENCIAS EN OTROS USUARIOS
    // ============================================
    // Usuarios que siguen a este usuario
    await Users.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // Usuarios que tienen a este usuario como seguidor
    await Users.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );

    // Usuarios que guardaron videos de este usuario
    if (videoIds.length > 0) {
      await Users.updateMany(
        { savedVideos: { $in: videoIds } },
        { $pull: { savedVideos: { $in: videoIds } } }
      );
    }

    // ============================================
    // 3. ELIMINAR COMENTARIOS DEL USUARIO
    // ============================================
    await Comments.deleteMany({ user: userId });
    await Video.updateMany(
      { 'comments.user': userId },
      { $pull: { comments: { user: userId } } }
    );

    // ============================================
    // 4. ELIMINAR NOTIFICACIONES DEL USUARIO
    // ============================================
    await Notifications.deleteMany({
      $or: [
        { sender: userId },
        { recipients: userId }
      ]
    });

    // ============================================
    // 5. ELIMINAR REPORTES RELACIONADOS
    // ============================================
    await Report.deleteMany({
      $or: [
        { reportedBy: userId },
        { userId: userId }
      ]
    });

    // ============================================
    // 6. ELIMINAR VIDEOS (y sus archivos Cloudinary)
    // ============================================
    for (const video of videos) {
      if (video.videoPublicId) {
        try {
          const cloudinary = require('cloudinary').v2;
          await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
        } catch (err) { /* ignorar */ }
      }
      if (video.thumbnail && video.thumbnail.includes('cloudinary.com')) {
        try {
          const cloudinary = require('cloudinary').v2;
          const publicId = video.thumbnail.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (err) { /* ignorar */ }
      }
    }
    await Video.deleteMany({ user: userId });

    // ============================================
    // 7. ELIMINAR AVATAR DE CLOUDINARY
    // ============================================
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const cloudinary = require('cloudinary').v2;
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (err) { /* ignorar */ }
    }

    // ============================================
    // 8. ELIMINAR EL USUARIO
    // ============================================
    await Users.findByIdAndDelete(userId);

    console.log(`✅ Cuenta eliminada completamente: ${user.email}`);
    console.log(`   - Videos eliminados: ${videos.length}`);

    res.json({
      success: true,
      msg: 'Compte et tout son contenu supprimés avec succès',
      deletedData: {
        userId: userId,
        videosDeleted: videos.length
      }
    });

  } catch (error) {
    console.error('❌ Error deleteUserProfile:', error);
    res.status(500).json({
      success: false,
      msg: error.message || 'Erreur lors de la suppression du compte'
    });
  }
},
  deleteUserAccount: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });

      console.log(`🗑️ Eliminando cuenta de usuario: ${user.email} (${userId})`);

      // 1. Eliminar videos del usuario (si los tiene)
      const videos = await Video.find({ user: userId });
      for (const video of videos) {
        // Eliminar video de Cloudinary si existe
        if (video.videoPublicId) {
          try {
            const cloudinary = require('cloudinary').v2;
            await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
          } catch (err) { /* ignorar */ }
        }
        // Eliminar thumbnail
        if (video.thumbnail && video.thumbnail.includes('cloudinary.com')) {
          try {
            const cloudinary = require('cloudinary').v2;
            const publicId = video.thumbnail.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          } catch (err) { /* ignorar */ }
        }
      }
      await Video.deleteMany({ user: userId });

      // 2. Eliminar avatar de Cloudinary
      if (user.avatar && user.avatar.includes('cloudinary.com')) {
        try {
          const cloudinary = require('cloudinary').v2;
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (err) { /* ignorar */ }
      }

      // 3. Eliminar referencias en otros usuarios
      await Users.updateMany(
        { followers: userId },
        { $pull: { followers: userId } }
      );
      await Users.updateMany(
        { following: userId },
        { $pull: { following: userId } }
      );

      // 4. Eliminar notificaciones
      await Notifications.deleteMany({
        $or: [
          { sender: userId },
          { recipients: userId }
        ]
      });

      // 5. Eliminar comentarios
      await Comments.deleteMany({ user: userId });
      await Video.updateMany(
        { 'comments.user': userId },
        { $pull: { comments: { user: userId } } }
      );

      // 6. Eliminar el usuario
      await Users.findByIdAndDelete(userId);

      res.json({
        success: true,
        msg: 'Compte supprimé avec succès',
        deletedData: { videos: videos.length }
      });
    } catch (err) {
      console.error('❌ Error deleteUserAccount:', err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  // ============================================
  // 👑 ADMIN: ELIMINAR USUARIO POR ID
  // ============================================

  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Accès non autorisé.' });
      }
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, msg: 'ID invalide' });
      }
      const userToDelete = await Users.findById(id);
      if (!userToDelete) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
      if (userToDelete._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, msg: 'No puedes eliminarte a ti mismo' });
      }

      // Eliminar sus videos
      const userVideos = await Video.find({ user: id });
      await Video.deleteMany({ user: id });

      // Eliminar comentarios
      await Comments.deleteMany({ user: id });
      await Video.updateMany(
        { 'comments.user': id },
        { $pull: { comments: { user: id } } }
      );

      // Eliminar notificaciones
      await Notifications.deleteMany({
        $or: [{ sender: id }, { recipients: id }]
      });

      // Eliminar referencias en otros usuarios
      await Users.updateMany(
        { followers: id },
        { $pull: { followers: id } }
      );
      await Users.updateMany(
        { following: id },
        { $pull: { following: id } }
      );

      await userToDelete.deleteOne();
      res.json({ success: true, msg: 'Usuario eliminado permanentemente' });
    } catch (err) {
      console.error('❌ Error deleteUser:', err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  // ============================================
  // 🔒 BLOQUEO / ACTIVACIÓN (solo admin)
  // ============================================

  blockUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, description, blockExpiryDate } = req.body;
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      if (!reason) return res.status(400).json({ message: 'Le motif est requis' });

      const user = await Users.findById(id);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      user.isBlocked = true;
      user.isActive = false;
      user.blockDetails = { reason, description, blockDate: new Date(), blockExpiryDate: blockExpiryDate || null, blockedBy: req.user._id };
      await user.save();

      res.json({ success: true, message: 'Utilisateur bloqué', user: { _id: user._id, isBlocked: true, isActive: false } });
    } catch (err) {
      console.error('❌ Error blockUser:', err);
      res.status(500).json({ message: err.message });
    }
  },

  unblockUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      const user = await Users.findById(id);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      user.isBlocked = false;
      user.isActive = true;
      user.blockDetails = { reason: null, description: null, blockDate: null, blockExpiryDate: null, blockedBy: null };
      await user.save();

      res.json({ success: true, message: 'Utilisateur débloqué', user: { _id: user._id, isBlocked: false, isActive: true } });
    } catch (err) {
      console.error('❌ Error unblockUser:', err);
      res.status(500).json({ message: err.message });
    }
  },

  activateUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      const user = await Users.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json({ success: true, message: 'Utilisateur activé', user: { _id: user._id, isActive: true } });
    } catch (err) {
      console.error('❌ Error activateUser:', err);
      res.status(500).json({ message: err.message });
    }
  },

  deactivateUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }
      const user = await Users.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json({ success: true, message: 'Utilisateur désactivé', user: { _id: user._id, isActive: false } });
    } catch (err) {
      console.error('❌ Error deactivateUser:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // ============================================
  // 📋 ADMIN: LISTAR USUARIOS
  // ============================================

  getUsersAction: async (req, res) => {
    try {
      const query = Users.find()
        .select('-password')
        .populate('followers', 'username avatar')
        .populate('following', 'username avatar')
        .lean();

      const features = new APIfeatures(query, req.query).paginating();
      const users = await features.query.sort('-createdAt');

      const usersWithDetails = await Promise.all(users.map(async (user) => {
        const videos = await Video.find({ user: user._id, isActive: true });
        const totalLikesReceived = videos.reduce((acc, v) => acc + (v.likes ? v.likes.length : 0), 0);
        const totalCommentsReceived = videos.reduce((acc, v) => acc + (v.comments ? v.comments.length : 0), 0);
        const reportsReceived = await Report.countDocuments({ userId: user._id });
        const likesGiven = await Video.countDocuments({ likes: user._id });
        const commentsMade = await Comments.countDocuments({ user: user._id });

        return {
          ...user,
          isBlocked: user.isBlocked || false,
          videoCount: videos.length,
          totalLikesReceived,
          totalCommentsReceived,
          totalFollowers: user.followers.length || 0,
          totalFollowing: user.following.length || 0,
          totalReportsReceived: reportsReceived,
          likesGiven,
          commentsMade,
          videos
        };
      }));

      // Filtros simples
      const filter = req.query.filter;
      if (filter === 'mostLikes') usersWithDetails.sort((a, b) => b.totalLikesReceived - a.totalLikesReceived);
      else if (filter === 'mostComments') usersWithDetails.sort((a, b) => b.totalCommentsReceived - a.totalCommentsReceived);
      else if (filter === 'mostFollowers') usersWithDetails.sort((a, b) => b.totalFollowers - a.totalFollowers);
      else if (filter === 'mostVideos') usersWithDetails.sort((a, b) => b.videoCount - a.videoCount);
      else if (filter === 'mostReports') usersWithDetails.sort((a, b) => b.totalReportsReceived - a.totalReportsReceived);
      else if (filter === 'lastLogin') usersWithDetails.sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0));
      else if (filter === 'latestRegistered') usersWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ msg: 'Success!', result: usersWithDetails.length, users: usersWithDetails });
    } catch (err) {
      console.error('❌ Error getUsersAction:', err);
      res.status(500).json({ msg: err.message, users: [] });
    }
  },

  // ============================================
  // 📧 CONTACTO (mantenido)
  // ============================================

  contactMailSupport: async (req, res) => {
    try {
      const { title, message, lang } = req.body;
      const user = req.user;
      if (!user) return res.status(401).json({ msg: 'Usuario no autenticado.' });
      if (!title || !message) return res.status(400).json({ msg: 'Faltan el título o el mensaje.' });

      const subject = `[Contacto] ${title} - ${user.username}`;
      const fullMessage = `Mensaje del usuario:\n--------------------\nNombre: ${user.username}\nEmail: ${user.email}\nID: ${user._id}\n\nMensaje:\n--------\n${message}`;
      await sendMail('artealger2020argelia@gmail.com', '#', lang || 'es', 'informativo', subject, fullMessage);
      return res.json({ success: true, msg: 'Mensaje enviado correctamente.' });
    } catch (err) {
      console.error('❌ Error contactMailSupport:', err);
      return res.status(500).json({ msg: 'Error interno al enviar el mensaje.' });
    }
  },

  contactBlockedSupport: async (req, res) => {
    try {
      const { message, lang } = req.body;
      const user = req.user;
      if (!message) return res.status(400).json({ msg: 'El mensaje es obligatorio.' });

      const subject = `🛑 Solicitud de revisión de bloqueo - ${user.username}`;
      const fullMessage = `Usuario: ${user.username}\nID: ${user._id}\nEmail: ${user.email}\nMensaje: ${message}\nFecha: ${new Date().toLocaleString(lang || 'es')}`;
      await sendMail('artealger2020argelia@gmail.com', '#', lang || 'es', 'informativo', subject, fullMessage);
      return res.json({ msg: '✅ Solicitud de desbloqueo enviada correctamente.' });
    } catch (err) {
      console.error('❌ Error contactBlockedSupport:', err);
      return res.status(500).json({ msg: 'Error al enviar la solicitud.' });
    }
  },

  contactForActivation: async (req, res) => {
    try {
      const { message, lang } = req.body;
      const user = req.user;
      if (!message || !message.trim()) {
        return res.status(400).json({ msg: 'El mensaje es obligatorio.' });
      }
      const subject = `Solicitud de activación de cuenta - ${user.username}`;
      const customMessage = `El usuario ${user.username} ha solicitado la activación de su cuenta.\n\nID: ${user._id}\nCorreo: ${user.email}\n\nMensaje del usuario:\n${message}`;
      await sendMail('artealger2020argelia@gmail.com', '#', lang || 'es', 'informativo', subject, customMessage);
      return res.json({ msg: '✅ Mensaje enviado correctamente al administrador.' });
    } catch (err) {
      console.error('❌ Error contactForActivation:', err);
      return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
  }
};

module.exports = userCtrl;
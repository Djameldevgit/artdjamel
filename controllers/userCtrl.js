const mongoose = require('mongoose');

const Users = require('../models/userModel');
const Comments = require('../models/commentModel');
const Notifications = require('../models/notifyModel');
const Video = require('../models/videoModel');
const sendMail = require('./sendMail');
const Report = require('../models/reportModel');
const Channel = require('../models/channelModel');

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

  // ==================== PERFIL DEL CANAL (PÚBLICO) ====================
  getChannelProfile: async (req, res) => {
    try {
      const { channelId } = req.params;
      const currentUserId = req.user._id;

      const channel = await Channel.findById(channelId)
        .populate('owner', 'username avatar fullname isPro role')
        .lean();

      if (!channel || !channel.isActive) {
        return res.status(404).json({ success: false, message: 'Canal no encontrado' });
      }

      let isFollowing = false;
      if (currentUserId) {
        const currentUser = await Users.findById(currentUserId).select('followingChannels');
        if (currentUser && currentUser.followingChannels) {
          isFollowing = currentUser.followingChannels.some(id => id.toString() === channel._id.toString());
        }
      }

      const videoStats = await Video.aggregate([
        { $match: { channel: channel._id, pendiente: false, isActive: true } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
            totalViews: { $sum: { $ifNull: ['$views', 0] } },
            totalComments: { $sum: { $size: { $ifNull: ['$comments', []] } } }
          }
        }
      ]);

      const profileData = {
        _id: channel._id,
        name: channel.name,
        description: channel.description,
        avatar: channel.avatar,
        cover: channel.cover,
        wilaya: channel.wilaya,
        commune: channel.commune,
        isVerified: channel.isVerified,
        followersCount: channel.followersCount || 0,
        totalVideos: channel.totalVideos || 0,
        owner: {
          _id: channel.owner._id,
          username: channel.owner.username,
          avatar: channel.owner.avatar,
          fullname: channel.owner.fullname,
          isPro: channel.owner.isPro
        },
        videoStats: videoStats[0] || {
          totalVideos: 0,
          totalLikes: 0,
          totalViews: 0,
          totalComments: 0
        },
        isFollowing
      };

      if (currentUserId && channel.owner._id.toString() === currentUserId.toString()) {
        profileData.email = channel.email;
        profileData.phone = channel.phoneHidden ? null : channel.phone;
        profileData.website = channel.website;
        profileData.delivery = channel.delivery;
      }

      res.json({ success: true, profile: profileData });
    } catch (err) {
      console.error('❌ getChannelProfile error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== SEGUIR / DEJAR DE SEGUIR CANAL ====================
  toggleFollowChannel: async (req, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user._id;

      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Canal no encontrado' });
      }

      const user = await Users.findById(userId);
      let isFollowing = false;
      const alreadyFollowing = user.followingChannels.includes(channelId) || false;

      if (alreadyFollowing) {
        await Users.findByIdAndUpdate(userId, { $pull: { followingChannels: channelId } });
        await Channel.findByIdAndUpdate(channelId, { $pull: { followers: userId } });
        isFollowing = false;
      } else {
        await Users.findByIdAndUpdate(userId, { $addToSet: { followingChannels: channelId } });
        await Channel.findByIdAndUpdate(channelId, { $addToSet: { followers: userId } });
        isFollowing = true;
      }

      const updatedChannel = await Channel.findById(channelId);
      updatedChannel.followersCount = updatedChannel.followers.length;
      await updatedChannel.save();

      res.json({
        success: true,
        isFollowing,
        followersCount: updatedChannel.followersCount
      });
    } catch (err) {
      console.error('❌ toggleFollowChannel error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== OBTENER SEGUIDORES DE UN CANAL ====================
  getChannelFollowers: async (req, res) => {
    try {
      const { channelId } = req.params;
      const channel = await Channel.findById(channelId).populate('followers', 'username avatar fullname bio');
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Canal no encontrado' });
      }
      res.json({ success: true, followers: channel.followers, count: channel.followers.length });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== OBTENER CANALES QUE SIGUE UN USUARIO ====================
  getUserFollowingChannels: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate('followingChannels', 'name avatar followersCount');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      res.json({ success: true, channels: user.followingChannels });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getMyFollowedChannels: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await Users.findById(userId).populate('followingChannels', 'name avatar description followersCount');
      res.json({ success: true, channels: user.followingChannels || [] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== REGISTRAR VISTA AL PERFIL DEL CANAL ====================
  registerChannelView: async (req, res) => {
    try {
      const { channelId } = req.params;
      const viewerId = req.user._id;

      const channel = await Channel.findById(channelId);
      if (!channel) return res.status(404).json({ success: false, message: 'Canal no encontrado' });

      if (channel.owner.toString() === viewerId.toString()) {
        return res.json({ success: true, message: 'Vista propia no registrada' });
      }

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existingView = (channel.profileViews || []).find(
        view => view.user.toString() === viewerId.toString() && new Date(view.viewedAt) > oneDayAgo
      );
      if (!existingView) {
        channel.profileViews = channel.profileViews || [];
        channel.profileViews.push({ user: viewerId, viewedAt: new Date() });
        channel.profileViewsCount = (channel.profileViewsCount || 0) + 1;
        await channel.save();
      }
      res.json({ success: true, count: channel.profileViewsCount });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== OBTENER ESTADÍSTICAS DEL CANAL ====================
  getChannelStats: async (req, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user._id;

      const channel = await Channel.findById(channelId);
      if (!channel) return res.status(404).json({ success: false, message: 'Canal no encontrado' });
      if (channel.owner.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }

      const weeklyViews = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = (channel.profileViews || []).filter(view =>
          new Date(view.viewedAt) >= day && new Date(view.viewedAt) < nextDay
        ).length;
        weeklyViews.push({ date: day.toLocaleDateString('fr-FR', { weekday: 'short' }), count });
      }

      const videoStats = await Video.aggregate([
        { $match: { channel: channel._id, pendiente: false } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            totalComments: { $sum: { $size: '$comments' } }
          }
        }
      ]);

      res.json({
        success: true,
        stats: {
          followersCount: channel.followersCount,
          profileViews: channel.profileViewsCount || 0,
          weeklyViews,
          ...videoStats[0]
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== VIDEOS GUARDADOS Y LIKED ====================

   

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
  getLikedVideos: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 12 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const filter = { likes: userId, status: 'approved', isActive: true };
      const total = await Video.countDocuments(filter);
  
      const videos = await Video.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username avatar isPro')
        .populate('channel', 'name avatar isVerified');
  
      res.json({
        success: true,
        videos,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + videos.length < total
      });
    } catch (err) {
      console.error('Error en getLikedVideos:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  
  getSavedVideos : async (req, res) => {
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

    const videos = await Video.find({ _id: { $in: paginatedIds }, status: 'approved', isActive: true })
      .populate('user', 'username avatar isPro')
      .populate('channel', 'name avatar isVerified')
      .sort({ createdAt: -1 });

    // Mantener el orden en que fueron guardados
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
    console.error('Error en getSavedVideos:', err);
    res.status(500).json({ success: false, message: err.message });
  }
},

// ============================================
// 📌 OBTENER VIDEOS CON LIKE DEL USUARIO
// ============================================
  getLikedVideos : async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { likes: userId, status: 'approved', isActive: true };
    const total = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar isPro')
      .populate('channel', 'name avatar isVerified');

    res.json({
      success: true,
      videos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + videos.length < total
    });
  } catch (err) {
    console.error('Error en getLikedVideos:', err);
    res.status(500).json({ success: false, message: err.message });
  }
},

 
  // ==================== FUNCIONES DE USUARIO ====================
  assignCategoriesToModerator: async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedCategories } = req.body;

      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Non autorisé" });
      }

      const user = await Users.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }

      user.assignedCategories = assignedCategories || [];
      await user.save();

      res.json({ success: true, message: "Catégories assignées", user });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getModeratorCategories: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findById(id).select('assignedCategories role canApproveAllCategories');
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }


      if (user.role !== 'moderator') {
        return res.status(400).json({ success: false, message: "Cet utilisateur n'est pas un modérateur" });
      }
      res.json({ success: true, canApproveAll: user.canApproveAllCategories, categories: user.assignedCategories });
    } catch (err) {
      console.error('❌ Error getModeratorCategories:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  checkModeratorPermission: async (req, res) => {
    try {
      const { userId, categorySlug, subCategorySlug } = req.params;
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
      let canModerate = false;
      if (user.role === 'admin') {
        canModerate = true;
      } else if (user.role === 'moderator') {
        if (user.canApproveAllCategories) {
          canModerate = true;
        } else if (user.assignedCategories && user.assignedCategories.length > 0) {
          canModerate = user.assignedCategories.some(cat =>
            cat.slug === categorySlug || (subCategorySlug && cat.subCategories && cat.subCategories.includes(subCategorySlug))
          );
        }
      }
      res.json({ success: true, canModerate, role: user.role, permissionLevel: user.permissionLevel });
    } catch (err) {
      console.error('❌ Error checkModeratorPermission:', err);
      res.status(500).json({ success: false, error: err.message });
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
      const adminEmail = "artealger2020argelia@gmail.com";
      await sendMail(adminEmail, '#', lang || 'es', 'informativo', subject, customMessage);
      return res.json({ msg: '✅ Mensaje enviado correctamente al administrador.' });
    } catch (err) {
      console.error('❌ Error al procesar solicitud de activación:', err);
      return res.status(500).json({ msg: 'Error interno del servidor.' });
    }
  },

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
      console.error('❌ Error al enviar el mensaje de contacto:', err);
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
      console.error('❌ Error en contactBlockedSupport:', err);
      return res.status(500).json({ msg: 'Error al enviar la solicitud.' });
    }
  },

  validateUserActivity: async (req, res, next) => {
    const user = await Users.findById(req.user._id);
    if (!user) return res.status(401).json({ msg: 'Usuario no encontrado.' });
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    if (!user.isVerified && accountAge > threeDays) {
      await Users.findByIdAndDelete(user._id);
      return res.status(403).json({ msg: 'Tu cuenta ha sido eliminada por no verificarla a tiempo.' });
    }
    next();
  },

  toggleActiveStatus: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: "Usuario no encontrado." });
      user.isActive = !user.isActive;
      await user.save();
      res.json({ msg: "Estado actualizado", user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getAdmins: async (req, res) => {
    try {
      const admins = await Users.find({ role: 'admin' }).select('username avatar online _id');
      res.json({ users: admins });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  searchUser: async (req, res) => {
    try {
      const users = await Users.find({ username: { $regex: req.query.username } }).limit(10).select("username avatar");
      res.json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id).select('-password').populate("followers following", "-password");
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      res.json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { avatar, fullname, mobile, address, story, website } = req.body;
      if (!fullname) return res.status(400).json({ msg: "Please add your full name." });
      await Users.findOneAndUpdate({ _id: req.user._id }, { avatar, fullname, mobile, address, story, website });
      res.json({ msg: "Update Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  follow: async (req, res) => {
    try {
      const user = await Users.find({ _id: req.params.id, followers: req.user._id });
      if (user.length > 0) return res.status(500).json({ msg: "You followed this user." });
      const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, { $push: { followers: req.user._id } }, { new: true }).populate("followers following", "-password");
      await Users.findOneAndUpdate({ _id: req.user._id }, { $push: { following: req.params.id } }, { new: true });
      res.json({ newUser });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  unfollow: async (req, res) => {
    try {
      const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, { $pull: { followers: req.user._id } }, { new: true }).populate("followers following", "-password");
      await Users.findOneAndUpdate({ _id: req.user._id }, { $pull: { following: req.params.id } }, { new: true });
      res.json({ newUser });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteUserProfile: async (req, res) => {
    try {
      const userId = req.user._id; // Usuario autenticado
      const userToDelete = await Users.findById(userId);

      if (!userToDelete) {
        return res.status(404).json({
          success: false,
          msg: 'Utilisateur non trouvé'
        });
      }

      console.log(`🗑️ Iniciando eliminación completa del usuario: ${userToDelete.email} (${userId})`);

      // ============================================
      // 1. OBTENER TODOS LOS CANALES DEL USUARIO
      // ============================================
      const channels = await Channel.find({ owner: userId });
      const channelIds = channels.map(ch => ch._id);

      console.log(`📊 Canales encontrados: ${channelIds.length}`);

      // ============================================
      // 2. OBTENER TODOS LOS VIDEOS DE ESOS CANALES
      // ============================================
      const videos = await Video.find({ channel: { $in: channelIds } });
      const videoIds = videos.map(v => v._id);

      console.log(`📊 Videos encontrados: ${videoIds.length}`);

      // ============================================
      // 3. ELIMINAR REFERENCIAS EN OTROS USUARIOS
      // ============================================

      // 3.1 Usuarios que siguen los canales de este usuario
      await Users.updateMany(
        { followingChannels: { $in: channelIds } },
        { $pull: { followingChannels: { $in: channelIds } } }
      );

      // 3.2 Usuarios que siguen al usuario
      await Users.updateMany(
        { following: userId },
        { $pull: { following: userId } }
      );

      // 3.3 Usuarios que tienen al usuario como seguidor
      await Users.updateMany(
        { followers: userId },
        { $pull: { followers: userId } }
      );

      // 3.4 Usuarios que guardaron videos de este usuario
      if (videoIds.length > 0) {
        await Users.updateMany(
          { savedVideos: { $in: videoIds } },
          { $pull: { savedVideos: { $in: videoIds } } }
        );

        // 3.5 Usuarios que dieron like a videos de este usuario
        await Users.updateMany(
          { likedVideos: { $in: videoIds } },
          { $pull: { likedVideos: { $in: videoIds } } }
        );
      }

      // ============================================
      // 4. ELIMINAR COMENTARIOS DEL USUARIO
      // ============================================
      if (mongoose.models.Comment) {
        await mongoose.models.Comment.deleteMany({ user: userId });
        console.log('✅ Comentarios eliminados');
      }

      // ============================================
      // 5. ELIMINAR REPORTES RELACIONADOS
      // ============================================
      if (mongoose.models.Report) {
        await mongoose.models.Report.deleteMany({
          $or: [
            { reportedBy: userId },
            { reportedUserId: userId },
            { channelId: { $in: channelIds } },
            { videoId: { $in: videoIds } }
          ]
        });
        console.log('✅ Reportes eliminados');
      }

      // ============================================
      // 6. ELIMINAR NOTIFICACIONES DEL USUARIO
      // ============================================
      if (mongoose.models.Notification) {
        await mongoose.models.Notification.deleteMany({
          $or: [
            { user: userId },
            { sender: userId }
          ]
        });
        console.log('✅ Notificaciones eliminadas');
      }

      // ============================================
      // 7. ELIMINAR MENSAJES/CHATS (si existen)
      // ============================================
      if (mongoose.models.Message) {
        await mongoose.models.Message.deleteMany({
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        });
        console.log('✅ Mensajes eliminados');
      }

      // ============================================
      // 8. ELIMINAR TODOS LOS VIDEOS
      // ============================================
      if (videoIds.length > 0) {
        await Video.deleteMany({ _id: { $in: videoIds } });
        console.log(`✅ ${videoIds.length} videos eliminados`);
      }

      // ============================================
      // 9. ELIMINAR TODOS LOS CANALES
      // ============================================
      if (channelIds.length > 0) {
        await Channel.deleteMany({ _id: { $in: channelIds } });
        console.log(`✅ ${channelIds.length} canales eliminados`);
      }

      // ============================================
      // 10. ELIMINAR ARCHIVOS DE CLOUDINARY (opcional)
      // ============================================
      try {
        // Eliminar avatar del usuario
        if (userToDelete.avatar && typeof userToDelete.avatar === 'string') {
          const publicId = userToDelete.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`avatars/${publicId}`);
        }

        // Eliminar avatars y covers de canales
        for (const channel of channels) {
          if (channel.avatar && channel.avatar.length > 0) {
            for (const avatar of channel.avatar) {
              if (avatar.public_id) {
                await cloudinary.uploader.destroy(avatar.public_id);
              }
            }
          }
          if (channel.cover && channel.cover.length > 0) {
            for (const cover of channel.cover) {
              if (cover.public_id) {
                await cloudinary.uploader.destroy(cover.public_id);
              }
            }
          }
        }

        // Eliminar thumbnails y videos de Cloudinary
        for (const video of videos) {
          if (video.videoPublicId) {
            await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
          }
          if (video.thumbnail && typeof video.thumbnail === 'string') {
            const thumbId = video.thumbnail.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`thumbnails/${thumbId}`);
          }
        }

        console.log('✅ Archivos de Cloudinary eliminados');
      } catch (cloudError) {
        console.log('⚠️ Error eliminando archivos de Cloudinary:', cloudError.message);
      }

      // ============================================
      // 11. ELIMINAR EL USUARIO
      // ============================================
      await Users.findByIdAndDelete(userId);
      console.log(`✅ Usuario ${userId} eliminado completamente`);

      res.status(200).json({
        success: true,
        msg: 'Compte et tout son contenu supprimés avec succès',
        deletedData: {
          userId: userId,
          channelsDeleted: channelIds.length,
          videosDeleted: videoIds.length
        }
      });

    } catch (error) {
      console.error('❌ Error al eliminar usuario completo:', error);
      res.status(500).json({
        success: false,
        msg: error.message || 'Erreur lors de la suppression du compte'
      });
    }
  },
  deleteUser: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, msg: 'Acceso denegado.' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, msg: 'ID no válido' });
      }
      const userToDelete = await Users.findById(req.params.id);
      if (!userToDelete) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
      if (userToDelete._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, msg: 'No puedes eliminarte a ti mismo' });
      }
      const userVideos = await Video.find({ user: req.params.id });
      await Video.deleteMany({ user: req.params.id });
      await Comments.deleteMany({ videoId: { $in: userVideos.map(v => v._id) } });
      await Report.deleteMany({ $or: [{ userId: req.params.id }, { reportedBy: req.params.id }] });
      await Comments.deleteMany({ user: req.params.id });
      await Notifications.deleteMany({ $or: [{ sender: req.params.id }, { recipient: req.params.id }] });
      await Users.updateMany({ $or: [{ followers: req.params.id }, { following: req.params.id }, { savedVideos: { $in: userVideos.map(v => v._id) } }] }, {
        $pull: { followers: req.params.id, following: req.params.id, savedVideos: { $in: userVideos.map(v => v._id) } }
      });
      await Video.updateMany({ likes: req.params.id }, { $pull: { likes: req.params.id } });
      await userToDelete.deleteOne();
      res.json({ success: true, msg: 'Usuario eliminado permanentemente', deletedAt: new Date() });
    } catch (err) {
      console.error('Error en eliminación:', err);
      res.status(500).json({ success: false, msg: 'Error al eliminar usuario', error: err.message });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;
      const user = await Users.findById(userId).select('-password').populate('followers', '_id').populate('following', '_id');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const followers = user.followers || [];
      const following = user.following || [];
      let isFollowing = false;
      if (currentUserId && currentUserId.toString() !== userId) {
        isFollowing = Array.isArray(followers) && followers.some(f => f && f._id && f._id.toString() === currentUserId.toString());
      }
      const videoStats = await Video.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), pendiente: false, isActive: true } },
        { $group: { _id: null, totalVideos: { $sum: 1 }, totalLikes: { $sum: { $size: '$likes' } }, totalViews: { $sum: '$views' }, totalComments: { $sum: { $size: '$comments' } }, totalShares: { $sum: { $size: { $ifNull: ['$shares', []] } } } } }
      ]);
      res.json({
        success: true, profile: {
          _id: user._id, username: user.username, avatar: user.avatar, bio: user.bio || '', fullname: user.fullname || user.username,
          isPro: user.isPro || false, role: user.role, followersCount: followers.length || 0, followingCount: following.length || 0,
          profileViewsCount: user.profileViewsCount || 0, isFollowing,
          videoStats: videoStats[0] || { totalVideos: 0, totalLikes: 0, totalViews: 0, totalComments: 0, totalShares: 0 }
        }
      });
    } catch (err) {
      console.error('Error getUserProfile:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getUsersAction: async (req, res) => {
    try {
      const filter = req.query.filter;
      const query = Users.find().select('-password').populate('followers', 'username avatar').populate('following', 'username avatar').lean();
      const features = new APIfeatures(query, req.query).paginating();
      const users = await features.query.sort('-createdAt');
      const usersWithDetails = await Promise.all(users.map(async (user) => {
        try {
          const videos = await Video.find({ user: user._id, pendiente: false, isActive: true });
          const totalLikesReceived = videos.reduce((acc, video) => acc + (video.likes ? video.likes.length : 0), 0);
          const totalCommentsReceived = videos.reduce((acc, video) => acc + (video.comments ? video.comments.length : 0), 0);
          const reportsReceived = await Report.countDocuments({ userId: user._id });
          const likesGiven = await Video.countDocuments({ likes: user._id });
          const commentsMade = await Comments.countDocuments({ user: user._id });
          let blockInfoData = null;
          if (user.isBlocked && user.blockDetails && user.blockDetails.reason) {
            blockInfoData = { motivo: user.blockDetails.reason || 'Sin especificar', content: user.blockDetails.description, fechaLimite: user.blockDetails.blockExpiryDate, esBloqueado: user.isBlocked, bloqueadoEn: user.blockDetails.blockDate, bloqueadoPor: user.blockDetails.blockedBy || null };
          }
          return { ...user, isBlocked: user.isBlocked || false, blockInfo: blockInfoData, blockDetails: user.blockDetails, videoCount: videos.length, totalLikesReceived, totalCommentsReceived, totalFollowers: user.followers.length || 0, totalFollowing: user.following.length || 0, totalReportsReceived: reportsReceived, likesGiven, commentsMade, videos: videos || [] };
        } catch (userError) {
          console.error('Error procesando usuario:', userError);
          return { ...user, isBlocked: user.isBlocked || false, videoCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0, totalFollowers: 0, totalFollowing: 0, totalReportsReceived: 0, likesGiven: 0, commentsMade: 0, blockInfo: null, videos: [] };
        }
      }));
      switch (filter) {
        case 'mostLikes': usersWithDetails.sort((a, b) => b.totalLikesReceived - a.totalLikesReceived); break;
        case 'mostComments': usersWithDetails.sort((a, b) => b.totalCommentsReceived - a.totalCommentsReceived); break;
        case 'mostFollowers': usersWithDetails.sort((a, b) => b.totalFollowers - a.totalFollowers); break;
        case 'mostVideos': usersWithDetails.sort((a, b) => b.videoCount - a.videoCount); break;
        case 'mostReports': usersWithDetails.sort((a, b) => b.totalReportsReceived - a.totalReportsReceived); break;
        case 'lastLogin': usersWithDetails.sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0)); break;
        case 'latestRegistered': usersWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        default: break;
      }
      res.json({ msg: 'Success!', result: usersWithDetails.length, users: usersWithDetails });
    } catch (err) {
      console.error('ERROR en getUsersAction:', err);
      return res.status(500).json({ msg: err.message, users: [] });
    }
  },

  getInactiveUsers: async (req, res) => {
    try {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const inactiveCandidates = await Users.find({ isVerified: true, createdAt: { $lt: oneMonthAgo } }).select('_id username email createdAt');
      const trulyInactive = [];
      for (const user of inactiveCandidates) {
        const hasVideos = await Video.exists({ user: user._id });
        const hasComments = await Comments.exists({ user: user._id });
        if (!hasVideos && !hasComments) trulyInactive.push(user);
      }
      res.json({ inactiveUsers: trulyInactive });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  blockUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, description, blockExpiryDate } = req.body;
      const adminId = req.user._id;
      if (!reason) return res.status(400).json({ message: 'Le motif du blocage est requis' });
      const user = await Users.findById(id);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      if (!user.blockHistory) user.blockHistory = [];
      user.blockHistory.push({ reason, description, blockDate: new Date(), blockExpiryDate: blockExpiryDate || null, blockedBy: adminId });
      user.isBlocked = true;
      user.isActive = false;
      user.blockDetails = { reason, description, blockDate: new Date(), blockExpiryDate: blockExpiryDate || null, blockedBy: adminId };
      await user.save();
      res.json({ success: true, message: 'Utilisateur bloqué avec succès', user: { _id: user._id, isBlocked: user.isBlocked, isActive: user.isActive, blockDetails: user.blockDetails } });
    } catch (error) {
      console.error('Error blockUser:', error);
      res.status(500).json({ message: error.message || 'Erreur lors du blocage' });
    }
  },

  unblockUser: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user._id;
      const user = await Users.findById(id);
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      if (user.blockHistory && user.blockHistory.length > 0) {
        const lastBlock = user.blockHistory[user.blockHistory.length - 1];
        if (!lastBlock.unblockDate) { lastBlock.unblockDate = new Date(); lastBlock.unblockedBy = adminId; }
      }
      user.isBlocked = false;
      user.isActive = true;
      user.blockDetails = { reason: null, description: null, blockDate: null, blockExpiryDate: null, blockedBy: null };
      await user.save();
      res.json({ success: true, message: 'Utilisateur débloqué avec succès', user: { _id: user._id, isBlocked: user.isBlocked, isActive: user.isActive } });
    } catch (error) {
      console.error('Error unblockUser:', error);
      res.status(500).json({ message: error.message || 'Erreur lors du déblocage' });
    }
  },

  activateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json({ success: true, message: 'Utilisateur activé', user: { _id: user._id, isActive: user.isActive, isBlocked: user.isBlocked } });
    } catch (error) {
      console.error('Error activateUser:', error);
      res.status(500).json({ message: error.message });
    }
  },

  deactivateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json({ success: true, message: 'Utilisateur désactivé', user: { _id: user._id, isActive: user.isActive, isBlocked: user.isBlocked } });
    } catch (error) {
      console.error('Error deactivateUser:', error);
      res.status(500).json({ message: error.message });
    }
  },

  activatePro: async (req, res) => {
    try {
      const { userId } = req.params;
      const { proExpiryDate } = req.body;
      if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès non autorisé.' });
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      user.isPro = true;
      user.proExpiryDate = proExpiryDate || null;
      await user.save();
      res.json({ success: true, message: 'Compte Pro activé', user: { _id: user._id, username: user.username, email: user.email, isPro: user.isPro, proExpiryDate: user.proExpiryDate } });
    } catch (error) {
      console.error('Error activatePro:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deactivatePro: async (req, res) => {
    try {
      const { userId } = req.params;
      if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès non autorisé.' });
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      user.isPro = false;
      user.proExpiryDate = null;
      await user.save();
      res.json({ success: true, message: 'Compte Pro désactivé', user: { _id: user._id, username: user.username, email: user.email, isPro: user.isPro, proExpiryDate: user.proExpiryDate } });
    } catch (error) {
      console.error('Error deactivatePro:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getFollowers: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate('followers', 'username avatar fullname bio isPro role');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const followersList = user.followers || [];
      const currentUserId = req.user._id;
      let currentUserFollowing = [];
      if (currentUserId) {
        const currentUser = await Users.findById(currentUserId).select('following');
        currentUserFollowing = (currentUser.following || []).map(id => id.toString());
      }
      const followersWithStatus = followersList.map(follower => {
        const followerObj = follower.toObject ? follower.toObject() : follower;
        followerObj.isFollowing = currentUserFollowing.includes(followerObj._id.toString());
        return followerObj;
      });
      res.json({ success: true, users: followersWithStatus, count: followersWithStatus.length });
    } catch (err) {
      console.error('Error getFollowers:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getFollowing: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findById(userId).populate('following', 'username avatar fullname bio isPro role');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const followingList = user.following || [];
      const currentUserId = req.user._id;
      let currentUserFollowing = [];
      if (currentUserId) {
        const currentUser = await Users.findById(currentUserId).select('following');
        currentUserFollowing = (currentUser.following || []).map(id => id.toString());
      }
      const followingWithStatus = followingList.map(follow => {
        const followObj = follow.toObject ? follow.toObject() : follow;
        followObj.isFollowing = currentUserFollowing.includes(followObj._id.toString());
        return followObj;
      });
      res.json({ success: true, users: followingWithStatus, count: followingWithStatus.length });
    } catch (err) {
      console.error('Error getFollowing:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getProfileViews: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;
      const currentUserRole = req.user.role;
      if (currentUserId.toString() !== userId && currentUserRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'No autorizado' });
      }
      const user = await Users.findById(userId).populate('profileViews.user', 'username avatar fullname bio isPro role');
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const profileViewsList = user.profileViews || [];
      const views = profileViewsList.filter(view => view && view.user).sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt)).map(view => ({ ...view.user.toObject(), viewedAt: view.viewedAt }));
      res.json({ success: true, views, count: views.length });
    } catch (err) {
      console.error('Error getProfileViews:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  registerProfileView: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;
      if (currentUserId.toString() === userId) return res.json({ success: true, message: 'No se registra vista propia' });
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const existingView = user.profileViews.find(view => view.user.toString() === currentUserId.toString() && new Date(view.viewedAt) > oneDayAgo);
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
        const count = (user.profileViews || []).filter(view => new Date(view.viewedAt) >= day && new Date(view.viewedAt) < nextDay).length || 0;
        weeklyViews.push({ date: day.toLocaleDateString('fr-FR', { weekday: 'short' }), count });
      }
      res.json({ success: true, stats: { totalViews: user.profileViewsCount || 0, weeklyViews, followersCount: user.followers.length || 0, followingCount: user.following.length || 0 } });
    } catch (err) {
      console.error('❌ Error getProfileStats:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  saveVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user._id;
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      const isSaved = user.savedVideos.includes(videoId) || false;
      if (isSaved) {
        await Users.findByIdAndUpdate(userId, { $pull: { savedVideos: videoId } });
        return res.json({ success: true, saved: false, message: 'Video eliminado de guardados' });
      } else {
        await Users.findByIdAndUpdate(userId, { $push: { savedVideos: videoId } });
        return res.json({ success: true, saved: true, message: 'Video guardado correctamente' });
      }
    } catch (err) {
      console.error('❌ Error saveVideo:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== FUNCIONES DE ADMIN ====================
  getUserTransactions: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès admin requis' });
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      const Transaction = require('../models/Transaction');
      const transactions = await Transaction.find({ user_id: userId }).sort({ createdAt: -1 }).limit(parseInt(limit));
      res.json({ success: true, transactions });
    } catch (err) {
      console.error('❌ Error getUserTransactions:', err);
      res.status(500).json({ error: err.message });
    }
  },

  updateUserPlan: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès administrateur requis' });
      const { userId } = req.params;
      const { plan, duration_months, expires_at, reason } = req.body;
      const validPlans = ['free', 'basic', 'pro', 'business'];
      if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Plan invalide' });
      const user = await Users.findById(userId);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      let planExpiresAt = null;
      if (plan !== 'free') {
        if (expires_at) planExpiresAt = new Date(expires_at);
        else if (duration_months && duration_months > 0) { planExpiresAt = new Date(); planExpiresAt.setMonth(planExpiresAt.getMonth() + duration_months); }
        else { planExpiresAt = new Date(); planExpiresAt.setMonth(planExpiresAt.getMonth() + 1); }
      }
      const previousPlan = user.channelPlan;
      const previousExpiry = user.channelPlanExpiresAt;
      user.channelPlan = plan;
      user.channelPlanExpiresAt = planExpiresAt;
      user.channelPlanAutoRenew = false;
      user.isPro = (plan === 'pro' || plan === 'business');
      if (user.isPro && planExpiresAt) user.proExpiryDate = planExpiresAt;
      else if (!user.isPro) user.proExpiryDate = null;
      await user.save();
      const Transaction = require('../models/Transaction');
      const transaction = new Transaction({
        checkout_id: `admin_${Date.now()}_${userId.slice(-6)}`,
        user_id: userId,
        user_email: user.email,
        user_username: user.username,
        plan_id: plan,
        plan_name: plan === 'basic' ? 'Plan Basic' : plan === 'pro' ? 'Plan Pro' : plan === 'business' ? 'Plan Business' : 'Plan Gratuit',
        duration_months: duration_months || (planExpiresAt ? Math.ceil((planExpiresAt - new Date()) / (1000 * 60 * 60 * 24 * 30)) : 0),
        amount: 0,
        currency: 'dzd',
        status: 'paid',
        payment_completed_at: new Date(),
        plan_expires_at: planExpiresAt,
        chargily_response: { admin_manual: true, reason: reason || `Admin ${req.user.username} action`, previous_plan: previousPlan, previous_expiry: previousExpiry }
      });
      await transaction.save();
      const userResponse = user.toObject();
      delete userResponse.password;
      res.json({ success: true, user: userResponse, message: `Plan ${plan} activé avec succès${planExpiresAt ? ` jusqu'au ${planExpiresAt.toLocaleDateString()}` : ''}` });
    } catch (err) {
      console.error('❌ Error updateUserPlan:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== VIDEOS DEL USUARIO ====================
  getUserVideos: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 12, filter = 'all' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      let match = { user: new mongoose.Types.ObjectId(userId), isActive: true };

      if (filter === 'pending') {
        match.pendiente = true;
      } else if (filter === 'approved') {
        match.pendiente = false;
      }

      const videos = await Video.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'username avatar')
        .populate('channel', 'name avatar')
        .lean();

      const total = await Video.countDocuments(match);
      const pendingCount = await Video.countDocuments({ user: new mongoose.Types.ObjectId(userId), pendiente: true, isActive: true });
      const approvedCount = await Video.countDocuments({ user: new mongoose.Types.ObjectId(userId), pendiente: false, isActive: true });

      const currentUserId = req.user._id;
      const videosWithStatus = videos.map(v => ({
        ...v,
        liked: v.likes.some(id => id.toString() === currentUserId.toString()) || false
      }));

      res.json({
        success: true,
        videos: videosWithStatus,
        total,
        pendingCount,
        approvedCount,
        page: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + videos.length < total
      });
    } catch (err) {
      console.error('Error getUserVideos:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== SEGUIR/DEJAR DE SEGUIR USUARIO ====================
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

      const isFollowing = currentUser.following.includes(id) || false;

      if (isFollowing) {
        await Users.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
        await Users.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
      } else {
        await Users.findByIdAndUpdate(currentUserId, { $addToSet: { following: id } });
        await Users.findByIdAndUpdate(id, { $addToSet: { followers: currentUserId } });
      }

      const updatedUser = await Users.findById(id);
      const followersCount = updatedUser.followers.length || 0;

      res.json({
        success: true,
        isFollowing: !isFollowing,
        followersCount
      });
    } catch (err) {
      console.error('Error toggleFollow:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ==================== ACTUALIZAR ROL DE USUARIO ====================
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const validRoles = ['user', 'moderator', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Rôle invalide' });
      }

      const user = await Users.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      res.json({ success: true, user });
    } catch (err) {
      console.error('Error updateUserRole:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  likeVideo: async (req, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user._id;

      console.log(`📥 likeVideo - videoId: ${videoId}, userId: ${userId}`);

      // Buscar el video
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ success: false, msg: "Video no encontrado" });
      }

      // Buscar el usuario (importar Users)
      const Users = require('../models/userModel');
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, msg: "Usuario no encontrado" });
      }

      // Verificar si ya tiene like
      const isLiked = video.likes.includes(userId);

      if (isLiked) {
        // ========== UNLIKE (Quitar like) ==========
        console.log('📥 Quitando like...');

        // 1. Quitar like del video
        await Video.findByIdAndUpdate(videoId, { $pull: { likes: userId } });

        // 2. Quitar video de likedVideos del usuario
        await Users.findByIdAndUpdate(userId, { $pull: { likedVideos: videoId } });

        console.log('✅ Like removido correctamente');

        res.json({
          success: true,
          isLiked: false,
          likesCount: (video.likes.length - 1),
          message: "Like removed"
        });

      } else {
        // ========== LIKE (Agregar like) ==========
        console.log('📥 Agregando like...');

        // 1. Agregar like al video
        await Video.findByIdAndUpdate(videoId, { $push: { likes: userId } });

        // 2. Agregar video a likedVideos del usuario
        await Users.findByIdAndUpdate(userId, { $addToSet: { likedVideos: videoId } });

        console.log('✅ Like agregado correctamente');

        // 3. Crear notificación (solo si no es su propio video)
        if (video.user.toString() !== userId.toString()) {
          const Notifications = require('../models/notifyModel');
          const notification = new Notifications({
            recipients: [video.user],
            sender: userId,
            text: `❤️ ${user.username} a aimé votre vidéo`,
            url: `/video/${videoId}`,
            type: 'video',
            content: video.title
          });
          await notification.save();
          console.log('✅ Notificación enviada');
        }

        res.json({
          success: true,
          isLiked: true,
          likesCount: (video.likes.length + 1),
          message: "Like added"
        });
      }

    } catch (err) {
      console.error('❌ Error en likeVideo:', err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  // ==================== VERIFICAR/DESVERIFICAR USUARIO ====================
  toggleVerification: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isVerified } = req.body;

      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès non autorisé' });
      }

      const user = await Users.findByIdAndUpdate(
        userId,
        { isVerified },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      res.json({
        success: true,
        message: isVerified ? 'Utilisateur vérifié' : 'Vérification retirée',
        isVerified: user.isVerified
      });
    } catch (err) {
      console.error('Error toggleVerification:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },





















  // backend/controllers/userController.js - AÑADIR ESTA FUNCIÓN

  // ============================================
  // 🗑️ DELETE USER ACCOUNT - ELIMINACIÓN COMPLETA
  // ============================================
  deleteUserAccount: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'Utilisateur non trouvé'
        });
      }

      console.log(`🗑️ Eliminando cuenta de usuario: ${user.email} (${userId})`);

      // ============================================
      // 1. OBTENER TODOS LOS CANALES DEL USUARIO
      // ============================================
      const channels = await Channel.find({ owner: userId });
      const channelIds = channels.map(ch => ch._id);

      console.log(`📺 Canales encontrados: ${channels.length}`);

      // ============================================
      // 2. ELIMINAR VIDEOS DE CLOUDINARY
      // ============================================
      const videos = await Video.find({ user: userId });
      console.log(`📹 Videos encontrados: ${videos.length}`);

      const deletionErrors = [];

      for (const video of videos) {
        // Eliminar video de Cloudinary
        if (video.videoPublicId) {
          try {
            const result = await cloudinary.uploader.destroy(video.videoPublicId, { resource_type: 'video' });
            if (result.result !== 'ok' && result.result !== 'not found') {
              deletionErrors.push(`Video ${video._id}: ${result.result}`);
            }
          } catch (err) {
            deletionErrors.push(`Video ${video._id}: ${err.message}`);
          }
        }

        // Eliminar thumbnail de Cloudinary
        if (video.thumbnail && video.thumbnail.includes('cloudinary.com')) {
          try {
            let publicId = video.thumbnail.split('/').pop().split('.')[0];
            const match = video.thumbnail.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
            if (match) publicId = match[1];
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          } catch (err) {
            // No es crítico si falla
          }
        }
      }

      // ============================================
      // 3. ELIMINAR VIDEOS DE LA BD
      // ============================================
      await Video.deleteMany({ user: userId });

      // ============================================
      // 4. ELIMINAR CANALES DE LA BD
      // ============================================
      await Channel.deleteMany({ owner: userId });

      // ============================================
      // 5. ELIMINAR AVATAR DE CLOUDINARY
      // ============================================
      if (user.avatar && user.avatar.includes('cloudinary.com')) {
        try {
          let publicId = user.avatar.split('/').pop().split('.')[0];
          const match = user.avatar.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
          if (match) publicId = match[1];
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } catch (err) {
          // No es crítico si falla
        }
      }

      // ============================================
      // 6. ELIMINAR REFERENCIAS EN OTROS USUARIOS
      // ============================================
      // Remover usuario de followers de otros
      await User.updateMany(
        { followers: userId },
        { $pull: { followers: userId } }
      );

      // Remover usuario de following de otros
      await User.updateMany(
        { following: userId },
        { $pull: { following: userId } }
      );

      // Remover usuario de followingChannels de otros
      await User.updateMany(
        { followingChannels: { $in: channelIds } },
        { $pull: { followingChannels: { $in: channelIds } } }
      );

      // Remover likes de videos
      await Video.updateMany(
        { likes: userId },
        { $pull: { likes: userId } }
      );

      // Remover savedVideos
      await User.updateMany(
        { savedVideos: { $in: videos.map(v => v._id) } },
        { $pull: { savedVideos: { $in: videos.map(v => v._id) } } }
      );

      // ============================================
      // 7. ELIMINAR NOTIFICACIONES DEL USUARIO
      // ============================================
      await Notify.deleteMany({
        $or: [
          { sender: userId },
          { recipients: userId }
        ]
      });

      // ============================================
      // 8. ELIMINAR COMENTARIOS DEL USUARIO
      // ============================================
      await Comment.deleteMany({ user: userId });

      // Remover comentarios de videos
      await Video.updateMany(
        { 'comments.user': userId },
        { $pull: { comments: { user: userId } } }
      );

      // ============================================
      // 9. ELIMINAR EL USUARIO
      // ============================================
      await User.findByIdAndDelete(userId);

      console.log(`✅ Cuenta eliminada completamente: ${user.email}`);
      console.log(`   - Canales: ${channels.length}`);
      console.log(`   - Videos: ${videos.length}`);
      if (deletionErrors.length) {
        console.warn(`   - Errores en Cloudinary: ${deletionErrors.length}`);
      }

      res.json({
        success: true,
        msg: 'Compte supprimé avec succès',
        deletedData: {
          channels: channels.length,
          videos: videos.length,
          errors: deletionErrors
        }
      });

    } catch (error) {
      console.error('❌ Error deleteUserAccount:', error);
      res.status(500).json({
        success: false,
        msg: error.message
      });
    }
  }
















};

module.exports = userCtrl;
// controllers/imageCtrl.js
const Image = require('../models/imageModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========== FUNCIONES PÚBLICAS ==========

// ✅ Obtener imagen por ID (pública)
const getImageByIdPublic = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID d\'image invalide' });
    }

    const image = await Image.findById(id)
      .populate('user', 'username avatar isPro role')
      .populate('comments.user', 'username avatar isPro')
      .populate('comments.replies.user', 'username avatar isPro')
      .lean();

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }

    // Si está pendiente - devolver con mensaje
    if (image.pendiente === true) {
      return res.status(200).json({ 
        success: false,
        image: image,
        message: '🖼️ Votre image a été envoyée aux administrateurs pour validation.'
      });
    }

    // Incrementar vistas
    await Image.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    let liked = false;
    if (req.user && req.user._id && image.likes) {
      const userIdStr = req.user._id.toString();
      liked = image.likes.some(likeId => likeId && likeId.toString() === userIdStr);
    }

    const imageData = { ...image, liked };
    res.json({ success: true, image: imageData });
  } catch (error) {
    console.error('Error getImageByIdPublic:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener imagen por ID (privada - para admin/owner)
const getImageByIdPrivate = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const image = await Image.findById(id)
      .populate('user', 'username avatar isPro role')
      .populate('comments.user', 'username avatar isPro')
      .populate('comments.replies.user', 'username avatar isPro')
      .lean();

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    const isOwner = image.user._id.toString() === req.user._id.toString();

    if (image.pendiente === true && !isAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'avez pas la permission de voir cette image' 
      });
    }

    if (!image.pendiente || isAdmin) {
      Image.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
      if (req.user && req.user._id) {
        Image.findByIdAndUpdate(id, { $addToSet: { uniqueViews: req.user._id } }).exec();
      }
    }

    let liked = false;
    if (req.user && req.user._id && image.likes) {
      const userIdStr = req.user._id.toString();
      liked = image.likes.some(likeId => likeId && likeId.toString() === userIdStr);
    }

    const imageData = { ...image, liked };
    res.json({ success: true, image: imageData });
  } catch (error) {
    console.error('Error getImageByIdPrivate:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener todas las imágenes (feed)
const getImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { searchTerm, sortBy = 'recent' } = req.query;

    let match = { pendiente: false, isActive: true };
    
    if (searchTerm && searchTerm.trim() !== '') {
      match.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    let sort = {};
    switch(sortBy) {
      case 'popular': sort = { views: -1 }; break;
      case 'liked': sort = { likesCount: -1 }; break;
      default: sort = { createdAt: -1 };
    }

    const pipeline = [
      { $match: match },
      { $addFields: { likesCount: { $size: '$likes' }, commentsCount: { $size: '$comments' } } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.password': 0, 'user.email': 0 } }
    ];

    const [images, total] = await Promise.all([
      Image.aggregate(pipeline),
      Image.countDocuments(match)
    ]);

    res.json({
      success: true,
      images,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      hasMore: skip + images.length < total
    });
  } catch (error) {
    console.error('Error getImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener imágenes de un usuario
const getUserImages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const isOwnerOrAdmin = req.user && (req.user._id.toString() === userId || req.user.role === 'admin');
    const result = await Image.getUserImages(userId, isOwnerOrAdmin, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      images: result.images,
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error getUserImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener imágenes destacadas
const getFeaturedImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const images = await Image.getFeaturedImages(parseInt(limit));
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error getFeaturedImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener imágenes populares
const getPopularImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const images = await Image.getPopularImages(parseInt(limit));
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error getPopularImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Obtener imágenes tendencia
const getTrendingImages = async (req, res) => {
  try {
    const { limit = 10, timeRange = 'week' } = req.query;
    const images = await Image.getTrendingImages(parseInt(limit), timeRange);
    res.json({ success: true, images });
  } catch (error) {
    console.error('Error getTrendingImages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== FUNCIONES PROTEGIDAS ==========

// ✅ Crear imagen
const createImage = async (req, res) => {
  try {
    const { title, description, imageUrl, imageId, thumbnail, music } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isAdmin = user.role === 'admin';

    const image = new Image({
      title,
      description: description || '',
      shortDescription: description ? description.substring(0, 300) : '',
      imageUrl,
      imageId,
      thumbnail: thumbnail || imageUrl,
      user: userId,
      music: music || null,
      tags: [],
      pendiente: isAdmin ? false : true
    });

    await image.save();

    const populatedImage = await Image.findById(image._id)
      .populate('user', 'username avatar isPro role');

    res.status(201).json({ 
      success: true, 
      message: isAdmin ? 'Image créée avec succès' : 'Image créée et en attente d\'approbation', 
      image: populatedImage 
    });
  } catch (error) {
    console.error('Error createImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Actualizar imagen
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, music } = req.body;
    
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    
    const isOwner = image.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (title) image.title = title;
    if (description !== undefined) image.description = description;
    if (thumbnail) image.thumbnail = thumbnail;
    if (music !== undefined) image.music = music;
    
    await image.save();
    
    const updatedImage = await Image.findById(image._id)
      .populate('user', 'username avatar isPro role');
    
    res.json({ success: true, message: 'Image mise à jour', image: updatedImage });
  } catch (error) {
    console.error('Error updateImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Eliminar imagen
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }

    const isOwner = image.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Eliminar de Cloudinary
    if (image.imageId) {
      try {
        await cloudinary.uploader.destroy(image.imageId, { resource_type: 'image' });
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }

    await image.deleteOne();
    res.json({ success: true, message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('Error deleteImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Like/Unlike imagen
const toggleLikeImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    const { liked, likesCount } = await image.toggleLike(req.user._id);
    res.json({ success: true, likes: likesCount, liked });
  } catch (error) {
    console.error('Error toggleLikeImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Compartir imagen
const shareImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    const { shared, sharesCount } = await image.share(req.user._id);
    res.json({ success: true, shares: sharesCount, shared });
  } catch (error) {
    console.error('Error shareImage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Incrementar vistas de imagen
const incrementImageView = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    await image.incrementViews(req.user._id);
    res.json({ success: true, views: image.views });
  } catch (error) {
    console.error('Error incrementImageView:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== FUNCIONES DE ADMIN ==========

// ✅ Obtener imágenes pendientes
const getPendingImagesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await Image.getPendingImages(parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      images: result.images,
      total: result.total,
      page: parseInt(page),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error getPendingImagesAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Aprobar imagen
const approveImageAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id).populate('user', 'username email avatar');
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    
    image.pendiente = false;
    await image.save();
    
    res.json({ success: true, message: 'Image approuvée avec succès', image });
  } catch (error) {
    console.error('Error approveImageAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Rechazar/Eliminar imagen (admin)
const rejectImageAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image non trouvée' });
    }
    
    // Eliminar de Cloudinary
    if (image.imageId) {
      try {
        await cloudinary.uploader.destroy(image.imageId, { resource_type: 'image' });
      } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
      }
    }
    
    await image.deleteOne();
    res.json({ success: true, message: 'Image rejetée et supprimée' });
  } catch (error) {
    console.error('Error rejectImageAdmin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Estadísticas del usuario para imágenes
const getUserImageStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Image.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), pendiente: false } },
      { $group: {
        _id: null,
        totalImages: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } },
        totalShares: { $sum: { $size: { $ifNull: ['$shares', []] } } }
      }}
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || { totalImages: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 }
    });
  } catch (error) {
    console.error('Error getUserImageStats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Públicas
  getImageByIdPublic,
  getImageByIdPrivate,
  getImages,
  getUserImages,
  getFeaturedImages,
  getPopularImages,
  getTrendingImages,
  // Protegidas
  createImage,
  updateImage,
  deleteImage,
  toggleLikeImage,
  shareImage,
  incrementImageView,
  getUserImageStats,
  // Admin
  getPendingImagesAdmin,
  approveImageAdmin,
  rejectImageAdmin
};
const Video = require('../models/videoModel'); // ✅ Cambiado a Video
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Generar slug único
const generateUniqueSlug = async (title) => {
  let base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = base;
  let counter = 1;
  while (await Video.findOne({ slug })) { // ✅ Video
    slug = `${base}-${counter++}`;
  }
  return slug;
};

// ========== CREATE ==========
// backend/controllers/artworkController.js (fragmento de createArtwork)
const createArtwork = async (req, res) => {
  try {
    const {
      title, description, category, technique, style, width, height, price,
      videoUrl, videoPublicId, thumbnail, duration, images, music,
      status = 'en vente',  // ← Añadir
      stock = 1             // ← Añadir
    } = req.body;

    const userId = req.user._id;

    // Validaciones
    if (!title || !category || !technique || !style || !width || !height || !price) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'La vidéo est obligatoire' });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Catégorie invalide' });
    }

    const slug = await generateUniqueSlug(title);

    const newVideo = new Video({
      title,
      slug,
      description: description || '',
      shortDescription: description ? description.substring(0, 300) : '',
      videoUrl,
      videoPublicId: videoPublicId || '',
      thumbnail: thumbnail || '',
      duration: duration || 0,
      images: images || [],
      category: categoryDoc._id,
      technique,
      style,
      width: Number(width),
      height: Number(height),
      price: Number(price),
      music: music || null,
      user: userId,
      isActive: true,
      status,        // ← Guardar
      stock: Number(stock) // ← Guardar
    });

    await newVideo.save();
    await Category.findByIdAndUpdate(categoryDoc._id, { $inc: { videoCount: 1 } });

    const populated = await Video.findById(newVideo._id)
      .populate('category', 'name slug icon')
      .populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Œuvre publiée avec succès',
      artwork: populated // O video, según lo que espere el frontend
    });
  } catch (error) {
    console.error('❌ createArtwork error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// En updateArtwork, añadir status y stock a los campos permitidos
const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const artwork = await Video.findById(id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Œuvre non trouvée' });
    
    const isOwner = artwork.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    
    // Añadir status y stock a los campos permitidos
    const allowed = [
      'title', 'description', 'technique', 'style', 'width', 'height', 
      'price', 'category', 'tags', 'isFeatured', 'images', 'thumbnail', 
      'videoUrl', 'status', 'stock'  // ← Añadir
    ];
    allowed.forEach(field => {
      if (updates[field] !== undefined) artwork[field] = updates[field];
    });
    if (updates.title) artwork.slug = await generateUniqueSlug(updates.title);
    await artwork.save();
    res.json({ success: true, message: 'Œuvre mise à jour', artwork });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ========== OBTENER POR ID ==========
const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    const video = await Video.findById(id) // ✅ Video
      .populate('category', 'name slug icon')
      .populate('user', 'username avatar bio');
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    res.json({ success: true, artwork: video }); // o video según el frontend
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== OBRAS POR CATEGORÍA ==========
const getArtworksByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12, sortBy = 'recent' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    if (!category) {
      return res.json({ success: true, artworks: [], total: 0 });
    }

    let sort = {};
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'popular') sort = { views: -1 };
    else sort = { createdAt: -1 };

    const filter = { category: category._id, isActive: true };
    const videos = await Video.find(filter) // ✅ Video
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug icon')
      .populate('user', 'username avatar');
    const total = await Video.countDocuments(filter); // ✅ Video

    res.json({
      success: true,
      artworks: videos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + videos.length < total,
      categoryInfo: { _id: category._id, name: category.name, slug: category.slug, icon: category.icon }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== INTERACCIONES ==========
const toggleLikeArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id); // ✅ Video
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    const result = await video.toggleLike(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleSaveArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id); // ✅ Video
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    const result = await video.toggleSave(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const shareArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id); // ✅ Video
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    const result = await video.incrementShare(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const incrementArtworkView = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id); // ✅ Video
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    const result = await video.incrementView(req.user._id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== DELETE ==========
const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id); // ✅ Video
    if (!video) return res.status(404).json({ success: false, message: 'Vidéo non trouvée' });
    const isOwner = video.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }
    await video.deleteOne();
    res.json({ success: true, message: 'Vidéo supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== UPDATE ==========


// ========== MIS OBRAS ==========
const getUserArtworks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find({ user: userId, isActive: true }) // ✅ Video
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug');
    const total = await Video.countDocuments({ user: userId, isActive: true }); // ✅ Video
    res.json({
      success: true,
      artworks: videos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasMore: skip + videos.length < total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createArtwork,
  getArtworkById,
  getArtworksByCategory,
  toggleLikeArtwork,
  toggleSaveArtwork,
  shareArtwork,
  incrementArtworkView,
  deleteArtwork,
  updateArtwork,
  getUserArtworks
};
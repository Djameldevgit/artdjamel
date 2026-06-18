const Category = require('../models/categoryModel');
const Video = require('../models/videoModel'); // ✅ Importado correctamente
const mongoose = require('mongoose');

// ==================== 1. CATEGORÍAS CON VÍDEOS (HOME) ====================
const getCategoriesWithVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const videosPerCategory = parseInt(req.query.videosPerCategory) || 6;
    const skip = (page - 1) * limit;

    const totalCategories = await Category.countDocuments({ isActive: true });
    const hasMore = skip + limit < totalCategories;

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const categoriesWithVideos = await Promise.all(
      categories.map(async (category) => {
        try {
          const videos = await Video.find({
            category: category._id,
            isActive: true,
          })
            .sort({ createdAt: -1 })
            .limit(videosPerCategory)
            .populate('user', 'username avatar')
            .populate('category', 'slug name')
            .lean();

          return {
            ...category,
            videos: videos,
            videoCount: videos.length,
          };
        } catch (err) {
          console.error(`Error en categoría ${category.name}:`, err.message);
          return { ...category, videos: [], videoCount: 0 };
        }
      })
    );

    res.json({
      success: true,
      categories: categoriesWithVideos,
      currentPage: page,
      hasMoreCategories: hasMore,
      totalCategories,
      limit,
      videosPerCategory,
    });
  } catch (error) {
    console.error('❌ Error getCategoriesWithVideos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 2. VÍDEOS POR CATEGORÍA (PÁGINA DE CATEGORÍA) ====================
const getVideosByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { sortBy = 'recent' } = req.query;

    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) {
      return res.json({ success: true, videos: [], total: 0 });
    }

    let sort = {};
    switch (sortBy) {
      case 'price_asc': sort = { price: 1 }; break;
      case 'price_desc': sort = { price: -1 }; break;
      case 'views': sort = { views: -1 }; break;
      case 'likes': sort = { likes: -1 }; break;
      default: sort = { createdAt: -1 };
    }

    const filter = { category: category._id, isActive: true };
    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar')
        .populate('category', 'slug name')
        .lean(),
      Video.countDocuments(filter),
    ]);

    res.json({
      success: true,
      videos,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      totalPages: Math.ceil(total / limit),
      categoryInfo: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        iconColor: category.iconColor,
      },
    });
  } catch (error) {
    console.error('❌ Error getVideosByCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 3. CATEGORÍAS PARA SLIDER ====================
const getCategoriesForSlider = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('_id name slug icon iconType iconColor bgColor order')
      .sort({ order: 1 })
      .lean();
    res.json({ success: true, categories, total: categories.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 4. CATEGORÍAS PRINCIPALES (PAGINADAS) ====================
const getMainCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const [categories, total] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments({ isActive: true }),
  ]);
  res.json({
    success: true,
    categories,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      hasMore: page * limit < total,
    },
  });
};

// ==================== 5. ESTADÍSTICAS DE CATEGORÍAS ====================
const getCategoryStats = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalVideos = await Video.countDocuments({ isActive: true });
    const categoriesWithVideos = await Category.countDocuments({
      isActive: true,
      videoCount: { $gt: 0 },
    });

    const topCategories = await Category.find({ isActive: true, videoCount: { $gt: 0 } })
      .sort({ videoCount: -1 })
      .limit(10)
      .select('name slug icon videoCount')
      .lean();

    res.json({
      success: true,
      stats: {
        totalCategories,
        totalVideos,
        categoriesWithVideos,
        categoriesWithoutVideos: totalCategories - categoriesWithVideos,
      },
      topCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 6. BUSCAR CATEGORÍAS ====================
const searchCategories = async (req, res) => {
  const { query } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!query || query.length < 2) {
    return res.json({
      success: true,
      categories: [],
      total: 0,
      message: 'La búsqueda debe tener al menos 2 caracteres',
    });
  }

  const categories = await Category.find({
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { slug: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  })
    .limit(limit)
    .select('_id name slug icon iconColor videoCount description')
    .lean();

  res.json({
    success: true,
    categories,
    total: categories.length,
    searchTerm: query,
  });
};

// ==================== 7. FILTROS DE CATEGORÍA (simplificado, sin wilaya ni comercial) ====================
const getCategoryFilters = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    // Rango de precios (sin wilaya ni comercial)
    const priceStats = await Video.aggregate([
      { $match: { category: category._id, isActive: true } },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
    ]);
    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 1000000 };

    res.json({
      success: true,
      categoryInfo: { _id: category._id, name: category.name, slug: category.slug },
      filters: {
        priceRange: { min: priceRange.minPrice, max: priceRange.maxPrice },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 8. ACTUALIZAR CONTADOR DE VÍDEOS (ADMIN) ====================
const updateVideoCounts = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    for (const category of categories) {
      const videoCount = await Video.countDocuments({
        category: category._id,
        isActive: true,
      });
      await Category.findByIdAndUpdate(category._id, { videoCount });
    }
    res.json({
      success: true,
      message: 'Contadores actualizados',
      updated: categories.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== 9. OBTENER CATEGORÍA POR ID (OPCIONAL) ====================
const getCategoryById = async (req, res) => {
  try {
    const { identifier } = req.params;
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier, isActive: true }
      : { slug: identifier, isActive: true };
    const category = await Category.findOne(query).lean();
    if (!category) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORTACIÓN ====================
module.exports = {
  getCategoriesForSlider,
  getMainCategories,
  getCategoryById,
  getVideosByCategory,
  getCategoryStats,
  searchCategories,
  getCategoryFilters,
  updateVideoCounts,
  getCategoriesWithVideos,
};
const CarouselImage = require('../models/CarouselImageModel');

// Manejo de errores centralizado
const handleError = (res, error, context) => {
  console.error(`❌ Error en ${context}:`, error);
  return res.status(500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
};

// Buscar imagen por ID con validación
const findCarouselById = async (id, res) => {
  try {
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID no proporcionado'
      });
      return null;
    }

    const image = await CarouselImage.findById(id);

    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
      return null;
    }

    return image;
  } catch (error) {
    handleError(res, error, 'findCarouselById');
    return null;
  }
};

const carouselHomeCtrl = {
  // ===== HOME (PÚBLICO) =====
  getHomeCarousel: async (req, res) => {
    try {
      const images = await CarouselImage.find({ isActive: true })
        .sort({ createdAt: 1 })
        .lean();

      console.log(`✅ Encontradas ${images.length} imágenes para home`);
      
      return res.json({
        success: true,
        data: images
      });
    } catch (error) {
      return handleError(res, error, 'getHomeCarousel');
    }
  },

  // ===== ADMIN - OBTENER TODAS =====
  getAllCarouselImages: async (req, res) => {
    try {
      const images = await CarouselImage.find({})
        .sort({ createdAt: 1 })
        .lean();

      console.log(`✅ Encontradas ${images.length} imágenes totales`);
      
      return res.json({
        success: true,
        data: images
      });
    } catch (error) {
      return handleError(res, error, 'getAllCarouselImages');
    }
  },

  // ===== CREAR IMAGEN =====
  createCarouselImage: async (req, res) => {
    try {
      const { title, description, link, linkType, image } = req.body;

      // Validaciones mejoradas
      if (!title || title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El título es requerido'
        });
      }

      if (!image || !image.url || !image.public_id) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es requerida (url y public_id)'
        });
      }

      // Validar URL si es externa
      if (linkType === 'external' && link && !isValidUrl(link)) {
        return res.status(400).json({
          success: false,
          message: 'La URL externa no es válida'
        });
      }

      const newImage = new CarouselImage({
        title: title.trim(),
        description: description ? description.trim() : '',
        link: link ? link.trim() : '',
        linkType: linkType || 'none',
        image: {
          url: image.url,
          public_id: image.public_id
        },
        isActive: true
      });

      await newImage.save();

      console.log('✅ Imagen creada:', newImage._id);

      return res.status(201).json({
        success: true,
        message: 'Imagen creada exitosamente',
        data: newImage
      });
    } catch (error) {
      console.error('❌ Error en createCarouselImage:', error);
      return handleError(res, error, 'createCarouselImage');
    }
  },

  // ===== ACTUALIZAR IMAGEN =====
  updateCarouselImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, link, linkType, isActive, image } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID no proporcionado'
        });
      }

      const carouselImage = await CarouselImage.findById(id);
      
      if (!carouselImage) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      // Actualizar campos
      if (title && title.trim()) carouselImage.title = title.trim();
      if (description !== undefined) carouselImage.description = description.trim() || '';
      if (link !== undefined) carouselImage.link = link.trim() || '';
      if (linkType) carouselImage.linkType = linkType;
      if (isActive !== undefined) carouselImage.isActive = isActive;

      // Actualizar imagen si se proporcionó una nueva
      if (image && image.url && image.public_id) {
        carouselImage.image = {
          url: image.url,
          public_id: image.public_id
        };
      }

      await carouselImage.save();

      console.log('✅ Imagen actualizada:', id);

      return res.json({
        success: true,
        message: 'Imagen actualizada exitosamente',
        data: carouselImage
      });
    } catch (error) {
      console.error('❌ Error en updateCarouselImage:', error);
      return handleError(res, error, 'updateCarouselImage');
    }
  },

  // ===== ELIMINAR IMAGEN =====
  deleteCarouselImage: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID no proporcionado'
        });
      }

      const carouselImage = await CarouselImage.findById(id);
      
      if (!carouselImage) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      // Eliminar de Cloudinary
      if (carouselImage.image && carouselImage.image.public_id) {
        try {
          const cloudinary = require('cloudinary').v2;
          await cloudinary.uploader.destroy(carouselImage.image.public_id);
          console.log('✅ Eliminado de Cloudinary:', carouselImage.image.public_id);
        } catch (err) {
          console.warn('⚠️ Error Cloudinary (no crítico):', err.message);
        }
      }

      await carouselImage.deleteOne();

      console.log('✅ Imagen eliminada:', id);

      return res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error en deleteCarouselImage:', error);
      return handleError(res, error, 'deleteCarouselImage');
    }
  }
};

// Función auxiliar para validar URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = carouselHomeCtrl;
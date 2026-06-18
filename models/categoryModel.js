// models/Category.js - MODELO LIMPIO SOLO CON IMAGENES PNG
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    unique: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 200
  },
  imageUrl: { 
    type: String, 
    required: true,
    default: ''   // Ejemplo: "/categories/sport/sport.png"
  },
  order: { 
    type: Number, 
    default: 0,
    index: true
  },
  videoCount: { 
    type: Number, 
    default: 0,
    index: true
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  }
}, { timestamps: true });

// Índices
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, order: 1 });
categorySchema.index({ videoCount: -1 });
categorySchema.index({ name: 1 });

// Métodos de instancia
categorySchema.methods.incrementVideoCount = async function() {
  this.videoCount += 1;
  await this.save();
  return this.videoCount;
};

categorySchema.methods.decrementVideoCount = async function() {
  if (this.videoCount > 0) {
    this.videoCount -= 1;
    await this.save();
  }
  return this.videoCount;
};

// Métodos estáticos
categorySchema.statics.getActiveCategories = async function() {
  return this.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .select('name slug imageUrl description videoCount');
};

categorySchema.statics.getPopularCategories = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ videoCount: -1, order: 1 })
    .limit(limit)
    .select('name slug imageUrl videoCount');
};

categorySchema.statics.findBySlug = async function(slug) {
  return this.findOne({ slug, isActive: true }).select('name slug imageUrl description');
};

// Middleware para auto-generar slug si no existe
categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
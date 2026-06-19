// models/userModel.js - LIMPIO SIN CANALES, PLANES, TRIAL O MODERACIÓN

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ============ INFORMACIÓN BÁSICA ============
    fullname: { type: String, trim: true, maxlength: 25 },
    username: { type: String, required: true, trim: true, maxlength: 25, unique: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // ============ ROL ============
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    // ============ CARRITO ============
    cart: {
      items: [
        {
          videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
          quantity: { type: Number, default: 1, min: 1 },
          price: { type: Number, required: true },
          title: String,
          thumbnail: String,   // ✅ Guardamos thumbnail para evitar pérdida de imagen
          images: [String]     // ✅ Para respaldo
        }
      ],
      totalPrice: {
        type: Number,
        default: 0,
        set: function (value) {
          return isNaN(value) ? 0 : parseFloat(value.toFixed(2));
        }
      }
    },

    // ============ PERFIL ============
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/dzd58nm3l/image/upload/v1780538635/defalut-avatar_tfvwxr.png'
    },
    language: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
    mobile: { type: String, default: '' },
    address: { type: String, default: '' },
    story: { type: String, default: '', maxlength: 200 },
    website: { type: String, default: '' },
    bio: { type: String, default: '' },

    // ============ ESTADO ============
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },

    // ============ BLOQUEO ============
    blockDetails: {
      reason: { type: String, default: null },
      description: { type: String, default: null },
      blockDate: { type: Date, default: null },
      blockExpiryDate: { type: Date, default: null },
      blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
    },
    blockHistory: [
      {
        reason: { type: String, required: true },
        description: { type: String },
        blockDate: { type: Date, default: Date.now },
        blockExpiryDate: { type: Date, default: null },
        blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        unblockDate: { type: Date, default: null },
        unblockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
      }
    ],

    // ============ ESTADÍSTICAS DE PERFIL ============
    profileViews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        viewedAt: { type: Date, default: Date.now }
      }
    ],
    profileViewsCount: { type: Number, default: 0 },

    // ============ INTERACCIONES ============
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    // ============ ÚLTIMO ACCESO ============
    lastLogin: { type: Date, default: Date.now },
    online: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ============================================
// ÍNDICES
// ============================================
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// MÉTODOS
// ============================================

// Verificar si sigue a otro usuario
userSchema.methods.isFollowingUser = function (userId) {
  return this.following.some(id => id.toString() === userId.toString());
};

// Seguir / dejar de seguir
userSchema.methods.toggleFollowUser = async function (userId) {
  const index = this.following.findIndex(id => id.toString() === userId.toString());
  let isNowFollowing = false;

  if (index === -1) {
    this.following.push(userId);
    isNowFollowing = true;
  } else {
    this.following.splice(index, 1);
    isNowFollowing = false;
  }

  await this.save();
  return isNowFollowing;
};

// Verificar si está bloqueado permanentemente
userSchema.methods.isPermanentlyBlocked = function () {
  if (!this.isBlocked) return false;
  if (!this.blockDetails.blockExpiryDate) return true;
  return new Date() < new Date(this.blockDetails.blockExpiryDate);
};

// Tiempo restante de bloqueo
userSchema.methods.getBlockTimeRemaining = function () {
  if (!this.isBlocked) return null;
  if (!this.blockDetails.blockExpiryDate) return 'Permanent';
  const remaining = new Date(this.blockDetails.blockExpiryDate) - new Date();
  if (remaining <= 0) return 'Expiré';
  const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  return `${days} jour${days > 1 ? 's' : ''}`;
};

module.exports = mongoose.model('user', userSchema);
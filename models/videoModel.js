const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },

  videoUrl: { type: String, required: true },
  videoPublicId: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: Number, default: 0 },

 // models/videoModel.js
images: [{
  url: { type: String, required: true },
  public_id: { type: String, default: '' }
}], // ← antes era [{ type: String }]
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  technique: { type: String, required: true },
  style: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  price: { type: Number, required: true },

  music: {
    id: String,
    title: String,
    artist: String,
    audioUrl: String,
    audioPublicId: String,
    volume: { type: Number, default: 70 },
    processed: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['en vente', 'en exposition', 'vendue'],
    default: 'en vente'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  views: { type: Number, default: 0 },
  uniqueViews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  tags: [{ type: String }],
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' }
}, { timestamps: true });

artworkSchema.index({ slug: 1 });
artworkSchema.index({ category: 1 });
artworkSchema.index({ user: 1 });
artworkSchema.index({ price: 1 });

artworkSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.findIndex(id => id.toString() === userId.toString());
  if (index === -1) {
    this.likes.push(userId);
    await this.save();
    return { liked: true, likesCount: this.likes.length };
  } else {
    this.likes.splice(index, 1);
    await this.save();
    return { liked: false, likesCount: this.likes.length };
  }
};

artworkSchema.methods.toggleSave = async function(userId) {
  const index = this.saves.findIndex(id => id.toString() === userId.toString());
  if (index === -1) {
    this.saves.push(userId);
    await this.save();
    return { saved: true, savesCount: this.saves.length };
  } else {
    this.saves.splice(index, 1);
    await this.save();
    return { saved: false, savesCount: this.saves.length };
  }
};

artworkSchema.methods.incrementShare = async function(userId) {
  if (!this.shares.includes(userId)) {
    this.shares.push(userId);
    await this.save();
  }
  return { sharesCount: this.shares.length };
};

artworkSchema.methods.incrementView = async function(userId) {
  if (!this.uniqueViews.includes(userId)) {
    this.views += 1;
    this.uniqueViews.push(userId);
    await this.save();
  }
  return { views: this.views };
};

// ✅ Evitar OverwriteModelError: usar modelo existente o crear nuevo
module.exports = mongoose.models.Video || mongoose.model('Video', artworkSchema);
const mongoose = require('mongoose');

const publicidadSchema = new mongoose.Schema({
  sourcePost: { type: mongoose.Types.ObjectId, ref: 'post', required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String }, // hacia dónde quieres que lleve al hacer clic
  admin: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('publicidad', publicidadSchema);

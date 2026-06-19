const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  // opcional: guardar título y miniatura para evitar consultas extra
  title: String,
  thumbnail: String
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true // un carrito por usuario
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Actualizar totales antes de guardar
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
  this.totalPrice = this.items.reduce((acc, item) => acc + (item.priceAtAdd * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  thumbnail: String
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  userEmail: String,
  userName: String,
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'dzd' },
  paymentMethod: { type: String, default: 'chargily' },
  paymentId: String,
  checkoutId: String,
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'paid'
  },
  paidAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
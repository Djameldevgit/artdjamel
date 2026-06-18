const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  checkoutId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'dzd'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  customerName: String,
  paymentMethod: String,
  paymentDate: Date,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
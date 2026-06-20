// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  checkout_id: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  user_email: String,
  user_username: String,
  
  // plan_id es String libre → permite 'basic', 'pro', 'business', 'free', 'cart'
  plan_id: { type: String, required: true }, 
  plan_name: String,
  
  duration_months: Number,
  free_months: Number,
  discount_percent: Number,
  category: String,
  
  // Para carrito
  cart_items: [{
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'video' },
    title: String,
    quantity: Number,
    price: Number,
    thumbnail: String
  }],
  
  amount: Number,
  currency: { type: String, default: 'dzd' },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'expired', 'refunded'], 
    default: 'pending' 
  },
  payment_completed_at: Date,
  plan_expires_at: Date,
  chargily_payment_id: String,
  webhook_received: mongoose.Schema.Types.Mixed,
  chargily_response: mongoose.Schema.Types.Mixed,
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
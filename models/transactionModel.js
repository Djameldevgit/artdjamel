// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Identificadores
  checkout_id: { type: String, required: true, unique: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
  
  // Datos del plan
  plan_id: { type: String, enum: ['basic', 'pro', 'business'], required: true },
  plan_name: { type: String, required: true },
  duration_months: { type: Number, required: true },
  free_months: { type: Number, default: 0 },
  discount_percent: { type: Number, default: 0 },
  category: { type: String },
  
  // Datos financieros
  amount: { type: Number, required: true },
  currency: { type: String, default: 'dzd' },
  
  // Estado del pago
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending',
    index: true 
  },
  
  // Fechas importantes
  checkout_created_at: { type: Date, default: Date.now },
  payment_completed_at: { type: Date },
  plan_expires_at: { type: Date },
  
  // Datos de Chargily (para auditoría)
  chargily_response: { type: Object },
  webhook_received: { type: Object },
  
  // Metadata adicional
  user_email: { type: String },
  user_username: { type: String },
  
}, { timestamps: true });

// Índices para búsquedas rápidas
transactionSchema.index({ user_id: 1, status: 1 });
transactionSchema.index({ created_at: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
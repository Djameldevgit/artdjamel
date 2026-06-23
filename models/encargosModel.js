const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      wilaya: String,
      commune: String,
      detailedAddress: String,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'read',
        'rejected',
        'busy',
        'confirmed',
        'awaiting_payment',
        'paid',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    readByArtist: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    artistResponse: {
      title: String,
      description: String,
      images: [String],
      priceAdvance: Number,
      estimatedDays: Number,
      message: String,
      respondedAt: Date,
    },
    payment: {
      transactionId: String,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      paidAt: Date,
    },
  },
  {
    // 👇 Esto es importante: añade automáticamente `createdAt` y `updatedAt`
    timestamps: true,
  }
);

// ✅ Exportamos el modelo
module.exports = mongoose.model('Commission', commissionSchema);
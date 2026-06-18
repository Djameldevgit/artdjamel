const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'pro', 'business', 'free'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    category: String,
    discount: Number,
    freeMonths: Number,
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    chargilyCheckoutId: String,
    chargilyPaymentId: String,
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'expired', 'refunded'],
        default: 'pending'
    },
    paidAt: Date,
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 48 * 60 * 60 * 1000)
    }
    // paymentMethod NO está incluido - elimínalo del objeto
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Silver', 'Gold', 'Platinum']
  },
  
  tier: {
    type: String,
    required: true,
    unique: true,
    enum: ['50', '100', '150', '200', '300', '500', '750', '1000', '1500', '2000', '3000', '6000']
  },
  
  // Características del plan
  features: {
    credits: {
      type: Number,
      required: true
    },
    storageLimit: {
      type: Number, // En MB
      required: true
    },
    hasSiteBuilder: {
      type: Boolean,
      default: false
    },
    hasDomain: {
      type: Boolean,
      default: false
    },
    hasFeaturedListing: {
      type: Boolean,
      default: false
    },
    maxProducts: {
      type: Number,
      default: 50
    },
    maxImagesPerProduct: {
      type: Number,
      default: 5
    },
    supportType: {
      type: String,
      enum: ['basic', 'priority', '24/7'],
      default: 'basic'
    },
    analytics: {
      type: Boolean,
      default: false
    },
    customCSS: {
      type: Boolean,
      default: false
    }
  },
  
  // Precios por mes
  pricing: {
    monthly: {
      type: Number,
      required: true
    },
    quarterly: {
      type: Number
    },
    semiAnnual: {
      type: Number
    },
    annual: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Descuentos por duración
  discounts: {
    threeMonths: {
      type: Number,
      default: 0 // Porcentaje
    },
    sixMonths: {
      type: Number,
      default: 0
    },
    twelveMonths: {
      type: Number,
      default: 0
    }
  },
  
  // Beneficios especiales
  benefits: [{
    type: String
  }],
  
  // Orden de visualización
  order: {
    type: Number,
    default: 0
  },
  
  // Popularidad
  isPopular: {
    type: Boolean,
    default: false
  },
  
  // Estado
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Fechas
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Método para calcular precio según duración
planSchema.methods.calculatePrice = function(duration, applyDiscount = true) {
  let price = 0;
  
  switch(duration) {
    case 1:
      price = this.pricing.monthly;
      break;
    case 3:
      price = this.pricing.quarterly || (this.pricing.monthly * 3);
      if (applyDiscount && this.discounts.threeMonths) {
        price = price * (1 - this.discounts.threeMonths / 100);
      }
      break;
    case 6:
      price = this.pricing.semiAnnual || (this.pricing.monthly * 6);
      if (applyDiscount && this.discounts.sixMonths) {
        price = price * (1 - this.discounts.sixMonths / 100);
      }
      break;
    case 12:
      price = this.pricing.annual || (this.pricing.monthly * 12);
      if (applyDiscount && this.discounts.twelveMonths) {
        price = price * (1 - this.discounts.twelveMonths / 100);
      }
      break;
    default:
      price = this.pricing.monthly * duration;
  }
  
  return Math.round(price * 100) / 100; // Redondear a 2 decimales
};

module.exports = mongoose.model('Plan', planSchema);
// backend/config/storePlans.js

const storePlans = {
    free: {
      name: 'Gratis',
      price: 0,
      currency: 'DZD',
      period: 'monthly',
      features: {
        maxProducts: 10,
        maxImagesPerProduct: 5,
        canPromoteProducts: false,
        canUseCustomDomain: false,
        analyticsAccess: false,
        prioritySupport: false,
        seoOptimization: false,
        featuredInSearch: false,
        removeWatermark: false,
        customColors: false,
        customLogo: false,
        customBanner: false,
        featuredProductsLimit: 0,
        announcementFeature: false
      },
      limitations: [
        'Máximo 10 productos',
        '5 imágenes por producto',
        'Marca de agua en imágenes',
        'Soporte básico',
        'Análisis básicos'
      ]
    },
    
    pro: {
      name: 'Pro',
      price: 2999,
      currency: 'DZD',
      period: 'monthly',
      features: {
        maxProducts: 100,
        maxImagesPerProduct: 10,
        canPromoteProducts: true,
        canUseCustomDomain: true,
        analyticsAccess: true,
        prioritySupport: true,
        seoOptimization: true,
        featuredInSearch: false,
        removeWatermark: true,
        customColors: true,
        customLogo: true,
        customBanner: true,
        featuredProductsLimit: 5,
        announcementFeature: true
      },
      benefits: [
        'Hasta 100 productos',
        '10 imágenes por producto',
        'Promoción de productos',
        'Dominio personalizado',
        'Análisis avanzados',
        'Soporte prioritario',
        'Optimización SEO',
        'Sin marca de agua',
        'Colores personalizables',
        '5 productos destacados'
      ]
    },
    
    premium: {
      name: 'Premium',
      price: 8999,
      currency: 'DZD',
      period: 'monthly',
      features: {
        maxProducts: 1000,
        maxImagesPerProduct: 20,
        canPromoteProducts: true,
        canUseCustomDomain: true,
        analyticsAccess: true,
        prioritySupport: true,
        seoOptimization: true,
        featuredInSearch: true,
        removeWatermark: true,
        customColors: true,
        customLogo: true,
        customBanner: true,
        featuredProductsLimit: 20,
        announcementFeature: true
      },
      benefits: [
        'Hasta 1000 productos',
        '20 imágenes por producto',
        'Destacado en búsquedas',
        'Dominio personalizado',
        'Análisis completos',
        'Soporte 24/7',
        'SEO avanzado',
        'JavaScript personalizado',
        'CSS personalizado',
        '20 productos destacados',
        'Verificación prioritaria'
      ],
      exclusive: [
        'Tienda destacada en homepage',
        'Verificación inmediata',
        'Reportes personalizados',
        'API access',
        'Backup automático'
      ]
    }
  };
  
  // Configuración de precios anuales (descuento)
  const annualPrices = {
    free: 0,
    pro: 2999 * 10, // 10 meses (20% descuento)
    premium: 8999 * 10 // 10 meses (20% descuento)
  };
  
  // Funciones helper
  const getPlanConfig = (planName) => {
    return storePlans[planName] || storePlans.free;
  };
  
  const calculateAnnualPrice = (planName) => {
    return annualPrices[planName] || 0;
  };
  
  const getAllPlans = () => {
    return Object.entries(storePlans).map(([key, plan]) => ({
      id: key,
      ...plan
    }));
  };
  
  module.exports = {
    storePlans,
    annualPrices,
    getPlanConfig,
    calculateAnnualPrice,
    getAllPlans
  };
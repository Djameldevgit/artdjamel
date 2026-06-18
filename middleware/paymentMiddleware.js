// backend/middleware/validation.js
const validatePaymentRequest = (req, res, next) => {
    const {
      planId,
      planName,
      duration,
      totalPrice,
      paymentMethod,
      paymentDate,
      userInfo
    } = req.body;
  
    const errors = [];
  
    if (!planId) errors.push('El plan es requerido');
    if (!planName) errors.push('El nombre del plan es requerido');
    if (!duration || duration < 1 || duration > 12) errors.push('La duración debe ser entre 1 y 12 meses');
    if (!totalPrice || totalPrice <= 0) errors.push('El precio total no es válido');
    if (!paymentMethod || !['ccp', 'transfer'].includes(paymentMethod)) errors.push('Método de pago no válido');
    if (!paymentDate) errors.push('La fecha de pago es requerida');
    if (!userInfo || !userInfo.fullName) errors.push('El nombre completo es requerido');
    if (!userInfo || !userInfo.phoneNumber) errors.push('El número de teléfono es requerido');
  
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors
      });
    }
  
    next();
  };
  
  module.exports = {
    validatePaymentRequest
  };
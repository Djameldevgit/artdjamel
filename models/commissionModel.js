const mongoose = require('mongoose')
 

const commissionSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  artista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    // Se asigna cuando el artista responde o se puede inferir del producto/artista asociado
  },
  // Datos iniciales del cliente
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  imagenes: [String], // URLs de imágenes subidas (puedes usar Multer o Cloudinary)
  // Estado del encargo
  estado: {
    type: String,
    enum: ['pendiente', 'respondido', 'aceptado_cliente', 'pagado', 'rechazado_artista', 'rechazado_cliente', 'finalizado'],
    default: 'pendiente'
  },
  // Respuesta del artista (cuando responde)
  respuesta: {
    titulo: String,
    descripcion: String,
    imagenes: [String],
    precioTotal: Number,      // precio final de la obra
    adelantoPorcentaje: { type: Number, default: 30 }, // 30%
    adelantoMonto: Number,    // calculado automáticamente
    tiempoEstimado: String,   // ej: "2 semanas"
    // fecha de respuesta
    fechaRespuesta: Date
  },
  // Decisión del cliente sobre la respuesta
  decisionCliente: {
    type: String,
    enum: ['aceptar', 'rechazar', 'guardar', null],
    default: null
  },
  // Pago (se genera al aceptar)
  pago: {
    idChargily: String,      // ID de transacción en Chargily
    monto: Number,
    estadoPago: { type: String, enum: ['pendiente', 'completado', 'fallido'], default: 'pendiente' },
    fechaPago: Date
  },
  // Historial de mensajes (opcional)
  mensajes: [{
    emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    texto: String,
    fecha: { type: Date, default: Date.now }
  }],
  // Fechas de creación y actualización
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
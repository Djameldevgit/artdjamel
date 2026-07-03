const Commission = require('../models/Commission');
const User = require('../models/User');
const chargilyService = require('../services/chargilyService'); // Lo creamos abajo
const mongoose = require('mongoose');

// --- 1. Cliente crea encargo ---
exports.createCommission = async (req, res) => {
  try {
    const { titulo, descripcion, imagenes, artistaId } = req.body; // artistaId es opcional, si no se asigna después

    // Validar que el artista existe (si se envió)
    if (artistaId) {
      const artista = await User.findOne({ _id: artistaId, role: 'artista' });
      if (!artista) return res.status(404).json({ error: 'Artista no encontrado' });
    }

    const newCommission = new Commission({
      cliente: req.user._id,
      artista: artistaId || null, // o lo asignas por defecto si solo hay uno
      titulo,
      descripcion,
      imagenes: imagenes || [],
      estado: 'pendiente'
    });

    await newCommission.save();
    
    // TODO: Emitir evento por Socket.io al artista (si está conectado)
    // io.to(`artist_${artistaId}`).emit('nuevo_encargo', newCommission);

    res.status(201).json(newCommission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. Cliente obtiene sus encargos ---
exports.getClientCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find({ cliente: req.user._id })
      .sort({ createdAt: -1 })
      .populate('artista', 'nombre email');
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 3. Artista obtiene encargos (los que le corresponden) ---
exports.getArtistCommissions = async (req, res) => {
  try {
    // Opción 1: si el artista se asigna al crearse
    const commissions = await Commission.find({ artista: req.user._id })
      .sort({ createdAt: -1 })
      .populate('cliente', 'nombre email');
    
    // Opción 2: si quieres que vea TODOS los pendientes (sin asignar) además de los suyos
    // const pending = await Commission.find({ estado: 'pendiente', artista: null });
    // const mine = await Commission.find({ artista: req.user._id });
    // const all = [...pending, ...mine];
    
    res.json(commissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. Artista responde al encargo ---
exports.respondCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, mensaje, titulo, descripcion, imagenes, precioTotal, tiempoEstimado } = req.body;

    const commission = await Commission.findById(id);
    if (!commission) return res.status(404).json({ error: 'Encargo no encontrado' });

    // Verificar que el artista sea el asignado (o si es null, se asigna ahora)
    if (commission.artista && commission.artista.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'No eres el artista asignado a este encargo' });
    }
    // Si no tenía artista asignado, se lo asignamos al que responde
    if (!commission.artista) {
      commission.artista = req.user._id;
    }

    // Solo se puede responder si está pendiente
    if (commission.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Este encargo ya ha sido respondido o está cerrado' });
    }

    if (accion === 'rechazar') {
      commission.estado = 'rechazado_artista';
      // Guardamos el mensaje de rechazo en el historial o en un campo extra
      commission.mensajes = commission.mensajes || [];
      commission.mensajes.push({
        emisor: req.user._id,
        texto: mensaje || 'Lo siento, estoy muy ocupado por ahora, inténtalo más adelante.'
      });
    } else if (accion === 'aceptar') {
      // Validar datos obligatorios
      if (!titulo || !descripcion || !precioTotal || !tiempoEstimado) {
        return res.status(400).json({ error: 'Faltan datos de la respuesta (titulo, descripcion, precioTotal, tiempoEstimado)' });
      }
      
      const adelantoMonto = (precioTotal * 0.30).toFixed(2); // 30%

      commission.respuesta = {
        titulo,
        descripcion,
        imagenes: imagenes || [],
        precioTotal,
        adelantoPorcentaje: 30,
        adelantoMonto: parseFloat(adelantoMonto),
        tiempoEstimado,
        fechaRespuesta: new Date()
      };
      commission.estado = 'respondido';
    } else {
      return res.status(400).json({ error: 'Acción no válida, use "aceptar" o "rechazar"' });
    }

    await commission.save();
    res.json(commission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 5. Cliente decide sobre la respuesta (Aceptar/Rechazar/Guardar) ---
exports.decideCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'aceptar', 'rechazar', 'guardar'

    const commission = await Commission.findById(id);
    if (!commission) return res.status(404).json({ error: 'Encargo no encontrado' });

    // Solo el cliente que creó el encargo puede decidir
    if (commission.cliente.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'No eres el cliente de este encargo' });
    }

    // Solo se puede decidir si está en estado 'respondido'
    if (commission.estado !== 'respondido') {
      return res.status(400).json({ error: 'Este encargo no está en estado de respuesta' });
    }

    if (decision === 'guardar') {
      // Solo marcamos que lo guardó para futura referencia, no cambia el estado principal
      commission.decisionCliente = 'guardar';
      await commission.save();
      return res.json({ message: 'Respuesta guardada para más tarde', commission });
    }

    if (decision === 'rechazar') {
      commission.estado = 'rechazado_cliente';
      commission.decisionCliente = 'rechazar';
      await commission.save();
      return res.json({ message: 'Has rechazado la oferta del artista', commission });
    }

    if (decision === 'aceptar') {
      // Cambiamos a 'aceptado_cliente' - esto habilita el pago
      commission.estado = 'aceptado_cliente';
      commission.decisionCliente = 'aceptar';
      await commission.save();
      return res.json({ message: 'Has aceptado la oferta. Ahora procede al pago del adelanto.', commission });
    }

    return res.status(400).json({ error: 'Decisión no válida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 6. Iniciar pago con Chargily (adelanto 30%) ---
exports.initiatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await Commission.findById(id);
    if (!commission) return res.status(404).json({ error: 'Encargo no encontrado' });

    // Verificar que sea el cliente
    if (commission.cliente.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'No eres el cliente de este encargo' });
    }

    // Solo se puede pagar si está aceptado por el cliente y aún no pagado
    if (commission.estado !== 'aceptado_cliente') {
      return res.status(400).json({ error: 'El encargo no está en estado de aceptado para pagar' });
    }
    if (commission.pago && commission.pago.estadoPago === 'completado') {
      return res.status(400).json({ error: 'Este encargo ya ha sido pagado' });
    }

    const monto = commission.respuesta.adelantoMonto;
    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto de adelanto inválido' });
    }

    // Llamar al servicio de Chargily para crear la orden de pago
    const paymentData = {
      amount: monto,
      currency: 'DZD',
      description: `Adelanto (30%) para encargo: ${commission.titulo}`,
      metadata: {
        commissionId: commission._id.toString(),
        userId: req.user._id.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/mis-encargos?pago=exitoso`,
      failure_url: `${process.env.FRONTEND_URL}/mis-encargos?pago=fallido`,
    };

    const paymentResult = await chargilyService.createPayment(paymentData);

    // Guardar el ID de la transacción en el encargo (estado pendiente)
    commission.pago = {
      idChargily: paymentResult.id,
      monto: monto,
      estadoPago: 'pendiente',
      fechaPago: new Date()
    };
    await commission.save();

    // Devolver la URL de redirección al frontend
    res.json({ paymentUrl: paymentResult.url, paymentId: paymentResult.id });
  } catch (error) {
    console.error('Error al iniciar pago en Chargily:', error);
    res.status(500).json({ error: 'Error al iniciar el pago. Intenta de nuevo.' });
  }
};

// --- 7. Webhook de Chargily (notificación de pago exitoso/fallido) ---
exports.chargilyWebhook = async (req, res) => {
  try {
    // Verificar firma del webhook (Muy importante por seguridad)
    const signature = req.headers['chargily-signature'];
    const rawBody = req.body.toString(); // porque usamos express.raw()
    
    // Si tienes un secreto configurado en Chargily, verifica la firma
    // Ejemplo: const isValid = chargilyService.verifyWebhookSignature(rawBody, signature);
    // if (!isValid) return res.status(401).send('Firma inválida');

    const event = JSON.parse(rawBody);
    console.log('Webhook recibido:', event);

    // Estructura típica de Chargily (ajusta según su documentación)
    const { type, data } = event;

    if (type === 'payment.succeeded') {
      const paymentId = data.id;
      const metadata = data.metadata || {};
      const commissionId = metadata.commissionId;

      if (!commissionId) {
        console.error('Webhook: commissionId no encontrado en metadata');
        return res.status(400).send('Faltan metadatos');
      }

      const commission = await Commission.findById(commissionId);
      if (!commission) {
        console.error(`Webhook: Encargo ${commissionId} no encontrado`);
        return res.status(404).send('Encargo no encontrado');
      }

      // Actualizar el estado del pago y del encargo
      commission.pago.estadoPago = 'completado';
      commission.pago.idChargily = paymentId; // actualizar por si acaso
      commission.estado = 'pagado'; // ¡El artista puede empezar a pintar!
      
      // Guardamos un mensaje de sistema
      commission.mensajes = commission.mensajes || [];
      commission.mensajes.push({
        emisor: null, // sistema
        texto: 'Pago del adelanto confirmado. El artista puede comenzar la obra.'
      });

      await commission.save();

      // TODO: Enviar notificación al artista (email o socket)
      // Notificar al cliente también

      res.status(200).send('Webhook procesado correctamente');
    } 
    else if (type === 'payment.failed') {
      // Manejar pago fallido
      const metadata = data.metadata || {};
      const commissionId = metadata.commissionId;
      if (commissionId) {
        await Commission.findByIdAndUpdate(commissionId, {
          'pago.estadoPago': 'fallido'
        });
      }
      res.status(200).send('Webhook procesado (fallo)');
    }
    else {
      res.status(200).send('Evento ignorado');
    }
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error interno del webhook');
  }
};
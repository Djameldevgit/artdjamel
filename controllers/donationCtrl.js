const axios = require('axios');
const crypto = require('crypto');

const donationCtrl = {
  
  createCheckout: async (req, res) => {
    try {
      const { amount, currency } = req.body;

      if (!process.env.CHARGILY_SECRET_KEY) {
        console.error('❌ CHARGILY_SECRET_KEY no está definida');
        return res.status(500).json({ 
          error: 'Configuración de pago incompleta' 
        });
      }

      console.log('📤 Creando checkout en Chargily...');
      console.log('Monto:', amount, 'Moneda:', currency);

      const response = await axios.post(
        "https://pay.chargily.net/test/api/v2/checkouts",
        {
          amount: Number(amount),
          currency: currency || "dzd",
          success_url: "http://localhost:3000/success",
          failure_url: "http://localhost:3000/failure",
          webhook_endpoint: "http://localhost:5000/api/webhook", // ✅ NOMBRE CORRECTO
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('✅ Checkout creado:', response.data.id);
      console.log('🔗 URL de pago:', response.data.checkout_url);
      
      return res.json(response.data);

    } catch (err) {
      console.error('❌ Error en createCheckout:');
      
      if (err.response) {
        // La API respondió con un error
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        return res.status(err.response.status).json({ 
          error: err.response.data.message || 'Error en la pasarela de pago'
        });
      } else if (err.request) {
        console.error('No response:', err.request);
        return res.status(503).json({ 
          error: 'No se pudo conectar con Chargily' 
        });
      } else {
        console.error('Error:', err.message);
        return res.status(500).json({ 
          error: 'Error interno del servidor' 
        });
      }
    }
  },

  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers["signature"];
      const payload = JSON.stringify(req.body);

      const computedSignature = crypto
        .createHmac("sha256", process.env.CHARGILY_SECRET_KEY)
        .update(payload)
        .digest("hex");

      if (computedSignature !== signature) {
        console.warn('⚠️ Firma inválida');
        return res.status(403).json({ error: "Invalid signature" });
      }

      const event = req.body;
      console.log('📨 Webhook recibido:', event.type);

      switch (event.type) {
        case "checkout.paid":
          console.log("✅ Pago exitoso:", event.data);
          // Guardar en MongoDB
          break;
        case "checkout.failed":
          console.log("❌ Pago fallido:", event.data);
          break;
        default:
          console.log("📌 Evento:", event.type);
      }

      return res.json({ received: true });

    } catch (err) {
      console.error('❌ Error en webhook:', err);
      return res.status(500).json({ error: "webhook error" });
    }
  }
}

module.exports = donationCtrl;
// node testWebhook.js
const axios = require('axios');

const USER_ID_REAL = 'ID_DE_USER001'; // ← PON EL ID REAL DE user001

const testWebhook = async () => {
  try {
    console.log('🚀 Enviando webhook simulado...\n');
    
    const webhookData = {
      type: "checkout.paid",
      data: {
        id: "test_manual_" + Date.now(),
        amount: 700,
        currency: "dzd",
        status: "paid",
        metadata: {
          type: "plan_subscription",
          user_id: USER_ID_REAL,
          user_email: "user001@gmail.com",
          user_username: "user001",
          plan_id: "pro",
          plan_name: "Plan Pro",
          duration_months: 1,
          free_months: 0,
          discount_percent: 0,
          category: "test"
        }
      }
    };
    
    // Probar diferentes rutas posibles
    const rutas = [
      'http://localhost:5000/api/webhook',
      'http://localhost:5000/api/webhook',
      'http://localhost:5000/api/webhook-test'
    ];
    
    for (const ruta of rutas) {
      try {
        console.log(`\n📡 Probando: POST ${ruta}`);
        const response = await axios.post(ruta, webhookData, {
          headers: {
            'Content-Type': 'application/json',
            'Signature': 'test_signature'
          }
        });
        console.log('✅ Responde:', response.status, response.data);
      } catch (error) {
        if (error.response) {
          console.log('⚠️ Status:', error.response.status, error.response.data);
        } else {
          console.log('❌ Error:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testWebhook();
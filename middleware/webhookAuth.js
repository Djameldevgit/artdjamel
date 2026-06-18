const crypto = require('crypto');

const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers.signature || req.headers['signature'];
  
  // Skip verification in development
  if (process.env.NODE_ENV === 'development' && !signature) {
    console.log('⚠️ Webhook signature verification skipped in development');
    return next();
  }
  
  if (!signature) {
    return res.status(400).json({ error: 'No signature provided' });
  }
  
  // Get the raw payload as string
  const payload = JSON.stringify(req.body);
  
  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CHARGILY_SECRET_KEY)
    .update(payload)
    .digest('hex');
  
  // Compare signatures
  if (signature !== expectedSignature) {
    console.error('❌ Invalid webhook signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }
  
  console.log('✅ Webhook signature verified');
  next();
};

module.exports = { verifyWebhookSignature };
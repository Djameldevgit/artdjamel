const cron = require('node-cron');
const Video = require('./../models/videoModel');

// Ejecutar cada 10 minutos
cron.schedule('*/10 * * * *', async () => {
  console.log('🔄 Limpiando reservas expiradas...');
  const now = new Date();
  const expiredTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutos

  try {
    const result = await Video.updateMany(
      {
        reservedBy: { $ne: null },
        reservedAt: { $lt: expiredTime }
      },
      {
        $set: {
          reservedBy: null,
          reservedAt: null
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Liberadas ${result.modifiedCount} reservas expiradas`);
    }
  } catch (err) {
    console.error('❌ Error limpiando reservas:', err);
  }
});

module.exports = cron;
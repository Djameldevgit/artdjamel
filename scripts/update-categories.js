// node scripts/update-categories.js
// Agrega el campo 'pendiente' a todos los videos de la colección

require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/videoModel');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ Error de conexión:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  await addPendienteField();
});

// Función principal: Agregar campo pendiente a todos los videos
async function addPendienteField() {
  try {
    console.log('\n🔄 Agregando campo "pendiente" a la colección videos...\n');

    // 1. Contar videos antes de la actualización
    const totalVideos = await Video.countDocuments();
    const videosWithPendiente = await Video.countDocuments({ pendiente: { $exists: true } });
    const videosWithoutPendiente = await Video.countDocuments({ pendiente: { $exists: false } });

    console.log('📊 Estadísticas iniciales:');
    console.log(`   • Total de videos: ${totalVideos}`);
    console.log(`   • Videos con campo "pendiente": ${videosWithPendiente}`);
    console.log(`   • Videos sin campo "pendiente": ${videosWithoutPendiente}`);
    console.log();

    if (videosWithoutPendiente === 0) {
      console.log('✅ Todos los videos ya tienen el campo "pendiente".');
      
      // Mostrar estado actual
      const pendienteTrue = await Video.countDocuments({ pendiente: true });
      const pendienteFalse = await Video.countDocuments({ pendiente: false });
      console.log(`   • pendiente = true: ${pendienteTrue}`);
      console.log(`   • pendiente = false: ${pendienteFalse}`);
      
      console.log('\n✨ No se requieren cambios.');
      process.exit(0);
      return;
    }

    // 2. Agregar campo pendiente a los videos que no lo tienen (asignar true)
    console.log('📝 Agregando campo "pendiente" a los videos que no lo tienen...');
    
    const result = await Video.updateMany(
      { pendiente: { $exists: false } }, // Solo videos sin el campo
      { $set: { pendiente: true } }       // Asignar true
    );

    console.log(`\n✅ Actualización completada:`);
    console.log(`   • Documentos modificados: ${result.modifiedCount}`);
    console.log(`   • Documentos coincidentes: ${result.matchedCount}`);

    // 3. Verificar el resultado final
    console.log('\n📊 Estadísticas finales:');
    const finalTotal = await Video.countDocuments();
    const finalWithPendiente = await Video.countDocuments({ pendiente: { $exists: true } });
    const finalPendienteTrue = await Video.countDocuments({ pendiente: true });
    const finalPendienteFalse = await Video.countDocuments({ pendiente: false });
    
    console.log(`   • Total de videos: ${finalTotal}`);
    console.log(`   • Videos con campo "pendiente": ${finalWithPendiente}`);
    console.log(`   • pendiente = true: ${finalPendienteTrue}`);
    console.log(`   • pendiente = false: ${finalPendienteFalse}`);

    console.log('\n✨ Campo "pendiente" agregado exitosamente a todos los videos');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
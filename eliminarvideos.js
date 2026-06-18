// node eliminarvideos.js
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./models/videoModel');
const Channel = require('./models/channelModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

async function eliminarvideos() {
  let connection = null;
  
  try {
    // Conectar a MongoDB
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // ============================================
    // 1. OBTENER IDs DE CANALES VÁLIDOS
    // ============================================
    const validChannelIds = await Channel.find().distinct('_id');
    console.log(`📺 Canales válidos encontrados: ${validChannelIds.length}\n`);
    
    // ============================================
    // 2. CONTAR VIDEOS HUÉRFANOS (sin canal válido)
    // ============================================
    const orphanVideos = await Video.find({
      $or: [
        { channel: null },
        { channel: { $exists: false } },
        { channel: { $nin: validChannelIds } }
      ]
    });
    
    const orphanVideosCount = orphanVideos.length;
    console.log(`📹 Videos huérfanos (sin canal válido): ${orphanVideosCount}\n`);
    
    if (orphanVideosCount === 0) {
      console.log('✨ No hay videos huérfanos para eliminar.');
      process.exit(0);
    }
    
    // ============================================
    // 3. MOSTRAR VIDEOS HUÉRFANOS
    // ============================================
    console.log('📋 Lista de videos huérfanos:');
    orphanVideos.forEach((video, idx) => {
      console.log(`   ${idx + 1}. ${video.title || 'Sin título'}`);
      console.log(`      - ID: ${video._id}`);
      console.log(`      - Canal ID: ${video.channel || 'Nulo'}`);
      console.log(`      - Usuario: ${video.user || 'N/A'}`);
      console.log(`      - Creado: ${video.createdAt ? video.createdAt.toISOString().split('T')[0] : 'N/A'}`);
      console.log('');
    });
    
    // ============================================
    // 4. ESTADÍSTICAS ADICIONALES
    // ============================================
    // Videos con channel nulo
    const videosConChannelNulo = await Video.countDocuments({ channel: null });
    console.log(`📊 Estadísticas detalladas:`);
    console.log(`   - Videos con channel = null: ${videosConChannelNulo}`);
    
    // Videos sin campo channel
    const videosSinCampoChannel = await Video.countDocuments({ channel: { $exists: false } });
    console.log(`   - Videos sin campo channel: ${videosSinCampoChannel}`);
    
    // Videos con channel inválido
    const videosConChannelInvalido = orphanVideosCount - videosConChannelNulo - videosSinCampoChannel;
    console.log(`   - Videos con channel inválido: ${videosConChannelInvalido}`);
    
    // ============================================
    // 5. CONFIRMACIÓN INTERACTIVA
    // ============================================
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n📝 Lo que hará este script:');
    console.log(`   1. Eliminar ${orphanVideosCount} videos huérfanos`);
    console.log('   2. NO eliminar canales');
    console.log('   3. NO modificar usuarios');
    
    const answer = await new Promise(resolve => {
      readline.question('\n⚠️ ¿Eliminar SOLO los videos huérfanos? Escribe "ELIMINAR VIDEOS" para confirmar: ', resolve);
    });
    readline.close();
    
    if (answer !== 'ELIMINAR VIDEOS') {
      console.log('\n❌ Operación cancelada.');
      process.exit(0);
    }
    
    // ============================================
    // 6. ELIMINAR VIDEOS HUÉRFANOS
    // ============================================
    console.log('\n🗑️ Eliminando videos huérfanos...');
    
    const result = await Video.deleteMany({
      $or: [
        { channel: null },
        { channel: { $exists: false } },
        { channel: { $nin: validChannelIds } }
      ]
    });
    
    console.log(`\n✅ Eliminados ${result.deletedCount} videos huérfanos`);
    
    // ============================================
    // 7. VERIFICAR RESULTADOS FINALES
    // ============================================
    const remainingVideos = await Video.countDocuments();
    const remainingOrphanVideos = await Video.countDocuments({
      $or: [
        { channel: null },
        { channel: { $exists: false } },
        { channel: { $nin: validChannelIds } }
      ]
    });
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   - Videos restantes TOTALES: ${remainingVideos}`);
    console.log(`   - Videos restantes HUÉRFANOS: ${remainingOrphanVideos}`);
    console.log(`   - Canales (sin cambios): ${validChannelIds.length}`);
    
    if (remainingOrphanVideos === 0) {
      console.log('\n🎉 ¡Limpieza de videos completada exitosamente!');
    } else {
      console.log(`\n⚠️ Quedan ${remainingOrphanVideos} videos huérfanos.`);
      console.log('   Posiblemente se crearon durante la ejecución.');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

eliminarvideos();
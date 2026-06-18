// node eliminarCanales.js
require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('./models/channelModel');

 
const User = require('./models/userModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';
 
async function eliminarcanales() {
  let connection = null;
  
  try {
    // Conectar a MongoDB
    connection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Contar canales existentes
    const count = await Channel.countDocuments();
    console.log(`📺 Canales encontrados: ${count}\n`);
    
    if (count === 0) {
      console.log('✨ No hay canales para eliminar.');
      process.exit(0);
    }
    
    // Mostrar primeros 10 canales
    const channels = await Channel.find().limit(10).select('name owner createdAt');
    console.log('📋 Primeros canales:');
    channels.forEach((channel, idx) => {
      console.log(`   ${idx + 1}. ${channel.name} (Dueño: ${channel.owner})`);
    });
    
    if (count > 10) {
      console.log(`   ... y ${count - 10} más`);
    }
    
    // Confirmación interactiva
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\n⚠️ ¿Eliminar TODOS los canales? Escribe "ELIMINAR" para confirmar: ', resolve);
    });
    readline.close();
    
    if (answer !== 'ELIMINAR') {
      console.log('\n❌ Operación cancelada.');
      process.exit(0);
    }
    
    // Eliminar todos los canales
    console.log('\n🗑️ Eliminando canales...');
    const result = await Channel.deleteMany({});
    
    console.log(`\n✅ Eliminados ${result.deletedCount} canales`);
    
    // También limpiar referencia en usuarios
    const updateResult = await User.updateMany(
      {},
      { $set: { channels: [] } }
    );
    console.log(`✅ Limpiadas referencias en ${updateResult.modifiedCount} usuarios`);
    
    console.log('\n🎉 ¡Completado!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (connection) await mongoose.disconnect();
  }
}

eliminarcanales();
//node eliminarColecciones.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

async function deleteCollections() {
  let conn = null;
  
  try {
    // Conectar a la base específica
    conn = await mongoose.createConnection(MONGODB_URI);
    console.log('✅ Conectado a:', conn.name);
    
    // Obtener todas las colecciones
    const collections = await conn.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('✨ No hay colecciones para eliminar.');
      return;
    }
    
    console.log('\n📋 Colecciones encontradas:');
    collections.forEach(col => console.log(`   📁 ${col.name}`));
    
    // Confirmar
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\n✏️  Escribe "ELIMINAR" para borrar TODAS las colecciones: ', resolve);
    });
    readline.close();
    
    if (answer !== 'ELIMINAR') {
      console.log('❌ Operación cancelada.');
      return;
    }
    
    // Eliminar colecciones
    console.log('\n🗑️ Eliminando colecciones...');
    for (const collection of collections) {
      try {
        await conn.db.collection(collection.name).drop();
        console.log(`   ✅ ${collection.name} eliminada`);
      } catch (err) {
        console.error(`   ❌ Error con ${collection.name}:`, err.message);
      }
    }
    
    console.log('\n🎉 ¡Todas las colecciones han sido eliminadas!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (conn) await conn.close();
    process.exit(0);
  }
}

deleteCollections();
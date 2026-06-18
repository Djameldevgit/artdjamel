// eliminarBasesDeDatos.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

// Lista de bases de datos protegidas (no se eliminan)
const PROTECTED_DATABASES = ['admin', 'local', 'config'];

async function deleteDatabases() {
  let connection = null;
  
  try {
    // Conectar a MongoDB
    connection = await mongoose.createConnection(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Conectado a MongoDB\n');
    
    const client = connection.getClient();
    const adminDb = client.db('admin');
    
    // Obtener todas las bases de datos
    const { databases } = await adminDb.admin().listDatabases();
    
    console.log('📋 Bases de datos disponibles:');
    databases.forEach(db => {
      const size = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
      console.log(`   ${db.name} - ${size} MB`);
    });
    
    // Filtrar bases a eliminar (todas excepto protegidas)
    const toDelete = databases.filter(db => !PROTECTED_DATABASES.includes(db.name));
    
    if (toDelete.length === 0) {
      console.log('\n✨ No hay bases de datos para eliminar.');
      return;
    }
    
    console.log('\n⚠️  Bases que SERÁN ELIMINADAS:');
    toDelete.forEach(db => console.log(`   🗑️ ${db.name}`));
    
    // Confirmación interactiva
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('\n✏️  Escribe "ELIMINAR" para confirmar: ', resolve);
    });
    readline.close();
    
    if (answer !== 'ELIMINAR') {
      console.log('\n❌ Operación cancelada.');
      return;
    }
    
    // Eliminar bases de datos
    console.log('\n🗑️ Eliminando...');
    for (const db of toDelete) {
      try {
        await client.db(db.name).dropDatabase();
        console.log(`   ✅ ${db.name} eliminada`);
      } catch (err) {
        console.error(`   ❌ Error al eliminar ${db.name}:`, err.message);
      }
    }
    
    console.log('\n🎉 ¡Completado!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    if (connection) await connection.close();
    process.exit(0);
  }
}

deleteDatabases();
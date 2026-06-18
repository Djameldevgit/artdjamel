// node list.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

const list = async () => {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('\n✅ Conectado\n');
    
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    
    console.log('📊 BASES DE DATOS ACTUALES:\n');
    
    const usefulDbs = dbs.databases.filter(db => 
      !['admin', 'local'].includes(db.name)
    );
    
    if (usefulDbs.length === 0) {
      console.log('⚠️ No hay bases de datos');
    } else {
      usefulDbs.forEach(db => {
        console.log(`📁 ${db.name} - ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
      });
    }
    
    // Verificar colecciones en videocommerce
    console.log('\n📂 COLECCIONES EN VIDEOCOMMERCE:\n');
    const videocommerce = client.db('videocommerce');
    const collections = await videocommerce.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️ No hay colecciones en videocommerce');
    } else {
      collections.forEach(coll => {
        console.log(`   - ${coll.name}`);
      });
    }
    
    console.log(`\n✅ Total: ${collections.length} colecciones`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
};

list();
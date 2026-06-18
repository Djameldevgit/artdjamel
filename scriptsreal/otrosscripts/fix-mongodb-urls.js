// node fix-mongodb-urls.js
const { MongoClient } = require('mongodb');
const https = require('https');

// Configuración
const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'tu_basededatos'; // ← CAMBIA ESTO
const COLLECTION_NAME = 'categories'; // ← TU COLECCIÓN

// Función para verificar si una URL funciona
function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        ok: response.statusCode === 200
      });
    }).on('error', () => {
      resolve({ url, status: 0, ok: false });
    }).setTimeout(3000, () => {
      resolve({ url, status: 0, ok: false });
    });
  });
}

// Función para extraer el versionador de una URL que funciona
function extractVersionFromWorkingUrl(workingUrl) {
  const match = workingUrl.match(/\/v\d+\//);
  return match ? match[0] : '/v1/'; // Si no encuentra, usa /v1/ por defecto
}

async function fixUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Buscar todas las categorías con URLs de cloudinary
    const docs = await collection.find({
      icon: /cloudinary/
    }).toArray();
    
    console.log(`📊 Encontrados ${docs.length} documentos con URLs de Cloudinary\n`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const doc of docs) {
      const oldUrl = doc.icon;
      
      // ESTRATEGIA 1: Usar la URL que funciona como base
      // La URL que funciona tiene: /v1772583204/icons/vehicules/voitures.jpg
      // Extraemos la parte útil: /v1772583204/icons/...
      
      // Obtener el nombre del archivo de la URL antigua
      const urlParts = oldUrl.split('/');
      const fileNameWithExt = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExt.split('.')[0];
      
      // Obtener la categoría de la URL antigua
      const category = urlParts[urlParts.length - 2];
      
      // Construir la nueva URL basada en el patrón que funciona
      // NOTA: Asumimos que la imagen existe en Cloudinary con el mismo nombre
      const possibleUrls = [
        // Opción 1: Con versionador y sin marketplace
        `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/icons/${category}/${fileName}.jpg`,
        `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/icons/${category}/${fileName}.png`,
        `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/icons/${category}/${fileName}.webp`,
        // Opción 2: Probamos con diferentes versionadores (usando el que funciona como base)
        `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/${category}/${fileName}.jpg`,
        `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/${category}/${fileName}.png`
      ];
      
      console.log(`\n🔍 Procesando: ${doc.name || doc._id}`);
      console.log(`   URL actual: ${oldUrl}`);
      
      // Probar cada posible URL hasta encontrar una que funcione
      let workingUrl = null;
      for (const testUrl of possibleUrls) {
        process.stdout.write(`   Probando: ${testUrl.substring(0, 70)}... `);
        const result = await checkUrl(testUrl);
        if (result.ok) {
          console.log('✅ OK');
          workingUrl = testUrl;
          break;
        } else {
          console.log('❌');
        }
      }
      
      if (workingUrl) {
        // Actualizar MongoDB con la URL que funciona
        await collection.updateOne(
          { _id: doc._id },
          { $set: { icon: workingUrl } }
        );
        console.log(`   ✅ ACTUALIZADO: ${workingUrl}`);
        fixed++;
      } else {
        console.log(`   ❌ No se encontró URL funcional para ${fileName}`);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`✅ URLs corregidas: ${fixed}`);
    console.log(`❌ Fallos: ${failed}`);
    
  } finally {
    await client.close();
    console.log('\n👋 Conexión cerrada');
  }
}

// Script alternativo: Si prefieres generar un reporte en lugar de actualizar directamente
async function generateReport() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const docs = await collection.find({
      icon: /cloudinary/
    }).toArray();
    
    const report = [];
    
    for (const doc of docs) {
      const oldUrl = doc.icon;
      const fileName = oldUrl.split('/').pop();
      const category = oldUrl.split('/').slice(-2, -1)[0];
      
      report.push({
        id: doc._id,
        name: doc.name,
        oldUrl: oldUrl,
        suggestedUrl: `https://res.cloudinary.com/dfjipgj2o/image/upload/v1772583204/icons/${category}/${fileName}`,
        needsFix: !oldUrl.includes('/v')
      });
    }
    
    const fs = require('fs');
    fs.writeFileSync(
      'url-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Reporte generado: url-report.json');
    
  } finally {
    await client.close();
  }
}

// Preguntar qué hacer
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`
📌 ¿Qué quieres hacer?
1. Corregir URLs automáticamente en MongoDB
2. Solo generar reporte (seguro)
3. Salir

Opción (1-3): `, async (answer) => {
  readline.close();
  
  switch(answer) {
    case '1':
      await fixUrls();
      break;
    case '2':
      await generateReport();
      break;
    default:
      console.log('👋 Hasta luego');
      process.exit(0);
  }
});
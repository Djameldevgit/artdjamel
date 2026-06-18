// node deleteCloudinaryIcons.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables del archivo .env
dotenv.config();

// Verificar que todas las variables existen
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\n❌ ERROR: Faltan variables en el archivo .env:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n📌 Asegúrate de que tu archivo .env contiene:');
  console.error('   CLOUDINARY_CLOUD_NAME=dfjipgj2o');
  console.error('   CLOUDINARY_API_KEY=726291387377194');
  console.error('   CLOUDINARY_API_SECRET=1QvpVpJ2Jk_RJ4bGKwrHh9Bzr8g');
  process.exit(1);
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Conectando a Cloudinary...');
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '✓ Configurada' : '✗ Falta'}`);
console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✓ Configurado' : '✗ Falta'}`);

async function deleteIconsFolder() {
  console.log('\n🗑️ Eliminando carpeta "icons" de Cloudinary...');
  
  try {
    // Primero, verificar si hay imágenes en la carpeta
    console.log('🔍 Buscando imágenes en la carpeta "icons"...');
    
    const searchResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'icons/',
      max_results: 10
    });

    if (searchResult.resources.length > 0) {
      console.log(`📊 Encontradas ${searchResult.total_count || 'muchas'} imágenes en la carpeta`);
      console.log('📸 Primeras imágenes:');
      searchResult.resources.slice(0, 3).forEach(img => {
        console.log(`   - ${img.public_id}`);
      });
    } else {
      console.log('📂 La carpeta está vacía o no existe');
    }

    // Preguntar antes de eliminar
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmDelete = await new Promise(resolve => {
      readline.question('\n⚠️  ¿Estás SEGURO de querer eliminar TODAS las imágenes? (s/N): ', answer => {
        resolve(answer.toLowerCase() === 's');
        readline.close();
      });
    });

    if (!confirmDelete) {
      console.log('❌ Operación cancelada');
      return;
    }

    console.log('\n🔄 Eliminando recursos...');
    
    // Eliminar todos los recursos con prefijo 'icons/'
    const deleteResult = await cloudinary.api.delete_resources_by_prefix('icons/');
    
    console.log('✅ Resultado de eliminación:');
    
    if (deleteResult.deleted) {
      const deletedCount = Object.keys(deleteResult.deleted).length;
      console.log(`   📊 Imágenes eliminadas: ${deletedCount}`);
      
      // Mostrar algunas de las eliminadas
      const sampleDeleted = Object.keys(deleteResult.deleted).slice(0, 3);
      if (sampleDeleted.length > 0) {
        console.log('   📸 Ejemplos:');
        sampleDeleted.forEach(id => console.log(`      - ${id}`));
      }
    } else {
      console.log('   No se eliminaron imágenes (puede que no hubiera ninguna)');
    }
    
    // Opcional: eliminar la carpeta vacía
    try {
      await cloudinary.api.delete_folder('icons');
      console.log('   📂 Carpeta "icons" eliminada');
    } catch (folderError) {
      console.log('   📂 Nota: La carpeta puede no existir o no estar vacía');
    }
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('\n❌ Error al eliminar:', error.message);
    if (error.http_code) {
      console.error(`   Código HTTP: ${error.http_code}`);
    }
  }
}

// Ejecutar la función
deleteIconsFolder();
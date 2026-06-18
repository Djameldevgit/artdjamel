// deleteimagescloudinary.js
// Script para eliminar imágenes de Cloudinary
// Uso: node deleteimagescloudinary.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Cargar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar credenciales
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('\n❌ ERROR: Credenciales no encontradas en .env');
  console.error('📌 Asegúrate de que tu archivo .env contiene:');
  console.error('   CLOUDINARY_CLOUD_NAME=dfjipgj2o');
  console.error('   CLOUDINARY_API_KEY=tu_api_key');
  console.error('   CLOUDINARY_API_SECRET=tu_api_secret');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// =============================================
// FUNCIÓN PARA ELIMINAR POR CARPETA
// =============================================
async function deleteByFolder() {
  console.log('\n📁 ELIMINAR POR CARPETA');
  console.log('======================');
  
  const folder = await question('\n📂 Nombre de la carpeta a eliminar (ej: icons, products): ');
  
  if (!folder) {
    console.log('❌ Operación cancelada');
    return;
  }

  try {
    // Verificar si la carpeta existe
    const searchResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${folder}/`,
      max_results: 10
    });

    console.log(`\n📊 Imágenes encontradas en "${folder}/": ${searchResult.total_count || searchResult.resources.length}`);

    if (searchResult.resources.length > 0) {
      console.log('\n📸 Primeras imágenes:');
      searchResult.resources.slice(0, 5).forEach(img => {
        console.log(`   - ${img.public_id}`);
      });
    }

    const confirm = await question(`\n⚠️  ¿Eliminar TODAS las imágenes en "${folder}/"? (s/N): `);
    
    if (confirm.toLowerCase() === 's') {
      console.log('\n🔄 Eliminando...');
      const result = await cloudinary.api.delete_resources_by_prefix(`${folder}/`);
      
      const deletedCount = Object.keys(result.deleted || {}).length;
      console.log(`✅ Eliminadas: ${deletedCount} imágenes`);
      
      // Intentar eliminar la carpeta
      try {
        await cloudinary.api.delete_folder(folder);
        console.log(`📂 Carpeta "${folder}" eliminada`);
      } catch (e) {
        console.log(`📂 Nota: La carpeta puede no existir o no estar vacía`);
      }
    } else {
      console.log('❌ Operación cancelada');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================
// FUNCIÓN PARA ELIMINAR POR LISTA
// =============================================
async function deleteByList() {
  console.log('\n📋 ELIMINAR POR LISTA DE ARCHIVOS');
  console.log('================================');
  
  const listPath = await question('\n📄 Ruta del archivo JSON con la lista de imágenes a eliminar: ');
  
  if (!listPath) {
    console.log('❌ Operación cancelada');
    return;
  }

  try {
    if (!fs.existsSync(listPath)) {
      console.error('❌ El archivo no existe');
      return;
    }

    const listData = JSON.parse(fs.readFileSync(listPath, 'utf8'));
    let publicIds = [];

    // Manejar diferentes formatos de archivo
    if (Array.isArray(listData)) {
      publicIds = listData;
    } else if (listData.successful) {
      publicIds = listData.successful.map(img => img.public_id);
    } else if (listData.mapping) {
      publicIds = Object.values(listData.mapping).map(url => {
        const match = url.match(/\/v\d+\/(.+)\./);
        return match ? match[1] : null;
      }).filter(id => id);
    } else {
      publicIds = Object.values(listData);
    }

    console.log(`\n📊 IDs a eliminar: ${publicIds.length}`);
    console.log('\n🔍 Primeros 5:');
    publicIds.slice(0, 5).forEach((id, i) => console.log(`   ${i+1}. ${id}`));

    const confirm = await question(`\n⚠️  ¿Eliminar estas ${publicIds.length} imágenes? (s/N): `);
    
    if (confirm.toLowerCase() === 's') {
      console.log('\n🔄 Eliminando...');
      
      // Eliminar en lotes de 100 (límite de Cloudinary)
      const batchSize = 100;
      let deleted = 0;
      
      for (let i = 0; i < publicIds.length; i += batchSize) {
        const batch = publicIds.slice(i, i + batchSize);
        const result = await cloudinary.api.delete_resources(batch);
        deleted += Object.keys(result.deleted || {}).length;
        console.log(`   Progreso: ${deleted}/${publicIds.length}`);
      }
      
      console.log(`✅ Eliminadas: ${deleted} imágenes`);
    } else {
      console.log('❌ Operación cancelada');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================
// FUNCIÓN PARA ELIMINAR UNA SOLA IMAGEN
// =============================================
async function deleteSingle() {
  console.log('\n🖼️ ELIMINAR UNA SOLA IMAGEN');
  console.log('==========================');
  
  const publicId = await question('\n🔑 Public ID de la imagen a eliminar (ej: icons/vehicules/voitures): ');
  
  if (!publicId) {
    console.log('❌ Operación cancelada');
    return;
  }

  try {
    // Verificar si existe
    try {
      await cloudinary.api.resource(publicId);
      console.log(`✅ Imagen encontrada: ${publicId}`);
    } catch (e) {
      console.log(`⚠️ No se pudo verificar la imagen, intentando eliminar de todas formas`);
    }

    const confirm = await question(`\n⚠️  ¿Eliminar "${publicId}"? (s/N): `);
    
    if (confirm.toLowerCase() === 's') {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log('✅ Imagen eliminada correctamente');
      } else {
        console.log(`⚠️ Resultado: ${result.result}`);
      }
    } else {
      console.log('❌ Operación cancelada');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
  console.log('🚀 DELETE IMAGES CLOUDINARY');
  console.log('===========================\n');
  
  console.log('☁️  Conectado como:', process.env.CLOUDINARY_CLOUD_NAME);
  
  console.log('\n📌 ¿Qué quieres eliminar?');
  console.log('   1. Toda una carpeta (ej: icons/)');
  console.log('   2. Lista de imágenes desde un archivo JSON');
  console.log('   3. Una sola imagen');
  console.log('   4. Salir');
  
  const option = await question('\nOpción (1-4): ');
  
  switch(option) {
    case '1':
      await deleteByFolder();
      break;
    case '2':
      await deleteByList();
      break;
    case '3':
      await deleteSingle();
      break;
    case '4':
      console.log('👋 Hasta luego');
      break;
    default:
      console.log('❌ Opción no válida');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Error inesperado:', error);
  rl.close();
});
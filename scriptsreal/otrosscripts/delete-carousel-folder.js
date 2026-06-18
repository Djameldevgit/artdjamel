//  node delete-carousel-folder.js
// Script para subir imágenes del carousel a Cloudinary
// CON ESTRUCTURA DE CARPETAS VISIBLE

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// =============================================
// CARGAR VARIABLES DE ENTORNO
// =============================================
dotenv.config();

// =============================================
// CONFIGURACIÓN
// =============================================
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dfjipgj2o';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('\n📁 Credenciales:');
console.log(`   • Cloud Name: ${CLOUD_NAME}`);
console.log(`   • API Key: ${API_KEY ? '✓ Configurada' : '❌ No definida'}`);
console.log(`   • API Secret: ${API_SECRET ? '✓ Configurado' : '❌ No definido'}`);

if (!API_KEY || !API_SECRET) {
  console.error('\n❌ ERROR: Credenciales no encontradas');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

// =============================================
// RUTAS
// =============================================
const CAROUSEL_PATH = path.join(__dirname, 'client', 'public', 'images', 'carousel');
const OUTPUT_DIR = path.join(__dirname, 'uploads', 'carousel');

// Crear carpeta de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// =============================================
// FUNCIÓN PARA SUBIR IMAGEN CON ESTRUCTURA
// =============================================
async function uploadImage(filePath, type, index) {
  try {
    const fileName = path.basename(filePath);
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Determinar título
    let title = '';
    if (type === 'main') {
      const titles = [
        'Nouvelle Collection Printemps',
        'Soldes Exceptionnelles',
        'Livraison Gratuite',
        'Mode Homme & Femme',
        'Qualité Garantie',
        'Nouveautés Quotidiennes',
        'Collection Été',
        'Soldes Flash'
      ];
      title = titles[index] || `Banner ${index + 1}`;
    } else {
      const titles = [
        'Promo -30%',
        'Livraison Rapide',
        'Nouveautés',
        'Collection Été',
        'Accessoires',
        'Soldes Flash'
      ];
      title = titles[index] || `Side ${index + 1}`;
    }
    
    // 🔥 IMPORTANTE: Construir public_id con estructura de carpetas
    // Esto creará: carousel/main/banner1/nombrearchivo
    const publicId = `carousel/${type}/${fileNameWithoutExt}`;
    
    console.log(`⬆️ Subiendo: ${type}/${fileName}`);
    console.log(`   📁 Ruta Cloudinary: ${publicId}`);
    console.log(`   🏷️  Título: ${title}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      unique_filename: false,
      use_filename: true,
      folder: '', // No usar folder, ya incluimos la ruta en public_id
      context: `caption=${title}|alt=${title}|title=${title}`,
      tags: ['carousel', type, `index_${index}`]
    });

    console.log(`   ✅ URL: ${result.secure_url}`);
    
    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      title: title,
      type: type,
      index: index,
      original_filename: fileName,
      folder: `carousel/${type}`
    };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, file: filePath, error: error.message };
  }
}

// =============================================
// FUNCIÓN PARA SUBIR CON ESTRUCTURA JERÁRQUICA
// =============================================
async function uploadWithHierarchy() {
  const results = {
    main: [],
    side: [],
    mapping: {}
  };

  if (!fs.existsSync(CAROUSEL_PATH)) {
    console.error(`\n❌ ERROR: No existe la carpeta: ${CAROUSEL_PATH}`);
    return results;
  }

  // Procesar carpeta main
  const mainPath = path.join(CAROUSEL_PATH, 'main');
  if (fs.existsSync(mainPath)) {
    console.log('\n📂 Procesando carpeta: main/');
    const mainFiles = fs.readdirSync(mainPath)
      .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .sort();
    
    for (let i = 0; i < mainFiles.length; i++) {
      const file = mainFiles[i];
      const filePath = path.join(mainPath, file);
      const result = await uploadImage(filePath, 'main', i);
      
      if (result.success) {
        results.main.push(result);
        results.mapping[`/images/carousel/main/${file}`] = result.url;
      }
    }
  }

  // Procesar carpeta side
  const sidePath = path.join(CAROUSEL_PATH, 'side');
  if (fs.existsSync(sidePath)) {
    console.log('\n📂 Procesando carpeta: side/');
    const sideFiles = fs.readdirSync(sidePath)
      .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .sort();
    
    for (let i = 0; i < sideFiles.length; i++) {
      const file = sideFiles[i];
      const filePath = path.join(sidePath, file);
      const result = await uploadImage(filePath, 'side', i);
      
      if (result.success) {
        results.side.push(result);
        results.mapping[`/images/carousel/side/${file}`] = result.url;
      }
    }
  }

  return results;
}

// =============================================
// FUNCIÓN PARA VERIFICAR ESTRUCTURA EN CLOUDINARY
// =============================================
async function checkCloudinaryStructure() {
  try {
    console.log('\n🔍 Verificando estructura en Cloudinary...');
    
    // Buscar carpetas
    const folders = await cloudinary.api.root_folders();
    console.log('📂 Carpetas raíz:', folders.folders.map(f => f.name));
    
    // Buscar en carousel
    const carouselFolders = await cloudinary.api.sub_folders('carousel');
    console.log('📂 Subcarpetas en carousel:', carouselFolders.folders.map(f => f.name));
    
    // Mostrar algunas imágenes de ejemplo
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'carousel/',
      max_results: 5
    });
    
    console.log('\n📸 Ejemplos de imágenes:');
    resources.resources.forEach(r => {
      console.log(`   - ${r.public_id}`);
    });
    
  } catch (error) {
    console.log('⚠️ No se pudo verificar estructura:', error.message);
  }
}

// =============================================
// GUARDAR RESULTADOS
// =============================================
function saveResults(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Guardar mapping
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'carousel-mapping.json'),
    JSON.stringify(results.mapping, null, 2)
  );
  
  // Guardar datos completos
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `carousel-complete-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  // Generar configuración para React
  const config = {
    main: results.main.map(r => ({
      url: r.url,
      title: r.title,
      public_id: r.public_id,
      folder: r.folder
    })),
    side: results.side.map(r => ({
      url: r.url,
      title: r.title,
      public_id: r.public_id,
      folder: r.folder
    }))
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'carousel-config.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('\n📁 Archivos guardados en:', OUTPUT_DIR);
  console.log('   - carousel-mapping.json');
  console.log('   - carousel-config.json');
  console.log(`   - carousel-complete-${timestamp}.json`);
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
  console.log('🚀 SUBIENDO IMÁGENES DEL CAROUSEL A CLOUDINARY');
  console.log('==============================================\n');
  console.log('📁 VERSIÓN CON ESTRUCTURA DE CARPETAS VISIBLE\n');
  
  // Verificar conexión
  try {
    await cloudinary.api.ping();
    console.log('✅ Conectado a Cloudinary\n');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
  
  console.log('📁 Estructura local:');
  console.log(`   ${CAROUSEL_PATH}/`);
  console.log(`      ├── main/`);
  console.log(`      └── side/\n`);
  
  const results = await uploadWithHierarchy();
  saveResults(results);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Imágenes principales: ${results.main.length}`);
  console.log(`✅ Imágenes laterales: ${results.side.length}`);
  
  if (results.main.length > 0) {
    console.log('\n🔍 URLs principales (con estructura):');
    results.main.slice(0, 3).forEach((img, i) => {
      console.log(`   ${i+1}. ${img.url}`);
      console.log(`      📁 ${img.public_id}`);
    });
  }
  
  if (results.side.length > 0) {
    console.log('\n🔍 URLs laterales (con estructura):');
    results.side.slice(0, 3).forEach((img, i) => {
      console.log(`   ${i+1}. ${img.url}`);
      console.log(`      📁 ${img.public_id}`);
    });
  }
  
  console.log('\n✅ ESTRUCTURA EN CLOUDINARY:');
  console.log('   📂 carousel/');
  console.log('      📂 main/');
  results.main.forEach(img => {
    const fileName = img.public_id.split('/').pop();
    console.log(`         📸 ${fileName}`);
  });
  console.log('      📂 side/');
  results.side.forEach(img => {
    const fileName = img.public_id.split('/').pop();
    console.log(`         📸 ${fileName}`);
  });
  
  // Verificar estructura en Cloudinary
  await checkCloudinaryStructure();
  
  console.log('\n🎉 PROCESO COMPLETADO!');
  console.log('\n📌 PRÓXIMOS PASOS:');
  console.log('1. Ve a https://console.cloudinary.com');
  console.log('2. En Media Library, busca la carpeta "carousel"');
  console.log('3. Dentro verás las subcarpetas "main" y "side"');
  console.log('4. Las imágenes estarán organizadas dentro de cada carpeta');
}

main().catch(console.error);
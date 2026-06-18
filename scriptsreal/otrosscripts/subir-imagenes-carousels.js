// node subir-imagenes-carousels.js
// node createHeaderFolders.js
// Script para crear carpetas header/carouselHome y header/carouselCategory dentro de Home en Cloudinary

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// =============================================
// CONFIGURACIÓN
// =============================================
const CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('\n🔧 CONFIGURACIÓN CLOUDINARY:');
console.log('============================');
console.log(`   • Cloud Name: ${CLOUD_NAME}`);
console.log(`   • API Key: ${API_KEY ? '✓ Configurada' : '❌ No definida'}`);
console.log(`   • API Secret: ${API_SECRET ? '✓ Configurado' : '❌ No definido'}`);

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('\n❌ ERROR: Faltan credenciales en el archivo .env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

// =============================================
// CARPETAS A CREAR (dentro de Home)
// =============================================
// Asumiendo que la carpeta "Home" ya existe en Cloudinary,
// creamos las subcarpetas necesarias.
const foldersToCreate = [
  'Home/header/carouselHome',
  'Home/header/carouselCategory'
];

// =============================================
// FUNCIÓN: Crear una carpeta (y todas sus subcarpetas)
// =============================================
async function createFolder(folderPath) {
  console.log(`\n📁 Procesando: ${folderPath}`);

  try {
    // Intentar con create_folder (método oficial de la API)
    try {
      await cloudinary.api.create_folder(folderPath);
      console.log(`   ✅ Creada: ${folderPath}`);
      return true;
    } catch (error) {
      // Si el error indica que el método no está soportado, usamos el método alternativo
      if (error.message && error.message.includes('not supported')) {
        console.log(`   ⚠️ Método create_folder no soportado, usando alternativa...`);
        
        // Subir un placeholder (imagen transparente de 1x1) para forzar la creación de la carpeta
        const result = await cloudinary.uploader.upload(
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          {
            folder: folderPath,
            public_id: '.folder_placeholder',
            resource_type: 'image',
            overwrite: false
          }
        );

        console.log(`   ✅ Carpeta creada mediante placeholder: ${folderPath}`);

        // Eliminar el archivo placeholder para dejar la carpeta vacía
        await cloudinary.api.delete_resources([`${folderPath}/.folder_placeholder`], {
          resource_type: 'image'
        });

        return true;
      } else {
        // Si es otro error, lo propagamos
        throw error;
      }
    }
  } catch (error) {
    // Si la carpeta ya existe, no es un error grave
    if (error.message && error.message.includes('already exists')) {
      console.log(`   📂 Ya existe: ${folderPath}`);
      return true;
    } else {
      console.log(`   ❌ Error: ${folderPath} - ${error.message}`);
      return false;
    }
  }
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 CREANDO CARPETAS PARA HEADER EN CLOUDINARY');
  console.log('='.repeat(70));

  console.log('\n📋 Carpetas a crear:');
  foldersToCreate.forEach((folder, index) => {
    console.log(`   ${index + 1}. ${folder}`);
  });

  console.log(`\n⏳ Creando ${foldersToCreate.length} carpetas...`);

  let created = 0;
  let failed = 0;

  for (const folder of foldersToCreate) {
    const success = await createFolder(folder);
    if (success) {
      created++;
    } else {
      failed++;
    }
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  console.log(`   ✅ Creadas/existentes: ${created}`);
  console.log(`   ❌ Fallos: ${failed}`);
  console.log(`   📁 Total procesadas: ${foldersToCreate.length}`);

  // Verificar estructura (opcional)
  console.log('\n🔍 Verificando estructura...');
  try {
    // Verificar que existe Home/header
    const headerFolders = await cloudinary.api.sub_folders('Home');
    console.log('\n📂 Contenido de Home:');
    if (headerFolders.folders.length === 0) {
      console.log('   No hay subcarpetas en Home');
    } else {
      headerFolders.folders.forEach(f => console.log(`   📁 ${f.name}`));
    }

    // Verificar subcarpetas de header
    const carouselFolders = await cloudinary.api.sub_folders('Home/header');
    console.log('\n📂 Contenido de Home/header:');
    if (carouselFolders.folders.length === 0) {
      console.log('   No hay subcarpetas en Home/header');
    } else {
      carouselFolders.folders.forEach(f => console.log(`   📁 ${f.name}`));
    }
  } catch (error) {
    console.log('   ⚠️ No se pudo verificar:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ PROCESO COMPLETADO');
  console.log('='.repeat(70));
}

// =============================================
// EJECUTAR CON CONFIRMACIÓN (opcional)
// =============================================
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n📌 Este script creará las siguientes carpetas en Cloudinary:');
foldersToCreate.forEach(f => console.log(`   • ${f}`));
console.log('\n   Asegúrate de que la carpeta "Home" ya existe en Cloudinary.');

readline.question(`\n⚠️  ¿Continuar con la creación? (s/N): `, async answer => {
  readline.close();
  if (answer.toLowerCase() === 's') {
    await main().catch(console.error);
  } else {
    console.log('❌ Operación cancelada');
  }
});
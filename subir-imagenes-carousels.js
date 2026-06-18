// node subir-imagenes-carousels.js
// node createHeaderFolders.js
// Script para crear carpetas header en Cloudinary con subcarpetas de categorías

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

// Configuración
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfjipgj2o',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Lista de categorías (slugs) que tienes en tu sistema
const categories = [
  'vehicules',
  'vetements',
  'electromenager',
  'immobilier',
  'alimentaires',
  'emploi',
  'informatique',
  'loisirs',
  'materiaux',
  'meubles',
  'pieces-detachees',
  'sante-beaute',
  'services',
  'sport',
  'voyages',
  'boutiques',
  'telephone'
];

// Construir lista de carpetas
const folders = [
  'Home/header/carouselHome',
  ...categories.map(cat => `Home/header/carouselCategory/${cat}`)
];

async function createFolder(folderPath) {
  console.log(`📁 Creando: ${folderPath}`);
  try {
    await cloudinary.api.create_folder(folderPath);
    console.log(`   ✅ Creada: ${folderPath}`);
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log(`   📂 Ya existe: ${folderPath}`);
    } else if (error.message && error.message.includes('not supported')) {
      // Método alternativo con placeholder
      try {
        await cloudinary.uploader.upload(
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          { folder: folderPath, public_id: '.folder_placeholder', overwrite: false }
        );
        await cloudinary.api.delete_resources([`${folderPath}/.folder_placeholder`]);
        console.log(`   ✅ Creada (método alternativo): ${folderPath}`);
      } catch (altError) {
        console.log(`   ❌ Error: ${folderPath} - ${altError.message}`);
      }
    } else {
      console.log(`   ❌ Error: ${folderPath} - ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Creando carpetas en Cloudinary...\n');
  console.log(`Total de carpetas a crear: ${folders.length}`);
  for (const folder of folders) {
    await createFolder(folder);
    await new Promise(resolve => setTimeout(resolve, 500)); // pausa para no saturar
  }
  console.log('\n✅ Proceso completado');
}

main().catch(console.error);
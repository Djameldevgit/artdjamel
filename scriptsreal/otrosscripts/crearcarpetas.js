// node crearcarpetas.js
// Script para FORZAR la creación de nuevas carpetas con los nombres deseados

const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

async function forceCreateFolders() {
  console.log('\n🚀 FORZANDO CREACIÓN DE CARPETAS\n');
  
  // Nuevos nombres que queremos
  const newFolders = [
    'djamel/paginagsfsfincipal/otrapgaina',
    'djamel/eejmpol/gra',
    'djamel/categoriajkjkjks/fssfsf'
  ];
  
  for (const folder of newFolders) {
    console.log(`📁 Creando: ${folder}`);
    
    try {
      // Crear la carpeta subiendo un archivo temporal
      const result = await cloudinary.uploader.upload(
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        {
          folder: folder,
          public_id: '.folder_placeholder',
          resource_type: 'image',
          overwrite: true
        }
      );
      
      console.log(`   ✅ Carpeta creada: ${folder}`);
      
      // Eliminar el archivo temporal
      await cloudinary.api.delete_resources([`${folder}/.folder_placeholder`], {
        resource_type: 'image'
      });
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   📂 La carpeta ya existe`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }
  
  // Mostrar resultado
  console.log('\n📂 Carpetas actuales en djamel:');
  
  try {
    const folders = await cloudinary.api.sub_folders('djamel');
    folders.folders.forEach(f => {
      console.log(`   • ${f.name}`);
    });
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n✨ Proceso completado!');
  console.log('\n📌 NOTA: Las carpetas antiguas (home, categoryPage) aún existen');
  console.log('   Si quieres eliminarlas, hazlo manualmente desde el dashboard de Cloudinary');
}

forceCreateFolders();
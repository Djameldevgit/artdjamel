// setup-header-cloudinary.js
// Script para:
// 1. Crear carpeta header en Cloudinary
// 2. Crear subcarpetas home y categoryPage dentro de header
// 3. Subir imágenes a cada carpeta

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// =============================================
// CONFIGURACIÓN - CORREGIDA
// =============================================
// Usamos CLOUD_NAME del .env en lugar de CLOUDINARY_CLOUD_NAME
const CLOUD_NAME = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dfjipgj2o';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('\n🔧 CONFIGURACIÓN CLOUDINARY:');
console.log('============================');
console.log(`   • Cloud Name: ${CLOUD_NAME}`);
console.log(`   • API Key: ${API_KEY ? '✓ Configurada' : '❌ No definida'}`);
console.log(`   • API Secret: ${API_SECRET ? '✓ Configurado' : '❌ No definido'}`);

// Mostrar valores parciales para verificar (ocultando parte por seguridad)
if (API_KEY) {
  console.log(`   • API Key (primeros 4): ${API_KEY.substring(0,4)}...`);
}
if (API_SECRET) {
  console.log(`   • API Secret (primeros 4): ${API_SECRET.substring(0,4)}...`);
}

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('\n❌ ERROR: Faltan credenciales en el archivo .env');
  console.log('📌 Variables detectadas:');
  console.log(`   CLOUD_NAME: ${process.env.CLOUD_NAME ? '✓' : '❌'}`);
  console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✓' : '❌'}`);
  console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✓' : '❌'}`);
  console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✓' : '❌'}`);
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

// =============================================
// RUTAS LOCALES DE LAS IMÁGENES
// =============================================
const IMAGES_PATH = path.join(__dirname, 'client', 'public', 'images', 'header');

// =============================================
// PASO 1: CREAR CARPETAS EN CLOUDINARY
// =============================================
async function crearCarpetas() {
  console.log('\n📁 PASO 1: CREANDO CARPETAS EN CLOUDINARY');
  console.log('==========================================');
  
  const carpetas = [
    'header',
    'header/home',
    'header/categoryPage'
  ];
  
  for (const carpeta of carpetas) {
    try {
      // Intentar con create_folder primero
      await cloudinary.api.create_folder(carpeta);
      console.log(`   ✅ Carpeta creada: ${carpeta}`);
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`   📂 Carpeta ya existe: ${carpeta}`);
      } else {
        // Si create_folder falla, usar método alternativo
        try {
          await cloudinary.uploader.upload(
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            {
              folder: carpeta,
              public_id: '.folder_placeholder',
              resource_type: 'image',
              overwrite: false
            }
          );
          console.log(`   ✅ Carpeta creada (método alternativo): ${carpeta}`);
        } catch (uploadError) {
          if (uploadError.message && uploadError.message.includes('already exists')) {
            console.log(`   📂 Carpeta ya existe: ${carpeta}`);
          } else {
            console.log(`   ⚠️ Error con ${carpeta}: ${uploadError.message}`);
          }
        }
      }
    }
  }
}

// =============================================
// PASO 2: SUBIR IMÁGENES A HOME
// =============================================
async function subirImagenesHome() {
  console.log('\n🏠 PASO 2: SUBIENDO IMÁGENES A CARPETA HOME');
  console.log('============================================');
  
  const homePath = path.join(IMAGES_PATH, 'home');
  const resultados = [];
  
  if (!fs.existsSync(homePath)) {
    console.log(`   ⚠️ No existe la carpeta: ${homePath}`);
    console.log('   📌 Creando estructura de carpetas local...');
    fs.mkdirSync(homePath, { recursive: true });
    console.log(`   ✅ Carpeta creada: ${homePath}`);
    console.log('   📌 Coloca imágenes en esta carpeta y vuelve a ejecutar el script');
    return resultados;
  }
  
  const archivos = fs.readdirSync(homePath)
    .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
    .sort();
  
  if (archivos.length === 0) {
    console.log('   ⚠️ No hay imágenes en la carpeta home');
    console.log(`   📌 Coloca imágenes en: ${homePath}`);
    return resultados;
  }
  
  console.log(`   📸 Encontradas: ${archivos.length} imágenes`);
  
  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    const rutaCompleta = path.join(homePath, archivo);
    const nombreSinExt = archivo.replace(/\.[^/.]+$/, '');
    const nombrePublicId = `home-${nombreSinExt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    
    console.log(`   ⬆️ [${i+1}/${archivos.length}] Subiendo: ${archivo}`);
    
    try {
      const result = await cloudinary.uploader.upload(rutaCompleta, {
        public_id: nombrePublicId,
        folder: 'header/home',
        overwrite: true,
        unique_filename: false,
        use_filename: true
      });
      
      console.log(`      ✅ URL: ${result.secure_url}`);
      resultados.push({
        archivo: archivo,
        url: result.secure_url,
        public_id: result.public_id,
        nombre: nombreSinExt
      });
    } catch (error) {
      console.error(`      ❌ Error: ${error.message}`);
    }
  }
  
  return resultados;
}

// =============================================
// PASO 3: SUBIR IMÁGENES A CATEGORY PAGE
// =============================================
async function subirImagenesCategory() {
  console.log('\n📑 PASO 3: SUBIENDO IMÁGENES A CARPETA CATEGORY PAGE');
  console.log('====================================================');
  
  const categoryPath = path.join(IMAGES_PATH, 'categoryPage');
  const resultados = [];
  
  if (!fs.existsSync(categoryPath)) {
    console.log(`   ⚠️ No existe la carpeta: ${categoryPath}`);
    console.log('   📌 Creando estructura de carpetas local...');
    fs.mkdirSync(categoryPath, { recursive: true });
    console.log(`   ✅ Carpeta creada: ${categoryPath}`);
    console.log('   📌 Coloca imágenes en esta carpeta y vuelve a ejecutar el script');
    return resultados;
  }
  
  const archivos = fs.readdirSync(categoryPath)
    .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
    .sort();
  
  if (archivos.length === 0) {
    console.log('   ⚠️ No hay imágenes en la carpeta categoryPage');
    console.log(`   📌 Coloca imágenes en: ${categoryPath}`);
    return resultados;
  }
  
  console.log(`   📸 Encontradas: ${archivos.length} imágenes`);
  
  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    const rutaCompleta = path.join(categoryPath, archivo);
    const nombreSinExt = archivo.replace(/\.[^/.]+$/, '');
    const nombrePublicId = `category-${nombreSinExt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    
    console.log(`   ⬆️ [${i+1}/${archivos.length}] Subiendo: ${archivo}`);
    
    try {
      const result = await cloudinary.uploader.upload(rutaCompleta, {
        public_id: nombrePublicId,
        folder: 'header/categoryPage',
        overwrite: true,
        unique_filename: false,
        use_filename: true
      });
      
      console.log(`      ✅ URL: ${result.secure_url}`);
      resultados.push({
        archivo: archivo,
        url: result.secure_url,
        public_id: result.public_id,
        nombre: nombreSinExt
      });
    } catch (error) {
      console.error(`      ❌ Error: ${error.message}`);
    }
  }
  
  return resultados;
}

// =============================================
// PASO 4: GENERAR ARCHIVO DE CONFIGURACIÓN
// =============================================
function generarConfiguracion(resultadosHome, resultadosCategory) {
  console.log('\n📝 PASO 4: GENERANDO ARCHIVOS DE CONFIGURACIÓN');
  console.log('===============================================');
  
  const CONFIG_DIR = path.join(__dirname, 'src', 'config');
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  const UPLOADS_DIR = path.join(__dirname, 'uploads', 'cloudinary-setup');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  
  // ===== ARCHIVO PRINCIPAL =====
  const configFile = path.join(CONFIG_DIR, 'header-images.js');
  
  const homeImages = resultadosHome.map(item => ({
    nombre: item.nombre,
    archivo: item.archivo,
    url: item.url
  }));
  
  const categoryImages = resultadosCategory.map(item => ({
    nombre: item.nombre,
    archivo: item.archivo,
    url: item.url
  }));
  
  const configContent = `// header-images.js
// URLs de imágenes de header en Cloudinary
// Generado automáticamente el ${new Date().toLocaleString()}
// Cloud Name: ${CLOUD_NAME}

export const HEADER_IMAGES = {
  home: ${JSON.stringify(homeImages, null, 2)},
  categoryPage: ${JSON.stringify(categoryImages, null, 2)}
};

// Función helper para obtener imágenes de home
export const getHomeImages = () => HEADER_IMAGES.home.map(img => img.url);

// Función helper para obtener imágenes de categoryPage
export const getCategoryPageImages = () => HEADER_IMAGES.categoryPage.map(img => img.url);

// Función helper para obtener imagen específica de home por índice
export const getHomeImageByIndex = (index) => {
  if (!HEADER_IMAGES.home[index]) {
    console.warn(\`⚠️ Imagen home con índice \${index} no encontrada\`);
    return null;
  }
  return HEADER_IMAGES.home[index].url;
};

// Función helper para obtener imagen específica de category por índice
export const getCategoryImageByIndex = (index) => {
  if (!HEADER_IMAGES.categoryPage[index]) {
    console.warn(\`⚠️ Imagen category con índice \${index} no encontrada\`);
    return null;
  }
  return HEADER_IMAGES.categoryPage[index].url;
};

// Todas las URLs en formato simple
export const ALL_HEADER_URLS = {
  home: HEADER_IMAGES.home.map(img => img.url),
  categoryPage: HEADER_IMAGES.categoryPage.map(img => img.url)
};
`;

  fs.writeFileSync(configFile, configContent);
  console.log(`   ✅ Archivo generado: ${configFile}`);
  
  // ===== ARCHIVO JSON BACKUP =====
  const backupFile = path.join(UPLOADS_DIR, `header-images-${Date.now()}.json`);
  const backupData = {
    fecha: new Date().toISOString(),
    cloud_name: CLOUD_NAME,
    carpetas: {
      header: {
        home: {
          total: resultadosHome.length,
          imagenes: resultadosHome
        },
        categoryPage: {
          total: resultadosCategory.length,
          imagenes: resultadosCategory
        }
      }
    },
    estadisticas: {
      totalImagenes: resultadosHome.length + resultadosCategory.length,
      home: resultadosHome.length,
      categoryPage: resultadosCategory.length
    }
  };
  
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`   ✅ Backup JSON: ${backupFile}`);
  
  return backupData;
}

// =============================================
// PASO 5: VERIFICAR ESTRUCTURA FINAL
// =============================================
async function verificarEstructura() {
  console.log('\n🔍 PASO 5: VERIFICANDO ESTRUCTURA FINAL');
  console.log('=======================================');
  
  try {
    // Verificar conexión
    const pingResult = await cloudinary.api.ping();
    console.log('   ✅ Conexión a Cloudinary exitosa');
    
    // Verificar carpetas
    const folders = await cloudinary.api.root_folders();
    const headerFolder = folders.folders.find(f => f.name === 'header');
    
    if (headerFolder) {
      console.log('   ✅ Carpeta header encontrada');
      
      // Verificar subcarpetas
      const subfolders = await cloudinary.api.sub_folders('header');
      console.log('   📂 Subcarpetas en header:', subfolders.folders.map(f => f.name));
      
    } else {
      console.log('   ⚠️ No se encontró la carpeta header');
    }
    
  } catch (error) {
    console.log('   ⚠️ Error al verificar estructura:', error.message);
  }
}

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SETUP DE CARPETAS HEADER EN CLOUDINARY');
  console.log('='.repeat(60));
  console.log('\n📌 Estructura a crear:');
  console.log('   📁 header/');
  console.log('   ├── 📁 home/');
  console.log('   └── 📁 categoryPage/');
  
  // Verificar conexión primero
  try {
    await cloudinary.api.ping();
    console.log('\n✅ Conexión a Cloudinary verificada');
  } catch (error) {
    console.error('\n❌ Error de conexión a Cloudinary:', error.message);
    console.log('\n📌 Verifica tus credenciales:');
    console.log(`   Cloud Name: ${CLOUD_NAME}`);
    console.log(`   API Key: ${API_KEY ? '✓' : '❌'}`);
    console.log(`   API Secret: ${API_SECRET ? '✓' : '❌'}`);
    process.exit(1);
  }
  
  // PASO 1: Crear carpetas
  await crearCarpetas();
  
  // PASO 2: Subir imágenes a home
  const resultadosHome = await subirImagenesHome();
  
  // PASO 3: Subir imágenes a categoryPage
  const resultadosCategory = await subirImagenesCategory();
  
  // PASO 4: Generar configuración
  if (resultadosHome.length > 0 || resultadosCategory.length > 0) {
    const config = generarConfiguracion(resultadosHome, resultadosCategory);
    
    // PASO 5: Verificar estructura
    await verificarEstructura();
    
    // RESUMEN FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Total imágenes subidas: ${config.estadisticas.totalImagenes}`);
    console.log(`   • home: ${config.estadisticas.home} imágenes`);
    console.log(`   • categoryPage: ${config.estadisticas.categoryPage} imágenes`);
  } else {
    console.log('\n⚠️ No se subieron imágenes. Las carpetas fueron creadas pero están vacías.');
    console.log('📌 Coloca imágenes en las carpetas locales y vuelve a ejecutar el script:');
    console.log(`   • ${path.join(IMAGES_PATH, 'home')}`);
    console.log(`   • ${path.join(IMAGES_PATH, 'categoryPage')}`);
  }
  
  console.log('\n✅ PROCESO COMPLETADO!');
}

// Ejecutar el script
main().catch(error => {
  console.error('\n❌ Error en la ejecución:', error);
  process.exit(1);
});
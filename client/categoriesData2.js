// node categoriesData2.js
// Crea carpetas y placeholders de iconos para las CATEGORÍAS DE PINTURA (óleo)
// Ejecutar desde la raíz del proyecto: node scripts/categoriesData2.js

const fs = require('fs');
const path = require('path');

// Ruta base - /public/categories/ (desde la raíz del proyecto)
const basePath = path.join(process.cwd(), 'public', 'categories');

console.log('📁 Ruta base calculada:', basePath);
console.log('📁 Directorio actual:', process.cwd());

// ============================================
// 📋 LISTA DE SLUGS (CATEGORÍAS PICTÓRICAS)
// ============================================
// Orden lógico para el slider (puedes reordenarlo a tu gusto)
const mainCategories = [
  'portraits',
  'paysages',
  'paysages-locaux',
  'marines',
  'natures-mortes',
  'abstrait',
   
  'urbain',
   
  'animalier',
  'floral',
  
];

// Nombres legibles (por defecto en francés)
const categoryNames = {
  'portraits': 'Portraits',
  'paysages': 'Paysages',
  'paysages-locaux': 'Paysages locaux',
  'marines': 'Marines',
  'natures-mortes': 'Natures mortes',
  'abstrait': 'Abstrait',
  'figuratif': 'Figuratif',
  'urbain': 'Urbain',
  'scenes-de-genre': 'Scènes de genre',
  'animalier': 'Animalier',
  'floral': 'Fleurs & Jardins',
  'nus': 'Nus',
  'religieux': 'Art religieux',
  'mythologique': 'Mythologique',
  'allegorique': 'Allégorique',
  'architecture': 'Architecture',
  'interieurs': 'Intérieurs'
};

// Nombres en francés (igual que los principales, pero separado por si quieres variar)
const categoryNamesFr = { ...categoryNames };

// Nombres en árabe (opcional, puedes traducir más tarde)
const categoryNamesAr = {
  'portraits': 'بورتريهات',
  'paysages': 'مناظر طبيعية',
  'paysages-locaux': 'مناظر محلية',
  'marines': 'بحرية',
  'natures-mortes': 'طبيعة صامتة',
  'abstrait': 'تجريدي',
  'figuratif': 'تشخيصي',
  'urbain': 'حضري',
  'scenes-de-genre': 'مشاهد يومية',
  'animalier': 'حيوانات',
  'floral': 'زهور وحدائق',
  'nus': 'عرايا فنية',
  'religieux': 'فن ديني',
  'mythologique': 'أساطير',
  'allegorique': 'رمزي',
  'architecture': 'عمارة',
  'interieurs': 'ديكورات داخلية'
};

// Iconos (emoji) para cada categoría
const categoryIcons = {
  'portraits': '🎭',
  'paysages': '🌄',
  'paysages-locaux': '🏞️',
  'marines': '🌊',
  'natures-mortes': '🍎',
  'abstrait': '🌀',
  'figuratif': '👥',
  'urbain': '🏙️',
  'scenes-de-genre': '🚶',
  'animalier': '🐎',
  'floral': '🌻',
  'nus': '🎨',
  'religieux': '⛪',
  'mythologique': '🏛️',
  'allegorique': '📜',
  'architecture': '🏛️',
  'interieurs': '🛋️'
};

// Colores asociados (para UI: fondo, bordes, etc.)
const categoryColors = {
  'portraits': '#D96C6C',
  'paysages': '#6C9ED9',
  'paysages-locaux': '#6CAED9',
  'marines': '#2F8FBD',
  'natures-mortes': '#B88A3D',
  'abstrait': '#B565A7',
  'figuratif': '#E68A2E',
  'urbain': '#7D6B5E',
  'scenes-de-genre': '#A3A847',
  'animalier': '#A56947',
  'floral': '#E88D4D',
  'nus': '#D98695',
  'religieux': '#8B5A2B',
  'mythologique': '#6C3483',
  'allegorique': '#1F7A8C',
  'architecture': '#5D6D7E',
  'interieurs': '#C39D63'
};

// Prioridad (todas 'normal' ya que no hay destacadas especiales)
const categoryPriority = {};
mainCategories.forEach(slug => { categoryPriority[slug] = 'normal'; });

// Tipo de categoría (todas 'art' o 'commercial' según prefieras)
const categoryType = {};
mainCategories.forEach(slug => { categoryType[slug] = 'art'; });

// ============================================
// FUNCIONES (no necesitas modificar nada de aquí en adelante)
// ============================================

function createCategoryIcons(basePath, slugs) {
  console.log('\n📁 Creando estructura en:', basePath);
  console.log('='.repeat(60));

  const publicPath = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicPath)) {
    console.log(`⚠️ La carpeta 'public' no existe, creándola...`);
    fs.mkdirSync(publicPath, { recursive: true });
    console.log(`✅ Creada carpeta: ${publicPath}`);
  }

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
    console.log(`✅ Creada carpeta base: ${basePath}\n`);
  }

  let totalIcons = 0;
  let orderNumber = 1;

  for (const slug of slugs) {
    const priorityIcon = categoryPriority[slug] === 'high' ? '🔥' : '📌';
    const specialIcon = categoryType[slug] === 'special' ? '✨' : '  ';
    console.log(`${orderNumber}. ${priorityIcon} ${specialIcon} Procesando: ${categoryNames[slug] || slug} (${slug})`);
    
    const categoryPath = path.join(basePath, slug);
    
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
      console.log(`      ✅ Creada carpeta: ${slug}/`);
    } else {
      console.log(`      📁 Carpeta existe: ${slug}/`);
    }

    const iconFile = `${slug}.png`;
    const iconPath = path.join(categoryPath, iconFile);
    
    if (!fs.existsSync(iconPath)) {
      // PNG transparente de 1x1 (base64 válido)
      const emptyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const emptyPngBuffer = Buffer.from(emptyPngBase64, 'base64');
      fs.writeFileSync(iconPath, emptyPngBuffer);
      console.log(`      🖼️  Icono creado: ${slug}/${iconFile}`);
      totalIcons++;
    } else {
      console.log(`      ⏭️  Icono ya existe: ${slug}/${iconFile}`);
    }
    
    orderNumber++;
    console.log('');
  }

  return { totalIcons, totalCategories: slugs.length };
}

function createCategoriesConfig(slugs) {
  const configPath = path.join(basePath, 'categories-config.json');
  
  const config = {
    version: '4.0.0', // versión para arte
    lastUpdated: new Date().toISOString(),
    totalCategories: slugs.length,
    categories: slugs.map((slug, index) => ({
      order: index + 1,
      slug: slug,
      name: categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      nameFr: categoryNamesFr[slug] || categoryNames[slug],
      nameAr: categoryNamesAr[slug] || categoryNames[slug],
      icon: categoryIcons[slug] || '🎨',
      iconUrl: `/categories/${slug}/${slug}.png`,
      iconColor: categoryColors[slug] || '#666666',
      bgColor: `${categoryColors[slug] || '#666666'}15`,
      priority: categoryPriority[slug] || 'normal',
      type: categoryType[slug] || 'art',
      isActive: true,
      isPublic: true,
      isAdminOnly: false,
      isSpecial: false
    }))
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n📄 Configuración guardada en: ${configPath}`);
  return config;
}

function verifyStructure(basePath, slugs) {
  console.log('\n🔍 Verificando estructura:');
  console.log('='.repeat(60));
  
  let errors = [];
  let successCount = 0;
  
  for (const slug of slugs) {
    const iconPath = path.join(basePath, slug, `${slug}.png`);
    if (!fs.existsSync(iconPath)) {
      errors.push(`❌ Icono faltante: ${slug}/${slug}.png`);
    } else {
      const priorityIcon = categoryPriority[slug] === 'high' ? '🔥' : '  ';
      console.log(`${priorityIcon} ✅ ${slug}/ - OK`);
      successCount++;
    }
  }
  
  if (errors.length) {
    console.log('\n⚠️  Errores:');
    errors.forEach(e => console.log(e));
  } else {
    console.log(`\n✨ ¡Todas las ${successCount} categorías están correctas!`);
  }
  return errors.length === 0;
}

function showFinalOrder(slugs) {
  console.log('\n📋 ORDEN FINAL DE CATEGORÍAS (para el slider):');
  console.log('='.repeat(60));
  
  slugs.forEach((slug, index) => {
    const num = (index + 1).toString().padStart(2, ' ');
    const priorityIcon = categoryPriority[slug] === 'high' ? '🔥' : '  ';
    const specialIcon = categoryType[slug] === 'special' ? '✨' : '  ';
    const name = categoryNames[slug] || slug;
    console.log(`${num}. ${priorityIcon} ${specialIcon} ${name} (${slug})`);
  });
}

function checkProjectRoot() {
  const hasPublicFolder = fs.existsSync(path.join(process.cwd(), 'public'));
  const hasPackageJson = fs.existsSync(path.join(process.cwd(), 'package.json'));
  
  if (!hasPublicFolder && hasPackageJson) {
    console.log('⚠️ La carpeta "public" no existe en la raíz del proyecto.');
    console.log('   Se creará automáticamente.\n');
  } else if (!hasPackageJson) {
    console.error('❌ Error: Este script debe ejecutarse desde la raíz del proyecto.');
    console.error('   Ejecuta: node scripts/categoriesData2.js');
    process.exit(1);
  }
}

// === EJECUCIÓN ===
console.log('\n🎨 Iniciando creación de iconos para categorías de pintura (VideCommerce Art)');
console.log('='.repeat(60));

checkProjectRoot();

console.log(`📊 Categorías pictóricas a procesar: ${mainCategories.length}\n`);

showFinalOrder(mainCategories);
console.log('\n' + '='.repeat(60));

const stats = createCategoryIcons(basePath, mainCategories);

console.log('='.repeat(60));
console.log('📊 RESUMEN:');
console.log(`   • ${stats.totalCategories} carpetas/iconos procesados`);
console.log(`   • ${stats.totalIcons} iconos creados (placeholders PNG)`);
console.log(`   • Categorías listas para slider y filtros`);

createCategoriesConfig(mainCategories);
verifyStructure(basePath, mainCategories);

console.log('\n📂 ESTRUCTURA GENERADA:');
console.log('/public/categories/');
mainCategories.forEach(slug => {
  const priorityIcon = categoryPriority[slug] === 'high' ? '🔥' : '  ';
  console.log(`${priorityIcon} ├── ${slug}/`);
  console.log(`      └── ${slug}.png`);
});

console.log('\n✅ PROCESO COMPLETADO\n');
console.log('📝 NOTA: Los iconos son placeholders PNG de 1x1 píxel.');
console.log('💡 Reemplázalos con tus iconos reales (formato PNG, recomendado 32x32 o 64x64).');
console.log('\n🚀 Ejecuta este script con:');
console.log('   cd /ruta/del/proyecto');
console.log('   node scripts/categoriesData2.js');
// generateSeedFromFolders.js
// Script que escanea seedCategories/ y genera un seed para MongoDB
// con URLs de Cloudinary tipo: home/header/carouselCategoryPage/[cat]/level[X]/[archivo].png

const fs = require('fs');
const path = require('path');

// =============================================
// CONFIGURACIÓN
// =============================================
const CLOUD_NAME = 'dfjipgj2o';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;
const CLOUDINARY_FOLDER = 'home/header/carouselCategoryPage'; // carpeta raíz en Cloudinary

const SEED_CATEGORIES_PATH = path.join(__dirname, 'seedCategories'); // carpeta con level1, level2, level3
const OUTPUT_SEED = path.join(__dirname, 'seedCategoriesCloudinary.generated.js');

// =============================================
// FUNCIÓN PARA GENERAR URL
// =============================================
function getCloudinaryUrl(categoria, level, fileName) {
  // fileName debe ser sin extensión (ej. 'vehicules')
  const publicId = `${CLOUDINARY_FOLDER}/${categoria}/level${level}/${fileName}`;
  return `${BASE_URL}${publicId}.png`;
}

// =============================================
// ESCANEAR CARPETAS Y CONSTRUIR OBJETO CATEGORÍAS
// =============================================
function buildCategoryTree() {
  console.log('\n📁 Escaneando carpeta:', SEED_CATEGORIES_PATH);
  if (!fs.existsSync(SEED_CATEGORIES_PATH)) {
    console.error('❌ No existe la carpeta seedCategories/');
    process.exit(1);
  }

  const categories = [];
  const mainCategories = fs.readdirSync(SEED_CATEGORIES_PATH).filter(item => {
    const fullPath = path.join(SEED_CATEGORIES_PATH, item);
    return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
  });

  console.log(`📌 Categorías principales encontradas: ${mainCategories.length}\n`);

  mainCategories.forEach((catKey, index) => {
    const catPath = path.join(SEED_CATEGORIES_PATH, catKey);
    const category = {
      name: catKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // formatear
      slug: catKey,
      level: 1,
      order: index + 1, // puedes ajustar el orden
      icon: null,
      children: []
    };

    // ===== NIVEL 1 (level1) =====
    const level1Path = path.join(catPath, 'level1');
    if (fs.existsSync(level1Path)) {
      const files = fs.readdirSync(level1Path).filter(f => f.endsWith('.png') && !f.startsWith('.'));
      if (files.length > 0) {
        const fileName = files[0].replace('.png', '');
        category.icon = getCloudinaryUrl(catKey, 1, fileName);
        console.log(`   ✅ ${catKey} → level1: ${fileName}.png`);
      } else {
        console.log(`   ⚠️ ${catKey} → level1 sin PNG`);
      }
    } else {
      console.log(`   ⚠️ ${catKey} → no tiene level1`);
    }

    // ===== NIVEL 2 (level2) =====
    const level2Path = path.join(catPath, 'level2');
    if (fs.existsSync(level2Path)) {
      const level2Files = fs.readdirSync(level2Path).filter(f => f.endsWith('.png') && !f.startsWith('.'));
      level2Files.forEach((file, idx) => {
        const slug = file.replace('.png', '');
        const subCategory = {
          name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: slug,
          level: 2,
          order: idx + 1,
          icon: getCloudinaryUrl(catKey, 2, slug),
          children: []
        };

        // ===== NIVEL 3 (level3) =====
        const level3Path = path.join(catPath, 'level3');
        if (fs.existsSync(level3Path)) {
          const level3Files = fs.readdirSync(level3Path).filter(f => f.endsWith('.png') && !f.startsWith('.'));
          // Filtramos los que pertenecen a esta subcategoría (por convención, el nombre empieza con el slug de level2)
          const relatedLevel3 = level3Files.filter(f => f.startsWith(slug + '-') || f.startsWith(slug + '_'));
          relatedLevel3.forEach((f, jdx) => {
            const slug3 = f.replace('.png', '');
            const article = {
              name: slug3.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              slug: slug3,
              level: 3,
              order: jdx + 1,
              icon: getCloudinaryUrl(catKey, 3, slug3),
              children: []
            };
            subCategory.children.push(article);
          });
        }

        category.children.push(subCategory);
      });
      console.log(`   📂 ${catKey} → level2: ${level2Files.length} subcategorías`);
    }

    categories.push(category);
  });

  return categories;
}

// =============================================
// GENERAR ARCHIVO SEED
// =============================================
function generateSeedFile(categories) {
  const content = `// Seed generado automáticamente desde la carpeta seedCategories/
// Fecha: ${new Date().toLocaleString()}
// Cloudinary base: ${BASE_URL}${CLOUDINARY_FOLDER}/

module.exports = ${JSON.stringify(categories, null, 2)};
`;
  fs.writeFileSync(OUTPUT_SEED, content, 'utf8');
  console.log(`\n✅ Seed guardado en: ${OUTPUT_SEED}`);
}

// =============================================
// RESUMEN
// =============================================
function showSummary(categories) {
  let totalLevel2 = 0, totalLevel3 = 0;
  categories.forEach(c => {
    totalLevel2 += c.children.length;
    c.children.forEach(c2 => totalLevel3 += c2.children.length);
  });

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`Categorías principales: ${categories.length}`);
  console.log(`Subcategorías level 2: ${totalLevel2}`);
  console.log(`Artículos level 3: ${totalLevel3}`);
  console.log(`Total items: ${categories.length + totalLevel2 + totalLevel3}`);
}

// =============================================
// MAIN
// =============================================
function main() {
  console.log('\n🚀 GENERADOR DE SEED DE CATEGORÍAS DESDE CARPETAS');
  console.log('================================================\n');

  const categories = buildCategoryTree();
  generateSeedFile(categories);
  showSummary(categories);

  console.log('\n✅ Proceso completado. Revisa el archivo generado.');
}

main();
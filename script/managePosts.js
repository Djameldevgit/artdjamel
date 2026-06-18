// 📂 node  scriptTelephone/managePosts.js list boutique=true
 
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

// ============ CONFIGURACIÓN ============
const OPERATIONS = {
  LIST: 'list',
  UPDATE: 'update',
  DELETE: 'delete',
  FIX_CATEGORY: 'fix-category',
  STATS: 'stats',
  EXPORT: 'export'
};

// ============ CONEXIÓN ============
async function connectDB() {
  console.log('🔌 Conectando a MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ Conectado a MongoDB\n');
}

async function disconnectDB() {
  console.log('\n🔌 Cerrando conexión...');
  await mongoose.disconnect();
  process.exit(0);
}

// ============ MODELOS ============
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');

// ============ FUNCIONES DE UTILIDAD ============
function parseArgs() {
  const args = process.argv.slice(2);
  const operation = args[0];
  const params = {};
  
  for (let i = 1; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key && value) {
      params[key] = value;
    }
  }
  
  return { operation, params };
}

function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              📦 GESTOR DE POSTS POR CATEGORÍA                 ║
╚═══════════════════════════════════════════════════════════════╝

📌 USO:
  node scripts/managePosts.js <operación> [parámetros]

📋 OPERACIONES DISPONIBLES:

  1. LISTAR POSTS
     node scripts/managePosts.js list category=telephone
     node scripts/managePosts.js list category=vehicules subCategory=voitures
     node scripts/managePosts.js list boutique=true

  2. ACTUALIZAR POSTS
     node scripts/managePosts.js update category=telephone field=category value=69bdcafb0a38bd0b84ead629
     node scripts/managePosts.js update category=vehicules field=isActive value=false
     node scripts/managePosts.js update category=telephone field=price value=0

  3. ELIMINAR POSTS
     node scripts/managePosts.js delete category=telephone
     node scripts/managePosts.js delete category=vehicules subCategory=voitures
     node scripts/managePosts.js delete ids=69ba4153e369ec15b88dd578,69ba64c02eb3810032b7accb

  4. CORREGIR CATEGORÍA (FIX)
     node scripts/managePosts.js fix-category category=telephone
     node scripts/managePosts.js fix-category category=vehicules targetCategory=vehicules

  5. ESTADÍSTICAS
     node scripts/managePosts.js stats
     node scripts/managePosts.js stats category=telephone

  6. EXPORTAR POSTS
     node scripts/managePosts.js export category=telephone
     node scripts/managePosts.js export category=vehicules format=json

📝 PARÁMETROS DISPONIBLES:
  category       - Slug de la categoría (telephone, vehicules, etc.)
  subCategory    - Slug de la subcategoría
  articleType    - Slug del artículo
  boutique       - true/false (posts de boutique)
  field          - Campo a actualizar
  value          - Nuevo valor
  ids            - IDs separados por comas
  targetCategory - Categoría destino para fix
  format         - json o console (para export)
  dryRun         - true (simular sin ejecutar)

⚠️  PRECAUCIÓN: Las operaciones de DELETE son IRREVERSIBLES.
   Usa dryRun=true primero para ver qué se va a eliminar.
`);
}

// ============ CONSTRUIR FILTRO ============
async function buildFilter(params) {
  const filter = {};
  
  // Filtrar por categoría
  if (params.category) {
    const category = await Category.findOne({ 
      $or: [
        { slug: params.category },
        { slug: { $regex: new RegExp(params.category, 'i') } }
      ]
    }).lean();
    
    if (category) {
      filter.category = category._id;
      console.log(`📌 Categoría encontrada: ${category.name} (${category._id})`);
    } else {
      console.warn(`⚠️ No se encontró categoría: ${params.category}`);
    }
  }
  
  // Filtrar por subcategoría
  if (params.subCategory) {
    filter.subCategory = params.subCategory;
  }
  
  // Filtrar por artículo
  if (params.articleType) {
    filter.articleType = params.articleType;
  }
  
  // Filtrar por boutique
  if (params.boutique === 'true') {
    filter.isFromBoutique = true;
  } else if (params.boutique === 'false') {
    filter.isFromBoutique = { $ne: true };
  }
  
  // Filtrar por IDs específicos
  if (params.ids) {
    const ids = params.ids.split(',').map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return id;
      }
    });
    filter._id = { $in: ids };
  }
  
  return filter;
}

// ============ LISTAR POSTS ============
async function listPosts(params) {
  console.log('\n📋 ============ LISTANDO POSTS ============\n');
  
  const filter = await buildFilter(params);
  console.log('🔍 Filtro:', JSON.stringify(filter, null, 2));
  
  const posts = await Post.find(filter).lean();
  
  console.log(`\n📊 Total: ${posts.length} posts encontrados\n`);
  
  if (posts.length === 0) {
    console.log('❌ No se encontraron posts con ese filtro');
    return;
  }
  
  posts.forEach((post, index) => {
    console.log(`\n--- Post ${index + 1} ---`);
    console.log(`📌 _id: ${post._id}`);
    console.log(`📌 title: ${post.title}`);
    console.log(`📌 categorie: ${post.categorie || 'N/A'}`);
    console.log(`📌 subCategory: ${post.subCategory || 'N/A'}`);
    console.log(`📌 articleType: ${post.articleType || 'N/A'}`);
    console.log(`📌 category: ${post.category}`);
    console.log(`📌 price: ${post.price || 'N/A'}`);
    console.log(`📌 isFromBoutique: ${post.isFromBoutique || false}`);
    console.log(`📌 wilaya: ${post.wilaya || 'N/A'}`);
    console.log(`📌 createdAt: ${post.createdAt}`);
  });
}

// ============ ACTUALIZAR POSTS ============
async function updatePosts(params) {
  console.log('\n✏️ ============ ACTUALIZANDO POSTS ============\n');
  
  const { field, value, dryRun } = params;
  
  if (!field) {
    console.error('❌ Error: Se requiere field=nombreDelCampo');
    return;
  }
  
  const filter = await buildFilter(params);
  console.log('🔍 Filtro:', JSON.stringify(filter, null, 2));
  
  // Contar primero
  const count = await Post.countDocuments(filter);
  console.log(`\n📊 Posts que serán afectados: ${count}`);
  
  if (count === 0) {
    console.log('❌ No se encontraron posts con ese filtro');
    return;
  }
  
  // Mostrar algunos posts de muestra
  const samplePosts = await Post.find(filter).limit(5).lean();
  console.log('\n📝 Posts de muestra:');
  samplePosts.forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.title} (${post._id}) - ${field}: ${post[field]}`);
  });
  
  if (dryRun === 'true') {
    console.log('\n⚠️ DRY RUN: Simulación sin cambios reales');
    console.log(`📝 Se actualizaría el campo "${field}" a "${value}" en ${count} posts`);
    return;
  }
  
  // Confirmar
  console.log('\n⚠️ ¿Continuar con la actualización? (y/n)');
  // Simular confirmación para scripts automáticos
  const answer = 'y'; // En producción, usar readline
  
  if (answer === 'y') {
    let updateValue = value;
    
    // Convertir tipos
    if (value === 'true') updateValue = true;
    if (value === 'false') updateValue = false;
    if (!isNaN(value) && value !== '') updateValue = Number(value);
    
    const result = await Post.updateMany(
      filter,
      { $set: { [field]: updateValue } }
    );
    
    console.log(`\n✅ Actualizados ${result.modifiedCount} posts`);
    console.log(`📝 Campo "${field}" actualizado a "${updateValue}"`);
  } else {
    console.log('❌ Operación cancelada');
  }
}

// ============ ELIMINAR POSTS ============
async function deletePosts(params) {
  console.log('\n🗑️ ============ ELIMINANDO POSTS ============\n');
  
  const { dryRun } = params;
  
  const filter = await buildFilter(params);
  console.log('🔍 Filtro:', JSON.stringify(filter, null, 2));
  
  // Contar primero
  const count = await Post.countDocuments(filter);
  console.log(`\n📊 Posts que serán eliminados: ${count}`);
  
  if (count === 0) {
    console.log('❌ No se encontraron posts con ese filtro');
    return;
  }
  
  // Mostrar algunos posts de muestra
  const samplePosts = await Post.find(filter).limit(5).lean();
  console.log('\n📝 Posts que se eliminarán (muestra):');
  samplePosts.forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.title} (${post._id}) - ${post.categorie || post.subCategory}`);
  });
  
  if (dryRun === 'true') {
    console.log('\n⚠️ DRY RUN: Simulación sin cambios reales');
    console.log(`📝 Se eliminarían ${count} posts`);
    return;
  }
  
  // Confirmar
  console.log('\n⚠️⚠️⚠️ ¡ATENCIÓN! Esta acción es IRREVERSIBLE ⚠️⚠️⚠️');
  console.log('¿Estás seguro de eliminar estos posts? (yes/no)');
  // Simular confirmación para scripts automáticos
  const answer = 'no'; // En producción, usar readline
  
  if (answer === 'yes') {
    const result = await Post.deleteMany(filter);
    console.log(`\n✅ Eliminados ${result.deletedCount} posts`);
  } else {
    console.log('❌ Operación cancelada');
  }
}

// ============ CORREGIR CATEGORÍA ============
async function fixCategory(params) {
  console.log('\n🔧 ============ CORRIGIENDO CATEGORÍA ============\n');
  
  const { category, targetCategory, dryRun } = params;
  
  if (!category) {
    console.error('❌ Error: Se requiere category=slugDeCategoria');
    return;
  }
  
  // Buscar la categoría destino
  let targetCat = null;
  if (targetCategory) {
    targetCat = await Category.findOne({ 
      $or: [
        { slug: targetCategory },
        { slug: { $regex: new RegExp(targetCategory, 'i') } }
      ],
      level: 1
    }).lean();
  } else {
    targetCat = await Category.findOne({ 
      $or: [
        { slug: category },
        { slug: { $regex: new RegExp(category, 'i') } }
      ],
      level: 1
    }).lean();
  }
  
  if (!targetCat) {
    console.error(`❌ No se encontró categoría: ${targetCategory || category}`);
    return;
  }
  
  console.log(`📌 Categoría destino: ${targetCat.name} (${targetCat._id})`);
  
  // Buscar posts con categorie = category pero category incorrecto
  const filter = {
    categorie: { $regex: new RegExp(category, 'i') }
  };
  
  if (params.boutique === 'true') {
    filter.isFromBoutique = true;
  } else if (params.boutique === 'false') {
    filter.isFromBoutique = { $ne: true };
  }
  
  const posts = await Post.find(filter).lean();
  console.log(`\n📝 Posts encontrados con categorie "${category}": ${posts.length}`);
  
  if (posts.length === 0) {
    console.log('❌ No se encontraron posts');
    return;
  }
  
  posts.forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.title} - current category: ${post.category}`);
  });
  
  if (dryRun === 'true') {
    console.log('\n⚠️ DRY RUN: Simulación sin cambios reales');
    console.log(`📝 Se actualizarían ${posts.length} posts al category ID: ${targetCat._id}`);
    return;
  }
  
  // Confirmar
  console.log('\n⚠️ ¿Continuar con la corrección? (y/n)');
  const answer = 'y';
  
  if (answer === 'y') {
    const result = await Post.updateMany(
      filter,
      { $set: { category: targetCat._id } }
    );
    console.log(`\n✅ Actualizados ${result.modifiedCount} posts`);
    console.log(`📝 Ahora todos tienen category: ${targetCat._id}`);
  } else {
    console.log('❌ Operación cancelada');
  }
}

// ============ ESTADÍSTICAS ============
async function showStats(params) {
  console.log('\n📊 ============ ESTADÍSTICAS DE POSTS ============\n');
  
  const filter = params.category ? await buildFilter(params) : {};
  
  const stats = await Post.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$categorie',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  const total = await Post.countDocuments(filter);
  
  console.log(`📊 Total de posts: ${total}\n`);
  console.log('📋 Por categoría:');
  console.log('─'.repeat(70));
  console.log('| Categoría'.padEnd(30) + '| Cantidad'.padEnd(15) + '| Precio promedio'.padEnd(25) + '|');
  console.log('─'.repeat(70));
  
  stats.forEach(stat => {
    const category = stat._id || 'Sin categoría';
    const avgPrice = stat.avgPrice ? `${Math.round(stat.avgPrice)} DA` : 'N/A';
    console.log(`| ${category.slice(0, 28).padEnd(28)} | ${String(stat.count).padEnd(13)} | ${avgPrice.padEnd(23)} |`);
  });
  
  console.log('─'.repeat(70));
  
  // Posts por boutique
  const boutiqueCount = await Post.countDocuments({ isFromBoutique: true });
  const normalCount = await Post.countDocuments({ isFromBoutique: { $ne: true } });
  
  console.log(`\n📊 Por tipo:`);
  console.log(`  🏪 Boutiques: ${boutiqueCount}`);
  console.log(`  📄 Normales: ${normalCount}`);
  
  // Posts por wilaya
  const wilayaStats = await Post.aggregate([
    { $match: filter },
    { $group: { _id: '$wilaya', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log(`\n📍 Top 10 wilayas:`);
  wilayaStats.forEach(stat => {
    console.log(`  ${stat._id || 'Sin wilaya'}: ${stat.count} posts`);
  });
}

// ============ EXPORTAR POSTS ============
async function exportPosts(params) {
  console.log('\n💾 ============ EXPORTANDO POSTS ============\n');
  
  const filter = await buildFilter(params);
  const posts = await Post.find(filter).lean();
  
  console.log(`📊 Exportando ${posts.length} posts\n`);
  
  if (params.format === 'json') {
    const filename = `posts_export_${Date.now()}.json`;
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(posts, null, 2));
    console.log(`✅ Exportado a: ${filename}`);
  } else {
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title} (${post._id}) - ${post.categorie} - ${post.price || 'N/A'} DA`);
    });
  }
}

// ============ MAIN ============
async function main() {
  const { operation, params } = parseArgs();
  
  if (!operation || operation === 'help') {
    printHelp();
    process.exit(0);
  }
  
  try {
    await connectDB();
    
    switch (operation) {
      case OPERATIONS.LIST:
      case 'list':
        await listPosts(params);
        break;
        
      case OPERATIONS.UPDATE:
      case 'update':
        await updatePosts(params);
        break;
        
      case OPERATIONS.DELETE:
      case 'delete':
        await deletePosts(params);
        break;
        
      case OPERATIONS.FIX_CATEGORY:
      case 'fix-category':
      case 'fix':
        await fixCategory(params);
        break;
        
      case OPERATIONS.STATS:
      case 'stats':
        await showStats(params);
        break;
        
      case OPERATIONS.EXPORT:
      case 'export':
        await exportPosts(params);
        break;
        
      default:
        console.error(`❌ Operación desconocida: ${operation}`);
        printHelp();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
 
// node scriptTelephone/updateIdsCategory.js  show
// node scriptTelephone/updateIdsCategory.js  update
// node scriptTelephone/updateIdsCategory.js  apply    //al final  verify
 

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

// ============ CONFIGURACIÓN ============
const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
};

// ============ CONFIGURACIÓN DE LA CATEGORÍA A ACTUALIZAR ============
// 🔥 SOLO CAMBIA ESTOS VALORES PARA CADA CATEGORÍA QUE QUIERAS ACTUALIZAR
const CONFIG = {
  // Categoría principal (nivel 1)
  categoriaNombre: 'Informatique',  // ← Cambia aquí para otras categorías
  
  // Subcategoría específica (opcional, dejar null para todas)
  subCategoriaNombre: null,  // Ej: 'Vente', 'Location', 'Location vacances', 'Cherche location', 'Cherche achat'
  
  // Artículo específico (opcional, dejar null para todos)
  articuloNombre: null,      // Ej: 'Appartement', 'Villa', 'Terrain'
  
  // Modo simulación (true = solo ver, false = aplicar cambios)
  dryRun: true  // ← Cambia a false para aplicar los cambios
};

// ============ MODELOS ============
let Category, Post;

function getModels() {
  if (!Category) {
    const categorySchema = new mongoose.Schema({}, { strict: false });
    Category = mongoose.model('Category', categorySchema, 'categories');
  }
  if (!Post) {
    const postSchema = new mongoose.Schema({}, { strict: false });
    Post = mongoose.model('Post', postSchema, 'posts');
  }
  return { Category, Post };
}

// ============ CONEXIÓN ============
async function connectDB() {
  console.log('🔌 Conectando a MongoDB...');
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Ya conectado\n');
    return;
  }
  await mongoose.connect(MONGODB_URI, CONNECTION_OPTIONS);
  console.log('✅ Conectado a MongoDB\n');
}

async function disconnectDB() {
  if (mongoose.connection.readyState === 1) {
    console.log('\n🔌 Cerrando conexión...');
    await mongoose.disconnect();
  }
}

function printSection(title) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  📌 ${title}`);
  console.log('═'.repeat(80));
}

// ============ 1. MOSTRAR CATEGORÍAS DE IMMOBILIER ============
async function showImmobilierCategories() {
  printSection('📂 CATEGORÍAS DE IMMOBILIER');
  
  const { Category } = getModels();
  
  // Buscar Immobilier
  const immobilier = await Category.findOne({ 
    name: { $regex: /^immobilier$/i }, 
    level: 1 
  }).lean();
  
  if (!immobilier) {
    console.log('❌ Categoría Immobilier no encontrada');
    return;
  }
  
  console.log(`\n📁 ${immobilier.name} (level: ${immobilier.level})`);
  console.log(`   ID: ${immobilier._id}`);
  console.log(`   Slug: ${immobilier.slug}\n`);
  
  // Subcategorías (nivel 2)
  const subCategorias = await Category.find({ 
    parent: immobilier._id, 
    level: 2,
    isActive: true 
  }).sort({ order: 1 }).lean();
  
  console.log('📂 SUBCATEGORÍAS (nivel 2):\n');
  
  for (const sub of subCategorias) {
    console.log(`   📁 ${sub.name}`);
    console.log(`      ID: ${sub._id}`);
    console.log(`      Slug: ${sub.slug}`);
    console.log(`      Order: ${sub.order}`);
    
    // Artículos (nivel 3)
    const articulos = await Category.find({ 
      parent: sub._id, 
      level: 3,
      isActive: true 
    }).sort({ order: 1 }).lean();
    
    if (articulos.length > 0) {
      console.log(`      📄 Artículos (${articulos.length}):`);
      for (const art of articulos) {
        console.log(`         - ${art.name} (ID: ${art._id}, Slug: ${art.slug})`);
      }
    }
    console.log('');
  }
}

// ============ 2. ACTUALIZAR POSTS DE IMMOBILIER ============
async function updateImmobilierPosts() {
  printSection('🔧 ACTUALIZANDO POSTS DE IMMOBILIER');
  
  const { Category, Post } = getModels();
  
  console.log('\n📋 CONFIGURACIÓN ACTUAL:');
  console.log(`   Categoría: ${CONFIG.categoriaNombre}`);
  console.log(`   Subcategoría: ${CONFIG.subCategoriaNombre || 'TODAS'}`);
  console.log(`   Artículo: ${CONFIG.articuloNombre || 'TODOS'}`);
  console.log(`   Modo: ${CONFIG.dryRun ? 'SIMULACIÓN (sin cambios)' : 'REAL (con cambios)'}\n`);
  
  // Buscar Immobilier
  const immobilier = await Category.findOne({ 
    name: { $regex: new RegExp(`^${CONFIG.categoriaNombre}$`, 'i') }, 
    level: 1 
  }).lean();
  
  if (!immobilier) {
    console.log(`❌ Categoría "${CONFIG.categoriaNombre}" no encontrada`);
    return;
  }
  
  console.log(`✅ Categoría encontrada: ${immobilier.name}`);
  console.log(`   ID: ${immobilier._id}`);
  
  let targetCategories = [];
  let targetIds = [];
  
  // Si hay subcategoría específica
  if (CONFIG.subCategoriaNombre) {
    const subCategoria = await Category.findOne({
      name: { $regex: new RegExp(`^${CONFIG.subCategoriaNombre}$`, 'i') },
      parent: immobilier._id,
      level: 2
    }).lean();
    
    if (!subCategoria) {
      console.log(`❌ Subcategoría "${CONFIG.subCategoriaNombre}" no encontrada`);
      return;
    }
    
    console.log(`✅ Subcategoría encontrada: ${subCategoria.name}`);
    console.log(`   ID: ${subCategoria._id}`);
    
    // Si hay artículo específico
    if (CONFIG.articuloNombre) {
      const articulo = await Category.findOne({
        name: { $regex: new RegExp(`^${CONFIG.articuloNombre}$`, 'i') },
        parent: subCategoria._id,
        level: 3
      }).lean();
      
      if (!articulo) {
        console.log(`❌ Artículo "${CONFIG.articuloNombre}" no encontrado`);
        return;
      }
      
      console.log(`✅ Artículo encontrado: ${articulo.name}`);
      console.log(`   ID: ${articulo._id}`);
      targetCategories.push(articulo);
      targetIds.push(articulo._id);
    } else {
      // Todas las subcategorías y sus artículos
      targetCategories.push(subCategoria);
      targetIds.push(subCategoria._id);
      
      const articulos = await Category.find({ parent: subCategoria._id, level: 3 }).lean();
      for (const art of articulos) {
        targetCategories.push(art);
        targetIds.push(art._id);
      }
    }
  } else {
    // Todas las subcategorías de Immobilier
    const subCategorias = await Category.find({ parent: immobilier._id, level: 2 }).lean();
    for (const sub of subCategorias) {
      targetCategories.push(sub);
      targetIds.push(sub._id);
      
      const articulos = await Category.find({ parent: sub._id, level: 3 }).lean();
      for (const art of articulos) {
        targetCategories.push(art);
        targetIds.push(art._id);
      }
    }
  }
  
  console.log(`\n📊 Categorías objetivo (${targetCategories.length}):`);
  targetCategories.forEach(cat => {
    console.log(`   - ${cat.name} (${cat.level === 2 ? 'subcategoría' : 'artículo'})`);
    console.log(`     ID: ${cat._id}`);
  });
  
  // Buscar posts que necesitan actualización
  const query = {
    $and: [
      { categorie: { $regex: new RegExp(`^${CONFIG.categoriaNombre}$`, 'i') } },
      { category: { $nin: targetIds } }
    ]
  };
  
  // Si hay subcategoría específica
  if (CONFIG.subCategoriaNombre) {
    query.subCategory = { $regex: new RegExp(`^${CONFIG.subCategoriaNombre}$`, 'i') };
  }
  
  // Si hay artículo específico
  if (CONFIG.articuloNombre) {
    query.articleType = { $regex: new RegExp(`^${CONFIG.articuloNombre}$`, 'i') };
  }
  
  const postsToUpdate = await Post.find(query).lean();
  
  console.log(`\n📊 Posts a actualizar: ${postsToUpdate.length}`);
  
  if (postsToUpdate.length === 0) {
    console.log('⚠️ No hay posts que necesiten actualización');
    return;
  }
  
  // Mostrar ejemplos
  console.log('\n📝 Ejemplos de posts a actualizar:');
  postsToUpdate.slice(0, 10).forEach(post => {
    console.log(`   - ID: ${post._id}`);
    console.log(`     Título: ${post.title || 'Sin título'}`);
    console.log(`     Category actual: ${post.category}`);
    console.log(`     Debería ser: ${targetIds[0] || 'múltiple'}`);
    console.log(`     Categorie: ${post.categorie}`);
    console.log(`     SubCategory: ${post.subCategory}`);
    if (post.articleType) console.log(`     ArticleType: ${post.articleType}`);
    console.log('');
  });
  
  if (!CONFIG.dryRun) {
    console.log('\n🔄 Aplicando actualizaciones...');
    
    let totalUpdated = 0;
    
    for (const post of postsToUpdate) {
      // Encontrar la categoría correcta para este post
      let correctCategoryId = null;
      
      // Buscar por articleType primero (nivel 3)
      if (post.articleType) {
        const article = await Category.findOne({
          slug: { $regex: new RegExp(`^${post.articleType}$`, 'i') },
          level: 3
        }).lean();
        if (article) correctCategoryId = article._id;
      }
      
      // Si no, buscar por subCategory (nivel 2)
      if (!correctCategoryId && post.subCategory) {
        const subCat = await Category.findOne({
          slug: { $regex: new RegExp(`^${post.subCategory}$`, 'i') },
          level: 2
        }).lean();
        if (subCat) correctCategoryId = subCat._id;
      }
      
      // Si no, buscar por categorie (nivel 1)
      if (!correctCategoryId && post.categorie) {
        const mainCat = await Category.findOne({
          slug: { $regex: new RegExp(`^${post.categorie}$`, 'i') },
          level: 1
        }).lean();
        if (mainCat) correctCategoryId = mainCat._id;
      }
      
      if (correctCategoryId) {
        await Post.updateOne(
          { _id: post._id },
          { $set: { category: correctCategoryId } }
        );
        totalUpdated++;
      } else {
        console.log(`   ⚠️ No se encontró categoría para: ${post.title}`);
      }
    }
    
    console.log(`\n✅ TOTAL ACTUALIZADO: ${totalUpdated} posts`);
    
    // Verificar resultados
    const remaining = await Post.find({
      $and: [
        { categorie: { $regex: new RegExp(`^${CONFIG.categoriaNombre}$`, 'i') } },
        { category: { $nin: targetIds } }
      ]
    }).countDocuments();
    
    console.log(`📊 Posts que aún necesitan actualización: ${remaining}`);
    
  } else {
    console.log('\n⚠️ Modo SIMULACIÓN. Para aplicar cambios:');
    console.log('   1. Abre el script');
    console.log('   2. Cambia dryRun: false en la CONFIG');
    console.log('   3. Ejecuta: node scripts/updateImmobilierCategory.js apply');
  }
}

// ============ 3. VERIFICAR RESULTADOS ============
async function verifyResults() {
  printSection('🔍 VERIFICANDO RESULTADOS');
  
  const { Category, Post } = getModels();
  
  const immobilier = await Category.findOne({ 
    name: { $regex: /^immobilier$/i }, 
    level: 1 
  }).lean();
  
  if (!immobilier) {
    console.log('❌ Immobilier no encontrada');
    return;
  }
  
  // Obtener todas las IDs de categorías de Immobilier
  const subCategorias = await Category.find({ parent: immobilier._id, level: 2 }).lean();
  let allCategoryIds = [immobilier._id];
  
  for (const sub of subCategorias) {
    allCategoryIds.push(sub._id);
    const articulos = await Category.find({ parent: sub._id, level: 3 }).lean();
    for (const art of articulos) {
      allCategoryIds.push(art._id);
    }
  }
  
  // Verificar posts con category ID incorrecto
  const invalidPosts = await Post.find({
    categorie: { $regex: /^immobilier$/i },
    category: { $nin: allCategoryIds }
  }).countDocuments();
  
  const totalPosts = await Post.countDocuments({
    categorie: { $regex: /^immobilier$/i }
  });
  
  const validPosts = totalPosts - invalidPosts;
  
  console.log(`\n📊 Estadísticas de Immobilier:`);
  console.log(`   Total posts: ${totalPosts}`);
  console.log(`   Posts con category válida: ${validPosts}`);
  console.log(`   Posts con category inválida: ${invalidPosts}`);
  
  if (invalidPosts === 0) {
    console.log('\n✅ ¡Todos los posts de Immobilier tienen category correcta!');
  } else {
    console.log(`\n⚠️ Aún hay ${invalidPosts} posts con category inválida`);
  }
}

// ============ MAIN ============
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    await connectDB();
    getModels();
    
    switch (command) {
      case 'show':
        await showImmobilierCategories();
        break;
        
      case 'apply':
        // Forzar aplicación real aunque dryRun sea true
        const originalDryRun = CONFIG.dryRun;
        CONFIG.dryRun = false;
        await updateImmobilierPosts();
        CONFIG.dryRun = originalDryRun;
        break;
        
      case 'verify':
        await verifyResults();
        break;
        
      case 'update':
      default:
        await updateImmobilierPosts();
        break;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
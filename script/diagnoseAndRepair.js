// 📂 scripts/diagnoseAndRepair.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

// ============ CONFIGURACIÓN ============
const COLECCIONES = {
  POSTS: 'posts',
  CATEGORIES: 'categories',
  BOUTIQUES: 'boutiques',
  USERS: 'users'
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
}

// ============ MODELOS ============
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');
const Boutique = mongoose.model('Boutique', new mongoose.Schema({}, { strict: false }), 'boutiques');
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

// ============ UTILIDADES ============
function printSection(title) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  📌 ${title}`);
  console.log('═'.repeat(80));
}

function printSubSection(title) {
  console.log('\n' + '─'.repeat(60));
  console.log(`  🔹 ${title}`);
  console.log('─'.repeat(60));
}

function printProblem(problem, severity = '⚠️') {
  const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '⚠️';
  console.log(`${emoji} ${problem}`);
}

function printSolution(solution) {
  console.log(`   ✅ Solución: ${solution}`);
}

// ============ 1. DIAGNÓSTICO DE CATEGORÍAS ============
async function diagnoseCategories() {
  printSection('DIAGNÓSTICO DE CATEGORÍAS');
  
  const problemas = [];
  const soluciones = [];
  
  // 1.1 Verificar categorías nivel 1
  const level1Categories = await Category.find({ level: 1 }).lean();
  console.log(`📊 Categorías nivel 1: ${level1Categories.length}`);
  
  if (level1Categories.length === 0) {
    problemas.push('No hay categorías nivel 1');
    soluciones.push('Ejecutar seed de categorías');
  }
  
  // 1.2 Verificar categorías sin slug o nombre
  const categoriesWithoutSlug = await Category.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] }).lean();
  if (categoriesWithoutSlug.length > 0) {
    printProblem(`${categoriesWithoutSlug.length} categorías sin slug`);
    categoriesWithoutSlug.forEach(cat => {
      console.log(`   - ${cat.name || 'Sin nombre'} (ID: ${cat._id})`);
    });
    soluciones.push('Generar slugs automáticamente: updateMany con slug a partir del nombre');
  }
  
  // 1.3 Verificar duplicados
  const duplicateSlugs = await Category.aggregate([
    { $group: { _id: '$slug', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  if (duplicateSlugs.length > 0) {
    printProblem(`${duplicateSlugs.length} slugs duplicados`);
    duplicateSlugs.forEach(dup => {
      console.log(`   - Slug "${dup._id}" aparece ${dup.count} veces`);
    });
    soluciones.push('Renombrar slugs duplicados añadiendo sufijo numérico');
  }
  
  // 1.4 Verificar jerarquía rota
  const categoriesWithInvalidParent = await Category.find({
    parent: { $ne: null },
    $expr: { $ne: ['$parent', null] }
  }).lean();
  
  let brokenHierarchy = 0;
  for (const cat of categoriesWithInvalidParent) {
    const parent = await Category.findById(cat.parent);
    if (!parent) {
      brokenHierarchy++;
      console.log(`   - ${cat.name} (ID: ${cat._id}) tiene parent inválido: ${cat.parent}`);
    }
  }
  
  if (brokenHierarchy > 0) {
    printProblem(`${brokenHierarchy} categorías con parent inválido`);
    soluciones.push('Establecer parent a null o crear categoría padre faltante');
  }
  
  return { problemas, soluciones };
}

// ============ 2. DIAGNÓSTICO DE POSTS ============
async function diagnosePosts() {
  printSection('DIAGNÓSTICO DE POSTS');
  
  const problemas = [];
  const soluciones = [];
  const stats = {
    total: await Post.countDocuments(),
    withoutTitle: 0,
    withoutCategory: 0,
    invalidCategory: 0,
    wrongCategoryId: 0,
    withoutUser: 0,
    invalidUser: 0,
    withoutPrice: 0,
    priceZero: 0,
    negativePrice: 0,
    boutiques: 0,
    normales: 0
  };
  
  // 2.1 Estadísticas básicas
  console.log(`📊 Total de posts: ${stats.total}`);
  stats.boutiques = await Post.countDocuments({ isFromBoutique: true });
  stats.normales = stats.total - stats.boutiques;
  console.log(`   🏪 Boutiques: ${stats.boutiques}`);
  console.log(`   📄 Normales: ${stats.normales}`);
  
  // 2.2 Posts sin título
  const withoutTitle = await Post.find({ $or: [{ title: { $exists: false } }, { title: '' }] }).lean();
  stats.withoutTitle = withoutTitle.length;
  if (stats.withoutTitle > 0) {
    printProblem(`${stats.withoutTitle} posts sin título`, 'warning');
    withoutTitle.forEach(post => {
      console.log(`   - ID: ${post._id}, categoría: ${post.categorie || 'N/A'}`);
    });
    soluciones.push('Generar título automático a partir de categoría y datos específicos');
  }
  
  // 2.3 Posts sin categoría
  const withoutCategory = await Post.find({
    $or: [
      { category: { $exists: false } },
      { category: null },
      { categorie: { $exists: false } },
      { categorie: '' }
    ]
  }).lean();
  stats.withoutCategory = withoutCategory.length;
  if (stats.withoutCategory > 0) {
    printProblem(`${stats.withoutCategory} posts sin categoría`, 'critical');
    withoutCategory.forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title}`);
    });
    soluciones.push('Asignar categoría por defecto o requerir en creación');
  }
  
  // 2.4 Posts con category ID inválido (no existe en categorías)
  const allCategoryIds = await Category.find({}).distinct('_id');
  const postsWithInvalidCategory = await Post.find({
    category: { $nin: allCategoryIds, $ne: null }
  }).lean();
  stats.invalidCategory = postsWithInvalidCategory.length;
  
  if (stats.invalidCategory > 0) {
    printProblem(`${stats.invalidCategory} posts con category ID inválido`, 'critical');
    postsWithInvalidCategory.forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title}, category: ${post.category}`);
      console.log(`     categorie: ${post.categorie || 'N/A'}`);
    });
    soluciones.push('Corregir category ID basado en campo categorie');
  }
  
  // 2.5 Posts con category ID incorrecto (no coincide con la categoría nivel 1)
  const level1Categories = await Category.find({ level: 1 }).lean();
  const level1Map = new Map();
  level1Categories.forEach(cat => {
    level1Map.set(cat.slug, cat._id);
    level1Map.set(cat.name.toLowerCase(), cat._id);
  });
  
  let wrongCategoryCount = 0;
  const postsWithWrongCategory = [];
  
  for (const post of withoutCategory) {
    if (post.categorie) {
      const expectedId = level1Map.get(post.categorie.toLowerCase());
      if (expectedId && String(post.category) !== String(expectedId)) {
        wrongCategoryCount++;
        postsWithWrongCategory.push({
          _id: post._id,
          title: post.title,
          currentCategory: post.category,
          expectedCategory: expectedId,
          categorie: post.categorie
        });
      }
    }
  }
  
  stats.wrongCategoryId = wrongCategoryCount;
  if (stats.wrongCategoryId > 0) {
    printProblem(`${stats.wrongCategoryId} posts con category ID incorrecto`, 'warning');
    postsWithWrongCategory.slice(0, 5).forEach(post => {
      console.log(`   - ${post.title}: tiene ${post.currentCategory}, debería ser ${post.expectedCategory} (basado en "${post.categorie}")`);
    });
    if (postsWithWrongCategory.length > 5) {
      console.log(`   ... y ${postsWithWrongCategory.length - 5} más`);
    }
    soluciones.push('Ejecutar fix-category para corregir IDs');
  }
  
  // 2.6 Posts sin usuario
  const allUserIds = await User.find({}).distinct('_id');
  const postsWithoutUser = await Post.find({
    $or: [
      { user: { $exists: false } },
      { user: null },
      { user: { $nin: allUserIds } }
    ]
  }).lean();
  stats.withoutUser = postsWithoutUser.length;
  
  if (stats.withoutUser > 0) {
    printProblem(`${stats.withoutUser} posts sin usuario válido`, 'warning');
    postsWithoutUser.forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title}, user: ${post.user}`);
    });
    soluciones.push('Asignar usuario por defecto (admin) o requerir en creación');
  }
  
  // 2.7 Problemas de precio
  const withoutPrice = await Post.find({ $or: [{ price: { $exists: false } }, { price: null }] }).lean();
  stats.withoutPrice = withoutPrice.length;
  
  const priceZero = await Post.find({ price: 0 }).lean();
  stats.priceZero = priceZero.length;
  
  const negativePrice = await Post.find({ price: { $lt: 0 } }).lean();
  stats.negativePrice = negativePrice.length;
  
  if (stats.withoutPrice > 0) {
    printProblem(`${stats.withoutPrice} posts sin precio`);
    soluciones.push('Establecer precio por defecto o requerir en creación');
  }
  
  if (stats.priceZero > 0) {
    printProblem(`${stats.priceZero} posts con precio 0 (gratis o error)`);
    soluciones.push('Verificar si son realmente gratis o corregir precio');
  }
  
  if (stats.negativePrice > 0) {
    printProblem(`${stats.negativePrice} posts con precio negativo`, 'critical');
    negativePrice.forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title}, price: ${post.price}`);
    });
    soluciones.push('Convertir precio negativo a positivo o establecer en 0');
  }
  
  // 2.8 Posts sin ubicación
  const withoutLocation = await Post.find({
    $or: [
      { wilaya: { $exists: false } },
      { wilaya: '' },
      { wilaya: null }
    ]
  }).lean();
  
  if (withoutLocation.length > 0) {
    printProblem(`${withoutLocation.length} posts sin wilaya`);
    soluciones.push('Establecer wilaya por defecto o requerir en creación');
  }
  
  return { problemas, soluciones, stats, postsWithWrongCategory };
}

// ============ 3. DIAGNÓSTICO DE BOUTIQUES ============
async function diagnoseBoutiques() {
  printSection('DIAGNÓSTICO DE BOUTIQUES');
  
  const problemas = [];
  const soluciones = [];
  
  const totalBoutiques = await Boutique.countDocuments();
  console.log(`📊 Total de boutiques: ${totalBoutiques}`);
  
  // 3.1 Boutiques sin nombre
  const withoutName = await Boutique.find({ $or: [{ name: { $exists: false } }, { name: '' }] }).lean();
  if (withoutName.length > 0) {
    printProblem(`${withoutName.length} boutiques sin nombre`);
    withoutName.forEach(b => {
      console.log(`   - ID: ${b._id}`);
    });
    soluciones.push('Asignar nombre por defecto');
  }
  
  // 3.2 Boutiques sin usuario
  const allUserIds = await User.find({}).distinct('_id');
  const withoutUser = await Boutique.find({ user: { $nin: allUserIds } }).lean();
  if (withoutUser.length > 0) {
    printProblem(`${withoutUser.length} boutiques sin usuario válido`);
    withoutUser.forEach(b => {
      console.log(`   - ID: ${b._id}, name: ${b.name}`);
    });
    soluciones.push('Asignar usuario por defecto o eliminar boutiques huérfanas');
  }
  
  return { problemas, soluciones };
}

// ============ 4. GENERAR REPORTE COMPLETO ============
async function generateFullReport() {
  printSection('🔍 DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS');
  
  const diagnosis = {
    categories: await diagnoseCategories(),
    posts: await diagnosePosts(),
    boutiques: await diagnoseBoutiques()
  };
  
  // Resumen de problemas
  printSection('📋 RESUMEN DE PROBLEMAS ENCONTRADOS');
  
  const allProblems = [
    ...diagnosis.categories.problemas.map(p => ({ type: 'Categorías', problem: p })),
    ...diagnosis.posts.problemas.map(p => ({ type: 'Posts', problem: p })),
    ...diagnosis.boutiques.problemas.map(p => ({ type: 'Boutiques', problem: p }))
  ];
  
  if (allProblems.length === 0) {
    console.log('\n✅ ¡No se encontraron problemas! La base de datos está saludable.');
  } else {
    console.log(`\n⚠️ Se encontraron ${allProblems.length} problemas:`);
    allProblems.forEach((item, i) => {
      console.log(`\n${i + 1}. [${item.type}] ${item.problem}`);
    });
  }
  
  // Soluciones sugeridas
  printSection('💡 SOLUCIONES SUGERIDAS');
  
  const allSolutions = [
    ...diagnosis.categories.soluciones.map(s => ({ type: 'Categorías', solution: s })),
    ...diagnosis.posts.soluciones.map(s => ({ type: 'Posts', solution: s })),
    ...diagnosis.boutiques.soluciones.map(s => ({ type: 'Boutiques', solution: s }))
  ];
  
  if (allSolutions.length === 0) {
    console.log('\n✅ No se requieren acciones correctivas.');
  } else {
    allSolutions.forEach((item, i) => {
      console.log(`\n${i + 1}. [${item.type}] ${item.solution}`);
    });
  }
  
  return diagnosis;
}

// ============ 5. REPARACIÓN AUTOMÁTICA ============
async function autoRepair(dryRun = true) {
  printSection('🔧 REPARACIÓN AUTOMÁTICA');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const repairs = [];
  
  // 5.1 Corregir posts con category incorrecto
  const level1Categories = await Category.find({ level: 1 }).lean();
  const categoryMap = new Map();
  level1Categories.forEach(cat => {
    categoryMap.set(cat.slug.toLowerCase(), cat._id);
    categoryMap.set(cat.name.toLowerCase(), cat._id);
  });
  
  const postsToFix = await Post.find({
    $or: [
      { category: { $exists: false } },
      { category: null }
    ],
    categorie: { $ne: null, $ne: '' }
  }).lean();
  
  if (postsToFix.length > 0) {
    console.log(`\n📝 Corrigiendo ${postsToFix.length} posts con category faltante...`);
    
    for (const post of postsToFix) {
      const categoryKey = post.categorie.toLowerCase();
      const expectedId = categoryMap.get(categoryKey);
      
      if (expectedId) {
        repairs.push({
          postId: post._id,
          title: post.title,
          action: 'update category',
          from: post.category,
          to: expectedId
        });
        
        if (!dryRun) {
          await Post.updateOne(
            { _id: post._id },
            { $set: { category: expectedId } }
          );
        }
      }
    }
    
    if (!dryRun) {
      console.log(`   ✅ Corregidos ${repairs.length} posts`);
    }
  }
  
  // 5.2 Corregir posts sin título
  const postsWithoutTitle = await Post.find({ $or: [{ title: { $exists: false } }, { title: '' }] }).lean();
  
  if (postsWithoutTitle.length > 0) {
    console.log(`\n📝 Generando títulos para ${postsWithoutTitle.length} posts...`);
    
    for (const post of postsWithoutTitle) {
      let generatedTitle = '';
      
      if (post.categorie) {
        generatedTitle = post.categorie;
      } else if (post.subCategory) {
        generatedTitle = post.subCategory;
      } else {
        generatedTitle = 'Annonce';
      }
      
      repairs.push({
        postId: post._id,
        action: 'generate title',
        from: post.title || 'vacío',
        to: generatedTitle
      });
      
      if (!dryRun) {
        await Post.updateOne(
          { _id: post._id },
          { $set: { title: generatedTitle } }
        );
      }
    }
    
    if (!dryRun) {
      console.log(`   ✅ Generados ${repairs.length} títulos`);
    }
  }
  
  // 5.3 Corregir precios negativos
  const negativePrices = await Post.find({ price: { $lt: 0 } }).lean();
  
  if (negativePrices.length > 0) {
    console.log(`\n📝 Corrigiendo ${negativePrices.length} posts con precio negativo...`);
    
    for (const post of negativePrices) {
      repairs.push({
        postId: post._id,
        title: post.title,
        action: 'fix negative price',
        from: post.price,
        to: Math.abs(post.price)
      });
      
      if (!dryRun) {
        await Post.updateOne(
          { _id: post._id },
          { $set: { price: Math.abs(post.price) } }
        );
      }
    }
    
    if (!dryRun) {
      console.log(`   ✅ Corregidos ${repairs.length} precios`);
    }
  }
  
  // 5.4 Eliminar posts huérfanos (sin usuario)
  const allUserIds = await User.find({}).distinct('_id');
  const orphanPosts = await Post.find({ user: { $nin: allUserIds, $ne: null } }).lean();
  
  if (orphanPosts.length > 0) {
    console.log(`\n📝 Procesando ${orphanPosts.length} posts huérfanos...`);
    
    const defaultUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (defaultUser) {
      for (const post of orphanPosts) {
        repairs.push({
          postId: post._id,
          title: post.title,
          action: 'assign default user',
          from: post.user,
          to: defaultUser._id
        });
        
        if (!dryRun) {
          await Post.updateOne(
            { _id: post._id },
            { $set: { user: defaultUser._id } }
          );
        }
      }
      
      if (!dryRun) {
        console.log(`   ✅ Asignados ${repairs.length} posts al usuario admin`);
      }
    }
  }
  
  // Reporte de reparaciones
  printSection('📊 REPORTE DE REPARACIONES');
  
  if (repairs.length === 0) {
    console.log('\n✅ No se requirieron reparaciones.');
  } else {
    console.log(`\n🔧 Se realizaron ${repairs.length} reparaciones:`);
    repairs.forEach((repair, i) => {
      console.log(`\n${i + 1}. Post: ${repair.postId}`);
      console.log(`   Acción: ${repair.action}`);
      console.log(`   Antes: ${repair.from}`);
      console.log(`   Después: ${repair.to}`);
    });
  }
  
  return repairs;
}

// ============ 6. ENCONTRAR IDS ESPECÍFICOS ============
async function findIds(params) {
  printSection('🔍 BÚSQUEDA DE IDs');
  
  const { category, title, userId, boutique } = params;
  let filter = {};
  
  if (category) {
    const cat = await Category.findOne({ slug: category }).lean();
    if (cat) filter.category = cat._id;
    else filter.categorie = { $regex: category, $options: 'i' };
  }
  
  if (title) filter.title = { $regex: title, $options: 'i' };
  if (userId) filter.user = new mongoose.Types.ObjectId(userId);
  if (boutique === 'true') filter.isFromBoutique = true;
  
  const posts = await Post.find(filter).lean();
  
  console.log(`\n📊 Posts encontrados: ${posts.length}\n`);
  
  posts.forEach(post => {
    console.log(`ID: ${post._id}`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Category: ${post.categorie} / ${post.category}`);
    console.log(`   Price: ${post.price || 'N/A'}`);
    console.log(`   User: ${post.user}`);
    console.log(`   Created: ${post.createdAt}`);
    console.log('');
  });
  
  return posts;
}

// ============ 7. VALIDAR DOCUMENTOS ESPECÍFICOS ============
async function validateDocument(collection, id) {
  printSection(`🔍 VALIDANDO DOCUMENTO ${collection}/${id}`);
  
  let document = null;
  const Model = collection === 'posts' ? Post : collection === 'categories' ? Category : Boutique;
  
  try {
    document = await Model.findById(id).lean();
  } catch {
    console.error('❌ ID inválido o no encontrado');
    return;
  }
  
  if (!document) {
    console.error('❌ Documento no encontrado');
    return;
  }
  
  console.log('\n📄 Documento encontrado:');
  console.log(JSON.stringify(document, null, 2));
  
  // Validaciones específicas
  const issues = [];
  
  if (collection === 'posts') {
    if (!document.title) issues.push('Falta título');
    if (!document.category && !document.categorie) issues.push('Falta categoría');
    if (document.price < 0) issues.push('Precio negativo');
    if (document.price === 0) issues.push('Precio cero (verificar si es gratis)');
    
    const userExists = await User.findById(document.user);
    if (!userExists) issues.push('Usuario no existe');
    
    const categoryExists = await Category.findById(document.category);
    if (!categoryExists && document.category) issues.push('Categoría no existe');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️ Problemas encontrados:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('\n✅ Documento válido, no se encontraron problemas');
  }
  
  return document;
}

// ============ MAIN ============
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = {};
  
  for (let i = 1; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key && value) params[key] = value;
  }
  
  try {
    await connectDB();
    
    switch (command) {
      case 'diagnose':
      case 'diag':
        await generateFullReport();
        break;
        
      case 'repair':
        const dryRun = params.dryRun !== 'false';
        await autoRepair(dryRun);
        break;
        
      case 'fix':
        await autoRepair(false);
        break;
        
      case 'find':
        await findIds(params);
        break;
        
      case 'validate':
        if (!params.collection || !params.id) {
          console.error('❌ Uso: node diagnoseAndRepair.js validate collection=posts id=123...');
        } else {
          await validateDocument(params.collection, params.id);
        }
        break;
        
      case 'all':
        await generateFullReport();
        if (params.autoFix === 'true') {
          await autoRepair(false);
        }
        break;
        
      default:
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    🏥 DIAGNÓSTICO Y REPARACIÓN DE MONGODB                  ║
╚═══════════════════════════════════════════════════════════════════════════╝

📌 COMANDOS DISPONIBLES:

  🔍 DIAGNÓSTICO:
     node scripts/diagnoseAndRepair.js diagnose
     → Analiza toda la base de datos y reporta problemas

  🔧 REPARACIÓN AUTOMÁTICA:
     node scripts/diagnoseAndRepair.js repair
     → Simula reparaciones (dry run)
     
     node scripts/diagnoseAndRepair.js fix
     → Ejecuta reparaciones reales

  🔎 BÚSQUEDA DE IDs:
     node scripts/diagnoseAndRepair.js find category=telephone
     node scripts/diagnoseAndRepair.js find title="iPhone"
     node scripts/diagnoseAndRepair.js find userId=123...
     node scripts/diagnoseAndRepair.js find boutique=true

  ✅ VALIDAR DOCUMENTO:
     node scripts/diagnoseAndRepair.js validate collection=posts id=69cad6c19ae0f6003226c3c8

  🚀 TODO EN UNO:
     node scripts/diagnoseAndRepair.js all
     node scripts/diagnoseAndRepair.js all autoFix=true

📝 PARÁMETROS:
  dryRun=false   → Ejecutar cambios reales (por defecto true)
  autoFix=true   → Reparar automáticamente después del diagnóstico
`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
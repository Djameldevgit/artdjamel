// 📂 node scriptTelephone/actualizarpeindientes.js - VERSIÓN CORREGIDA CON CAMPO PENDIENTE
// node scriptTelephone/actualizarpeindientes.js addpendiente
// node scriptTelephone/actualizarpeindientes.js setpendiente
// node scriptTelephone/actualizarpeindientes.js stats
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

// ============ CONFIGURACIÓN ============
// Usar la nueva versión del motor de monitoreo
const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
};

// ============ CONEXIÓN ============
async function connectDB() {
  console.log('🔌 Conectando a MongoDB...');
  
  // Verificar si ya hay conexión
  if (mongoose.connection.readyState === 1) {
    console.log('✅ Ya conectado a MongoDB\n');
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

// ============ MODELOS - CON VERIFICACIÓN DE EXISTENCIA ============
function getModel(collectionName, schemaDefinition = {}) {
  // ✅ Verificar si el modelo ya existe para no sobrescribirlo
  if (mongoose.models && mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  // Si no existe, crearlo
  const schema = new mongoose.Schema(schemaDefinition, { strict: false });
  return mongoose.model(collectionName, schema, collectionName);
}

// ============ UTILIDADES ============
function printSection(title) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  📌 ${title}`);
  console.log('═'.repeat(80));
}

function printProblem(problem, severity = '⚠️') {
  const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '⚠️';
  console.log(`${emoji} ${problem}`);
}

// ============ 1. DIAGNÓSTICO DE POSTS ============
async function diagnosePostsOnly() {
  printSection('DIAGNÓSTICO DE POSTS');
  
  // ✅ Obtener modelos sin sobrescribir
  const Post = getModel('posts');
  const Category = getModel('categories');
  const User = getModel('users');
  
  const problemas = [];
  const soluciones = [];
  
  const total = await Post.countDocuments();
  console.log(`📊 Total de posts: ${total}`);
  
  if (total === 0) {
    console.log('⚠️ No hay posts en la base de datos');
    return { problemas, soluciones };
  }
  
  // 1. Posts sin título
  const withoutTitle = await Post.find({ 
    $or: [{ title: { $exists: false } }, { title: '' }] 
  }).lean();
  
  if (withoutTitle.length > 0) {
    printProblem(`${withoutTitle.length} posts sin título`, 'warning');
    withoutTitle.slice(0, 5).forEach(post => {
      console.log(`   - ID: ${post._id}`);
    });
    if (withoutTitle.length > 5) {
      console.log(`   ... y ${withoutTitle.length - 5} más`);
    }
    soluciones.push('Generar título automático');
  }
  
  // 2. Posts sin categoría
  const withoutCategory = await Post.find({
    $or: [
      { category: { $exists: false } },
      { category: null },
      { categorie: { $exists: false } },
      { categorie: '' }
    ]
  }).lean();
  
  if (withoutCategory.length > 0) {
    printProblem(`${withoutCategory.length} posts sin categoría`, 'critical');
    withoutCategory.slice(0, 5).forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title || 'sin título'}`);
    });
    soluciones.push('Asignar categoría por defecto');
  }
  
  // 3. Posts con category ID inválido
  try {
    const allCategoryIds = await Category.find({}).distinct('_id');
    const invalidCategory = await Post.find({
      category: { $nin: allCategoryIds, $ne: null }
    }).lean();
    
    if (invalidCategory.length > 0) {
      printProblem(`${invalidCategory.length} posts con category ID inválido`, 'critical');
      invalidCategory.slice(0, 5).forEach(post => {
        console.log(`   - ID: ${post._id}, title: ${post.title}, category: ${post.category}`);
      });
      soluciones.push('Corregir category ID basado en campo categorie');
    }
  } catch (error) {
    console.log('⚠️ No se pudo verificar categorías:', error.message);
  }
  
  // 4. Posts con precio negativo
  const negativePrice = await Post.find({ price: { $lt: 0 } }).lean();
  if (negativePrice.length > 0) {
    printProblem(`${negativePrice.length} posts con precio negativo`, 'critical');
    negativePrice.slice(0, 5).forEach(post => {
      console.log(`   - ID: ${post._id}, title: ${post.title}, price: ${post.price}`);
    });
    soluciones.push('Convertir precio negativo a positivo');
  }
  
  // 5. Posts con precio cero (posible error)
  const priceZero = await Post.find({ price: 0 }).lean();
  if (priceZero.length > 0) {
    console.log(`ℹ️ ${priceZero.length} posts con precio 0 (verificar si son gratis)`);
  }
  
  // 6. Posts sin usuario válido
  try {
    const allUserIds = await User.find({}).distinct('_id');
    const invalidUser = await Post.find({
      user: { $nin: allUserIds, $ne: null }
    }).lean();
    
    if (invalidUser.length > 0) {
      printProblem(`${invalidUser.length} posts sin usuario válido`, 'warning');
      invalidUser.slice(0, 5).forEach(post => {
        console.log(`   - ID: ${post._id}, title: ${post.title}, user: ${post.user}`);
      });
      soluciones.push('Asignar usuario por defecto (admin)');
    }
  } catch (error) {
    console.log('⚠️ No se pudo verificar usuarios:', error.message);
  }
  
  // 7. Posts sin ubicación
  const withoutLocation = await Post.find({
    $or: [
      { wilaya: { $exists: false } },
      { wilaya: '' },
      { wilaya: null }
    ]
  }).lean();
  
  if (withoutLocation.length > 0) {
    console.log(`ℹ️ ${withoutLocation.length} posts sin wilaya`);
  }
  
  // 8. Posts sin campo pendiente
  const withoutPendiente = await Post.countDocuments({
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  if (withoutPendiente > 0) {
    printProblem(`${withoutPendiente} posts sin campo pendiente`, 'warning');
    soluciones.push('Agregar campo pendiente: false a posts antiguos');
  } else {
    console.log(`✅ Todos los posts tienen el campo pendiente`);
  }
  
  // 9. Posts con pendiente true (pendientes de aprobación)
  const pendingPosts = await Post.countDocuments({ pendiente: true });
  if (pendingPosts > 0) {
    console.log(`⏳ ${pendingPosts} posts pendientes de aprobación`);
  }
  
  // 10. Posts por categoría (estadísticas)
  const byCategory = await Post.aggregate([
    { $group: { _id: '$categorie', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log('\n📋 Top 10 categorías:');
  byCategory.forEach(cat => {
    console.log(`   ${cat._id || 'Sin categoría'}: ${cat.count} posts`);
  });
  
  return { problemas, soluciones, stats: { total, withoutTitle: withoutTitle.length, withoutPendiente } };
}

// ============ 2. REPARACIÓN DE POSTS ============
async function repairPostsOnly(dryRun = true) {
  printSection('🔧 REPARACIÓN DE POSTS');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Post = getModel('posts');
  const Category = getModel('categories');
  const User = getModel('users');
  
  const repairs = [];
  
  // 1. Corregir posts con category faltante
  const withoutCategory = await Post.find({
    $or: [
      { category: { $exists: false } },
      { category: null }
    ],
    categorie: { $ne: null, $ne: '' }
  }).lean();
  
  if (withoutCategory.length > 0) {
    console.log(`\n📝 Corrigiendo ${withoutCategory.length} posts con category faltante...`);
    
    const categories = await Category.find({}).lean();
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.slug.toLowerCase(), cat._id);
      categoryMap.set(cat.name.toLowerCase(), cat._id);
    });
    
    for (const post of withoutCategory) {
      const categoryKey = post.categorie.toLowerCase();
      const expectedId = categoryMap.get(categoryKey);
      
      if (expectedId) {
        repairs.push({
          id: post._id,
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
  
  // 2. Corregir posts sin título
  const withoutTitle = await Post.find({ 
    $or: [{ title: { $exists: false } }, { title: '' }] 
  }).lean();
  
  if (withoutTitle.length > 0) {
    console.log(`\n📝 Generando títulos para ${withoutTitle.length} posts...`);
    
    for (const post of withoutTitle) {
      let generatedTitle = '';
      
      if (post.categorie) {
        generatedTitle = post.categorie;
      } else if (post.subCategory) {
        generatedTitle = post.subCategory;
      } else {
        generatedTitle = 'Annonce';
      }
      
      // Añadir precio si existe
      if (post.price && post.price > 0) {
        generatedTitle += ` ${post.price} DA`;
      }
      
      repairs.push({
        id: post._id,
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
  
  // 3. Corregir precios negativos
  const negativePrices = await Post.find({ price: { $lt: 0 } }).lean();
  
  if (negativePrices.length > 0) {
    console.log(`\n📝 Corrigiendo ${negativePrices.length} posts con precio negativo...`);
    
    for (const post of negativePrices) {
      const newPrice = Math.abs(post.price);
      repairs.push({
        id: post._id,
        title: post.title,
        action: 'fix negative price',
        from: post.price,
        to: newPrice
      });
      
      if (!dryRun) {
        await Post.updateOne(
          { _id: post._id },
          { $set: { price: newPrice } }
        );
      }
    }
    
    if (!dryRun) {
      console.log(`   ✅ Corregidos ${repairs.length} precios`);
    }
  }
  
  // 4. Asignar usuario por defecto a posts huérfanos
  try {
    const allUserIds = await User.find({}).distinct('_id');
    const orphanPosts = await Post.find({
      user: { $nin: allUserIds, $ne: null }
    }).lean();
    
    if (orphanPosts.length > 0) {
      console.log(`\n📝 Procesando ${orphanPosts.length} posts huérfanos...`);
      
      const defaultUser = await User.findOne({ email: 'admin@gmail.com' });
      
      if (defaultUser) {
        for (const post of orphanPosts) {
          repairs.push({
            id: post._id,
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
  } catch (error) {
    console.log('⚠️ No se pudieron procesar posts huérfanos:', error.message);
  }
  
  return repairs;
}

// ============ 3. AGREGAR CAMPO PENDIENTE A POSTS ANTIGUOS ============
async function addPendienteField(dryRun = true) {
  printSection('📝 AGREGANDO CAMPO PENDIENTE A POSTS ANTIGUOS');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Post = getModel('posts');
  
  // Contar posts sin campo pendiente
  const withoutPendiente = await Post.countDocuments({
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  console.log(`\n📊 Posts sin campo pendiente: ${withoutPendiente}`);
  
  if (withoutPendiente === 0) {
    console.log('✅ Todos los posts ya tienen el campo pendiente');
    return { updated: 0 };
  }
  
  if (!dryRun) {
    // Actualizar todos los posts que no tienen el campo pendiente
    const result = await Post.updateMany(
      { $or: [{ pendiente: { $exists: false } }, { pendiente: null }] },
      { $set: { pendiente: false } }
    );
    
    console.log(`\n✅ Actualizados ${result.modifiedCount} posts con pendiente: false`);
    
    // Verificar resultado
    const stillMissing = await Post.countDocuments({
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    });
    console.log(`📊 Posts que aún faltan: ${stillMissing}`);
    
    return { updated: result.modifiedCount, stillMissing };
  } else {
    console.log(`\n📝 Se actualizarían ${withoutPendiente} posts`);
    console.log('\n📋 Ejemplo de posts que se actualizarían:');
    
    const samplePosts = await Post.find({
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    }).limit(5).lean();
    
    samplePosts.forEach(post => {
      console.log(`   - ID: ${post._id}, Title: ${post.title || 'sin título'}`);
    });
    
    return { updated: withoutPendiente };
  }
}

// ============ 4. ENCONTRAR POSTS ============
async function findPosts(params) {
  printSection('🔍 BÚSQUEDA DE POSTS');
  
  const Post = getModel('posts');
  const Category = getModel('categories');
  let filter = {};
  
  if (params.category) {
    const cat = await Category.findOne({ slug: params.category }).lean();
    if (cat) {
      filter.category = cat._id;
    } else {
      filter.categorie = { $regex: params.category, $options: 'i' };
    }
  }
  
  if (params.title) {
    filter.title = { $regex: params.title, $options: 'i' };
  }
  
  if (params.userId) {
    filter.user = new mongoose.Types.ObjectId(params.userId);
  }
  
  if (params.boutique === 'true') {
    filter.isFromBoutique = true;
  }
  
  if (params.id) {
    filter._id = new mongoose.Types.ObjectId(params.id);
  }
  
  if (params.pendiente === 'true') {
    filter.pendiente = true;
  } else if (params.pendiente === 'false') {
    filter.pendiente = false;
  }
  
  const posts = await Post.find(filter).lean();
  
  console.log(`\n📊 Posts encontrados: ${posts.length}\n`);
  
  if (posts.length === 0) {
    console.log('❌ No se encontraron posts con ese criterio');
    return;
  }
  
  posts.forEach(post => {
    console.log(`📌 ID: ${post._id}`);
    console.log(`   Title: ${post.title || 'sin título'}`);
    console.log(`   Category: ${post.categorie || 'N/A'} / ${post.category || 'N/A'}`);
    console.log(`   Price: ${post.price || 'N/A'} DA`);
    console.log(`   User: ${post.user || 'N/A'}`);
    console.log(`   Wilaya: ${post.wilaya || 'N/A'}`);
    console.log(`   Pendiente: ${post.pendiente !== undefined ? post.pendiente : 'NO DEFINIDO'}`);
    console.log(`   Boutique: ${post.isFromBoutique ? 'Sí' : 'No'}`);
    console.log(`   Created: ${post.createdAt}`);
    console.log('');
  });
  
  return posts;
}

// ============ 5. VALIDAR POST ESPECÍFICO ============
async function validatePost(id) {
  printSection(`🔍 VALIDANDO POST ${id}`);
  
  const Post = getModel('posts');
  const Category = getModel('categories');
  const User = getModel('users');
  
  let post;
  try {
    post = await Post.findById(id).lean();
  } catch (error) {
    console.error('❌ ID inválido');
    return;
  }
  
  if (!post) {
    console.error('❌ Post no encontrado');
    return;
  }
  
  console.log('\n📄 Post encontrado:');
  console.log(JSON.stringify(post, null, 2));
  
  const issues = [];
  
  if (!post.title) issues.push('❌ Falta título');
  if (!post.category && !post.categorie) issues.push('❌ Falta categoría');
  if (post.price < 0) issues.push('❌ Precio negativo');
  if (post.price === 0) issues.push('⚠️ Precio cero (verificar si es gratis)');
  if (post.pendiente === undefined) issues.push('⚠️ Falta campo pendiente');
  
  if (post.user) {
    const userExists = await User.findById(post.user);
    if (!userExists) issues.push('❌ Usuario no existe');
  }
  
  if (post.category) {
    const categoryExists = await Category.findById(post.category);
    if (!categoryExists) issues.push('❌ Categoría no existe');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️ Problemas encontrados:');
    issues.forEach(issue => console.log(`   ${issue}`));
  } else {
    console.log('\n✅ Post válido, no se encontraron problemas');
  }
  
  return post;
}

// ============ 6. ESTADÍSTICAS RÁPIDAS ============
async function showStats() {
  printSection('📊 ESTADÍSTICAS DE POSTS');
  
  const Post = getModel('posts');
  
  const total = await Post.countDocuments();
  const boutiques = await Post.countDocuments({ isFromBoutique: true });
  const normales = total - boutiques;
  const active = await Post.countDocuments({ isActive: true });
  const inactive = total - active;
  
  console.log(`\n📝 Total de posts: ${total}`);
  console.log(`🏪 Boutiques: ${boutiques}`);
  console.log(`📄 Normales: ${normales}`);
  console.log(`✅ Activos: ${active}`);
  console.log(`❌ Inactivos: ${inactive}`);
  
  // Estadísticas de pendiente
  const withPendiente = await Post.countDocuments({ pendiente: { $exists: true } });
  const withoutPendiente = total - withPendiente;
  const pendingTrue = await Post.countDocuments({ pendiente: true });
  const pendingFalse = await Post.countDocuments({ pendiente: false });
  
  console.log(`\n⏳ Campo pendiente:`);
  console.log(`   Con campo pendiente: ${withPendiente}`);
  console.log(`   Sin campo pendiente: ${withoutPendiente}`);
  console.log(`   Pendiente true: ${pendingTrue}`);
  console.log(`   Pendiente false: ${pendingFalse}`);
  
  const byCategory = await Post.aggregate([
    { $group: { _id: '$categorie', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log('\n📋 Top 10 categorías:');
  byCategory.forEach(cat => {
    console.log(`   ${cat._id || 'Sin categoría'}: ${cat.count} posts`);
  });
  
  const byWilaya = await Post.aggregate([
    { $match: { wilaya: { $ne: null, $ne: '' } } },
    { $group: { _id: '$wilaya', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log('\n📍 Top 10 wilayas:');
  byWilaya.forEach(w => {
    console.log(`   ${w._id}: ${w.count} posts`);
  });
  
  const priceStats = await Post.aggregate([
    { $match: { price: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  
  if (priceStats[0]) {
    console.log('\n💰 Estadísticas de precio:');
    console.log(`   Promedio: ${Math.round(priceStats[0].avgPrice)} DA`);
    console.log(`   Mínimo: ${priceStats[0].minPrice} DA`);
    console.log(`   Máximo: ${priceStats[0].maxPrice} DA`);
  }
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
        await diagnosePostsOnly();
        break;
        
      case 'repair':
        const dryRun = params.dryRun !== 'false';
        await repairPostsOnly(dryRun);
        break;
        
      case 'fix':
        await repairPostsOnly(false);
        break;
        
      case 'addpendiente':
        const dryRunPendiente = params.dryRun !== 'false';
        await addPendienteField(dryRunPendiente);
        break;
        
      case 'setpendiente':
        await addPendienteField(false);
        break;
        
      case 'find':
        await findPosts(params);
        break;
        
      case 'validate':
        if (!params.id) {
          console.error('❌ Uso: node diagnoseAndRepair.js validate id=123...');
        } else {
          await validatePost(params.id);
        }
        break;
        
      case 'stats':
        await showStats();
        break;
        
      default:
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║              🏥 DIAGNÓSTICO Y REPARACIÓN DE POSTS                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

📌 COMANDOS DISPONIBLES:

  🔍 DIAGNÓSTICO:
     node scripts/diagnoseAndRepair.js diagnose

  🔧 REPARACIÓN AUTOMÁTICA:
     node scripts/diagnoseAndRepair.js repair    (simulación)
     node scripts/diagnoseAndRepair.js fix       (reparación real)

  📝 AGREGAR CAMPO PENDIENTE:
     node scripts/diagnoseAndRepair.js addpendiente    (simulación)
     node scripts/diagnoseAndRepair.js setpendiente    (aplicar cambios reales)

  🔎 BÚSQUEDA:
     node scripts/diagnoseAndRepair.js find category=telephone
     node scripts/diagnoseAndRepair.js find title="iPhone"
     node scripts/diagnoseAndRepair.js find id=69cad6c19ae0f6003226c3c8
     node scripts/diagnoseAndRepair.js find boutique=true
     node scripts/diagnoseAndRepair.js find pendiente=true

  ✅ VALIDAR POST:
     node scripts/diagnoseAndRepair.js validate id=69cad6c19ae0f6003226c3c8

  📊 ESTADÍSTICAS:
     node scripts/diagnoseAndRepair.js stats
`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
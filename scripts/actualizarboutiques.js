// 📂 scripts/actualizarboutiques.js
// node scripts/actualizarboutiques.js diagnose
// node scripts/actualizarboutiques.js addpendiente
// node scripts/actualizarboutiques.js setpendiente
// node scripts/actualizarboutiques.js approve-all
// node scripts/actualizarboutiques.js stats

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

// ============ CONFIGURACIÓN ============
const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
};

// ============ CONEXIÓN ============
async function connectDB() {
  console.log('🔌 Conectando a MongoDB...');
  
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

// ============ MODELOS ============
function getModel(collectionName, schemaDefinition = {}) {
  if (mongoose.models && mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
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

// ============ 1. DIAGNÓSTICO DE BOUTIQUES ============
async function diagnoseBoutiques() {
  printSection('DIAGNÓSTICO DE BOUTIQUES');
  
  const Boutique = getModel('boutiques');
  
  const total = await Boutique.countDocuments();
  console.log(`📊 Total de boutiques: ${total}`);
  
  if (total === 0) {
    console.log('⚠️ No hay boutiques en la base de datos');
    return;
  }
  
  // 1. Boutiques sin campo pendiente
  const withoutPendiente = await Boutique.countDocuments({
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  if (withoutPendiente > 0) {
    printProblem(`${withoutPendiente} boutiques sin campo pendiente`, 'warning');
  } else {
    console.log(`✅ Todas las boutiques tienen el campo pendiente`);
  }
  
  // 2. Boutiques pendientes (true)
  const pendingTrue = await Boutique.countDocuments({ pendiente: true });
  const pendingFalse = await Boutique.countDocuments({ pendiente: false });
  
  console.log(`\n⏳ Estado de aprobación:`);
  console.log(`   Pendientes (esperando aprobación): ${pendingTrue}`);
  console.log(`   Aprobadas: ${pendingFalse}`);
  
  // 3. Boutiques activas vs inactivas
  const active = await Boutique.countDocuments({ isActive: true });
  const inactive = total - active;
  console.log(`\n✅ Activas: ${active}`);
  console.log(`❌ Inactivas: ${inactive}`);
  
  // 4. Boutiques por plan
  const byPlan = await Boutique.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log(`\n📋 Distribución por plan:`);
  byPlan.forEach(plan => {
    console.log(`   ${plan._id || 'sin plan'}: ${plan.count} boutiques`);
  });
  
  // 5. Boutiques por categoría
  const byCategorie = await Boutique.aggregate([
    { $group: { _id: '$categorie', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log(`\n📋 Top 10 categorías de boutiques:`);
  byCategorie.forEach(cat => {
    console.log(`   ${cat._id || 'sin categoría'}: ${cat.count} boutiques`);
  });
  
  // 6. Boutiques sin slug
  const withoutSlug = await Boutique.countDocuments({
    $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }]
  });
  
  if (withoutSlug > 0) {
    printProblem(`${withoutSlug} boutiques sin slug`, 'critical');
  }
  
  // 7. Boutiques sin domaine_boutique
  const withoutDomaine = await Boutique.countDocuments({
    $or: [{ domaine_boutique: { $exists: false } }, { domaine_boutique: null }, { domaine_boutique: '' }]
  });
  
  if (withoutDomaine > 0) {
    printProblem(`${withoutDomaine} boutiques sin domaine_boutique`, 'critical');
  }
  
  // 8. Boutiques sin imágenes
  const withoutImages = await Boutique.countDocuments({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } },
      { images: null }
    ]
  });
  
  if (withoutImages > 0) {
    printProblem(`${withoutImages} boutiques sin imágenes`, 'warning');
  }
  
  return { 
    total, 
    withoutPendiente, 
    pendingTrue, 
    pendingFalse,
    active,
    inactive,
    withoutSlug,
    withoutDomaine,
    withoutImages
  };
}

// ============ 2. DIAGNÓSTICO DE PRODUCTOS DE BOUTIQUES (en posts) ============
async function diagnoseBoutiqueProducts() {
  printSection('DIAGNÓSTICO DE PRODUCTOS DE BOUTIQUES');
  
  const Post = getModel('posts');
  const Boutique = getModel('boutiques');
  
  // 1. Total de productos de boutique
  const totalBoutiqueProducts = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null } 
  });
  console.log(`📊 Total de productos de boutique: ${totalBoutiqueProducts}`);
  
  if (totalBoutiqueProducts === 0) {
    console.log('⚠️ No hay productos de boutique en la colección posts');
    return;
  }
  
  // 2. Productos sin campo pendiente
  const withoutPendiente = await Post.countDocuments({
    boutique: { $exists: true, $ne: null },
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  if (withoutPendiente > 0) {
    printProblem(`${withoutPendiente} productos sin campo pendiente`, 'warning');
  }
  
  // 3. Productos pendientes vs aprobados
  const pendingTrue = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    pendiente: true 
  });
  const pendingFalse = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    pendiente: false 
  });
  
  console.log(`\n⏳ Estado de aprobación de productos:`);
  console.log(`   Pendientes: ${pendingTrue}`);
  console.log(`   Aprobados: ${pendingFalse}`);
  
  // 4. Productos por boutique
  const byBoutique = await Post.aggregate([
    { $match: { boutique: { $exists: true, $ne: null } } },
    { $group: { _id: '$boutique', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  console.log(`\n📋 Top 10 boutiques con más productos:`);
  for (const item of byBoutique) {
    const boutique = await Boutique.findById(item._id).select('nom_boutique');
    console.log(`   ${boutique.nom_boutique || item._id}: ${item.count} productos`);
  }
  
  // 5. Productos sin relación válida con boutique
  const allBoutiqueIds = await Boutique.find({}).distinct('_id');
  const orphanProducts = await Post.countDocuments({
    boutique: { $exists: true, $ne: null },
    boutique: { $nin: allBoutiqueIds }
  });
  
  if (orphanProducts > 0) {
    printProblem(`${orphanProducts} productos huérfanos (boutique no existe)`, 'critical');
  }
  
  // 6. Productos de boutiques inactivas
  const inactiveBoutiques = await Boutique.find({ isActive: false }).distinct('_id');
  const productsFromInactive = await Post.countDocuments({
    boutique: { $in: inactiveBoutiques }
  });
  
  if (productsFromInactive > 0) {
    printProblem(`${productsFromInactive} productos de boutiques inactivas`, 'warning');
  }
  
  // 7. Productos de boutiques pendientes (no aprobadas)
  const pendingBoutiques = await Boutique.find({ pendiente: true }).distinct('_id');
  const productsFromPending = await Post.countDocuments({
    boutique: { $in: pendingBoutiques }
  });
  
  if (productsFromPending > 0) {
    console.log(`\n⚠️ ${productsFromPending} productos de boutiques pendientes de aprobación`);
  }
  
  return {
    totalBoutiqueProducts,
    withoutPendiente,
    pendingTrue,
    pendingFalse,
    orphanProducts,
    productsFromInactive,
    productsFromPending
  };
}

// ============ 3. AGREGAR CAMPO PENDIENTE A BOUTIQUES ============
async function addPendienteToBoutiques(dryRun = true) {
  printSection('📝 AGREGANDO CAMPO PENDIENTE A BOUTIQUES');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Boutique = getModel('boutiques');
  
  // Contar boutiques sin campo pendiente
  const withoutPendiente = await Boutique.countDocuments({
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  console.log(`\n📊 Boutiques sin campo pendiente: ${withoutPendiente}`);
  
  if (withoutPendiente === 0) {
    console.log('✅ Todas las boutiques ya tienen el campo pendiente');
    return { updated: 0 };
  }
  
  if (!dryRun) {
    // Actualizar todas las boutiques que no tienen el campo pendiente
    const result = await Boutique.updateMany(
      { $or: [{ pendiente: { $exists: false } }, { pendiente: null }] },
      { $set: { pendiente: false } }
    );
    
    console.log(`\n✅ Actualizadas ${result.modifiedCount} boutiques con pendiente: false`);
    
    // Verificar resultado
    const stillMissing = await Boutique.countDocuments({
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    });
    console.log(`📊 Boutiques que aún faltan: ${stillMissing}`);
    
    return { updated: result.modifiedCount, stillMissing };
  } else {
    console.log(`\n📝 Se actualizarían ${withoutPendiente} boutiques`);
    
    const sampleBoutiques = await Boutique.find({
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    }).limit(5).lean();
    
    console.log('\n📋 Ejemplo de boutiques que se actualizarían:');
    sampleBoutiques.forEach(boutique => {
      console.log(`   - ID: ${boutique._id}, Nom: ${boutique.nom_boutique || 'sin nombre'}`);
    });
    
    return { updated: withoutPendiente };
  }
}

// ============ 4. AGREGAR CAMPO PENDIENTE A PRODUCTOS DE BOUTIQUES ============
async function addPendienteToBoutiqueProducts(dryRun = true) {
  printSection('📝 AGREGANDO CAMPO PENDIENTE A PRODUCTOS DE BOUTIQUES');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Post = getModel('posts');
  
  // Contar productos de boutique sin campo pendiente
  const withoutPendiente = await Post.countDocuments({
    boutique: { $exists: true, $ne: null },
    $or: [
      { pendiente: { $exists: false } },
      { pendiente: null }
    ]
  });
  
  console.log(`\n📊 Productos de boutique sin campo pendiente: ${withoutPendiente}`);
  
  if (withoutPendiente === 0) {
    console.log('✅ Todos los productos de boutique ya tienen el campo pendiente');
    return { updated: 0 };
  }
  
  if (!dryRun) {
    // Actualizar todos los productos de boutique que no tienen el campo pendiente
    const result = await Post.updateMany(
      {
        boutique: { $exists: true, $ne: null },
        $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
      },
      { $set: { pendiente: false } }
    );
    
    console.log(`\n✅ Actualizados ${result.modifiedCount} productos con pendiente: false`);
    
    // Verificar resultado
    const stillMissing = await Post.countDocuments({
      boutique: { $exists: true, $ne: null },
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    });
    console.log(`📊 Productos que aún faltan: ${stillMissing}`);
    
    return { updated: result.modifiedCount, stillMissing };
  } else {
    console.log(`\n📝 Se actualizarían ${withoutPendiente} productos`);
    
    const sampleProducts = await Post.find({
      boutique: { $exists: true, $ne: null },
      $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
    }).limit(5).lean();
    
    console.log('\n📋 Ejemplo de productos que se actualizarían:');
    sampleProducts.forEach(product => {
      console.log(`   - ID: ${product._id}, Title: ${product.title || 'sin título'}`);
    });
    
    return { updated: withoutPendiente };
  }
}

// ============ 5. APROBAR TODAS LAS BOUTIQUES EXISTENTES ============
async function approveAllBoutiques(dryRun = true) {
  printSection('✅ APROBANDO TODAS LAS BOUTIQUES EXISTENTES');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Boutique = getModel('boutiques');
  
  // Contar boutiques pendientes
  const pendingBoutiques = await Boutique.countDocuments({ pendiente: true });
  
  console.log(`\n📊 Boutiques pendientes de aprobación: ${pendingBoutiques}`);
  
  if (pendingBoutiques === 0) {
    console.log('✅ No hay boutiques pendientes de aprobación');
    return { updated: 0 };
  }
  
  if (!dryRun) {
    const result = await Boutique.updateMany(
      { pendiente: true },
      { $set: { pendiente: false } }
    );
    
    console.log(`\n✅ Aprobadas ${result.modifiedCount} boutiques`);
    return { updated: result.modifiedCount };
  } else {
    console.log(`\n📝 Se aprobarían ${pendingBoutiques} boutiques`);
    
    const sampleBoutiques = await Boutique.find({ pendiente: true }).limit(5).lean();
    console.log('\n📋 Ejemplo de boutiques que se aprobarían:');
    sampleBoutiques.forEach(boutique => {
      console.log(`   - ID: ${boutique._id}, Nom: ${boutique.nom_boutique}`);
    });
    
    return { updated: pendingBoutiques };
  }
}

// ============ 6. APROBAR TODOS LOS PRODUCTOS DE BOUTIQUES ============
async function approveAllBoutiqueProducts(dryRun = true) {
  printSection('✅ APROBANDO TODOS LOS PRODUCTOS DE BOUTIQUES');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Post = getModel('posts');
  
  // Contar productos pendientes de boutique
  const pendingProducts = await Post.countDocuments({
    boutique: { $exists: true, $ne: null },
    pendiente: true
  });
  
  console.log(`\n📊 Productos de boutique pendientes de aprobación: ${pendingProducts}`);
  
  if (pendingProducts === 0) {
    console.log('✅ No hay productos de boutique pendientes de aprobación');
    return { updated: 0 };
  }
  
  if (!dryRun) {
    const result = await Post.updateMany(
      {
        boutique: { $exists: true, $ne: null },
        pendiente: true
      },
      { $set: { pendiente: false } }
    );
    
    console.log(`\n✅ Aprobados ${result.modifiedCount} productos`);
    return { updated: result.modifiedCount };
  } else {
    console.log(`\n📝 Se aprobarían ${pendingProducts} productos`);
    
    const sampleProducts = await Post.find({
      boutique: { $exists: true, $ne: null },
      pendiente: true
    }).limit(5).lean();
    
    console.log('\n📋 Ejemplo de productos que se aprobarían:');
    sampleProducts.forEach(product => {
      console.log(`   - ID: ${product._id}, Title: ${product.title}`);
    });
    
    return { updated: pendingProducts };
  }
}

// ============ 7. ESTADÍSTICAS COMPLETAS ============
async function showFullStats() {
  printSection('📊 ESTADÍSTICAS COMPLETAS DE BOUTIQUES Y PRODUCTOS');
  
  const Boutique = getModel('boutiques');
  const Post = getModel('posts');
  
  // Boutiques
  const totalBoutiques = await Boutique.countDocuments();
  const boutiquesActivas = await Boutique.countDocuments({ isActive: true });
  const boutiquesInactivas = totalBoutiques - boutiquesActivas;
  const boutiquesPendientes = await Boutique.countDocuments({ pendiente: true });
  const boutiquesAprobadas = await Boutique.countDocuments({ pendiente: false });
  const boutiquesSinPendiente = await Boutique.countDocuments({
    $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
  });
  
  console.log('\n🏪 BOUTIQUES:');
  console.log(`   Total: ${totalBoutiques}`);
  console.log(`   Activas: ${boutiquesActivas}`);
  console.log(`   Inactivas: ${boutiquesInactivas}`);
  console.log(`   Aprobadas (pendiente=false): ${boutiquesAprobadas}`);
  console.log(`   Pendientes (pendiente=true): ${boutiquesPendientes}`);
  console.log(`   Sin campo pendiente: ${boutiquesSinPendiente}`);
  
  // Productos de boutique
  const totalProducts = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null } 
  });
  const productsActivos = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    isActive: true 
  });
  const productsInactivos = totalProducts - productsActivos;
  const productsAprobados = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    pendiente: false 
  });
  const productsPendientes = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    pendiente: true 
  });
  const productsSinPendiente = await Post.countDocuments({ 
    boutique: { $exists: true, $ne: null },
    $or: [{ pendiente: { $exists: false } }, { pendiente: null }]
  });
  
  console.log('\n📦 PRODUCTOS DE BOUTIQUE:');
  console.log(`   Total: ${totalProducts}`);
  console.log(`   Activos: ${productsActivos}`);
  console.log(`   Inactivos: ${productsInactivos}`);
  console.log(`   Aprobados (pendiente=false): ${productsAprobados}`);
  console.log(`   Pendientes (pendiente=true): ${productsPendientes}`);
  console.log(`   Sin campo pendiente: ${productsSinPendiente}`);
  
  // Relación
  const boutiquesConProductos = await Post.distinct('boutique', { 
    boutique: { $exists: true, $ne: null } 
  });
  console.log(`\n🔗 RELACIÓN:`);
  console.log(`   Boutiques con productos: ${boutiquesConProductos.length}`);
  console.log(`   Promedio de productos por boutique: ${(totalProducts / Math.max(boutiquesConProductos.length, 1)).toFixed(2)}`);
}

// ============ 8. REPARAR PRODUCTOS HUÉRFANOS ============
async function repairOrphanProducts(dryRun = true) {
  printSection('🔧 REPARANDO PRODUCTOS HUÉRFANOS');
  
  if (dryRun) {
    console.log('\n⚠️ MODO DRY RUN: Simulación sin cambios reales');
  }
  
  const Post = getModel('posts');
  const Boutique = getModel('boutiques');
  
  // Encontrar boutiques válidas
  const validBoutiqueIds = await Boutique.find({}).distinct('_id');
  
  // Productos con boutique que no existe
  const orphanProducts = await Post.find({
    boutique: { $exists: true, $ne: null },
    boutique: { $nin: validBoutiqueIds }
  }).lean();
  
  console.log(`\n📊 Productos huérfanos encontrados: ${orphanProducts.length}`);
  
  if (orphanProducts.length === 0) {
    console.log('✅ No hay productos huérfanos');
    return { deleted: 0 };
  }
  
  if (!dryRun) {
    // Opción 1: Eliminar productos huérfanos
    const result = await Post.deleteMany({
      boutique: { $exists: true, $ne: null },
      boutique: { $nin: validBoutiqueIds }
    });
    
    console.log(`\n✅ Eliminados ${result.deletedCount} productos huérfanos`);
    
    // Opción 2: Marcar como inactivos en lugar de eliminar
    // const result = await Post.updateMany(
    //   {
    //     boutique: { $exists: true, $ne: null },
    //     boutique: { $nin: validBoutiqueIds }
    //   },
    //   { $set: { isActive: false, pendiente: true } }
    // );
    
    return { deleted: result.deletedCount };
  } else {
    console.log('\n📋 Productos huérfanos que se eliminarían:');
    orphanProducts.slice(0, 10).forEach(product => {
      console.log(`   - ID: ${product._id}, Title: ${product.title}, Boutique: ${product.boutique}`);
    });
    
    if (orphanProducts.length > 10) {
      console.log(`   ... y ${orphanProducts.length - 10} más`);
    }
    
    return { deleted: orphanProducts.length };
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
        await diagnoseBoutiques();
        await diagnoseBoutiqueProducts();
        break;
        
      case 'addpendiente':
        const dryRunPendiente = params.dryRun !== 'false';
        await addPendienteToBoutiques(dryRunPendiente);
        await addPendienteToBoutiqueProducts(dryRunPendiente);
        break;
        
      case 'setpendiente':
        await addPendienteToBoutiques(false);
        await addPendienteToBoutiqueProducts(false);
        break;
        
      case 'approve-all':
        const dryRunApprove = params.dryRun !== 'false';
        await approveAllBoutiques(dryRunApprove);
        await approveAllBoutiqueProducts(dryRunApprove);
        break;
        
      case 'approve':
        await approveAllBoutiques(false);
        await approveAllBoutiqueProducts(false);
        break;
        
      case 'repair-orphans':
        const dryRunRepair = params.dryRun !== 'false';
        await repairOrphanProducts(dryRunRepair);
        break;
        
      case 'fix-orphans':
        await repairOrphanProducts(false);
        break;
        
      case 'stats':
        await showFullStats();
        break;
        
      default:
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║           🏪 DIAGNÓSTICO Y REPARACIÓN DE BOUTIQUES Y PRODUCTOS            ║
╚═══════════════════════════════════════════════════════════════════════════╝

📌 COMANDOS DISPONIBLES:

  🔍 DIAGNÓSTICO:
     node scripts/actualizarBoutiques.js diagnose

  📝 AGREGAR CAMPO PENDIENTE:
     node scripts/actualizarBoutiques.js addpendiente    (simulación)
     node scripts/actualizarBoutiques.js setpendiente    (aplicar cambios reales)

  ✅ APROBAR TODO (boutiques + productos existentes):
     node scripts/actualizarBoutiques.js approve-all     (simulación)
     node scripts/actualizarBoutiques.js approve         (aprobar todo realmente)

  🔧 REPARAR PRODUCTOS HUÉRFANOS:
     node scripts/actualizarBoutiques.js repair-orphans  (simulación)
     node scripts/actualizarBoutiques.js fix-orphans     (eliminar realmente)

  📊 ESTADÍSTICAS:
     node scripts/actualizarBoutiques.js stats

════════════════════════════════════════════════════════════════════════════

📌 EJEMPLOS RÁPIDOS:

  # Ver diagnóstico completo
  node scripts/actualizarBoutiques.js diagnose

  # Agregar campo pendiente a boutiques y productos (simulación)
  node scripts/actualizarBoutiques.js addpendiente

  # Agregar campo pendiente REAL
  node scripts/actualizarBoutiques.js setpendiente

  # Aprobar todas las boutiques y productos existentes
  node scripts/actualizarBoutiques.js approve

  # Ver estadísticas
  node scripts/actualizarBoutiques.js stats
`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
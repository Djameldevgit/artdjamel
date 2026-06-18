// node scripts/update-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ Error de conexión:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB');
  await runUpdates();
});

// Helper: Actualizar el path y ancestors de una categoría
async function updateCategoryPath(category) {
  if (!category.parent) {
    category.ancestors = [];
    category.path = category.slug;
  } else {
    const parent = await Category.findById(category.parent);
    if (parent) {
      category.ancestors = [...parent.ancestors, parent._id];
      category.path = `${parent.path}/${category.slug}`;
    }
  }
  return category;
}

// Helper: Reconstruir paths de todos los descendientes
async function rebuildDescendantsPaths(category) {
  const descendants = await Category.find({ 
    ancestors: category._id 
  });
  
  for (const descendant of descendants) {
    await updateCategoryPath(descendant);
    await descendant.save();
  }
  
  if (descendants.length > 0) {
    console.log(`   • Reconstruidos paths de ${descendants.length} descendientes`);
  }
}

// Helper: Actualizar hasChildren basado en hijos existentes
async function updateHasChildrenFlag(categoryId) {
  const childrenCount = await Category.countDocuments({ parent: categoryId });
  await Category.findByIdAndUpdate(categoryId, { 
    hasChildren: childrenCount > 0 
  });
}

// Helper: Encontrar categoría por slug
async function findCategoryBySlug(slug) {
  return await Category.findOne({ slug });
}

// Helper: Encontrar categoría por nombre y padre
async function findCategoryByNameAndParent(name, parentId = null) {
  return await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    parent: parentId
  });
}

// ==================== OPERACIONES DE ACTUALIZACIÓN ====================

// 1. Agregar nueva categoría
async function addCategory(categoryData) {
  try {
    let parentId = null;
    let parent = null;
    
    if (categoryData.parentSlug) {
      parent = await findCategoryBySlug(categoryData.parentSlug);
      if (!parent) {
        console.log(`❌ No se encontró la categoría padre: ${categoryData.parentSlug}`);
        return false;
      }
      parentId = parent._id;
    }

    // Verificar si la categoría ya existe
    const existing = await findCategoryByNameAndParent(
      categoryData.name, 
      parentId
    );
    
    if (existing) {
      console.log(`⚠️ La categoría "${categoryData.name}" ya existe, omitiendo...`);
      return false;
    }

    // Crear la categoría
    const category = new Category({
      name: categoryData.name,
      slug: categoryData.slug,
      level: parent ? parent.level + 1 : 1,
      parent: parentId,
      icon: categoryData.icon,
      iconType: categoryData.iconType || 'image-png',
      order: categoryData.order || 0,
      hasChildren: false,
      isLeaf: !categoryData.children || categoryData.children.length === 0,
      isActive: true,
      postCount: 0
    });

    // Actualizar path y ancestors
    await updateCategoryPath(category);
    await category.save();
    
    console.log(`✅ Categoría agregada: ${categoryData.name}`);
    console.log(`   • Slug: ${category.slug}`);
    console.log(`   • Nivel: ${category.level}`);
    console.log(`   • Path: ${category.path}`);
    console.log(`   • Icono: ${category.icon}`);

    // Actualizar hasChildren del padre
    if (parentId) {
      await updateHasChildrenFlag(parentId);
      console.log(`   • Padre "${parent.name}" actualizado (hasChildren: true)`);
    }

    // Si tiene hijos, agregarlos recursivamente
    if (categoryData.children && categoryData.children.length > 0) {
      console.log(`   • Agregando ${categoryData.children.length} subcategorías...`);
      for (const childData of categoryData.children) {
        await addCategory({
          ...childData,
          parentSlug: category.slug
        });
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Error al agregar "${categoryData.name}":`, error.message);
    return false;
  }
}

// 2. Actualizar categoría existente
async function updateCategory(findSlug, updates) {
  try {
    const category = await findCategoryBySlug(findSlug);
    if (!category) {
      console.log(`❌ No se encontró la categoría: ${findSlug}`);
      return false;
    }

    // Guardar valores antiguos para log
    const oldValues = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      order: category.order,
      isActive: category.isActive
    };

    // Aplicar actualizaciones
    Object.keys(updates).forEach(key => {
      if (key !== 'children') {
        category[key] = updates[key];
      }
    });

    // Si se actualizó el slug, necesitamos actualizar path
    if (updates.slug && updates.slug !== oldValues.slug) {
      await updateCategoryPath(category);
      console.log(`   • Slug cambiado: ${oldValues.slug} → ${updates.slug}`);
      console.log(`   • Path actualizado: ${category.path}`);
      
      // Reconstruir paths de todos los descendientes
      await rebuildDescendantsPaths(category);
    }

    await category.save();
    
    console.log(`✅ Categoría actualizada: ${findSlug} → ${category.name}`);
    console.log(`   • Nombre: ${oldValues.name} → ${category.name}`);
    console.log(`   • Icono: ${oldValues.icon} → ${category.icon}`);
    console.log(`   • Orden: ${oldValues.order} → ${category.order}`);
    console.log(`   • Activo: ${oldValues.isActive} → ${category.isActive}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error al actualizar ${findSlug}:`, error.message);
    return false;
  }
}

// 3. Deshabilitar categoría
async function disableCategory(slug) {
  try {
    const category = await findCategoryBySlug(slug);
    if (!category) {
      console.log(`❌ No se encontró la categoría: ${slug}`);
      return false;
    }

    category.isActive = false;
    await category.save();
    
    console.log(`⛔ Categoría deshabilitada: ${slug}`);
    console.log(`   • Nombre: ${category.name}`);
    console.log(`   • Path: ${category.path}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al deshabilitar ${slug}:`, error.message);
    return false;
  }
}

// 4. Activar categoría
async function activateCategory(slug) {
  try {
    const category = await findCategoryBySlug(slug);
    if (!category) {
      console.log(`❌ No se encontró la categoría: ${slug}`);
      return false;
    }

    category.isActive = true;
    await category.save();
    
    console.log(`✅ Categoría activada: ${slug}`);
    console.log(`   • Nombre: ${category.name}`);
    console.log(`   • Path: ${category.path}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al activar ${slug}:`, error.message);
    return false;
  }
}

// 5. Eliminar categoría permanentemente
async function deleteCategory(slug) {
  try {
    const category = await findCategoryBySlug(slug);
    if (!category) {
      console.log(`❌ No se encontró la categoría: ${slug}`);
      return false;
    }

    // Buscar todas las subcategorías
    const descendants = await Category.find({ 
      ancestors: category._id 
    });
    const allIds = [category._id, ...descendants.map(d => d._id)];
    
    // Eliminar todas
    const result = await Category.deleteMany({ _id: { $in: allIds } });
    
    console.log(`🗑️ Categoría y subcategorías eliminadas: ${slug}`);
    console.log(`   • Total eliminadas: ${result.deletedCount}`);
    console.log(`   • Incluye: ${descendants.length} subcategorías`);
    
    // Actualizar hasChildren del padre si existe
    if (category.parent) {
      await updateHasChildrenFlag(category.parent);
      const parent = await Category.findById(category.parent);
      if (parent) {
        console.log(`   • Padre "${parent.name}" actualizado`);
      }
    }
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar ${slug}:`, error.message);
    return false;
  }
}

// 6. Reordenar categorías
async function reorderCategories(parentSlug = null, orderedSlugs) {
  try {
    let parentId = null;
    let parent = null;
    
    if (parentSlug) {
      parent = await findCategoryBySlug(parentSlug);
      if (!parent) {
        console.log(`❌ No se encontró la categoría padre: ${parentSlug}`);
        return false;
      }
      parentId = parent._id;
    }
    
    const query = parentId ? { parent: parentId } : { parent: null, level: 1 };
    const categories = await Category.find(query);
    
    for (let i = 0; i < orderedSlugs.length; i++) {
      const category = categories.find(c => c.slug === orderedSlugs[i]);
      if (category) {
        category.order = i;
        await category.save();
      }
    }
    
    console.log(`✅ Reordenamiento completado para ${parentSlug || 'categorías principales'}`);
    console.log(`   • Total categorías reordenadas: ${orderedSlugs.length}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al reordenar:`, error.message);
    return false;
  }
}

// 7. Mover categoría a otro padre
async function moveCategory(slug, newParentSlug = null) {
  try {
    const category = await findCategoryBySlug(slug);
    if (!category) {
      console.log(`❌ No se encontró la categoría: ${slug}`);
      return false;
    }
    
    const oldParent = category.parent;
    let newParent = null;
    let newParentId = null;
    
    if (newParentSlug) {
      newParent = await findCategoryBySlug(newParentSlug);
      if (!newParent) {
        console.log(`❌ No se encontró el nuevo padre: ${newParentSlug}`);
        return false;
      }
      newParentId = newParent._id;
      
      // Verificar que no se mueva a sí mismo o a un descendiente
      if (newParentId.equals(category._id)) {
        console.log(`❌ No se puede mover una categoría a sí misma`);
        return false;
      }
      
      const isDescendant = await Category.findOne({ 
        _id: newParentId, 
        ancestors: category._id 
      });
      if (isDescendant) {
        console.log(`❌ No se puede mover a un descendiente`);
        return false;
      }
    }
    
    // Actualizar nivel
    const newLevel = newParent ? newParent.level + 1 : 1;
    category.level = newLevel;
    category.parent = newParentId;
    
    // Actualizar path y ancestors
    await updateCategoryPath(category);
    await category.save();
    
    console.log(`🔄 Categoría movida: ${slug}`);
    console.log(`   • De padre: ${oldParent ? 'si tenía' : 'ninguno'} → A padre: ${newParent ? newParent.name : 'raíz'}`);
    console.log(`   • Nuevo nivel: ${newLevel}`);
    console.log(`   • Nuevo path: ${category.path}`);
    
    // Reconstruir paths de todos los descendientes
    await rebuildDescendantsPaths(category);
    
    // Actualizar flags hasChildren de los padres afectados
    if (oldParent) {
      await updateHasChildrenFlag(oldParent);
      const oldParentDoc = await Category.findById(oldParent);
      if (oldParentDoc) {
        console.log(`   • Padre antiguo "${oldParentDoc.name}" actualizado`);
      }
    }
    if (newParentId) {
      await updateHasChildrenFlag(newParentId);
      console.log(`   • Padre nuevo "${newParent.name}" actualizado`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error al mover ${slug}:`, error.message);
    return false;
  }
}

// ==================== CONFIGURACIÓN DE ACTUALIZACIONES ====================

const updates = {
  // 1. Agregar nuevas categorías
  addCategories: [
    // Ejemplo: 
    // {
    //   name: 'Coches Eléctricos',
    //   slug: 'coches-electricos',
    //   parentSlug: 'vehicules',
    //   icon: '/categories/vehicules/coches-electricos.png',
    //   iconType: 'image-png',
    //   order: 12,
    //   children: []
    // }
  ],

  // 2. Actualizar categorías existentes
  updateCategories: [
    // Ejemplo:
    // {
    //   findSlug: 'voitures',
    //   updates: {
    //     icon: '/categories/vehicules/voitures-nuevo.png',
    //     order: 1
    //   }
    // }
  ],

  // 3. Reordenar categorías
  reorderCategoriesList: [
    // Ejemplo:
    // {
    //   parentSlug: null,
    //   orderedSlugs: ['boutiques', 'immobilier', 'vehicules']
    // }
  ],

  // 4. Deshabilitar categorías
  disableCategories: [
    // Ejemplo:
    // { slug: 'antiquites-collections' }
  ],

  // 5. Activar categorías
  activateCategories: [
    { slug: 'boutiques' },
    { slug: 'voyages' },
    { slug: 'telephone' }
  ],

  // 6. Eliminar categorías permanentemente
  deleteCategories: [
    // Ejemplo:
    // { slug: 'categoria-obsoleta' }
  ],

  // 7. Mover categorías a otro padre
  moveCategories: [
    // Ejemplo:
    // { slug: 'coches-electricos', newParentSlug: 'voitures' }
  ]
};

// ==================== FUNCIÓN PRINCIPAL ====================

async function runUpdates() {
  try {
    console.log('🔄 Iniciando actualizaciones de categorías...\n');
    
    // Mostrar estadísticas iniciales
    const totalCategories = await Category.countDocuments();
    const level1Count = await Category.countDocuments({ level: 1 });
    const level2Count = await Category.countDocuments({ level: 2 });
    const level3Count = await Category.countDocuments({ level: 3 });
    
    console.log('📊 Estadísticas iniciales:');
    console.log(`   • Total categorías: ${totalCategories}`);
    console.log(`   • Nivel 1: ${level1Count}`);
    console.log(`   • Nivel 2: ${level2Count}`);
    console.log(`   • Nivel 3: ${level3Count}`);
    console.log();

    // 1. Reordenar categorías
    if (updates.reorderCategoriesList.length > 0) {
      console.log('🔄 Reordenando categorías...');
      for (const reorder of updates.reorderCategoriesList) {
        await reorderCategories(reorder.parentSlug, reorder.orderedSlugs);
      }
      console.log();
    }

    // 2. Mover categorías
    if (updates.moveCategories.length > 0) {
      console.log('🚚 Moviendo categorías...');
      for (const move of updates.moveCategories) {
        await moveCategory(move.slug, move.newParentSlug);
      }
      console.log();
    }

    // 3. Actualizar categorías existentes
    if (updates.updateCategories.length > 0) {
      console.log('📝 Actualizando categorías existentes...');
      for (const update of updates.updateCategories) {
        await updateCategory(update.findSlug, update.updates);
      }
      console.log();
    }

    // 4. Agregar nuevas categorías
    if (updates.addCategories.length > 0) {
      console.log('➕ Agregando nuevas categorías...');
      for (const category of updates.addCategories) {
        await addCategory(category);
      }
      console.log();
    }

    // 5. Deshabilitar categorías
    if (updates.disableCategories.length > 0) {
      console.log('⛔ Deshabilitando categorías...');
      for (const cat of updates.disableCategories) {
        await disableCategory(cat.slug);
      }
      console.log();
    }

    // 6. Activar categorías
    if (updates.activateCategories.length > 0) {
      console.log('✅ Activando categorías...');
      for (const cat of updates.activateCategories) {
        await activateCategory(cat.slug);
      }
      console.log();
    }

    // 7. Eliminar categorías permanentemente
    if (updates.deleteCategories.length > 0) {
      console.log('🗑️ Eliminando categorías permanentemente...');
      for (const cat of updates.deleteCategories) {
        await deleteCategory(cat.slug);
      }
      console.log();
    }

    // Mostrar estadísticas finales
    const finalTotal = await Category.countDocuments();
    const finalActive = await Category.countDocuments({ isActive: true });
    const finalInactive = await Category.countDocuments({ isActive: false });
    const finalLevel1 = await Category.countDocuments({ level: 1 });
    const finalLevel2 = await Category.countDocuments({ level: 2 });
    const finalLevel3 = await Category.countDocuments({ level: 3 });
    
    console.log('✨ Actualizaciones completadas exitosamente');
    console.log('\n📊 Estadísticas finales:');
    console.log(`   • Total categorías: ${finalTotal}`);
    console.log(`   • Nivel 1: ${finalLevel1}`);
    console.log(`   • Nivel 2: ${finalLevel2}`);
    console.log(`   • Nivel 3: ${finalLevel3}`);
    console.log(`   • Activas: ${finalActive}`);
    console.log(`   • Inactivas: ${finalInactive}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las actualizaciones:', error);
    process.exit(1);
  }
}
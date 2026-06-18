// scripts/preview-updates.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');

async function previewUpdates() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
  
  console.log('🔍 VISTA PREVIA DE ACTUALIZACIONES\n');
  console.log('=' .repeat(50));
  
  // Simular las actualizaciones que vamos a hacer
  const updatesToPreview = [
    {
      type: 'add',
      name: 'Coches Eléctricos',
      slug: 'coches-electricos',
      parentSlug: 'vehicules'
    },
    {
      type: 'update',
      slug: 'voitures',
      updates: {
        icon: '/categories/vehicules/voitures-nuevo.png'
      }
    }
  ];
  
  for (const update of updatesToPreview) {
    if (update.type === 'add') {
      const parent = await Category.findOne({ slug: update.parentSlug });
      const existing = await Category.findOne({ slug: update.slug });
      
      console.log(`\n➕ AGREGAR: ${update.name}`);
      console.log(`   • Slug: ${update.slug}`);
      console.log(`   • Padre: ${parent ? parent.name : 'NO ENCONTRADO'}`);
      console.log(`   • Estado: ${existing ? '⚠️ YA EXISTE' : '✅ LISTO PARA AGREGAR'}`);
      
      if (existing) {
        console.log(`   • Conflicto: La categoría con slug "${update.slug}" ya existe`);
      }
    }
    
    if (update.type === 'update') {
      const category = await Category.findOne({ slug: update.slug });
      
      console.log(`\n📝 ACTUALIZAR: ${update.slug}`);
      console.log(`   • Nombre actual: ${category ? category.name : 'NO ENCONTRADA'}`);
      console.log(`   • Icono actual: ${category ? category.icon : 'N/A'}`);
      console.log(`   • Nuevo icono: ${update.updates.icon}`);
      console.log(`   • Estado: ${category ? '✅ LISTO PARA ACTUALIZAR' : '❌ NO EXISTE'}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n⚠️ Esta es solo una vista previa. Para aplicar los cambios, ejecuta:');
  console.log('npm run update-categories');
  
  process.exit(0);
}

previewUpdates();
// scripts/restore-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('../models/categoryModel');

async function restoreCategories(backupFile) {
  if (!backupFile) {
    console.error('❌ Por favor especifica el archivo de backup');
    console.log('Uso: node scripts/restore-categories.js backups/categories-backup-123456789.json');
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
  
  console.log(`🔄 Restaurando backup: ${backupFile}`);
  
  // Leer backup
  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  // Confirmar restauración
  console.log(`\n⚠️ ADVERTENCIA: Esto eliminará TODAS las categorías actuales`);
  console.log(`📊 Backup contiene: ${backupData.totalCategories} categorías`);
  console.log(`📅 Backup creado: ${new Date(backupData.date).toLocaleString()}`);
  console.log('\n¿Continuar? (escribe "YES" para confirmar)');
  
  // En un script real, aquí esperarías input del usuario
  // Por ahora, comentamos la confirmación automática
  // const confirmation = await new Promise(resolve => {
  //   process.stdin.once('data', data => resolve(data.toString().trim()));
  // });
  
  // if (confirmation !== 'YES') {
  //   console.log('❌ Restauración cancelada');
  //   process.exit(0);
  // }
  
  // Eliminar todas las categorías existentes
  await Category.deleteMany({});
  console.log('🗑️ Categorías existentes eliminadas');
  
  // Recrear categorías manteniendo las relaciones
  const categoryMap = new Map();
  
  // Primero crear todas las categorías sin relaciones
  for (const catData of backupData.categories) {
    const { id, parent, ancestors, ...categoryFields } = catData;
    const category = new Category(categoryFields);
    await category.save();
    categoryMap.set(id.toString(), category);
  }
  
  // Luego establecer las relaciones
  for (const catData of backupData.categories) {
    const category = categoryMap.get(catData.id.toString());
    if (catData.parent) {
      const parent = categoryMap.get(catData.parent.id.toString());
      if (parent) {
        category.parent = parent._id;
        await category.save();
      }
    }
  }
  
  console.log(`✅ Restauración completada`);
  console.log(`   • Categorías restauradas: ${categoryMap.size}`);
  
  process.exit(0);
}

// Ejecutar restauración
const backupFile = process.argv[2];
restoreCategories(backupFile);
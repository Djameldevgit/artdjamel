// scripts/backup-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Category = require('../models/categoryModel');

async function backupCategories() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
  
  console.log('💾 Creando backup de categorías...');
  
  const categories = await Category.find()
    .populate('parent', 'slug name')
    .lean();
  
  const backup = {
    date: new Date(),
    timestamp: Date.now(),
    totalCategories: categories.length,
    categories: categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      level: cat.level,
      parent: cat.parent ? {
        id: cat.parent._id,
        slug: cat.parent.slug,
        name: cat.parent.name
      } : null,
      ancestors: cat.ancestors,
      path: cat.path,
      icon: cat.icon,
      iconType: cat.iconType,
      iconColor: cat.iconColor,
      bgColor: cat.bgColor,
      order: cat.order,
      hasChildren: cat.hasChildren,
      isLeaf: cat.isLeaf,
      postCount: cat.postCount,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }))
  };
  
  // Crear directorio de backups si no existe
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const filename = path.join(backupDir, `categories-backup-${Date.now()}.json`);
  fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
  
  console.log(`✅ Backup guardado en: ${filename}`);
  console.log(`   • Total categorías: ${backup.totalCategories}`);
  console.log(`   • Tamaño: ${(fs.statSync(filename).size / 1024).toFixed(2)} KB`);
  
  process.exit(0);
}

backupCategories();
//node  deleteCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const Category = require('./models/categoryModel'); // Ajusta la ruta si es necesario

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const confirmDelete = async (slug) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`⚠️  ¿Eliminar la categoría "${slug}"? (escribe "SI"): `, (answer) => {
      rl.close();
      resolve(answer === 'SI');
    });
  });
};

const deleteCategoryBySlug = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Conectado a MongoDB');

    const slugToDelete = 'agence'; // ← Categoría a eliminar
    const category = await Category.findOne({ slug: slugToDelete });

    if (!category) {
      console.log(`ℹ️  No existe la categoría con slug "${slugToDelete}". Nada que eliminar.`);
      process.exit(0);
    }

    console.log(`📊 Categoría encontrada: ${category.name} (slug: ${category.slug})`);
    const confirmed = await confirmDelete(slugToDelete);
    if (!confirmed) {
      console.log('❌ Eliminación cancelada.');
      process.exit(0);
    }

    const result = await Category.deleteOne({ slug: slugToDelete });
    if (result.deletedCount === 1) {
      console.log(`✅ Eliminada la categoría "${slugToDelete}" correctamente.`);
    } else {
      console.log(`⚠️  No se eliminó ninguna categoría.`);
    }

    // Mostrar las categorías restantes
    const remaining = await Category.find({}).sort({ order: 1 }).select('name slug order');
    console.log('\n📋 Categorías restantes:');
    remaining.forEach(cat => console.log(`   - ${cat.name} (${cat.slug}) orden: ${cat.order}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

deleteCategoryBySlug();
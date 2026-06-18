// node checkCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

async function checkCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    const categories = await Category.find().sort({ order: 1 });
    
    if (categories.length === 0) {
      console.log('⚠️ NO HAY CATEGORÍAS EN LA BASE DE DATOS');
      console.log('👉 Ejecuta: node seedCategories.js');
    } else {
      console.log(`📋 ${categories.length} categorías encontradas:\n`);
      categories.forEach(cat => {
        console.log(`   ID: ${cat._id}`);
        console.log(`   Nombre: ${cat.name}`);
        console.log(`   Slug: ${cat.slug}`);
        console.log('   ---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCategories();
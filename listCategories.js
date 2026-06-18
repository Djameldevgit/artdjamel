// node listCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel'); // Ajusta la ruta a tu modelo

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/videocommerce';

const listCategories = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const categories = await Category.find({}).lean(); // lean() para objetos planos

    if (categories.length === 0) {
      console.log('⚠️  No hay categorías en la base de datos.');
    } else {
      console.log(`📂 Total de categorías: ${categories.length}\n`);
      categories.forEach((cat, index) => {
        console.log(`[${index + 1}] ${cat.name}`);
        console.log(`    Slug: ${cat.slug}`);
        console.log(`    Image URL: ${cat.imageUrl || 'no definida'}`);
        console.log(`    ID: ${cat._id}`);
        console.log(`    Creado: ${cat.createdAt.toLocaleString() || 'no disponible'}`);
        console.log('---');
      });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listCategories();
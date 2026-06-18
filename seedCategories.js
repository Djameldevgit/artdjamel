// seedCategories.js - Categorías de PINTURA (óleo y técnicas pictóricas)
// Ejecutar: node seedCategories.js

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';
const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// ============ CATEGORÍAS DE PINTURA (ÓLEO, ACUARELA, TEMPLE, ACRÍLICO) ============
const categoriesData = [
  { slug: 'portraits', name: 'Portraits', order: 1, icon: '🎭', isPublic: true },
  { slug: 'paysages', name: 'Paysages', order: 2, icon: '🌄', isPublic: true },
  { slug: 'paysages-locaux', name: 'Paysages locaux', order: 3, icon: '🏞️', isPublic: true },
  { slug: 'marines', name: 'Marines', order: 4, icon: '🌊', isPublic: true },
  { slug: 'natures-mortes', name: 'Natures mortes', order: 5, icon: '🍎', isPublic: true },
   { slug: 'urbain', name: 'Scènes urbaines', order: 8, icon: '🏙️', isPublic: true },
 
  { slug: 'animalier', name: 'Animalier', order: 10, icon: '🐎', isPublic: true },
  { slug: 'floral', name: 'Fleurs & Jardins', order: 11, icon: '🌻', isPublic: true },
 
];

// Colores para UI
const categoryColors = {
  'portraits': '#D96C6C',
  'paysages': '#6C9ED9',
  'paysages-locaux': '#6CAED9',
  'marines': '#2F8FBD',
  'natures-mortes': '#B88A3D',
  'abstrait': '#B565A7',
  'figuratif': '#E68A2E',
  'urbain': '#7D6B5E',
  'scenes-de-genre': '#A3A847',
  'animalier': '#A56947',
  'floral': '#E88D4D',
  'nus': '#D98695',
  'religieux': '#8B5A2B',
  'mythologique': '#6C3483',
  'allegorique': '#1F7A8C',
  'architecture': '#5D6D7E',
  'interieurs': '#C39D63'
};

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Conectado a MongoDB');
    console.log('📂 Base de datos:', mongoose.connection.db.databaseName);

    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️ Eliminadas ${deleteResult.deletedCount} categorías anteriores`);

    let created = 0;
    for (const cat of categoriesData) {
      const categoryData = {
        name: cat.name,
        slug: cat.slug,
        nameFr: cat.name,
        nameAr: cat.name,
        imageUrl: `/categories/${cat.slug}/${cat.slug}.png`,
        order: cat.order,
        isActive: true,
        icon: cat.icon,
        iconColor: categoryColors[cat.slug] || '#666666',
        bgColor: `${categoryColors[cat.slug] || '#666666'}15`,
        videoCount: 0,
        isPublic: cat.isPublic !== undefined ? cat.isPublic : true,
        isAdminOnly: false,
        isSpecial: false,
        specialType: null,
        priority: 'normal'
      };
      const newCat = new Category(categoryData);
      await newCat.save();
      created++;
      console.log(`✅ [${cat.order}] CREADA: ${cat.name} (${cat.slug})`);
    }

    console.log(`\n📊 Resumen: ${created} categorías pictóricas creadas.`);
    const allCategories = await Category.find({ isActive: true }).sort({ order: 1 }).select('name slug order').lean();
    console.log('\n📋 TEMAS DE PINTURA (óleo, acrílico, etc.):');
    allCategories.forEach((cat, idx) => {
      console.log(`   ${idx + 1}. ${cat.name} (${cat.slug})`);
    });

    console.log('\n🎨 Seed completado. Ahora puedes subir videos de tus óleos en estas categorías.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedCategories();
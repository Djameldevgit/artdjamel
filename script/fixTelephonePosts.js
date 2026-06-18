// 📂 node scriptTelephone/fixTelephonePosts.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

console.log('🔌 Conectando a MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ Error de conexión:', error);
  process.exit(1);
});

db.once('open', async () => {
  console.log('✅ Conectado a MongoDB\n');
  
  try {
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');
    
    // 1. Encontrar la categoría telephone nivel 1
    const telephoneCategory = await Category.findOne({ 
      slug: 'telephone',
      level: 1
    }).lean();
    
    if (!telephoneCategory) {
      console.error('❌ No se encontró la categoría telephone nivel 1');
      process.exit(1);
    }
    
    console.log(`📱 Categoría telephone encontrada:`);
    console.log(`   _id: ${telephoneCategory._id}`);
    console.log(`   name: ${telephoneCategory.name}`);
    console.log(`   slug: ${telephoneCategory.slug}\n`);
    
    // 2. Buscar posts con categorie "telephone" pero category incorrecto
    const telephonePosts = await Post.find({ 
      categorie: 'telephone'
    }).lean();
    
    console.log(`📝 Posts encontrados con categorie "telephone": ${telephonePosts.length}\n`);
    
    telephonePosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} - current category: ${post.category}`);
    });
    
    // 3. Preguntar antes de actualizar
    console.log('\n⚠️  ¿Quieres actualizar estos posts para que usen el category ID correcto?');
    console.log(`   Nuevo category ID: ${telephoneCategory._id}`);
    console.log('\n   Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. Actualizar los posts
    const result = await Post.updateMany(
      { categorie: 'telephone' },
      { $set: { category: telephoneCategory._id } }
    );
    
    console.log(`\n✅ Actualizados ${result.modifiedCount} posts con category correcto`);
    
    // 5. Verificar el resultado
    const updatedPosts = await Post.find({ 
      categorie: 'telephone' 
    }).lean();
    
    console.log('\n📝 Posts después de la actualización:');
    updatedPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} - category: ${post.category} (${post.category === telephoneCategory._id ? '✅ CORRECTO' : '❌ INCORRECTO'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n🔌 Cerrando conexión...');
    await mongoose.disconnect();
    process.exit(0);
  }
});
// 📂  node  scriptTelephone/checkTelephonePosts.js

const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

console.log('🔌 Conectando a MongoDB...');
console.log(`📡 URI: ${MONGODB_URI}`);

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
    // ============ 1. BUSCAR LA CATEGORÍA TELEPHONE ============
    console.log('🔍 ============ 1. BUSCANDO CATEGORÍA TELEPHONE ============\n');
    
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');
    
    // Buscar categoría telephone por slug
    const telephoneBySlug = await Category.findOne({ slug: 'telephone' }).lean();
    const telephoneByName = await Category.findOne({ name: { $regex: 'telephone', $options: 'i' } }).lean();
    const allTelephoneCats = await Category.find({ 
      $or: [
        { slug: { $regex: 'telephone', $options: 'i' } },
        { name: { $regex: 'telephone', $options: 'i' } }
      ]
    }).lean();
    
    console.log('📱 Categoría por slug "telephone":', telephoneBySlug ? {
      _id: telephoneBySlug._id,
      name: telephoneBySlug.name,
      slug: telephoneBySlug.slug,
      level: telephoneBySlug.level
    } : '❌ No encontrada');
    
    console.log('\n📱 Categoría por nombre (regex):', telephoneByName ? {
      _id: telephoneByName._id,
      name: telephoneByName.name,
      slug: telephoneByName.slug
    } : '❌ No encontrada');
    
    console.log('\n📱 Todas las categorías con "telephone" en nombre/slug:', allTelephoneCats.map(cat => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      level: cat.level
    })));
    
    // ============ 2. BUSCAR POSTS CON TÍTULOS "Hhh" o "Yhh" ============
    console.log('\n\n🔍 ============ 2. BUSCANDO POSTS CON TÍTULOS "Hhh" o "Yhh" ============\n');
    
    const postsWithHhh = await Post.find({ 
      title: { $in: ['Hhh', 'Yhh', 'hjhj'] }
    }).lean();
    
    console.log(`📝 Posts encontrados con títulos Hhh/Yhh: ${postsWithHhh.length}`);
    
    postsWithHhh.forEach((post, index) => {
      console.log(`\n--- Post ${index + 1} ---`);
      console.log(`📌 _id: ${post._id}`);
      console.log(`📌 title: ${post.title}`);
      console.log(`📌 categorie: "${post.categorie || 'NO DEFINIDO'}"`);
      console.log(`📌 subCategory: "${post.subCategory || 'NO DEFINIDO'}"`);
      console.log(`📌 articleType: "${post.articleType || 'NO DEFINIDO'}"`);
      console.log(`📌 category (ObjectId): ${post.category || 'NO DEFINIDO'}`);
      console.log(`📌 price: ${post.price}`);
      console.log(`📌 isFromBoutique: ${post.isFromBoutique}`);
      console.log(`📌 boutique: ${post.boutique || 'NO'}`);
      console.log(`📌 wilaya: ${post.wilaya}`);
      console.log(`📌 createdAt: ${post.createdAt}`);
    });
    
    // ============ 3. BUSCAR TODOS LOS POSTS ============
    console.log('\n\n🔍 ============ 3. TODOS LOS POSTS EN LA BD ============\n');
    
    const allPosts = await Post.find({}).limit(20).lean();
    console.log(`📊 Total de posts en BD: ${await Post.countDocuments()}`);
    console.log(`📊 Mostrando primeros 20 posts:\n`);
    
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. [${post._id}] ${post.title} - categorie: "${post.categorie}" - category: ${post.category}`);
    });
    
    // ============ 4. BUSCAR POSTS CON CATEGORÍA TELEPHONE ============
    console.log('\n\n🔍 ============ 4. BUSCANDO POSTS EN CATEGORÍA TELEPHONE ============\n');
    
    let telephoneCatId = null;
    if (telephoneBySlug) {
      telephoneCatId = telephoneBySlug._id;
    } else if (telephoneByName) {
      telephoneCatId = telephoneByName._id;
    } else if (allTelephoneCats.length > 0) {
      telephoneCatId = allTelephoneCats[0]._id;
    }
    
    if (telephoneCatId) {
      console.log(`🎯 Usando category ID: ${telephoneCatId}`);
      
      const postsByCategoryId = await Post.find({ category: telephoneCatId }).lean();
      console.log(`\n📝 Posts con category = ${telephoneCatId}: ${postsByCategoryId.length}`);
      
      postsByCategoryId.forEach((post, index) => {
        console.log(`\n--- Post ${index + 1} ---`);
        console.log(`📌 title: ${post.title}`);
        console.log(`📌 categorie: "${post.categorie}"`);
        console.log(`📌 subCategory: "${post.subCategory}"`);
      });
      
      const postsByCategorieName = await Post.find({ 
        categorie: { $regex: 'telephone', $options: 'i' } 
      }).lean();
      
      console.log(`\n📝 Posts con categorie conteniendo "telephone": ${postsByCategorieName.length}`);
      
      postsByCategorieName.forEach((post, index) => {
        console.log(`\n--- Post ${index + 1} ---`);
        console.log(`📌 title: ${post.title}`);
        console.log(`📌 categorie: "${post.categorie}"`);
        console.log(`📌 subCategory: "${post.subCategory}"`);
      });
    } else {
      console.log('❌ No se encontró ninguna categoría telephone');
    }
    
    // ============ 5. VERIFICAR SUB-CATEGORÍAS ============
    console.log('\n\n🔍 ============ 5. VERIFICANDO ESTRUCTURA DE CATEGORÍAS ============\n');
    
    const allLevel1Categories = await Category.find({ level: 1 }).lean();
    console.log('📁 Categorías nivel 1:');
    allLevel1Categories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug}, _id: ${cat._id})`);
    });
    
    // ============ 6. VERIFICAR POSTS DE BOUTIQUES ============
    console.log('\n\n🔍 ============ 6. POSTS DE BOUTIQUES ============\n');
    
    const boutiquePosts = await Post.find({ isFromBoutique: true }).limit(10).lean();
    console.log(`📊 Posts de boutiques: ${boutiquePosts.length}`);
    
    boutiquePosts.forEach((post, index) => {
      console.log(`\n--- Boutique Post ${index + 1} ---`);
      console.log(`📌 title: ${post.title}`);
      console.log(`📌 categorie: "${post.categorie}"`);
      console.log(`📌 boutique: ${post.boutique}`);
    });
    
  } catch (error) {
    console.error('❌ Error en la consulta:', error);
  } finally {
    console.log('\n\n🔌 Cerrando conexión...');
    await mongoose.disconnect();
    process.exit(0);
  }
});
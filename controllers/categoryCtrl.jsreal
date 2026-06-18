const Category = require('../models/categoryModel');
const Post = require('../models/postModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// 🧠 Caché simple
let cacheCategoriasPrincipales = null;
let cacheCategoriasPrincipalesEn = 0;
let cacheEstadisticas = null;
let cacheEstadisticasEn = 0;

const obtenerCategoriasPrincipales = asyncHandler(async (req, res) => {
  const incluirPosts = req.query.posts === 'true';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  const ahora = Date.now();

  // 🚫 IMPORTANTE: desactivar cache con paginación (o hacer cache por page)
  if (!page || page === 1) {
    if (
      incluirPosts &&
      cacheCategoriasPrincipales &&
      ahora - cacheCategoriasPrincipalesEn < 60 * 1000
    ) {
      return res.json(cacheCategoriasPrincipales);
    }
  }

  // 1️⃣ Total de categorías nivel 1
  const totalCategories = await Category.countDocuments({
    level: 1,
    isActive: true,
  });

  // 2️⃣ Categorías paginadas 🔥
  const nivel1 = await Category.find({ level: 1, isActive: true })
    .select('_id name slug icon emoji order hasChildren postCount')
    .sort({ order: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // 3️⃣ Cargar TODAS las de nivel 2 y 3 (para mantener tu lógica)
  const [nivel2, nivel3] = await Promise.all([
    Category.find({ level: 2, isActive: true })
      .select('_id name slug parent emoji order hasChildren isLeaf')
      .sort({ order: 1 })
      .lean(),

    Category.find({ level: 3, isActive: true })
      .select('_id name slug parent emoji order isLeaf')
      .sort({ order: 1 })
      .lean(),
  ]);

  // ================= TU LÓGICA ORIGINAL (SIN CAMBIOS) =================

  const nivel3PorPadre = {};
  for (let i = 0; i < nivel3.length; i++) {
    const cat = nivel3[i];
    const idPadre = String(cat.parent);

    if (!nivel3PorPadre[idPadre]) {
      nivel3PorPadre[idPadre] = [];
    }
    nivel3PorPadre[idPadre].push(cat);
  }

  for (let i = 0; i < nivel2.length; i++) {
    const subcat = nivel2[i];
    const clave = String(subcat._id);

    subcat.children = nivel3PorPadre[clave] || [];
    subcat.hasChildren = subcat.children.length > 0;
  }

  const nivel2PorPadre = {};
  for (let i = 0; i < nivel2.length; i++) {
    const subcat = nivel2[i];
    const idPadre = String(subcat.parent);

    if (!nivel2PorPadre[idPadre]) {
      nivel2PorPadre[idPadre] = [];
    }
    nivel2PorPadre[idPadre].push(subcat);
  }

  for (let i = 0; i < nivel1.length; i++) {
    const cat = nivel1[i];
    const clave = String(cat._id);

    cat.children = nivel2PorPadre[clave] || [];
    cat.hasChildren = cat.children.length > 0;
  }

  // ================= POSTS =================

  if (incluirPosts) {
    const todosIds = []
      .concat(nivel1.map(c => c._id))
      .concat(nivel2.map(c => c._id))
      .concat(nivel3.map(c => c._id));

    const posts = await Post.find({
      category: { $in: todosIds },
      $or: [{ isActive: true }, { status: 'active' }],
    })
      .sort({ createdAt: -1 })
      .limit(300)
      .select('_id title price images category createdAt')
      .lean();

    const postsMap = {};

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const key = String(post.category);

      if (!postsMap[key]) {
        postsMap[key] = [];
      }

      if (postsMap[key].length < 8) {
        postsMap[key].push(post);
      }
    }

    for (let i = 0; i < nivel3.length; i++) {
      const cat = nivel3[i];
      cat.posts = postsMap[String(cat._id)] || [];
    }

    for (let i = 0; i < nivel2.length; i++) {
      const cat = nivel2[i];
      const hijosPosts = [];

      for (let j = 0; j < cat.children.length; j++) {
        hijosPosts.push(...(cat.children[j].posts || []));
      }

      cat.posts = (postsMap[String(cat._id)] || [])
        .concat(hijosPosts)
        .slice(0, 8);
    }

    for (let i = 0; i < nivel1.length; i++) {
      const cat = nivel1[i];
      const hijosPosts = [];

      for (let j = 0; j < cat.children.length; j++) {
        hijosPosts.push(...(cat.children[j].posts || []));
      }

      cat.posts = (postsMap[String(cat._id)] || [])
        .concat(hijosPosts)
        .slice(0, 8);
    }
  }

  // ================= RESPUESTA CON PAGINACIÓN 🔥 =================

  const totalPages = Math.ceil(totalCategories / limit);

  const respuesta = {
    success: true,
    categories: nivel1,
    pagination: {
      currentPage: page,
      totalPages,
      totalCategories,
      hasMore: page < totalPages,
    },
  };

  return res.json(respuesta);
});
 

const obtenerCategoriasParaSlider = asyncHandler(async (req, res) => {
  try {
    console.log('🎠 Obteniendo categorías para slider...');
    
    // Obtener TODAS las categorías nivel 1 (sin paginación)
    const categoriasSlider = await Category.find({ level: 1, isActive: true })
      .select('_id name slug icon emoji order')
      .sort({ order: 1 })
      .lean();
    
    console.log(`🎠 Slider: ${categoriasSlider.length} categorías encontradas`);
    
    res.json({
      success: true,
      categories: categoriasSlider,
      total: categoriasSlider.length
    });
    
  } catch (error) {
    console.error('❌ Error en obtenerCategoriasParaSlider:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar categorías para slider',
      error: error.message
    });
  }
});

 // 📂 controllers/categoryController.js

// 📂 controllers/categoryController.js
// 📂 controllers/categoryCtrl.js - AGREGAR NUEVO CONTROLADOR

/**
 * GET /api/categories/:slug/metadata
 * Obtiene SOLO metadata para filtros (wilayas, priceRange, children)
 * SIN MODIFICAR el estado de posts en Redux
 */
 const getCategoryMetadata = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const { sub: subSlug, article: articleSlug } = req.query;

    console.log('📡 getCategoryMetadata - Parámetros:', { slug, subSlug, articleSlug });

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere slug de categoría'
      });
    }

    // 1. Buscar la categoría principal
    let mainCategory = await Category.findOne({ slug, isActive: true }).lean();
    
    if (!mainCategory) {
      console.log(`❌ Categoría no encontrada: ${slug}`);
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si la categoría no es nivel 1, buscar su raíz
    let level1Category = mainCategory;
    if (mainCategory.level !== 1) {
      let parent = mainCategory.parent;
      while (parent) {
        const parentCat = await Category.findById(parent).lean();
        if (parentCat && parentCat.level === 1) {
          level1Category = parentCat;
          break;
        }
        parent = parentCat.parent;
      }
    }

    console.log(`✅ Categoría base: ${level1Category.name} (level: ${level1Category.level})`);

    // 2. Obtener subcategorías (nivel 2)
    const subCategories = await Category.find({ 
      parent: level1Category._id, 
      level: 2, 
      isActive: true 
    })
      .select('_id name slug parent icon emoji order')
      .sort({ order: 1 })
      .lean();

    // 3. Obtener artículos (nivel 3)
    const articles = await Category.find({ 
      level: 3, 
      isActive: true 
    })
      .select('_id name slug parent icon emoji order')
      .sort({ order: 1 })
      .lean();

    // 4. Construir estructura jerárquica para children
    const articlesByParent = {};
    articles.forEach(article => {
      const parentId = String(article.parent);
      if (!articlesByParent[parentId]) {
        articlesByParent[parentId] = [];
      }
      articlesByParent[parentId].push({
        _id: article._id,
        name: article.name,
        slug: article.slug,
        level: article.level,
        icon: article.icon || '📄',
        postCount: article.postCount || 0
      });
    });

    const childrenWithArticles = subCategories.map(child => ({
      _id: child._id,
      name: child.name,
      slug: child.slug,
      level: child.level,
      icon: child.icon || '📦',
      postCount: child.postCount || 0,
      articles: articlesByParent[String(child._id)] || []
    }));

    // 5. Obtener metadata de filtros (sin afectar posts)
    // Construir query base para obtener rangos
    let baseFilter = {
      isActive: true,
      $or: [
        { category: level1Category._id },
        { categorie: { $regex: new RegExp(level1Category.name, 'i') } }
      ]
    };

    // Si hay subSlug, filtrar por esa subcategoría para los rangos
    if (subSlug) {
      const subCategory = subCategories.find(s => s.slug === subSlug);
      if (subCategory) {
        baseFilter.subCategory = subCategory.slug;
        
        if (articleSlug) {
          const article = articles.find(a => a.slug === articleSlug);
          if (article) {
            baseFilter.articleType = article.slug;
          }
        }
      }
    }

    // Obtener wilayas únicas
    const wilayas = await Post.distinct('wilaya', {
      ...baseFilter,
      wilaya: { $ne: null, $ne: '' }
    }).lean();

    // Obtener rango de precios
    const priceStats = await Post.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 1000000 };

    // 6. Respuesta SOLO con metadata
    res.json({
      success: true,
      children: childrenWithArticles,
      filterMetadata: {
        wilayas: wilayas.filter(w => w && w !== ''),
        priceRange: {
          min: priceRange.minPrice || 0,
          max: priceRange.maxPrice || 1000000
        },
        communes: [], // Puedes agregar communes si las necesitas
        appliedFilters: {
          sub: subSlug || null,
          article: articleSlug || null
        }
      },
      categoryInfo: {
        _id: level1Category._id,
        name: level1Category.name,
        slug: level1Category.slug,
        level: level1Category.level,
        emoji: level1Category.emoji || ''
      }
    });

  } catch (error) {
    console.error('❌ Error en getCategoryMetadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadata de la categoría',
      error: error.message
    });
  }
});
const getPostsByCategory = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // ============ PARÁMETROS ============
    const {
      sub: subSlug,
      article: articleSlug,
      wilaya,
      commune,
      minPrice,
      maxPrice,
      sortBy = 'recent'
    } = req.query;

    const { slug } = req.params;

    console.log('🔍 getPostsByCategory - Parámetros:', {
      slug,
      subSlug,
      articleSlug,
      page,
      limit,
      wilaya,
      commune,
      minPrice,
      maxPrice,
      sortBy
    });

    if (!slug) {
      return res.json({
        success: true,
        posts: [],
        total: 0,
        page,
        hasMore: false,
        message: 'Se requiere categoría'
      });
    }

    // 1. Buscar la categoría (puede ser nivel 1, 2 o 3)
    let categoryDoc = await Category.findOne({
      slug: slug,
      isActive: true
    }).lean();

    if (!categoryDoc) {
      console.log(`❌ Categoría no encontrada: ${slug}`);
      return res.json({
        success: true,
        posts: [],
        total: 0,
        page,
        hasMore: false,
        message: 'Categoría no encontrada'
      });
    }

    console.log(`✅ Categoría encontrada: ${categoryDoc.name} (level: ${categoryDoc.level})`);

    // 2. Obtener la categoría nivel 1 (para el filtro base)
    let level1Category = categoryDoc;
    if (categoryDoc.level !== 1) {
      // Buscar la categoría raíz
      let parent = categoryDoc.parent;
      while (parent) {
        const parentCat = await Category.findById(parent).lean();
        if (parentCat.level === 1) {
          level1Category = parentCat;
          break;
        }
        parent = parentCat.parent;
      }
    }

    // 3. Obtener todas las subcategorías y artículos
    const [allSubCategories, allArticles] = await Promise.all([
      Category.find({ parent: level1Category._id, level: 2, isActive: true }).lean(),
      Category.find({ level: 3, isActive: true }).lean()
    ]);

    // 4. FILTRO BASE
    let filter = {
      isActive: true,
      $and: [
        {
          $or: [
            { isFromBoutique: { $ne: true } },
            { isFromBoutique: { $exists: false } }
          ]
        },
        {
          $or: [
            { category: level1Category._id },
            { categorie: { $regex: new RegExp(level1Category.name, 'i') } }
          ]
        }
      ]
    };

    let andConditions = [];

    // ============ FILTROS DE NAVEGACIÓN (slider) ============
    // Si hay subSlug, filtrar por esa subcategoría
    if (subSlug) {
      const subCategoryDoc = allSubCategories.find(
        sub => sub.slug === subSlug || sub.name.toLowerCase() === subSlug.toLowerCase()
      );

      if (subCategoryDoc) {
        const articlesOfSub = allArticles.filter(
          article => String(article.parent) === String(subCategoryDoc._id)
        );

        const searchSlugs = [
          subCategoryDoc.slug,
          ...articlesOfSub.map(a => a.slug)
        ];

        andConditions.push({
          $or: [
            { subCategory: { $in: searchSlugs } },
            { articleType: { $in: searchSlugs } }
          ]
        });
      } else {
        // Si no se encuentra, buscar por slug directamente
        andConditions.push({
          $or: [
            { subCategory: subSlug },
            { articleType: subSlug }
          ]
        });
      }
    }

    // Si hay articleSlug, filtrar por ese artículo
    if (articleSlug) {
      const articleDoc = allArticles.find(
        article => article.slug === articleSlug || article.name.toLowerCase() === articleSlug.toLowerCase()
      );

      if (articleDoc) {
        andConditions.push({
          $or: [
            { subCategory: articleDoc.slug },
            { articleType: articleDoc.slug }
          ]
        });
      } else {
        andConditions.push({
          $or: [
            { subCategory: articleSlug },
            { articleType: articleSlug }
          ]
        });
      }
    }

    // ============ FILTROS DE UBICACIÓN ============
    if (wilaya && wilaya !== '') {
      andConditions.push({
        $or: [
          { 'location.wilaya': wilaya },
          { wilaya: wilaya }
        ]
      });
    }

    if (commune && commune !== '') {
      andConditions.push({
        $or: [
          { 'location.commune': new RegExp(commune, 'i') },
          { commune: new RegExp(commune, 'i') }
        ]
      });
    }

    // ============ FILTROS DE PRECIO ============
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      andConditions.push({ price: { $gte: Number(minPrice) } });
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      andConditions.push({ price: { $lte: Number(maxPrice) } });
    }

    // Combinar condiciones
    if (andConditions.length > 0) {
      filter.$and = [...filter.$and, ...andConditions];
    }

    // ============ ORDENAMIENTO ============
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'annee_desc':
        sort = { annee: -1 };
        break;
      case 'annee_asc':
        sort = { annee: 1 };
        break;
      case 'kilometrage_asc':
        sort = { kilometrage: 1 };
        break;
      case 'score':
        sort = { score: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sort = { createdAt: -1 };
        break;
    }

    console.log('📡 Filtro final:', JSON.stringify(filter, null, 2));

    // 5. Ejecutar consulta
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('_id title price images createdAt wilaya commune description etat views categorie subCategory articleType category location score')
        .populate('user', 'username avatar')
        .lean(),
      Post.countDocuments(filter)
    ]);

    const hasMore = page * limit < total;
    const totalPages = Math.ceil(total / limit);

    console.log(`✅ Posts encontrados: ${posts.length}, total: ${total}, hasMore: ${hasMore}, página: ${page}/${totalPages}`);

    // 6. Preparar slider con subcategorías y artículos
    const childrenWithArticles = allSubCategories.map(child => ({
      _id: child._id,
      name: child.name,
      slug: child.slug,
      level: child.level,
      icon: child.icon || '📦',
      iconType: child.iconType || 'emoji',
      iconColor: child.iconColor || '#667eea',
      bgColor: child.bgColor || '#f0f3ff',
      postCount: child.postCount || 0,
      articles: allArticles
        .filter(a => String(a.parent) === String(child._id))
        .map(article => ({
          _id: article._id,
          name: article.name,
          slug: article.slug,
          level: article.level,
          icon: article.icon || '📄',
          iconType: article.iconType || 'emoji',
          iconColor: article.iconColor || '#667eea',
          bgColor: article.bgColor || '#f0f3ff',
          postCount: article.postCount || 0
        })),
      isLeaf: false
    }));

    // 7. Respuesta
    res.json({
      success: true,
      posts,
      total,
      page,
      limit,
      hasMore,
      totalPages,
      categoryInfo: {
        _id: categoryDoc._id,
        name: categoryDoc.name,
        slug: categoryDoc.slug,
        level: categoryDoc.level,
        emoji: categoryDoc.emoji || ''
      },
      children: childrenWithArticles,
      filterMetadata: {
        appliedFilters: {
          sub: subSlug || null,
          article: articleSlug || null,
          wilaya: wilaya || null,
          commune: commune || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en getPostsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los posts',
      error: error.message
    });
  }
});

 
const obtenerCategoriaPorId = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const incluirHijos = req.query.children === 'true' || req.query.children === 'deep';
  const incluirHijosProfundo = req.query.children === 'deep';
  const incluirPosts = req.query.posts === 'true';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const query = mongoose.Types.ObjectId.isValid(identifier) ? { _id: identifier } : { slug: identifier };
  const categoria = await Category.findOne(query).lean();
  if (!categoria) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });

  const datosRespuesta = { ...categoria };

  // Hijos directos
  if (incluirHijos && categoria.hasChildren) {
    datosRespuesta.children = await getChildren(categoria._id);
    if (incluirHijosProfundo) {
      for (let i = 0; i < datosRespuesta.children.length; i++) {
        const ch = datosRespuesta.children[i];
        ch.hasChildren = await Category.exists({ parent: ch._id });
      }
    }
  }

  // Posts con paginación
  if (incluirPosts) {
    let todasCategoriasIds = [categoria._id];

    if (categoria.level === 1) {
      const nivel2 = await getChildren(categoria._id, 2);
      const nivel2Ids = nivel2.map(c => c._id);
      const nivel3 = await Category.find({ parent: { $in: nivel2Ids }, level: 3 }).lean();
      todasCategoriasIds = [...todasCategoriasIds, ...nivel2Ids, ...nivel3.map(c => c._id)];
    } else if (categoria.level === 2) {
      const nivel3 = await getChildren(categoria._id, 3);
      todasCategoriasIds = [...todasCategoriasIds, ...nivel3.map(c => c._id)];
    }

    const { posts, total, hasMore } = await getPostsByCategoryIds(todasCategoriasIds, limit, page);
    datosRespuesta.posts = posts;
    datosRespuesta.hasMore = hasMore;
    datosRespuesta.total = total;
    datosRespuesta.postsPagination = { currentPage: page, limit };
  }

  // Ancestros
  if (categoria.ancestors && categoria.ancestors.length > 0) {
    datosRespuesta.ancestors = await Category.find({ _id: { $in: categoria.ancestors } })
      .select('name slug level icon iconType iconColor bgColor')
      .sort({ level: 1 })
      .lean();
  }

  res.json({ success: true, category: datosRespuesta, children: datosRespuesta.children || [], posts: datosRespuesta.posts || [] });
});

 
const obtenerArbolDeCategorias = asyncHandler(async (req, res) => {
  const todas = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  const mapa = {};
  todas.forEach(cat => (mapa[String(cat._id)] = { ...cat, children: [] }));

  const raices = [];
  todas.forEach(cat => {
    if (cat.parent && mapa[String(cat.parent)]) {
      mapa[String(cat.parent)].children.push(mapa[String(cat._id)]);
    } else {
      raices.push(mapa[String(cat._id)]);
    }
  });

  res.json({ success: true, tree: raices, totalLevels: 3 });
});

 
const buscarCategorias = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const categorias = await Category.aggregate([
    { $match: { isLeaf: true, $or: [{ name: { $regex: query, $options: 'i' } }, { slug: { $regex: query, $options: 'i' } }] } },
    { $lookup: { from: 'posts', localField: '_id', foreignField: 'category', as: 'posts' } },
    { $project: { name: 1, slug: 1, emoji: 1, level: 1, postCount: { $size: '$posts' } } },
    { $limit: limit }
  ]);

  res.json({ success: true, categories: categorias, totalResults: categorias.length });
});

// 📂 controllers/categoryController.js - ACTUALIZAR getCategoriesForAccordion
// 📂 controllers/categoryController.js - ACTUALIZAR getCategoriesForAccordion
const getCategoriesForAccordion = asyncHandler(async (req, res) => {
  try {
    console.log('🔄 Obteniendo categorías para accordion...');
    
    // Obtener TODAS las categorías con level y parent
    const categories = await Category.find({ isActive: true })
      .select('_id name slug emoji parent level icon description') // AÑADIR level
      .lean();
    
    console.log(`📊 Total categorías encontradas: ${categories.length}`);
    
    // DEBUG: Verificar que tenemos level
    console.log('🔍 Verificando niveles de categorías:');
    categories.slice(0, 5).forEach(cat => {
      console.log(`- ${cat.name}: level=${cat.level}, parent=${cat.parent}`);
    });
    
    // Crear mapa para acceso rápido
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id] = { ...cat, children: [] };
    });
    
    // Construir jerarquía
    const hierarchy = [];
    
    // 1. Agregar nivel 1 (sin parent)
    const level1Categories = categories.filter(cat => cat.level === 1);
    level1Categories.forEach(cat => {
      hierarchy.push(categoryMap[cat._id]);
    });
    
    // 2. Agregar nivel 2 a sus padres
    const level2Categories = categories.filter(cat => cat.level === 2);
    level2Categories.forEach(cat => {
      if (cat.parent && categoryMap[cat.parent]) {
        categoryMap[cat.parent].children.push(categoryMap[cat._id]);
      }
    });
    
    // 3. Agregar nivel 3 a sus padres
    const level3Categories = categories.filter(cat => cat.level === 3);
    level3Categories.forEach(cat => {
      if (cat.parent && categoryMap[cat.parent]) {
        // Encontrar el padre (nivel 2)
        const parentCat = categoryMap[cat.parent];
        if (parentCat) {
          parentCat.children.push(categoryMap[cat._id]);
        }
      }
    });
    
    // Verificar estructura
    console.log('📋 Estructura resultante:');
    hierarchy.forEach((cat, i) => {
      console.log(`[${i}] ${cat.name} (level: ${cat.level}) - Hijos: ${cat.children.length || 0}`);
    });
    
    res.json({ 
      success: true, 
      categories: hierarchy,
      total: hierarchy.length,
      message: `Categorías cargadas: ${hierarchy.length} principales`
    });
    
  } catch (error) {
    console.error('❌ Error en getCategoriesForAccordion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar categorías',
      error: error.message
    });
  }
});

const obtenerEstadisticasDeCategorias = asyncHandler(async (req, res) => {
  const ahora = Date.now();
  if (cacheEstadisticas && ahora - cacheEstadisticasEn < 10 * 60 * 1000) return res.json(cacheEstadisticas);

  const [totalCategorias, totalPrincipales, totalSubcategorias, totalArticulos] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({ level: 1 }),
    Category.countDocuments({ level: 2 }),
    Category.countDocuments({ level: 3 })
  ]);

  const categoriasPopulares = await Category.aggregate([
    { $match: { isLeaf: true } },
    { $lookup: { from: 'posts', localField: '_id', foreignField: 'category', as: 'posts' } },
    { $project: { name: 1, slug: 1, emoji: 1, postCount: { $size: '$posts' } } },
    { $sort: { postCount: -1 } },
    { $limit: 10 }
  ]);

  const respuesta = {
    success: true,
    stats: { totalCategorias, totalPrincipales, totalSubcategorias, totalArticulos, categoriasPopulares }
  };

  cacheEstadisticas = respuesta;
  cacheEstadisticasEn = ahora;

  res.json(respuesta);
});

module.exports = {
  obtenerCategoriasParaSlider,
  obtenerCategoriasPrincipales,
  obtenerCategoriaPorId,
  obtenerArbolDeCategorias,
  buscarCategorias,
  obtenerEstadisticasDeCategorias,
  getCategoriesForAccordion,
  getPostsByCategory,
  getCategoryMetadata

};

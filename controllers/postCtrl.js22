const Post = require('../models/postModel');
const Category = require('../models/categoryModel');
const Users = require('../models/userModel');
 
const Comments = require('../models/commentModel');
const mongoose = require('mongoose');
// ❌ ELIMINAR esta importación
// const buildTitleByCategory = require('../utils/titleCategory');

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginating() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: 'dfjipgj2o',
  api_key: '213981915435275',
  api_secret: 'wv_IiCM9zzhdiWDNXXo8HZi7wX4'
});

const postCtrl = {
  // 📂 createPost - Versión simplificada
  createPost: async (req, res) => {
    try {
      const userId = req.user._id;

      const {
        categorie,
        subCategory,
        articleType,
        title,        // ✅ EL TÍTULO YA VIENE DEL CLIENTE (generado)
        wilaya,
        commune,
        images,
        categorySpecificData
      } = req.body;

      // 🔎 Validación mínima
      if (!categorie || !subCategory || !wilaya || !commune || !images) {
        return res.status(400).json({
          msg: "Champs requis manquants"
        });
      }

      // ✅ VALIDAR QUE EL TÍTULO EXISTA (ya viene del cliente)
      if (!title || title.trim() === "") {
        return res.status(400).json({
          msg: "Le titre est requis"
        });
      }

      // 🔎 Buscar categoría real
      const category = await Category.findOne({
        $or: [
          { slug: categorie },
          { slug: subCategory }
        ],
        isActive: true
      }).select('_id').lean();

      if (!category) {
        return res.status(404).json({
          msg: "Catégorie non trouvée"
        });
      }

      // 🧾 Construcción del post
      const postData = {
        user: userId,
        categorie: categorie.trim(),
        subCategory: subCategory.trim(),
        articleType: (articleType || "").trim(),
        category: category._id,
        title: title.trim(),  // ✅ Usar el título que viene del cliente
        description: (req.body.description || "").trim(),
        price: parseFloat(req.body.price) || 0,
        etat: req.body.etat || "occasion",
        wilaya: wilaya.toString().trim(),
        commune: commune.toString().trim(),
        phone: (req.body.phone || "").trim(),
        email: (req.body.email || "").trim().toLowerCase(),
        address: (req.body.address || "").trim(),
        images: images,
        categorySpecificData: categorySpecificData || {}
      };

      // 💾 Guardar post
      const newPost = new Post(postData);
      await newPost.save();

      // 📊 actualizar contador categoría
      Category.findByIdAndUpdate(
        category._id,
        { $inc: { postCount: 1 } }
      ).catch(() => {});

      // 🚀 respuesta rápida
      res.status(201).json({
        success: true,
        newPost: {
          _id: newPost._id,
          title: newPost.title,
          images: newPost.images,
          user: {
            _id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
          }
        }
      });

    } catch (err) {
      console.error("❌ createPost error:", err.message);
      res.status(500).json({
        msg: "Erreur serveur"
      });
    }
  },

  filterPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
  
      // ============ PARÁMETROS ============
      const {
        category: categorySlug,
        sub: subSlug,
        article: articleSlug,
        wilaya,
        commune,
        minPrice,
        maxPrice,
        sortBy = 'recent'
      } = req.query;
  
      if (!categorySlug) {
        return res.json({
          success: true,
          posts: [],
          total: 0,
          page,
          hasMore: false,
          message: 'Se requiere categoría'
        });
      }
  
      // 1. Buscar categoría nivel 1
      const categoryDoc = await Category.findOne({
        slug: categorySlug,
        level: 1,
        isActive: true
      }).lean();
  
      if (!categoryDoc) {
        return res.json({
          success: true,
          posts: [],
          total: 0,
          page,
          hasMore: false,
          message: 'Categoría no encontrada'
        });
      }
  
      // 2. Obtener subcategorías y artículos (para el slider)
      const [allSubCategories, allArticles] = await Promise.all([
        Category.find({ parent: categoryDoc._id, level: 2, isActive: true }).lean(),
        Category.find({ level: 3, isActive: true }).lean()
      ]);
  
      // 3. FILTRO BASE - TODOS los posts de la categoría
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
              { category: categoryDoc._id },
              { categorie: { $regex: new RegExp(categoryDoc.name, 'i') } }
            ]
          }
        ]
      };
  
      let andConditions = [];
  
      // ============ FILTROS DE NAVEGACIÓN (slider) ============
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
        }
      }
  
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
        }
      }
  
      // ============ FILTROS DE UBICACIÓN ============
      if (wilaya) {
        andConditions.push({
          $or: [
            { 'location.wilaya': wilaya },
            { wilaya: wilaya }
          ]
        });
      }
  
      if (commune) {
        andConditions.push({
          $or: [
            { 'location.commune': new RegExp(commune, 'i') },
            { commune: new RegExp(commune, 'i') }
          ]
        });
      }
  
      // ============ FILTROS DE PRECIO ============
      if (minPrice !== undefined || maxPrice !== undefined) {
        let priceFilter = {};
        if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
        andConditions.push({ price: priceFilter });
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
        case 'score': // NUEVO
          sort = { score: -1, createdAt: -1 }; // primero por score, luego recientes
          break;
        case 'recent':
        default:
          sort = { createdAt: -1 };
          break;
      }
  
      // 4. Ejecutar consulta
      const [posts, total] = await Promise.all([
        Post.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('_id title price images createdAt wilaya commune description etat views categorie subCategory articleType category location score')
          .populate('user', 'username avatar')
          .populate('boutique', 'nom_boutique images')
          .lean(),
        Post.countDocuments(filter)
      ]);
  
      // 5. Preparar slider
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
  
      // ============ RESPUESTA ============
      res.json({
        success: true,
        posts,
        total,
        page,
        limit,
        hasMore: page * limit < total,
        totalPages: Math.ceil(total / limit),
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
            wilaya: wilaya || null,
            commune: commune || null,
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
            sortBy
          }
        }
      });
  
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al filtrar posts',
        error: error.message
      });
    }
  },
  /*filterPosts: async (req, res) => {
 try {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 12;
   const skip = (page - 1) * limit;

   // ============ PARÁMETROS EXISTENTES ============
   const { 
     category: categorySlug, 
     sub: subSlug, 
     article: articleSlug,
     
     // ============ NUEVOS PARÁMETROS DE FILTRO (opcionales) ============
     wilaya,
     commune,
     minPrice,
     maxPrice,
     sortBy = 'recent' // recent, price_asc, price_desc
   } = req.query;

   console.log('🔍 filterPosts - Parámetros:', {
     category: categorySlug,
     sub: subSlug,
     article: articleSlug,
     wilaya,
     commune,
     minPrice,
     maxPrice,
     sortBy,
     page, 
     limit
   });

   if (!categorySlug) {
     return res.json({
       success: true,
       posts: [],
       total: 0,
       page,
       hasMore: false,
       message: 'Se requiere categoría'
     });
   }

   // 1. Buscar categoría nivel 1
   const categoryDoc = await Category.findOne({ 
     slug: categorySlug, 
     level: 1, 
     isActive: true 
   }).lean();

   if (!categoryDoc) {
     return res.json({
       success: true,
       posts: [],
       total: 0,
       page,
       hasMore: false,
       message: 'Categoría no encontrada'
     });
   }

   // 2. Obtener subcategorías y artículos (para el slider)
   const [allSubCategories, allArticles] = await Promise.all([
     Category.find({ parent: categoryDoc._id, level: 2, isActive: true }).lean(),
     Category.find({ level: 3, isActive: true }).lean()
   ]);

   // 3. FILTRO BASE - TODOS los posts de la categoría
   let filter = { 
     isActive: true,
     $or: [
       { category: categoryDoc._id },
       { categorie: { $regex: new RegExp(categoryDoc.name, 'i') } }
     ]
   };

   // Array para condiciones $and (para combinar múltiples filtros)
   let andConditions = [];

   // ============ FILTROS DE NAVEGACIÓN (slider) - EXISTENTES ============
   if (subSlug) {
     const subCategoryDoc = allSubCategories.find(
       sub => sub.slug === subSlug || sub.name.toLowerCase() === subSlug.toLowerCase()
     );

     if (subCategoryDoc) {
       console.log('✅ Subcategoría:', subCategoryDoc.name);

       const articlesOfSub = allArticles.filter(
         article => String(article.parent) === String(subCategoryDoc._id)
       );

       const searchSlugs = [
         subCategoryDoc.slug,
         ...articlesOfSub.map(a => a.slug)
       ];

       console.log('🔍 Buscando posts con slugs:', searchSlugs);

       andConditions.push({
         $or: [
           { subCategory: { $in: searchSlugs } },
           { articleType: { $in: searchSlugs } }
         ]
       });
     }
   }

   if (articleSlug) {
     const articleDoc = allArticles.find(
       article => article.slug === articleSlug || article.name.toLowerCase() === articleSlug.toLowerCase()
     );

     if (articleDoc) {
       console.log('✅ Artículo:', articleDoc.name);
       
       andConditions.push({
         $or: [
           { subCategory: articleDoc.slug },
           { articleType: articleDoc.slug }
         ]
       });
     }
   }

   // ============ NUEVOS FILTROS DE UBICACIÓN ============
   if (wilaya) {
     andConditions.push({
       $or: [
         { 'location.wilaya': wilaya },
         { wilaya: wilaya }
       ]
     });
     console.log('📍 Filtrando por wilaya:', wilaya);
   }
   
   if (commune) {
     andConditions.push({
       $or: [
         { 'location.commune': new RegExp(commune, 'i') },
         { commune: new RegExp(commune, 'i') }
       ]
     });
     console.log('📍 Filtrando por commune:', commune);
   }

   // ============ NUEVOS FILTROS DE PRECIO ============
   if (minPrice !== undefined || maxPrice !== undefined) {
     let priceFilter = {};
     if (minPrice !== undefined && minPrice !== '') {
       priceFilter.$gte = Number(minPrice);
     }
     if (maxPrice !== undefined && maxPrice !== '') {
       priceFilter.$lte = Number(maxPrice);
     }
     
     andConditions.push({ price: priceFilter });
     console.log('💰 Filtrando por precio:', priceFilter);
   }

   // Aplicar todas las condiciones $and si existen
   if (andConditions.length > 0) {
     filter.$and = andConditions;
   }

   console.log('🎯 FILTRO FINAL:', JSON.stringify(filter, null, 2));

   // ============ ORDENAMIENTO (mejorado) ============
   let sort = {};
   switch (sortBy) {
     case 'price_asc':
       sort = { price: 1 };
       break;
     case 'price_desc':
       sort = { price: -1 };
       break;
     case 'recent':
     default:
       sort = { createdAt: -1 };
       break;
   }

   // 4. Ejecutar consulta con todos los filtros
   const [posts, total] = await Promise.all([
     Post.find(filter)
       .sort(sort) // Usar ordenamiento seleccionado
       .skip(skip)
       .limit(limit)
       .select('_id title price images createdAt wilaya commune description etat views categorie subCategory articleType category location')
       .populate('user', 'username avatar')
       .lean(),
     Post.countDocuments(filter)
   ]);

   console.log(`📊 Encontrados: ${posts.length} de ${total}`);

   // 5. Preparar slider (exactamente igual que antes)
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

   // ============ RESPUESTA ============
   // Mantenemos la misma estructura pero añadimos metadata de filtros
   res.json({
     success: true,
     posts,
     total,
     page,
     limit,
     hasMore: page * limit < total,
     totalPages: Math.ceil(total / limit),
     categoryInfo: {
       _id: categoryDoc._id,
       name: categoryDoc.name,
       slug: categoryDoc.slug,
       level: categoryDoc.level,
       emoji: categoryDoc.emoji || ''
     },
     children: childrenWithArticles,
     // NUEVO: Metadata para filtros (opcional, no afecta al slider)
     filterMetadata: {
       appliedFilters: {
         wilaya: wilaya || null,
         commune: commune || null,
         minPrice: minPrice || null,
         maxPrice: maxPrice || null,
         sortBy
       }
     }
   });

 } catch (error) {
   console.error('❌ Error:', error);
   res.status(500).json({ 
     success: false, 
     message: 'Error al filtrar posts', 
     error: error.message 
   });
 }
},

  */
  

  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 9, category } = req.query;
      const skip = (page - 1) * limit;

      // Construir query
      let query = { isActive: true, status: 'active' };

      // Si hay categoría, filtrar
      if (category && category !== 'all') {
        query.categorie = category;
      }

      // Obtener posts
      const posts = await Post.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-createdAt')
        .populate("user", "username avatar")
        .populate("categoryRef", "name slug");

      // Contar total
      const total = await Post.countDocuments(query);

      res.json({
        success: true,
        result: posts.length,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        posts
      });

    } catch (err) {
      console.error('❌ Error en getPosts:', err);
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  },

  // controllers/postController.js - updatePost CORREGIDO
  // 📂 controllers/postCtrl.js - updatePost CORREGIDO
// 📂 controllers/postCtrl.js - updatePost CORREGIDO

// 📂 controllers/postCtrl.js - updatePost CORREGIDO

// 📂 controllers/postCtrl.js - updatePost

updatePost: async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;  // ← Obtener el rol
    const updateData = req.body;

    console.log('🔄 Actualizando post:', { 
      postId: id, 
      userId: userId.toString(), 
      userRole: userRole 
    });

    // Buscar el post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "Post non trouvé" });
    }

    // ✅ VERIFICACIÓN: Admin puede editar cualquier post
    const isAdmin = userRole === 'admin';
    const isOwner = post.user.toString() === userId.toString();

    console.log('🔍 Verificación de permisos:', {
      isAdmin,
      isOwner,
      postOwner: post.user.toString(),
      currentUser: userId.toString()
    });

    if (!isAdmin && !isOwner) {
      console.log('❌ Acceso denegado - No autorizado');
      return res.status(403).json({ 
        msg: "Non autorisé - Vous n'êtes pas le propriétaire de cette annonce" 
      });
    }

    console.log('✅ Autorizado:', isAdmin ? 'ADMINISTRADOR' : 'PROPIETARIO');

    // GUARDAR VALORES ANTERIORES
    const oldCategory = {
      categorie: post.categorie,
      subCategory: post.subCategory,
      articleType: post.articleType,
      category: post.category
    };

    // 🔥 PROCESAR DATOS
    const processedData = { ...updateData };

    // Si category viene como slug, buscar su ID
    if (updateData.category && typeof updateData.category === 'string') {
      if (!updateData.category.match(/^[0-9a-fA-F]{24}$/)) {
        const categoryDoc = await Category.findOne({ 
          $or: [
            { slug: updateData.category },
            { name: { $regex: new RegExp(updateData.category, 'i') } }
          ],
          level: 1 
        });
        if (categoryDoc) {
          processedData.category = categoryDoc._id;
          processedData.categorie = categoryDoc.name;
          console.log(`✅ Categoría encontrada: ${categoryDoc.name} (${categoryDoc._id})`);
        }
      }
    }

    // Si subCategory viene como slug, mantener como string
    if (updateData.subCategory && typeof updateData.subCategory === 'string') {
      processedData.subCategory = updateData.subCategory;
    }

    // Si articleType viene como slug
    if (updateData.articleType && typeof updateData.articleType === 'string') {
      processedData.articleType = updateData.articleType;
    }

    // ✅ ACTUALIZAR categorySpecificData
    if (updateData.categorySpecificData) {
      processedData.categorySpecificData = {
        ...(post.categorySpecificData || {}),
        ...updateData.categorySpecificData
      };
    }

    // ✅ ACTUALIZAR IMÁGENES
    if (updateData.images && Array.isArray(updateData.images)) {
      processedData.images = updateData.images.map(img => {
        if (typeof img === 'string') {
          return { url: img, public_id: null };
        }
        return {
          url: img.url,
          public_id: img.public_id || null
        };
      });
      console.log(`✅ Imágenes actualizadas: ${processedData.images.length}`);
    }

    // ✅ Actualizar campos
    const fieldsToUpdate = [
      'categorie', 'subCategory', 'articleType', 'title', 'description',
      'price', 'etat', 'wilaya', 'commune', 'address', 'phone', 'email',
      'images', 'categorySpecificData', 'category'
    ];

    fieldsToUpdate.forEach(field => {
      if (processedData[field] !== undefined) {
        post[field] = processedData[field];
      }
    });

    await post.save();

    // Poblar para la respuesta
    const updatedPost = await Post.findById(id)
      .populate('user', 'username avatar')
      .lean();

    console.log('✅ Post actualizado correctamente');

    // Detectar si la categoría cambió
    const categoryChanged = 
      oldCategory.categorie !== post.categorie ||
      oldCategory.subCategory !== post.subCategory ||
      String(oldCategory.category) !== String(post.category);

    res.json({
      success: true,
      msg: "Post mis à jour",
      post: updatedPost,
      oldCategory: oldCategory,
      categoryChanged: categoryChanged
    });

  } catch (err) {
    console.error('❌ Error updatePost:', err);
    res.status(500).json({ msg: err.message });
  }
},
 // Controlador público para obtener posts de un usuario (sin autenticación)
  getPublicUserPosts :  async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }

  const userExists = await Users.findById(userId).select('_id username');
  if (!userExists) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  const query = { user: userId, isActive: true };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar')
      .populate('categoryRef', 'name slug emoji')
      .lean(),
    Post.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  res.json({
    success: true,
    posts,
    pagination: { page, limit, total, totalPages, hasMore },
    user: { _id: userExists._id, username: userExists.username }
  });
},
  deletePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user._id;

      // 1. VERIFICAR SI EL USUARIO ES EL DUEÑO O ADMIN
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      if (post.user.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to delete this post' });
      }

      console.log('🗑️ Eliminando post y sus imágenes:', post.images);

      // 2. BORRAR TODAS LAS IMÁGENES DEL POST DE CLOUDINARY
      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          if (image.public_id) {
            try {
              await cloudinary.uploader.destroy(image.public_id);
              console.log('✅ Imagen borrada de Cloudinary:', image.public_id);
            } catch (cloudinaryErr) {
              console.error('❌ Error borrando imagen de Cloudinary:', image.public_id, cloudinaryErr);
              // Continuar aunque falle una imagen
            }
          }
        }
      }

      // 3. GUARDAR IDs DE COMMENTS Y LIKES ANTES DE ELIMINAR
      const commentsToDelete = post.comments || [];
      const likesToCleanup = post.likes || [];

      // 4. ELIMINAR EL POST DE MONGODB
      await Post.findByIdAndDelete(postId);

      // 5. LIMPIAR DATOS RELACIONADOS
      if (commentsToDelete.length > 0) {
        await Comments.deleteMany({ _id: { $in: commentsToDelete } });
      }

      // 6. OPCIONAL: Limpiar likes de usuarios
      if (likesToCleanup.length > 0) {
        await Users.updateMany(
          { _id: { $in: likesToCleanup } },
          { $pull: { likes: postId } }
        );
      }

      // 7. OPCIONAL: Eliminar de posts guardados
      await Users.updateMany(
        { saved: postId },
        { $pull: { saved: postId } }
      );

      res.json({
        msg: 'Post deleted successfully!',
        deletedPostId: postId,
        deletedImagesCount: post.images ? post.images.length : 0
      });

    } catch (err) {
      console.error('Error in deletePost:', err);
      return res.status(500).json({ msg: err.message });
    }
  },
  getFeaturedPosts: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const posts = await Post.find({
        isActive: true,
        isPromoted: true
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'username avatar')
        .populate('categoryRef', 'name slug emoji')
        .lean();

      res.json({
        success: true,
        featuredPosts: posts
      });
    } catch (error) {
      console.error('Error en getFeaturedPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener destacados',
        error: error.message
      });
    }
  },

  /**
   * 📅 POSTS RECIENTES
   */
  getRecentPosts: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const posts = await Post.find({
        isActive: true
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title images price etat createdAt wilaya commune')
        .populate('user', 'username avatar')
        .populate('categoryRef', 'name slug emoji')
        .lean();

      res.json({
        success: true,
        recentPosts: posts,
        total: posts.length
      });
    } catch (error) {
      console.error('Error en getRecentPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener posts recientes',
        error: error.message
      });
    }
  },

  /**
   * 🔍 BUSCAR POSTS
   */
  searchPosts: async (req, res) => {
    try {
      const { query } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { categorie: { $regex: query, $options: 'i' } },
          { subCategory: { $regex: query, $options: 'i' } }
        ],
        isActive: true,
        status: 'active'
      };

      const [posts, total] = await Promise.all([
        Post.find(searchQuery)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('user', 'username avatar')
          .populate('categoryRef', 'name slug')
          .lean(),
        Post.countDocuments(searchQuery)
      ]);

      res.json({
        success: true,
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasMore: page * limit < total
        },
        query
      });
    } catch (error) {
      console.error('Error en searchPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Error en búsqueda',
        error: error.message
      });
    }
  },

  /**
   * 🛒 MARCAR COMO VENDIDO
   */
  markAsSold: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }

      // Verificar propiedad
      if (req.user && post.user && req.user._id && post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No autorizado'
        });
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $set: {
            status: 'sold',
            soldAt: new Date()
          }
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Post marcado como vendido',
        post: updatedPost
      });

    } catch (error) {
      console.error('Error en markAsSold:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar como vendido',
        error: error.message
      });
    }
  },

  // controllers/postController.js - getSimilarPosts CORREGIDO
  // controllers/postCtrl.js
  getSimilarPosts: async (req, res) => {
    try {
      console.log('📥 getSimilarPosts - Query:', req.query);

      const {
        categorie,
        subCategory,
        excludeId,
        limit = 6,
        page = 1
      } = req.query;

      // Validación
      if (!categorie || !subCategory) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere categorie y subCategory'
        });
      }

      // Construir query
      let query = {
        categorie: categorie.trim(),
        subCategory: subCategory.trim(),
        isActive: true
      };

      // Excluir post actual
      if (excludeId && excludeId.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = { $ne: excludeId };
      }

      console.log('🔍 Query:', query);

      // Paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Buscar posts
      const posts = await Post.find(query)
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Post.countDocuments(query);

      res.json({
        success: true,
        posts,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: page * limit < total
      });

    } catch (error) {
      console.error('❌ getSimilarPosts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor',
        error: error.message
      });
    }
  },

  healthCheck: async (req, res) => {
    try {
      // Verificar conexión a MongoDB
      const dbStatus = mongoose.connection.readyState;
      const dbStatusText =
        dbStatus === 0 ? 'disconnected' :
          dbStatus === 1 ? 'connected' :
            dbStatus === 2 ? 'connecting' :
              dbStatus === 3 ? 'disconnecting' : 'unknown';

      res.json({
        success: true,
        message: 'API de posts funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbStatusText,
          connected: dbStatus === 1
        },
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en health check',
        error: error.message
      });
    }
  },




  likePost: async (req, res) => {
    try {
      const post = await Post.find({ _id: req.params.id, likes: req.user._id })
      if (post.length > 0) return res.status(400).json({ msg: "You liked this post." })

      const like = await Posts.findOneAndUpdate({ _id: req.params.id }, {
        $push: { likes: req.user._id }
      }, { new: true })

      if (!like) return res.status(400).json({ msg: 'This post does not exist.' })

      res.json({ msg: 'Liked Post!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  unLikePost: async (req, res) => {
    try {

      const like = await Post.findOneAndUpdate({ _id: req.params.id }, {
        $pull: { likes: req.user._id }
      }, { new: true })

      if (!like) return res.status(400).json({ msg: 'This post does not exist.' })

      res.json({ msg: 'UnLiked Post!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getUserPosts: async (req, res) => {
    try {
      const features = new APIfeatures(Post.find({ user: req.params.id }), req.query)
        .paginating()
      const posts = await features.query.sort("-createdAt")

      res.json({
        posts,
        result: posts.length
      })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate("user likes", "avatar username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password"
          }
        })

      if (!post) return res.status(400).json({ msg: 'This post does not exist.' })

      res.json({
        post
      })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getPostById: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate('category', 'name slug level parent'); // 👈 aquí está la clave

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json({ success: true, post });
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: error.message });
    }
  },
  addView: async (req,res)=>{
    try{
   
     await Post.findByIdAndUpdate(
       req.params.id,
       { $inc: { views: 1 } }
     )
   
     res.json({msg:"view counted"})
   
    }catch(err){
      res.status(500).json({msg:err.message})
    }
   },
  savePost: async (req, res) => {
    try {
      const user = await Users.find({ _id: req.user._id, saved: req.params.id })
      if (user.length > 0) return res.status(400).json({ msg: "You saved this post." })

      const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
        $push: { saved: req.params.id }
      }, { new: true })

      if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

      res.json({ msg: 'Saved Post!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  unSavePost: async (req, res) => {
    try {
      const save = await Users.findOneAndUpdate({ _id: req.user._id }, {
        $pull: { saved: req.params.id }
      }, { new: true })

      if (!save) return res.status(400).json({ msg: 'This user does not exist.' })

      res.json({ msg: 'unSaved Post!' })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getSavePosts: async (req, res) => {
    try {
      const features = new APIfeatures(Post.find({
        _id: { $in: req.user.saved }
      }), req.query).paginating()

      const savePosts = await features.query.sort("-createdAt")

      res.json({
        savePosts,
        result: savePosts.length
      })

    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },


  getFilterOptions: async (req, res) => {
    try {
      const { category: categorySlug, sub: subSlug, article: articleSlug } = req.query;
      if (!categorySlug) {
        return res.status(400).json({ msg: "Se requiere categoría" });
      }

      // 1. Buscar categoría nivel 1
      const categoryDoc = await Category.findOne({ slug: categorySlug, level: 1, isActive: true }).lean();
      if (!categoryDoc) {
        return res.status(404).json({ msg: "Categoría no encontrada" });
      }

      // 2. Obtener subcategorías y artículos
      const [allSubCategories, allArticles] = await Promise.all([
        Category.find({ parent: categoryDoc._id, level: 2, isActive: true }).lean(),
        Category.find({ level: 3, isActive: true }).lean()
      ]);

      // 3. Construir children con artículos anidados (para el select)
      const childrenWithArticles = allSubCategories.map(sub => ({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
        level: sub.level,
        icon: sub.icon || '📦',
        iconType: sub.iconType || 'emoji',
        iconColor: sub.iconColor || '#667eea',
        bgColor: sub.bgColor || '#f0f3ff',
        postCount: sub.postCount || 0,
        articles: allArticles
          .filter(a => String(a.parent) === String(sub._id))
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
          }))
      }));

      // 4. Obtener wilayas y rango de precios de los posts de esta categoría
      const filterBase = {
        isActive: true,
        $or: [
          { category: categoryDoc._id },
          { categorie: { $regex: new RegExp(categoryDoc.name, 'i') } }
        ]
      };
      // Si hay subSlug, filtrar por subcategoría para limitar opciones
      if (subSlug) {
        const subDoc = allSubCategories.find(s => s.slug === subSlug);
        if (subDoc) {
          const articleSlugs = allArticles.filter(a => String(a.parent) === String(subDoc._id)).map(a => a.slug);
          filterBase.$and = [{
            $or: [
              { subCategory: { $in: [subDoc.slug, ...articleSlugs] } },
              { articleType: { $in: [subDoc.slug, ...articleSlugs] } }
            ]
          }];
        }
      }
      if (articleSlug) {
        // similar
      }

      const [wilayasResult, priceRangeResult] = await Promise.all([
        Post.aggregate([
          { $match: filterBase },
          { $group: { _id: "$wilaya" } },
          { $sort: { _id: 1 } }
        ]),
        Post.aggregate([
          { $match: filterBase },
          { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } }
        ])
      ]);

      const wilayas = wilayasResult.map(w => ({ value: w._id, label: w._id })).filter(w => w.value);
      const priceRange = priceRangeResult[0] || { minPrice: 0, maxPrice: 1000000 };

      res.json({
        success: true,
        categoryInfo: {
          _id: categoryDoc._id,
          name: categoryDoc.name,
          slug: categoryDoc.slug,
          emoji: categoryDoc.emoji
        },
        children: childrenWithArticles,
        wilayas,
        priceRange: {
          min: priceRange.minPrice,
          max: priceRange.maxPrice
        }
      });

    } catch (error) {
      console.error('❌ getFilterOptions error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }




};

module.exports = postCtrl;
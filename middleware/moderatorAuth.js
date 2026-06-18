// 📂 middleware/moderatorAuth.js
const User = require('../models/userModel');
const Post = require('../models/postModel');

const moderatorAuth = async (req, res, next) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ msg: "Non authentifié" });
        }
        
        // Admin tiene acceso total
        if (user.role === 'admin') {
            return next();
        }
        
        // Moderador necesita verificación
        if (user.role === 'moderator') {
            // Si puede aprobar todas las categorías
            if (user.canApproveAllCategories) {
                return next();
            }
            
            // Obtener la categoría del post
            let categorySlug = req.query.categorie;
            let subCategorySlug = req.query.subCategory;
            
            // Si hay ID de post, obtener del post
            const postId = req.params.id || req.params.postId;
            if (postId) {
                const post = await Post.findById(postId);
                if (post) {
                    categorySlug = post.categorie;
                    subCategorySlug = post.subCategory;
                }
            }
            
            // Verificar permisos
            const hasPermission = user.assignedCategories.some(assigned => {
                if (assigned.categorySlug === categorySlug) {
                    if (assigned.canApproveAll) return true;
                    if (subCategorySlug) {
                        return assigned.subCategories.some(sub => 
                            sub.subCategorySlug === subCategorySlug
                        );
                    }
                    return true;
                }
                return false;
            });
            
            if (hasPermission) {
                return next();
            }
            
            return res.status(403).json({ 
                msg: "Vous n'avez pas les permissions pour cette catégorie" 
            });
        }
        
        return res.status(403).json({ msg: "Non autorisé" });
        
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = moderatorAuth;
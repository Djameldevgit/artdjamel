// controllers/cartCtrl.js - VERSIÓN FINAL CORREGIDA
const User = require('../models/userModel');
const Video = require('../models/videoModel');
const mongoose = require('mongoose');

const calculateTotal = (items) => {
    return items.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        return total + (price * quantity);
    }, 0);
};

// controllers/cartCtrl.js - Función transformCartItems mejorada
const transformCartItems = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => {
        const video = item.videoId && typeof item.videoId === 'object' && item.videoId._id 
            ? item.videoId 
            : null;
        
        const videoId = video._id || item.videoId || null;
        
        // ✅ Priorizar thumbnail guardado en el item (si existe y no es default)
        let thumbnail = '/default-thumbnail.png';
        if (item.thumbnail && item.thumbnail !== '/default-thumbnail.png') {
            thumbnail = item.thumbnail;
        } else if (video) {
            if (video.thumbnail) thumbnail = video.thumbnail;
            else if (video.images && video.images.length > 0) {
                const firstImage = video.images[0];
                if (typeof firstImage === 'object' && firstImage.url) thumbnail = firstImage.url;
                else if (typeof firstImage === 'string') thumbnail = firstImage;
            }
        }
        
        return {
            videoId: videoId,
            video: video,
            quantity: item.quantity || 1,
            priceAtAdd: item.price || 0,
            title: item.title || (video ? video.title : 'Sin título'),
            thumbnail: thumbnail,
            stock: video ? video.stock : 0,
            status: video ? video.status : 'en vente'
        };
    });
};
const cartCtrl = {
    getCart: async (req, res) => {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId)
                .populate({
                    path: 'cart.items.videoId',
                    select: 'title thumbnail price images status stock'
                });

            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (!user.cart) user.cart = { items: [], totalPrice: 0 };
            if (!user.cart.items) user.cart.items = [];

            user.cart.items = user.cart.items.filter(item => item.videoId != null);
            user.cart.totalPrice = calculateTotal(user.cart.items);
            await user.save();

            const transformedItems = transformCartItems(user.cart.items);
            const totalItems = transformedItems.reduce((sum, item) => sum + item.quantity, 0);

            res.json({
                success: true,
                cart: {
                    items: transformedItems,
                    totalPrice: user.cart.totalPrice,
                    totalItems: totalItems,
                }
            });
        } catch (error) {
            console.error('❌ Error getCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    addToCart: async (req, res) => {
        try {
            const userId = req.user._id;
            const videoId = req.body.videoId;
            const quantity = req.body.quantity || 1;

            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return res.status(400).json({ success: false, message: 'ID de obra inválido' });
            }

            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ success: false, message: 'Obra no encontrada' });
            }

            if (!video.stock || video.stock <= 0) {
                return res.status(400).json({ success: false, message: 'Cette œuvre est épuisée' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (!user.cart) user.cart = { items: [], totalPrice: 0 };
            if (!user.cart.items) user.cart.items = [];

            let existingItemIndex = -1;
            for (let i = 0; i < user.cart.items.length; i++) {
                if (user.cart.items[i].videoId && user.cart.items[i].videoId.toString() === videoId) {
                    existingItemIndex = i;
                    break;
                }
            }

            let alreadyInCart = false;
            let wasAdded = false;

            const thumbnail = video.thumbnail || (video.images && video.images[0].url) || '';

            if (existingItemIndex >= 0) {
                alreadyInCart = true;
                const currentQty = user.cart.items[existingItemIndex].quantity;
                const newTotal = currentQty + quantity;
                if (newTotal > video.stock) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Stock insuffisant. Disponible: ${video.stock}, demandé: ${newTotal}`,
                        maxStock: video.stock
                    });
                }
                user.cart.items[existingItemIndex].quantity = newTotal;
                wasAdded = true;
            } else {
                if (quantity > video.stock) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Stock insuffisant. Disponible: ${video.stock}, demandé: ${quantity}`,
                        maxStock: video.stock
                    });
                }
                // ✅ Guardamos thumbnail en el item
                user.cart.items.push({
                    videoId: videoId,
                    quantity: quantity,
                    price: video.price,
                    title: video.title,
                    images: video.images || [],
                    thumbnail: thumbnail // ✅ CRUCIAL
                });
                wasAdded = true;
            }

            user.cart.totalPrice = calculateTotal(user.cart.items);
            await user.save();

            await user.populate('cart.items.videoId', 'title thumbnail price images status stock');

            const transformedItems = transformCartItems(user.cart.items);
            const totalItems = transformedItems.reduce((sum, item) => sum + item.quantity, 0);

            res.json({
                success: true,
                alreadyInCart: alreadyInCart,
                wasAdded: wasAdded,
                cart: {
                    items: transformedItems,
                    totalPrice: user.cart.totalPrice,
                    totalItems: totalItems,
                }
            });
        } catch (error) {
            console.error('❌ Error addToCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCartItem: async (req, res) => {
        try {
            const userId = req.user._id;
            const videoId = req.body.videoId;
            const quantity = req.body.quantity;

            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return res.status(400).json({ success: false, message: 'ID de obra inválido' });
            }

            if (!quantity || quantity < 1) {
                return res.status(400).json({ success: false, message: 'La quantité doit être au moins 1' });
            }

            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ success: false, message: 'Obra no encontrada' });
            }

            if (!video.stock || video.stock <= 0) {
                return res.status(400).json({ success: false, message: 'Cette œuvre est épuisée' });
            }
            if (quantity > video.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Stock insuffisant. Disponible: ${video.stock}, demandé: ${quantity}` 
                });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            let itemIndex = -1;
            for (let i = 0; i < user.cart.items.length; i++) {
                if (user.cart.items[i].videoId && user.cart.items[i].videoId.toString() === videoId) {
                    itemIndex = i;
                    break;
                }
            }

            if (itemIndex === -1) {
                return res.status(404).json({ success: false, message: 'Item no encontrado en el carrito' });
            }

            user.cart.items[itemIndex].quantity = quantity;
            user.cart.totalPrice = calculateTotal(user.cart.items);
            await user.save();

            await user.populate('cart.items.videoId', 'title thumbnail price images status stock');

            const transformedItems = transformCartItems(user.cart.items);
            const totalItems = transformedItems.reduce((sum, item) => sum + item.quantity, 0);

            res.json({
                success: true,
                cart: {
                    items: transformedItems,
                    totalPrice: user.cart.totalPrice,
                    totalItems: totalItems,
                }
            });
        } catch (error) {
            console.error('❌ Error updateCartItem:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // controllers/cartCtrl.js - removeFromCart con populate y transformación correcta
removeFromCart: async (req, res) => {
    try {
        const userId = req.user._id;
        const videoId = req.params.videoId;

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID de obra inválido' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        // Verificar si el item existe
        let itemExists = false;
        for (let i = 0; i < user.cart.items.length; i++) {
            if (user.cart.items[i].videoId && user.cart.items[i].videoId.toString() === videoId) {
                itemExists = true;
                break;
            }
        }

        if (!itemExists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item no encontrado en el carrito' 
            });
        }

        // Filtrar eliminando el item
        user.cart.items = user.cart.items.filter(item => 
            !(item.videoId && item.videoId.toString() === videoId)
        );

        user.cart.totalPrice = calculateTotal(user.cart.items);
        await user.save();

        // ✅ CRUCIAL: POBLAR ANTES DE RESPONDER
        await user.populate('cart.items.videoId', 'title thumbnail price images status stock');

        const transformedItems = transformCartItems(user.cart.items);
        const totalItems = transformedItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            cart: {
                items: transformedItems,
                totalPrice: user.cart.totalPrice,
                totalItems: totalItems,
            }
        });

    } catch (error) {
        console.error('❌ Error removeFromCart:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
},

    clearCart: async (req, res) => {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            user.cart.items = [];
            user.cart.totalPrice = 0;
            await user.save();

            res.json({
                success: true,
                cart: {
                    items: [],
                    totalPrice: 0,
                    totalItems: 0,
                }
            });
        } catch (error) {
            console.error('❌ Error clearCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = cartCtrl;
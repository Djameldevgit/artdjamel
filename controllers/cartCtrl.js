// backend/controllers/cartCtrl.js
const Cart = require('../models/cartModel');
const Video = require('../models/videoModel');
const mongoose = require('mongoose');

const cartCtrl = {
    // ==================== OBTENER CARRITO ====================
    getCart: async (req, res) => {
        try {
            const userId = req.user._id;
            let cart = await Cart.findOne({ user: userId })
                .populate('items.video', 'title thumbnail price videoUrl slug status stock');
            
            if (!cart) {
                cart = new Cart({ user: userId, items: [] });
                await cart.save();
            }
            
            res.json({ success: true, cart });
        } catch (error) {
            console.error('❌ Error getCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== AÑADIR AL CARRITO ====================
    addToCart: async (req, res) => {
        try {
            const userId = req.user._id;
            const { videoId, quantity = 1 } = req.body;

            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return res.status(400).json({ success: false, message: 'ID de obra inválido' });
            }

            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ success: false, message: 'Obra no encontrada' });
            }

            if (video.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Stock insuficiente' });
            }

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                cart = new Cart({ user: userId, items: [] });
            }

            const existingItem = cart.items.find(item => item.video.toString() === videoId);
            if (existingItem) {
                const newQty = existingItem.quantity + quantity;
                if (newQty > video.stock) {
                    return res.status(400).json({ success: false, message: 'Stock insuficiente' });
                }
                existingItem.quantity = newQty;
            } else {
                cart.items.push({
                    video: videoId,
                    quantity,
                    priceAtAdd: video.price,
                    title: video.title,
                    thumbnail: video.thumbnail
                });
            }

            await cart.save();
            await cart.populate('items.video', 'title thumbnail price videoUrl slug status stock');

            res.json({ success: true, cart });
        } catch (error) {
            console.error('❌ Error addToCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ACTUALIZAR CANTIDAD ====================
    updateCartItem: async (req, res) => {
        try {
            const userId = req.user._id;
            const { videoId, quantity } = req.body;

            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return res.status(400).json({ success: false, message: 'ID de obra inválido' });
            }

            if (quantity < 1) {
                return res.status(400).json({ success: false, message: 'La cantidad debe ser al menos 1' });
            }

            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ success: false, message: 'Obra no encontrada' });
            }

            if (video.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Stock insuficiente' });
            }

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
            }

            const item = cart.items.find(item => item.video.toString() === videoId);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Item no encontrado en el carrito' });
            }

            item.quantity = quantity;
            await cart.save();
            await cart.populate('items.video', 'title thumbnail price videoUrl slug status stock');

            res.json({ success: true, cart });
        } catch (error) {
            console.error('❌ Error updateCartItem:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== ELIMINAR ITEM ====================
    removeFromCart: async (req, res) => {
        try {
            const userId = req.user._id;
            const { videoId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(videoId)) {
                return res.status(400).json({ success: false, message: 'ID de obra inválido' });
            }

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
            }

            cart.items = cart.items.filter(item => item.video.toString() !== videoId);
            await cart.save();
            await cart.populate('items.video', 'title thumbnail price videoUrl slug status stock');

            res.json({ success: true, cart });
        } catch (error) {
            console.error('❌ Error removeFromCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ==================== VACIAR CARRITO ====================
    clearCart: async (req, res) => {
        try {
            const userId = req.user._id;
            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
            }
            cart.items = [];
            await cart.save();
            res.json({ success: true, cart });
        } catch (error) {
            console.error('❌ Error clearCart:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = cartCtrl;
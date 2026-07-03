// 📂 middleware/auth.js

const Users = require("../models/userModel")
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")

        if(!token) return res.status(400).json({msg: "Invalid Authentication."})

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decoded) return res.status(400).json({msg: "Invalid Authentication."})

        const user = await Users.findOne({_id: decoded.id}).select('-password')
        
        if(!user) return res.status(400).json({msg: "User not found."})

        // ✅ Pasar toda la información del usuario, incluyendo rol
        req.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',  // Si no tiene role, por defecto 'user'
            avatar: user.avatar
        }
        
        console.log('🔑 Usuario autenticado:', {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        })
        
        next()
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = auth
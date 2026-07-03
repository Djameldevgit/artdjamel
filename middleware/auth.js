const mongoose = require('mongoose');

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) return res.status(400).json({ msg: "Invalid Authentication." });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) return res.status(400).json({ msg: "Invalid Authentication." });

        // ✅ Verificar que decoded.id sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            console.error("❌ ID inválido en token:", decoded.id);
            return res.status(400).json({ msg: "Invalid user ID in token." });
        }

        const user = await Users.findOne({ _id: decoded.id }).select('-password');
        if (!user) return res.status(400).json({ msg: "User not found." });

        req.user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || 'user',
            avatar: user.avatar
        };

        console.log('🔑 Usuario autenticado:', {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        });

        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};
module.exports = auth
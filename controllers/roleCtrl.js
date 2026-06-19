// controllers/roleCtrl.js
// VERSIÓN SIMPLIFICADA: solo gestión de roles (sin canales, planes o validaciones)

const Users = require("../models/userModel");

const roleCtrl = {

  // ============================================
  // 🔍 BÚSQUEDA DE USUARIO
  // ============================================
  searchUser: async (req, res) => {
    try {
      const users = await Users.find({ username: { $regex: req.query.username } })
        .limit(10)
        .select("username avatar");
      res.json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // ============================================
  // 👤 ASIGNAR ROL (genérico)
  // ============================================
  assignUserRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password' }
      );
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({
        msg: "Rôle assigné avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('❌ Error assignUserRole:', error);
      res.status(500).json({ msg: "Erreur lors de l'assignation du rôle" });
    }
  },

  // ============================================
  // 👑 ASIGNAR ROL ADMIN
  // ============================================
  assignAdminRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password' }
      );
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({
        msg: "Rôle Admin assigné avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('❌ Error assignAdminRole:', error);
      res.status(500).json({ msg: "Erreur lors de l'assignation du rôle Admin" });
    }
  },

  // ============================================
  // 🛡️ ASIGNAR ROL MODERATOR
  // ============================================
  assignModeratorRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password' }
      );
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({
        msg: "Rôle Modérateur assigné avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('❌ Error assignModeratorRole:', error);
      res.status(500).json({ msg: "Erreur lors de l'assignation du rôle Modérateur" });
    }
  },

  // ============================================
  // ⭐ ASIGNAR ROL USERPRO (sin planes ni validaciones)
  // ============================================
  assignUserProRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password' }
      );
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({
        msg: "Rôle UserPro assigné avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('❌ Error assignUserProRole:', error);
      res.status(500).json({ msg: "Erreur lors de l'assignation du rôle UserPro" });
    }
  },

  // ============================================
  // 🔄 ACTUALIZAR ROL (genérico, sin canales)
  // ============================================
  updateRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { 
          new: true,
          select: '-password'
        }
      );

      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({
        msg: "Rôle mis à jour avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });

    } catch (err) {
      console.error('❌ Error updating role:', err);
      res.status(500).json({ 
        msg: "Erreur lors de la mise à jour du rôle",
        error: err.message 
      });
    }
  },

  // ============================================
  // 📝 ASIGNAR ROL (fallback con traducciones)
  // ============================================
  UserRoleNoIdentificado: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, select: '-password' }
      );
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

      res.json({ 
        msg: "Rôle assigné avec succès",
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role
        }
      });
    } catch (error) {
      console.error('❌ Error en UserRoleNoIdentificado:', error);
      res.status(500).json({ msg: "Erreur lors de l'assignation du rôle" });
    }
  }
};

module.exports = roleCtrl;
const Users = require("../models/userModel");
const Channel = require("../models/channelModel");
const roleCtrl = {

  assignUserProRole: async (req, res) => {
    const { role, planId } = req.body;
    try {
      const plans = {
        basic: { name: 'basic', maxVideos: 50, maxDuration: 40, storage: 50 },
        pro: { name: 'pro', maxVideos: 200, maxDuration: 60, storage: 500 },
        business: { name: 'business', maxVideos: 'unlimited', maxDuration: 120, storage: 2048 }
      };
      
      const selectedPlan = plans[planId] || plans.basic;
      
      const user = await Users.findByIdAndUpdate(
        req.params.id, 
        { 
          role: 'userpro',
          channelPlan: selectedPlan.name,
          channelPlanExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          channelPlanAutoRenew: true
        }, 
        { new: true }
      );
      
      if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
      
      // ... resto del código ...
      
      // ✅ Devolver el usuario COMPLETO con channelPlan
      res.json({ 
        msg: `Utilisateur Pro activé avec le plan ${selectedPlan.name}`,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          channelPlan: user.channelPlan,
          channelPlanExpiresAt: user.channelPlanExpiresAt,
          channelPlanAutoRenew: user.channelPlanAutoRenew
        }
      });
    } catch (error) {
      console.error('Error assignUserProRole:', error);
      res.status(500).json({ msg: "Erreur lors de l'activation du compte Pro" });
    }
  },
      // ✅ NUEVO: Actualizar plan de un usuario existente
      updateUserPlan: async (req, res) => {
        const { planId } = req.body;
        const { userId } = req.params;
        
        try {
          const plans = {
            basic: { name: 'basic', maxVideos: 50, maxDuration: 40, storage: 50 },
            pro: { name: 'pro', maxVideos: 200, maxDuration: 60, storage: 500 },
            business: { name: 'business', maxVideos: 'unlimited', maxDuration: 120, storage: 2048 }
          };
          
          const selectedPlan = plans[planId];
          if (!selectedPlan) {
            return res.status(400).json({ msg: "Plan invalide" });
          }
          
          const user = await Users.findByIdAndUpdate(
            userId,
            {
              channelPlan: selectedPlan.name,
              channelPlanExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              channelPlanAutoRenew: true
            },
            { new: true }
          );
          
          if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé" });
          }
          
          // Actualizar acciones del canal
          const planActions = {
            basic: ['partage', 'sauvegarder', 'aime', 'comments', 'notification', 'suivre', 'vues', 'chat_system', 'lien_resaux_sociaux', 'telephone'],
            pro: ['partage', 'sauvegarder', 'aime', 'comments', 'notification', 'suivre', 'vues', 'chat_system', 'button_whatsapp', 'button_viber', 'lien_resaux_sociaux', 'telephone', 'map_system', 'distance', 'music'],
            business: ['partage', 'sauvegarder', 'aime', 'comments', 'notification', 'suivre', 'vues', 'chat_system', 'button_whatsapp', 'button_viber', 'lien_resaux_sociaux', 'telephone', 'map_system', 'distance', 'temps_arrivee', 'visualisation_info_channel', 'music']
          };
          
          await Channel.findOneAndUpdate(
            { user: userId },
            { channelActions: planActions[selectedPlan.name] || [] },
            { new: true }
          );
          
          res.json({
            msg: `Plan mis à jour: ${selectedPlan.name}`,
            user: {
              _id: user._id,
              channelPlan: user.channelPlan,
              channelPlanExpiresAt: user.channelPlanExpiresAt
            }
          });
        } catch (error) {
          console.error('Error updateUserPlan:', error);
          res.status(500).json({ msg: error.message });
        }
      },
    searchUser: async (req, res) => {
        try {
            const users = await Users.find({username: {$regex: req.query.username}})
            .limit(10).select("username avatar")
            
            res.json({users})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },


    UserRoleNoIdentificado: async (req, res) => {
        const { role } = req.body;
        try {
            const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) return res.status(404).json({ msg: role.user_not_found });

            res.json({ msg: role.role_assigned });
        } catch (error) {
            res.status(500).json({ msg: role.update_error });
        }
    },

    assignUserRole: async (req, res) => {
        const { role } = req.body;
        try {
            const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) return res.status(404).json({ msg: role.user_not_found });

            res.json({ msg: role.role_assigned });
        } catch (error) {
            res.status(500).json({ msg: role.update_error });
        }
    },

    assignUserProRole: async (req, res) => {
        const { role } = req.body;
        try {
            const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) return res.status(404).json({ msg: role.user_not_found });

            res.json({ msg: role.userpro });
        } catch (error) {
            res.status(500).json({ msg: role.update_error });
        }
    },

    assignModeratorRole: async (req, res) => {
        const { role } = req.body;
        try {
            const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) return res.status(404).json({ msg: role.user_not_found });

            res.json({ msg: role.moderator_assigned });
        } catch (error) {
            res.status(500).json({ msg: role.update_error });
        }
    },

    assignAdminRole: async (req, res) => {
        const { role } = req.body;
        try {
            const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true });
            if (!user) return res.status(404).json({ msg: role.user_not_found });

            res.json({ msg: role.admin_assigned });
        } catch (error) {
            res.status(500).json({ msg: role.update_error });
        }
   
},

updateRole: async (req, res) => {
    const { role } = req.body;
    try {
      const user = await Users.findByIdAndUpdate(
        req.params.id,
        { role },
        { 
          new: true,
          select: '-password' // Excluir datos sensibles
        }
      );

      if (!user) return res.status(404).json({ msg: role.user_not_found });

      // Respuesta optimizada para Redux
      res.json({
        msg: role.role_updated,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
          // Incluir otros campos necesarios en el frontend
          isVerified: user.isVerified,
          isActive: user.isActive
        }
      });

    } catch (err) {
      console.error('Error updating role:', err);
      res.status(500).json({ 
        msg: role.update_error,
        error: err.message 
      });
    }
  }
 
  
 }




module.exports = roleCtrl;
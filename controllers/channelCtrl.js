// backend/controllers/channelCtrl.js

const Channel = require('../models/channelModel');
const Video = require('../models/videoModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const getPlanLimits = (plan) => {
    const limits = {
        free: { maxChannels: 1, maxVideos: 5 },      // Ya no se usará "free" como plan gratuito, solo como base
        basic: { maxChannels: 3, maxVideos: 50 },
        pro: { maxChannels: 7, maxVideos: 200 },
        business: { maxChannels: 15, maxVideos: 'unlimited' }
    };
    return limits[plan] || limits.free;
};
const createChannel = async (req, res) => {
    try {
        const { 
            name, 
            activity, 
            description, 
            avatar,
            cover,
            phone, 
            email, 
            website, 
            wilaya, 
            commune 
        } = req.body;

        if (!name || !activity || !wilaya || !commune) {
            return res.status(400).json({ success: false, msg: "Champs requis manquants" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, msg: "Utilisateur non trouvé" });
        }

        // Contar canales activos (pending o approved) del usuario
        const activeChannelsCount = await Channel.countDocuments({
            owner: user._id,
            status: { $in: ['pending', 'approved'] },
            isActive: true
        });

        // Verificar si el usuario tiene un plan de pago activo
        const hasActivePaidPlan = user.hasActivePlan && user.hasActivePlan() && user.channelPlan !== 'free';
        let isTrialChannel = false;

        if (hasActivePaidPlan) {
            // Plan de pago: respetar límite de canales según el plan
            const limits = getPlanLimits(user.channelPlan);
            if (limits.maxChannels !== 'unlimited' && activeChannelsCount >= limits.maxChannels) {
                return res.status(403).json({
                    success: false,
                    msg: `Vous avez atteint la limite de ${limits.maxChannels} canaux pour votre plan ${user.channelPlan}.`
                });
            }
            isTrialChannel = false;
        } else {
            // Sin plan de pago: solo puede tener UN canal trial (pendiente o aprobado)
            if (activeChannelsCount >= 1) {
                return res.status(403).json({
                    success: false,
                    msg: "Vous ne pouvez avoir qu'un seul canal en période d'essai."
                });
            }
            // Verificar si puede iniciar un nuevo período de prueba (no haber usado el trial antes o que haya expirado y pasado más de 5 días)
            if (user.trialUsed && user.trialEndDate && new Date() > user.trialEndDate) {
                // Ha expirado su trial anterior, no puede crear otro a menos que pague
                return res.status(403).json({
                    success: false,
                    msg: "Votre période d'essai a expiré. Veuillez souscrire un plan pour créer un canal."
                });
            }
            isTrialChannel = true;
        }

        // Evitar duplicado de nombre (opcional)
        const existingChannel = await Channel.findOne({ owner: user._id, name });
        if (existingChannel) {
            return res.status(400).json({ success: false, msg: "Vous avez déjà un canal avec ce nom" });
        }

        // Slug único
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        let finalSlug = slug;
        let counter = 1;
        while (await Channel.findOne({ slug: finalSlug })) {
            finalSlug = `${slug}-${counter++}`;
        }

        // Normalización de avatar y cover (igual que antes)
        let normalizedAvatar = [];
        if (avatar) {
            if (Array.isArray(avatar)) {
                normalizedAvatar = avatar.map(item => {
                    if (typeof item === 'string') {
                        return { url: item, public_id: `avatar_${Date.now()}_${Math.random()}` };
                    }
                    return item;
                });
            } else if (typeof avatar === 'string') {
                normalizedAvatar = [{ url: avatar, public_id: `avatar_${Date.now()}_${Math.random()}` }];
            }
        }

        let normalizedCover = [];
        if (cover) {
            if (Array.isArray(cover)) {
                normalizedCover = cover.map(item => {
                    if (typeof item === 'string') {
                        return { url: item, public_id: `cover_${Date.now()}_${Math.random()}` };
                    }
                    return item;
                });
            } else if (typeof cover === 'string') {
                normalizedCover = [{ url: cover, public_id: `cover_${Date.now()}_${Math.random()}` }];
            }
        }

        // Crear el canal con estado pendiente (tanto trial como pago)
        const newChannel = new Channel({
            name,
            slug: finalSlug,
            activity,
            description: description || '',
            avatar: normalizedAvatar,
            cover: normalizedCover,
            phone: phone || '',
            email: email || '',
            website: website || '',
            wilaya,
            commune,
            owner: user._id,
            trialChannel: isTrialChannel,
            trialExpiresAt: null,          // Se asignará al aprobar
            status: 'pending',
            pendiente: true,
            isActive: true,
            followers: [],
            followersCount: 0,
            totalVideos: 0,
            totalViews: 0,
            totalLikes: 0
        });

        await newChannel.save();

        // Si es trial y nunca usó el trial, marcamos que ya lo usó (aunque aún no aprobado)
        if (isTrialChannel && !user.trialUsed) {
            user.trialUsed = true;
            // No asignamos trialEndDate todavía, se hará al aprobar
            await user.save();
        }

        const populatedChannel = await Channel.findById(newChannel._id)
            .populate('owner', 'username avatar fullname')
            .lean();

        const formattedChannel = {
            ...populatedChannel,
            _id: populatedChannel._id.toString(),
            avatar: populatedChannel.avatar || [],
            cover: populatedChannel.cover || [],
            owner: populatedChannel.owner ? {
                ...populatedChannel.owner,
                _id: populatedChannel.owner._id.toString()
            } : null
        };

        res.json({
            success: true,
            msg: isTrialChannel 
                ? "Canal d'essai créé, en attente d'approbation. Une fois approuvé, vous disposerez de 5 jours pour tester." 
                : "Canal créé avec succès, en attente d'approbation.",
            channel: formattedChannel
        });

    } catch (err) {
        console.error('❌ Error createChannel:', err);
        return res.status(500).json({ success: false, msg: err.message });
    }
};
const approveChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal non trouvé' });
        }

        // Si es canal de prueba, establecer fecha de expiración a 5 días desde ahora
        if (channel.trialChannel) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 5);
            channel.trialExpiresAt = expiresAt;
            // Actualizar usuario con la fecha de expiración del trial
            await User.findByIdAndUpdate(channel.owner, {
                trialEndDate: expiresAt,
                isTrialExpired: false
            });
        }

        // Aprobar el canal usando el método del mixin
        await channel.approve(req.user._id);
        
        res.json({ success: true, message: 'Canal approuvé avec succès', channel });
        
    } catch (error) {
        console.error('❌ Error approveChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ==================== OBTENER MIS CANALES ====================
const getMyChannels = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        
        let query = { owner: userId };
        
        if (userRole !== 'admin') {
            query.isActive = { $ne: false };
            query.status = { $ne: 'deleted' };
        }
        
        const channels = await Channel.find(query)
            .populate('owner', 'username avatar fullname')
            .sort({ createdAt: -1 })
            .lean();
        
        const formattedChannels = channels.map(channel => ({
            ...channel,
            _id: channel._id.toString(),
            avatar: channel.avatar && channel.avatar.length > 0 ? channel.avatar[0].url : (channel.avatar || ''),
            cover: channel.cover && channel.cover.length > 0 ? channel.cover[0].url : (channel.cover || ''),
            owner: channel.owner ? {
                _id: channel.owner._id.toString(),
                username: channel.owner.username,
                avatar: channel.owner.avatar,
                fullname: channel.owner.fullname
            } : null
        }));
        
        res.json({ success: true, channels: formattedChannels });
        
    } catch (error) {
        console.error('❌ Error getMyChannels:', error);
        res.status(500).json({ success: false, message: error.message, channels: [] });
    }
};

// ==================== ACTUALIZAR CANAL ====================
const updateChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { 
            name, 
            activity, 
            description, 
            phone, 
            email, 
            website, 
            wilaya, 
            commune, 
            avatar, 
            cover,
            phoneHidden,
            delivery,
            businessHours,
            settings
        } = req.body;
        
        console.log(`✏️ Actualizando canal: ${id} por usuario: ${userId}`);
        
        // Buscar el canal
        const channel = await Channel.findById(id);
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                msg: 'Canal non trouvé'
            });
        }
        
        // Verificar permisos
        const isOwner = channel.owner.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                msg: 'Vous n\'avez pas les droits pour modifier ce canal'
            });
        }
        
        // ✅ Permitir edición incluso si está pendiente
        // Actualizar campos básicos
        if (name) {
            channel.name = name;
            // Actualizar slug si el nombre cambió
            channel.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        if (activity) channel.activity = activity;
        if (description !== undefined) channel.description = description;
        if (phone !== undefined) channel.phone = phone;
        if (email !== undefined) channel.email = email;
        if (website !== undefined) channel.website = website;
        if (wilaya !== undefined) channel.wilaya = wilaya;
        if (commune !== undefined) channel.commune = commune;
        if (avatar) channel.avatar = avatar;
        if (cover) channel.cover = cover;
        if (phoneHidden !== undefined) channel.phoneHidden = phoneHidden;
        
        // Actualizar objetos anidados
        if (delivery) {
            channel.delivery = { ...channel.delivery, ...delivery };
        }
        if (businessHours) {
            channel.businessHours = { ...channel.businessHours, ...businessHours };
        }
        if (settings) {
            channel.settings = { ...channel.settings, ...settings };
        }
        
        await channel.save();
        
        console.log(`✅ Canal actualizado: ${channel.name}`);
        
        res.status(200).json({
            success: true,
            msg: 'Canal mis à jour avec succès',
            channel
        });
        
    } catch (error) {
        console.error('❌ Error updateChannel:', error);
        res.status(500).json({
            success: false,
            msg: error.message || 'Erreur lors de la mise à jour du canal'
        });
    }
};

// ==================== OBTENER PERFIL DEL CANAL ====================
const getChannelProfile = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        let currentUserId = null;
        let userRole = null;
        
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUserId = decoded.id;
                const user = await User.findById(currentUserId).select('role username');
                if (user) userRole = user.role;
            } catch (err) {}
        }

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ success: false, message: 'ID inválido' });
        }

        const channel = await Channel.findById(channelId)
            .populate('owner', 'username avatar fullname _id email')
            .lean();

        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }

        const isOwner = currentUserId && channel.owner._id.toString() === currentUserId.toString();
        const isAdmin = userRole === 'admin';

        // Admin o dueño pueden ver cualquier estado
        if (isAdmin || isOwner) {
            const stats = await Video.aggregate([
                { $match: { channel: new mongoose.Types.ObjectId(channelId), isActive: true } },
                { $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalLikes: { $sum: { $size: '$likes' } },
                    totalViews: { $sum: '$views' }
                }}
            ]);

            const statsData = stats.length > 0 ? stats[0] : { totalVideos: 0, totalLikes: 0, totalViews: 0 };

            const profileData = {
                _id: channel._id.toString(),
                name: channel.name,
                slug: channel.slug,
                description: channel.description || '',
                avatar: channel.avatar || [],
                cover: channel.cover || [],
                wilaya: channel.wilaya || '',
                commune: channel.commune || '',
                activity: channel.activity || '',
                isVerified: channel.isVerified || false,
                followersCount: channel.followersCount || 0,
                totalVideos: statsData.totalVideos,
                totalViews: statsData.totalViews,
                totalLikes: statsData.totalLikes,
                owner: {
                    _id: channel.owner._id.toString(),
                    username: channel.owner.username,
                    avatar: channel.owner.avatar,
                    fullname: channel.owner.fullname,
                    email: channel.owner.email
                },
                isFollowing: false,
                status: channel.status || (channel.pending ? 'pending' : 'approved'),
                rejectionReason: channel.rejectionReason || '',
                email: channel.email || '',
                phone: channel.phone || '',
                website: channel.website || '',
                createdAt: channel.createdAt,
                updatedAt: channel.updatedAt
            };

            return res.json({ success: true, profile: profileData });
        }

        // Usuarios normales solo ven canales aprobados
        if (channel.status !== 'approved' || channel.pending) {
            return res.status(404).json({ success: false, message: 'Canal en cours de vérification' });
        }

        let isFollowing = false;
        if (currentUserId) {
            const currentUser = await User.findById(currentUserId).select('followingChannels');
            if (currentUser && currentUser.followingChannels) {
                isFollowing = currentUser.followingChannels.some(id => id.toString() === channelId);
            }
        }

        const stats = await Video.aggregate([
            { $match: { channel: new mongoose.Types.ObjectId(channelId), pendiente: false, isActive: true } },
            { $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: { $size: '$likes' } },
                totalViews: { $sum: '$views' }
            }}
        ]);

        const statsData = stats.length > 0 ? stats[0] : { totalVideos: 0, totalLikes: 0, totalViews: 0 };

        const profileData = {
            _id: channel._id.toString(),
            name: channel.name,
            slug: channel.slug,
            description: channel.description || '',
            avatar: channel.avatar || [],
            cover: channel.cover || [],
            wilaya: channel.wilaya || '',
            commune: channel.commune || '',
            activity: channel.activity || '',
            isVerified: channel.isVerified || false,
            followersCount: channel.followersCount || 0,
            totalVideos: statsData.totalVideos,
            totalViews: statsData.totalViews,
            totalLikes: statsData.totalLikes,
            owner: {
                _id: channel.owner._id.toString(),
                username: channel.owner.username,
                avatar: channel.owner.avatar,
                fullname: channel.owner.fullname,
                email: channel.owner.email
            },
            isFollowing: isFollowing,
            status: 'approved',
            email: channel.email || '',
            phone: channel.phone || '',
            website: channel.website || '',
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt
        };

        res.json({ success: true, profile: profileData });
        
    } catch (err) {
        console.error('❌ Error getChannelProfile:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== OBTENER VIDEOS DEL CANAL ====================
const getChannelVideos = async (req, res) => {
    try {
        const { channelId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const currentUserId = req.user ? req.user._id : null;
        const isAdmin = req.user ? req.user.role === 'admin' : false;

        const channel = await Channel.findById(channelId).lean();
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }

        const isOwner = currentUserId && channel.owner.toString() === currentUserId.toString();

        let videoQuery = { channel: channelId };
        
        if (!isOwner && !isAdmin) {
            videoQuery = { channel: channelId, isActive: true, pendiente: false, status: 'approved' };
        }

        const videos = await Video.find(videoQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('channel', '_id name avatar slug')
            .populate('category', 'name slug')
            .lean();

        const total = await Video.countDocuments(videoQuery);
        const hasMore = skip + videos.length < total;

        const videosWithInfo = videos.map(video => ({
            ...video,
            isOwner: isOwner,
            status: video.pendiente ? '⏳ En attente' : '✅ Publié'
        }));

        res.json({
            success: true,
            videos: videosWithInfo,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore,
            isOwner: isOwner || isAdmin,
            channelName: channel.name
        });

    } catch (error) {
        console.error('❌ Error getChannelVideos:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== SEGUIR/DEJAR DE SEGUIR CANAL ====================
const toggleFollowChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user._id;
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        const isFollowing = user.followingChannels && user.followingChannels.includes(channelId);
        
        if (isFollowing) {
            await User.findByIdAndUpdate(userId, { $pull: { followingChannels: channelId } });
            await Channel.findByIdAndUpdate(channelId, { $pull: { followers: userId } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { followingChannels: channelId } });
            await Channel.findByIdAndUpdate(channelId, { $addToSet: { followers: userId } });
        }
        
        const updatedChannel = await Channel.findById(channelId);
        const followersCount = updatedChannel.followers ? updatedChannel.followers.length : 0;
        updatedChannel.followersCount = followersCount;
        await updatedChannel.save();
        
        res.json({
            success: true,
            isFollowing: !isFollowing,
            followersCount: followersCount
        });
        
    } catch (error) {
        console.error('❌ Error toggleFollowChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== APROBAR CANAL ====================
 
// ==================== RECHAZAR CANAL ====================
const rejectChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { reason } = req.body;
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        await channel.reject(req.user._id, reason);
        
        res.json({ success: true, message: 'Canal rejeté avec succès', channel });
        
    } catch (error) {
        console.error('❌ Error rejectChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== REENVIAR CANAL ====================
const resubmitChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        const isOwner = channel.owner.toString() === req.user._id.toString();
        if (!isOwner) {
            return res.status(403).json({ success: false, message: 'Seul le propriétaire peut renvoyer le canal' });
        }
        
        await channel.resubmit(req.user._id);
        
        res.json({ success: true, message: 'Canal renvoyé pour approbation', channel });
        
    } catch (error) {
        console.error('❌ Error resubmitChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== OBTENER CANAL PENDIENTE ====================
const getPendingChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const channel = await Channel.findById(channelId)
            .populate('owner', 'username avatar fullname')
            .lean();
            
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        const isOwner = channel.owner._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }
        
        res.json({ success: true, profile: channel });
        
    } catch (err) {
        console.error('❌ Error getPendingChannel:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== OBTENER CANALES PENDIENTES (ADMIN) ====================
const getPendingChannels = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const channels = await Channel.find({ status: 'pending' })
            .populate('owner', 'username email avatar fullname')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Channel.countDocuments({ status: 'pending' });
        
        res.json({ success: true, channels, total, page, totalPages: Math.ceil(total / limit) });
        
    } catch (error) {
        console.error('❌ Error getPendingChannels:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== ELIMINAR CANAL (SOFT DELETE) ====================
// channelCtrl.js

// 🗑️ ELIMINAR CANAL (debe estar aquí, NO en userCtrl)
const deleteChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        // Buscar el canal
        const channel = await Channel.findById(id);
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                msg: 'Canal no encontrado'
            });
        }
        
        // Verificar permisos
        const isOwner = channel.owner.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para eliminar este canal'
            });
        }
        
        // ✅ 1. OBTENER TODOS LOS VIDEOS DEL CANAL
        const videos = await Video.find({ channel: id });
        const videoIds = videos.map(v => v._id);
        
        // ✅ 2. ELIMINAR REFERENCIAS EN USUARIOS
        // Usuarios que siguen este canal
        await User.updateMany(
            { followingChannels: id },
            { $pull: { followingChannels: id } }
        );
        
        // Usuarios que guardaron videos de este canal
        if (videoIds.length > 0) {
            await User.updateMany(
                { savedVideos: { $in: videoIds } },
                { $pull: { savedVideos: { $in: videoIds } } }
            );
            
            // Usuarios que dieron like a videos de este canal
            await User.updateMany(
                { likedVideos: { $in: videoIds } },
                { $pull: { likedVideos: { $in: videoIds } } }
            );
        }
        
        // ✅ 3. ELIMINAR TODOS LOS VIDEOS DEL CANAL
        const videosDeleted = await Video.deleteMany({ channel: id });
        
        // ✅ 4. ELIMINAR EL CANAL
        await Channel.findByIdAndDelete(id);
        
        console.log(`✅ Canal ${id} eliminado por usuario ${userId}`);
        console.log(`📊 Videos eliminados: ${videosDeleted.deletedCount || 0}`);
        
        res.status(200).json({
            success: true,
            msg: 'Canal eliminado correctamente',
            deletedData: {
                channelId: id,
                videosCount: videosDeleted.deletedCount || 0
            }
        });
        
    } catch (error) {
        console.error('❌ Error al eliminar canal:', error);
        res.status(500).json({
            success: false,
            msg: error.message || 'Error al eliminar el canal'
        });
    }
};

// ==================== REPORTAR CANAL ====================
const reportChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { reason, description } = req.body;
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        if (!channel.reports) channel.reports = [];
        
        const alreadyReported = channel.reports.some(r => r.user.toString() === req.user._id.toString());
        if (alreadyReported) {
            return res.status(400).json({ success: false, message: 'Ya has reportado este canal' });
        }
        
        channel.reports.push({
            user: req.user._id,
            reason,
            description: description || '',
            status: 'pending',
            createdAt: new Date()
        });
        
        channel.reportCount = channel.reports.length;
        await channel.save();
        
        res.json({ success: true, message: 'Reporte enviado', reportCount: channel.reportCount });
        
    } catch (error) {
        console.error('❌ Error reportChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== BLOQUEAR CANAL ====================
const blockChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        if (!channel.blockedBy) channel.blockedBy = [];
        
        const isBlocked = channel.blockedBy.includes(req.user._id);
        
        if (isBlocked) {
            channel.blockedBy = channel.blockedBy.filter(id => id.toString() !== req.user._id.toString());
        } else {
            channel.blockedBy.push(req.user._id);
        }
        
        channel.isBlocked = channel.blockedBy.length > 0;
        await channel.save();
        
        res.json({ success: true, isBlocked: !isBlocked });
        
    } catch (error) {
        console.error('❌ Error blockChannel:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== REGISTRAR COMPARTIDO ====================
const registerShare = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        channel.shareCount = (channel.shareCount || 0) + 1;
        channel.lastSharedAt = new Date();
        await channel.save();
        
        res.json({ success: true, shareCount: channel.shareCount });
        
    } catch (error) {
        console.error('❌ Error registerShare:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== OBTENER INFO DE CONTACTO ====================
const getContactInfo = async (req, res) => {
    try {
        const { channelId } = req.params;
        
        const channel = await Channel.findById(channelId)
            .select('email phone website wilaya commune owner')
            .populate('owner', 'username email phone');
        
        if (!channel) {
            return res.status(404).json({ success: false, message: 'Canal no encontrado' });
        }
        
        if (channel.status !== 'approved') {
            return res.status(403).json({ success: false, message: 'Canal no disponible' });
        }
        
        const contactInfo = {
            email: channel.email || channel.owner.email,
            phone: channel.phone || channel.owner.phone,
            website: channel.website,
            location: { wilaya: channel.wilaya, commune: channel.commune }
        };
        
        res.json({ success: true, contact: contactInfo });
        
    } catch (error) {
        console.error('❌ Error getContactInfo:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== OBTENER CANAL POR ID (legacy) ====================
const getChannelById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        console.log(`🔍 Buscando canal público: ${id}`);
        
        // Buscar canal (solo aprobados para público)
        const channel = await Channel.findOne({ 
            _id: id, 
            pendiente: false,
            status: 'approved'
        }).populate('owner', 'username fullname avatar');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                msg: 'Canal non trouvé ou en cours de vérification'
            });
        }
        
        // Obtener videos aprobados del canal
        const videos = await Video.find({ 
            channel: id, 
            pendiente: false,
            status: 'approved'
        }).sort({ createdAt: -1 }).limit(20);
        
        const videosCount = await Video.countDocuments({ channel: id, pendiente: false });
        const followersCount = channel.followers.length;
        
        // Verificar si el usuario actual sigue el canal
        let isFollowing = false;
        if (userId && channel.followers.includes(userId)) {
            isFollowing = true;
        }
        
        const channelData = {
            ...channel.toObject(),
            videosCount,
            followersCount,
            isFollowing,
            isOwner: false,
            videos
        };
        
        res.status(200).json({
            success: true,
            channel: channelData
        });
        
    } catch (error) {
        console.error('❌ Error getChannelById:', error);
        res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};
const getChannelForOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        console.log(`🏠 Dueño viendo canal: ${id}`);
        
        // Buscar el canal (sin filtrar por pendiente)
        const channel = await Channel.findById(id)
            .populate('owner', 'username fullname avatar email');
        
        if (!channel) {
            return res.status(404).json({
                success: false,
                msg: 'Canal non trouvé'
            });
        }
        
        // Verificar que sea el dueño o admin
        const isOwner = channel.owner._id.toString() === userId.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                msg: 'Vous n\'êtes pas le propriétaire de ce canal'
            });
        }
        
        // Obtener videos del canal (todos, incluso pendientes para el dueño)
        const videos = await Video.find({ channel: id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        const videosCount = await Video.countDocuments({ channel: id });
        const followersCount = channel.followers.length;
        
        // Verificar si el usuario actual sigue el canal
        let isFollowing = false;
        if (userId && channel.followers.includes(userId)) {
            isFollowing = true;
        }
        
        const channelData = {
            ...channel.toObject(),
            videosCount,
            followersCount,
            isFollowing,
            isOwner: true,
            videos: videos,
            // Información adicional para el dueño
            pendingVideosCount: await Video.countDocuments({ channel: id, pendiente: true }),
            approvedVideosCount: await Video.countDocuments({ channel: id, pendiente: false })
        };
        
        res.status(200).json({
            success: true,
            channel: channelData
        });
        
    } catch (error) {
        console.error('❌ Error getChannelForOwner:', error);
        res.status(500).json({
            success: false,
            msg: error.message || 'Erreur lors de la récupération du canal'
        });
    }
};

const getApprovedChannels = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const query = {
            status: 'approved',
            pendiente: false,
            isActive: true
        };

        const [channels, total] = await Promise.all([
            Channel.find(query)
                .populate('owner', 'username avatar fullname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Channel.countDocuments(query)
        ]);

        // FORMATEO SEGURO SIN OPTIONAL CHAINING
        const formatted = channels.map(ch => {
            // Avatar: si existe y es array, tomar el primer elemento.url
            let avatarUrl = null;
            if (ch.avatar && Array.isArray(ch.avatar) && ch.avatar.length > 0 && ch.avatar[0].url) {
                avatarUrl = ch.avatar[0].url;
            }

            // Cover: igual
            let coverUrl = null;
            if (ch.cover && Array.isArray(ch.cover) && ch.cover.length > 0 && ch.cover[0].url) {
                coverUrl = ch.cover[0].url;
            }

            // Owner
            let ownerData = null;
            if (ch.owner) {
                ownerData = {
                    _id: ch.owner._id.toString(),
                    username: ch.owner.username,
                    avatar: ch.owner.avatar,
                    fullname: ch.owner.fullname
                };
            }

            return {
                ...ch,
                _id: ch._id.toString(),
                avatar: avatarUrl,
                cover: coverUrl,
                owner: ownerData
            };
        });

        res.json({
            success: true,
            channels: formatted,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('❌ Error getApprovedChannels:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createChannel,
    updateChannel,
    getChannelProfile,
    getChannelById,
    getMyChannels,
    getChannelVideos,
    toggleFollowChannel,
    getPendingChannel,
    approveChannel,
    rejectChannel,
    getPendingChannels,
    deleteChannel,
    reportChannel,
    blockChannel,
    registerShare,
    getContactInfo,
    resubmitChannel,
    getChannelForOwner,
    getApprovedChannels



};
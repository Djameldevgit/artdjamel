// models/userModel.js - VERSIÓN COMPLETA CORREGIDA
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ============ INFORMACIÓN BÁSICA ============
    fullname: { type: String, trim: true, maxlength: 25 },
    username: { type: String, required: true, trim: true, maxlength: 25, unique: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    
    // ============ ROLES Y PERMISOS ============
    role: {
        type: String,
        enum: ['user', 'moderator', 'userPro','admin'],  // ✅ userPro se maneja con isPro + channelPlan
        default: 'admin'
    },
// En userSchema agregar:
trialStartDate: { type: Date, default: null },
trialEndDate: { type: Date, default: null },
trialUsed: { type: Boolean, default: false },
isTrialExpired: { type: Boolean, default: false },
    // ============ PLANES DE CANAL (comercial) ============
    channelPlan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'business'],
        default: 'free'
    },
    channelPlanExpiresAt: Date,
    channelPlanAutoRenew: { type: Boolean, default: false },
    
    // ============ PERMISOS DE MODERADOR ============
    assignedCategories: { type: [String], default: [], index: true },
    assignedSubCategories: { type: [String], default: [], index: true },
    canApproveAllCategories: { type: Boolean, default: false },  // ✅ Campo faltante
    
    // ============ PERFIL PERSONAL ============
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dzd58nm3l/image/upload/v1780538635/defalut-avatar_tfvwxr.png'
    },
    language: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
    mobile: { type: String, default: '' },
    address: { type: String, default: '' },
    story: { type: String, default: '', maxlength: 200 },
    website: { type: String, default: '' },
    bio: { type: String, default: '' },
    
    // ============ ESTADO ============
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isPro: { type: Boolean, default: false },  // ← Para compatibilidad con código legacy
    proExpiryDate: { type: Date, default: null },
    
    // ============ BLOQUEO (actual) ============
    blockDetails: {
        reason: { type: String, default: null },
        description: { type: String, default: null },
        blockDate: { type: Date, default: null },
        blockExpiryDate: { type: Date, default: null },
        blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
    },
    
    // ============ HISTORIAL DE BLOQUEOS (auditoría) ============
    blockHistory: [{
        reason: { type: String, required: true },
        description: { type: String },
        blockDate: { type: Date, default: Date.now },
        blockExpiryDate: { type: Date, default: null },
        blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        unblockDate: { type: Date, default: null },
        unblockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
    }],
    
    // ============ ESTADÍSTICAS DE PERFIL ============
    profileViews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        viewedAt: { type: Date, default: Date.now }
    }],
    profileViewsCount: { type: Number, default: 0 },
    
    // ============ INTERACCIONES ============
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],  // ✅ NUEVO
    followingChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    
    // ✅ UNIFICADO: Solo usar estos dos campos para seguir usuarios
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],   // Usuarios que me siguen
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],   // Usuarios que sigo
    
    // ============ CANALES DEL USUARIO ============
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],  // Canales que posee
    
    // ============ ÚLTIMO INICIO DE SESIÓN ============
    lastLogin: { type: Date, default: Date.now },
    online: { type: Boolean, default: false }
    
}, { timestamps: true });

// ============================================
// 🔧 ÍNDICES
// ============================================
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ assignedCategories: 1 });
userSchema.index({ assignedSubCategories: 1 });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });  // Para ordenar por fecha

// ============================================
// 📌 MÉTODOS DEL MODELO
// ============================================

// Verificar si puede moderar una categoría
userSchema.methods.canModerate = function(categorySlug, subCategorySlug = null) {
    if (this.role === 'admin') return true;
    if (this.role === 'moderator') {
        if (this.canApproveAllCategories) return true;
        if (subCategorySlug && this.assignedSubCategories.includes(subCategorySlug)) return true;
        if (categorySlug && this.assignedCategories.includes(categorySlug)) return true;
    }
    return false;
};

// Obtener datos de moderación asignados
userSchema.methods.getAssignedData = function() {
    return {
        categories: this.assignedCategories || [],
        subCategories: this.assignedSubCategories || [],
        canApproveAll: this.canApproveAllCategories || false
    };
};

// Obtener todos los canales del usuario
userSchema.methods.getUserChannels = async function() {
    const Channel = mongoose.model('Channel');
    return await Channel.find({ owner: this._id });
};

// Verificar si sigue un canal específico
userSchema.methods.isFollowingChannel = function(channelId) {
    return this.followingChannels.some(id => id.toString() === channelId.toString()) || false;
};

// Seguir/Dejar de seguir canal
userSchema.methods.toggleFollowChannel = async function(channelId) {
    const index = this.followingChannels.findIndex(id => id.toString() === channelId.toString());
    let isNowFollowing = false;
    
    if (index === -1) {
        this.followingChannels.push(channelId);
        isNowFollowing = true;
    } else {
        this.followingChannels.splice(index, 1);
        isNowFollowing = false;
    }
    
    await this.save();
    return isNowFollowing;
};

// Verificar si sigue un usuario
userSchema.methods.isFollowingUser = function(userId) {
    return this.following.some(id => id.toString() === userId.toString()) || false;
};

// Seguir/Dejar de seguir usuario
userSchema.methods.toggleFollowUser = async function(userId) {
    const index = this.following.findIndex(id => id.toString() === userId.toString());
    let isNowFollowing = false;
    
    if (index === -1) {
        this.following.push(userId);
        isNowFollowing = true;
    } else {
        this.following.splice(index, 1);
        isNowFollowing = false;
    }
    
    await this.save();
    return isNowFollowing;
};

// Verificar si tiene plan activo
userSchema.methods.hasActivePlan = function() {
    if (this.channelPlan === 'free') return true;
    if (!this.channelPlanExpiresAt) return true;
    return new Date() < new Date(this.channelPlanExpiresAt);
};

// Obtener nombre del plan formateado
userSchema.methods.getPlanName = function() {
    const plans = {
        free: 'Gratuit',
        basic: 'Basique',
        pro: 'Professionnel',
        business: 'Entreprise'
    };
    return plans[this.channelPlan] || 'Gratuit';
};

// Verificar si el usuario está bloqueado permanentemente
userSchema.methods.isPermanentlyBlocked = function() {
    if (!this.isBlocked) return false;
    if (!this.blockDetails.blockExpiryDate) return true; // Bloqueo permanente
    return new Date() < new Date(this.blockDetails.blockExpiryDate);
};

// Obtener tiempo restante de bloqueo
userSchema.methods.getBlockTimeRemaining = function() {
    if (!this.isBlocked) return null;
    if (!this.blockDetails.blockExpiryDate) return 'Permanent';
    const remaining = new Date(this.blockDetails.blockExpiryDate) - new Date();
    if (remaining <= 0) return 'Expiré';
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
};
userSchema.methods.startTrial = async function() {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 5); // 5 días
    this.trialStartDate = new Date();
    this.trialEndDate = trialEnd;
    this.trialUsed = true;
    this.isTrialExpired = false;
    this.channelPlan = 'free'; // Plan base mientras está en prueba
    await this.save();
    return this;
};

// Verificar si el usuario puede crear un canal (trial o plan de pago)
userSchema.methods.canCreateChannel = async function() {
    // Si ya tiene un plan de pago activo, puede crear según límites (se validará en el controlador)
    if (this.hasActivePlan() && this.channelPlan !== 'free') {
        return true;
    }
    // Si no tiene plan de pago, solo puede tener un canal de prueba si no ha expirado
    const Channel = mongoose.model('Channel');
    const existingActiveChannel = await Channel.findOne({ 
        owner: this._id, 
        status: { $in: ['approved', 'pending'] },
        isActive: true 
    });
    if (existingActiveChannel) return false; // Ya tiene un canal activo (trial)
    
    // Si nunca usó el trial o aún no ha expirado
    if (!this.trialUsed) return true;
    if (this.trialUsed && this.trialEndDate && new Date() < this.trialEndDate) return false; // Ya tiene un canal activo, no puede crear otro
    return false; // Trial expirado y sin plan
};

// Obtener días restantes del trial (0 si no está en trial)
userSchema.methods.getTrialDaysRemaining = function() {
    if (!this.trialUsed || !this.trialEndDate) return 0;
    const diff = new Date(this.trialEndDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
module.exports = mongoose.model('user', userSchema);
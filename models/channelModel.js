// backend/models/Channel.js - CON LOGS DE DEPURACIÓN (CORREGIDO)

const mongoose = require('mongoose');
const { applyReviewableMixin } = require('./mixins/reviewableFields');

 
const channelSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: { type: String, required: true, unique: true, trim: true },
    activity: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    
    avatar: { type: Array, default: [] },
    cover: { type: Array, default: [] },
   
    phone: { type: String, trim: true, default: '' },
    phoneHidden: { type: Boolean, default: false },
    email: { type: String, trim: true, lowercase: true, default: '' },
    website: { type: String, trim: true, default: '' },
    wilaya: { type: String, trim: true, index: true, default: '' },
    commune: { type: String, trim: true, default: '' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    
    delivery: {
        available: { type: Boolean, default: false },
        cost: { type: Number, default: 0 },
        estimatedDays: { type: Number, default: 0 },
        zones: [{ type: String }]
    },
    businessHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    followersCount: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    trialChannel: { type: Boolean, default: false },
    trialExpiresAt: { type: Date, default: null },    isExpired: { type: Boolean, default: false },     // Si el canal ha expirado (para ocultarlo)


    settings: {
        allowComments: { type: Boolean, default: true },
        allowSharing: { type: Boolean, default: true },
        moderateComments: { type: Boolean, default: false }
    }
}, { timestamps: true });

console.log('🔍 3. Antes del mixin - Campos del schema:', Object.keys(channelSchema.paths).length);

// ✅ APLICAR MIXIN DE REVISIÓN
if (applyReviewableMixin) {
    applyReviewableMixin(channelSchema, { addIndexes: true });
    console.log('🔍 4. Mixin aplicado correctamente');
} else {
    console.log('❌ 4. ERROR: applyReviewableMixin no existe o no está definido');
}

console.log('🔍 5. Después del mixin - Campos del schema:', Object.keys(channelSchema.paths).length);
console.log('🔍 6. ¿Tiene campo "pendiente"?', channelSchema.paths['pendiente'] ? 'SÍ ✅' : 'NO ❌');
console.log('🔍 7. ¿Tiene campo "status"?', channelSchema.paths['status'] ? 'SÍ ✅' : 'NO ❌');

// ============================================
// 🔧 ÍNDICES ADICIONALES
// ============================================
channelSchema.index({ location: '2dsphere' });
channelSchema.index({ wilaya: 1, commune: 1 });
channelSchema.index({ owner: 1 });
channelSchema.index({ name: 'text' });
channelSchema.index({ slug: 1 }, { unique: true });

// ============================================
// 📌 MÉTODOS ESPECÍFICOS DEL CANAL
// ============================================

// Seguir/Dejar de seguir canal
channelSchema.methods.toggleFollow = async function(userId) {
    const index = this.followers.indexOf(userId);
    let isFollowing = false;
    if (index === -1) {
        this.followers.push(userId);
        isFollowing = true;
    } else {
        this.followers.splice(index, 1);
        isFollowing = false;
    }
    this.followersCount = this.followers.length;
    await this.save();
    return { isFollowing, followersCount: this.followersCount };
};
channelSchema.methods.expireTrial = async function() {
    if (this.trialChannel && !this.isExpired()) {
        this.status = 'expired';
        this.isActive = false;
        await this.save();
    }
    return this;
};

// Método renombrado para evitar colisión con algún campo 'isExpired'
channelSchema.methods.isTrialExpired = function() {
    return this.status === 'expired' || (this.trialExpiresAt && new Date() > this.trialExpiresAt);
};
// ✅ CORREGIDO: Error de sintaxis en el aggregate
channelSchema.methods.updateStats = async function() {
    const Video = mongoose.model('Video');
    const stats = await Video.aggregate([
        { $match: { channel: this._id, isActive: true, pendiente: false } },
        { $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } }  // ✅ CORREGIDO
        }}
    ]);
    if (stats.length) {
        this.totalVideos = stats[0].totalVideos;
        this.totalViews = stats[0].totalViews;
        this.totalLikes = stats[0].totalLikes;
    } else {
        this.totalVideos = 0;
        this.totalViews = 0;
        this.totalLikes = 0;
    }
    await this.save();
    return this;
};

const Channel = mongoose.model('Channel', channelSchema);
console.log('🔍 8. Modelo creado correctamente');
console.log('🔍 9. Campos finales del modelo:', Object.keys(Channel.schema.paths).length);

module.exports = Channel;
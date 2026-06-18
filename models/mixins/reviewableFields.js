// backend/models/mixins/ReviewableMixin.js

/**
 * 📋 ReviewableMixin - Mixin para modelos que requieren revisión (aprobación/rechazo)
 * 
 * Este mixin añade campos y métodos comunes para:
 * - Channel (canales comerciales)
 * - Video (videos comerciales)
 * - Product (productos)
 * - etc.
 */

const mongoose = require('mongoose');

// ============================================
// 📋 CAMPOS PARA EL MIXIN
// ============================================
const reviewableFields = {
    // ============ ESTADOS DEL CONTENIDO ============
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'deleted', 'draft', 'expired'],
        default: 'pending',
        index: true
    },
    
    // Para compatibilidad con código legacy
    pendiente: {
        type: Boolean,
        default: true,
        index: true
    },
    
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    
    // ============ CAMPOS PARA APROBACIÓN ============
    approvedAt: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    
    // ============ CAMPOS PARA RECHAZO ============
    rejectionReason: {
        type: String,
        default: ''
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    
    // ============ CAMPOS PARA REENVÍO ============
    resubmittedAt: {
        type: Date,
        default: null
    },
    resubmittedCount: {
        type: Number,
        default: 0
    },
    
    // ============ CAMPOS PARA ELIMINACIÓN (soft delete) ============
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    deletionReason: {
        type: String,
        default: ''
    },
    
    // ============ AUDITORÍA ============
    reviewHistory: [{
        action: {
            type: String,
            enum: ['submitted', 'approved', 'rejected', 'resubmitted', 'deleted'],
            required: true
        },
        reason: { type: String, default: '' },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        at: { type: Date, default: Date.now }
    }]
};

// ============================================
// 📌 MÉTODOS PARA EL MIXIN
// ============================================

const reviewableMethods = {
    // ✅ Aprobar contenido
    async approve(adminId, reason = null) {
        this.status = 'approved';
        this.pendiente = false;
        this.isActive = true;
        this.approvedAt = new Date();
        this.approvedBy = adminId;
        this.rejectionReason = '';
        
        // Registrar en historial
        this.reviewHistory.push({
            action: 'approved',
            reason: reason || 'Approuvé par l\'administrateur',
            by: adminId,
            at: new Date()
        });
        
        await this.save();
        return this;
    },
    
    // ✅ Rechazar contenido
    async reject(adminId, reason) {
        this.status = 'rejected';
        this.pendiente = false;
        this.isActive = false;
        this.rejectedAt = new Date();
        this.rejectedBy = adminId;
        this.rejectionReason = reason || 'Contenu non conforme';
        
        // Registrar en historial
        this.reviewHistory.push({
            action: 'rejected',
            reason: this.rejectionReason,
            by: adminId,
            at: new Date()
        });
        
        await this.save();
        return this;
    },
    
    // ✅ Reenviar para aprobación (después de rechazo)
    async resubmit(userId) {
        this.status = 'pending';
        this.pendiente = true;
        this.isActive = true;
        this.rejectionReason = '';
        this.resubmittedAt = new Date();
        this.resubmittedCount = (this.resubmittedCount || 0) + 1;
        
        // Registrar en historial
        this.reviewHistory.push({
            action: 'resubmitted',
            reason: `Ré-soumission #${this.resubmittedCount}`,
            by: userId,
            at: new Date()
        });
        
        await this.save();
        return this;
    },
    
    // ✅ Eliminar (soft delete)
    async softDelete(userId, reason = null) {
        this.status = 'deleted';
        this.pendiente = false;
        this.isActive = false;
        this.deletedAt = new Date();
        this.deletedBy = userId;
        this.deletionReason = reason || 'Supprimé par l\'utilisateur';
        
        // Registrar en historial
        this.reviewHistory.push({
            action: 'deleted',
            reason: this.deletionReason,
            by: userId,
            at: new Date()
        });
        
        await this.save();
        return this;
    },
    
    // ✅ Restaurar (después de soft delete)
    async restore() {
        if (this.status === 'deleted') {
            // Volver al estado anterior (pending)
            this.status = 'pending';
            this.pendiente = true;
            this.isActive = true;
            this.deletedAt = null;
            this.deletedBy = null;
            this.deletionReason = '';
            
            // Registrar en historial
            this.reviewHistory.push({
                action: 'resubmitted',
                reason: 'Restauré après suppression',
                by: this.owner || this.user,
                at: new Date()
            });
            
            await this.save();
        }
        return this;
    },
    
    // ✅ Verificar si el contenido es visible para el público
    isPubliclyVisible() {
        return this.status === 'approved' && this.isActive === true && this.pendiente === false;
    },
    
    // ✅ Verificar si el dueño puede editarlo
    canEdit() {
        return this.status !== 'deleted';
    },
    
    // ✅ Obtener el estado legible
    getStatusText() {
        const statusMap = {
            'pending': 'En attente d\'approbation',
            'approved': 'Approuvé',
            'rejected': 'Rejeté',
            'deleted': 'Supprimé',
            'draft': 'Brouillon',
            'expired': 'dark'   // ← añadido
        };
        return statusMap[this.status] || 'Inconnu';
    },
    
    // ✅ Obtener el color del estado (para badges)
    getStatusColor() {
        const colorMap = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'deleted': 'secondary',
            'draft': 'secondary',
            'expired': 'Essai expiré'   // ← añadido
        };
        return colorMap[this.status] || 'secondary';
    },
    
    // ✅ Obtener historial de revisiones
    getReviewHistory() {
        return this.reviewHistory || [];
    }
};

// ============================================
// 📌 HOOKS (Middleware) para el mixin
// ============================================

const reviewableHooks = function(schema) {
    // Pre-save: Sincronizar status con pendiente
    schema.pre('save', function(next) {
        // Sincronizar status con pendiente
        if (this.isModified('status')) {
            if (this.status === 'pending') {
                this.pendiente = true;
                this.isActive = true;
            } else if (this.status === 'approved') {
                this.pendiente = false;
                this.isActive = true;
            } else if (this.status === 'rejected') {
                this.pendiente = false;
                this.isActive = false;
            } else if (this.status === 'deleted') {
                this.pendiente = false;
                this.isActive = false;
            }
        }
        
        // Sincronizar pendiente con status
        if (this.isModified('pendiente')) {
            if (this.pendiente === true && this.status === 'approved') {
                this.status = 'pending';
            } else if (this.pendiente === false && this.status === 'pending') {
                this.status = 'approved';
            }
        }
        
        next();
    });
};

// ============================================
// 📤 EXPORTAR MIXIN
// ============================================

module.exports = {
    reviewableFields,
    reviewableMethods,
    reviewableHooks,
    
    // Helper para aplicar el mixin a cualquier schema
    applyReviewableMixin(schema, options = {}) {
        // Añadir campos
        schema.add(reviewableFields);
        
        // Añadir métodos
        Object.keys(reviewableMethods).forEach(methodName => {
            if (!schema.methods[methodName]) {
                schema.methods[methodName] = reviewableMethods[methodName];
            }
        });
        
        // Añadir hooks
        reviewableHooks(schema);
        
        // Añadir índices (opcional)
        if (options.addIndexes !== false) {
            schema.index({ status: 1, pending: 1 });
            schema.index({ approvedAt: -1 });
            schema.index({ rejectedAt: -1 });
        }
        
        return schema;
    }
};
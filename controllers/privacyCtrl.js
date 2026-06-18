const User = require('../models/userModel')
const PrivacySettings = require('../models/privacyModel')
const privacyCtrl = {

// Agrega este endpoint temporal para diagnóstico
diagnostic: async (req, res) => {
    try {
        // 1. Verificar si el documento existe
        const settings = await PrivacySettings.findOne({ user: req.user._id });
        console.log('Documento completo:', settings);
        
        // 2. Verificar valores individuales
        if (settings) {
            console.log('Valores individuales:');
            console.log('profile:', settings.profile);
            console.log('posts:', settings.posts);
            console.log('email:', settings.email);
        }
        
        // 3. Contar documentos existentes
        const count = await PrivacySettings.countDocuments();
        console.log('Total de documentos PrivacySettings:', count);
        
        res.json({ 
            exists: !!settings,
            document: settings,
            totalDocuments: count
        });
        
    } catch (err) {
        console.error('Error diagnóstico:', err);
        res.status(500).json({ error: err.message });
    }
},

getPrivacySettings: async (req, res) => {
    try {
        let privacySettings = await PrivacySettings.findOne({ 
            user: req.user._id 
        });

        if (!privacySettings) {
            // Crear configuración por defecto si no existe
            privacySettings = await PrivacySettings.create({
                user: req.user._id
            });
        }

        // Definir los defaults
        const defaults = {
            profile: 'public',
            posts: 'public',
            followers: 'public',
            following: 'public',
            likes: 'public',
            email: 'private',
            address: 'private',
            mobile: 'private'
        };

        // Combinar lo que viene de Mongo con los defaults
        const completeSettings = {
            ...defaults,
            ...privacySettings.toObject()
        };

        return res.json({ privacySettings: completeSettings });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},


    // controllers/privacyController.js
updatePrivacySettings: async (req, res) => {
    try {
        const { profile, posts, followers, following, likes, email, address, mobile } = req.body;
        
        // Filtrar campos nulos y usar valores por defecto
        const updateData = {
            profile: profile || 'public',
            posts: posts || 'public',
            followers: followers || 'public',
            following: following || 'public',
            likes: likes || 'public',
            email: email || 'private',
            address: address || 'private',
            mobile: mobile || 'private'
        };
        
        const updatedSettings = await PrivacySettings.findOneAndUpdate(
            { user: req.user._id },
            updateData,
            { new: true, upsert: true }
        );
        
        res.json({ 
            msg: 'Configuración de privacidad actualizada',
            privacySettings: updatedSettings 
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
}
}

module.exports = privacyCtrl;
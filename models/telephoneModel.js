const mongoose = require('mongoose');
const BasePost = require('./BasePost');

const telephoneSchema = new mongoose.Schema({
    // 🔷 TIPO Y CATEGORÍA
    subCategory: {
        type: String,
        required: true,
        enum: [
            'smartphone', 'telephone_basique', 'tablette',
            'accessoire_telephone', 'chargeur', 'casque_ecouteurs',
            'batterie_externe', 'etui_protection', 'montre_connectee'
        ]
    },
    
    // 🔷 ESPECIFICACIONES TÉCNICAS
    brand: {
        type: String,
        required: true
    },
    model: String,
    reference: String,
    
    // 🔷 CONDICIÓN
    condition: {
        type: String,
        enum: ['neuf', 'reconditionné', 'occasion_bon_etat', 'occasion_etat_moyen'],
        required: true
    },
    
    // 🔷 CARACTERÍSTICAS TÉCNICAS
    storage: String,        // Capacidad de almacenamiento
    ram: String,           // Memoria RAM
    color: String,
    os: String,            // Sistema operativo
    screenSize: String,    // Tamaño de pantalla
    camera: String,        // Cámara
    battery: String,       // Batería
    
    // 🔷 PARA SMARTPHONES
    network: [String],     // 4G, 5G, etc.
    dualSim: Boolean,
    chargerType: String,
    
    // 🔷 PARA ACCESORIOS
    accessoryType: String,
    compatibility: [String],
    powerCapacity: String, // Para powerbanks
    connectionType: String // Para audífonos
    
}, {
    discriminatorKey: 'kind'
});

const Telephone = BasePost.discriminator('Telephone', telephoneSchema);

module.exports = Telephone;
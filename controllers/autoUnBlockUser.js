const BlockUser = require('../models/blockModel');

const autoUnblockUsers = async () => {
    try {
        const now = new Date(); // Fecha actual
        const expiredBlocks = await BlockUser.find({ 
            fechaLimite: { $lte: now }, 
            esBloqueado: true 
        });

        for (const block of expiredBlocks) {
            await BlockUser.findByIdAndDelete(block._id);
            console.log(`🔓 Usuario desbloqueado automáticamente: ${block.user}`);
        }                   
    } catch (error) {
        console.error('❌ Error en autoUnblockUsers:', error);
    }
};

module.exports = { autoUnblockUsers };

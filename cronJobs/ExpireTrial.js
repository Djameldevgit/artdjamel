// jobs/expireTrials.js
const cron = require('node-cron');
const User = require('../models/userModel');
const Channel = require('..//models/channelModel');
const Video = require('../models/videoModel');

const expireTrialsJob = async () => {
    console.log('🔍 Exécution de la routine de nettoyage des essais...', new Date().toISOString());
    const now = new Date();

    // 1. Marcar canales trial expirados (aprobados y con trialExpiresAt pasado)
    const expiredChannels = await Channel.find({
        trialChannel: true,
        status: 'approved',
        trialExpiresAt: { $lt: now }
    });
    for (const channel of expiredChannels) {
        channel.status = 'expired';
        channel.pendiente = false;
        channel.isActive = false;
        await channel.save();
        console.log(`⏰ Canal trial expiré : ${channel.name} (${channel._id})`);
    }

    // 2. Eliminar canales expirados hace más de 3 días
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const channelsToDelete = await Channel.find({
        status: 'expired',
        trialExpiresAt: { $lt: threeDaysAgo }
    });
    for (const channel of channelsToDelete) {
        await Video.deleteMany({ channel: channel._id });
        await channel.deleteOne();
        console.log(`🗑️ Canal trial supprimé définitivement : ${channel.name}`);
    }

    // 3. Eliminar usuarios inactivos (trial expirado hace más de 5 días y sin plan de pago)
    const fiveDaysAfterExpiry = new Date();
    fiveDaysAfterExpiry.setDate(fiveDaysAfterExpiry.getDate() - 5);
    const usersToDelete = await User.find({
        trialUsed: true,
        trialEndDate: { $lt: fiveDaysAfterExpiry },
        $or: [
            { channelPlan: 'free' },
            { channelPlanExpiresAt: { $lt: now } },
            { channelPlanExpiresAt: { $exists: false } }
        ]
    });
    for (const user of usersToDelete) {
        await Channel.deleteMany({ owner: user._id });
        await Video.deleteMany({ user: user._id });
        await user.deleteOne();
        console.log(`👤 Utilisateur supprimé pour inactivité : ${user.email}`);
    }
};

// Iniciar el cron job (se ejecuta todos los días a las 2:00 AM)
const startExpiryJob = () => {
    cron.schedule('0 2 * * *', expireTrialsJob);
    console.log('✅ Cron job de expiration des essais programmé (2:00 AM)');
};

module.exports = { startExpiryJob };
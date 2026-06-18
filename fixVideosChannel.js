// node fixVideosChannel.js
// Ejecutar: node scripts/fixVideosChannel.js
// Este script actualiza los videos que no tienen channel o tienen channel incorrecto

require('dotenv').config();
const mongoose = require('mongoose');
const Channel = require('./models/channelModel');

// Importar modelos
//const Video = require('../models/v');
//const Channel = require('../models/channelModel');
const User = require('./models/userModel');
//const User = require('../models/userModel');
const Video = require('./models/videoModel');
 
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/VideoCommerce';

const checkVideosPopulation = async () => {
  try {
    console.log('🔍 Verificando población de canales en videos...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Verificar videos SIN populate
    console.log('📹 VIDEOS SIN POPULATE:');
    console.log('-'.repeat(50));
    
    const videosRaw = await Video.find().limit(5).lean();
    for (const video of videosRaw) {
      console.log(`   ID: ${video._id}`);
      console.log(`   Título: ${video.title}`);
      console.log(`   Channel ID (raw): ${video.channel}`);
      console.log(`   Tipo de channel: ${typeof video.channel}`);
      console.log('   ---');
    }

    // 2. Verificar videos CON populate
    console.log('\n📹 VIDEOS CON POPULATE:');
    console.log('-'.repeat(50));
    
    const videosPopulated = await Video.find()
      .limit(5)
      .populate('channel', 'name avatar _id')
      .lean();
    
    for (const video of videosPopulated) {
      console.log(`   ID: ${video._id}`);
      console.log(`   Título: ${video.title}`);
      console.log(`   Channel poblado: ${video.channel ? '✅ SÍ' : '❌ NO'}`);
      if (video.channel) {
        console.log(`     - ID del canal: ${video.channel._id}`);
        console.log(`     - Nombre del canal: ${video.channel.name}`);
        console.log(`     - Avatar: ${video.channel.avatar}`);
      } else {
        console.log(`     - Channel ID raw: ${video.channel}`);
      }
      console.log('   ---');
    }

    // 3. Verificar canales existentes
    console.log('\n📺 CANALES EXISTENTES:');
    console.log('-'.repeat(50));
    
    const channels = await Channel.find().limit(5);
    for (const channel of channels) {
      console.log(`   ID: ${channel._id}`);
      console.log(`   Nombre: ${channel.name}`);
      console.log(`   Owner: ${channel.owner}`);
      console.log('   ---');
    }

    // 4. Verificar coincidencias
    console.log('\n🔗 VERIFICANDO COINCIDENCIAS:');
    console.log('-'.repeat(50));
    
    const allVideos = await Video.find().lean();
    const allChannels = await Channel.find().lean();
    const channelIds = new Set(allChannels.map(c => c._id.toString()));
    
    let mismatches = 0;
    for (const video of allVideos) {
      if (video.channel && !channelIds.has(video.channel.toString())) {
        console.log(`⚠️  Video "${video.title}" tiene channel ID que no existe: ${video.channel}`);
        mismatches++;
      }
    }
    
    if (mismatches === 0) {
      console.log('✅ Todos los channel IDs de videos existen en la colección de canales');
    } else {
      console.log(`❌ ${mismatches} videos tienen channel IDs inválidos`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkVideosPopulation();
// node scripts/videoPublicId.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bazardjamel';

async function connectDB() {
  console.log('🔌 Conectando a MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado a MongoDB\n');
}

async function disconnectDB() {
  await mongoose.disconnect();
  process.exit(0);
}

const Video = mongoose.model('Video', new mongoose.Schema({}, { strict: false }), 'videos');

function cleanPublicId(publicId) {
  if (!publicId) return null;
  
  // Si tiene l_audio:, eliminar esa parte
  if (publicId.includes('l_audio:')) {
    // Extraer solo la parte después de l_audio:
    const match = publicId.match(/l_audio:([^,]+)/);
    if (match) {
      let cleaned = match[1];
      // Reemplazar : por / (Cloudinary usa / en lugar de :)
      cleaned = cleaned.replace(/:/g, '/');
      return cleaned;
    }
  }
  
  return publicId;
}

async function cleanVideoPublicIds() {
  console.log('🧹 ============ LIMPIANDO VIDEO PUBLIC IDS ============\n');
  
  const videos = await Video.find({}).lean();
  console.log(`📊 Total videos: ${videos.length}\n`);
  
  let updated = 0;
  
  for (const video of videos) {
    let needsUpdate = false;
    const updates = {};
    
    // Limpiar videoPublicId
    if (video.videoPublicId && video.videoPublicId.includes('l_audio:')) {
      const cleaned = cleanPublicId(video.videoPublicId);
      if (cleaned && cleaned !== video.videoPublicId) {
        updates.videoPublicId = cleaned;
        needsUpdate = true;
        console.log(`📹 ${video.title}:`);
        console.log(`   ANTES: ${video.videoPublicId}`);
        console.log(`   DESPUÉS: ${cleaned}\n`);
      }
    }
    
    // Limpiar music.audioPublicId si existe y está mal
    if (video.music && video.music.audioPublicId && video.music.audioPublicId.includes('l_audio:')) {
      const cleaned = cleanPublicId(video.music.audioPublicId);
      if (cleaned && cleaned !== video.music.audioPublicId) {
        updates['music.audioPublicId'] = cleaned;
        needsUpdate = true;
        console.log(`🎵 ${video.music.title}:`);
        console.log(`   ANTES: ${video.music.audioPublicId}`);
        console.log(`   DESPUÉS: ${cleaned}\n`);
      }
    }
    
    // Extraer de la URL si no hay publicId válido
    if (!video.videoPublicId || video.videoPublicId.includes('l_audio:')) {
      const url = video.videoUrl;
      if (url && url.includes('cloudinary.com')) {
        // Extraer public_id de la URL sin transformaciones
        const urlMatch = url.match(/\/upload\/(?:v\d+\/)?(?:l_audio:[^,]+,)?([^/.]+)\/([^/.]+)\.(mp4|mov)/);
        if (urlMatch) {
          const folder = urlMatch[1];
          const filename = urlMatch[2];
          const correctId = `${folder}/${filename}`;
          if (correctId && !correctId.includes('l_audio')) {
            updates.videoPublicId = correctId;
            needsUpdate = true;
            console.log(`📹 ${video.title} (desde URL):`);
            console.log(`   NUEVO ID: ${correctId}\n`);
          }
        }
      }
    }
    
    if (needsUpdate) {
      await Video.updateOne({ _id: video._id }, { $set: updates });
      updated++;
    }
  }
  
  console.log(`\n✅ Limpiados ${updated} videos`);
}

async function main() {
  try {
    await connectDB();
    await cleanVideoPublicIds();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await disconnectDB();
  }
}

main();
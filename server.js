require('dotenv').config()
//require('./cronJobs/DeleteUsersNoVerified');
//const { autoUnblockUsers } = require('./controllers/autoUnBlockUser');

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const axios = require('axios');
const path = require('path')
 
 
// --- Cloudinary ---
const cloudinary = require('cloudinary').v2;
 
// ============================================
// 1️⃣ INICIALIZAR APP
// ============================================
const app = express()

// ============================================
// 2️⃣ MIDDLEWARES GLOBALES
// ============================================
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(morgan('dev'));

// ============================================
// 3️⃣ SOCKET.IO
// ============================================
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const SocketServer = require('./socketServer')

io.on('connection', socket => {
    SocketServer(socket)
})

// ============================================
// 4️⃣ CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
    cloud_name: 'dfjipgj2o',
    api_key: '213981915435275',
    api_secret: 'wv_IiCM9zzhdiWDNXXo8HZi7wX4'
});
console.log('☁️ Cloudinary configurado correctamente');

// ============================================
// 5️⃣ RUTAS API (organizadas por categoría)
// ============================================
// server.js (o app.js)

// Proxy para audio de Jamendo (para que Cloudinary pueda acceder)
app.get('/api/music/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing audio url' });
  
  console.log(`🎵 Proxy solicitando: ${url.substring(0, 150)}...`);
  
  try {
      const response = await axios({
          method: 'GET',
          url: url,
          responseType: 'stream',
          timeout: 60000, // ✅ 60 segundos timeout
          headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
              'Accept-Encoding': 'identity', // ✅ Evitar compresión
              'Connection': 'keep-alive'
          },
          maxRedirects: 5,
          validateStatus: (status) => status === 200
      });
      
      // ✅ Verificar headers
      const contentType = response.headers['content-type'];
      console.log(`🎵 Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.includes('audio')) {
          console.warn(`⚠️ Content-Type inesperado: ${contentType}`);
      }
      
      res.setHeader('Content-Type', contentType || 'audio/mpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // ✅ Manejar errores del stream
      response.data.on('error', (streamError) => {
          console.error('❌ Error en stream:', streamError.message);
          if (!res.headersSent) {
              res.status(500).json({ error: 'Stream error' });
          }
      });
      
      response.data.pipe(res);
      
  } catch (err) {
      console.error('❌ Error proxy audio:', err.message);
      
      // ✅ Manejo específico de errores
      if (err.code === 'ETIMEDOUT') {
          res.status(504).json({ error: 'Timeout al obtener audio (30s)' });
      } else if (err.code === 'ECONNRESET') {
          res.status(500).json({ error: 'Conexión reiniciada' });
      } else if (err.response) {
          res.status(err.response.status).json({ error: `Error ${err.response.status}` });
      } else {
          res.status(500).json({ error: err.message });
      }
  }
});
 
// --- Autenticación y Usuarios ---
app.use('/api', require('./routes/authRouter'));
app.use('/api', require('./routes/userRouter'));
app.use('/api', require('./routes/userActionRouter'));
app.use('/api', require('./routes/rolesRouter'));
//app.use('/api', require('./routes/chargilyPlanRouter'));
// --- Categorías (SOLO UNA VEZ) ---
app.use('/api/categories', require('./routes/categoryRouter'));  // ✅ Esta se queda
app.use('/api', require('./routes/cartRouter'));
 app.use('/api', require('./routes/orderRouter'));
app.use('/api', require('./routes/commentRouter'));
app.use('/api', require('./routes/donationRouter'));
// --- Mensajes y Notificaciones ---
app.use('/api', require('./routes/messageRouter'));
app.use('/api', require('./routes/notifyRouter'));

// --- Reportes y Bloqueos ---
app.use('/api', require('./routes/reportRouter'));


// --- Videos, Canales, Imágenes ---
app.use('/api', require('./routes/videoRouter'));
 
app.use('/api', require('./routes/imageRouter'));

// --- Configuración y Settings ---
app.use('/api', require('./routes/languageRouter'));
app.use('/api', require('./routes/privacysettingsRouter'));
app.use("/api", require("./routes/settingsRouter"));
app.use('/api', require('./routes/carouselHomeRouter'));

// --- Formularios y Blogs ---
app.use('/api/blog/comments', require('./routes/blogCommentRoutes'));
const URI = process.env.MONGODB_URI;
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log('✅ Connected to mongodb')
})

// ============================================
 
// ============================================
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

// ============================================
// 9️⃣ INICIAR SERVIDOR
// ============================================
const port = process.env.PORT || 5000
http.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
})
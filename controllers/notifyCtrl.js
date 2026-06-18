const Notifies = require('../models/notifyModel')
const Users = require('../models/userModel')

const notifyCtrl = {
    createNotify: async (req, res) => {
        try {
          const { id, recipients, url, text, content, image, type } = req.body;
          
          console.log('📨 Notificación recibida en backend:', { recipients, text, type });
          
          let finalRecipients = [];
          
          for (let recipient of recipients) {
            if (recipient === "admin") {
              // Buscar todos los admins
              const admins = await Users.find({ role: "admin" }).select('_id');
              const adminIds = admins.map(admin => admin._id.toString());
              finalRecipients.push(...adminIds);
              console.log('👑 Admins encontrados:', adminIds);
            } else {
              finalRecipients.push(recipient);
            }
          }
          
          // Eliminar duplicados
          finalRecipients = [...new Set(finalRecipients)];
          
          console.log('👥 Recipients finales:', finalRecipients);
          
          if (finalRecipients.length === 0) {
            return res.json({ notify: null, msg: "No recipients" });
          }
    
          const notify = new Notifies({
            id,
            recipients: finalRecipients,
            url,
            text,
            content,
            image,
            type,
            user: req.user._id,
            isRead: false
          });
    
          await notify.save();
          
          // Emitir socket
          const io = req.app.get('io');
          if (io) {
            finalRecipients.forEach(recipientId => {
              io.to(recipientId.toString()).emit('createNotify', {
                ...notify.toObject(),
                user: {
                  _id: req.user._id,
                  username: req.user.username,
                  avatar: req.user.avatar
                }
              });
            });
          }
          
          return res.json({ notify });
          
        } catch (err) {
          console.error('❌ Error en createNotify:', err);
          return res.status(500).json({ msg: err.message });
        }
       
    },
    removeNotify: async (req, res) => {
        try {
            const notify = await Notifies.findOneAndDelete({
                id: req.params.id, url: req.query.url
            })
            
            return res.json({notify})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.find({recipients: req.user._id})
            .sort('-createdAt').populate('user', 'avatar username')
            
            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    isReadNotify: async (req, res) => {
        try {
            const notifies = await Notifies.findOneAndUpdate({_id: req.params.id}, {
                isRead: true
            })

            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteAllNotifies: async (req, res) => {
        try {
            const notifies = await Notifies.deleteMany({recipients: req.user._id})
            
            return res.json({notifies})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}


module.exports = notifyCtrl
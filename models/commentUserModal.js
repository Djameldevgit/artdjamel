const mongoose = require('mongoose')
 
// Verifica que tu modelo tenga los campos correctos
const commentSchema = new mongoose.Schema({
     content: { 
      type: String, 
      required: [true, 'El contenido es requerido'],
      maxlength: [1000, 'Máximo 1000 caracteres']
    },
    blogAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestCommenterName: String
  }, { timestamps: true });
module.exports = mongoose.model('Comment', commentSchema);
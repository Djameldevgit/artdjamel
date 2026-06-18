const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "post",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user", // Usuario que fue reportado
      required: true,
    },
    reportedBy: {
      type: mongoose.Types.ObjectId,
      ref: "user", // Usuario que realizó la denuncia
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Previene que un usuario denuncie el mismo post más de una vez
reportSchema.index({ postId: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model('report', reportSchema);

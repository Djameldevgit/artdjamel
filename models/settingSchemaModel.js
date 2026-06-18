const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  images: { type: Boolean, default: false },
  style: { type: Boolean, default: false },
  ecommerce: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);

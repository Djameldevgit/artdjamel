const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  campo1: { type: Boolean, default: false },
  campo2: { type: Boolean, default: false },
  campo3: { type: Boolean, default: false },
  campo4: { type: Boolean, default: false },
  campo5: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Form", formSchema);

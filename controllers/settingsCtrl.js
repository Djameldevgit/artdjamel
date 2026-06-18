const Settings = require("../models/settingSchemaModel");

const settingsCtrl = {
  // Obtener configuración
  getSettings: async (req, res) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ msg: "Error al obtener configuración" });
    }
  },

  // Actualizar configuración
  updateSettings: async (req, res) => {
    try {
      const { images, style, ecommerce } = req.body;
      const settings = await Settings.findOneAndUpdate(
        {},
        { images, style, ecommerce },
        { new: true, upsert: true }
      );
      res.json({ msg: "Configuración actualizada", settings });
    } catch (err) {
      res.status(500).json({ msg: "Error al actualizar configuración" });
    }
  }
};

module.exports = settingsCtrl;

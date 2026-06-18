const Users = require('../models/userModel');

const langCtrl = {
  updateUserLanguage: async (req, res) => {
    const supportedLanguages = [ 'fr', 'ar',   'kab' ];
    const lang = req.params.lang;

    if (!supportedLanguages.includes(lang)) {
      return res.status(400).json({ msg: req.__('language.not_supported') });
    }

    await handleLanguageUpdate(req, res, lang, req.__('language.updated_to', { lang }));
  },

  // Para visitantes (no autenticados)
  setLanguagePublic: async (req, res) => {
    const { language } = req.body;
    if (!language) return res.status(400).json({ msg: req.__('language.not_specified') });

    try {
      res.cookie('lang', language, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
      });

      res.status(200).json({ msg: req.__('language.visitor_saved') });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: req.__('auth.server_error') });
    }
  }
};

// 👉 Función reutilizada para guardar el idioma y actualizar usuario (si está logueado)
const handleLanguageUpdate = async (req, res, language, successMsg) => {
  try {
    res.cookie('lang', language, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true
    });

    if (req.user && req.user._id) {
      const result = await Users.updateOne({ _id: req.user._id }, { language });

      if (result.modifiedCount === 0) {
        return res.status(404).json({ msg: req.__('language.not_updated') });
      }
    }

    return res.status(200).json({ msg: successMsg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: req.__('auth.server_error') });
  }
};

module.exports = langCtrl;

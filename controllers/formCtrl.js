const Form = require('../models/formModal');
const formCtrl = {

 
createForm : async (req, res) => {
  try {
    const newForm = new Form(req.body);
    await newForm.save();
    res.json(newForm); // 👈 incluye _id
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

// Actualizar un form
updateForm: async (req, res) => {
  try {
    const updated = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

// Obtener un form
getForm : async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    res.json(form);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
},

}
module.exports = formCtrl;

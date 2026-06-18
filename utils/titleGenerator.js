// utils/titleGenerator.js
function generateTitle(postData) {
    const { categorie, subCategory, categorySpecificData, operationType, propertyType } = postData;
  
    switch (categorie) {
  
      // 🚗 Vehículos
      case 'vehicule': {
        const brand = categorySpecificData.get('marque') || '';
        const model = categorySpecificData.get('modele') || '';
        const year = categorySpecificData.get('annee') || '';
        return [brand, model, year].filter(Boolean).join(' ').trim();
      }
  
      // 🏠 Inmobiliaria
      case 'immobilier': {
        const operation = operationType || '';  // ex: vente, achat, location
        const type = propertyType || categorySpecificData.get('type') || ''; // ex: villa, appartement
        const wilaya = categorySpecificData.get('wilaya') || '';
        const commune = categorySpecificData.get('commune') || '';
        return [operation, type, wilaya || commune].filter(Boolean).join(' - ').trim();
      }
  
      // 📱 Electrónica
      case 'electronique': {
        const marque = categorySpecificData.get('marque') || '';
        const modele = categorySpecificData.get('modele') || '';
        const etat = categorySpecificData.get('etat') || '';
        return [marque, modele, etat].filter(Boolean).join(' ');
      }
  
      // ⚙️ Por defecto
      default:
        return subCategory || categorie || 'Article';
    }
  }
  
  module.exports = generateTitle;
  
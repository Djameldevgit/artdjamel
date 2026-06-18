// 📂 utils/titleCategory.js

const buildTitleByCategory = (
  categorie,
  subCategory,
  articleType,
  categorySpecificData = {},
  wilaya,
  commune
) => {

  const data = categorySpecificData;

  // limpiar texto
  const clean = (str) => (str || "").toString().trim();

  const location = `${clean(wilaya)} ${clean(commune)}`.trim();



  // 🚗 VEHICULES
  if (categorie === "vehicules") {

    const marque = clean(data.marque);
    const modele = clean(data.modele);
    const annee = clean(data.annee);

    const title = `${marque} ${modele} ${annee} ${location}`;

    return title.replace(/\s+/g, " ").trim();
  }



  // 📱 TELEPHONES
  if (categorie === "telephones") {

    const marque = clean(data.marque);
    const modele = clean(data.modele);
    const stockage = clean(data.stockage);

    const title = `${marque} ${modele} ${stockage}`;

    return title.replace(/\s+/g, " ").trim();
  }



  // 🏠 IMMOBILIER
  if (categorie === "immobilier") {

    const action = clean(subCategory);   // Vente / Location
    const type = clean(articleType);     // Appartement / Studio
    const city = clean(wilaya);
    const area = clean(commune);

    const title = `${action} ${type} ${city} ${area}`;

    return title.replace(/\s+/g, " ").trim();
  }



  // 👕 VETEMENTS
  if (categorie === "vetements") {

    const type = clean(articleType);
    const livraison = data.livraisonDisponible === true;

    const title = livraison
      ? `${type} Livraison disponible`
      : `${type}`;

    return title.replace(/\s+/g, " ").trim();
  }



  // fallback
  return `${clean(subCategory)} ${location}`.replace(/\s+/g, " ").trim();
};


module.exports = buildTitleByCategory;
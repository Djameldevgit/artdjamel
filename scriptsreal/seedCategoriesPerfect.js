// 📂 backend/seed/seedCategoriesPerfect.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ Error de conexión a MongoDB:'));
db.once('open', async () => {
  console.log('✅ Conectado a MongoDB exitosamente');
  await seedCategories();
});

// Crear slug único
const createSlug = (text, existingSlugs = new Set()) => {
  let baseSlug = text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
};

// 🎯 ESTRUCTURA PERFECTA BASADA EN TUS ARCHIVOS ESTÁTICOS
const categoriesData = [
  // ==================== 1. VEHICULES ====================
  {
    name: 'Vehicules',
    slug: 'vehicules',
    level: 1,
    emoji: '🚗',
    order: 1,
    children: [
      { name: 'Voitures', slug: 'vehicules-voitures', level: 2, emoji: '🚗', order: 1, children: [] },
      { name: 'Utilitaire', slug: 'vehicules-utilitaire', level: 2, emoji: '🚐', order: 2, children: [] },
      { name: 'Motos & Scooters', slug: 'vehicules-motos-scooters', level: 2, emoji: '🏍️', order: 3, children: [] },
      { name: 'Quads', slug: 'vehicules-quads', level: 2, emoji: '🚜', order: 4, children: [] },
      { name: 'Fourgon', slug: 'vehicules-fourgon', level: 2, emoji: '🚚', order: 5, children: [] },
      { name: 'Camion', slug: 'vehicules-camion', level: 2, emoji: '🚛', order: 6, children: [] },
      { name: 'Bus', slug: 'vehicules-bus', level: 2, emoji: '🚌', order: 7, children: [] },
      { name: 'Engin', slug: 'vehicules-engin', level: 2, emoji: '🚜', order: 8, children: [] },
      { name: 'Tracteurs', slug: 'vehicules-tracteurs', level: 2, emoji: '🚜', order: 9, children: [] },
      { name: 'Remorques', slug: 'vehicules-remorques', level: 2, emoji: '🚛', order: 10, children: [] },
      { name: 'Bateaux & Barques', slug: 'vehicules-bateaux-barques', level: 2, emoji: '🛥️', order: 11, children: [] }
    ]
  },

  // ==================== 2. VETEMENTS ====================
  {
    name: 'Vetements',
    slug: 'vetements',
    level: 1,
    emoji: '👕',
    order: 2,
    children: [
      {
        name: 'Vêtements Homme',
        slug: 'vetements-homme',
        level: 2,
        emoji: '👨',
        order: 1,
        children: [
          { name: 'Hauts & Chemises', slug: 'vetements-hauts-chemises-homme', level: 3, emoji: '👕' },
          { name: 'Jeans & Pantalons', slug: 'vetements-jeans-pantalons-homme', level: 3, emoji: '👖' },
          { name: 'Shorts & Pantacourts', slug: 'vetements-shorts-pantacourts-homme', level: 3, emoji: '🩳' },
          { name: 'Vestes & Gilets', slug: 'vetements-vestes-gilets-homme', level: 3, emoji: '🧥' },
          { name: 'Costumes & Blazers', slug: 'vetements-costumes-blazers-homme', level: 3, emoji: '🤵' },
          { name: 'Survetements', slug: 'vetements-survetements-homme', level: 3, emoji: '🏃‍♂️' },
          { name: 'Kamiss', slug: 'vetements-kamiss-homme', level: 3, emoji: '🕌' },
          { name: 'Sous vêtements', slug: 'vetements-sous-vetements-homme', level: 3, emoji: '🩲' },
          { name: 'Pyjamas', slug: 'vetements-pyjamas-homme', level: 3, emoji: '😴' },
          { name: 'Maillots de bain', slug: 'vetements-maillots-bain-homme', level: 3, emoji: '🏊‍♂️' },
          { name: 'Casquettes & Chapeaux', slug: 'vetements-casquettes-chapeaux-homme', level: 3, emoji: '🧢' },
          { name: 'Chaussettes', slug: 'vetements-chaussettes-homme', level: 3, emoji: '🧦' },
          { name: 'Ceintures', slug: 'vetements-ceintures-homme', level: 3, emoji: '⛓️' },
          { name: 'Gants', slug: 'vetements-gants-homme', level: 3, emoji: '🧤' },
          { name: 'Cravates', slug: 'vetements-cravates-homme', level: 3, emoji: '👔' },
          { name: 'Autre', slug: 'vetements-autre-homme', level: 3, emoji: '👚' }
        ]
      },
      {
        name: 'Vêtements Femme',
        slug: 'vetements-femme',
        level: 2,
        emoji: '👩',
        order: 2,
        children: [
          { name: 'Hauts & Chemises', slug: 'vetements-hauts-chemises-femme', level: 3, emoji: '👚' },
          { name: 'Jeans & Pantalons', slug: 'vetements-jeans-pantalons-femme', level: 3, emoji: '👖' },
          { name: 'Shorts & Pantacourts', slug: 'vetements-shorts-pantacourts-femme', level: 3, emoji: '🩳' },
          { name: 'Vestes & Gilets', slug: 'vetements-vestes-gilets-femme', level: 3, emoji: '🧥' },
          { name: 'Ensembles', slug: 'vetements-ensembles-femme', level: 3, emoji: '👗' },
          { name: 'Abayas & Hijabs', slug: 'vetements-abayas-hijabs-femme', level: 3, emoji: '🧕' },
          { name: 'Mariages & Fêtes', slug: 'vetements-mariages-fetes-femme', level: 3, emoji: '💃' },
          { name: 'Maternité', slug: 'vetements-maternite-femme', level: 3, emoji: '🤰' },
          { name: 'Robes', slug: 'vetements-robes-femme', level: 3, emoji: '👗' },
          { name: 'Jupes', slug: 'vetements-jupes-femme', level: 3, emoji: '🩳' },
          { name: 'Joggings & Survetements', slug: 'vetements-joggings-survetements-femme', level: 3, emoji: '🏃‍♀️' },
          { name: 'Leggings', slug: 'vetements-leggings-femme', level: 3, emoji: '🦵' },
          { name: 'Sous-vêtements & Lingerie', slug: 'vetements-sous-vetements-lingerie-femme', level: 3, emoji: '👙' },
          { name: 'Pyjamas', slug: 'vetements-pyjamas-femme', level: 3, emoji: '😴' },
          { name: 'Peignoirs', slug: 'vetements-peignoirs-femme', level: 3, emoji: '🛀' },
          { name: 'Maillots de bain', slug: 'vetements-maillots-bain-femme', level: 3, emoji: '🏊‍♀️' },
          { name: 'Casquettes & Chapeaux', slug: 'vetements-casquettes-chapeaux-femme', level: 3, emoji: '🧢' },
          { name: 'Chaussettes & Collants', slug: 'vetements-chaussettes-collants-femme', level: 3, emoji: '🧦' },
          { name: 'Foulards & Echarpes', slug: 'vetements-foulards-echarpes-femme', level: 3, emoji: '🧣' },
          { name: 'Ceintures', slug: 'vetements-ceintures-femme', level: 3, emoji: '⛓️' },
          { name: 'Gants', slug: 'vetements-gants-femme', level: 3, emoji: '🧤' },
          { name: 'Autre', slug: 'vetements-autre-femme', level: 3, emoji: '👚' }
        ]
      },
      {
        name: 'Chaussures Homme',
        slug: 'vetements-chaussures-homme',
        level: 2,
        emoji: '👞',
        order: 3,
        children: [
          { name: 'Basquettes', slug: 'vetements-basquettes-homme', level: 3, emoji: '👟' },
          { name: 'Bottes', slug: 'vetements-bottes-homme', level: 3, emoji: '🥾' },
          { name: 'Classiques', slug: 'vetements-classiques-homme', level: 3, emoji: '👞' },
          { name: 'Mocassins', slug: 'vetements-mocassins-homme', level: 3, emoji: '👞' },
          { name: 'Sandales', slug: 'vetements-sandales-homme', level: 3, emoji: '🩴' },
          { name: 'Tangues & Pantoufles', slug: 'vetements-tangues-pantoufles-homme', level: 3, emoji: '🩴' },
          { name: 'Autre', slug: 'vetements-autre-chaussures-homme', level: 3, emoji: '👞' }
        ]
      },
      {
        name: 'Chaussures Femme',
        slug: 'vetements-chaussures-femme',
        level: 2,
        emoji: '👠',
        order: 4,
        children: [
          { name: 'Basquettes', slug: 'vetements-basquettes-femme', level: 3, emoji: '👟' },
          { name: 'Sandales', slug: 'vetements-sandales-femme', level: 3, emoji: '🩴' },
          { name: 'Bottes', slug: 'vetements-bottes-femme', level: 3, emoji: '🥾' },
          { name: 'Escarpins', slug: 'vetements-escarpins-femme', level: 3, emoji: '👠' },
          { name: 'Ballerines', slug: 'vetements-ballerines-femme', level: 3, emoji: '🩰' },
          { name: 'Tangues & Pantoufles', slug: 'vetements-tangues-pantoufles-femme', level: 3, emoji: '🩴' },
          { name: 'Autre', slug: 'vetements-autre-chaussures-femme', level: 3, emoji: '👠' }
        ]
      },
      {
        name: 'Garçons',
        slug: 'vetements-garcons',
        level: 2,
        emoji: '👦',
        order: 5,
        children: [
          { name: 'Chaussures', slug: 'vetements-chaussures-garcons', level: 3, emoji: '👟' },
          { name: 'Hauts & Chemises', slug: 'vetements-hauts-chemises-garcons', level: 3, emoji: '👕' },
          { name: 'Pantalons & Shorts', slug: 'vetements-pantalons-shorts-garcons', level: 3, emoji: '👖' },
          { name: 'Vestes & Gilets', slug: 'vetements-vestes-gilets-garcons', level: 3, emoji: '🧥' },
          { name: 'Costumes', slug: 'vetements-costumes-garcons', level: 3, emoji: '🤵' },
          { name: 'Survetements & Joggings', slug: 'vetements-survetements-joggings-garcons', level: 3, emoji: '🏃‍♂️' },
          { name: 'Pyjamas', slug: 'vetements-pyjamas-garcons', level: 3, emoji: '😴' },
          { name: 'Sous-vêtements', slug: 'vetements-sous-vetements-garcons', level: 3, emoji: '🩲' },
          { name: 'Maillots de bain', slug: 'vetements-maillots-bain-garcons', level: 3, emoji: '🏊‍♂️' },
          { name: 'Kamiss', slug: 'vetements-kamiss-garcons', level: 3, emoji: '🕌' },
          { name: 'Casquettes & Chapeaux', slug: 'vetements-casquettes-chapeaux-garcons', level: 3, emoji: '🧢' },
          { name: 'Autre', slug: 'vetements-autre-garcons', level: 3, emoji: '👦' }
        ]
      },
      {
        name: 'Filles',
        slug: 'vetements-filles',
        level: 2,
        emoji: '👧',
        order: 6,
        children: [
          { name: 'Chaussures', slug: 'vetements-chaussures-filles', level: 3, emoji: '👟' },
          { name: 'Hauts & Chemises', slug: 'vetements-hauts-chemises-filles', level: 3, emoji: '👚' },
          { name: 'Pantalons & Shorts', slug: 'vetements-pantalons-shorts-filles', level: 3, emoji: '👖' },
          { name: 'Vestes & Gilets', slug: 'vetements-vestes-gilets-filles', level: 3, emoji: '🧥' },
          { name: 'Robes', slug: 'vetements-robes-filles', level: 3, emoji: '👗' },
          { name: 'Jupes', slug: 'vetements-jupes-filles', level: 3, emoji: '🩳' },
          { name: 'Ensembles', slug: 'vetements-ensembles-filles', level: 3, emoji: '👗' },
          { name: 'Joggings & Survetements', slug: 'vetements-joggings-survetements-filles', level: 3, emoji: '🏃‍♀️' },
          { name: 'Pyjamas', slug: 'vetements-pyjamas-filles', level: 3, emoji: '😴' },
          { name: 'Sous-vêtements', slug: 'vetements-sous-vetements-filles', level: 3, emoji: '👙' },
          { name: 'Leggings & Collants', slug: 'vetements-leggings-collants-filles', level: 3, emoji: '🦵' },
          { name: 'Maillots de bain', slug: 'vetements-maillots-bain-filles', level: 3, emoji: '🏊‍♀️' },
          { name: 'Casquettes & Chapeaux', slug: 'vetements-casquettes-chapeaux-filles', level: 3, emoji: '🧢' },
          { name: 'Autre', slug: 'vetements-autre-filles', level: 3, emoji: '👧' }
        ]
      },
      {
        name: 'Bébé',
        slug: 'vetements-bebe',
        level: 2,
        emoji: '👶',
        order: 7,
        children: [
          { name: 'Vêtements', slug: 'vetements-vetements-bebe', level: 3, emoji: '👕' },
          { name: 'Chaussures', slug: 'vetements-chaussures-bebe', level: 3, emoji: '👟' },
          { name: 'Accessoires', slug: 'vetements-accessoires-bebe', level: 3, emoji: '🧸' }
        ]
      },
      {
        name: 'Sacs & Valises',
        slug: 'vetements-sacs-valises',
        level: 2,
        emoji: '👜',
        order: 8,
        children: [
          { name: 'Pochettes & Portefeuilles', slug: 'vetements-pochettes-portefeuilles', level: 3, emoji: '💼' },
          { name: 'Sacs à main', slug: 'vetements-sacs-main', level: 3, emoji: '👜' },
          { name: 'Sacs à dos', slug: 'vetements-sacs-dos', level: 3, emoji: '🎒' },
          { name: 'Sacs professionnels', slug: 'vetements-sacs-professionnels', level: 3, emoji: '💼' },
          { name: 'Valises', slug: 'vetements-valises', level: 3, emoji: '🧳' },
          { name: 'Cabas de sport', slug: 'vetements-cabas-sport', level: 3, emoji: '🏸' },
          { name: 'Autre', slug: 'vetements-autre-sacs', level: 3, emoji: '👜' }
        ]
      },
      {
        name: 'Montres',
        slug: 'vetements-montres',
        level: 2,
        emoji: '⌚',
        order: 9,
        children: [
          { name: 'Hommes', slug: 'vetements-montres-hommes', level: 3, emoji: '⌚' },
          { name: 'Femmes', slug: 'vetements-montres-femmes', level: 3, emoji: '⌚' }
        ]
      },
      {
        name: 'Lunettes',
        slug: 'vetements-lunettes',
        level: 2,
        emoji: '👓',
        order: 10,
        children: [
          { name: 'Lunettes de vue hommes', slug: 'vetements-lunettes-vue-hommes', level: 3, emoji: '👓' },
          { name: 'Lunettes de vue femmes', slug: 'vetements-lunettes-vue-femmes', level: 3, emoji: '👓' },
          { name: 'Lunettes de soleil hommes', slug: 'vetements-lunettes-soleil-hommes', level: 3, emoji: '🕶️' },
          { name: 'Lunettes de soleil femmes', slug: 'vetements-lunettes-soleil-femmes', level: 3, emoji: '🕶️' },
          { name: 'Lunettes de vue enfants', slug: 'vetements-lunettes-vue-enfants', level: 3, emoji: '👓' },
          { name: 'Lunettes de soleil enfants', slug: 'vetements-lunettes-soleil-enfants', level: 3, emoji: '🕶️' },
          { name: 'Accessoires', slug: 'vetements-accessoires-lunettes', level: 3, emoji: '🧰' }
        ]
      },
      {
        name: 'Bijoux',
        slug: 'vetements-bijoux',
        level: 2,
        emoji: '💍',
        order: 11,
        children: [
          { name: 'Parures', slug: 'vetements-parures', level: 3, emoji: '👑' },
          { name: 'Colliers & Pendentifs', slug: 'vetements-colliers-pendentifs', level: 3, emoji: '📿' },
          { name: 'Bracelets', slug: 'vetements-bracelets', level: 3, emoji: '📿' },
          { name: 'Bagues', slug: 'vetements-bagues', level: 3, emoji: '💍' },
          { name: 'Boucles', slug: 'vetements-boucles', level: 3, emoji: '👂' },
          { name: 'Chevillières', slug: 'vetements-chevilleres', level: 3, emoji: '🦵' },
          { name: 'Piercings', slug: 'vetements-piercings', level: 3, emoji: '👃' },
          { name: 'Accessoires cheveux', slug: 'vetements-accessoires-cheveux', level: 3, emoji: '💇‍♀️' },
          { name: 'Broches', slug: 'vetements-broches', level: 3, emoji: '🧷' },
          { name: 'Autre', slug: 'vetements-autre-bijoux', level: 3, emoji: '💎' }
        ]
      },
      {
        name: 'Tenues professionnelles',
        slug: 'vetements-tenues-professionnelles',
        level: 2,
        emoji: '👔',
        order: 12,
        children: []
      }
    ]
  },

  // ==================== 3. ELECTROMENAGER ====================
  {
    name: 'Electromenager',
    slug: 'electromenager',
    level: 1,
    emoji: '🔌',
    order: 3,
    children: [
      { name: 'Téléviseurs', slug: 'electromenager-televiseurs', level: 2, emoji: '📺', order: 1, children: [] },
      { name: 'Démodulateurs & Box TV', slug: 'electromenager-demodulateurs-box-tv', level: 2, emoji: '📦', order: 2, children: [] },
      { name: 'Paraboles & Switch TV', slug: 'electromenager-paraboles-switch-tv', level: 2, emoji: '🛰️', order: 3, children: [] },
      { name: 'Abonnements IPTV', slug: 'electromenager-abonnements-iptv', level: 2, emoji: '📡', order: 4, children: [] },
      { name: 'Caméras & Accessories', slug: 'electromenager-cameras-accessories', level: 2, emoji: '📹', order: 5, children: [] },
      { name: 'Audio', slug: 'electromenager-audio', level: 2, emoji: '🔊', order: 6, children: [] },
      { name: 'Aspirateurs & Nettoyeurs', slug: 'electromenager-aspirateurs-nettoyeurs', level: 2, emoji: '🧹', order: 7, children: [] },
      { name: 'Repassage', slug: 'electromenager-repassage', level: 2, emoji: '👔', order: 8, children: [] },
      { name: 'Beauté & Hygiène', slug: 'electromenager-beaute-hygiene', level: 2, emoji: '💄', order: 9, children: [] },
      { name: 'Machines à coudre', slug: 'electromenager-machines-coudre', level: 2, emoji: '🧵', order: 10, children: [] },
      { name: 'Télécommandes', slug: 'electromenager-telecommandes', level: 2, emoji: '🎮', order: 11, children: [] },
      { name: 'Sécurité & GPS', slug: 'electromenager-securite-gps', level: 2, emoji: '🚨', order: 12, children: [] },
      { name: 'Composants électroniques', slug: 'electromenager-composants-electroniques', level: 2, emoji: '⚙️', order: 13, children: [] },
      { name: 'Pièces de rechange', slug: 'electromenager-pieces-rechange', level: 2, emoji: '🔧', order: 14, children: [] },
      { name: 'Autre Électroménager', slug: 'electromenager-autre-electromenager', level: 2, emoji: '🔌', order: 15, children: [] },
      {
        name: 'Réfrigérateurs & Congélateurs',
        slug: 'electromenager-refrigerateurs-congelateurs',
        level: 2,
        emoji: '❄️',
        order: 16,
        children: [
          { name: 'Réfrigérateur', slug: 'electromenager-refrigerateur', level: 3, emoji: '🧊' },
          { name: 'Congélateur', slug: 'electromenager-congelateur', level: 3, emoji: '❄️' },
          { name: 'Réfrigérateur-Congélateur', slug: 'electromenager-refrigerateur-congelateur', level: 3, emoji: '🧊❄️' },
          { name: 'Cave à vin', slug: 'electromenager-cave-vin', level: 3, emoji: '🍷' }
        ]
      },
      {
        name: 'Machines à laver',
        slug: 'electromenager-machines-laver',
        level: 2,
        emoji: '🧺',
        order: 17,
        children: [
          { name: 'Lave-linge', slug: 'electromenager-lave-linge', level: 3, emoji: '👚' },
          { name: 'Sèche-linge', slug: 'electromenager-seche-linge', level: 3, emoji: '🌞' },
          { name: 'Lave-linge/Sèche-linge', slug: 'electromenager-lave-linge-seche-linge', level: 3, emoji: '👚🌞' },
          { name: 'Lave-linge avec essorage', slug: 'electromenager-lave-linge-essorage', level: 3, emoji: '🌀' }
        ]
      },
      {
        name: 'Lave-vaisselles',
        slug: 'electromenager-lave-vaisselles',
        level: 2,
        emoji: '🍽️',
        order: 18,
        children: [
          { name: 'Lave-vaisselle encastrable', slug: 'electromenager-lave-vaisselle-encastrable', level: 3, emoji: '📦' },
          { name: 'Lave-vaisselle pose libre', slug: 'electromenager-lave-vaisselle-poselibre', level: 3, emoji: '🍽️' },
          { name: 'Lave-vaisselle compact', slug: 'electromenager-lave-vaisselle-compact', level: 3, emoji: '📦' }
        ]
      },
      {
        name: 'Fours & Cuisson',
        slug: 'electromenager-fours-cuisson',
        level: 2,
        emoji: '🔥',
        order: 19,
        children: [
          { name: 'Four électrique', slug: 'electromenager-four-electrique', level: 3, emoji: '⚡' },
          { name: 'Four à gaz', slug: 'electromenager-four-gaz', level: 3, emoji: '🔥' },
          { name: 'Four micro-ondes', slug: 'electromenager-four-micro-ondes', level: 3, emoji: '🌀' },
          { name: 'Plaque de cuisson', slug: 'electromenager-plaque-cuisson', level: 3, emoji: '🍳' },
          { name: 'Cuisinière', slug: 'electromenager-cuisiniere', level: 3, emoji: '👩‍🍳' }
        ]
      },
      {
        name: 'Chauffage & Climatisation',
        slug: 'electromenager-chauffage-climatisation',
        level: 2,
        emoji: '🌡️',
        order: 20,
        children: [
          { name: 'Climatiseur', slug: 'electromenager-climatiseur', level: 3, emoji: '❄️' },
          { name: 'Ventilateur', slug: 'electromenager-ventilateur', level: 3, emoji: '💨' },
          { name: 'Radiateur', slug: 'electromenager-radiateur', level: 3, emoji: '🔥' },
          { name: 'Chauffe-eau', slug: 'electromenager-chauffe-eau', level: 3, emoji: '🚿' },
          { name: 'Pompe à chaleur', slug: 'electromenager-pompe-chaleur', level: 3, emoji: '🌡️' }
        ]
      },
      {
        name: 'Appareils de cuisine',
        slug: 'electromenager-appareils-cuisine',
        level: 2,
        emoji: '🍳',
        order: 21,
        children: [
          { name: 'Robot de cuisine', slug: 'electromenager-robot-cuisine', level: 3, emoji: '🍲' },
          { name: 'Mixeur', slug: 'electromenager-mixeur', level: 3, emoji: '🥤' },
          { name: 'Bouilloire', slug: 'electromenager-bouilloire', level: 3, emoji: '♨️' },
          { name: 'Cafetière', slug: 'electromenager-cafetiere', level: 3, emoji: '☕' },
          { name: 'Grille-pain', slug: 'electromenager-grille-pain', level: 3, emoji: '🍞' }
        ]
      }
    ]
  },

  // ==================== 4. IMMOBILIER ====================
  {
    name: 'Immobilier',
    slug: 'immobilier',
    level: 1,
    emoji: '🏠',
    order: 4,
    children: [
      {
        name: 'Vente',
        slug: 'immobilier-vente',
        level: 2,
        emoji: '💰',
        order: 1,
        children: [
          { name: 'Appartement', slug: 'immobilier-vente-appartement', level: 3, emoji: '🏢' },
          { name: 'Local', slug: 'immobilier-vente-local', level: 3, emoji: '🏪' },
          { name: 'Villa', slug: 'immobilier-vente-villa', level: 3, emoji: '🏡' },
          { name: 'Terrain', slug: 'immobilier-vente-terrain', level: 3, emoji: '⛰️' },
          { name: 'Terrain Agricole', slug: 'immobilier-vente-terrain-agricole', level: 3, emoji: '🌾' },
          { name: 'Immeuble', slug: 'immobilier-vente-immeuble', level: 3, emoji: '🏢' },
          { name: 'Bungalow', slug: 'immobilier-vente-bungalow', level: 3, emoji: '🏝️' },
          { name: 'Hangar - Usine', slug: 'immobilier-vente-hangar-usine', level: 3, emoji: '🏭' },
          { name: 'Autre', slug: 'immobilier-vente-autre', level: 3, emoji: '🏠' }
        ]
      },
      {
        name: 'Location',
        slug: 'immobilier-location',
        level: 2,
        emoji: '🔑',
        order: 2,
        children: [
          { name: 'Appartement', slug: 'immobilier-location-appartement', level: 3, emoji: '🏢' },
          { name: 'Local', slug: 'immobilier-location-local', level: 3, emoji: '🏪' },
          { name: 'Villa', slug: 'immobilier-location-villa', level: 3, emoji: '🏡' },
          { name: 'Immeuble', slug: 'immobilier-location-immeuble', level: 3, emoji: '🏢' },
          { name: 'Bungalow', slug: 'immobilier-location-bungalow', level: 3, emoji: '🏝️' },
          { name: 'Autre', slug: 'immobilier-location-autre', level: 3, emoji: '🏠' }
        ]
      },
      {
        name: 'Location vacances',
        slug: 'immobilier-location-vacances',
        level: 2,
        emoji: '🏖️',
        order: 3,
        children: [
          { name: 'Appartement', slug: 'immobilier-location-vacances-appartement', level: 3, emoji: '🏢' },
          { name: 'Villa', slug: 'immobilier-location-vacances-villa', level: 3, emoji: '🏡' },
          { name: 'Bungalow', slug: 'immobilier-location-vacances-bungalow', level: 3, emoji: '🏝️' },
          { name: 'Autre', slug: 'immobilier-location-vacances-autre', level: 3, emoji: '🏠' }
        ]
      },
      {
        name: 'Cherche location',
        slug: 'immobilier-cherche-location',
        level: 2,
        emoji: '🔍',
        order: 4,
        children: [
          { name: 'Appartement', slug: 'immobilier-cherche-location-appartement', level: 3, emoji: '🏢' },
          { name: 'Local', slug: 'immobilier-cherche-location-local', level: 3, emoji: '🏪' },
          { name: 'Villa', slug: 'immobilier-cherche-location-villa', level: 3, emoji: '🏡' },
          { name: 'Immeuble', slug: 'immobilier-cherche-location-immeuble', level: 3, emoji: '🏢' },
          { name: 'Bungalow', slug: 'immobilier-cherche-location-bungalow', level: 3, emoji: '🏝️' },
          { name: 'Autre', slug: 'immobilier-cherche-location-autre', level: 3, emoji: '🏠' }
        ]
      },
      {
        name: 'Cherche achat',
        slug: 'immobilier-cherche-achat',
        level: 2,
        emoji: '🔍',
        order: 5,
        children: [
          { name: 'Appartement', slug: 'immobilier-cherche-achat-appartement', level: 3, emoji: '🏢' },
          { name: 'Local', slug: 'immobilier-cherche-achat-local', level: 3, emoji: '🏪' },
          { name: 'Villa', slug: 'immobilier-cherche-achat-villa', level: 3, emoji: '🏡' },
          { name: 'Terrain', slug: 'immobilier-cherche-achat-terrain', level: 3, emoji: '⛰️' },
          { name: 'Terrain Agricole', slug: 'immobilier-cherche-achat-terrain-agricole', level: 3, emoji: '🌾' },
          { name: 'Immeuble', slug: 'immobilier-cherche-achat-immeuble', level: 3, emoji: '🏢' },
          { name: 'Bungalow', slug: 'immobilier-cherche-achat-bungalow', level: 3, emoji: '🏝️' },
          { name: 'Hangar - Usine', slug: 'immobilier-cherche-achat-hangar-usine', level: 3, emoji: '🏭' },
          { name: 'Autre', slug: 'immobilier-cherche-achat-autre', level: 3, emoji: '🏠' }
        ]
      }
    ]
  },

  // ==================== 5. ALIMENTAIRES ====================
  {
    name: 'Alimentaires',
    slug: 'alimentaires',
    level: 1,
    emoji: '🍎',
    order: 5,
    children: [
      { name: 'Produits laitiers', slug: 'alimentaires-produits-laitiers', level: 2, emoji: '🥛', order: 1, children: [] },
      { name: 'Fruits secs', slug: 'alimentaires-fruits-secs', level: 2, emoji: '🍇', order: 2, children: [] },
      { name: 'Graines - Riz - Céréales', slug: 'alimentaires-graines-riz-cereales', level: 2, emoji: '🌾', order: 3, children: [] },
      { name: 'Sucres & Produits sucrés', slug: 'alimentaires-sucres-produits-sucres', level: 2, emoji: '🍬', order: 4, children: [] },
      { name: 'Boissons', slug: 'alimentaires-boissons', level: 2, emoji: '🥤', order: 5, children: [] },
      { name: 'Viandes & Poissons', slug: 'alimentaires-viandes-poissons', level: 2, emoji: '🍖', order: 6, children: [] },
      { name: 'Café - Thé - Infusion', slug: 'alimentaires-cafe-the-infusion', level: 2, emoji: '☕', order: 7, children: [] },
      { name: 'Compléments alimentaires', slug: 'alimentaires-complements-alimentaires', level: 2, emoji: '💊', order: 8, children: [] },
      { name: 'Miel & Dérivés', slug: 'alimentaires-miel-derives', level: 2, emoji: '🍯', order: 9, children: [] },
      { name: 'Fruits & Légumes', slug: 'alimentaires-fruits-legumes', level: 2, emoji: '🥦', order: 10, children: [] },
      { name: 'Blé & Farine', slug: 'alimentaires-ble-farine', level: 2, emoji: '🌾', order: 11, children: [] },
      { name: 'Bonbons & Chocolat', slug: 'alimentaires-bonbons-chocolat', level: 2, emoji: '🍫', order: 12, children: [] },
      { name: 'Boulangerie & Viennoiserie', slug: 'alimentaires-boulangerie-viennoiserie', level: 2, emoji: '🥐', order: 13, children: [] },
      { name: 'Ingrédients cuisine et pâtisserie', slug: 'alimentaires-ingredients-cuisine-patisserie', level: 2, emoji: '🧂', order: 14, children: [] },
      { name: 'Noix & Graines', slug: 'alimentaires-noix-graines', level: 2, emoji: '🥜', order: 15, children: [] },
      { name: 'Plats cuisinés', slug: 'alimentaires-plats-cuisines', level: 2, emoji: '🍲', order: 16, children: [] },
      { name: 'Sauces - Epices - Condiments', slug: 'alimentaires-sauces-epices-condiments', level: 2, emoji: '🌶️', order: 17, children: [] },
      { name: 'Œufs', slug: 'alimentaires-oeufs', level: 2, emoji: '🥚', order: 18, children: [] },
      { name: 'Huiles', slug: 'alimentaires-huiles', level: 2, emoji: '🫒', order: 19, children: [] },
      { name: 'Pâtes', slug: 'alimentaires-pates', level: 2, emoji: '🍝', order: 20, children: [] },
      { name: 'Gateaux', slug: 'alimentaires-gateaux', level: 2, emoji: '🎂', order: 21, children: [] },
      { name: 'Emballage', slug: 'alimentaires-emballage', level: 2, emoji: '📦', order: 22, children: [] },
      { name: 'Aliments pour bébé', slug: 'alimentaires-aliments-bebe', level: 2, emoji: '👶', order: 23, children: [] },
      { name: 'Aliments diététiques', slug: 'alimentaires-aliments-dietetiques', level: 2, emoji: '🥗', order: 24, children: [] },
      { name: 'Autre Alimentaires', slug: 'alimentaires-autre-alimentaires', level: 2, emoji: '🍎', order: 25, children: [] }
    ]
  },

  // ==================== 6. EMPLOI ====================
  {
    name: 'Emploi',
    slug: 'emploi',
    level: 1,
    emoji: '💼',
    order: 6,
    children: [
      { name: 'Offres d\'emploi', slug: 'emploi-offres-emploi', level: 2, emoji: '💼', order: 1, children: [] },
      { name: 'Demandes d\'emploi', slug: 'emploi-demandes-emploi', level: 2, emoji: '📋', order: 2, children: [] },
      { name: 'Autres services emploi', slug: 'emploi-autres-services-emploi', level: 2, emoji: '👔', order: 3, children: [] }
    ]
  },

  // ==================== 7. INFORMATIQUE ====================
  {
    name: 'Informatique',
    slug: 'informatique',
    level: 1,
    emoji: '💻',
    order: 7,
    children: [
      {
        name: 'Ordinateurs portables',
        slug: 'informatique-ordinateurs-portables',
        level: 2,
        emoji: '💻',
        order: 1,
        children: [
          { name: 'Pc Portable', slug: 'informatique-ordinateurs-portables-pc-portable', level: 3, emoji: '💻' },
          { name: 'Macbooks', slug: 'informatique-ordinateurs-portables-macbooks', level: 3, emoji: '🍎' }
        ]
      },
      {
        name: 'Ordinateurs de bureau',
        slug: 'informatique-ordinateurs-bureau',
        level: 2,
        emoji: '🖥️',
        order: 2,
        children: [
          { name: 'Pc de bureau', slug: 'informatique-ordinateurs-bureau-pc-bureau', level: 3, emoji: '🖥️' },
          { name: 'Unités centrales', slug: 'informatique-ordinateurs-bureau-unites-centrales', level: 3, emoji: '🖥️' },
          { name: 'All In One', slug: 'informatique-ordinateurs-bureau-all-in-one', level: 3, emoji: '🖥️' }
        ]
      },
      {
        name: 'Composants PC fixe',
        slug: 'informatique-composants-pc-fixe',
        level: 2,
        emoji: '⚙️',
        order: 3,
        children: [
          { name: 'Cartes mère', slug: 'informatique-composants-pc-fixe-cartes-mere', level: 3, emoji: '🔌' },
          { name: 'Processeurs', slug: 'informatique-composants-pc-fixe-processeurs', level: 3, emoji: '⚡' },
          { name: 'RAM', slug: 'informatique-composants-pc-fixe-ram', level: 3, emoji: '💾' },
          { name: 'Disques dur', slug: 'informatique-composants-pc-fixe-disques-dur', level: 3, emoji: '💿' },
          { name: 'Cartes graphique', slug: 'informatique-composants-pc-fixe-cartes-graphique', level: 3, emoji: '🎮' },
          { name: 'Alimentations & Boitiers', slug: 'informatique-composants-pc-fixe-alimentations-boitiers', level: 3, emoji: '🔋' },
          { name: 'Refroidissement', slug: 'informatique-composants-pc-fixe-refroidissement', level: 3, emoji: '❄️' },
          { name: 'Lecteurs & Graveurs CD', slug: 'informatique-composants-pc-fixe-lecteurs-graveurs-cd', level: 3, emoji: '📀' },
          { name: 'Autres', slug: 'informatique-composants-pc-fixe-autres', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Composants PC portable',
        slug: 'informatique-composants-pc-portable',
        level: 2,
        emoji: '🔧',
        order: 4,
        children: [
          { name: 'Chargeurs', slug: 'informatique-composants-pc-portable-chargeurs', level: 3, emoji: '🔌' },
          { name: 'Batteries', slug: 'informatique-composants-pc-portable-batteries', level: 3, emoji: '🔋' },
          { name: 'Ecrans', slug: 'informatique-composants-pc-portable-ecrans', level: 3, emoji: '🖥️' },
          { name: 'Claviers & Touchpads', slug: 'informatique-composants-pc-portable-claviers-touchpads', level: 3, emoji: '⌨️' },
          { name: 'Disques Dur', slug: 'informatique-composants-pc-portable-disques-dur', level: 3, emoji: '💿' },
          { name: 'RAM', slug: 'informatique-composants-pc-portable-ram', level: 3, emoji: '💾' },
          { name: 'Refroidissement', slug: 'informatique-composants-pc-portable-refroidissement', level: 3, emoji: '❄️' },
          { name: 'Cartes mère', slug: 'informatique-composants-pc-portable-cartes-mere', level: 3, emoji: '🔌' },
          { name: 'Processeurs', slug: 'informatique-composants-pc-portable-processeurs', level: 3, emoji: '⚡' },
          { name: 'Cartes graphique', slug: 'informatique-composants-pc-portable-cartes-graphique', level: 3, emoji: '🎮' },
          { name: 'Lecteurs & Graveurs', slug: 'informatique-composants-pc-portable-lecteurs-graveurs', level: 3, emoji: '📀' },
          { name: 'Baffles & Webcams', slug: 'informatique-composants-pc-portable-baffles-webcams', level: 3, emoji: '🎤' },
          { name: 'Autres', slug: 'informatique-composants-pc-portable-autres', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Composants serveur',
        slug: 'informatique-composants-serveur',
        level: 2,
        emoji: '🖧',
        order: 5,
        children: [
          { name: 'Cartes mère', slug: 'informatique-composants-serveur-cartes-mere', level: 3, emoji: '🔌' },
          { name: 'Processeurs', slug: 'informatique-composants-serveur-processeurs', level: 3, emoji: '⚡' },
          { name: 'RAM', slug: 'informatique-composants-serveur-ram', level: 3, emoji: '💾' },
          { name: 'Disques dur', slug: 'informatique-composants-serveur-disques-dur', level: 3, emoji: '💿' },
          { name: 'Cartes réseau', slug: 'informatique-composants-serveur-cartes-reseau', level: 3, emoji: '📶' },
          { name: 'Alimentations', slug: 'informatique-composants-serveur-alimentations', level: 3, emoji: '🔋' },
          { name: 'Refroidissement', slug: 'informatique-composants-serveur-refroidissement', level: 3, emoji: '❄️' },
          { name: 'Cartes graphique', slug: 'informatique-composants-serveur-cartes-graphique', level: 3, emoji: '🎮' },
          { name: 'Autres', slug: 'informatique-composants-serveur-autres', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Imprimantes & Cartouches',
        slug: 'informatique-imprimantes-cartouches',
        level: 2,
        emoji: '🖨️',
        order: 6,
        children: [
          { name: 'Imprimantes jet d\'encre', slug: 'informatique-imprimantes-jet-encre', level: 3, emoji: '🖨️' },
          { name: 'Imprimantes Laser', slug: 'informatique-imprimantes-laser', level: 3, emoji: '🖨️' },
          { name: 'Imprimantes matricielles', slug: 'informatique-imprimantes-matricielles', level: 3, emoji: '🖨️' },
          { name: 'Codes à barre & Etiqueteuses', slug: 'informatique-codes-barre-etiqueteuses', level: 3, emoji: '🏷️' },
          { name: 'Imprimantes photo & badges', slug: 'informatique-imprimantes-photo-badges', level: 3, emoji: '🖼️' },
          { name: 'Photocopieuses professionnelles', slug: 'informatique-photocopieuses-professionnelles', level: 3, emoji: '📠' },
          { name: 'Imprimantes 3D', slug: 'informatique-imprimantes-3d', level: 3, emoji: '🖨️' },
          { name: 'Cartouches & Toners', slug: 'informatique-cartouches-toners', level: 3, emoji: '🎨' },
          { name: 'Autre', slug: 'informatique-autre-imprimantes', level: 3, emoji: '🖨️' }
        ]
      },
      {
        name: 'Réseau & Connexion',
        slug: 'informatique-reseau-connexion',
        level: 2,
        emoji: '📶',
        order: 7,
        children: [
          { name: 'Modems & Routeurs', slug: 'informatique-modems-routeurs', level: 3, emoji: '📡' },
          { name: 'Switchs', slug: 'informatique-switchs', level: 3, emoji: '🔀' },
          { name: 'Point d\'accès wifi', slug: 'informatique-point-acces-wifi', level: 3, emoji: '📶' },
          { name: 'Répéteur Wi-Fi', slug: 'informatique-repeater-wifi', level: 3, emoji: '📶' },
          { name: 'Cartes réseau', slug: 'informatique-cartes-reseau-connexion', level: 3, emoji: '📡' },
          { name: 'Autre', slug: 'informatique-autre-reseau', level: 3, emoji: '📶' }
        ]
      },
      {
        name: 'Stockage externe & Racks',
        slug: 'informatique-stockage-externe-racks',
        level: 2,
        emoji: '💾',
        order: 8,
        children: [
          { name: 'Disques durs', slug: 'informatique-stockage-externe-disques-durs', level: 3, emoji: '💿' },
          { name: 'Flash disque', slug: 'informatique-stockage-externe-flash-disque', level: 3, emoji: '💾' },
          { name: 'Carte mémoire', slug: 'informatique-stockage-externe-carte-memoire', level: 3, emoji: '📋' },
          { name: 'Rack', slug: 'informatique-stockage-externe-rack', level: 3, emoji: '🗄️' }
        ]
      },
      { name: 'Serveurs', slug: 'informatique-serveurs', level: 2, emoji: '🖧', order: 9, children: [] },
      { name: 'Ecrans', slug: 'informatique-ecrans', level: 2, emoji: '🖥️', order: 10, children: [] },
      { name: 'Onduleurs & Stabilisateurs', slug: 'informatique-onduleurs-stabilisateurs', level: 2, emoji: '⚡', order: 11, children: [] },
      { name: 'Compteuses de billets', slug: 'informatique-compteuses-billets', level: 2, emoji: '💰', order: 12, children: [] },
      { name: 'Claviers & Souris', slug: 'informatique-claviers-souris', level: 2, emoji: '⌨️', order: 13, children: [] },
      { name: 'Casques & Son', slug: 'informatique-casques-son', level: 2, emoji: '🎧', order: 14, children: [] },
      { name: 'Webcam & Vidéoconférence', slug: 'informatique-webcam-videoconference', level: 2, emoji: '📹', order: 15, children: [] },
      { name: 'Data shows', slug: 'informatique-data-shows', level: 2, emoji: '📊', order: 16, children: [] },
      { name: 'Câbles & Adaptateurs', slug: 'informatique-cables-adaptateurs', level: 2, emoji: '🔌', order: 17, children: [] },
      { name: 'Stylets & Tablettes', slug: 'informatique-stylers-tablettes', level: 2, emoji: '✏️', order: 18, children: [] },
      { name: 'Cartables & Sacoches', slug: 'informatique-cartables-sacoches', level: 2, emoji: '🎒', order: 19, children: [] },
      { name: 'Manettes & Simulateurs', slug: 'informatique-manettes-simulateurs', level: 2, emoji: '🎮', order: 20, children: [] },
      { name: 'VR', slug: 'informatique-vr', level: 2, emoji: '🥽', order: 21, children: [] },
      { name: 'Logiciels & Abonnements', slug: 'informatique-logiciels-abonnements', level: 2, emoji: '📀', order: 22, children: [] },
      { name: 'Bureautique', slug: 'informatique-bureautique', level: 2, emoji: '📎', order: 23, children: [] },
      { name: 'Autre Informatique', slug: 'informatique-autre-informatique', level: 2, emoji: '💡', order: 24, children: [] }
    ]
  },

  // ==================== 8. LOISIRS ====================
  {
    name: 'Loisirs',
    slug: 'loisirs',
    level: 1,
    emoji: '🎪',
    order: 8,
    children: [
      {
        name: 'Animalerie',
        slug: 'loisirs-animalerie',
        level: 2,
        emoji: '🐾',
        order: 1,
        children: [
          { name: 'Produits de soin animal', slug: 'loisirs-animalerie-produits-soin-animal', level: 3, emoji: '💊' },
          { name: 'Chien', slug: 'loisirs-animalerie-chien', level: 3, emoji: '🐕' },
          { name: 'Oiseau', slug: 'loisirs-animalerie-oiseau', level: 3, emoji: '🐦' },
          { name: 'Animaux de ferme', slug: 'loisirs-animalerie-animaux-ferme', level: 3, emoji: '🐄' },
          { name: 'Chat', slug: 'loisirs-animalerie-chat', level: 3, emoji: '🐈' },
          { name: 'Cheval', slug: 'loisirs-animalerie-cheval', level: 3, emoji: '🐎' },
          { name: 'Poisson', slug: 'loisirs-animalerie-poisson', level: 3, emoji: '🐟' },
          { name: 'Accessoire pour animaux', slug: 'loisirs-animalerie-accessoire-animaux', level: 3, emoji: '🛁' },
          { name: 'Nourriture pour animaux', slug: 'loisirs-animalerie-nourriture-animaux', level: 3, emoji: '🍖' },
          { name: 'Autres Animaux', slug: 'loisirs-animalerie-autres-animaux', level: 3, emoji: '🐾' }
        ]
      },
      {
        name: 'Consoles et Jeux Vidéos',
        slug: 'loisirs-consoles-jeux-videos',
        level: 2,
        emoji: '🎮',
        order: 2,
        children: [
          { name: 'Consoles', slug: 'loisirs-consoles-jeux-videos-consoles', level: 3, emoji: '🕹️' },
          { name: 'Jeux videos', slug: 'loisirs-consoles-jeux-videos-jeux-videos', level: 3, emoji: '🎮' },
          { name: 'Accessoires', slug: 'loisirs-consoles-jeux-videos-accessoires', level: 3, emoji: '🎧' }
        ]
      },
      {
        name: 'Livres & Magazines',
        slug: 'loisirs-livres-magazines',
        level: 2,
        emoji: '📚',
        order: 3,
        children: [
          { name: 'Littérature et philosophie', slug: 'loisirs-livres-magazines-litterature-philosophie', level: 3, emoji: '📖' },
          { name: 'Romans', slug: 'loisirs-livres-magazines-romans', level: 3, emoji: '📚' },
          { name: 'Scolaire & Parascolaire', slug: 'loisirs-livres-magazines-scolaire-parascolaire', level: 3, emoji: '🎒' },
          { name: 'Sciences, techniques et medecine', slug: 'loisirs-livres-magazines-sciences-techniques-medecine', level: 3, emoji: '🔬' },
          { name: 'Traduction', slug: 'loisirs-livres-magazines-traduction', level: 3, emoji: '🌐' },
          { name: 'Religion et Spiritualités', slug: 'loisirs-livres-magazines-religion-spiritualites', level: 3, emoji: '🙏' },
          { name: 'Historique', slug: 'loisirs-livres-magazines-historique', level: 3, emoji: '🏛️' },
          { name: 'Cuisine', slug: 'loisirs-livres-magazines-cuisine', level: 3, emoji: '🍳' },
          { name: 'Essais et documents', slug: 'loisirs-livres-magazines-essais-documents', level: 3, emoji: '📄' },
          { name: 'Fiction', slug: 'loisirs-livres-magazines-fiction', level: 3, emoji: '📚' },
          { name: 'Enfants', slug: 'loisirs-livres-magazines-enfants', level: 3, emoji: '👶' },
          { name: 'Mangas et bande dessinée', slug: 'loisirs-livres-magazines-mangas-bande-dessinee', level: 3, emoji: '🇯🇵' }
        ]
      },
      {
        name: 'Instruments de Musique',
        slug: 'loisirs-instruments-musique',
        level: 2,
        emoji: '🎵',
        order: 4,
        children: [
          { name: 'Instruments électriques', slug: 'loisirs-instruments-musique-instruments-electriques', level: 3, emoji: '🎸' },
          { name: 'Instruments à percussion : les idiophones', slug: 'loisirs-instruments-musique-instruments-percussion', level: 3, emoji: '🥁' },
          { name: 'Instruments a vent', slug: 'loisirs-instruments-musique-instruments-vent', level: 3, emoji: '🎺' },
          { name: 'Instruments à cordes', slug: 'loisirs-instruments-musique-instruments-cordes', level: 3, emoji: '🎻' },
          { name: 'Autre', slug: 'loisirs-instruments-musique-autre', level: 3, emoji: '🎵' }
        ]
      },
      {
        name: 'Jouets',
        slug: 'loisirs-jouets',
        level: 2,
        emoji: '🧸',
        order: 5,
        children: [
          { name: 'Jeux d\'éveil', slug: 'loisirs-jouets-jeux-eveil', level: 3, emoji: '🧠' },
          { name: 'Poupées - Peluches', slug: 'loisirs-jouets-poupees-peluches', level: 3, emoji: '🧸' },
          { name: 'Personnages - Déguisements', slug: 'loisirs-jouets-personnages-deguisements', level: 3, emoji: '🦸' },
          { name: 'Jeux éducatifs - Puzzle', slug: 'loisirs-jouets-jeux-educatifs-puzzle', level: 3, emoji: '🧩' },
          { name: 'Véhicules et Circuits', slug: 'loisirs-jouets-vehicules-circuits', level: 3, emoji: '🚗' },
          { name: 'Jeux électroniques', slug: 'loisirs-jouets-jeux-electroniques', level: 3, emoji: '🕹️' },
          { name: 'Construction et Outils', slug: 'loisirs-jouets-construction-outils', level: 3, emoji: '🧱' },
          { name: 'Jeux de plein air', slug: 'loisirs-jouets-jeux-plein-air', level: 3, emoji: '⚽' },
          { name: 'Animaux', slug: 'loisirs-jouets-animaux', level: 3, emoji: '🐻' }
        ]
      },
      {
        name: 'Chasse & Pêche',
        slug: 'loisirs-chasse-peche',
        level: 2,
        emoji: '🎣',
        order: 6,
        children: [
          { name: 'Canne à pêche', slug: 'loisirs-chasse-peche-canne-peche', level: 3, emoji: '🎣' },
          { name: 'Moulinets', slug: 'loisirs-chasse-peche-moulinets', level: 3, emoji: '🎣' },
          { name: 'Sondeurs-GPS', slug: 'loisirs-chasse-peche-sondeurs-gps', level: 3, emoji: '📡' },
          { name: 'Vêtements', slug: 'loisirs-chasse-peche-vetements', level: 3, emoji: '🧥' },
          { name: 'Accessoires de pêche', slug: 'loisirs-chasse-peche-accessoires-peche', level: 3, emoji: '🎒' },
          { name: 'Matériel plongée', slug: 'loisirs-chasse-peche-materiel-plongee', level: 3, emoji: '🤿' },
          { name: 'Equipements de chasse', slug: 'loisirs-chasse-peche-equipements-chasse', level: 3, emoji: '🔫' }
        ]
      },
      {
        name: 'Jardinage',
        slug: 'loisirs-jardinage',
        level: 2,
        emoji: '🌱',
        order: 7,
        children: [
          { name: 'Mobilier de jardin', slug: 'loisirs-jardinage-mobilier-jardin', level: 3, emoji: '🪑' },
          { name: 'Semence', slug: 'loisirs-jardinage-semence', level: 3, emoji: '🌱' },
          { name: 'Outillage-Arrosage du jardin', slug: 'loisirs-jardinage-outillage-arrosage', level: 3, emoji: '🚿' },
          { name: 'Plantes et fleurs', slug: 'loisirs-jardinage-plantes-fleurs', level: 3, emoji: '🌺' },
          { name: 'Équipements Et Matériels', slug: 'loisirs-jardinage-equipements-materiels', level: 3, emoji: '🛠️' },
          { name: 'Insecticide', slug: 'loisirs-jardinage-insecticide', level: 3, emoji: '🐛' },
          { name: 'Décoration', slug: 'loisirs-jardinage-decoration', level: 3, emoji: '🎍' },
          { name: 'Livres D\'Agriculture Et De Jardinage', slug: 'loisirs-jardinage-livres-agriculture-jardin', level: 3, emoji: '📚' }
        ]
      },
      {
        name: 'Les Jeux de loisirs',
        slug: 'loisirs-jeux-loisirs',
        level: 2,
        emoji: '♟️',
        order: 8,
        children: [
          { name: 'Babyfoot', slug: 'loisirs-jeux-loisirs-babyfoot', level: 3, emoji: '⚽' },
          { name: 'Billiard', slug: 'loisirs-jeux-loisirs-billiard', level: 3, emoji: '🎱' },
          { name: 'Ping pong', slug: 'loisirs-jeux-loisirs-ping-pong', level: 3, emoji: '🏓' },
          { name: 'Échecs', slug: 'loisirs-jeux-loisirs-echecs', level: 3, emoji: '♟️' },
          { name: 'Jeux De Société', slug: 'loisirs-jeux-loisirs-jeux-societe', level: 3, emoji: '🎲' },
          { name: 'Autres Jeux De Loisirs', slug: 'loisirs-jeux-loisirs-autres-jeux-loisirs', level: 3, emoji: '🎯' }
        ]
      },
      {
        name: 'Barbecue & Grillades',
        slug: 'loisirs-barbecue-grillades',
        level: 2,
        emoji: '🍖',
        order: 9,
        children: [
          { name: 'Barbecue', slug: 'loisirs-barbecue-grillades-barbecue', level: 3, emoji: '🔥' },
          { name: 'Charbon', slug: 'loisirs-barbecue-grillades-charbon', level: 3, emoji: '⚫' },
          { name: 'Accessoires', slug: 'loisirs-barbecue-grillades-accessoires', level: 3, emoji: '🍴' }
        ]
      },
      {
        name: 'Vapes & Chichas',
        slug: 'loisirs-vapes-chichas',
        level: 2,
        emoji: '💨',
        order: 10,
        children: [
          { name: 'Vapes & Cigarettes électroniques', slug: 'loisirs-vapes-chichas-vapes-cigarettes-electroniques', level: 3, emoji: '🚬' },
          { name: 'Chichas', slug: 'loisirs-vapes-chichas-chichas', level: 3, emoji: '💨' },
          { name: 'Consommables', slug: 'loisirs-vapes-chichas-consommables', level: 3, emoji: '🫙' },
          { name: 'Accessoires', slug: 'loisirs-vapes-chichas-accessoires', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Produits & Accessoires d\'été',
        slug: 'loisirs-produits-accessoires-ete',
        level: 2,
        emoji: '🏖️',
        order: 11,
        children: [
          { name: 'Piscines', slug: 'loisirs-produits-accessoires-ete-piscines', level: 3, emoji: '🏊' },
          { name: 'Matelas gonflables', slug: 'loisirs-produits-accessoires-ete-matelas-gonflables', level: 3, emoji: '🛏️' },
          { name: 'Parasols', slug: 'loisirs-produits-accessoires-ete-parasols', level: 3, emoji: '⛱️' },
          { name: 'Transats & Chaises pliables', slug: 'loisirs-produits-accessoires-ete-transats-chaises-pliables', level: 3, emoji: '🪑' },
          { name: 'Tables', slug: 'loisirs-produits-accessoires-ete-tables', level: 3, emoji: '🪑' },
          { name: 'Autres', slug: 'loisirs-produits-accessoires-ete-autres', level: 3, emoji: '☀️' }
        ]
      },
      { name: 'Antiquités & Collections', slug: 'loisirs-antiquites-collections', level: 2, emoji: '🏺', order: 12, children: [] },
      { name: 'Autre', slug: 'loisirs-autre', level: 2, emoji: '🎪', order: 13, children: [] }
    ]
  },

  // ==================== 9. MATERIAUX ====================
  {
    name: 'Materiaux',
    slug: 'materiaux',
    level: 1,
    emoji: '🧱',
    order: 9,
    children: [
      {
        name: 'Matériel professionnel',
        slug: 'materiaux-materiel-professionnel',
        level: 2,
        emoji: '🏭',
        order: 1,
        children: [
          { name: 'Industrie & Fabrication', slug: 'materiaux-materiel-professionnel-industrie-fabrication', level: 3, emoji: '🏭' },
          { name: 'Alimentaire et Restauration', slug: 'materiaux-materiel-professionnel-alimentaire-restauration', level: 3, emoji: '🍽️' },
          { name: 'Medical', slug: 'materiaux-materiel-professionnel-medical', level: 3, emoji: '🏥' },
          { name: 'Batiment & Construction', slug: 'materiaux-materiel-professionnel-batiment-construction', level: 3, emoji: '🏗️' },
          { name: 'Matériel électrique', slug: 'materiaux-materiel-professionnel-materiel-electrique', level: 3, emoji: '⚡' },
          { name: 'Ateliers', slug: 'materiaux-materiel-professionnel-ateliers', level: 3, emoji: '🔧' },
          { name: 'Stockage et magasinage', slug: 'materiaux-materiel-professionnel-stockage-magasinage', level: 3, emoji: '📦' },
          { name: 'Équipement de protection', slug: 'materiaux-materiel-professionnel-equipement-protection', level: 3, emoji: '🛡️' },
          { name: 'Agriculture', slug: 'materiaux-materiel-professionnel-agriculture', level: 3, emoji: '🌾' },
          { name: 'Réparation & Diagnostic', slug: 'materiaux-materiel-professionnel-reparation-diagnostic', level: 3, emoji: '🔍' },
          { name: 'Commerce de détail', slug: 'materiaux-materiel-professionnel-commerce-detail', level: 3, emoji: '🏪' },
          { name: 'Coiffure et cosmétologie', slug: 'materiaux-materiel-professionnel-coiffure-cosmetologie', level: 3, emoji: '💇' },
          { name: 'Autres matériels pro', slug: 'materiaux-materiel-professionnel-autres-materiel-pro', level: 3, emoji: '🛠️' }
        ]
      },
      {
        name: 'Outillage professionnel',
        slug: 'materiaux-outillage-professionnel',
        level: 2,
        emoji: '🛠️',
        order: 2,
        children: [
          { name: 'Perceuse', slug: 'materiaux-outillage-professionnel-perceuse', level: 3, emoji: '🔩' },
          { name: 'Meuleuse', slug: 'materiaux-outillage-professionnel-meuleuse', level: 3, emoji: '⚙️' },
          { name: 'Outillage à main', slug: 'materiaux-outillage-professionnel-outillage-main', level: 3, emoji: '🔨' },
          { name: 'Scie', slug: 'materiaux-outillage-professionnel-scie', level: 3, emoji: '🪚' },
          { name: 'Autres', slug: 'materiaux-outillage-professionnel-autres', level: 3, emoji: '🛠️' }
        ]
      },
      {
        name: 'Matériel Agricole',
        slug: 'materiaux-materiel-agricole',
        level: 2,
        emoji: '🚜',
        order: 3,
        children: [
          { name: 'Equipement agricole', slug: 'materiaux-materiel-agricole-equipement-agricole', level: 3, emoji: '🚜' },
          { name: 'Arbres', slug: 'materiaux-materiel-agricole-arbres', level: 3, emoji: '🌳' },
          { name: 'Terrain Agricole', slug: 'materiaux-materiel-agricole-terrain-agricole', level: 3, emoji: '🌾' },
          { name: 'Autre', slug: 'materiaux-materiel-agricole-autre', level: 3, emoji: '🌱' }
        ]
      },
      { name: 'Materiaux de construction', slug: 'materiaux-materiaux-construction', level: 2, emoji: '🧱', order: 4, children: [] },
      { name: 'Matières premières', slug: 'materiaux-matieres-premieres', level: 2, emoji: '⚗️', order: 5, children: [] },
      { name: 'Produits d\'hygiène', slug: 'materiaux-produits-hygiene', level: 2, emoji: '🧼', order: 6, children: [] },
      { name: 'Autre', slug: 'materiaux-autre-materiaux', level: 2, emoji: '📦', order: 7, children: [] }
    ]
  },

  // ==================== 10. MEUBLES ====================
  {
    name: 'Meubles',
    slug: 'meubles',
    level: 1,
    emoji: '🛋️',
    order: 10,
    children: [
      { name: 'Salon', slug: 'meubles-salon', level: 2, emoji: '🛋️', order: 1, children: [] },
      { name: 'Chambres à coucher', slug: 'meubles-chambres-coucher', level: 2, emoji: '🛏️', order: 2, children: [] },
      { name: 'Tables', slug: 'meubles-tables', level: 2, emoji: '🪑', order: 3, children: [] },
      { name: 'Armoires & Commodes', slug: 'meubles-armoires-commodes', level: 2, emoji: '🗄️', order: 4, children: [] },
      { name: 'Lits', slug: 'meubles-lits', level: 2, emoji: '🛌', order: 5, children: [] },
      { name: 'Meubles de Cuisine', slug: 'meubles-meubles-cuisine', level: 2, emoji: '🍳', order: 6, children: [] },
      { name: 'Bibliothèques & Etagères', slug: 'meubles-bibliotheques-etageres', level: 2, emoji: '📚', order: 7, children: [] },
      { name: 'Chaises & Fauteuils', slug: 'meubles-chaises-fauteuils', level: 2, emoji: '🪑', order: 8, children: [] },
      { name: 'Dressings', slug: 'meubles-dressings', level: 2, emoji: '👔', order: 9, children: [] },
      { name: 'Meubles salle de bain', slug: 'meubles-meubles-salle-bain', level: 2, emoji: '🚿', order: 10, children: [] },
      { name: 'Buffet', slug: 'meubles-buffet', level: 2, emoji: '🍽️', order: 11, children: [] },
      { name: 'Tables TV', slug: 'meubles-tables-tv', level: 2, emoji: '📺', order: 12, children: [] },
      { name: 'Table pliante', slug: 'meubles-table-pliante', level: 2, emoji: '🪑', order: 13, children: [] },
      { name: 'Tables à manger', slug: 'meubles-tables-manger', level: 2, emoji: '🍽️', order: 14, children: [] },
      { name: 'Tables PC & Bureaux', slug: 'meubles-tables-pc-bureaux', level: 2, emoji: '💻', order: 15, children: [] },
      { name: 'Canapé', slug: 'meubles-canape', level: 2, emoji: '🛋️', order: 16, children: [] },
      { name: 'Table basse', slug: 'meubles-table-basse', level: 2, emoji: '🪑', order: 17, children: [] },
      { name: 'Rangement et Organisation', slug: 'meubles-rangement-organisation', level: 2, emoji: '📦', order: 18, children: [] },
      { name: 'Accessoires de cuisine', slug: 'meubles-accessoires-cuisine', level: 2, emoji: '🔪', order: 19, children: [] },
      { name: 'Meuble d\'entrée', slug: 'meubles-meuble-entree', level: 2, emoji: '🚪', order: 20, children: [] },
      {
        name: 'Décoration',
        slug: 'meubles-decoration',
        level: 2,
        emoji: '🎨',
        order: 21,
        children: [
          { name: 'Peinture et calligraphie', slug: 'meubles-decoration-peinture-calligraphie', level: 3, emoji: '🖼️' },
          { name: 'Décoration de cuisine', slug: 'meubles-decoration-decoration-cuisine', level: 3, emoji: '🍳' },
          { name: 'Coussins & Housses', slug: 'meubles-decoration-coussins-housses', level: 3, emoji: '🛋️' },
          { name: 'Déco de Bain', slug: 'meubles-decoration-deco-bain', level: 3, emoji: '🚿' },
          { name: 'Art et Revêtement Mural', slug: 'meubles-decoration-art-revetement-mural', level: 3, emoji: '🎨' },
          { name: 'Figurines et miniatures', slug: 'meubles-decoration-figurines-miniatures', level: 3, emoji: '🗿' },
          { name: 'Cadres', slug: 'meubles-decoration-cadres', level: 3, emoji: '🖼️' },
          { name: 'Horloges', slug: 'meubles-decoration-horloges', level: 3, emoji: '⏰' },
          { name: 'Autres décoration', slug: 'meubles-decoration-autres-decoration', level: 3, emoji: '✨' }
        ]
      },
      {
        name: 'Vaisselle',
        slug: 'meubles-vaisselle',
        level: 2,
        emoji: '🍽️',
        order: 22,
        children: [
          { name: 'Pôeles, Casseroles et Marmites', slug: 'meubles-vaisselle-poeles-casseroles-marmites', level: 3, emoji: '🍳' },
          { name: 'Cocottes', slug: 'meubles-vaisselle-cocottes', level: 3, emoji: '🥘' },
          { name: 'Plats à four et Plateaux', slug: 'meubles-vaisselle-plats-four-plateaux', level: 3, emoji: '🍲' },
          { name: 'Assiettes et Bols', slug: 'meubles-vaisselle-assiettes-bols', level: 3, emoji: '🍽️' },
          { name: 'Couverts et ustensiles de cuisine', slug: 'meubles-vaisselle-couverts-ustensiles', level: 3, emoji: '🔪' },
          { name: 'Services à Boissons', slug: 'meubles-vaisselle-services-boissons', level: 3, emoji: '☕' },
          { name: 'Boites et bocaux', slug: 'meubles-vaisselle-boites-bocaux', level: 3, emoji: '🥫' },
          { name: 'Accessoires de pâtisserie', slug: 'meubles-vaisselle-accessoires-patisserie', level: 3, emoji: '🎂' },
          { name: 'Vaisselles Artisanales', slug: 'meubles-vaisselle-vaisselles-artisanales', level: 3, emoji: '🧱' },
          { name: 'Gadget de cuisine', slug: 'meubles-vaisselle-gadget-cuisine', level: 3, emoji: '⚙️' },
          { name: 'Vaisselle enfants', slug: 'meubles-vaisselle-vaisselle-enfants', level: 3, emoji: '👶' }
        ]
      },
      {
        name: 'Meubles de bureau',
        slug: 'meubles-meubles-bureau',
        level: 2,
        emoji: '💼',
        order: 23,
        children: [
          { name: 'Bureaux & Caissons', slug: 'meubles-meubles-bureau-bureaux-caissons', level: 3, emoji: '💼' },
          { name: 'Chaises', slug: 'meubles-meubles-bureau-chaises', level: 3, emoji: '🪑' },
          { name: 'Armoires & Rangements', slug: 'meubles-meubles-bureau-armoires-rangements', level: 3, emoji: '🗄️' },
          { name: 'Accessoires de bureaux', slug: 'meubles-meubles-bureau-accessoires-bureaux', level: 3, emoji: '📎' },
          { name: 'Tables de réunion', slug: 'meubles-meubles-bureau-tables-reunion', level: 3, emoji: '🤝' }
        ]
      },
      {
        name: 'Puériculture',
        slug: 'meubles-puericulture',
        level: 2,
        emoji: '👶',
        order: 24,
        children: [
          { name: 'Poussette', slug: 'meubles-puericulture-poussette', level: 3, emoji: '👶' },
          { name: 'Siège Auto', slug: 'meubles-puericulture-siege-auto', level: 3, emoji: '🚗' },
          { name: 'Meubles bébé', slug: 'meubles-puericulture-meubles-bebe', level: 3, emoji: '🛏️' },
          { name: 'Lit bébé', slug: 'meubles-puericulture-lit-bebe', level: 3, emoji: '🛌' },
          { name: 'Chaise bébé', slug: 'meubles-puericulture-chaise-bebe', level: 3, emoji: '🪑' },
          { name: 'Autres', slug: 'meubles-puericulture-autres', level: 3, emoji: '👶' }
        ]
      },
      {
        name: 'Luminaire',
        slug: 'meubles-luminaire',
        level: 2,
        emoji: '💡',
        order: 25,
        children: [
          { name: 'Lustre', slug: 'meubles-luminaire-lustre', level: 3, emoji: '💎' },
          { name: 'Lampadaire', slug: 'meubles-luminaire-lampadaire', level: 3, emoji: '🛋️' },
          { name: 'Éclairage extérieur', slug: 'meubles-luminaire-eclairage-exterieur', level: 3, emoji: '🌙' },
          { name: 'Autres', slug: 'meubles-luminaire-autres', level: 3, emoji: '💡' }
        ]
      },
      { name: 'Rideaux', slug: 'meubles-rideaux', level: 2, emoji: '🪟', order: 26, children: [] },
      { name: 'Literie & Linge', slug: 'meubles-literie-linge', level: 2, emoji: '🛌', order: 27, children: [] },
      { name: 'Tapis & Moquettes', slug: 'meubles-tapis-moquettes', level: 2, emoji: '🧶', order: 28, children: [] },
      { name: 'Meubles d\'extérieur', slug: 'meubles-meubles-exterieur', level: 2, emoji: '🌳', order: 29, children: [] },
      { name: 'Fournitures et articles scolaires', slug: 'meubles-fournitures-scolaires', level: 2, emoji: '📚', order: 30, children: [] },
      { name: 'Autre', slug: 'meubles-autre-meubles', level: 2, emoji: '🛋️', order: 31, children: [] }
    ]
  },

  // ==================== 11. PIECES DETACHEES ====================
  {
    name: 'Pieces Detachees',
    slug: 'pieces-detachees',
    level: 1,
    emoji: '🔩',
    order: 11,
    children: [
      {
        name: 'Pièces automobiles',
        slug: 'pieces-detachees-pieces-automobiles',
        level: 2,
        emoji: '🚗',
        order: 1,
        children: [
          { name: 'Moteur & Transmission', slug: 'pieces-detachees-pieces-automobiles-moteur-transmission', level: 3, emoji: '⚙️' },
          { name: 'Suspension & Direction', slug: 'pieces-detachees-pieces-automobiles-suspension-direction', level: 3, emoji: '🔄' },
          { name: 'Pièces intérieur', slug: 'pieces-detachees-pieces-automobiles-pieces-interieur', level: 3, emoji: '🚘' },
          { name: 'Carrosserie', slug: 'pieces-detachees-pieces-automobiles-carrosserie', level: 3, emoji: '🚙' },
          { name: 'Optiques & Éclairage', slug: 'pieces-detachees-pieces-automobiles-optiques-eclairage', level: 3, emoji: '💡' },
          { name: 'Vitres & pare-brise', slug: 'pieces-detachees-pieces-automobiles-vitres-pare-brise', level: 3, emoji: '🚪' },
          { name: 'Pneus & Jantes', slug: 'pieces-detachees-pieces-automobiles-pneus-jantes', level: 3, emoji: '🛞' },
          { name: 'Housses & Tapis', slug: 'pieces-detachees-pieces-automobiles-housses-tapis', level: 3, emoji: '🎭' },
          { name: 'Batteries', slug: 'pieces-detachees-pieces-automobiles-batteries', level: 3, emoji: '🔋' },
          { name: 'Sono & Multimédia', slug: 'pieces-detachees-pieces-automobiles-sono-multimedia', level: 3, emoji: '🎵' },
          { name: 'Sièges auto', slug: 'pieces-detachees-pieces-automobiles-sieges-auto', level: 3, emoji: '💺' },
          { name: 'Autres pièces auto', slug: 'pieces-detachees-pieces-automobiles-autres-pieces-auto', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Pièces moto',
        slug: 'pieces-detachees-pieces-moto',
        level: 2,
        emoji: '🏍️',
        order: 2,
        children: [
          { name: 'Casques & Protections', slug: 'pieces-detachees-pieces-moto-casques-protections', level: 3, emoji: '🪖' },
          { name: 'Pneus & Jantes', slug: 'pieces-detachees-pieces-moto-pneus-jantes', level: 3, emoji: '🛞' },
          { name: 'Optiques & Éclairage', slug: 'pieces-detachees-pieces-moto-optiques-eclairage', level: 3, emoji: '💡' },
          { name: 'Accessoires', slug: 'pieces-detachees-pieces-moto-accessoires', level: 3, emoji: '🔧' },
          { name: 'Autres pièces moto', slug: 'pieces-detachees-pieces-moto-autres-pieces-moto', level: 3, emoji: '🏍️' }
        ]
      },
      {
        name: 'Pièces bateaux',
        slug: 'pieces-detachees-pieces-bateaux',
        level: 2,
        emoji: '⛵',
        order: 3,
        children: [
          { name: 'Moteurs', slug: 'pieces-detachees-pieces-bateaux-moteurs', level: 3, emoji: '⚙️' },
          { name: 'Pièces', slug: 'pieces-detachees-pieces-bateaux-pieces', level: 3, emoji: '🔩' },
          { name: 'Accessoires', slug: 'pieces-detachees-pieces-bateaux-accessoires', level: 3, emoji: '⚓' },
          { name: 'Autres pièces bateaux', slug: 'pieces-detachees-pieces-bateaux-autres-pieces-bateaux', level: 3, emoji: '⛵' }
        ]
      },
      { name: 'Alarme & Sécurité', slug: 'pieces-detachees-alarme-securite', level: 2, emoji: '🔐', order: 4, children: [] },
      { name: 'Nettoyage & Entretien', slug: 'pieces-detachees-nettoyage-entretien', level: 2, emoji: '🧹', order: 5, children: [] },
      { name: 'Outils de diagnostics', slug: 'pieces-detachees-outils-diagnostics', level: 2, emoji: '🔧', order: 6, children: [] },
      { name: 'Lubrifiants', slug: 'pieces-detachees-lubrifiants', level: 2, emoji: '⚗️', order: 7, children: [] },
      { name: 'Pièces véhicules', slug: 'pieces-detachees-pieces-vehicules', level: 2, emoji: '🔌', order: 8, children: [] },
      { name: 'Autres pièces', slug: 'pieces-detachees-autres-pieces', level: 2, emoji: '🛠️', order: 9, children: [] }
    ]
  },

  // ==================== 12. SANTE & BEAUTE ====================
  {
    name: 'Sante & Beaute',
    slug: 'sante-beaute',
    level: 1,
    emoji: '💄',
    order: 12,
    children: [
      {
        name: 'Cosmétiques & Beauté',
        slug: 'sante-beaute-cosmetiques-beaute',
        level: 2,
        emoji: '💄',
        order: 1,
        children: [
          { name: 'Soins du corps', slug: 'sante-beaute-cosmetiques-beaute-soins-corps', level: 3, emoji: '🧴' },
          { name: 'Savons & Gels douche', slug: 'sante-beaute-cosmetiques-beaute-savons-gels-douche', level: 3, emoji: '🧼' },
          { name: 'Soins visage', slug: 'sante-beaute-cosmetiques-beaute-soins-visage', level: 3, emoji: '🧖‍♀️' },
          { name: 'Maquillage', slug: 'sante-beaute-cosmetiques-beaute-maquillage', level: 3, emoji: '💋' },
          { name: 'Produits Solaires & Bronzage', slug: 'sante-beaute-cosmetiques-beaute-produits-solaires-bronzage', level: 3, emoji: '☀️' },
          { name: 'Instruments & Outils de beauté', slug: 'sante-beaute-cosmetiques-beaute-instruments-outils-beaute', level: 3, emoji: '✂️' },
          { name: 'Manucure et pedicure', slug: 'sante-beaute-cosmetiques-beaute-manucure-pedicure', level: 3, emoji: '💅' },
          { name: 'Rasage et Épilation', slug: 'sante-beaute-cosmetiques-beaute-rasage-epilation', level: 3, emoji: '🪒' },
          { name: 'Hygiène', slug: 'sante-beaute-cosmetiques-beaute-hygiene', level: 3, emoji: '🚿' },
          { name: 'Coiffure', slug: 'sante-beaute-cosmetiques-beaute-coiffure', level: 3, emoji: '💇' },
          { name: 'Soins bébé', slug: 'sante-beaute-cosmetiques-beaute-soins-bebe', level: 3, emoji: '👶' },
          { name: 'Autres produits', slug: 'sante-beaute-cosmetiques-beaute-autres-produits', level: 3, emoji: '💄' }
        ]
      },
      {
        name: 'Parapharmacie & Santé',
        slug: 'sante-beaute-parapharmacie-sante',
        level: 2,
        emoji: '💊',
        order: 2,
        children: [
          { name: 'Dispositifs médicaux', slug: 'sante-beaute-parapharmacie-sante-dispositifs-medicaux', level: 3, emoji: '🩺' },
          { name: 'Complément Alimentaire', slug: 'sante-beaute-parapharmacie-sante-complement-alimentaire', level: 3, emoji: '🥗' },
          { name: 'Matériel Médical', slug: 'sante-beaute-parapharmacie-sante-materiel-medical', level: 3, emoji: '🏥' },
          { name: 'Aliments Diététiques', slug: 'sante-beaute-parapharmacie-sante-aliments-dietetiques', level: 3, emoji: '🥦' }
        ]
      },
      { name: 'Parfums et déodorants femme', slug: 'sante-beaute-parfums-deodorants-femme', level: 2, emoji: '🌸', order: 3, children: [] },
      { name: 'Parfums et déodorants homme', slug: 'sante-beaute-parfums-deodorants-homme', level: 2, emoji: '🌲', order: 4, children: [] },
      { name: 'Accessoires beauté', slug: 'sante-beaute-accessoires-beaute', level: 2, emoji: '🪞', order: 5, children: [] },
      { name: 'Soins cheveux', slug: 'sante-beaute-soins-cheveux', level: 2, emoji: '💇', order: 6, children: [] },
      { name: 'Autre Santé & Beauté', slug: 'sante-beaute-autre-sante-beaute', level: 2, emoji: '💡', order: 7, children: [] }
    ]
  },

  // ==================== 13. SERVICES ====================
  {
    name: 'Services',
    slug: 'services',
    level: 1,
    emoji: '🛠️',
    order: 13,
    children: [
      { name: 'Construction & Travaux', slug: 'services-construction-travaux', level: 2, emoji: '🏗️', order: 1, children: [] },
      { name: 'Ecoles & Formations', slug: 'services-ecoles-formations', level: 2, emoji: '🎓', order: 2, children: [] },
      { name: 'Industrie & Fabrication', slug: 'services-industrie-fabrication', level: 2, emoji: '🏭', order: 3, children: [] },
      { name: 'Transport et déménagement', slug: 'services-transport-demenagement', level: 2, emoji: '🚚', order: 4, children: [] },
      { name: 'Décoration & Aménagement', slug: 'services-decoration-amenagement', level: 2, emoji: '🎨', order: 5, children: [] },
      { name: 'Publicite & Communication', slug: 'services-publicite-communication', level: 2, emoji: '📢', order: 6, children: [] },
      { name: 'Nettoyage & Jardinage', slug: 'services-nettoyage-jardinage', level: 2, emoji: '🧹', order: 7, children: [] },
      { name: 'Froid & Climatisation', slug: 'services-froid-climatisation', level: 2, emoji: '❄️', order: 8, children: [] },
      { name: 'Traiteurs & Gateaux', slug: 'services-traiteurs-gateaux', level: 2, emoji: '🍰', order: 9, children: [] },
      { name: 'Médecine & Santé', slug: 'services-medecine-sante', level: 2, emoji: '🏥', order: 10, children: [] },
      { name: 'Réparation auto & Diagnostic', slug: 'services-reparation-auto-diagnostic', level: 2, emoji: '🔧', order: 11, children: [] },
      { name: 'Sécurité & Alarme', slug: 'services-securite-alarme', level: 2, emoji: '🚨', order: 12, children: [] },
      { name: 'Projets & Études', slug: 'services-projets-etudes', level: 2, emoji: '📊', order: 13, children: [] },
      { name: 'Bureautique & Internet', slug: 'services-bureautique-internet', level: 2, emoji: '💻', order: 14, children: [] },
      { name: 'Location de véhicules', slug: 'services-location-vehicules', level: 2, emoji: '🚗', order: 15, children: [] },
      { name: 'Menuiserie & Meubles', slug: 'services-menuiserie-meubles', level: 2, emoji: '🪚', order: 16, children: [] },
      { name: 'Impression & Edition', slug: 'services-impression-edition', level: 2, emoji: '🖨️', order: 17, children: [] },
      { name: 'Hôtellerie & Restauration & Salles', slug: 'services-hotellerie-restauration-salles', level: 2, emoji: '🍽️', order: 18, children: [] },
      { name: 'Esthétique & Beauté', slug: 'services-esthetique-beaute', level: 2, emoji: '💄', order: 19, children: [] },
      { name: 'Image & Son', slug: 'services-image-son', level: 2, emoji: '🎬', order: 20, children: [] },
      { name: 'Comptabilité & Economie', slug: 'services-comptabilite-economie', level: 2, emoji: '💰', order: 21, children: [] },
      { name: 'Couture & Confection', slug: 'services-couture-confection', level: 2, emoji: '🧵', order: 22, children: [] },
      { name: 'Maintenance informatique', slug: 'services-maintenance-informatique', level: 2, emoji: '💻', order: 23, children: [] },
      { name: 'Réparation Electromenager', slug: 'services-reparation-electromenager', level: 2, emoji: '🔌', order: 24, children: [] },
      { name: 'Evènements & Divertissement', slug: 'services-evenements-divertissement', level: 2, emoji: '🎪', order: 25, children: [] },
      { name: 'Paraboles & Démos', slug: 'services-paraboles-demos', level: 2, emoji: '📡', order: 26, children: [] },
      { name: 'Réparation Électronique', slug: 'services-reparation-electronique', level: 2, emoji: '🔌', order: 27, children: [] },
      { name: 'Services à l\'étranger', slug: 'services-services-etranger', level: 2, emoji: '🌍', order: 28, children: [] },
      { name: 'Flashage & Réparation des téléphones', slug: 'services-flashage-reparation-telephones', level: 2, emoji: '📱', order: 29, children: [] },
      { name: 'Flashage & Installation des jeux', slug: 'services-flashage-installation-jeux', level: 2, emoji: '🎮', order: 30, children: [] },
      { name: 'Juridique', slug: 'services-juridique', level: 2, emoji: '⚖️', order: 31, children: [] },
      { name: 'Autres Services', slug: 'services-autres-services', level: 2, emoji: '🛠️', order: 32, children: [] }
    ]
  },

  // ==================== 14. SPORT ====================
  {
    name: 'Sport',
    slug: 'sport',
    level: 1,
    emoji: '⚽',
    order: 14,
    children: [
      {
        name: 'Football',
        slug: 'sport-football',
        level: 2,
        emoji: '⚽',
        order: 1,
        children: [
          { name: 'Ballons et Buts', slug: 'sport-football-ballons-buts', level: 3, emoji: '⚽' },
          { name: 'Équipements et accessoires', slug: 'sport-football-equipements-accessoires-foot', level: 3, emoji: '🛡️' },
          { name: 'Chaussures de Football', slug: 'sport-football-chaussures-football', level: 3, emoji: '👟' },
          { name: 'Vêtements de football', slug: 'sport-football-vetements-football', level: 3, emoji: '👕' }
        ]
      },
      {
        name: 'Hand/Voley/ Basket-Ball',
        slug: 'sport-hand-voley-basket',
        level: 2,
        emoji: '🏀',
        order: 2,
        children: [
          { name: 'Équipements et accessoires', slug: 'sport-hand-voley-basket-equipements-accessoires-basket', level: 3, emoji: '🏀' },
          { name: 'Ballons Buts et Filets', slug: 'sport-hand-voley-basket-ballons-buts-filets', level: 3, emoji: '🏐' },
          { name: 'Chaussures', slug: 'sport-hand-voley-basket-chaussures-basket', level: 3, emoji: '👟' },
          { name: 'Vêtements', slug: 'sport-hand-voley-basket-vetements-basket', level: 3, emoji: '👕' }
        ]
      },
      {
        name: 'Sport de combat',
        slug: 'sport-sport-combat',
        level: 2,
        emoji: '🥊',
        order: 3,
        children: [
          { name: 'Tenue', slug: 'sport-sport-combat-tenue-combat', level: 3, emoji: '🥋' },
          { name: 'Gants et casques', slug: 'sport-sport-combat-gants-casques', level: 3, emoji: '🥊' },
          { name: 'Autres accessoires', slug: 'sport-sport-combat-autres-accessoires-combat', level: 3, emoji: '🧤' }
        ]
      },
      {
        name: 'Fitness - Musculation',
        slug: 'sport-fitness-musculation',
        level: 2,
        emoji: '💪',
        order: 4,
        children: [
          { name: 'Bancs et presses de musculation', slug: 'sport-fitness-musculation-bancs-presses', level: 3, emoji: '🏋️' },
          { name: 'Poids et haltères', slug: 'sport-fitness-musculation-poids-halteres', level: 3, emoji: '🏋️‍♂️' },
          { name: 'Tapis roulants', slug: 'sport-fitness-musculation-tapis-roulants', level: 3, emoji: '🏃' },
          { name: 'Vélos et rameurs', slug: 'sport-fitness-musculation-velos-rameurs', level: 3, emoji: '🚴' },
          { name: 'Autres équipements', slug: 'sport-fitness-musculation-autres-equipements-fitness', level: 3, emoji: '💪' }
        ]
      },
      {
        name: 'Natation',
        slug: 'sport-natation',
        level: 2,
        emoji: '🏊',
        order: 5,
        children: [
          { name: 'Lunettes', slug: 'sport-natation-lunettes-natation', level: 3, emoji: '🥽' },
          { name: 'Bonnets', slug: 'sport-natation-bonnets', level: 3, emoji: '🧢' },
          { name: 'Palmes', slug: 'sport-natation-palmes', level: 3, emoji: '🐠' },
          { name: 'Planches et flotteurs', slug: 'sport-natation-planches-flotteurs', level: 3, emoji: '🛟' },
          { name: 'Maillots et combinaisons', slug: 'sport-natation-maillots-combinaisons', level: 3, emoji: '🩱' },
          { name: 'Autres accessoires', slug: 'sport-natation-autres-accessoires-natation', level: 3, emoji: '🏊' }
        ]
      },
      {
        name: 'Vélos et trotinettes',
        slug: 'sport-velos-trotinettes',
        level: 2,
        emoji: '🚲',
        order: 6,
        children: [
          { name: 'Vêtements et chaussures', slug: 'sport-velos-trotinettes-vetements-chaussures-velo', level: 3, emoji: '👕' },
          { name: 'Vélos', slug: 'sport-velos-trotinettes-velos', level: 3, emoji: '🚲' },
          { name: 'Trotinettes', slug: 'sport-velos-trotinettes-trotinettes', level: 3, emoji: '🛴' },
          { name: 'Équipements et accessoires', slug: 'sport-velos-trotinettes-equipements-accessoires-velo', level: 3, emoji: '🔧' }
        ]
      },
      {
        name: 'Sports de raquette',
        slug: 'sport-sports-raquette',
        level: 2,
        emoji: '🎾',
        order: 7,
        children: [
          { name: 'Tennis', slug: 'sport-sports-raquette-tennis', level: 3, emoji: '🎾' },
          { name: 'Tennis de table', slug: 'sport-sports-raquette-tennis-table', level: 3, emoji: '🏓' },
          { name: 'Autre', slug: 'sport-sports-raquette-autre-raquette', level: 3, emoji: '🎯' }
        ]
      },
      { name: 'Sport aquatiques', slug: 'sport-sport-aquatiques', level: 2, emoji: '🤿', order: 8, children: [] },
      { name: 'Équitation', slug: 'sport-equitation', level: 2, emoji: '🐎', order: 9, children: [] },
      { name: 'Pétanque', slug: 'sport-petanque', level: 2, emoji: '🎯', order: 10, children: [] },
      { name: 'Autres', slug: 'sport-autres-sports', level: 2, emoji: '🏅', order: 11, children: [] }
    ]
  },

  // ==================== 15. VOYAGES ====================
  {
    name: 'Voyages',
    slug: 'voyages',
    level: 1,
    emoji: '✈️',
    order: 15,
    children: [
      { name: 'Voyage organisé', slug: 'voyages-voyage-organise', level: 2, emoji: '✈️', order: 1, children: [] },
      { name: 'Location vacances', slug: 'voyages-location-vacances', level: 2, emoji: '🏠', order: 2, children: [] },
      { name: 'Hajj & Omra', slug: 'voyages-hajj-omra', level: 2, emoji: '🕋', order: 3, children: [] },
      { name: 'Réservations & Visa', slug: 'voyages-reservations-visa', level: 2, emoji: '🛂', order: 4, children: [] },
      { name: 'Séjour', slug: 'voyages-sejour', level: 2, emoji: '🏨', order: 5, children: [] },
      { name: 'Croisière', slug: 'voyages-croisiere', level: 2, emoji: '🚢', order: 6, children: [] },
      { name: 'Autre voyages', slug: 'voyages-autre-voyages', level: 2, emoji: '🧳', order: 7, children: [] }
    ]
  },

  // ==================== 16. BOUTIQUES ====================
  {
    name: 'Boutiques',
    slug: 'boutiques',
    level: 1,
    emoji: '🏪',
    order: 16,
    children: [
      { name: 'Basic 50 (1 mois)', slug: 'boutiques-basic-50-1mois', level: 2, emoji: '⭐', order: 1, children: [] },
      { name: 'Basic 50 (6 mois)', slug: 'boutiques-basic-50-6mois', level: 2, emoji: '⭐', order: 2, children: [] },
      { name: 'Basic 50 (12 mois)', slug: 'boutiques-basic-50-12mois', level: 2, emoji: '⭐', order: 3, children: [] },
      { name: 'Basic 100 (1 mois)', slug: 'boutiques-basic-100-1mois', level: 2, emoji: '⭐', order: 4, children: [] },
      { name: 'Basic 100 (6 mois)', slug: 'boutiques-basic-100-6mois', level: 2, emoji: '⭐', order: 5, children: [] },
      { name: 'Silver 200 (1 mois)', slug: 'boutiques-silver-200-1mois', level: 2, emoji: '🥈', order: 6, children: [] },
      { name: 'Silver 200 (6 mois)', slug: 'boutiques-silver-200-6mois', level: 2, emoji: '🥈', order: 7, children: [] },
      { name: 'Silver 500 (1 mois)', slug: 'boutiques-silver-500-1mois', level: 2, emoji: '🥈', order: 8, children: [] },
      { name: 'Silver 500 (12 mois)', slug: 'boutiques-silver-500-12mois', level: 2, emoji: '🥈', order: 9, children: [] },
      { name: 'Gold 1000 (1 mois)', slug: 'boutiques-gold-1000-1mois', level: 2, emoji: '🏆', order: 10, children: [] },
      { name: 'Gold 1000 (6 mois)', slug: 'boutiques-gold-1000-6mois', level: 2, emoji: '🏆', order: 11, children: [] },
      { name: 'Gold 6000 (1 mois)', slug: 'boutiques-gold-6000-1mois', level: 2, emoji: '👑', order: 12, children: [] },
      { name: 'Gold 6000 (12 mois)', slug: 'boutiques-gold-6000-12mois', level: 2, emoji: '👑', order: 13, children: [] }
    ]
  }
];

const seedCategories = async () => {
  try {
    // Eliminar categorías existentes
    await Category.deleteMany({});
    console.log('🗑️  Categorías eliminadas');

    // Función recursiva para crear categorías
    const createCategory = async (categoryData, parentId = null) => {
      const { children, ...categoryFields } = categoryData;
      const category = new Category({
        ...categoryFields,
        parent: parentId
      });
      
      await category.save();
      console.log(`✅ ${'  '.repeat(categoryData.level - 1)}${categoryData.emoji} ${categoryData.name}`);

      if (children && children.length > 0) {
        for (const childData of children) {
          await createCategory(childData, category._id);
        }
      }
    };

    // Crear categorías
    console.log('🌱 Iniciando seed...');
    for (const categoryData of categoriesData) {
      await createCategory(categoryData);
    }

    console.log('\n🎉 SEED COMPLETADO CON ÉXITO');
    console.log('📊 Resumen:');
    console.log(`   • ${categoriesData.length} categorías principales`);
    
    let totalLevel2 = 0;
    let totalLevel3 = 0;
    
    categoriesData.forEach(cat => {
      totalLevel2 += cat.children.length;
      cat.children.forEach(child => {
        totalLevel3 += child.children.length || 0;
      });
    });
    
    console.log(`   • ${totalLevel2} subcategorías (nivel 2)`);
    console.log(`   • ${totalLevel3} artículos/tipos (nivel 3)`);
    console.log(`   • Total: ${categoriesData.length + totalLevel2 + totalLevel3} items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};
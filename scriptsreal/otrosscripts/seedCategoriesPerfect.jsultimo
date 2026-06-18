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

// Crear slug único - SOLO EL NOMBRE, SIN PREFIJOS
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

// 🎯 ESTRUCTURA PERFECTA CON SLUGS LIMPIOS Y EMOGIS PARA TODOS LOS NIVELES
const categoriesData = [
  // ==================== 1. VEHICULES ====================
  {
    name: 'Vehicules',
    slug: 'vehicules',
    level: 1,
    emoji: '🚗',
    order: 3,
    children: [
      { name: 'Voitures', slug: 'voitures', level: 2, emoji: '🚘', order: 1, children: [] },
      { name: 'Utilitaire', slug: 'utilitaire', level: 2, emoji: '🚐', order: 2, children: [] },
      { name: 'Motos & Scooters', slug: 'motos-scooters', level: 2, emoji: '🏍️', order: 3, children: [] },
      { name: 'Quads', slug: 'quads', level: 2, emoji: '🛺', order: 4, children: [] },
      { name: 'Fourgon', slug: 'fourgon', level: 2, emoji: '🚚', order: 5, children: [] },
      { name: 'Camion', slug: 'camion', level: 2, emoji: '🚛', order: 6, children: [] },
      { name: 'Bus', slug: 'bus', level: 2, emoji: '🚌', order: 7, children: [] },
      { name: 'Engin', slug: 'engin', level: 2, emoji: '🚜', order: 8, children: [] },
      { name: 'Tracteurs', slug: 'tracteurs', level: 2, emoji: '🚜', order: 9, children: [] },
      { name: 'Remorques', slug: 'remorques', level: 2, emoji: '🛞', order: 10, children: [] },
      { name: 'Bateaux & Barques', slug: 'bateaux-barques', level: 2, emoji: '⛵', order: 11, children: [] }
    ]
  },

  // ==================== 2. VETEMENTS ====================
  {
    name: 'Vetements',
    slug: 'vetements',
    level: 1,
    emoji: '👕',
    order: 8,
    children: [
      {
        name: 'Vêtements Homme',
        slug: 'vetements-homme',
        level: 2,
        emoji: '👨',
        order: 1,
        children: [
          { name: 'Hauts & Chemises', slug: 'hauts-chemises', level: 3, emoji: '👔', children: [] },
          { name: 'Jeans & Pantalons', slug: 'jeans-pantalons', level: 3, emoji: '👖', children: [] },
          { name: 'Shorts & Pantacourts', slug: 'shorts-pantacourts', level: 3, emoji: '🩳', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets', level: 3, emoji: '🧥', children: [] },
          { name: 'Costumes & Blazers', slug: 'costumes-blazers', level: 3, emoji: '🤵', children: [] },
          { name: 'Survetements', slug: 'survetements', level: 3, emoji: '🏃‍♂️', children: [] },
          { name: 'Kamiss', slug: 'kamiss', level: 3, emoji: '🕌', children: [] },
          { name: 'Sous vêtements', slug: 'sous-vetements', level: 3, emoji: '🩲', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas', level: 3, emoji: '😴', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain', level: 3, emoji: '🩳', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux', level: 3, emoji: '🧢', children: [] },
          { name: 'Chaussettes', slug: 'chaussettes', level: 3, emoji: '🧦', children: [] },
          { name: 'Ceintures', slug: 'ceintures', level: 3, emoji: '⛓️', children: [] },
          { name: 'Gants', slug: 'gants', level: 3, emoji: '🧤', children: [] },
          { name: 'Cravates', slug: 'cravates', level: 3, emoji: '👔', children: [] },
          { name: 'Autre', slug: 'autre-homme', level: 3, emoji: '🧵', children: [] }
        ]
      },
      {
        name: 'Vêtements Femme',
        slug: 'vetements-femme',
        level: 2,
        emoji: '👩',
        order: 2,
        children: [
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-femme', level: 3, emoji: '👚', children: [] },
          { name: 'Jeans & Pantalons', slug: 'jeans-pantalons-femme', level: 3, emoji: '👖', children: [] },
          { name: 'Shorts & Pantacourts', slug: 'shorts-pantacourts-femme', level: 3, emoji: '🩳', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-femme', level: 3, emoji: '🧥', children: [] },
          { name: 'Ensembles', slug: 'ensembles', level: 3, emoji: '👗', children: [] },
          { name: 'Abayas & Hijabs', slug: 'abayas-hijabs', level: 3, emoji: '🧕', children: [] },
          { name: 'Mariages & Fêtes', slug: 'mariages-fetes', level: 3, emoji: '💒', children: [] },
          { name: 'Maternité', slug: 'maternite', level: 3, emoji: '🤰', children: [] },
          { name: 'Robes', slug: 'robes', level: 3, emoji: '👗', children: [] },
          { name: 'Jupes', slug: 'jupes', level: 3, emoji: '🩳', children: [] },
          { name: 'Joggings & Survetements', slug: 'joggings-survetements-femme', level: 3, emoji: '🏃‍♀️', children: [] },
          { name: 'Leggings', slug: 'leggings', level: 3, emoji: '🦵', children: [] },
          { name: 'Sous-vêtements & Lingerie', slug: 'sous-vetements-lingerie', level: 3, emoji: '🩱', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-femme', level: 3, emoji: '😴', children: [] },
          { name: 'Peignoirs', slug: 'peignoirs', level: 3, emoji: '🛀', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-femme', level: 3, emoji: '🏊‍♀️', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-femme', level: 3, emoji: '🧢', children: [] },
          { name: 'Chaussettes & Collants', slug: 'chaussettes-collants', level: 3, emoji: '🧦', children: [] },
          { name: 'Foulards & Echarpes', slug: 'foulards-echarpes', level: 3, emoji: '🧣', children: [] },
          { name: 'Ceintures', slug: 'ceintures-femme', level: 3, emoji: '⛓️', children: [] },
          { name: 'Gants', slug: 'gants-femme', level: 3, emoji: '🧤', children: [] },
          { name: 'Autre', slug: 'autre-femme', level: 3, emoji: '🧵', children: [] }
        ]
      },
      {
        name: 'Chaussures Homme',
        slug: 'chaussures-homme',
        level: 2,
        emoji: '👞',
        order: 3,
        children: [
          { name: 'Basquettes', slug: 'basquettes', level: 3, emoji: '👟', children: [] },
          { name: 'Bottes', slug: 'bottes', level: 3, emoji: '🥾', children: [] },
          { name: 'Classiques', slug: 'classiques', level: 3, emoji: '👞', children: [] },
          { name: 'Mocassins', slug: 'mocassins', level: 3, emoji: '🥿', children: [] },
          { name: 'Sandales', slug: 'sandales', level: 3, emoji: '🩴', children: [] },
          { name: 'Tangues & Pantoufles', slug: 'tangues-pantoufles', level: 3, emoji: '🩴', children: [] },
          { name: 'Autre', slug: 'autre-chaussures-homme', level: 3, emoji: '👢', children: [] }
        ]
      },
      {
        name: 'Chaussures Femme',
        slug: 'chaussures-femme',
        level: 2,
        emoji: '👠',
        order: 4,
        children: [
          { name: 'Basquettes', slug: 'basquettes-femme', level: 3, emoji: '👟', children: [] },
          { name: 'Sandales', slug: 'sandales-femme', level: 3, emoji: '👡', children: [] },
          { name: 'Bottes', slug: 'bottes-femme', level: 3, emoji: '🥾', children: [] },
          { name: 'Escarpins', slug: 'escarpins', level: 3, emoji: '👠', children: [] },
          { name: 'Ballerines', slug: 'ballerines', level: 3, emoji: '🩰', children: [] },
          { name: 'Tangues & Pantoufles', slug: 'tangues-pantoufles-femme', level: 3, emoji: '🩴', children: [] },
          { name: 'Autre', slug: 'autre-chaussures-femme', level: 3, emoji: '👢', children: [] }
        ]
      },
      {
        name: 'Garçons',
        slug: 'garcons',
        level: 2,
        emoji: '👦',
        order: 5,
        children: [
          { name: 'Chaussures', slug: 'chaussures-garcons', level: 3, emoji: '👟', children: [] },
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-garcons', level: 3, emoji: '👕', children: [] },
          { name: 'Pantalons & Shorts', slug: 'pantalons-shorts-garcons', level: 3, emoji: '👖', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-garcons', level: 3, emoji: '🧥', children: [] },
          { name: 'Costumes', slug: 'costumes-garcons', level: 3, emoji: '🤵', children: [] },
          { name: 'Survetements & Joggings', slug: 'survetements-joggings-garcons', level: 3, emoji: '🏃‍♂️', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-garcons', level: 3, emoji: '😴', children: [] },
          { name: 'Sous-vêtements', slug: 'sous-vetements-garcons', level: 3, emoji: '🩲', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-garcons', level: 3, emoji: '🏊‍♂️', children: [] },
          { name: 'Kamiss', slug: 'kamiss-garcons', level: 3, emoji: '🕌', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-garcons', level: 3, emoji: '🧢', children: [] },
          { name: 'Autre', slug: 'autre-garcons', level: 3, emoji: '🧸', children: [] }
        ]
      },
      {
        name: 'Filles',
        slug: 'filles',
        level: 2,
        emoji: '👧',
        order: 6,
        children: [
          { name: 'Chaussures', slug: 'chaussures-filles', level: 3, emoji: '👟', children: [] },
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-filles', level: 3, emoji: '👚', children: [] },
          { name: 'Pantalons & Shorts', slug: 'pantalons-shorts-filles', level: 3, emoji: '👖', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-filles', level: 3, emoji: '🧥', children: [] },
          { name: 'Robes', slug: 'robes-filles', level: 3, emoji: '👗', children: [] },
          { name: 'Jupes', slug: 'jupes-filles', level: 3, emoji: '🩳', children: [] },
          { name: 'Ensembles', slug: 'ensembles-filles', level: 3, emoji: '👘', children: [] },
          { name: 'Joggings & Survetements', slug: 'joggings-survetements-filles', level: 3, emoji: '🏃‍♀️', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-filles', level: 3, emoji: '😴', children: [] },
          { name: 'Sous-vêtements', slug: 'sous-vetements-filles', level: 3, emoji: '🩱', children: [] },
          { name: 'Leggings & Collants', slug: 'leggings-collants', level: 3, emoji: '🦵', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-filles', level: 3, emoji: '🏊‍♀️', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-filles', level: 3, emoji: '🧢', children: [] },
          { name: 'Autre', slug: 'autre-filles', level: 3, emoji: '🎀', children: [] }
        ]
      },
      {
        name: 'Bébé',
        slug: 'bebe',
        level: 2,
        emoji: '👶',
        order: 7,
        children: [
          { name: 'Vêtements', slug: 'vetements-bebe', level: 3, emoji: '👕', children: [] },
          { name: 'Chaussures', slug: 'chaussures-bebe', level: 3, emoji: '👟', children: [] },
          { name: 'Accessoires', slug: 'accessoires-bebe', level: 3, emoji: '🧸', children: [] }
        ]
      },
      {
        name: 'Sacs & Valises',
        slug: 'sacs-valises',
        level: 2,
        emoji: '👜',
        order: 8,
        children: [
          { name: 'Pochettes & Portefeuilles', slug: 'pochettes-portefeuilles', level: 3, emoji: '👛', children: [] },
          { name: 'Sacs à main', slug: 'sacs-main', level: 3, emoji: '👜', children: [] },
          { name: 'Sacs à dos', slug: 'sacs-dos', level: 3, emoji: '🎒', children: [] },
          { name: 'Sacs professionnels', slug: 'sacs-professionnels', level: 3, emoji: '💼', children: [] },
          { name: 'Valises', slug: 'valises', level: 3, emoji: '🧳', children: [] },
          { name: 'Cabas de sport', slug: 'cabas-sport', level: 3, emoji: '🏋️', children: [] },
          { name: 'Autre', slug: 'autre-sacs', level: 3, emoji: '🛍️', children: [] }
        ]
      },
      {
        name: 'Montres',
        slug: 'montres',
        level: 2,
        emoji: '⌚',
        order: 9,
        children: [
          { name: 'Hommes', slug: 'montres-hommes', level: 3, emoji: '⌚', children: [] },
          { name: 'Femmes', slug: 'montres-femmes', level: 3, emoji: '⌚', children: [] }
        ]
      },
      {
        name: 'Lunettes',
        slug: 'lunettes',
        level: 2,
        emoji: '👓',
        order: 10,
        children: [
          { name: 'Lunettes de vue hommes', slug: 'lunettes-vue-hommes', level: 3, emoji: '👓', children: [] },
          { name: 'Lunettes de vue femmes', slug: 'lunettes-vue-femmes', level: 3, emoji: '👓', children: [] },
          { name: 'Lunettes de soleil hommes', slug: 'lunettes-soleil-hommes', level: 3, emoji: '🕶️', children: [] },
          { name: 'Lunettes de soleil femmes', slug: 'lunettes-soleil-femmes', level: 3, emoji: '🕶️', children: [] },
          { name: 'Lunettes de vue enfants', slug: 'lunettes-vue-enfants', level: 3, emoji: '👓', children: [] },
          { name: 'Lunettes de soleil enfants', slug: 'lunettes-soleil-enfants', level: 3, emoji: '🕶️', children: [] },
          { name: 'Accessoires', slug: 'accessoires-lunettes', level: 3, emoji: '🧰', children: [] }
        ]
      },
      {
        name: 'Bijoux',
        slug: 'bijoux',
        level: 2,
        emoji: '💍',
        order: 11,
        children: [
          { name: 'Parures', slug: 'parures', level: 3, emoji: '👑', children: [] },
          { name: 'Colliers & Pendentifs', slug: 'colliers-pendentifs', level: 3, emoji: '📿', children: [] },
          { name: 'Bracelets', slug: 'bracelets', level: 3, emoji: '📿', children: [] },
          { name: 'Bagues', slug: 'bagues', level: 3, emoji: '💍', children: [] },
          { name: 'Boucles', slug: 'boucles', level: 3, emoji: '👂', children: [] },
          { name: 'Chevillières', slug: 'chevilleres', level: 3, emoji: '🦶', children: [] },
          { name: 'Piercings', slug: 'piercings', level: 3, emoji: '👃', children: [] },
          { name: 'Accessoires cheveux', slug: 'accessoires-cheveux', level: 3, emoji: '💇‍♀️', children: [] },
          { name: 'Broches', slug: 'broches', level: 3, emoji: '🧷', children: [] },
          { name: 'Autre', slug: 'autre-bijoux', level: 3, emoji: '💎', children: [] }
        ]
      },
      {
        name: 'Tenues professionnelles',
        slug: 'tenues-professionnelles',
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
    order: 7,
    children: [
      { name: 'Téléviseurs', slug: 'televiseurs', level: 2, emoji: '📺', order: 1, children: [] },
      { name: 'Démodulateurs & Box TV', slug: 'demodulateurs-box-tv', level: 2, emoji: '📦', order: 2, children: [] },
      { name: 'Paraboles & Switch TV', slug: 'paraboles-switch-tv', level: 2, emoji: '🛰️', order: 3, children: [] },
      { name: 'Abonnements IPTV', slug: 'abonnements-iptv', level: 2, emoji: '📡', order: 4, children: [] },
      { name: 'Caméras & Accessories', slug: 'cameras-accessories', level: 2, emoji: '📹', order: 5, children: [] },
      { name: 'Audio', slug: 'audio', level: 2, emoji: '🔊', order: 6, children: [] },
      { name: 'Aspirateurs & Nettoyeurs', slug: 'aspirateurs-nettoyeurs', level: 2, emoji: '🧹', order: 7, children: [] },
      { name: 'Repassage', slug: 'repassage', level: 2, emoji: '👕', order: 8, children: [] },
      { name: 'Beauté & Hygiène', slug: 'beaute-hygiene', level: 2, emoji: '💄', order: 9, children: [] },
      { name: 'Machines à coudre', slug: 'machines-coudre', level: 2, emoji: '🧵', order: 10, children: [] },
      { name: 'Télécommandes', slug: 'telecommandes', level: 2, emoji: '🎮', order: 11, children: [] },
      { name: 'Sécurité & GPS', slug: 'securite-gps', level: 2, emoji: '🚨', order: 12, children: [] },
      { name: 'Composants électroniques', slug: 'composants-electroniques', level: 2, emoji: '⚙️', order: 13, children: [] },
      { name: 'Pièces de rechange', slug: 'pieces-rechange', level: 2, emoji: '🔧', order: 14, children: [] },
      { name: 'Autre Électroménager', slug: 'autre-electromenager', level: 2, emoji: '🔌', order: 15, children: [] },
      {
        name: 'Réfrigérateurs & Congélateurs',
        slug: 'refrigerateurs-congelateurs',
        level: 2,
        emoji: '❄️',
        order: 16,
        children: [
          { name: 'Réfrigérateur', slug: 'refrigerateur', level: 3, emoji: '🧊', children: [] },
          { name: 'Congélateur', slug: 'congelateur', level: 3, emoji: '❄️', children: [] },
          { name: 'Réfrigérateur-Congélateur', slug: 'refrigerateur-congelateur', level: 3, emoji: '🧊❄️', children: [] },
          { name: 'Cave à vin', slug: 'cave-vin', level: 3, emoji: '🍷', children: [] }
        ]
      },
      {
        name: 'Machines à laver',
        slug: 'machines-laver',
        level: 2,
        emoji: '🧺',
        order: 17,
        children: [
          { name: 'Lave-linge', slug: 'lave-linge', level: 3, emoji: '👚', children: [] },
          { name: 'Sèche-linge', slug: 'seche-linge', level: 3, emoji: '☀️', children: [] },
          { name: 'Lave-linge/Sèche-linge', slug: 'lave-linge-seche-linge', level: 3, emoji: '👚☀️', children: [] },
          { name: 'Lave-linge avec essorage', slug: 'lave-linge-essorage', level: 3, emoji: '🌀', children: [] }
        ]
      },
      {
        name: 'Lave-vaisselles',
        slug: 'lave-vaisselles',
        level: 2,
        emoji: '🍽️',
        order: 18,
        children: [
          { name: 'Lave-vaisselle encastrable', slug: 'lave-vaisselle-encastrable', level: 3, emoji: '📦', children: [] },
          { name: 'Lave-vaisselle pose libre', slug: 'lave-vaisselle-poselibre', level: 3, emoji: '🍽️', children: [] },
          { name: 'Lave-vaisselle compact', slug: 'lave-vaisselle-compact', level: 3, emoji: '📦', children: [] }
        ]
      },
      {
        name: 'Fours & Cuisson',
        slug: 'fours-cuisson',
        level: 2,
        emoji: '🔥',
        order: 19,
        children: [
          { name: 'Four électrique', slug: 'four-electrique', level: 3, emoji: '⚡', children: [] },
          { name: 'Four à gaz', slug: 'four-gaz', level: 3, emoji: '🔥', children: [] },
          { name: 'Four micro-ondes', slug: 'four-micro-ondes', level: 3, emoji: '🌀', children: [] },
          { name: 'Plaque de cuisson', slug: 'plaque-cuisson', level: 3, emoji: '🍳', children: [] },
          { name: 'Cuisinière', slug: 'cuisiniere', level: 3, emoji: '👩‍🍳', children: [] }
        ]
      },
      {
        name: 'Chauffage & Climatisation',
        slug: 'chauffage-climatisation',
        level: 2,
        emoji: '🌡️',
        order: 20,
        children: [
          { name: 'Climatiseur', slug: 'climatiseur', level: 3, emoji: '❄️', children: [] },
          { name: 'Ventilateur', slug: 'ventilateur', level: 3, emoji: '💨', children: [] },
          { name: 'Radiateur', slug: 'radiateur', level: 3, emoji: '🔥', children: [] },
          { name: 'Chauffe-eau', slug: 'chauffe-eau', level: 3, emoji: '🚿', children: [] },
          { name: 'Pompe à chaleur', slug: 'pompe-chaleur', level: 3, emoji: '🌡️', children: [] }
        ]
      },
      {
        name: 'Appareils de cuisine',
        slug: 'appareils-cuisine',
        level: 2,
        emoji: '🍳',
        order: 21,
        children: [
          { name: 'Robot de cuisine', slug: 'robot-cuisine', level: 3, emoji: '🍲', children: [] },
          { name: 'Mixeur', slug: 'mixeur', level: 3, emoji: '🥤', children: [] },
          { name: 'Bouilloire', slug: 'bouilloire', level: 3, emoji: '♨️', children: [] },
          { name: 'Cafetière', slug: 'cafetiere', level: 3, emoji: '☕', children: [] },
          { name: 'Grille-pain', slug: 'grille-pain', level: 3, emoji: '🍞', children: [] }
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
    order: 2,
    children: [
      {
        name: 'Vente',
        slug: 'vente',
        level: 2,
        emoji: '💰',
        order: 1,
        children: [
          { name: 'Appartement', slug: 'appartement', level: 3, emoji: '🏢', children: [] },
          { name: 'Local', slug: 'local', level: 3, emoji: '🏪', children: [] },
          { name: 'Villa', slug: 'villa', level: 3, emoji: '🏡', children: [] },
          { name: 'Terrain', slug: 'terrain', level: 3, emoji: '⛰️', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole', level: 3, emoji: '🌾', children: [] },
          { name: 'Immeuble', slug: 'immeuble', level: 3, emoji: '🏢', children: [] },
          { name: 'Bungalow', slug: 'bungalow', level: 3, emoji: '🏝️', children: [] },
          { name: 'Hangar - Usine', slug: 'hangar-usine', level: 3, emoji: '🏭', children: [] },
          { name: 'Autre', slug: 'autre-vente', level: 3, emoji: '🏠', children: [] }
        ]
      },
      {
        name: 'Location',
        slug: 'location',
        level: 2,
        emoji: '🔑',
        order: 2,
        children: [
          { name: 'Appartement', slug: 'appartement-location', level: 3, emoji: '🏢', children: [] },
          { name: 'Local', slug: 'local-location', level: 3, emoji: '🏪', children: [] },
          { name: 'Villa', slug: 'villa-location', level: 3, emoji: '🏡', children: [] },
          { name: 'Immeuble', slug: 'immeuble-location', level: 3, emoji: '🏢', children: [] },
          { name: 'Bungalow', slug: 'bungalow-location', level: 3, emoji: '🏝️', children: [] },
          { name: 'Autre', slug: 'autre-location', level: 3, emoji: '🏠', children: [] }
        ]
      },
      {
        name: 'Location vacances',
        slug: 'location-vacances',
        level: 2,
        emoji: '🏖️',
        order: 3,
        children: [
          { name: 'Appartement', slug: 'appartement-vacances', level: 3, emoji: '🏢', children: [] },
          { name: 'Villa', slug: 'villa-vacances', level: 3, emoji: '🏡', children: [] },
          { name: 'Bungalow', slug: 'bungalow-vacances', level: 3, emoji: '🏝️', children: [] },
          { name: 'Autre', slug: 'autre-vacances', level: 3, emoji: '🏠', children: [] }
        ]
      },
      {
        name: 'Cherche location',
        slug: 'cherche-location',
        level: 2,
        emoji: '🔍',
        order: 4,
        children: [
          { name: 'Appartement', slug: 'appartement-cherche-location', level: 3, emoji: '🏢', children: [] },
          { name: 'Local', slug: 'local-cherche-location', level: 3, emoji: '🏪', children: [] },
          { name: 'Villa', slug: 'villa-cherche-location', level: 3, emoji: '🏡', children: [] },
          { name: 'Immeuble', slug: 'immeuble-cherche-location', level: 3, emoji: '🏢', children: [] },
          { name: 'Bungalow', slug: 'bungalow-cherche-location', level: 3, emoji: '🏝️', children: [] },
          { name: 'Autre', slug: 'autre-cherche-location', level: 3, emoji: '🏠', children: [] }
        ]
      },
      {
        name: 'Cherche achat',
        slug: 'cherche-achat',
        level: 2,
        emoji: '🔍💰',
        order: 5,
        children: [
          { name: 'Appartement', slug: 'appartement-cherche-achat', level: 3, emoji: '🏢', children: [] },
          { name: 'Local', slug: 'local-cherche-achat', level: 3, emoji: '🏪', children: [] },
          { name: 'Villa', slug: 'villa-cherche-achat', level: 3, emoji: '🏡', children: [] },
          { name: 'Terrain', slug: 'terrain-cherche-achat', level: 3, emoji: '⛰️', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole-cherche-achat', level: 3, emoji: '🌾', children: [] },
          { name: 'Immeuble', slug: 'immeuble-cherche-achat', level: 3, emoji: '🏢', children: [] },
          { name: 'Bungalow', slug: 'bungalow-cherche-achat', level: 3, emoji: '🏝️', children: [] },
          { name: 'Hangar - Usine', slug: 'hangar-usine-cherche-achat', level: 3, emoji: '🏭', children: [] },
          { name: 'Autre', slug: 'autre-cherche-achat', level: 3, emoji: '🏠', children: [] }
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
    order: 15,
    children: [
      { name: 'Produits laitiers', slug: 'produits-laitiers', level: 2, emoji: '🥛', order: 1, children: [] },
      { name: 'Fruits secs', slug: 'fruits-secs', level: 2, emoji: '🍇', order: 2, children: [] },
      { name: 'Graines - Riz - Céréales', slug: 'graines-riz-cereales', level: 2, emoji: '🌾', order: 3, children: [] },
      { name: 'Sucres & Produits sucrés', slug: 'sucres-produits-sucres', level: 2, emoji: '🍬', order: 4, children: [] },
      { name: 'Boissons', slug: 'boissons', level: 2, emoji: '🥤', order: 5, children: [] },
      { name: 'Viandes & Poissons', slug: 'viandes-poissons', level: 2, emoji: '🍖', order: 6, children: [] },
      { name: 'Café - Thé - Infusion', slug: 'cafe-the-infusion', level: 2, emoji: '☕', order: 7, children: [] },
      { name: 'Compléments alimentaires', slug: 'complements-alimentaires', level: 2, emoji: '💊', order: 8, children: [] },
      { name: 'Miel & Dérivés', slug: 'miel-derives', level: 2, emoji: '🍯', order: 9, children: [] },
      { name: 'Fruits & Légumes', slug: 'fruits-legumes', level: 2, emoji: '🥦', order: 10, children: [] },
      { name: 'Blé & Farine', slug: 'ble-farine', level: 2, emoji: '🌾', order: 11, children: [] },
      { name: 'Bonbons & Chocolat', slug: 'bonbons-chocolat', level: 2, emoji: '🍫', order: 12, children: [] },
      { name: 'Boulangerie & Viennoiserie', slug: 'boulangerie-viennoiserie', level: 2, emoji: '🥐', order: 13, children: [] },
      { name: 'Ingrédients cuisine et pâtisserie', slug: 'ingredients-cuisine-patisserie', level: 2, emoji: '🧂', order: 14, children: [] },
      { name: 'Noix & Graines', slug: 'noix-graines', level: 2, emoji: '🥜', order: 15, children: [] },
      { name: 'Plats cuisinés', slug: 'plats-cuisines', level: 2, emoji: '🍲', order: 16, children: [] },
      { name: 'Sauces - Epices - Condiments', slug: 'sauces-epices-condiments', level: 2, emoji: '🌶️', order: 17, children: [] },
      { name: 'Œufs', slug: 'oeufs', level: 2, emoji: '🥚', order: 18, children: [] },
      { name: 'Huiles', slug: 'huiles', level: 2, emoji: '🫒', order: 19, children: [] },
      { name: 'Pâtes', slug: 'pates', level: 2, emoji: '🍝', order: 20, children: [] },
      { name: 'Gateaux', slug: 'gateaux', level: 2, emoji: '🎂', order: 21, children: [] },
      { name: 'Emballage', slug: 'emballage', level: 2, emoji: '📦', order: 22, children: [] },
      { name: 'Aliments pour bébé', slug: 'aliments-bebe', level: 2, emoji: '👶', order: 23, children: [] },
      { name: 'Aliments diététiques', slug: 'aliments-dietetiques', level: 2, emoji: '🥗', order: 24, children: [] },
      { name: 'Autre Alimentaires', slug: 'autre-alimentaires', level: 2, emoji: '🍎', order: 25, children: [] }
    ]
  },

  // ==================== 6. EMPLOI ====================
  {
    name: 'Emploi',
    slug: 'emploi',
    level: 1,
    emoji: '💼',
    order: 13,
    children: [
      { name: 'Offres d\'emploi', slug: 'offres-emploi', level: 2, emoji: '📋', order: 1, children: [] },
      { name: 'Demandes d\'emploi', slug: 'demandes-emploi', level: 2, emoji: '✍️', order: 2, children: [] },
      { name: 'Autres services emploi', slug: 'autres-services-emploi', level: 2, emoji: '🤝', order: 3, children: [] }
    ]
  },

  // ==================== 7. INFORMATIQUE ====================
  {
    name: 'Informatique',
    slug: 'informatique',
    level: 1,
    emoji: '💻',
    order: 5,
    children: [
      {
        name: 'Ordinateurs portables',
        slug: 'ordinateurs-portables',
        level: 2,
        emoji: '💻',
        order: 1,
        children: [
          { name: 'Pc Portable', slug: 'pc-portable', level: 3, emoji: '💻', children: [] },
          { name: 'Macbooks', slug: 'macbooks', level: 3, emoji: '🍎', children: [] }
        ]
      },
      {
        name: 'Ordinateurs de bureau',
        slug: 'ordinateurs-bureau',
        level: 2,
        emoji: '🖥️',
        order: 2,
        children: [
          { name: 'Pc de bureau', slug: 'pc-bureau', level: 3, emoji: '🖥️', children: [] },
          { name: 'Unités centrales', slug: 'unites-centrales', level: 3, emoji: '🖥️', children: [] },
          { name: 'All In One', slug: 'all-in-one', level: 3, emoji: '🖥️', children: [] }
        ]
      },
      {
        name: 'Composants PC fixe',
        slug: 'composants-pc-fixe',
        level: 2,
        emoji: '⚙️',
        order: 3,
        children: [
          { name: 'Cartes mère', slug: 'cartes-mere', level: 3, emoji: '🔌', children: [] },
          { name: 'Processeurs', slug: 'processeurs', level: 3, emoji: '⚡', children: [] },
          { name: 'RAM', slug: 'ram', level: 3, emoji: '💾', children: [] },
          { name: 'Disques dur', slug: 'disques-dur', level: 3, emoji: '💿', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique', level: 3, emoji: '🎮', children: [] },
          { name: 'Alimentations & Boitiers', slug: 'alimentations-boitiers', level: 3, emoji: '🔋', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement', level: 3, emoji: '❄️', children: [] },
          { name: 'Lecteurs & Graveurs CD', slug: 'lecteurs-graveurs-cd', level: 3, emoji: '📀', children: [] },
          { name: 'Autres', slug: 'autres-composants-fixe', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Composants PC portable',
        slug: 'composants-pc-portable',
        level: 2,
        emoji: '🔧',
        order: 4,
        children: [
          { name: 'Chargeurs', slug: 'chargeurs', level: 3, emoji: '🔌', children: [] },
          { name: 'Batteries', slug: 'batteries', level: 3, emoji: '🔋', children: [] },
          { name: 'Ecrans', slug: 'ecrans-portable', level: 3, emoji: '🖥️', children: [] },
          { name: 'Claviers & Touchpads', slug: 'claviers-touchpads', level: 3, emoji: '⌨️', children: [] },
          { name: 'Disques Dur', slug: 'disques-dur-portable', level: 3, emoji: '💿', children: [] },
          { name: 'RAM', slug: 'ram-portable', level: 3, emoji: '💾', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement-portable', level: 3, emoji: '❄️', children: [] },
          { name: 'Cartes mère', slug: 'cartes-mere-portable', level: 3, emoji: '🔌', children: [] },
          { name: 'Processeurs', slug: 'processeurs-portable', level: 3, emoji: '⚡', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique-portable', level: 3, emoji: '🎮', children: [] },
          { name: 'Lecteurs & Graveurs', slug: 'lecteurs-graveurs-portable', level: 3, emoji: '📀', children: [] },
          { name: 'Baffles & Webcams', slug: 'baffles-webcams', level: 3, emoji: '🎤', children: [] },
          { name: 'Autres', slug: 'autres-composants-portable', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Composants serveur',
        slug: 'composants-serveur',
        level: 2,
        emoji: '🖧',
        order: 5,
        children: [
          { name: 'Cartes mère', slug: 'cartes-mere-serveur', level: 3, emoji: '🔌', children: [] },
          { name: 'Processeurs', slug: 'processeurs-serveur', level: 3, emoji: '⚡', children: [] },
          { name: 'RAM', slug: 'ram-serveur', level: 3, emoji: '💾', children: [] },
          { name: 'Disques dur', slug: 'disques-dur-serveur', level: 3, emoji: '💿', children: [] },
          { name: 'Cartes réseau', slug: 'cartes-reseau-serveur', level: 3, emoji: '📶', children: [] },
          { name: 'Alimentations', slug: 'alimentations-serveur', level: 3, emoji: '🔋', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement-serveur', level: 3, emoji: '❄️', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique-serveur', level: 3, emoji: '🎮', children: [] },
          { name: 'Autres', slug: 'autres-composants-serveur', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Imprimantes & Cartouches',
        slug: 'imprimantes-cartouches',
        level: 2,
        emoji: '🖨️',
        order: 6,
        children: [
          { name: 'Imprimantes jet d\'encre', slug: 'imprimantes-jet-encre', level: 3, emoji: '🖨️', children: [] },
          { name: 'Imprimantes Laser', slug: 'imprimantes-laser', level: 3, emoji: '🖨️', children: [] },
          { name: 'Imprimantes matricielles', slug: 'imprimantes-matricielles', level: 3, emoji: '🖨️', children: [] },
          { name: 'Codes à barre & Etiqueteuses', slug: 'codes-barre-etiqueteuses', level: 3, emoji: '🏷️', children: [] },
          { name: 'Imprimantes photo & badges', slug: 'imprimantes-photo-badges', level: 3, emoji: '🖼️', children: [] },
          { name: 'Photocopieuses professionnelles', slug: 'photocopieuses-professionnelles', level: 3, emoji: '📠', children: [] },
          { name: 'Imprimantes 3D', slug: 'imprimantes-3d', level: 3, emoji: '🖨️', children: [] },
          { name: 'Cartouches & Toners', slug: 'cartouches-toners', level: 3, emoji: '🎨', children: [] },
          { name: 'Autre', slug: 'autre-imprimantes', level: 3, emoji: '🖨️', children: [] }
        ]
      },
      {
        name: 'Réseau & Connexion',
        slug: 'reseau-connexion',
        level: 2,
        emoji: '📶',
        order: 7,
        children: [
          { name: 'Modems & Routeurs', slug: 'modems-routeurs', level: 3, emoji: '📡', children: [] },
          { name: 'Switchs', slug: 'switchs', level: 3, emoji: '🔀', children: [] },
          { name: 'Point d\'accès wifi', slug: 'point-acces-wifi', level: 3, emoji: '📶', children: [] },
          { name: 'Répéteur Wi-Fi', slug: 'repeater-wifi', level: 3, emoji: '📶', children: [] },
          { name: 'Cartes réseau', slug: 'cartes-reseau', level: 3, emoji: '📡', children: [] },
          { name: 'Autre', slug: 'autre-reseau', level: 3, emoji: '📶', children: [] }
        ]
      },
      {
        name: 'Stockage externe & Racks',
        slug: 'stockage-externe-racks',
        level: 2,
        emoji: '💾',
        order: 8,
        children: [
          { name: 'Disques durs', slug: 'disques-durs', level: 3, emoji: '💿', children: [] },
          { name: 'Flash disque', slug: 'flash-disque', level: 3, emoji: '💾', children: [] },
          { name: 'Carte mémoire', slug: 'carte-memoire', level: 3, emoji: '📋', children: [] },
          { name: 'Rack', slug: 'rack', level: 3, emoji: '🗄️', children: [] }
        ]
      },
      { name: 'Serveurs', slug: 'serveurs', level: 2, emoji: '🖧', order: 9, children: [] },
      { name: 'Ecrans', slug: 'ecrans', level: 2, emoji: '🖥️', order: 10, children: [] },
      { name: 'Onduleurs & Stabilisateurs', slug: 'onduleurs-stabilisateurs', level: 2, emoji: '⚡', order: 11, children: [] },
      { name: 'Compteuses de billets', slug: 'compteuses-billets', level: 2, emoji: '💰', order: 12, children: [] },
      { name: 'Claviers & Souris', slug: 'claviers-souris', level: 2, emoji: '⌨️', order: 13, children: [] },
      { name: 'Casques & Son', slug: 'casques-son', level: 2, emoji: '🎧', order: 14, children: [] },
      { name: 'Webcam & Vidéoconférence', slug: 'webcam-videoconference', level: 2, emoji: '📹', order: 15, children: [] },
      { name: 'Data shows', slug: 'data-shows', level: 2, emoji: '📽️', order: 16, children: [] },
      { name: 'Câbles & Adaptateurs', slug: 'cables-adaptateurs', level: 2, emoji: '🔌', order: 17, children: [] },
      { name: 'Stylets & Tablettes', slug: 'stylers-tablettes', level: 2, emoji: '✏️', order: 18, children: [] },
      { name: 'Cartables & Sacoches', slug: 'cartables-sacoches', level: 2, emoji: '🎒', order: 19, children: [] },
      { name: 'Manettes & Simulateurs', slug: 'manettes-simulateurs', level: 2, emoji: '🎮', order: 20, children: [] },
      { name: 'VR', slug: 'vr', level: 2, emoji: '🥽', order: 21, children: [] },
      { name: 'Logiciels & Abonnements', slug: 'logiciels-abonnements', level: 2, emoji: '📀', order: 22, children: [] },
      { name: 'Bureautique', slug: 'bureautique', level: 2, emoji: '📎', order: 23, children: [] },
      { name: 'Autre Informatique', slug: 'autre-informatique', level: 2, emoji: '💡', order: 24, children: [] }
    ]
  },

  // ==================== 8. LOISIRS ====================
  {
    name: 'Loisirs & Divertissements',
    slug: 'loisirs',
    level: 1,
    emoji: '🎪',
    order: 11,
    children: [
      {
        name: 'Animalerie',
        slug: 'animalerie',
        level: 2,
        emoji: '🐾',
        order: 1,
        children: [
          { name: 'Produits de soin animal', slug: 'produits-soin-animal', level: 3, emoji: '💊', children: [] },
          { name: 'Chien', slug: 'chien', level: 3, emoji: '🐕', children: [] },
          { name: 'Oiseau', slug: 'oiseau', level: 3, emoji: '🐦', children: [] },
          { name: 'Animaux de ferme', slug: 'animaux-ferme', level: 3, emoji: '🐄', children: [] },
          { name: 'Chat', slug: 'chat', level: 3, emoji: '🐈', children: [] },
          { name: 'Cheval', slug: 'cheval', level: 3, emoji: '🐎', children: [] },
          { name: 'Poisson', slug: 'poisson', level: 3, emoji: '🐟', children: [] },
          { name: 'Accessoire pour animaux', slug: 'accessoire-animaux', level: 3, emoji: '🛁', children: [] },
          { name: 'Nourriture pour animaux', slug: 'nourriture-animaux', level: 3, emoji: '🍖', children: [] },
          { name: 'Autres Animaux', slug: 'autres-animaux', level: 3, emoji: '🐾', children: [] }
        ]
      },
      {
        name: 'Consoles et Jeux Vidéos',
        slug: 'consoles-jeux-videos',
        level: 2,
        emoji: '🎮',
        order: 2,
        children: [
          { name: 'Consoles', slug: 'consoles', level: 3, emoji: '🕹️', children: [] },
          { name: 'Jeux videos', slug: 'jeux-videos', level: 3, emoji: '🎮', children: [] },
          { name: 'Accessoires', slug: 'accessoires-consoles', level: 3, emoji: '🎧', children: [] }
        ]
      },
      {
        name: 'Livres & Magazines',
        slug: 'livres-magazines',
        level: 2,
        emoji: '📚',
        order: 3,
        children: [
          { name: 'Littérature et philosophie', slug: 'litterature-philosophie', level: 3, emoji: '📖', children: [] },
          { name: 'Romans', slug: 'romans', level: 3, emoji: '📚', children: [] },
          { name: 'Scolaire & Parascolaire', slug: 'scolaire-parascolaire', level: 3, emoji: '🎒', children: [] },
          { name: 'Sciences, techniques et medecine', slug: 'sciences-techniques-medecine', level: 3, emoji: '🔬', children: [] },
          { name: 'Traduction', slug: 'traduction', level: 3, emoji: '🌐', children: [] },
          { name: 'Religion et Spiritualités', slug: 'religion-spiritualites', level: 3, emoji: '🙏', children: [] },
          { name: 'Historique', slug: 'historique', level: 3, emoji: '🏛️', children: [] },
          { name: 'Cuisine', slug: 'cuisine-livres', level: 3, emoji: '🍳', children: [] },
          { name: 'Essais et documents', slug: 'essais-documents', level: 3, emoji: '📄', children: [] },
          { name: 'Fiction', slug: 'fiction', level: 3, emoji: '📚', children: [] },
          { name: 'Enfants', slug: 'enfants-livres', level: 3, emoji: '👶', children: [] },
          { name: 'Mangas et bande dessinée', slug: 'mangas-bande-dessinee', level: 3, emoji: '🇯🇵', children: [] }
        ]
      },
      {
        name: 'Instruments de Musique',
        slug: 'instruments-musique',
        level: 2,
        emoji: '🎵',
        order: 4,
        children: [
          { name: 'Instruments électriques', slug: 'instruments-electriques', level: 3, emoji: '🎸', children: [] },
          { name: 'Instruments à percussion', slug: 'instruments-percussion', level: 3, emoji: '🥁', children: [] },
          { name: 'Instruments a vent', slug: 'instruments-vent', level: 3, emoji: '🎺', children: [] },
          { name: 'Instruments à cordes', slug: 'instruments-cordes', level: 3, emoji: '🎻', children: [] },
          { name: 'Autre', slug: 'autre-instruments', level: 3, emoji: '🎵', children: [] }
        ]
      },
      {
        name: 'Jouets',
        slug: 'jouets',
        level: 2,
        emoji: '🧸',
        order: 5,
        children: [
          { name: 'Jeux d\'éveil', slug: 'jeux-eveil', level: 3, emoji: '🧠', children: [] },
          { name: 'Poupées - Peluches', slug: 'poupees-peluches', level: 3, emoji: '🧸', children: [] },
          { name: 'Personnages - Déguisements', slug: 'personnages-deguisements', level: 3, emoji: '🦸', children: [] },
          { name: 'Jeux éducatifs - Puzzle', slug: 'jeux-educatifs-puzzle', level: 3, emoji: '🧩', children: [] },
          { name: 'Véhicules et Circuits', slug: 'vehicules-circuits', level: 3, emoji: '🚗', children: [] },
          { name: 'Jeux électroniques', slug: 'jeux-electroniques', level: 3, emoji: '🕹️', children: [] },
          { name: 'Construction et Outils', slug: 'construction-outils', level: 3, emoji: '🧱', children: [] },
          { name: 'Jeux de plein air', slug: 'jeux-plein-air', level: 3, emoji: '⚽', children: [] },
          { name: 'Animaux', slug: 'animaux-jouets', level: 3, emoji: '🐻', children: [] }
        ]
      },
      {
        name: 'Chasse & Pêche',
        slug: 'chasse-peche',
        level: 2,
        emoji: '🎣',
        order: 6,
        children: [
          { name: 'Canne à pêche', slug: 'canne-peche', level: 3, emoji: '🎣', children: [] },
          { name: 'Moulinets', slug: 'moulinets', level: 3, emoji: '🎣', children: [] },
          { name: 'Sondeurs-GPS', slug: 'sondeurs-gps', level: 3, emoji: '📡', children: [] },
          { name: 'Vêtements', slug: 'vetements-chasse-peche', level: 3, emoji: '🧥', children: [] },
          { name: 'Accessoires de pêche', slug: 'accessoires-peche', level: 3, emoji: '🎒', children: [] },
          { name: 'Matériel plongée', slug: 'materiel-plongee', level: 3, emoji: '🤿', children: [] },
          { name: 'Equipements de chasse', slug: 'equipements-chasse', level: 3, emoji: '🔫', children: [] }
        ]
      },
      {
        name: 'Jardinage',
        slug: 'jardinage',
        level: 2,
        emoji: '🌱',
        order: 7,
        children: [
          { name: 'Mobilier de jardin', slug: 'mobilier-jardin', level: 3, emoji: '🪑', children: [] },
          { name: 'Semence', slug: 'semence', level: 3, emoji: '🌱', children: [] },
          { name: 'Outillage-Arrosage du jardin', slug: 'outillage-arrosage', level: 3, emoji: '🚿', children: [] },
          { name: 'Plantes et fleurs', slug: 'plantes-fleurs', level: 3, emoji: '🌺', children: [] },
          { name: 'Équipements Et Matériels', slug: 'equipements-materiels-jardin', level: 3, emoji: '🛠️', children: [] },
          { name: 'Insecticide', slug: 'insecticide', level: 3, emoji: '🐛', children: [] },
          { name: 'Décoration', slug: 'decoration-jardin', level: 3, emoji: '🎍', children: [] },
          { name: 'Livres D\'Agriculture Et De Jardinage', slug: 'livres-agriculture-jardin', level: 3, emoji: '📚', children: [] }
        ]
      },
      {
        name: 'Les Jeux de loisirs',
        slug: 'jeux-loisirs',
        level: 2,
        emoji: '♟️',
        order: 8,
        children: [
          { name: 'Babyfoot', slug: 'babyfoot', level: 3, emoji: '⚽', children: [] },
          { name: 'Billiard', slug: 'billiard', level: 3, emoji: '🎱', children: [] },
          { name: 'Ping pong', slug: 'ping-pong', level: 3, emoji: '🏓', children: [] },
          { name: 'Échecs', slug: 'echecs', level: 3, emoji: '♟️', children: [] },
          { name: 'Jeux De Société', slug: 'jeux-societe', level: 3, emoji: '🎲', children: [] },
          { name: 'Autres Jeux De Loisirs', slug: 'autres-jeux-loisirs', level: 3, emoji: '🎯', children: [] }
        ]
      },
      {
        name: 'Barbecue & Grillades',
        slug: 'barbecue-grillades',
        level: 2,
        emoji: '🍖',
        order: 9,
        children: [
          { name: 'Barbecue', slug: 'barbecue', level: 3, emoji: '🔥', children: [] },
          { name: 'Charbon', slug: 'charbon', level: 3, emoji: '⚫', children: [] },
          { name: 'Accessoires', slug: 'accessoires-barbecue', level: 3, emoji: '🍴', children: [] }
        ]
      },
      {
        name: 'Vapes & Chichas',
        slug: 'vapes-chichas',
        level: 2,
        emoji: '💨',
        order: 10,
        children: [
          { name: 'Vapes & Cigarettes électroniques', slug: 'vapes-cigarettes-electroniques', level: 3, emoji: '🚬', children: [] },
          { name: 'Chichas', slug: 'chichas', level: 3, emoji: '💨', children: [] },
          { name: 'Consommables', slug: 'consommables', level: 3, emoji: '🫙', children: [] },
          { name: 'Accessoires', slug: 'accessoires-chichas', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Produits & Accessoires d\'été',
        slug: 'produits-accessoires-ete',
        level: 2,
        emoji: '🏖️',
        order: 11,
        children: [
          { name: 'Piscines', slug: 'piscines', level: 3, emoji: '🏊', children: [] },
          { name: 'Matelas gonflables', slug: 'matelas-gonflables', level: 3, emoji: '🛏️', children: [] },
          { name: 'Parasols', slug: 'parasols', level: 3, emoji: '⛱️', children: [] },
          { name: 'Transats & Chaises pliables', slug: 'transats-chaises-pliables', level: 3, emoji: '🪑', children: [] },
          { name: 'Tables', slug: 'tables-ete', level: 3, emoji: '🪑', children: [] },
          { name: 'Autres', slug: 'autres-ete', level: 3, emoji: '☀️', children: [] }
        ]
      },
      { name: 'Antiquités & Collections', slug: 'antiquites-collections', level: 2, emoji: '🏺', order: 12, children: [] },
      { name: 'Autre', slug: 'autre-loisirs', level: 2, emoji: '🎪', order: 13, children: [] }
    ]
  },

  // ==================== 9. MATERIAUX ====================
  {
    name: 'Matériaux & Équipement',
    slug: 'materiaux',
    level: 1,
    emoji: '🧱',
    order: 14,
    children: [
      {
        name: 'Matériel professionnel',
        slug: 'materiel-professionnel',
        level: 2,
        emoji: '🏭',
        order: 1,
        children: [
          { name: 'Industrie & Fabrication', slug: 'industrie-fabrication', level: 3, emoji: '🏭', children: [] },
          { name: 'Alimentaire et Restauration', slug: 'alimentaire-restauration', level: 3, emoji: '🍽️', children: [] },
          { name: 'Medical', slug: 'medical', level: 3, emoji: '🏥', children: [] },
          { name: 'Batiment & Construction', slug: 'batiment-construction', level: 3, emoji: '🏗️', children: [] },
          { name: 'Matériel électrique', slug: 'materiel-electrique', level: 3, emoji: '⚡', children: [] },
          { name: 'Ateliers', slug: 'ateliers', level: 3, emoji: '🔧', children: [] },
          { name: 'Stockage et magasinage', slug: 'stockage-magasinage', level: 3, emoji: '📦', children: [] },
          { name: 'Équipement de protection', slug: 'equipement-protection', level: 3, emoji: '🛡️', children: [] },
          { name: 'Agriculture', slug: 'agriculture', level: 3, emoji: '🌾', children: [] },
          { name: 'Réparation & Diagnostic', slug: 'reparation-diagnostic', level: 3, emoji: '🔍', children: [] },
          { name: 'Commerce de détail', slug: 'commerce-detail', level: 3, emoji: '🏪', children: [] },
          { name: 'Coiffure et cosmétologie', slug: 'coiffure-cosmetologie', level: 3, emoji: '💇', children: [] },
          { name: 'Autres matériels pro', slug: 'autres-materiel-pro', level: 3, emoji: '🛠️', children: [] }
        ]
      },
      {
        name: 'Outillage professionnel',
        slug: 'outillage-professionnel',
        level: 2,
        emoji: '🛠️',
        order: 2,
        children: [
          { name: 'Perceuse', slug: 'perceuse', level: 3, emoji: '🔩', children: [] },
          { name: 'Meuleuse', slug: 'meuleuse', level: 3, emoji: '⚙️', children: [] },
          { name: 'Outillage à main', slug: 'outillage-main', level: 3, emoji: '🔨', children: [] },
          { name: 'Scie', slug: 'scie', level: 3, emoji: '🪚', children: [] },
          { name: 'Autres', slug: 'autres-outillage', level: 3, emoji: '🛠️', children: [] }
        ]
      },
      {
        name: 'Matériel Agricole',
        slug: 'materiel-agricole',
        level: 2,
        emoji: '🚜',
        order: 3,
        children: [
          { name: 'Equipement agricole', slug: 'equipement-agricole', level: 3, emoji: '🚜', children: [] },
          { name: 'Arbres', slug: 'arbres', level: 3, emoji: '🌳', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole-materiaux', level: 3, emoji: '🌾', children: [] },
          { name: 'Autre', slug: 'autre-agricole', level: 3, emoji: '🌱', children: [] }
        ]
      },
      { name: 'Materiaux de construction', slug: 'materiaux-construction', level: 2, emoji: '🧱', order: 4, children: [] },
      { name: 'Matières premières', slug: 'matieres-premieres', level: 2, emoji: '⚗️', order: 5, children: [] },
      { name: 'Produits d\'hygiène', slug: 'produits-hygiene', level: 2, emoji: '🧼', order: 6, children: [] },
      { name: 'Autre', slug: 'autre-materiaux', level: 2, emoji: '📦', order: 7, children: [] }
    ]
  },

  // ==================== 10. MEUBLES ====================
  {
    name: 'Meubles & Maison',
    slug: 'meubles',
    level: 1,
    emoji: '🛋️',
    order: 10,
    children: [
      { name: 'Salon', slug: 'salon', level: 2, emoji: '🛋️', order: 1, children: [] },
      { name: 'Chambres à coucher', slug: 'chambres-coucher', level: 2, emoji: '🛏️', order: 2, children: [] },
      { name: 'Tables', slug: 'tables', level: 2, emoji: '🪑', order: 3, children: [] },
      { name: 'Armoires & Commodes', slug: 'armoires-commodes', level: 2, emoji: '🗄️', order: 4, children: [] },
      { name: 'Lits', slug: 'lits', level: 2, emoji: '🛌', order: 5, children: [] },
      { name: 'Meubles de Cuisine', slug: 'meubles-cuisine', level: 2, emoji: '🍳', order: 6, children: [] },
      { name: 'Bibliothèques & Etagères', slug: 'bibliotheques-etageres', level: 2, emoji: '📚', order: 7, children: [] },
      { name: 'Chaises & Fauteuils', slug: 'chaises-fauteuils', level: 2, emoji: '🪑', order: 8, children: [] },
      { name: 'Dressings', slug: 'dressings', level: 2, emoji: '👔', order: 9, children: [] },
      { name: 'Meubles salle de bain', slug: 'meubles-salle-bain', level: 2, emoji: '🚿', order: 10, children: [] },
      { name: 'Buffet', slug: 'buffet', level: 2, emoji: '🍽️', order: 11, children: [] },
      { name: 'Tables TV', slug: 'tables-tv', level: 2, emoji: '📺', order: 12, children: [] },
      { name: 'Table pliante', slug: 'table-pliante', level: 2, emoji: '🪑', order: 13, children: [] },
      { name: 'Tables à manger', slug: 'tables-manger', level: 2, emoji: '🍽️', order: 14, children: [] },
      { name: 'Tables PC & Bureaux', slug: 'tables-pc-bureaux', level: 2, emoji: '💻', order: 15, children: [] },
      { name: 'Canapé', slug: 'canape', level: 2, emoji: '🛋️', order: 16, children: [] },
      { name: 'Table basse', slug: 'table-basse', level: 2, emoji: '🪑', order: 17, children: [] },
      { name: 'Rangement et Organisation', slug: 'rangement-organisation', level: 2, emoji: '📦', order: 18, children: [] },
      { name: 'Accessoires de cuisine', slug: 'accessoires-cuisine', level: 2, emoji: '🔪', order: 19, children: [] },
      { name: 'Meuble d\'entrée', slug: 'meuble-entree', level: 2, emoji: '🚪', order: 20, children: [] },
      {
        name: 'Décoration',
        slug: 'decoration',
        level: 2,
        emoji: '🎨',
        order: 21,
        children: [
          { name: 'Peinture et calligraphie', slug: 'peinture-calligraphie', level: 3, emoji: '🖼️', children: [] },
          { name: 'Décoration de cuisine', slug: 'decoration-cuisine', level: 3, emoji: '🍳', children: [] },
          { name: 'Coussins & Housses', slug: 'coussins-housses', level: 3, emoji: '🛋️', children: [] },
          { name: 'Déco de Bain', slug: 'deco-bain', level: 3, emoji: '🚿', children: [] },
          { name: 'Art et Revêtement Mural', slug: 'art-revetement-mural', level: 3, emoji: '🎨', children: [] },
          { name: 'Figurines et miniatures', slug: 'figurines-miniatures', level: 3, emoji: '🗿', children: [] },
          { name: 'Cadres', slug: 'cadres', level: 3, emoji: '🖼️', children: [] },
          { name: 'Horloges', slug: 'horloges', level: 3, emoji: '⏰', children: [] },
          { name: 'Autres décoration', slug: 'autres-decoration', level: 3, emoji: '✨', children: [] }
        ]
      },
      {
        name: 'Vaisselle',
        slug: 'vaisselle',
        level: 2,
        emoji: '🍽️',
        order: 22,
        children: [
          { name: 'Pôeles, Casseroles et Marmites', slug: 'poeles-casseroles-marmites', level: 3, emoji: '🍳', children: [] },
          { name: 'Cocottes', slug: 'cocottes', level: 3, emoji: '🥘', children: [] },
          { name: 'Plats à four et Plateaux', slug: 'plats-four-plateaux', level: 3, emoji: '🍲', children: [] },
          { name: 'Assiettes et Bols', slug: 'assiettes-bols', level: 3, emoji: '🍽️', children: [] },
          { name: 'Couverts et ustensiles de cuisine', slug: 'couverts-ustensiles', level: 3, emoji: '🔪', children: [] },
          { name: 'Services à Boissons', slug: 'services-boissons', level: 3, emoji: '☕', children: [] },
          { name: 'Boites et bocaux', slug: 'boites-bocaux', level: 3, emoji: '🥫', children: [] },
          { name: 'Accessoires de pâtisserie', slug: 'accessoires-patisserie', level: 3, emoji: '🎂', children: [] },
          { name: 'Vaisselles Artisanales', slug: 'vaisselles-artisanales', level: 3, emoji: '🧱', children: [] },
          { name: 'Gadget de cuisine', slug: 'gadget-cuisine', level: 3, emoji: '⚙️', children: [] },
          { name: 'Vaisselle enfants', slug: 'vaisselle-enfants', level: 3, emoji: '👶', children: [] }
        ]
      },
      {
        name: 'Meubles de bureau',
        slug: 'meubles-bureau',
        level: 2,
        emoji: '💼',
        order: 23,
        children: [
          { name: 'Bureaux & Caissons', slug: 'bureaux-caissons', level: 3, emoji: '💼', children: [] },
          { name: 'Chaises', slug: 'chaises-bureau', level: 3, emoji: '🪑', children: [] },
          { name: 'Armoires & Rangements', slug: 'armoires-rangements-bureau', level: 3, emoji: '🗄️', children: [] },
          { name: 'Accessoires de bureaux', slug: 'accessoires-bureaux', level: 3, emoji: '📎', children: [] },
          { name: 'Tables de réunion', slug: 'tables-reunion', level: 3, emoji: '🤝', children: [] }
        ]
      },
      {
        name: 'Puériculture',
        slug: 'puericulture',
        level: 2,
        emoji: '👶',
        order: 24,
        children: [
          { name: 'Poussette', slug: 'poussette', level: 3, emoji: '👶', children: [] },
          { name: 'Siège Auto', slug: 'siege-auto', level: 3, emoji: '🚗', children: [] },
          { name: 'Meubles bébé', slug: 'meubles-bebe', level: 3, emoji: '🛏️', children: [] },
          { name: 'Lit bébé', slug: 'lit-bebe', level: 3, emoji: '🛌', children: [] },
          { name: 'Chaise bébé', slug: 'chaise-bebe', level: 3, emoji: '🪑', children: [] },
          { name: 'Autres', slug: 'autres-puericulture', level: 3, emoji: '👶', children: [] }
        ]
      },
      {
        name: 'Luminaire',
        slug: 'luminaire',
        level: 2,
        emoji: '💡',
        order: 25,
        children: [
          { name: 'Lustre', slug: 'lustre', level: 3, emoji: '💎', children: [] },
          { name: 'Lampadaire', slug: 'lampadaire', level: 3, emoji: '🛋️', children: [] },
          { name: 'Éclairage extérieur', slug: 'eclairage-exterieur', level: 3, emoji: '🌙', children: [] },
          { name: 'Autres', slug: 'autres-luminaire', level: 3, emoji: '💡', children: [] }
        ]
      },
      { name: 'Rideaux', slug: 'rideaux', level: 2, emoji: '🪟', order: 26, children: [] },
      { name: 'Literie & Linge', slug: 'literie-linge', level: 2, emoji: '🛌', order: 27, children: [] },
      { name: 'Tapis & Moquettes', slug: 'tapis-moquettes', level: 2, emoji: '🧶', order: 28, children: [] },
      { name: 'Meubles d\'extérieur', slug: 'meubles-exterieur', level: 2, emoji: '🌳', order: 29, children: [] },
      { name: 'Fournitures et articles scolaires', slug: 'fournitures-scolaires', level: 2, emoji: '📚', order: 30, children: [] },
      { name: 'Autre', slug: 'autre-meubles', level: 2, emoji: '🛋️', order: 31, children: [] }
    ]
  },

  // ==================== 11. PIECES DETACHEES ====================
  {
    name: 'Pieces Detachees',
    slug: 'pieces-detachees',
    level: 1,
    emoji: '🔩',
    order: 6,
    children: [
      {
        name: 'Pièces automobiles',
        slug: 'pieces-automobiles',
        level: 2,
        emoji: '🚗',
        order: 1,
        children: [
          { name: 'Moteur & Transmission', slug: 'moteur-transmission', level: 3, emoji: '⚙️', children: [] },
          { name: 'Suspension & Direction', slug: 'suspension-direction', level: 3, emoji: '🔄', children: [] },
          { name: 'Pièces intérieur', slug: 'pieces-interieur', level: 3, emoji: '🚘', children: [] },
          { name: 'Carrosserie', slug: 'carrosserie', level: 3, emoji: '🚙', children: [] },
          { name: 'Optiques & Éclairage', slug: 'optiques-eclairage', level: 3, emoji: '💡', children: [] },
          { name: 'Vitres & pare-brise', slug: 'vitres-pare-brise', level: 3, emoji: '🚪', children: [] },
          { name: 'Pneus & Jantes', slug: 'pneus-jantes', level: 3, emoji: '🛞', children: [] },
          { name: 'Housses & Tapis', slug: 'housses-tapis', level: 3, emoji: '🎭', children: [] },
          { name: 'Batteries', slug: 'batteries-auto', level: 3, emoji: '🔋', children: [] },
          { name: 'Sono & Multimédia', slug: 'sono-multimedia', level: 3, emoji: '🎵', children: [] },
          { name: 'Sièges auto', slug: 'sieges-auto', level: 3, emoji: '💺', children: [] },
          { name: 'Autres pièces auto', slug: 'autres-pieces-auto', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Pièces moto',
        slug: 'pieces-moto',
        level: 2,
        emoji: '🏍️',
        order: 2,
        children: [
          { name: 'Casques & Protections', slug: 'casques-protections', level: 3, emoji: '🪖', children: [] },
          { name: 'Pneus & Jantes', slug: 'pneus-jantes-moto', level: 3, emoji: '🛞', children: [] },
          { name: 'Optiques & Éclairage', slug: 'optiques-eclairage-moto', level: 3, emoji: '💡', children: [] },
          { name: 'Accessoires', slug: 'accessoires-moto', level: 3, emoji: '🔧', children: [] },
          { name: 'Autres pièces moto', slug: 'autres-pieces-moto', level: 3, emoji: '🏍️', children: [] }
        ]
      },
      {
        name: 'Pièces bateaux',
        slug: 'pieces-bateaux',
        level: 2,
        emoji: '⛵',
        order: 3,
        children: [
          { name: 'Moteurs', slug: 'moteurs-bateau', level: 3, emoji: '⚙️', children: [] },
          { name: 'Pièces', slug: 'pieces-bateau', level: 3, emoji: '🔩', children: [] },
          { name: 'Accessoires', slug: 'accessoires-bateau', level: 3, emoji: '⚓', children: [] },
          { name: 'Autres pièces bateaux', slug: 'autres-pieces-bateaux', level: 3, emoji: '⛵', children: [] }
        ]
      },
      { name: 'Alarme & Sécurité', slug: 'alarme-securite', level: 2, emoji: '🔐', order: 4, children: [] },
      { name: 'Nettoyage & Entretien', slug: 'nettoyage-entretien', level: 2, emoji: '🧹', order: 5, children: [] },
      { name: 'Outils de diagnostics', slug: 'outils-diagnostics', level: 2, emoji: '🔧', order: 6, children: [] },
      { name: 'Lubrifiants', slug: 'lubrifiants', level: 2, emoji: '⚗️', order: 7, children: [] },
      { name: 'Pièces véhicules', slug: 'pieces-vehicules', level: 2, emoji: '🔌', order: 8, children: [] },
      { name: 'Autres pièces', slug: 'autres-pieces', level: 2, emoji: '🛠️', order: 9, children: [] }
    ]
  },

  // ==================== 12. SANTE & BEAUTE ====================
  {
    name: 'Santé & Beauté',
    slug: 'sante-beaute',
    level: 1,
    emoji: '💄',
    order: 9,
    children: [
      {
        name: 'Cosmétiques & Beauté',
        slug: 'cosmetiques-beaute',
        level: 2,
        emoji: '💄',
        order: 1,
        children: [
          { name: 'Soins du corps', slug: 'soins-corps', level: 3, emoji: '🧴', children: [] },
          { name: 'Savons & Gels douche', slug: 'savons-gels-douche', level: 3, emoji: '🧼', children: [] },
          { name: 'Soins visage', slug: 'soins-visage', level: 3, emoji: '🧖‍♀️', children: [] },
          { name: 'Maquillage', slug: 'maquillage', level: 3, emoji: '💋', children: [] },
          { name: 'Produits Solaires & Bronzage', slug: 'produits-solaires-bronzage', level: 3, emoji: '☀️', children: [] },
          { name: 'Instruments & Outils de beauté', slug: 'instruments-outils-beaute', level: 3, emoji: '✂️', children: [] },
          { name: 'Manucure et pedicure', slug: 'manucure-pedicure', level: 3, emoji: '💅', children: [] },
          { name: 'Rasage et Épilation', slug: 'rasage-epilation', level: 3, emoji: '🪒', children: [] },
          { name: 'Hygiène', slug: 'hygiene', level: 3, emoji: '🚿', children: [] },
          { name: 'Coiffure', slug: 'coiffure', level: 3, emoji: '💇', children: [] },
          { name: 'Soins bébé', slug: 'soins-bebe', level: 3, emoji: '👶', children: [] },
          { name: 'Autres produits', slug: 'autres-produits-beaute', level: 3, emoji: '💄', children: [] }
        ]
      },
      {
        name: 'Parapharmacie & Santé',
        slug: 'parapharmacie-sante',
        level: 2,
        emoji: '💊',
        order: 2,
        children: [
          { name: 'Dispositifs médicaux', slug: 'dispositifs-medicaux', level: 3, emoji: '🩺', children: [] },
          { name: 'Complément Alimentaire', slug: 'complement-alimentaire', level: 3, emoji: '🥗', children: [] },
          { name: 'Matériel Médical', slug: 'materiel-medical', level: 3, emoji: '🏥', children: [] },
          { name: 'Aliments Diététiques', slug: 'aliments-dietetiques-sante', level: 3, emoji: '🥦', children: [] }
        ]
      },
      { name: 'Parfums et déodorants femme', slug: 'parfums-deodorants-femme', level: 2, emoji: '🌸', order: 3, children: [] },
      { name: 'Parfums et déodorants homme', slug: 'parfums-deodorants-homme', level: 2, emoji: '🌲', order: 4, children: [] },
      { name: 'Accessoires beauté', slug: 'accessoires-beaute', level: 2, emoji: '🪞', order: 5, children: [] },
      { name: 'Soins cheveux', slug: 'soins-cheveux', level: 2, emoji: '💇', order: 6, children: [] },
      { name: 'Autre Santé & Beauté', slug: 'autre-sante-beaute', level: 2, emoji: '💡', order: 7, children: [] }
    ]
  },

  // ==================== 13. SERVICES ====================
  {
    name: 'Services',
    slug: 'services',
    level: 1,
    emoji: '🛠️',
    order: 16,
    children: [
      { name: 'Construction & Travaux', slug: 'construction-travaux', level: 2, emoji: '🏗️', order: 1, children: [] },
      { name: 'Ecoles & Formations', slug: 'ecoles-formations', level: 2, emoji: '🎓', order: 2, children: [] },
      { name: 'Industrie & Fabrication', slug: 'industrie-fabrication-services', level: 2, emoji: '🏭', order: 3, children: [] },
      { name: 'Transport et déménagement', slug: 'transport-demenagement', level: 2, emoji: '🚚', order: 4, children: [] },
      { name: 'Décoration & Aménagement', slug: 'decoration-amenagement', level: 2, emoji: '🎨', order: 5, children: [] },
      { name: 'Publicite & Communication', slug: 'publicite-communication', level: 2, emoji: '📢', order: 6, children: [] },
      { name: 'Nettoyage & Jardinage', slug: 'nettoyage-jardinage', level: 2, emoji: '🧹', order: 7, children: [] },
      { name: 'Froid & Climatisation', slug: 'froid-climatisation', level: 2, emoji: '❄️', order: 8, children: [] },
      { name: 'Traiteurs & Gateaux', slug: 'traiteurs-gateaux', level: 2, emoji: '🍰', order: 9, children: [] },
      { name: 'Médecine & Santé', slug: 'medecine-sante', level: 2, emoji: '🏥', order: 10, children: [] },
      { name: 'Réparation auto & Diagnostic', slug: 'reparation-auto-diagnostic', level: 2, emoji: '🔧', order: 11, children: [] },
      { name: 'Sécurité & Alarme', slug: 'securite-alarme', level: 2, emoji: '🚨', order: 12, children: [] },
      { name: 'Projets & Études', slug: 'projets-etudes', level: 2, emoji: '📊', order: 13, children: [] },
      { name: 'Bureautique & Internet', slug: 'bureautique-internet', level: 2, emoji: '💻', order: 14, children: [] },
      { name: 'Location de véhicules', slug: 'location-vehicules', level: 2, emoji: '🚗', order: 15, children: [] },
      { name: 'Menuiserie & Meubles', slug: 'menuiserie-meubles', level: 2, emoji: '🪚', order: 16, children: [] },
      { name: 'Impression & Edition', slug: 'impression-edition', level: 2, emoji: '🖨️', order: 17, children: [] },
      { name: 'Hôtellerie & Restauration & Salles', slug: 'hotellerie-restauration-salles', level: 2, emoji: '🍽️', order: 18, children: [] },
      { name: 'Esthétique & Beauté', slug: 'esthetique-beaute', level: 2, emoji: '💄', order: 19, children: [] },
      { name: 'Image & Son', slug: 'image-son', level: 2, emoji: '🎬', order: 20, children: [] },
      { name: 'Comptabilité & Economie', slug: 'comptabilite-economie', level: 2, emoji: '💰', order: 21, children: [] },
      { name: 'Couture & Confection', slug: 'couture-confection', level: 2, emoji: '🧵', order: 22, children: [] },
      { name: 'Maintenance informatique', slug: 'maintenance-informatique', level: 2, emoji: '💻', order: 23, children: [] },
      { name: 'Réparation Electromenager', slug: 'reparation-electromenager', level: 2, emoji: '🔌', order: 24, children: [] },
      { name: 'Evènements & Divertissement', slug: 'evenements-divertissement', level: 2, emoji: '🎪', order: 25, children: [] },
      { name: 'Paraboles & Démos', slug: 'paraboles-demos', level: 2, emoji: '📡', order: 26, children: [] },
      { name: 'Réparation Électronique', slug: 'reparation-electronique', level: 2, emoji: '🔌', order: 27, children: [] },
      { name: 'Services à l\'étranger', slug: 'services-etranger', level: 2, emoji: '🌍', order: 28, children: [] },
      { name: 'Flashage & Réparation des téléphones', slug: 'flashage-reparation-telephones', level: 2, emoji: '📱', order: 29, children: [] },
      { name: 'Flashage & Installation des jeux', slug: 'flashage-installation-jeux', level: 2, emoji: '🎮', order: 30, children: [] },
      { name: 'Juridique', slug: 'juridique', level: 2, emoji: '⚖️', order: 31, children: [] },
      { name: 'Autres Services', slug: 'autres-services', level: 2, emoji: '🛠️', order: 32, children: [] }
    ]
  },

  // ==================== 14. SPORT ====================
  {
    name: 'Sport',
    slug: 'sport',
    level: 1,
    emoji: '⚽',
    order: 12,
    children: [
      {
        name: 'Football',
        slug: 'football',
        level: 2,
        emoji: '⚽',
        order: 1,
        children: [
          { name: 'Ballons et Buts', slug: 'ballons-buts', level: 3, emoji: '⚽', children: [] },
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-foot', level: 3, emoji: '🛡️', children: [] },
          { name: 'Chaussures de Football', slug: 'chaussures-football', level: 3, emoji: '👟', children: [] },
          { name: 'Vêtements de football', slug: 'vetements-football', level: 3, emoji: '👕', children: [] }
        ]
      },
      {
        name: 'Hand/Voley/ Basket-Ball',
        slug: 'hand-voley-basket',
        level: 2,
        emoji: '🏀',
        order: 2,
        children: [
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-basket', level: 3, emoji: '🏀', children: [] },
          { name: 'Ballons Buts et Filets', slug: 'ballons-buts-filets', level: 3, emoji: '🏐', children: [] },
          { name: 'Chaussures', slug: 'chaussures-basket', level: 3, emoji: '👟', children: [] },
          { name: 'Vêtements', slug: 'vetements-basket', level: 3, emoji: '👕', children: [] }
        ]
      },
      {
        name: 'Sport de combat',
        slug: 'sport-combat',
        level: 2,
        emoji: '🥊',
        order: 3,
        children: [
          { name: 'Tenue', slug: 'tenue-combat', level: 3, emoji: '🥋', children: [] },
          { name: 'Gants et casques', slug: 'gants-casques', level: 3, emoji: '🥊', children: [] },
          { name: 'Autres accessoires', slug: 'autres-accessoires-combat', level: 3, emoji: '🧤', children: [] }
        ]
      },
      {
        name: 'Fitness - Musculation',
        slug: 'fitness-musculation',
        level: 2,
        emoji: '💪',
        order: 4,
        children: [
          { name: 'Bancs et presses de musculation', slug: 'bancs-presses', level: 3, emoji: '🏋️', children: [] },
          { name: 'Poids et haltères', slug: 'poids-halteres', level: 3, emoji: '🏋️‍♂️', children: [] },
          { name: 'Tapis roulants', slug: 'tapis-roulants', level: 3, emoji: '🏃', children: [] },
          { name: 'Vélos et rameurs', slug: 'velos-rameurs', level: 3, emoji: '🚴', children: [] },
          { name: 'Autres équipements', slug: 'autres-equipements-fitness', level: 3, emoji: '💪', children: [] }
        ]
      },
      {
        name: 'Natation',
        slug: 'natation',
        level: 2,
        emoji: '🏊',
        order: 5,
        children: [
          { name: 'Lunettes', slug: 'lunettes-natation', level: 3, emoji: '🥽', children: [] },
          { name: 'Bonnets', slug: 'bonnets', level: 3, emoji: '🧢', children: [] },
          { name: 'Palmes', slug: 'palmes', level: 3, emoji: '🐠', children: [] },
          { name: 'Planches et flotteurs', slug: 'planches-flotteurs', level: 3, emoji: '🛟', children: [] },
          { name: 'Maillots et combinaisons', slug: 'maillots-combinaisons', level: 3, emoji: '🩱', children: [] },
          { name: 'Autres accessoires', slug: 'autres-accessoires-natation', level: 3, emoji: '🏊', children: [] }
        ]
      },
      {
        name: 'Vélos et trotinettes',
        slug: 'velos-trotinettes',
        level: 2,
        emoji: '🚲',
        order: 6,
        children: [
          { name: 'Vêtements et chaussures', slug: 'vetements-chaussures-velo', level: 3, emoji: '👕', children: [] },
          { name: 'Vélos', slug: 'velos', level: 3, emoji: '🚲', children: [] },
          { name: 'Trotinettes', slug: 'trotinettes', level: 3, emoji: '🛴', children: [] },
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-velo', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'Sports de raquette',
        slug: 'sports-raquette',
        level: 2,
        emoji: '🎾',
        order: 7,
        children: [
          { name: 'Tennis', slug: 'tennis', level: 3, emoji: '🎾', children: [] },
          { name: 'Tennis de table', slug: 'tennis-table', level: 3, emoji: '🏓', children: [] },
          { name: 'Autre', slug: 'autre-raquette', level: 3, emoji: '🎯', children: [] }
        ]
      },
      { name: 'Sport aquatiques', slug: 'sport-aquatiques', level: 2, emoji: '🤿', order: 8, children: [] },
      { name: 'Équitation', slug: 'equitation', level: 2, emoji: '🐎', order: 9, children: [] },
      { name: 'Pétanque', slug: 'petanque', level: 2, emoji: '🎯', order: 10, children: [] },
      { name: 'Autres', slug: 'autres-sports', level: 2, emoji: '🏅', order: 11, children: [] }
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
      { name: 'Voyage organisé', slug: 'voyage-organise', level: 2, emoji: '✈️', order: 1, children: [] },
      { name: 'Location vacances', slug: 'location-vacances-voyages', level: 2, emoji: '🏠', order: 2, children: [] },
      { name: 'Hajj & Omra', slug: 'hajj-omra', level: 2, emoji: '🕋', order: 3, children: [] },
      { name: 'Réservations & Visa', slug: 'reservations-visa', level: 2, emoji: '🛂', order: 4, children: [] },
      { name: 'Séjour', slug: 'sejour', level: 2, emoji: '🏨', order: 5, children: [] },
      { name: 'Croisière', slug: 'croisiere', level: 2, emoji: '🚢', order: 6, children: [] },
      { name: 'Autre voyages', slug: 'autre-voyages', level: 2, emoji: '🧳', order: 7, children: [] }
    ]
  },

  // ==================== 16. BOUTIQUES ====================
  // ==================== 16. BOUTIQUES ====================
// ==================== 16. BOUTIQUES ====================
// En tu archivo seed, agrega boutiques como categoría nivel 1
// SOLO agregar esto, sin modificar estilos existentes

 
  {
    name: 'Boutiques',
    slug: 'boutiques',
    level: 1,
    emoji: '🏪',
    icon: '🏪',
    iconType: 'emoji',
    iconColor: '#8B5CF6',
    bgColor: '#EDE9FE',
    hasChildren: true,
    isLeaf: false,
    order: 0, // O el orden que quieras (puede ser 0 para que aparezca primero)
    children: [
      { 
        name: 'Boutique de Véhicules', 
        slug: 'boutique-vehicules', 
        level: 2, 
        emoji: '🚗',
        icon: '🚗',
        iconType: 'emoji',
        iconColor: '#3B82F6',
        bgColor: '#DBEAFE',
        hasChildren: false,
        isLeaf: true,
        order: 1 
      },
      { 
        name: 'Boutique de Vêtements', 
        slug: 'boutique-vetements', 
        level: 2, 
        emoji: '👕',
        icon: '👕',
        iconType: 'emoji',
        iconColor: '#EC4899',
        bgColor: '#FCE7F3',
        hasChildren: false,
        isLeaf: true,
        order: 2 
      },
      { 
        name: "Boutique d'Électroménager", 
        slug: 'boutique-electromenager', 
        level: 2, 
        emoji: '🔌',
        icon: '🔌',
        iconType: 'emoji',
        iconColor: '#F59E0B',
        bgColor: '#FEF3C7',
        hasChildren: false,
        isLeaf: true,
        order: 3 
      },
      { 
        name: "Boutique d'Immobilier", 
        slug: 'boutique-immobilier', 
        level: 2, 
        emoji: '🏠',
        icon: '🏠',
        iconType: 'emoji',
        iconColor: '#10B981',
        bgColor: '#D1FAE5',
        hasChildren: false,
        isLeaf: true,
        order: 4 
      },
      { 
        name: 'Boutique Alimentaire', 
        slug: 'boutique-alimentaire', 
        level: 2, 
        emoji: '🍎',
        icon: '🍎',
        iconType: 'emoji',
        iconColor: '#EF4444',
        bgColor: '#FEE2E2',
        hasChildren: false,
        isLeaf: true,
        order: 5 
      },
      { 
        name: "Boutique d'Emploi", 
        slug: 'boutique-emploi', 
        level: 2, 
        emoji: '💼',
        icon: '💼',
        iconType: 'emoji',
        iconColor: '#6B7280',
        bgColor: '#F3F4F6',
        hasChildren: false,
        isLeaf: true,
        order: 6 
      },
      { 
        name: "Boutique d'Informatique", 
        slug: 'boutique-informatique', 
        level: 2, 
        emoji: '💻',
        icon: '💻',
        iconType: 'emoji',
        iconColor: '#3B82F6',
        bgColor: '#DBEAFE',
        hasChildren: false,
        isLeaf: true,
        order: 7 
      },
      { 
        name: 'Boutique de Loisirs', 
        slug: 'boutique-loisirs', 
        level: 2, 
        emoji: '🎪',
        icon: '🎪',
        iconType: 'emoji',
        iconColor: '#8B5CF6',
        bgColor: '#EDE9FE',
        hasChildren: false,
        isLeaf: true,
        order: 8 
      },
      { 
        name: 'Boutique de Matériaux', 
        slug: 'boutique-materiaux', 
        level: 2, 
        emoji: '🧱',
        icon: '🧱',
        iconType: 'emoji',
        iconColor: '#92400E',
        bgColor: '#FEF3C7',
        hasChildren: false,
        isLeaf: true,
        order: 9 
      },
      { 
        name: 'Boutique de Meubles', 
        slug: 'boutique-meubles', 
        level: 2, 
        emoji: '🛋️',
        icon: '🛋️',
        iconType: 'emoji',
        iconColor: '#D97706',
        bgColor: '#FEF3C7',
        hasChildren: false,
        isLeaf: true,
        order: 10 
      },
      { 
        name: 'Boutique de Pièces Détachées', 
        slug: 'boutique-pieces-detachees', 
        level: 2, 
        emoji: '🔩',
        icon: '🔩',
        iconType: 'emoji',
        iconColor: '#6B7280',
        bgColor: '#F3F4F6',
        hasChildren: false,
        isLeaf: true,
        order: 11 
      },
      { 
        name: 'Boutique de Santé & Beauté', 
        slug: 'boutique-sante-beaute', 
        level: 2, 
        emoji: '💄',
        icon: '💄',
        iconType: 'emoji',
        iconColor: '#EC4899',
        bgColor: '#FCE7F3',
        hasChildren: false,
        isLeaf: true,
        order: 12 
      },
      { 
        name: 'Boutique de Services', 
        slug: 'boutique-services', 
        level: 2, 
        emoji: '🛠️',
        icon: '🛠️',
        iconType: 'emoji',
        iconColor: '#F59E0B',
        bgColor: '#FEF3C7',
        hasChildren: false,
        isLeaf: true,
        order: 13 
      },
      { 
        name: 'Boutique de Sport', 
        slug: 'boutique-sport', 
        level: 2, 
        emoji: '⚽',
        icon: '⚽',
        iconType: 'emoji',
        iconColor: '#10B981',
        bgColor: '#D1FAE5',
        hasChildren: false,
        isLeaf: true,
        order: 14 
      },
      { 
        name: 'Boutique de Voyages', 
        slug: 'boutique-voyages', 
        level: 2, 
        emoji: '✈️',
        icon: '✈️',
        iconType: 'emoji',
        iconColor: '#3B82F6',
        bgColor: '#DBEAFE',
        hasChildren: false,
        isLeaf: true,
        order: 15 
      },
      { 
        name: 'Boutique de Téléphone', 
        slug: 'boutique-telephone', 
        level: 2, 
        emoji: '📱',
        icon: '📱',
        iconType: 'emoji',
        iconColor: '#10B981',
        bgColor: '#D1FAE5',
        hasChildren: false,
        isLeaf: true,
        order: 16 
      }
    ]
  },
 
  // ==================== 17. TÉLÉPHONE ====================
  {
    name: 'Téléphone',
    slug: 'telephone',
    level: 1,
    emoji: '📱',
    order: 4,
    children: [
      // NIVEAU 2 - SANS SOUS-CATÉGORIES
      { name: 'Smartphones', slug: 'smartphones', level: 2, emoji: '📱', order: 1, children: [] },
      { name: 'Téléphones cellulaires', slug: 'telephones-cellulaires', level: 2, emoji: '📞', order: 2, children: [] },
      { name: 'Tablettes', slug: 'tablettes', level: 2, emoji: '💻', order: 3, children: [] },
      { name: 'Fixes & Fax', slug: 'fixes-fax', level: 2, emoji: '☎️', order: 4, children: [] },
      { name: 'Smartwatchs', slug: 'smartwatchs', level: 2, emoji: '⌚', order: 5, children: [] },
      { name: 'Pièces de rechange', slug: 'pieces-rechange-telephone', level: 2, emoji: '🔧', order: 7, children: [] },
      { name: 'Offres & Abonnements', slug: 'offres-abonnements', level: 2, emoji: '📶', order: 8, children: [] },
      
      // NIVEAU 2 - AVEC SOUS-CATÉGORIES
      {
        name: 'Accessoires',
        slug: 'accessoires-telephone',
        level: 2,
        emoji: '🎧',
        order: 6,
        children: [
          { name: 'Étuis', slug: 'etuis', level: 3, emoji: '🎁', children: [] },
          { name: 'Films de protection', slug: 'films-protection', level: 3, emoji: '📋', children: [] },
          { name: 'Protections d\'écran', slug: 'protections-ecran', level: 3, emoji: '🖥️', children: [] },
          { name: 'Coques & Antichoc', slug: 'coques-antichoc', level: 3, emoji: '🛡️', children: [] },
          { name: 'Protections de caméra', slug: 'protections-camera', level: 3, emoji: '📸', children: [] }
        ]
      },
      {
        name: 'Protection & Antichoc',
        slug: 'protection-antichoc',
        level: 2,
        emoji: '🛡️',
        order: 9,
        children: [
          { name: 'Protections d\'écran renforcées', slug: 'protections-ecran-renforcees', level: 3, emoji: '🖥️', children: [] },
          { name: 'Coques antichoc', slug: 'coques-antichoc-pro', level: 3, emoji: '📱', children: [] },
          { name: 'Films de protection', slug: 'films-protection-antichoc', level: 3, emoji: '📋', children: [] },
          { name: 'Étuis renforcés', slug: 'etuis-renforces', level: 3, emoji: '🧰', children: [] },
          { name: 'Protections de caméra', slug: 'protections-camera-antichoc', level: 3, emoji: '📸', children: [] }
        ]
      },
      {
        name: 'Ecouteurs & Son',
        slug: 'ecouteurs-son',
        level: 2,
        emoji: '🎵',
        order: 10,
        children: [
          { name: 'Écouteurs filaires', slug: 'ecouteurs-filaires', level: 3, emoji: '🎧', children: [] },
          { name: 'Écouteurs Bluetooth', slug: 'ecouteurs-bluetooth', level: 3, emoji: '🔵', children: [] },
          { name: 'Casques audio', slug: 'casques-audio', level: 3, emoji: '🎧', children: [] },
          { name: 'Hauts-parleurs portables', slug: 'hauts-parleurs-portables', level: 3, emoji: '🔊', children: [] },
          { name: 'Adaptateurs audio', slug: 'adaptateurs-audio', level: 3, emoji: '🎛️', children: [] }
        ]
      },
      {
        name: 'Chargeurs & Câbles',
        slug: 'chargeurs-cables',
        level: 2,
        emoji: '🔌',
        order: 11,
        children: [
          { name: 'Chargeurs mural', slug: 'chargeurs-mural', level: 3, emoji: '🔌', children: [] },
          { name: 'Chargeurs voiture', slug: 'chargeurs-voiture', level: 3, emoji: '🚗', children: [] },
          { name: 'Chargeurs sans fil', slug: 'chargeurs-sans-fil', level: 3, emoji: '⚡', children: [] },
          { name: 'Câbles USB', slug: 'cables-usb', level: 3, emoji: '🔌', children: [] },
          { name: 'Câbles Lightning', slug: 'cables-lightning', level: 3, emoji: '⚡', children: [] },
          { name: 'Câbles Type-C', slug: 'cables-type-c', level: 3, emoji: '🔌', children: [] },
          { name: 'Hubs chargeurs', slug: 'hubs-chargeurs', level: 3, emoji: '🔗', children: [] }
        ]
      },
      {
        name: 'Supports & Stabilisateurs',
        slug: 'supports-stabilisateurs',
        level: 2,
        emoji: '📐',
        order: 12,
        children: [
          { name: 'Supports téléphone', slug: 'supports-telephone', level: 3, emoji: '📱', children: [] },
          { name: 'Stabilisateurs', slug: 'stabilisateurs', level: 3, emoji: '🤳', children: [] },
          { name: 'Barres de selfies', slug: 'barres-selfies', level: 3, emoji: '📸', children: [] },
          { name: 'Pieds pour téléphone', slug: 'pieds-telephone', level: 3, emoji: '📐', children: [] },
          { name: 'Ventouses voiture', slug: 'ventouses-voiture', level: 3, emoji: '🚗', children: [] }
        ]
      },
      {
        name: 'Manettes',
        slug: 'manettes-telephone',
        level: 2,
        emoji: '🎮',
        order: 13,
        children: [
          { name: 'Manettes Bluetooth', slug: 'manettes-bluetooth', level: 3, emoji: '🎮', children: [] },
          { name: 'Manettes filaires', slug: 'manettes-filaires', level: 3, emoji: '🎮', children: [] },
          { name: 'Manettes pour téléphone', slug: 'manettes-pour-telephone', level: 3, emoji: '📱', children: [] },
          { name: 'Manettes pour tablette', slug: 'manettes-pour-tablette', level: 3, emoji: '💻', children: [] },
          { name: 'Accessoires pour manettes', slug: 'accessoires-manettes', level: 3, emoji: '🔧', children: [] }
        ]
      },
      {
        name: 'VR',
        slug: 'vr-telephone',
        level: 2,
        emoji: '👓',
        order: 14,
        children: [
          { name: 'Casques VR', slug: 'casques-vr', level: 3, emoji: '👓', children: [] },
          { name: 'Lunettes VR', slug: 'lunettes-vr', level: 3, emoji: '🕶️', children: [] },
          { name: 'Accessoires VR', slug: 'accessoires-vr', level: 3, emoji: '🔧', children: [] },
          { name: 'Contrôleurs VR', slug: 'controleurs-vr', level: 3, emoji: '🎮', children: [] },
          { name: 'Jeux VR', slug: 'jeux-vr', level: 3, emoji: '🎮', children: [] }
        ]
      },
      {
        name: 'Power banks',
        slug: 'power-banks',
        level: 2,
        emoji: '🔋',
        order: 15,
        children: [
          { name: 'Power bank 10,000mAh', slug: 'power-bank-10000mah', level: 3, emoji: '🔋', children: [] },
          { name: 'Power bank 20,000mAh', slug: 'power-bank-20000mah', level: 3, emoji: '🔋', children: [] },
          { name: 'Power bank solaire', slug: 'power-bank-solaire', level: 3, emoji: '☀️', children: [] },
          { name: 'Power bank charge rapide', slug: 'power-bank-rapide', level: 3, emoji: '⚡', children: [] },
          { name: 'Power bank compact', slug: 'power-bank-compact', level: 3, emoji: '📱', children: [] }
        ]
      },
      {
        name: 'Stylets',
        slug: 'stylets',
        level: 2,
        emoji: '✏️',
        order: 16,
        children: [
          { name: 'Stylets actifs', slug: 'stylets-actifs', level: 3, emoji: '✏️', children: [] },
          { name: 'Stylets passifs', slug: 'stylets-passifs', level: 3, emoji: '✏️', children: [] },
          { name: 'Stylets Bluetooth', slug: 'stylets-bluetooth', level: 3, emoji: '🔵', children: [] },
          { name: 'Stylets pour tablette', slug: 'stylets-tablette', level: 3, emoji: '💻', children: [] },
          { name: 'Recharges pour stylet', slug: 'recharges-stylet', level: 3, emoji: '🔋', children: [] }
        ]
      },
      {
        name: 'Cartes Mémoire',
        slug: 'cartes-memoire',
        level: 2,
        emoji: '💾',
        order: 17,
        children: [
          { name: 'Cartes SD', slug: 'cartes-sd', level: 3, emoji: '💾', children: [] },
          { name: 'Cartes Micro SD', slug: 'cartes-micro-sd', level: 3, emoji: '💾', children: [] },
          { name: 'Cartes SDHC', slug: 'cartes-sdhc', level: 3, emoji: '💾', children: [] },
          { name: 'Cartes SDXC', slug: 'cartes-sdxc', level: 3, emoji: '💾', children: [] },
          { name: 'Adaptateurs de carte', slug: 'adaptateurs-carte', level: 3, emoji: '🔌', children: [] },
          { name: 'Lecteurs de carte', slug: 'lecteurs-carte', level: 3, emoji: '📖', children: [] }
        ]
      }
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
        parent: parentId,
        // Añadir campo isLeaf si no tiene hijos
        isLeaf: !children || children.length === 0
      });
      
      await category.save();
      console.log(`✅ ${'  '.repeat(categoryData.level - 1)}${categoryData.emoji} ${categoryData.name} (/${categoryData.slug})`);

      if (children && children.length > 0) {
        for (const childData of children) {
          await createCategory(childData, category._id);
        }
      }
    };

    // Crear categorías
    console.log('🌱 Iniciando seed con TODOS los emojis en cada nivel...');
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
        totalLevel3 += child.children ? child.children.length : 0;
      });
    });
    
    console.log(`   • ${totalLevel2} subcategorías (nivel 2)`);
    console.log(`   • ${totalLevel3} artículos/tipos (nivel 3)`);
    console.log(`   • Total: ${categoriesData.length + totalLevel2 + totalLevel3} items`);
    console.log('\n🔗 URLs de ejemplo:');
    console.log('   • /category/immobilier/vente/appartement');
    console.log('   • /category/vehicules/motos-scooters');
    console.log('   • /category/telephone/smartphones');
    console.log('   • /category/telephone/chargeurs-cables/cables-type-c');
    console.log('\n✨ TODAS las categorías tienen emojis únicos en nivel 1, 2 y 3');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};
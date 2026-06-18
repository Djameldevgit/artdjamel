// seedCategoriesWithImages.js - SEED COMPLETO CON 5 CATEGORÍAS REALES
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
const createUniqueSlug = (text, existingSlugs = new Set()) => {
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

// ============================================
// NIVEL 1 - CATEGORÍAS PRINCIPALES
// ============================================

const categoriesData = [

  {
    name: 'Immobilier',
    slug: 'immobilier',
    level: 1,
    icon: '/uploads/categories/immobilier/level1/immobilier.png',
    iconType: 'image-png',
    iconColor: '#FFD166',
    bgColor: '#FFF9E6',
    order: 3,
    isLeaf: false,
    hasChildren: true,
  },

  {
    name: 'Véhicules',
    slug: 'vehicules',
    level: 1,
    icon: '/uploads/categories/vehicules/level1/vehicules.png',
    iconType: 'image-png',
    iconColor: '#118AB2',
    bgColor: '#E6F4FF',
    order: 5,
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Électroménager',
    slug: 'electromenager',
    level: 1,
    icon: '/uploads/categories/electromenager/level1/electromenager.png',
    iconType: 'image-png',
    iconColor: '#06D6A0',
    bgColor: '#E6FFF9',
    order: 4,
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Vêtements',
    slug: 'vetements',
    level: 1,
    icon: '/uploads/categories/vetements/level1/vetements.png',
    iconType: 'image-png',
    iconColor: '#FF6B6B',
    bgColor: '#FFE5E5',
    order: 1,
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Téléphones & Accessoires',
    slug: 'telephones-accessoires',
    level: 1,
    icon: '/uploads/categories/telephones/level1/telephones.png',
    iconType: 'image-png',
    iconColor: '#4ECDC4',
    bgColor: '#E0F7F6',
    order: 2,
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Emploi',
    slug: 'emploi',
    level: 1,
    icon: '/uploads/categories/emploi/level1/emploi.png',
    iconType: 'image-png',
    iconColor: '#009688', // Verde azulado para empleo
    bgColor: '#E0F2F1',
    order: 16, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Loisirs',
    slug: 'loisirs',
    level: 1,
    icon: '/uploads/categories/loisirs/level1/loisirs.png',
    iconType: 'image-png',
    iconColor: '#673AB7', // Púrpura para ocio
    bgColor: '#EDE7F6',
    order: 15, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Materiaux',
    slug: 'materiaux',
    level: 1,
    icon: '/uploads/categories/materiaux/level1/materiaux.png',
    iconType: 'image-png',
    iconColor: '#795548', // Marrón para materiales
    bgColor: '#EFEBE9',
    order: 14, // Continuamos la numeración (ya teníamos hasta 13 con Meubles)
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Meubles',
    slug: 'meubles',
    level: 1,
    icon: '/uploads/categories/meubles/level1/meubles.png',
    iconType: 'image-png',
    iconColor: '#8D6E63', // Marrón para muebles
    bgColor: '#EFEBE9',
    order: 13, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },





  {
    name: 'Pieces Detachees',
    slug: 'pieces-detachees',
    level: 1,
    icon: '/uploads/categories/pieces-detachees/level1/pieces-detachees.png',
    iconType: 'image-png',
    iconColor: '#795548',
    bgColor: '#EFEBE9',
    order: 8, // Este número debe ser ajustado según el orden real en el que se inserte
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Sport',
    slug: 'sport',
    level: 1,
    icon: '/uploads/categories/sport/level1/sport.png',
    iconType: 'image-png',
    iconColor: '#FF5722', // Naranja deportivo
    bgColor: '#FFF3E0',
    order: 12, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Voyages',
    slug: 'voyages',
    level: 1,
    icon: '/uploads/categories/voyages/level1/voyages.png',
    iconType: 'image-png',
    iconColor: '#2196F3', // Azul para viajes
    bgColor: '#E3F2FD',
    order: 11, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Sante & Beaute',
    slug: 'sante-beaute',
    level: 1,
    icon: '/uploads/categories/sante-beaute/level1/sante-beaute.png',
    iconType: 'image-png',
    iconColor: '#E91E63', // Rosa para salud y belleza
    bgColor: '#FCE4EC',
    order: 10, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Services',
    slug: 'services',
    level: 1,
    icon: '/uploads/categories/services/level1/services.png',
    iconType: 'image-png',
    iconColor: '#4CAF50', // Verde para servicios
    bgColor: '#E8F5E9',
    order: 9, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Pieces Detachees',
    slug: 'pieces-detachees',
    level: 1,
    icon: '/uploads/categories/pieces-detachees/level1/pieces-detachees.png',
    iconType: 'image-png',
    iconColor: '#795548', // Marrón/beige para piezas
    bgColor: '#EFEBE9',
    order: 8, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Alimentaires',
    slug: 'alimentaires',
    level: 1,
    icon: '/uploads/categories/alimentaires/level1/alimentaires.png',
    iconType: 'image-png',
    iconColor: '#FF9800', // Naranja alimenticio
    bgColor: '#FFF3E0',
    order: 7, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  },
  {
    name: 'Informatique',
    slug: 'informatique',
    level: 1,
    icon: '/uploads/categories/informatique/level1/informatique.png',
    iconType: 'image-png',
    iconColor: '#1E88E5', // Azul tecnológico
    bgColor: '#E3F2FD',
    order: 6, // Continúa la numeración
    isLeaf: false,
    hasChildren: true,
  }


];

// ============================================
// NIVEL 2 - TODAS LAS SUBCATEGORÍAS
// ============================================
// Agrega esta propiedad al objeto subcategoriesData























const subcategoriesData = {
  // Agrega esta propiedad al objeto subcategoriesData
  'Emploi': [
    { name: 'Offres d\'emploi', icon: '/uploads/categories/emploi/level2/offres-emploi.png', iconType: 'image-png', iconColor: '#009688', order: 1, hasSublevel: false },
    { name: 'Demandes d\'emploi', icon: '/uploads/categories/emploi/level2/demandes-emploi.png', iconType: 'image-png', iconColor: '#009688', order: 2, hasSublevel: false },
    { name: 'Autres services emploi', icon: '/uploads/categories/emploi/level2/autres-emploi.png', iconType: 'image-png', iconColor: '#009688', order: 3, hasSublevel: false }
  ],
  'Loisirs': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Animalerie', icon: '/uploads/categories/loisirs/level2/animalerie.png', iconType: 'image-png', iconColor: '#673AB7', order: 1, hasSublevel: true },
    { name: 'Consoles et Jeux Vidéos', icon: '/uploads/categories/loisirs/level2/consoles-jeux-videos.png', iconType: 'image-png', iconColor: '#673AB7', order: 2, hasSublevel: true },
    { name: 'Livres & Magazines', icon: '/uploads/categories/loisirs/level2/livres-magazines.png', iconType: 'image-png', iconColor: '#673AB7', order: 3, hasSublevel: true },
    { name: 'Instruments de Musique', icon: '/uploads/categories/loisirs/level2/instruments-musique.png', iconType: 'image-png', iconColor: '#673AB7', order: 4, hasSublevel: true },
    { name: 'Jouets', icon: '/uploads/categories/loisirs/level2/jouets.png', iconType: 'image-png', iconColor: '#673AB7', order: 5, hasSublevel: true },
    { name: 'Chasse & Pêche', icon: '/uploads/categories/loisirs/level2/chasse-peche.png', iconType: 'image-png', iconColor: '#673AB7', order: 6, hasSublevel: true },
    { name: 'Jardinage', icon: '/uploads/categories/loisirs/level2/jardinage.png', iconType: 'image-png', iconColor: '#673AB7', order: 7, hasSublevel: true },
    { name: 'Les Jeux de loisirs', icon: '/uploads/categories/loisirs/level2/jeux-loisirs.png', iconType: 'image-png', iconColor: '#673AB7', order: 8, hasSublevel: true },
    { name: 'Barbecue & Grillades', icon: '/uploads/categories/loisirs/level2/barbecue-grillades.png', iconType: 'image-png', iconColor: '#673AB7', order: 9, hasSublevel: true },
    { name: 'Vapes & Chichas', icon: '/uploads/categories/loisirs/level2/vapes-chichas.png', iconType: 'image-png', iconColor: '#673AB7', order: 10, hasSublevel: true },
    { name: 'Produits & Accessoires d\'été', icon: '/uploads/categories/loisirs/level2/produits-accessoires-ete.png', iconType: 'image-png', iconColor: '#673AB7', order: 11, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Antiquités & Collections', icon: '/uploads/categories/loisirs/level2/antiquites-collections.png', iconType: 'image-png', iconColor: '#673AB7', order: 12, hasSublevel: false },
    { name: 'Autre', icon: '/uploads/categories/loisirs/level2/autres-loisirs.png', iconType: 'image-png', iconColor: '#673AB7', order: 13, hasSublevel: false }
  ],


  'Materiaux': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Matériel professionnel', icon: '/uploads/categories/materiaux/level2/materiel-professionnel.png', iconType: 'image-png', iconColor: '#795548', order: 1, hasSublevel: true },
    { name: 'Outillage professionnel', icon: '/uploads/categories/materiaux/level2/outillage-professionnel.png', iconType: 'image-png', iconColor: '#795548', order: 2, hasSublevel: true },
    { name: 'Matériel Agricole', icon: '/uploads/categories/materiaux/level2/materiel-agricole.png', iconType: 'image-png', iconColor: '#795548', order: 3, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Materiaux de construction', icon: '/uploads/categories/materiaux/level2/materiaux-construction.png', iconType: 'image-png', iconColor: '#795548', order: 4, hasSublevel: false },
    { name: 'Matières premières', icon: '/uploads/categories/materiaux/level2/matieres-premieres.png', iconType: 'image-png', iconColor: '#795548', order: 5, hasSublevel: false },
    { name: 'Produits d\'hygiène', icon: '/uploads/categories/materiaux/level2/produits-hygiene.png', iconType: 'image-png', iconColor: '#795548', order: 6, hasSublevel: false },
    { name: 'Autre', icon: '/uploads/categories/materiaux/level2/autre-materiaux.png', iconType: 'image-png', iconColor: '#795548', order: 7, hasSublevel: false }
  ],
  'Meubles': [
    // SIN SUBNIVEL (hasSublevel: false) - Todas las directas primero
    { name: 'Salon', icon: '/uploads/categories/meubles/level2/salon.png', iconType: 'image-png', iconColor: '#8D6E63', order: 1, hasSublevel: false },
    { name: 'Chambres à coucher', icon: '/uploads/categories/meubles/level2/chambres-coucher.png', iconType: 'image-png', iconColor: '#8D6E63', order: 2, hasSublevel: false },
    { name: 'Tables', icon: '/uploads/categories/meubles/level2/tables.png', iconType: 'image-png', iconColor: '#8D6E63', order: 3, hasSublevel: false },
    { name: 'Armoires & Commodes', icon: '/uploads/categories/meubles/level2/armoires-commodes.png', iconType: 'image-png', iconColor: '#8D6E63', order: 4, hasSublevel: false },
    { name: 'Lits', icon: '/uploads/categories/meubles/level2/lits.png', iconType: 'image-png', iconColor: '#8D6E63', order: 5, hasSublevel: false },
    { name: 'Meubles de Cuisine', icon: '/uploads/categories/meubles/level2/meubles-cuisine.png', iconType: 'image-png', iconColor: '#8D6E63', order: 6, hasSublevel: false },
    { name: 'Bibliothèques & Etagères', icon: '/uploads/categories/meubles/level2/bibliotheques-etageres.png', iconType: 'image-png', iconColor: '#8D6E63', order: 7, hasSublevel: false },
    { name: 'Chaises & Fauteuils', icon: '/uploads/categories/meubles/level2/chaises-fauteuils.png', iconType: 'image-png', iconColor: '#8D6E63', order: 8, hasSublevel: false },
    { name: 'Dressings', icon: '/uploads/categories/meubles/level2/dressings.png', iconType: 'image-png', iconColor: '#8D6E63', order: 9, hasSublevel: false },
    { name: 'Meubles salle de bain', icon: '/uploads/categories/meubles/level2/meubles-salle-bain.png', iconType: 'image-png', iconColor: '#8D6E63', order: 10, hasSublevel: false },
    { name: 'Buffet', icon: '/uploads/categories/meubles/level2/buffet.png', iconType: 'image-png', iconColor: '#8D6E63', order: 11, hasSublevel: false },
    { name: 'Tables TV', icon: '/uploads/categories/meubles/level2/tables-tv.png', iconType: 'image-png', iconColor: '#8D6E63', order: 12, hasSublevel: false },
    { name: 'Table pliante', icon: '/uploads/categories/meubles/level2/table-pliante.png', iconType: 'image-png', iconColor: '#8D6E63', order: 13, hasSublevel: false },
    { name: 'Tables à manger', icon: '/uploads/categories/meubles/level2/tables-manger.png', iconType: 'image-png', iconColor: '#8D6E63', order: 14, hasSublevel: false },
    { name: 'Tables PC & Bureaux', icon: '/uploads/categories/meubles/level2/tables-pc-bureaux.png', iconType: 'image-png', iconColor: '#8D6E63', order: 15, hasSublevel: false },
    { name: 'Canapé', icon: '/uploads/categories/meubles/level2/canape.png', iconType: 'image-png', iconColor: '#8D6E63', order: 16, hasSublevel: false },
    { name: 'Table basse', icon: '/uploads/categories/meubles/level2/table-basse.png', iconType: 'image-png', iconColor: '#8D6E63', order: 17, hasSublevel: false },
    { name: 'Rangement et Organisation', icon: '/uploads/categories/meubles/level2/rangement-organisation.png', iconType: 'image-png', iconColor: '#8D6E63', order: 18, hasSublevel: false },
    { name: 'Accessoires de cuisine', icon: '/uploads/categories/meubles/level2/accessoires-cuisine.png', iconType: 'image-png', iconColor: '#8D6E63', order: 19, hasSublevel: false },
    { name: 'Meuble d\'entrée', icon: '/uploads/categories/meubles/level2/meuble-entree.png', iconType: 'image-png', iconColor: '#8D6E63', order: 20, hasSublevel: false },

    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Décoration', icon: '/uploads/categories/meubles/level2/decoration.png', iconType: 'image-png', iconColor: '#8D6E63', order: 21, hasSublevel: true },
    { name: 'Vaisselle', icon: '/uploads/categories/meubles/level2/vaisselle.png', iconType: 'image-png', iconColor: '#8D6E63', order: 22, hasSublevel: true },
    { name: 'Meubles de bureau', icon: '/uploads/categories/meubles/level2/meubles-bureau.png', iconType: 'image-png', iconColor: '#8D6E63', order: 23, hasSublevel: true },
    { name: 'Puériculture', icon: '/uploads/categories/meubles/level2/puericulture.png', iconType: 'image-png', iconColor: '#8D6E63', order: 24, hasSublevel: true },
    { name: 'Luminaire', icon: '/uploads/categories/meubles/level2/luminaire.png', iconType: 'image-png', iconColor: '#8D6E63', order: 25, hasSublevel: true },

    // OTRAS DIRECTAS
    { name: 'Rideaux', icon: '/uploads/categories/meubles/level2/rideaux.png', iconType: 'image-png', iconColor: '#8D6E63', order: 26, hasSublevel: false },
    { name: 'Literie & Linge', icon: '/uploads/categories/meubles/level2/literie-linge.png', iconType: 'image-png', iconColor: '#8D6E63', order: 27, hasSublevel: false },
    { name: 'Tapis & Moquettes', icon: '/uploads/categories/meubles/level2/tapis-moquettes.png', iconType: 'image-png', iconColor: '#8D6E63', order: 28, hasSublevel: false },
    { name: 'Meubles d\'extérieur', icon: '/uploads/categories/meubles/level2/meubles-exterieur.png', iconType: 'image-png', iconColor: '#8D6E63', order: 29, hasSublevel: false },
    { name: 'Fournitures et articles scolaires', icon: '/uploads/categories/meubles/level2/fournitures-scolaires.png', iconType: 'image-png', iconColor: '#8D6E63', order: 30, hasSublevel: false },
    { name: 'Autre', icon: '/uploads/categories/meubles/level2/autre-meubles.png', iconType: 'image-png', iconColor: '#8D6E63', order: 31, hasSublevel: false }
  ],


  'Pieces Detachees': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Pièces automobiles', icon: '/uploads/categories/pieces-detachees/level2/pieces-automobiles.png', iconType: 'image-png', iconColor: '#795548', order: 1, hasSublevel: true },
    { name: 'Pièces moto', icon: '/uploads/categories/pieces-detachees/level2/pieces-moto.png', iconType: 'image-png', iconColor: '#795548', order: 2, hasSublevel: true },
    { name: 'Pièces bateaux', icon: '/uploads/categories/pieces-detachees/level2/pieces-bateaux.png', iconType: 'image-png', iconColor: '#795548', order: 3, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Alarme & Sécurité', icon: '/uploads/categories/pieces-detachees/level2/alarme-securite.png', iconType: 'image-png', iconColor: '#795548', order: 4, hasSublevel: false },
    { name: 'Nettoyage & Entretien', icon: '/uploads/categories/pieces-detachees/level2/nettoyage-entretien.png', iconType: 'image-png', iconColor: '#795548', order: 5, hasSublevel: false },
    { name: 'Outils de diagnostics', icon: '/uploads/categories/pieces-detachees/level2/outils-diagnostics.png', iconType: 'image-png', iconColor: '#795548', order: 6, hasSublevel: false },
    { name: 'Lubrifiants', icon: '/uploads/categories/pieces-detachees/level2/lubrifiants.png', iconType: 'image-png', iconColor: '#795548', order: 7, hasSublevel: false },
    { name: 'Pièces véhicules', icon: '/uploads/categories/pieces-detachees/level2/pieces-vehicules.png', iconType: 'image-png', iconColor: '#795548', order: 8, hasSublevel: false },
    { name: 'Autres pièces', icon: '/uploads/categories/pieces-detachees/level2/autres-pieces.png', iconType: 'image-png', iconColor: '#795548', order: 9, hasSublevel: false }
  ],
  'Voyages': [
    { name: 'Voyage organisé', icon: '/uploads/categories/voyages/level2/voyage-organise.png', iconType: 'image-png', iconColor: '#2196F3', order: 1, hasSublevel: false },
    { name: 'Location vacances', icon: '/uploads/categories/voyages/level2/location-vacances.png', iconType: 'image-png', iconColor: '#2196F3', order: 2, hasSublevel: false },
    { name: 'Hajj & Omra', icon: '/uploads/categories/voyages/level2/hajj-omra.png', iconType: 'image-png', iconColor: '#2196F3', order: 3, hasSublevel: false },
    { name: 'Réservations & Visa', icon: '/uploads/categories/voyages/level2/reservations-visa.png', iconType: 'image-png', iconColor: '#2196F3', order: 4, hasSublevel: false },
    { name: 'Séjour', icon: '/uploads/categories/voyages/level2/sejour.png', iconType: 'image-png', iconColor: '#2196F3', order: 5, hasSublevel: false },
    { name: 'Croisière', icon: '/uploads/categories/voyages/level2/croisiere.png', iconType: 'image-png', iconColor: '#2196F3', order: 6, hasSublevel: false },
    { name: 'Autre voyages', icon: '/uploads/categories/voyages/level2/autre-voyages.png', iconType: 'image-png', iconColor: '#2196F3', order: 7, hasSublevel: false }
  ],
  'Sante & Beaute': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Cosmétiques & Beauté', icon: '/uploads/categories/sante-beaute/level2/cosmetiques-beaute.png', iconType: 'image-png', iconColor: '#E91E63', order: 1, hasSublevel: true },
    { name: 'Parapharmacie & Santé', icon: '/uploads/categories/sante-beaute/level2/parapharmacie-sante.png', iconType: 'image-png', iconColor: '#E91E63', order: 2, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Parfums et déodorants femme', icon: '/uploads/categories/sante-beaute/level2/parfums-deodorants-femme.png', iconType: 'image-png', iconColor: '#E91E63', order: 3, hasSublevel: false },
    { name: 'Parfums et déodorants homme', icon: '/uploads/categories/sante-beaute/level2/parfums-deodorants-homme.png', iconType: 'image-png', iconColor: '#E91E63', order: 4, hasSublevel: false },
    { name: 'Accessoires beauté', icon: '/uploads/categories/sante-beaute/level2/accessoires-beaute.png', iconType: 'image-png', iconColor: '#E91E63', order: 5, hasSublevel: false },
    { name: 'Soins cheveux', icon: '/uploads/categories/sante-beaute/level2/soins-cheveux.png', iconType: 'image-png', iconColor: '#E91E63', order: 6, hasSublevel: false },
    { name: 'Autre Santé & Beauté', icon: '/uploads/categories/sante-beaute/level2/autre-sante-beaute.png', iconType: 'image-png', iconColor: '#E91E63', order: 7, hasSublevel: false }
  ],
  'Services': [
    { name: 'Construction & Travaux', icon: '/uploads/categories/services/level2/construction-travaux.png', iconType: 'image-png', iconColor: '#4CAF50', order: 1, hasSublevel: false },
    { name: 'Ecoles & Formations', icon: '/uploads/categories/services/level2/ecoles-formations.png', iconType: 'image-png', iconColor: '#4CAF50', order: 2, hasSublevel: false },
    { name: 'Industrie & Fabrication', icon: '/uploads/categories/services/level2/industrie-fabrication.png', iconType: 'image-png', iconColor: '#4CAF50', order: 3, hasSublevel: false },
    { name: 'Transport et déménagement', icon: '/uploads/categories/services/level2/transport-demenagement.png', iconType: 'image-png', iconColor: '#4CAF50', order: 4, hasSublevel: false },
    { name: 'Décoration & Aménagement', icon: '/uploads/categories/services/level2/decoration-amenagement.png', iconType: 'image-png', iconColor: '#4CAF50', order: 5, hasSublevel: false },
    { name: 'Publicite & Communication', icon: '/uploads/categories/services/level2/publicite-communication.png', iconType: 'image-png', iconColor: '#4CAF50', order: 6, hasSublevel: false },
    { name: 'Nettoyage & Jardinage', icon: '/uploads/categories/services/level2/nettoyage-jardinage.png', iconType: 'image-png', iconColor: '#4CAF50', order: 7, hasSublevel: false },
    { name: 'Froid & Climatisation', icon: '/uploads/categories/services/level2/froid-climatisation.png', iconType: 'image-png', iconColor: '#4CAF50', order: 8, hasSublevel: false },
    { name: 'Traiteurs & Gateaux', icon: '/uploads/categories/services/level2/traiteurs-gateaux.png', iconType: 'image-png', iconColor: '#4CAF50', order: 9, hasSublevel: false },
    { name: 'Médecine & Santé', icon: '/uploads/categories/services/level2/medecine-sante.png', iconType: 'image-png', iconColor: '#4CAF50', order: 10, hasSublevel: false },
    { name: 'Réparation auto & Diagnostic', icon: '/uploads/categories/services/level2/reparation-auto-diagnostic.png', iconType: 'image-png', iconColor: '#4CAF50', order: 11, hasSublevel: false },
    { name: 'Sécurité & Alarme', icon: '/uploads/categories/services/level2/securite-alarme.png', iconType: 'image-png', iconColor: '#4CAF50', order: 12, hasSublevel: false },
    { name: 'Projets & Études', icon: '/uploads/categories/services/level2/projets-etudes.png', iconType: 'image-png', iconColor: '#4CAF50', order: 13, hasSublevel: false },
    { name: 'Bureautique & Internet', icon: '/uploads/categories/services/level2/bureautique-internet.png', iconType: 'image-png', iconColor: '#4CAF50', order: 14, hasSublevel: false },
    { name: 'Location de véhicules', icon: '/uploads/categories/services/level2/location-vehicules.png', iconType: 'image-png', iconColor: '#4CAF50', order: 15, hasSublevel: false },
    { name: 'Menuiserie & Meubles', icon: '/uploads/categories/services/level2/menuiserie-meubles.png', iconType: 'image-png', iconColor: '#4CAF50', order: 16, hasSublevel: false },
    { name: 'Impression & Edition', icon: '/uploads/categories/services/level2/impression-edition.png', iconType: 'image-png', iconColor: '#4CAF50', order: 17, hasSublevel: false },
    { name: 'Hôtellerie & Restauration & Salles', icon: '/uploads/categories/services/level2/hotellerie-restauration-salles.png', iconType: 'image-png', iconColor: '#4CAF50', order: 18, hasSublevel: false },
    { name: 'Esthétique & Beauté', icon: '/uploads/categories/services/level2/esthetique-beaute.png', iconType: 'image-png', iconColor: '#4CAF50', order: 19, hasSublevel: false },
    { name: 'Image & Son', icon: '/uploads/categories/services/level2/image-son.png', iconType: 'image-png', iconColor: '#4CAF50', order: 20, hasSublevel: false },
    { name: 'Comptabilité & Economie', icon: '/uploads/categories/services/level2/comptabilite-economie.png', iconType: 'image-png', iconColor: '#4CAF50', order: 21, hasSublevel: false },
    { name: 'Couture & Confection', icon: '/uploads/categories/services/level2/couture-confection.png', iconType: 'image-png', iconColor: '#4CAF50', order: 22, hasSublevel: false },
    { name: 'Maintenance informatique', icon: '/uploads/categories/services/level2/maintenance-informatique.png', iconType: 'image-png', iconColor: '#4CAF50', order: 23, hasSublevel: false },
    { name: 'Réparation Electromenager', icon: '/uploads/categories/services/level2/reparation-electromenager.png', iconType: 'image-png', iconColor: '#4CAF50', order: 24, hasSublevel: false },
    { name: 'Evènements & Divertissement', icon: '/uploads/categories/services/level2/evenements-divertissement.png', iconType: 'image-png', iconColor: '#4CAF50', order: 25, hasSublevel: false },
    { name: 'Paraboles & Démos', icon: '/uploads/categories/services/level2/paraboles-demos.png', iconType: 'image-png', iconColor: '#4CAF50', order: 26, hasSublevel: false },
    { name: 'Réparation Électronique', icon: '/uploads/categories/services/level2/reparation-electronique.png', iconType: 'image-png', iconColor: '#4CAF50', order: 27, hasSublevel: false },
    { name: 'Services à l\'étranger', icon: '/uploads/categories/services/level2/services-etranger.png', iconType: 'image-png', iconColor: '#4CAF50', order: 28, hasSublevel: false },
    { name: 'Flashage & Réparation des téléphones', icon: '/uploads/categories/services/level2/flashage-reparation-telephones.png', iconType: 'image-png', iconColor: '#4CAF50', order: 29, hasSublevel: false },
    { name: 'Flashage & Installation des jeux', icon: '/uploads/categories/services/level2/flashage-installation-jeux.png', iconType: 'image-png', iconColor: '#4CAF50', order: 30, hasSublevel: false },
    { name: 'Juridique', icon: '/uploads/categories/services/level2/juridique.png', iconType: 'image-png', iconColor: '#4CAF50', order: 31, hasSublevel: false },
    { name: 'Autres Services', icon: '/uploads/categories/services/level2/autres-services.png', iconType: 'image-png', iconColor: '#4CAF50', order: 32, hasSublevel: false }
  ],
  'Pieces Detachees': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Pièces automobiles', icon: '/uploads/categories/pieces-detachees/level2/pieces-automobiles.png', iconType: 'image-png', iconColor: '#795548', order: 1, hasSublevel: true },
    { name: 'Pièces moto', icon: '/uploads/categories/pieces-detachees/level2/pieces-moto.png', iconType: 'image-png', iconColor: '#795548', order: 2, hasSublevel: true },
    { name: 'Pièces bateaux', icon: '/uploads/categories/pieces-detachees/level2/pieces-bateaux.png', iconType: 'image-png', iconColor: '#795548', order: 3, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Alarme & Sécurité', icon: '/uploads/categories/pieces-detachees/level2/alarme-securite.png', iconType: 'image-png', iconColor: '#795548', order: 4, hasSublevel: false },
    { name: 'Nettoyage & Entretien', icon: '/uploads/categories/pieces-detachees/level2/nettoyage-entretien.png', iconType: 'image-png', iconColor: '#795548', order: 5, hasSublevel: false },
    { name: 'Outils de diagnostics', icon: '/uploads/categories/pieces-detachees/level2/outils-diagnostics.png', iconType: 'image-png', iconColor: '#795548', order: 6, hasSublevel: false },
    { name: 'Lubrifiants', icon: '/uploads/categories/pieces-detachees/level2/lubrifiants.png', iconType: 'image-png', iconColor: '#795548', order: 7, hasSublevel: false },
    { name: 'Pièces véhicules', icon: '/uploads/categories/pieces-detachees/level2/pieces-vehicules.png', iconType: 'image-png', iconColor: '#795548', order: 8, hasSublevel: false },
    { name: 'Autres pièces', icon: '/uploads/categories/pieces-detachees/level2/autres-pieces.png', iconType: 'image-png', iconColor: '#795548', order: 9, hasSublevel: false }
  ],
  'Alimentaires': [
    { name: 'Produits laitiers', icon: '/uploads/categories/alimentaires/level2/produits-laitiers.png', iconType: 'image-png', iconColor: '#FF9800', order: 1, hasSublevel: false },
    { name: 'Fruits secs', icon: '/uploads/categories/alimentaires/level2/fruits-secs.png', iconType: 'image-png', iconColor: '#FF9800', order: 2, hasSublevel: false },
    { name: 'Graines - Riz - Céréales', icon: '/uploads/categories/alimentaires/level2/graines-riz-cereales.png', iconType: 'image-png', iconColor: '#FF9800', order: 3, hasSublevel: false },
    { name: 'Sucres & Produits sucrés', icon: '/uploads/categories/alimentaires/level2/sucres-produits-sucres.png', iconType: 'image-png', iconColor: '#FF9800', order: 4, hasSublevel: false },
    { name: 'Boissons', icon: '/uploads/categories/alimentaires/level2/boissons.png', iconType: 'image-png', iconColor: '#FF9800', order: 5, hasSublevel: false },
    { name: 'Viandes & Poissons', icon: '/uploads/categories/alimentaires/level2/viandes-poissons.png', iconType: 'image-png', iconColor: '#FF9800', order: 6, hasSublevel: false },
    { name: 'Café - Thé - Infusion', icon: '/uploads/categories/alimentaires/level2/cafe-the-infusion.png', iconType: 'image-png', iconColor: '#FF9800', order: 7, hasSublevel: false },
    { name: 'Compléments alimentaires', icon: '/uploads/categories/alimentaires/level2/complements-alimentaires.png', iconType: 'image-png', iconColor: '#FF9800', order: 8, hasSublevel: false },
    { name: 'Miel & Dérivés', icon: '/uploads/categories/alimentaires/level2/miel-derives.png', iconType: 'image-png', iconColor: '#FF9800', order: 9, hasSublevel: false },
    { name: 'Fruits & Légumes', icon: '/uploads/categories/alimentaires/level2/fruits-legumes.png', iconType: 'image-png', iconColor: '#FF9800', order: 10, hasSublevel: false },
    { name: 'Blé & Farine', icon: '/uploads/categories/alimentaires/level2/ble-farine.png', iconType: 'image-png', iconColor: '#FF9800', order: 11, hasSublevel: false },
    { name: 'Bonbons & Chocolat', icon: '/uploads/categories/alimentaires/level2/bonbons-chocolat.png', iconType: 'image-png', iconColor: '#FF9800', order: 12, hasSublevel: false },
    { name: 'Boulangerie & Viennoiserie', icon: '/uploads/categories/alimentaires/level2/boulangerie-viennoiserie.png', iconType: 'image-png', iconColor: '#FF9800', order: 13, hasSublevel: false },
    { name: 'Ingrédients cuisine et pâtisserie', icon: '/uploads/categories/alimentaires/level2/ingredients-cuisine-patisserie.png', iconType: 'image-png', iconColor: '#FF9800', order: 14, hasSublevel: false },
    { name: 'Noix & Graines', icon: '/uploads/categories/alimentaires/level2/noix-graines.png', iconType: 'image-png', iconColor: '#FF9800', order: 15, hasSublevel: false },
    { name: 'Plats cuisinés', icon: '/uploads/categories/alimentaires/level2/plats-cuisines.png', iconType: 'image-png', iconColor: '#FF9800', order: 16, hasSublevel: false },
    { name: 'Sauces - Epices - Condiments', icon: '/uploads/categories/alimentaires/level2/sauces-epices-condiments.png', iconType: 'image-png', iconColor: '#FF9800', order: 17, hasSublevel: false },
    { name: 'Œufs', icon: '/uploads/categories/alimentaires/level2/oeufs.png', iconType: 'image-png', iconColor: '#FF9800', order: 18, hasSublevel: false },
    { name: 'Huiles', icon: '/uploads/categories/alimentaires/level2/huiles.png', iconType: 'image-png', iconColor: '#FF9800', order: 19, hasSublevel: false },
    { name: 'Pâtes', icon: '/uploads/categories/alimentaires/level2/pates.png', iconType: 'image-png', iconColor: '#FF9800', order: 20, hasSublevel: false },
    { name: 'Gateaux', icon: '/uploads/categories/alimentaires/level2/gateaux.png', iconType: 'image-png', iconColor: '#FF9800', order: 21, hasSublevel: false },
    { name: 'Emballage', icon: '/uploads/categories/alimentaires/level2/emballage.png', iconType: 'image-png', iconColor: '#FF9800', order: 22, hasSublevel: false },
    { name: 'Aliments pour bébé', icon: '/uploads/categories/alimentaires/level2/aliments-bebe.png', iconType: 'image-png', iconColor: '#FF9800', order: 23, hasSublevel: false },
    { name: 'Aliments diététiques', icon: '/uploads/categories/alimentaires/level2/aliments-dietetiques.png', iconType: 'image-png', iconColor: '#FF9800', order: 24, hasSublevel: false },
    { name: 'Autre Alimentaires', icon: '/uploads/categories/alimentaires/level2/autre-alimentaires.png', iconType: 'image-png', iconColor: '#FF9800', order: 25, hasSublevel: false }
  ],
  'Informatique': [
    // CATEGORÍAS CON SUBNIVEL (hasSublevel: true)
    { name: 'Ordinateurs portables', icon: '/uploads/categories/informatique/level2/ordinateurs-portables.png', iconType: 'image-png', iconColor: '#1E88E5', order: 1, hasSublevel: true },
    { name: 'Ordinateurs de bureau', icon: '/uploads/categories/informatique/level2/ordinateurs-bureau.png', iconType: 'image-png', iconColor: '#1E88E5', order: 2, hasSublevel: true },
    { name: 'Composants PC fixe', icon: '/uploads/categories/informatique/level2/composants-pc-fixe.png', iconType: 'image-png', iconColor: '#1E88E5', order: 3, hasSublevel: true },
    { name: 'Composants PC portable', icon: '/uploads/categories/informatique/level2/composants-pc-portable.png', iconType: 'image-png', iconColor: '#1E88E5', order: 4, hasSublevel: true },
    { name: 'Composants serveur', icon: '/uploads/categories/informatique/level2/composants-serveur.png', iconType: 'image-png', iconColor: '#1E88E5', order: 5, hasSublevel: true },
    { name: 'Imprimantes & Cartouches', icon: '/uploads/categories/informatique/level2/imprimantes-cartouches.png', iconType: 'image-png', iconColor: '#1E88E5', order: 6, hasSublevel: true },
    { name: 'Réseau & Connexion', icon: '/uploads/categories/informatique/level2/reseau-connexion.png', iconType: 'image-png', iconColor: '#1E88E5', order: 7, hasSublevel: true },
    { name: 'Stockage externe & Racks', icon: '/uploads/categories/informatique/level2/stockage-externe.png', iconType: 'image-png', iconColor: '#1E88E5', order: 8, hasSublevel: true },

    // CATEGORÍAS SIN SUBNIVEL (hasSublevel: false)
    { name: 'Serveurs', icon: '/uploads/categories/informatique/level2/serveurs.png', iconType: 'image-png', iconColor: '#1E88E5', order: 9, hasSublevel: false },
    { name: 'Ecrans', icon: '/uploads/categories/informatique/level2/ecrans.png', iconType: 'image-png', iconColor: '#1E88E5', order: 10, hasSublevel: false },
    { name: 'Onduleurs & Stabilisateurs', icon: '/uploads/categories/informatique/level2/onduleurs-stabilisateurs.png', iconType: 'image-png', iconColor: '#1E88E5', order: 11, hasSublevel: false },
    { name: 'Compteuses de billets', icon: '/uploads/categories/informatique/level2/compteuses-billets.png', iconType: 'image-png', iconColor: '#1E88E5', order: 12, hasSublevel: false },
    { name: 'Claviers & Souris', icon: '/uploads/categories/informatique/level2/claviers-souris.png', iconType: 'image-png', iconColor: '#1E88E5', order: 13, hasSublevel: false },
    { name: 'Casques & Son', icon: '/uploads/categories/informatique/level2/casques-son.png', iconType: 'image-png', iconColor: '#1E88E5', order: 14, hasSublevel: false },
    { name: 'Webcam & Vidéoconférence', icon: '/uploads/categories/informatique/level2/webcam-videoconference.png', iconType: 'image-png', iconColor: '#1E88E5', order: 15, hasSublevel: false },
    { name: 'Data shows', icon: '/uploads/categories/informatique/level2/data-shows.png', iconType: 'image-png', iconColor: '#1E88E5', order: 16, hasSublevel: false },
    { name: 'Câbles & Adaptateurs', icon: '/uploads/categories/informatique/level2/cables-adaptateurs.png', iconType: 'image-png', iconColor: '#1E88E5', order: 17, hasSublevel: false },
    { name: 'Stylets & Tablettes', icon: '/uploads/categories/informatique/level2/stylers-tablettes.png', iconType: 'image-png', iconColor: '#1E88E5', order: 18, hasSublevel: false },
    { name: 'Cartables & Sacoches', icon: '/uploads/categories/informatique/level2/cartables-sacoches.png', iconType: 'image-png', iconColor: '#1E88E5', order: 19, hasSublevel: false },
    { name: 'Manettes & Simulateurs', icon: '/uploads/categories/informatique/level2/manettes-simulateurs.png', iconType: 'image-png', iconColor: '#1E88E5', order: 20, hasSublevel: false },
    { name: 'VR', icon: '/uploads/categories/informatique/level2/vr.png', iconType: 'image-png', iconColor: '#1E88E5', order: 21, hasSublevel: false },
    { name: 'Logiciels & Abonnements', icon: '/uploads/categories/informatique/level2/logiciels-abonnements.png', iconType: 'image-png', iconColor: '#1E88E5', order: 22, hasSublevel: false },
    { name: 'Bureautique', icon: '/uploads/categories/informatique/level2/bureautique.png', iconType: 'image-png', iconColor: '#1E88E5', order: 23, hasSublevel: false },
    { name: 'Autre Informatique', icon: '/uploads/categories/informatique/level2/autre-informatique.png', iconType: 'image-png', iconColor: '#1E88E5', order: 24, hasSublevel: false }
  ],



  'Vêtements': [
    { name: 'Vêtements Homme', icon: '/uploads/categories/vetements/level2/vetements-homme.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 1, hasSublevel: true },
    { name: 'Vêtements Femme', icon: '/uploads/categories/vetements/level2/vetements-femme.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 2, hasSublevel: true },
    { name: 'Chaussures Homme', icon: '/uploads/categories/vetements/level2/chaussures-homme.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 3, hasSublevel: true },
    { name: 'Chaussures Femme', icon: '/uploads/categories/vetements/level2/chaussures-femme.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 4, hasSublevel: true },
    { name: 'Garçons', icon: '/uploads/categories/vetements/level2/garcons.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 5, hasSublevel: true },
    { name: 'Filles', icon: '/uploads/categories/vetements/level2/filles.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 6, hasSublevel: true },
    { name: 'Bébé', icon: '/uploads/categories/vetements/level2/bebe.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 7, hasSublevel: true },
    { name: 'Tenues professionnelles', icon: '/uploads/categories/vetements/level2/tenues-professionnelles.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 8, hasSublevel: false },
    { name: 'Sacs & Valises', icon: '/uploads/categories/vetements/level2/sacs-valises.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 9, hasSublevel: true },
    { name: 'Montres', icon: '/uploads/categories/vetements/level2/montres.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 10, hasSublevel: true },
    { name: 'Lunettes', icon: '/uploads/categories/vetements/level2/lunettes.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 11, hasSublevel: true },
    { name: 'Bijoux', icon: '/uploads/categories/vetements/level2/bijoux.png', iconType: 'image-png', iconColor: '#FF6B6B', order: 12, hasSublevel: true }
  ],
  'Téléphones & Accessoires': [
    { name: 'Smartphones', icon: '/uploads/categories/telephones/level2/smartphones.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 1, hasSublevel: false },
    { name: 'Téléphones cellulaires', icon: '/uploads/categories/telephones/level2/telephones-cellulaires.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 2, hasSublevel: false },
    { name: 'Tablettes', icon: '/uploads/categories/telephones/level2/tablettes.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 3, hasSublevel: false },
    { name: 'Fixes & Fax', icon: '/uploads/categories/telephones/level2/fixes-fax.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 4, hasSublevel: false },
    { name: 'Smartwatchs', icon: '/uploads/categories/telephones/level2/smartwatchs.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 5, hasSublevel: false },
    { name: 'Accessoires', icon: '/uploads/categories/telephones/level2/accessoires.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 6, hasSublevel: false },
    { name: 'Pièces de rechange', icon: '/uploads/categories/telephones/level2/pieces-rechange.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 7, hasSublevel: false },
    { name: 'Offres & Abonnements', icon: '/uploads/categories/telephones/level2/offres-abonnements.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 8, hasSublevel: false },
    { name: 'Protection & Antichoc', icon: '/uploads/categories/telephones/level2/protection-antichoc.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 9, hasSublevel: true },
    { name: 'Ecouteurs & Son', icon: '/uploads/categories/telephones/level2/ecouteurs-son.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 10, hasSublevel: true },
    { name: 'Chargeurs & Câbles', icon: '/uploads/categories/telephones/level2/chargeurs-cables.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 11, hasSublevel: true },
    { name: 'Supports & Stabilisateurs', icon: '/uploads/categories/telephones/level2/supports-stabilisateurs.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 12, hasSublevel: true },
    { name: 'Manettes', icon: '/uploads/categories/telephones/level2/manettes.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 13, hasSublevel: true },
    { name: 'VR', icon: '/uploads/categories/telephones/level2/vr.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 14, hasSublevel: true },
    { name: 'Power banks', icon: '/uploads/categories/telephones/level2/power-banks.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 15, hasSublevel: true },
    { name: 'Stylets', icon: '/uploads/categories/telephones/level2/stylets.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 16, hasSublevel: true },
    { name: 'Cartes Mémoire', icon: '/uploads/categories/telephones/level2/cartes-memoire.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 17, hasSublevel: true },
    { name: 'Accessoires Divers', icon: '/uploads/categories/telephones/level2/accessoires-divers.png', iconType: 'image-png', iconColor: '#4ECDC4', order: 18, hasSublevel: false }
  ],
  'Immobilier': [
    { name: 'Vente', icon: '/uploads/categories/immobilier/level2/vente.png', iconType: 'image-png', iconColor: '#FFD166', order: 1, hasSublevel: true },
    { name: 'Location', icon: '/uploads/categories/immobilier/level2/location.png', iconType: 'image-png', iconColor: '#FFD166', order: 2, hasSublevel: true },
    { name: 'Location vacances', icon: '/uploads/categories/immobilier/level2/location-vacances.png', iconType: 'image-png', iconColor: '#FFD166', order: 3, hasSublevel: true },
    { name: 'Cherche location', icon: '/uploads/categories/immobilier/level2/cherche-location.png', iconType: 'image-png', iconColor: '#FFD166', order: 4, hasSublevel: true },
    { name: 'Cherche achat', icon: '/uploads/categories/immobilier/level2/cherche-achat.png', iconType: 'image-png', iconColor: '#FFD166', order: 5, hasSublevel: true }
  ],
  'Électroménager': [
    { name: 'Téléviseurs', icon: '/uploads/categories/electromenager/level2/televiseurs.png', iconType: 'image-png', iconColor: '#06D6A0', order: 1, hasSublevel: false },
    { name: 'Démodulateurs & Box TV', icon: '/uploads/categories/electromenager/level2/demodulateurs-box-tv.png', iconType: 'image-png', iconColor: '#06D6A0', order: 2, hasSublevel: false },
    { name: 'Paraboles & Switch TV', icon: '/uploads/categories/electromenager/level2/paraboles-switch-tv.png', iconType: 'image-png', iconColor: '#06D6A0', order: 3, hasSublevel: false },
    { name: 'Abonnements IPTV', icon: '/uploads/categories/electromenager/level2/abonnements-iptv.png', iconType: 'image-png', iconColor: '#06D6A0', order: 4, hasSublevel: false },
    { name: 'Caméras & Accessories', icon: '/uploads/categories/electromenager/level2/cameras-accessories.png', iconType: 'image-png', iconColor: '#06D6A0', order: 5, hasSublevel: false },
    { name: 'Audio', icon: '/uploads/categories/electromenager/level2/audio.png', iconType: 'image-png', iconColor: '#06D6A0', order: 6, hasSublevel: false },
    { name: 'Aspirateurs & Nettoyeurs', icon: '/uploads/categories/electromenager/level2/aspirateurs-nettoyeurs.png', iconType: 'image-png', iconColor: '#06D6A0', order: 7, hasSublevel: false },
    { name: 'Repassage', icon: '/uploads/categories/electromenager/level2/repassage.png', iconType: 'image-png', iconColor: '#06D6A0', order: 8, hasSublevel: false },
    { name: 'Beauté & Hygiène', icon: '/uploads/categories/electromenager/level2/beaute-hygiene.png', iconType: 'image-png', iconColor: '#06D6A0', order: 9, hasSublevel: false },
    { name: 'Machines à coudre', icon: '/uploads/categories/electromenager/level2/machines-coudre.png', iconType: 'image-png', iconColor: '#06D6A0', order: 10, hasSublevel: false },
    { name: 'Télécommandes', icon: '/uploads/categories/electromenager/level2/telecommandes.png', iconType: 'image-png', iconColor: '#06D6A0', order: 11, hasSublevel: false },
    { name: 'Sécurité & GPS', icon: '/uploads/categories/electromenager/level2/securite-gps.png', iconType: 'image-png', iconColor: '#06D6A0', order: 12, hasSublevel: false },
    { name: 'Composants électroniques', icon: '/uploads/categories/electromenager/level2/composants-electroniques.png', iconType: 'image-png', iconColor: '#06D6A0', order: 13, hasSublevel: false },
    { name: 'Pièces de rechange', icon: '/uploads/categories/electromenager/level2/pieces-rechange.png', iconType: 'image-png', iconColor: '#06D6A0', order: 14, hasSublevel: false },
    { name: 'Autre Électroménager', icon: '/uploads/categories/electromenager/level2/autre-electromenager.png', iconType: 'image-png', iconColor: '#06D6A0', order: 15, hasSublevel: false },
    { name: 'Réfrigérateurs & Congélateurs', icon: '/uploads/categories/electromenager/level2/refrigerateurs-congelateurs.png', iconType: 'image-png', iconColor: '#06D6A0', order: 16, hasSublevel: true },
    { name: 'Machines à laver', icon: '/uploads/categories/electromenager/level2/machines-a-laver.png', iconType: 'image-png', iconColor: '#06D6A0', order: 17, hasSublevel: true },
    { name: 'Lave-vaisselles', icon: '/uploads/categories/electromenager/level2/lave-vaisselles.png', iconType: 'image-png', iconColor: '#06D6A0', order: 18, hasSublevel: true },
    { name: 'Fours & Cuisson', icon: '/uploads/categories/electromenager/level2/fours-cuisson.png', iconType: 'image-png', iconColor: '#06D6A0', order: 19, hasSublevel: true },
    { name: 'Chauffage & Climatisation', icon: '/uploads/categories/electromenager/level2/chauffage-climatisation.png', iconType: 'image-png', iconColor: '#06D6A0', order: 20, hasSublevel: true },
    { name: 'Appareils de cuisine', icon: '/uploads/categories/electromenager/level2/appareils-cuisine.png', iconType: 'image-png', iconColor: '#06D6A0', order: 21, hasSublevel: true }
  ],
  'Véhicules': [
    { name: 'Voitures', icon: '/uploads/categories/vehicules/level2/voitures.png', iconType: 'image-png', iconColor: '#118AB2', order: 1, hasSublevel: false },
    { name: 'Utilitaire', icon: '/uploads/categories/vehicules/level2/utilitaire.png', iconType: 'image-png', iconColor: '#118AB2', order: 2, hasSublevel: false },
    { name: 'Motos & Scooters', icon: '/uploads/categories/vehicules/level2/motos-scooters.png', iconType: 'image-png', iconColor: '#118AB2', order: 3, hasSublevel: false },
    { name: 'Quads', icon: '/uploads/categories/vehicules/level2/quads.png', iconType: 'image-png', iconColor: '#118AB2', order: 4, hasSublevel: false },
    { name: 'Fourgon', icon: '/uploads/categories/vehicules/level2/fourgon.png', iconType: 'image-png', iconColor: '#118AB2', order: 5, hasSublevel: false },
    { name: 'Camion', icon: '/uploads/categories/vehicules/level2/camion.png', iconType: 'image-png', iconColor: '#118AB2', order: 6, hasSublevel: false },
    { name: 'Bus', icon: '/uploads/categories/vehicules/level2/bus.png', iconType: 'image-png', iconColor: '#118AB2', order: 7, hasSublevel: false },
    { name: 'Engin', icon: '/uploads/categories/vehicules/level2/engin.png', iconType: 'image-png', iconColor: '#118AB2', order: 8, hasSublevel: false },
    { name: 'Tracteurs', icon: '/uploads/categories/vehicules/level2/tracteurs.png', iconType: 'image-png', iconColor: '#118AB2', order: 9, hasSublevel: false },
    { name: 'Remorques', icon: '/uploads/categories/vehicules/level2/remorques.png', iconType: 'image-png', iconColor: '#118AB2', order: 10, hasSublevel: false },
    { name: 'Bateaux & Barques', icon: '/uploads/categories/vehicules/level2/bateaux-barques.png', iconType: 'image-png', iconColor: '#118AB2', order: 11, hasSublevel: false }
  ]
};

// ============================================
// NIVEL 3 - TODOS LOS ARTÍCULOS (COMPLETOS)
// ============================================






















const articlesData = {
  // Agrega estas propiedades al objeto articlesData
  'Animalerie': [
    { name: 'Produits de soin animal', icon: '/uploads/categories/loisirs/level3/produits-soin-animal.png', iconType: 'image-png', order: 1 },
    { name: 'Chien', icon: '/uploads/categories/loisirs/level3/chien.png', iconType: 'image-png', order: 2 },
    { name: 'Oiseau', icon: '/uploads/categories/loisirs/level3/oiseau.png', iconType: 'image-png', order: 3 },
    { name: 'Animaux de ferme', icon: '/uploads/categories/loisirs/level3/animaux-ferme.png', iconType: 'image-png', order: 4 },
    { name: 'Chat', icon: '/uploads/categories/loisirs/level3/chat.png', iconType: 'image-png', order: 5 },
    { name: 'Cheval', icon: '/uploads/categories/loisirs/level3/cheval.png', iconType: 'image-png', order: 6 },
    { name: 'Poisson', icon: '/uploads/categories/loisirs/level3/poisson.png', iconType: 'image-png', order: 7 },
    { name: 'Accessoire pour animaux', icon: '/uploads/categories/loisirs/level3/accessoire-animaux.png', iconType: 'image-png', order: 8 },
    { name: 'Nourriture pour animaux', icon: '/uploads/categories/loisirs/level3/nourriture-animaux.png', iconType: 'image-png', order: 9 },
    { name: 'Autres Animaux', icon: '/uploads/categories/loisirs/level3/autres-animaux.png', iconType: 'image-png', order: 10 }
  ],

  'Consoles et Jeux Vidéos': [
    { name: 'Consoles', icon: '/uploads/categories/loisirs/level3/consoles.png', iconType: 'image-png', order: 1 },
    { name: 'Jeux videos', icon: '/uploads/categories/loisirs/level3/jeux-videos.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires', icon: '/uploads/categories/loisirs/level3/accessoires-jeux.png', iconType: 'image-png', order: 3 }
  ],

  'Livres & Magazines': [
    { name: 'Littérature et philosophie', icon: '/uploads/categories/loisirs/level3/litterature-philosophie.png', iconType: 'image-png', order: 1 },
    { name: 'Romans', icon: '/uploads/categories/loisirs/level3/romans.png', iconType: 'image-png', order: 2 },
    { name: 'Scolaire & Parascolaire', icon: '/uploads/categories/loisirs/level3/scolaire-parascolaire.png', iconType: 'image-png', order: 3 },
    { name: 'Sciences, techniques et medecine', icon: '/uploads/categories/loisirs/level3/sciences-techniques-medecine.png', iconType: 'image-png', order: 4 },
    { name: 'Traduction', icon: '/uploads/categories/loisirs/level3/traduction.png', iconType: 'image-png', order: 5 },
    { name: 'Religion et Spiritualités', icon: '/uploads/categories/loisirs/level3/religion-spiritualites.png', iconType: 'image-png', order: 6 },
    { name: 'Historique', icon: '/uploads/categories/loisirs/level3/historique.png', iconType: 'image-png', order: 7 },
    { name: 'Cuisine', icon: '/uploads/categories/loisirs/level3/cuisine.png', iconType: 'image-png', order: 8 },
    { name: 'Essais et documents', icon: '/uploads/categories/loisirs/level3/essais-documents.png', iconType: 'image-png', order: 9 },
    { name: 'Fiction', icon: '/uploads/categories/loisirs/level3/fiction.png', iconType: 'image-png', order: 10 },
    { name: 'Enfants', icon: '/uploads/categories/loisirs/level3/enfants.png', iconType: 'image-png', order: 11 },
    { name: 'Mangas et bande dessinée', icon: '/uploads/categories/loisirs/level3/mangas-bande-dessinee.png', iconType: 'image-png', order: 12 }
  ],

  'Instruments de Musique': [
    { name: 'Instruments électriques', icon: '/uploads/categories/loisirs/level3/instruments-electriques.png', iconType: 'image-png', order: 1 },
    { name: 'Instruments à percussion : les idiophones', icon: '/uploads/categories/loisirs/level3/instruments-percussion.png', iconType: 'image-png', order: 2 },
    { name: 'Instruments a vent', icon: '/uploads/categories/loisirs/level3/instruments-vent.png', iconType: 'image-png', order: 3 },
    { name: 'Instruments à cordes', icon: '/uploads/categories/loisirs/level3/instruments-cordes.png', iconType: 'image-png', order: 4 },
    { name: 'Autre', icon: '/uploads/categories/loisirs/level3/autre-instruments.png', iconType: 'image-png', order: 5 }
  ],

  'Jouets': [
    { name: 'Jeux d\'éveil', icon: '/uploads/categories/loisirs/level3/jeux-eveil.png', iconType: 'image-png', order: 1 },
    { name: 'Poupées - Peluches', icon: '/uploads/categories/loisirs/level3/poupees-peluches.png', iconType: 'image-png', order: 2 },
    { name: 'Personnages - Déguisements', icon: '/uploads/categories/loisirs/level3/personnages-deguisements.png', iconType: 'image-png', order: 3 },
    { name: 'Jeux éducatifs - Puzzle', icon: '/uploads/categories/loisirs/level3/jeux-educatifs-puzzle.png', iconType: 'image-png', order: 4 },
    { name: 'Véhicules et Circuits', icon: '/uploads/categories/loisirs/level3/vehicules-circuits.png', iconType: 'image-png', order: 5 },
    { name: 'Jeux électroniques', icon: '/uploads/categories/loisirs/level3/jeux-electroniques.png', iconType: 'image-png', order: 6 },
    { name: 'Construction et Outils', icon: '/uploads/categories/loisirs/level3/construction-outils.png', iconType: 'image-png', order: 7 },
    { name: 'Jeux de plein air', icon: '/uploads/categories/loisirs/level3/jeux-plein-air.png', iconType: 'image-png', order: 8 },
    { name: 'Animaux', icon: '/uploads/categories/loisirs/level3/animaux-jouets.png', iconType: 'image-png', order: 9 }
  ],

  'Chasse & Pêche': [
    { name: 'Canne à pêche', icon: '/uploads/categories/loisirs/level3/canne-peche.png', iconType: 'image-png', order: 1 },
    { name: 'Moulinets', icon: '/uploads/categories/loisirs/level3/moulinets.png', iconType: 'image-png', order: 2 },
    { name: 'Sondeurs-GPS', icon: '/uploads/categories/loisirs/level3/sondeurs-gps.png', iconType: 'image-png', order: 3 },
    { name: 'Vêtements', icon: '/uploads/categories/loisirs/level3/vetements-chasse-peche.png', iconType: 'image-png', order: 4 },
    { name: 'Accessoires de pêche', icon: '/uploads/categories/loisirs/level3/accessoires-peche.png', iconType: 'image-png', order: 5 },
    { name: 'Matériel plongée', icon: '/uploads/categories/loisirs/level3/materiel-plongee.png', iconType: 'image-png', order: 6 },
    { name: 'Equipements de chasse', icon: '/uploads/categories/loisirs/level3/equipements-chasse.png', iconType: 'image-png', order: 7 }
  ],

  'Jardinage': [
    { name: 'Mobilier de jardin', icon: '/uploads/categories/loisirs/level3/mobilier-jardin.png', iconType: 'image-png', order: 1 },
    { name: 'Semence', icon: '/uploads/categories/loisirs/level3/semence.png', iconType: 'image-png', order: 2 },
    { name: 'Outillage-Arrosage du jardin', icon: '/uploads/categories/loisirs/level3/outillage-arrosage.png', iconType: 'image-png', order: 3 },
    { name: 'Plantes et fleurs', icon: '/uploads/categories/loisirs/level3/plantes-fleurs.png', iconType: 'image-png', order: 4 },
    { name: 'Équipements Et Matériels', icon: '/uploads/categories/loisirs/level3/equipements-materiels-jardin.png', iconType: 'image-png', order: 5 },
    { name: 'Insecticide', icon: '/uploads/categories/loisirs/level3/insecticide.png', iconType: 'image-png', order: 6 },
    { name: 'Décoration', icon: '/uploads/categories/loisirs/level3/decoration-jardin.png', iconType: 'image-png', order: 7 },
    { name: 'Livres D\'Agriculture Et De Jardinage', icon: '/uploads/categories/loisirs/level3/livres-agriculture-jardin.png', iconType: 'image-png', order: 8 }
  ],

  'Les Jeux de loisirs': [
    { name: 'Babyfoot', icon: '/uploads/categories/loisirs/level3/babyfoot.png', iconType: 'image-png', order: 1 },
    { name: 'Billiard', icon: '/uploads/categories/loisirs/level3/billiard.png', iconType: 'image-png', order: 2 },
    { name: 'Ping pong', icon: '/uploads/categories/loisirs/level3/ping-pong.png', iconType: 'image-png', order: 3 },
    { name: 'Échecs', icon: '/uploads/categories/loisirs/level3/echecs.png', iconType: 'image-png', order: 4 },
    { name: 'Jeux De Société', icon: '/uploads/categories/loisirs/level3/jeux-societe.png', iconType: 'image-png', order: 5 },
    { name: 'Autres Jeux De Loisirs', icon: '/uploads/categories/loisirs/level3/autres-jeux-loisirs.png', iconType: 'image-png', order: 6 }
  ],

  'Barbecue & Grillades': [
    { name: 'Barbecue', icon: '/uploads/categories/loisirs/level3/barbecue.png', iconType: 'image-png', order: 1 },
    { name: 'Charbon', icon: '/uploads/categories/loisirs/level3/charbon.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires', icon: '/uploads/categories/loisirs/level3/accessoires-barbecue.png', iconType: 'image-png', order: 3 }
  ],

  'Vapes & Chichas': [
    { name: 'Vapes & Cigarettes électroniques', icon: '/uploads/categories/loisirs/level3/vapes-cigarettes-electroniques.png', iconType: 'image-png', order: 1 },
    { name: 'Chichas', icon: '/uploads/categories/loisirs/level3/chichas.png', iconType: 'image-png', order: 2 },
    { name: 'Consommables', icon: '/uploads/categories/loisirs/level3/consommables.png', iconType: 'image-png', order: 3 },
    { name: 'Accessoires', icon: '/uploads/categories/loisirs/level3/accessoires-vapes.png', iconType: 'image-png', order: 4 }
  ],

  'Produits & Accessoires d\'été': [
    { name: 'Piscines', icon: '/uploads/categories/loisirs/level3/piscines.png', iconType: 'image-png', order: 1 },
    { name: 'Matelas gonflables', icon: '/uploads/categories/loisirs/level3/matelas-gonflables.png', iconType: 'image-png', order: 2 },
    { name: 'Parasols', icon: '/uploads/categories/loisirs/level3/parasols.png', iconType: 'image-png', order: 3 },
    { name: 'Transats & Chaises pliables', icon: '/uploads/categories/loisirs/level3/transats-chaises-pliables.png', iconType: 'image-png', order: 4 },
    { name: 'Tables', icon: '/uploads/categories/loisirs/level3/tables-ete.png', iconType: 'image-png', order: 5 },
    { name: 'Autres', icon: '/uploads/categories/loisirs/level3/autres-accessoires-ete.png', iconType: 'image-png', order: 6 }
  ],
  'Matériel professionnel': [
    { name: 'Industrie & Fabrication', icon: '/uploads/categories/materiaux/level3/industrie-fabrication.png', iconType: 'image-png', order: 1 },
    { name: 'Alimentaire et Restauration', icon: '/uploads/categories/materiaux/level3/alimentaire-restauration.png', iconType: 'image-png', order: 2 },
    { name: 'Medical', icon: '/uploads/categories/materiaux/level3/medical.png', iconType: 'image-png', order: 3 },
    { name: 'Batiment & Construction', icon: '/uploads/categories/materiaux/level3/batiment-construction.png', iconType: 'image-png', order: 4 },
    { name: 'Matériel électrique', icon: '/uploads/categories/materiaux/level3/materiel-electrique.png', iconType: 'image-png', order: 5 },
    { name: 'Ateliers', icon: '/uploads/categories/materiaux/level3/ateliers.png', iconType: 'image-png', order: 6 },
    { name: 'Stockage et magasinage', icon: '/uploads/categories/materiaux/level3/stockage-magasinage.png', iconType: 'image-png', order: 7 },
    { name: 'Équipement de protection', icon: '/uploads/categories/materiaux/level3/equipement-protection.png', iconType: 'image-png', order: 8 },
    { name: 'Agriculture', icon: '/uploads/categories/materiaux/level3/agriculture.png', iconType: 'image-png', order: 9 },
    { name: 'Réparation & Diagnostic', icon: '/uploads/categories/materiaux/level3/reparation-diagnostic.png', iconType: 'image-png', order: 10 },
    { name: 'Commerce de détail', icon: '/uploads/categories/materiaux/level3/commerce-detail.png', iconType: 'image-png', order: 11 },
    { name: 'Coiffure et cosmétologie', icon: '/uploads/categories/materiaux/level3/coiffure-cosmetologie.png', iconType: 'image-png', order: 12 },
    { name: 'Autres matériels pro', icon: '/uploads/categories/materiaux/level3/autres-materiel-pro.png', iconType: 'image-png', order: 13 }
  ],

  'Outillage professionnel': [
    { name: 'Perceuse', icon: '/uploads/categories/materiaux/level3/perceuse.png', iconType: 'image-png', order: 1 },
    { name: 'Meuleuse', icon: '/uploads/categories/materiaux/level3/meuleuse.png', iconType: 'image-png', order: 2 },
    { name: 'Outillage à main', icon: '/uploads/categories/materiaux/level3/outillage-main.png', iconType: 'image-png', order: 3 },
    { name: 'Scie', icon: '/uploads/categories/materiaux/level3/scie.png', iconType: 'image-png', order: 4 },
    { name: 'Autres', icon: '/uploads/categories/materiaux/level3/autres-outillage.png', iconType: 'image-png', order: 5 }
  ],

  'Matériel Agricole': [
    { name: 'Equipement agricole', icon: '/uploads/categories/materiaux/level3/equipement-agricole.png', iconType: 'image-png', order: 1 },
    { name: 'Arbres', icon: '/uploads/categories/materiaux/level3/arbres.png', iconType: 'image-png', order: 2 },
    { name: 'Terrain Agricole', icon: '/uploads/categories/materiaux/level3/terrain-agricole.png', iconType: 'image-png', order: 3 },
    { name: 'Autre', icon: '/uploads/categories/materiaux/level3/autre-agricole.png', iconType: 'image-png', order: 4 }
  ],
  'Décoration': [
    { name: 'Peinture et calligraphie', icon: '/uploads/categories/meubles/level3/peinture-calligraphie.png', iconType: 'image-png', order: 1 },
    { name: 'Décoration de cuisine', icon: '/uploads/categories/meubles/level3/decoration-cuisine.png', iconType: 'image-png', order: 2 },
    { name: 'Coussins & Housses', icon: '/uploads/categories/meubles/level3/coussins-housses.png', iconType: 'image-png', order: 3 },
    { name: 'Déco de Bain', icon: '/uploads/categories/meubles/level3/deco-bain.png', iconType: 'image-png', order: 4 },
    { name: 'Art et Revêtement Mural', icon: '/uploads/categories/meubles/level3/art-revetement-mural.png', iconType: 'image-png', order: 5 },
    { name: 'Figurines et miniatures', icon: '/uploads/categories/meubles/level3/figurines-miniatures.png', iconType: 'image-png', order: 6 },
    { name: 'Cadres', icon: '/uploads/categories/meubles/level3/cadres.png', iconType: 'image-png', order: 7 },
    { name: 'Horloges', icon: '/uploads/categories/meubles/level3/horloges.png', iconType: 'image-png', order: 8 },
    { name: 'Autres décoration', icon: '/uploads/categories/meubles/level3/autres-decoration.png', iconType: 'image-png', order: 9 }
  ],

  'Vaisselle': [
    { name: 'Pôeles, Casseroles et Marmites', icon: '/uploads/categories/meubles/level3/poeles-casseroles-marmites.png', iconType: 'image-png', order: 1 },
    { name: 'Cocottes', icon: '/uploads/categories/meubles/level3/cocottes.png', iconType: 'image-png', order: 2 },
    { name: 'Plats à four et Plateaux', icon: '/uploads/categories/meubles/level3/plats-four-plateaux.png', iconType: 'image-png', order: 3 },
    { name: 'Assiettes et Bols', icon: '/uploads/categories/meubles/level3/assiettes-bols.png', iconType: 'image-png', order: 4 },
    { name: 'Couverts et ustensiles de cuisine', icon: '/uploads/categories/meubles/level3/couverts-ustensiles.png', iconType: 'image-png', order: 5 },
    { name: 'Services à Boissons', icon: '/uploads/categories/meubles/level3/services-boissons.png', iconType: 'image-png', order: 6 },
    { name: 'Boites et bocaux', icon: '/uploads/categories/meubles/level3/boites-bocaux.png', iconType: 'image-png', order: 7 },
    { name: 'Accessoires de pâtisserie', icon: '/uploads/categories/meubles/level3/accessoires-patisserie.png', iconType: 'image-png', order: 8 },
    { name: 'Vaisselles Artisanales', icon: '/uploads/categories/meubles/level3/vaisselles-artisanales.png', iconType: 'image-png', order: 9 },
    { name: 'Gadget de cuisine', icon: '/uploads/categories/meubles/level3/gadget-cuisine.png', iconType: 'image-png', order: 10 },
    { name: 'Vaisselle enfants', icon: '/uploads/categories/meubles/level3/vaisselle-enfants.png', iconType: 'image-png', order: 11 }
  ],

  'Meubles de bureau': [
    { name: 'Bureaux & Caissons', icon: '/uploads/categories/meubles/level3/bureaux-caissons.png', iconType: 'image-png', order: 1 },
    { name: 'Chaises', icon: '/uploads/categories/meubles/level3/chaises-bureau.png', iconType: 'image-png', order: 2 },
    { name: 'Armoires & Rangements', icon: '/uploads/categories/meubles/level3/armoires-rangements-bureau.png', iconType: 'image-png', order: 3 },
    { name: 'Accessoires de bureaux', icon: '/uploads/categories/meubles/level3/accessoires-bureaux.png', iconType: 'image-png', order: 4 },
    { name: 'Tables de réunion', icon: '/uploads/categories/meubles/level3/tables-reunion.png', iconType: 'image-png', order: 5 }
  ],

  'Puériculture': [
    { name: 'Poussette', icon: '/uploads/categories/meubles/level3/poussette.png', iconType: 'image-png', order: 1 },
    { name: 'Siège Auto', icon: '/uploads/categories/meubles/level3/siege-auto.png', iconType: 'image-png', order: 2 },
    { name: 'Meubles bébé', icon: '/uploads/categories/meubles/level3/meubles-bebe.png', iconType: 'image-png', order: 3 },
    { name: 'Lit bébé', icon: '/uploads/categories/meubles/level3/lit-bebe.png', iconType: 'image-png', order: 4 },
    { name: 'Chaise bébé', icon: '/uploads/categories/meubles/level3/chaise-bebe.png', iconType: 'image-png', order: 5 },
    { name: 'Autres', icon: '/uploads/categories/meubles/level3/autres-puericulture.png', iconType: 'image-png', order: 6 }
  ],

  'Luminaire': [
    { name: 'Lustre', icon: '/uploads/categories/meubles/level3/lustre.png', iconType: 'image-png', order: 1 },
    { name: 'Lampadaire', icon: '/uploads/categories/meubles/level3/lampadaire.png', iconType: 'image-png', order: 2 },
    { name: 'Éclairage extérieur', icon: '/uploads/categories/meubles/level3/eclairage-exterieur.png', iconType: 'image-png', order: 3 },
    { name: 'Autres', icon: '/uploads/categories/meubles/level3/autres-luminaire.png', iconType: 'image-png', order: 4 }
  ],





  'Pièces automobiles': [
    { name: 'Moteur & Transmission', icon: '/uploads/categories/pieces-detachees/level3/moteur-transmission.png', iconType: 'image-png', order: 1 },
    { name: 'Suspension & Direction', icon: '/uploads/categories/pieces-detachees/level3/suspension-direction.png', iconType: 'image-png', order: 2 },
    { name: 'Pièces intérieur', icon: '/uploads/categories/pieces-detachees/level3/pieces-interieur.png', iconType: 'image-png', order: 3 },
    { name: 'Carrosserie', icon: '/uploads/categories/pieces-detachees/level3/carrosserie.png', iconType: 'image-png', order: 4 },
    { name: 'Optiques & Éclairage', icon: '/uploads/categories/pieces-detachees/level3/optiques-eclairage.png', iconType: 'image-png', order: 5 },
    { name: 'Vitres & pare-brise', icon: '/uploads/categories/pieces-detachees/level3/vitres-pare-brise.png', iconType: 'image-png', order: 6 },
    { name: 'Pneus & Jantes', icon: '/uploads/categories/pieces-detachees/level3/pneus-jantes.png', iconType: 'image-png', order: 7 },
    { name: 'Housses & Tapis', icon: '/uploads/categories/pieces-detachees/level3/housses-tapis.png', iconType: 'image-png', order: 8 },
    { name: 'Batteries', icon: '/uploads/categories/pieces-detachees/level3/batteries.png', iconType: 'image-png', order: 9 },
    { name: 'Sono & Multimédia', icon: '/uploads/categories/pieces-detachees/level3/sono-multimedia.png', iconType: 'image-png', order: 10 },
    { name: 'Sièges auto', icon: '/uploads/categories/pieces-detachees/level3/sieges-auto.png', iconType: 'image-png', order: 11 },
    { name: 'Autres pièces auto', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-auto.png', iconType: 'image-png', order: 12 }
  ],

  'Pièces moto': [
    { name: 'Casques & Protections', icon: '/uploads/categories/pieces-detachees/level3/casques-protections.png', iconType: 'image-png', order: 1 },
    { name: 'Pneus & Jantes', icon: '/uploads/categories/pieces-detachees/level3/pneus-jantes-moto.png', iconType: 'image-png', order: 2 },
    { name: 'Optiques & Éclairage', icon: '/uploads/categories/pieces-detachees/level3/optiques-eclairage-moto.png', iconType: 'image-png', order: 3 },
    { name: 'Accessoires', icon: '/uploads/categories/pieces-detachees/level3/accessoires-moto.png', iconType: 'image-png', order: 4 },
    { name: 'Autres pièces moto', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-moto.png', iconType: 'image-png', order: 5 }
  ],

  'Pièces bateaux': [
    { name: 'Moteurs', icon: '/uploads/categories/pieces-detachees/level3/moteurs-bateaux.png', iconType: 'image-png', order: 1 },
    { name: 'Pièces', icon: '/uploads/categories/pieces-detachees/level3/pieces-bateaux.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires', icon: '/uploads/categories/pieces-detachees/level3/accessoires-bateaux.png', iconType: 'image-png', order: 3 },
    { name: 'Autres pièces bateaux', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-bateaux.png', iconType: 'image-png', order: 4 }
  ],
  'Football': [
    { name: 'Ballons et Buts', icon: '/uploads/categories/sport/level3/ballons-buts.png', iconType: 'image-png', order: 1 },
    { name: 'Équipements et accessoires', icon: '/uploads/categories/sport/level3/equipements-accessoires-foot.png', iconType: 'image-png', order: 2 },
    { name: 'Chaussures de Football', icon: '/uploads/categories/sport/level3/chaussures-football.png', iconType: 'image-png', order: 3 },
    { name: 'Vêtements de football', icon: '/uploads/categories/sport/level3/vetements-football.png', iconType: 'image-png', order: 4 }
  ],

  'Hand/Voley/ Basket-Ball': [
    { name: 'Équipements et accessoires', icon: '/uploads/categories/sport/level3/equipements-accessoires-basket.png', iconType: 'image-png', order: 1 },
    { name: 'Ballons Buts et Filets', icon: '/uploads/categories/sport/level3/ballons-buts-filets.png', iconType: 'image-png', order: 2 },
    { name: 'Chaussures', icon: '/uploads/categories/sport/level3/chaussures-basket.png', iconType: 'image-png', order: 3 },
    { name: 'Vêtements', icon: '/uploads/categories/sport/level3/vetements-basket.png', iconType: 'image-png', order: 4 }
  ],

  'Sport de combat': [
    { name: 'Tenue', icon: '/uploads/categories/sport/level3/tenue-combat.png', iconType: 'image-png', order: 1 },
    { name: 'Gants et casques', icon: '/uploads/categories/sport/level3/gants-casques.png', iconType: 'image-png', order: 2 },
    { name: 'Autres accessoires', icon: '/uploads/categories/sport/level3/autres-accessoires-combat.png', iconType: 'image-png', order: 3 }
  ],

  'Fitness - Musculation': [
    { name: 'Bancs et presses de musculation', icon: '/uploads/categories/sport/level3/bancs-presses.png', iconType: 'image-png', order: 1 },
    { name: 'Poids et haltères', icon: '/uploads/categories/sport/level3/poids-halteres.png', iconType: 'image-png', order: 2 },
    { name: 'Tapis roulants', icon: '/uploads/categories/sport/level3/tapis-roulants.png', iconType: 'image-png', order: 3 },
    { name: 'Vélos et rameurs', icon: '/uploads/categories/sport/level3/velos-rameurs.png', iconType: 'image-png', order: 4 },
    { name: 'Autres équipements', icon: '/uploads/categories/sport/level3/autres-equipements-fitness.png', iconType: 'image-png', order: 5 }
  ],

  'Natation': [
    { name: 'Lunettes', icon: '/uploads/categories/sport/level3/lunettes-natation.png', iconType: 'image-png', order: 1 },
    { name: 'Bonnets', icon: '/uploads/categories/sport/level3/bonnets.png', iconType: 'image-png', order: 2 },
    { name: 'Palmes', icon: '/uploads/categories/sport/level3/palmes.png', iconType: 'image-png', order: 3 },
    { name: 'Planches et flotteurs', icon: '/uploads/categories/sport/level3/planches-flotteurs.png', iconType: 'image-png', order: 4 },
    { name: 'Maillots et combinaisons', icon: '/uploads/categories/sport/level3/maillots-combinaisons.png', iconType: 'image-png', order: 5 },
    { name: 'Autres accessoires', icon: '/uploads/categories/sport/level3/autres-accessoires-natation.png', iconType: 'image-png', order: 6 }
  ],

  'Vélos et trotinettes': [
    { name: 'Vêtements et chaussures', icon: '/uploads/categories/sport/level3/vetements-chaussures-velo.png', iconType: 'image-png', order: 1 },
    { name: 'Vélos', icon: '/uploads/categories/sport/level3/velos.png', iconType: 'image-png', order: 2 },
    { name: 'Trotinettes', icon: '/uploads/categories/sport/level3/trotinettes.png', iconType: 'image-png', order: 3 },
    { name: 'Équipements et accessoires', icon: '/uploads/categories/sport/level3/equipements-accessoires-velo.png', iconType: 'image-png', order: 4 }
  ],

  'Sports de raquette': [
    { name: 'Tennis', icon: '/uploads/categories/sport/level3/tennis.png', iconType: 'image-png', order: 1 },
    { name: 'Tennis de table', icon: '/uploads/categories/sport/level3/tennis-table.png', iconType: 'image-png', order: 2 },
    { name: 'Autre', icon: '/uploads/categories/sport/level3/autre-raquette.png', iconType: 'image-png', order: 3 }
  ],
  'Sport': [
    // CON SUBNIVEL (hasSublevel: true)
    { name: 'Football', icon: '/uploads/categories/sport/level2/football.png', iconType: 'image-png', iconColor: '#FF5722', order: 1, hasSublevel: true },
    { name: 'Hand/Voley/ Basket-Ball', icon: '/uploads/categories/sport/level2/hand-voley-basket.png', iconType: 'image-png', iconColor: '#FF5722', order: 2, hasSublevel: true },
    { name: 'Sport de combat', icon: '/uploads/categories/sport/level2/sport-combat.png', iconType: 'image-png', iconColor: '#FF5722', order: 3, hasSublevel: true },
    { name: 'Fitness - Musculation', icon: '/uploads/categories/sport/level2/fitness-musculation.png', iconType: 'image-png', iconColor: '#FF5722', order: 4, hasSublevel: true },
    { name: 'Natation', icon: '/uploads/categories/sport/level2/natation.png', iconType: 'image-png', iconColor: '#FF5722', order: 5, hasSublevel: true },
    { name: 'Vélos et trotinettes', icon: '/uploads/categories/sport/level2/velos-trotinettes.png', iconType: 'image-png', iconColor: '#FF5722', order: 6, hasSublevel: true },
    { name: 'Sports de raquette', icon: '/uploads/categories/sport/level2/sports-raquette.png', iconType: 'image-png', iconColor: '#FF5722', order: 7, hasSublevel: true },

    // SIN SUBNIVEL (hasSublevel: false)
    { name: 'Sport aquatiques', icon: '/uploads/categories/sport/level2/sport-aquatiques.png', iconType: 'image-png', iconColor: '#FF5722', order: 8, hasSublevel: false },
    { name: 'Équitation', icon: '/uploads/categories/sport/level2/equitation.png', iconType: 'image-png', iconColor: '#FF5722', order: 9, hasSublevel: false },
    { name: 'Pétanque', icon: '/uploads/categories/sport/level2/petanque.png', iconType: 'image-png', iconColor: '#FF5722', order: 10, hasSublevel: false },
    { name: 'Autres', icon: '/uploads/categories/sport/level2/autres-sports.png', iconType: 'image-png', iconColor: '#FF5722', order: 11, hasSublevel: false }
  ],
  'Cosmétiques & Beauté': [
    { name: 'Soins du corps', icon: '/uploads/categories/sante-beaute/level3/soins-corps.png', iconType: 'image-png', order: 1 },
    { name: 'Savons & Gels douche', icon: '/uploads/categories/sante-beaute/level3/savons-gels-douche.png', iconType: 'image-png', order: 2 },
    { name: 'Soins visage', icon: '/uploads/categories/sante-beaute/level3/soins-visage.png', iconType: 'image-png', order: 3 },
    { name: 'Maquillage', icon: '/uploads/categories/sante-beaute/level3/maquillage.png', iconType: 'image-png', order: 4 },
    { name: 'Produits Solaires & Bronzage', icon: '/uploads/categories/sante-beaute/level3/produits-solaires-bronzage.png', iconType: 'image-png', order: 5 },
    { name: 'Instruments & Outils de beauté', icon: '/uploads/categories/sante-beaute/level3/instruments-outils-beaute.png', iconType: 'image-png', order: 6 },
    { name: 'Manucure et pedicure', icon: '/uploads/categories/sante-beaute/level3/manucure-pedicure.png', iconType: 'image-png', order: 7 },
    { name: 'Rasage et Épilation', icon: '/uploads/categories/sante-beaute/level3/rasage-epilation.png', iconType: 'image-png', order: 8 },
    { name: 'Hygiène', icon: '/uploads/categories/sante-beaute/level3/hygiene.png', iconType: 'image-png', order: 9 },
    { name: 'Coiffure', icon: '/uploads/categories/sante-beaute/level3/coiffure.png', iconType: 'image-png', order: 10 },
    { name: 'Soins bébé', icon: '/uploads/categories/sante-beaute/level3/soins-bebe.png', iconType: 'image-png', order: 11 },
    { name: 'Autres produits', icon: '/uploads/categories/sante-beaute/level3/autres-produits-cosmetiques.png', iconType: 'image-png', order: 12 }
  ],

  'Parapharmacie & Santé': [
    { name: 'Dispositifs médicaux', icon: '/uploads/categories/sante-beaute/level3/dispositifs-medicaux.png', iconType: 'image-png', order: 1 },
    { name: 'Complément Alimentaire', icon: '/uploads/categories/sante-beaute/level3/complement-alimentaire.png', iconType: 'image-png', order: 2 },
    { name: 'Matériel Médical', icon: '/uploads/categories/sante-beaute/level3/materiel-medical.png', iconType: 'image-png', order: 3 },
    { name: 'Aliments Diététiques', icon: '/uploads/categories/sante-beaute/level3/aliments-dietetiques.png', iconType: 'image-png', order: 4 }
  ],
  'Pièces automobiles': [
    { name: 'Moteur & Transmission', icon: '/uploads/categories/pieces-detachees/level3/moteur-transmission.png', iconType: 'image-png', order: 1 },
    { name: 'Suspension & Direction', icon: '/uploads/categories/pieces-detachees/level3/suspension-direction.png', iconType: 'image-png', order: 2 },
    { name: 'Pièces intérieur', icon: '/uploads/categories/pieces-detachees/level3/pieces-interieur.png', iconType: 'image-png', order: 3 },
    { name: 'Carrosserie', icon: '/uploads/categories/pieces-detachees/level3/carrosserie.png', iconType: 'image-png', order: 4 },
    { name: 'Optiques & Éclairage', icon: '/uploads/categories/pieces-detachees/level3/optiques-eclairage.png', iconType: 'image-png', order: 5 },
    { name: 'Vitres & pare-brise', icon: '/uploads/categories/pieces-detachees/level3/vitres-pare-brise.png', iconType: 'image-png', order: 6 },
    { name: 'Pneus & Jantes', icon: '/uploads/categories/pieces-detachees/level3/pneus-jantes.png', iconType: 'image-png', order: 7 },
    { name: 'Housses & Tapis', icon: '/uploads/categories/pieces-detachees/level3/housses-tapis.png', iconType: 'image-png', order: 8 },
    { name: 'Batteries', icon: '/uploads/categories/pieces-detachees/level3/batteries.png', iconType: 'image-png', order: 9 },
    { name: 'Sono & Multimédia', icon: '/uploads/categories/pieces-detachees/level3/sono-multimedia.png', iconType: 'image-png', order: 10 },
    { name: 'Sièges auto', icon: '/uploads/categories/pieces-detachees/level3/sieges-auto.png', iconType: 'image-png', order: 11 },
    { name: 'Autres pièces auto', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-auto.png', iconType: 'image-png', order: 12 }
  ],

  'Pièces moto': [
    { name: 'Casques & Protections', icon: '/uploads/categories/pieces-detachees/level3/casques-protections.png', iconType: 'image-png', order: 1 },
    { name: 'Pneus & Jantes', icon: '/uploads/categories/pieces-detachees/level3/pneus-jantes-moto.png', iconType: 'image-png', order: 2 },
    { name: 'Optiques & Éclairage', icon: '/uploads/categories/pieces-detachees/level3/optiques-eclairage-moto.png', iconType: 'image-png', order: 3 },
    { name: 'Accessoires', icon: '/uploads/categories/pieces-detachees/level3/accessoires-moto.png', iconType: 'image-png', order: 4 },
    { name: 'Autres pièces moto', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-moto.png', iconType: 'image-png', order: 5 }
  ],

  'Pièces bateaux': [
    { name: 'Moteurs', icon: '/uploads/categories/pieces-detachees/level3/moteurs-bateaux.png', iconType: 'image-png', order: 1 },
    { name: 'Pièces', icon: '/uploads/categories/pieces-detachees/level3/pieces-bateaux.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires', icon: '/uploads/categories/pieces-detachees/level3/accessoires-bateaux.png', iconType: 'image-png', order: 3 },
    { name: 'Autres pièces bateaux', icon: '/uploads/categories/pieces-detachees/level3/autre-pieces-bateaux.png', iconType: 'image-png', order: 4 }
  ],
  // Agrega estas propiedades al objeto articlesData
  'Ordinateurs portables': [
    { name: 'Pc Portable', icon: '/uploads/categories/informatique/level3/pc-portable.png', iconType: 'image-png', order: 1 },
    { name: 'Macbooks', icon: '/uploads/categories/informatique/level3/macbooks.png', iconType: 'image-png', order: 2 }
  ],

  'Ordinateurs de bureau': [
    { name: 'Pc de bureau', icon: '/uploads/categories/informatique/level3/pc-bureau.png', iconType: 'image-png', order: 1 },
    { name: 'Unités centrales', icon: '/uploads/categories/informatique/level3/unites-centrales.png', iconType: 'image-png', order: 2 },
    { name: 'All In One', icon: '/uploads/categories/informatique/level3/all-in-one.png', iconType: 'image-png', order: 3 }
  ],

  'Composants PC fixe': [
    { name: 'Cartes mère', icon: '/uploads/categories/informatique/level3/cartes-mere.png', iconType: 'image-png', order: 1 },
    { name: 'Processeurs', icon: '/uploads/categories/informatique/level3/processeurs.png', iconType: 'image-png', order: 2 },
    { name: 'RAM', icon: '/uploads/categories/informatique/level3/ram.png', iconType: 'image-png', order: 3 },
    { name: 'Disques dur', icon: '/uploads/categories/informatique/level3/disques-dur.png', iconType: 'image-png', order: 4 },
    { name: 'Cartes graphique', icon: '/uploads/categories/informatique/level3/cartes-graphique.png', iconType: 'image-png', order: 5 },
    { name: 'Alimentations & Boitiers', icon: '/uploads/categories/informatique/level3/alimentations-boitiers.png', iconType: 'image-png', order: 6 },
    { name: 'Refroidissement', icon: '/uploads/categories/informatique/level3/refroidissement.png', iconType: 'image-png', order: 7 },
    { name: 'Lecteurs & Graveurs CD', icon: '/uploads/categories/informatique/level3/lecteurs-graveurs-cd.png', iconType: 'image-png', order: 8 },
    { name: 'Autres', icon: '/uploads/categories/informatique/level3/autres-composants-fixe.png', iconType: 'image-png', order: 9 }
  ],

  'Composants PC portable': [
    { name: 'Chargeurs', icon: '/uploads/categories/informatique/level3/chargeurs.png', iconType: 'image-png', order: 1 },
    { name: 'Batteries', icon: '/uploads/categories/informatique/level3/batteries.png', iconType: 'image-png', order: 2 },
    { name: 'Ecrans', icon: '/uploads/categories/informatique/level3/ecrans-portable.png', iconType: 'image-png', order: 3 },
    { name: 'Claviers & Touchpads', icon: '/uploads/categories/informatique/level3/claviers-touchpads.png', iconType: 'image-png', order: 4 },
    { name: 'Disques Dur', icon: '/uploads/categories/informatique/level3/disques-dur-portable.png', iconType: 'image-png', order: 5 },
    { name: 'RAM', icon: '/uploads/categories/informatique/level3/ram-portable.png', iconType: 'image-png', order: 6 },
    { name: 'Refroidissement', icon: '/uploads/categories/informatique/level3/refroidissement-portable.png', iconType: 'image-png', order: 7 },
    { name: 'Cartes mère', icon: '/uploads/categories/informatique/level3/cartes-mere-portable.png', iconType: 'image-png', order: 8 },
    { name: 'Processeurs', icon: '/uploads/categories/informatique/level3/processeurs-portable.png', iconType: 'image-png', order: 9 },
    { name: 'Cartes graphique', icon: '/uploads/categories/informatique/level3/cartes-graphique-portable.png', iconType: 'image-png', order: 10 },
    { name: 'Lecteurs & Graveurs', icon: '/uploads/categories/informatique/level3/lecteurs-graveurs-portable.png', iconType: 'image-png', order: 11 },
    { name: 'Baffles & Webcams', icon: '/uploads/categories/informatique/level3/baffles-webcams.png', iconType: 'image-png', order: 12 },
    { name: 'Autres', icon: '/uploads/categories/informatique/level3/autres-composants-portable.png', iconType: 'image-png', order: 13 }
  ],

  'Composants serveur': [
    { name: 'Cartes mère', icon: '/uploads/categories/informatique/level3/cartes-mere-serveur.png', iconType: 'image-png', order: 1 },
    { name: 'Processeurs', icon: '/uploads/categories/informatique/level3/processeurs-serveur.png', iconType: 'image-png', order: 2 },
    { name: 'RAM', icon: '/uploads/categories/informatique/level3/ram-serveur.png', iconType: 'image-png', order: 3 },
    { name: 'Disques dur', icon: '/uploads/categories/informatique/level3/disques-dur-serveur.png', iconType: 'image-png', order: 4 },
    { name: 'Cartes réseau', icon: '/uploads/categories/informatique/level3/cartes-reseau-serveur.png', iconType: 'image-png', order: 5 },
    { name: 'Alimentations', icon: '/uploads/categories/informatique/level3/alimentations-serveur.png', iconType: 'image-png', order: 6 },
    { name: 'Refroidissement', icon: '/uploads/categories/informatique/level3/refroidissement-serveur.png', iconType: 'image-png', order: 7 },
    { name: 'Cartes graphique', icon: '/uploads/categories/informatique/level3/cartes-graphique-serveur.png', iconType: 'image-png', order: 8 },
    { name: 'Autres', icon: '/uploads/categories/informatique/level3/autres-composants-serveur.png', iconType: 'image-png', order: 9 }
  ],

  'Imprimantes & Cartouches': [
    { name: 'Imprimantes jet d\'encre', icon: '/uploads/categories/informatique/level3/imprimantes-jet-encre.png', iconType: 'image-png', order: 1 },
    { name: 'Imprimantes Laser', icon: '/uploads/categories/informatique/level3/imprimantes-laser.png', iconType: 'image-png', order: 2 },
    { name: 'Imprimantes matricielles', icon: '/uploads/categories/informatique/level3/imprimantes-matricielles.png', iconType: 'image-png', order: 3 },
    { name: 'Codes à barre & Etiqueteuses', icon: '/uploads/categories/informatique/level3/codes-barre-etiqueteuses.png', iconType: 'image-png', order: 4 },
    { name: 'Imprimantes photo & badges', icon: '/uploads/categories/informatique/level3/imprimantes-photo-badges.png', iconType: 'image-png', order: 5 },
    { name: 'Photocopieuses professionnelles', icon: '/uploads/categories/informatique/level3/photocopieuses-professionnelles.png', iconType: 'image-png', order: 6 },
    { name: 'Imprimantes 3D', icon: '/uploads/categories/informatique/level3/imprimantes-3d.png', iconType: 'image-png', order: 7 },
    { name: 'Cartouches & Toners', icon: '/uploads/categories/informatique/level3/cartouches-toners.png', iconType: 'image-png', order: 8 },
    { name: 'Autre', icon: '/uploads/categories/informatique/level3/autre-imprimantes.png', iconType: 'image-png', order: 9 }
  ],

  'Réseau & Connexion': [
    { name: 'Modems & Routeurs', icon: '/uploads/categories/informatique/level3/modems-routeurs.png', iconType: 'image-png', order: 1 },
    { name: 'Switchs', icon: '/uploads/categories/informatique/level3/switchs.png', iconType: 'image-png', order: 2 },
    { name: 'Point d\'accès wifi', icon: '/uploads/categories/informatique/level3/point-acces-wifi.png', iconType: 'image-png', order: 3 },
    { name: 'Répéteur Wi-Fi', icon: '/uploads/categories/informatique/level3/repeater-wifi.png', iconType: 'image-png', order: 4 },
    { name: 'Cartes réseau', icon: '/uploads/categories/informatique/level3/cartes-reseau-connexion.png', iconType: 'image-png', order: 5 },
    { name: 'Autre', icon: '/uploads/categories/informatique/level3/autre-reseau.png', iconType: 'image-png', order: 6 }
  ],

  'Stockage externe & Racks': [
    { name: 'Disques durs', icon: '/uploads/categories/informatique/level3/disques-durs-externes.png', iconType: 'image-png', order: 1 },
    { name: 'Flash disque', icon: '/uploads/categories/informatique/level3/flash-disque.png', iconType: 'image-png', order: 2 },
    { name: 'Carte mémoire', icon: '/uploads/categories/informatique/level3/carte-memoire.png', iconType: 'image-png', order: 3 },
    { name: 'Rack', icon: '/uploads/categories/informatique/level3/rack.png', iconType: 'image-png', order: 4 }
  ],







  // VÊTEMENTS
  'Vêtements Homme': [
    { name: 'Hauts & Chemises', icon: '/uploads/categories/vetements/level3/hauts-chemises-homme.png', iconType: 'image-png', order: 1 },
    { name: 'Jeans & Pantalons', icon: '/uploads/categories/vetements/level3/jeans-pantalons-homme.png', iconType: 'image-png', order: 2 },
    { name: 'Shorts & Pantacourts', icon: '/uploads/categories/vetements/level3/shorts-pantacourts-homme.png', iconType: 'image-png', order: 3 },
    { name: 'Vestes & Gilets', icon: '/uploads/categories/vetements/level3/vestes-gilets-homme.png', iconType: 'image-png', order: 4 },
    { name: 'Costumes & Blazers', icon: '/uploads/categories/vetements/level3/costumes-blazers-homme.png', iconType: 'image-png', order: 5 },
    { name: 'Survetements', icon: '/uploads/categories/vetements/level3/survetements-homme.png', iconType: 'image-png', order: 6 },
    { name: 'Kamiss', icon: '/uploads/categories/vetements/level3/kamiss-homme.png', iconType: 'image-png', order: 7 },
    { name: 'Sous vêtements', icon: '/uploads/categories/vetements/level3/sous-vetements-homme.png', iconType: 'image-png', order: 8 },
    { name: 'Pyjamas', icon: '/uploads/categories/vetements/level3/pyjamas-homme.png', iconType: 'image-png', order: 9 },
    { name: 'Maillots de bain', icon: '/uploads/categories/vetements/level3/maillots-bain-homme.png', iconType: 'image-png', order: 10 },
    { name: 'Casquettes & Chapeaux', icon: '/uploads/categories/vetements/level3/casquettes-chapeaux-homme.png', iconType: 'image-png', order: 11 },
    { name: 'Chaussettes', icon: '/uploads/categories/vetements/level3/chaussettes-homme.png', iconType: 'image-png', order: 12 },
    { name: 'Ceintures', icon: '/uploads/categories/vetements/level3/ceintures-homme.png', iconType: 'image-png', order: 13 },
    { name: 'Gants', icon: '/uploads/categories/vetements/level3/gants-homme.png', iconType: 'image-png', order: 14 },
    { name: 'Cravates', icon: '/uploads/categories/vetements/level3/cravates-homme.png', iconType: 'image-png', order: 15 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-vetements-homme.png', iconType: 'image-png', order: 16 }
  ],
  'Vêtements Femme': [
    { name: 'Hauts & Chemises', icon: '/uploads/categories/vetements/level3/hauts-chemises-femme.png', iconType: 'image-png', order: 1 },
    { name: 'Jeans & Pantalons', icon: '/uploads/categories/vetements/level3/jeans-pantalons-femme.png', iconType: 'image-png', order: 2 },
    { name: 'Shorts & Pantacourts', icon: '/uploads/categories/vetements/level3/shorts-pantacourts-femme.png', iconType: 'image-png', order: 3 },
    { name: 'Vestes & Gilets', icon: '/uploads/categories/vetements/level3/vestes-gilets-femme.png', iconType: 'image-png', order: 4 },
    { name: 'Ensembles', icon: '/uploads/categories/vetements/level3/ensembles-femme.png', iconType: 'image-png', order: 5 },
    { name: 'Abayas & Hijabs', icon: '/uploads/categories/vetements/level3/abayas-hijabs-femme.png', iconType: 'image-png', order: 6 },
    { name: 'Mariages & Fêtes', icon: '/uploads/categories/vetements/level3/mariages-fetes-femme.png', iconType: 'image-png', order: 7 },
    { name: 'Maternité', icon: '/uploads/categories/vetements/level3/maternite-femme.png', iconType: 'image-png', order: 8 },
    { name: 'Robes', icon: '/uploads/categories/vetements/level3/robes-femme.png', iconType: 'image-png', order: 9 },
    { name: 'Jupes', icon: '/uploads/categories/vetements/level3/jupes-femme.png', iconType: 'image-png', order: 10 },
    { name: 'Joggings & Survetements', icon: '/uploads/categories/vetements/level3/joggings-survetements-femme.png', iconType: 'image-png', order: 11 },
    { name: 'Leggings', icon: '/uploads/categories/vetements/level3/leggings-femme.png', iconType: 'image-png', order: 12 },
    { name: 'Sous-vêtements & Lingerie', icon: '/uploads/categories/vetements/level3/sous-vetements-lingerie-femme.png', iconType: 'image-png', order: 13 },
    { name: 'Pyjamas', icon: '/uploads/categories/vetements/level3/pyjamas-femme.png', iconType: 'image-png', order: 14 },
    { name: 'Peignoirs', icon: '/uploads/categories/vetements/level3/peignoirs-femme.png', iconType: 'image-png', order: 15 },
    { name: 'Maillots de bain', icon: '/uploads/categories/vetements/level3/maillots-bain-femme.png', iconType: 'image-png', order: 16 },
    { name: 'Casquettes & Chapeaux', icon: '/uploads/categories/vetements/level3/casquettes-chapeaux-femme.png', iconType: 'image-png', order: 17 },
    { name: 'Chaussettes & Collants', icon: '/uploads/categories/vetements/level3/chaussettes-collants-femme.png', iconType: 'image-png', order: 18 },
    { name: 'Foulards & Echarpes', icon: '/uploads/categories/vetements/level3/foulards-echarpes-femme.png', iconType: 'image-png', order: 19 },
    { name: 'Ceintures', icon: '/uploads/categories/vetements/level3/ceintures-femme.png', iconType: 'image-png', order: 20 },
    { name: 'Gants', icon: '/uploads/categories/vetements/level3/gants-femme.png', iconType: 'image-png', order: 21 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-vetements-femme.png', iconType: 'image-png', order: 22 }
  ],
  'Chaussures Homme': [
    { name: 'Basquettes', icon: '/uploads/categories/vetements/level3/basquettes-homme.png', iconType: 'image-png', order: 1 },
    { name: 'Bottes', icon: '/uploads/categories/vetements/level3/bottes-homme.png', iconType: 'image-png', order: 2 },
    { name: 'Classiques', icon: '/uploads/categories/vetements/level3/classiques-homme.png', iconType: 'image-png', order: 3 },
    { name: 'Mocassins', icon: '/uploads/categories/vetements/level3/mocassins-homme.png', iconType: 'image-png', order: 4 },
    { name: 'Sandales', icon: '/uploads/categories/vetements/level3/sandales-homme.png', iconType: 'image-png', order: 5 },
    { name: 'Tangues & Pantoufles', icon: '/uploads/categories/vetements/level3/tangues-pantoufles-homme.png', iconType: 'image-png', order: 6 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-chaussures-homme.png', iconType: 'image-png', order: 7 }
  ],
  'Chaussures Femme': [
    { name: 'Basquettes', icon: '/uploads/categories/vetements/level3/basquettes-femme.png', iconType: 'image-png', order: 1 },
    { name: 'Sandales', icon: '/uploads/categories/vetements/level3/sandales-femme.png', iconType: 'image-png', order: 2 },
    { name: 'Bottes', icon: '/uploads/categories/vetements/level3/bottes-femme.png', iconType: 'image-png', order: 3 },
    { name: 'Escarpins', icon: '/uploads/categories/vetements/level3/escarpins-femme.png', iconType: 'image-png', order: 4 },
    { name: 'Ballerines', icon: '/uploads/categories/vetements/level3/ballerines-femme.png', iconType: 'image-png', order: 5 },
    { name: 'Tangues & Pantoufles', icon: '/uploads/categories/vetements/level3/tangues-pantoufles-femme.png', iconType: 'image-png', order: 6 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-chaussures-femme.png', iconType: 'image-png', order: 7 }
  ],
  'Garçons': [
    { name: 'Chaussures', icon: '/uploads/categories/vetements/level3/chaussures-garcons.png', iconType: 'image-png', order: 1 },
    { name: 'Hauts & Chemises', icon: '/uploads/categories/vetements/level3/hauts-chemises-garcons.png', iconType: 'image-png', order: 2 },
    { name: 'Pantalons & Shorts', icon: '/uploads/categories/vetements/level3/pantalons-shorts-garcons.png', iconType: 'image-png', order: 3 },
    { name: 'Vestes & Gilets', icon: '/uploads/categories/vetements/level3/vestes-gilets-garcons.png', iconType: 'image-png', order: 4 },
    { name: 'Costumes', icon: '/uploads/categories/vetements/level3/costumes-garcons.png', iconType: 'image-png', order: 5 },
    { name: 'Survetements & Joggings', icon: '/uploads/categories/vetements/level3/survetements-joggings-garcons.png', iconType: 'image-png', order: 6 },
    { name: 'Pyjamas', icon: '/uploads/categories/vetements/level3/pyjamas-garcons.png', iconType: 'image-png', order: 7 },
    { name: 'Sous-vêtements', icon: '/uploads/categories/vetements/level3/sous-vetements-garcons.png', iconType: 'image-png', order: 8 },
    { name: 'Maillots de bain', icon: '/uploads/categories/vetements/level3/maillots-bain-garcons.png', iconType: 'image-png', order: 9 },
    { name: 'Kamiss', icon: '/uploads/categories/vetements/level3/kamiss-garcons.png', iconType: 'image-png', order: 10 },
    { name: 'Casquettes & Chapeaux', icon: '/uploads/categories/vetements/level3/casquettes-chapeaux-garcons.png', iconType: 'image-png', order: 11 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-garcons.png', iconType: 'image-png', order: 12 }
  ],
  'Filles': [
    { name: 'Chaussures', icon: '/uploads/categories/vetements/level3/chaussures-filles.png', iconType: 'image-png', order: 1 },
    { name: 'Hauts & Chemises', icon: '/uploads/categories/vetements/level3/hauts-chemises-filles.png', iconType: 'image-png', order: 2 },
    { name: 'Pantalons & Shorts', icon: '/uploads/categories/vetements/level3/pantalons-shorts-filles.png', iconType: 'image-png', order: 3 },
    { name: 'Vestes & Gilets', icon: '/uploads/categories/vetements/level3/vestes-gilets-filles.png', iconType: 'image-png', order: 4 },
    { name: 'Robes', icon: '/uploads/categories/vetements/level3/robes-filles.png', iconType: 'image-png', order: 5 },
    { name: 'Jupes', icon: '/uploads/categories/vetements/level3/jupes-filles.png', iconType: 'image-png', order: 6 },
    { name: 'Ensembles', icon: '/uploads/categories/vetements/level3/ensembles-filles.png', iconType: 'image-png', order: 7 },
    { name: 'Joggings & Survetements', icon: '/uploads/categories/vetements/level3/joggings-survetements-filles.png', iconType: 'image-png', order: 8 },
    { name: 'Pyjamas', icon: '/uploads/categories/vetements/level3/pyjamas-filles.png', iconType: 'image-png', order: 9 },
    { name: 'Sous-vêtements', icon: '/uploads/categories/vetements/level3/sous-vetements-filles.png', iconType: 'image-png', order: 10 },
    { name: 'Leggings & Collants', icon: '/uploads/categories/vetements/level3/leggings-collants-filles.png', iconType: 'image-png', order: 11 },
    { name: 'Maillots de bain', icon: '/uploads/categories/vetements/level3/maillots-bain-filles.png', iconType: 'image-png', order: 12 },
    { name: 'Casquettes & Chapeaux', icon: '/uploads/categories/vetements/level3/casquettes-chapeaux-filles.png', iconType: 'image-png', order: 13 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-filles.png', iconType: 'image-png', order: 14 }
  ],
  'Bébé': [
    { name: 'Vêtements', icon: '/uploads/categories/vetements/level3/vetements-bebe.png', iconType: 'image-png', order: 1 },
    { name: 'Chaussures', icon: '/uploads/categories/vetements/level3/chaussures-bebe.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires', icon: '/uploads/categories/vetements/level3/accessoires-bebe.png', iconType: 'image-png', order: 3 }
  ],
  'Sacs & Valises': [
    { name: 'Pochettes & Portefeuilles', icon: '/uploads/categories/vetements/level3/pochettes-portefeuilles.png', iconType: 'image-png', order: 1 },
    { name: 'Sacs à main', icon: '/uploads/categories/vetements/level3/sacs-main.png', iconType: 'image-png', order: 2 },
    { name: 'Sacs à dos', icon: '/uploads/categories/vetements/level3/sacs-dos.png', iconType: 'image-png', order: 3 },
    { name: 'Sacs professionnels', icon: '/uploads/categories/vetements/level3/sacs-professionnels.png', iconType: 'image-png', order: 4 },
    { name: 'Valises', icon: '/uploads/categories/vetements/level3/valises.png', iconType: 'image-png', order: 5 },
    { name: 'Cabas de sport', icon: '/uploads/categories/vetements/level3/cabas-sport.png', iconType: 'image-png', order: 6 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-sacs.png', iconType: 'image-png', order: 7 }
  ],
  'Montres': [
    { name: 'Hommes', icon: '/uploads/categories/vetements/level3/montres-hommes.png', iconType: 'image-png', order: 1 },
    { name: 'Femmes', icon: '/uploads/categories/vetements/level3/montres-femmes.png', iconType: 'image-png', order: 2 }
  ],
  'Lunettes': [
    { name: 'Lunettes de vue hommes', icon: '/uploads/categories/vetements/level3/lunettes-vue-hommes.png', iconType: 'image-png', order: 1 },
    { name: 'Lunettes de vue femmes', icon: '/uploads/categories/vetements/level3/lunettes-vue-femmes.png', iconType: 'image-png', order: 2 },
    { name: 'Lunettes de soleil hommes', icon: '/uploads/categories/vetements/level3/lunettes-soleil-hommes.png', iconType: 'image-png', order: 3 },
    { name: 'Lunettes de soleil femmes', icon: '/uploads/categories/vetements/level3/lunettes-soleil-femmes.png', iconType: 'image-png', order: 4 },
    { name: 'Lunettes de vue enfants', icon: '/uploads/categories/vetements/level3/lunettes-vue-enfants.png', iconType: 'image-png', order: 5 },
    { name: 'Lunettes de soleil enfants', icon: '/uploads/categories/vetements/level3/lunettes-soleil-enfants.png', iconType: 'image-png', order: 6 },
    { name: 'Accessoires', icon: '/uploads/categories/vetements/level3/accessoires-lunettes.png', iconType: 'image-png', order: 7 }
  ],
  'Bijoux': [
    { name: 'Parures', icon: '/uploads/categories/vetements/level3/parures.png', iconType: 'image-png', order: 1 },
    { name: 'Colliers & Pendentifs', icon: '/uploads/categories/vetements/level3/colliers-pendentifs.png', iconType: 'image-png', order: 2 },
    { name: 'Bracelets', icon: '/uploads/categories/vetements/level3/bracelets.png', iconType: 'image-png', order: 3 },
    { name: 'Bagues', icon: '/uploads/categories/vetements/level3/bagues.png', iconType: 'image-png', order: 4 },
    { name: 'Boucles', icon: '/uploads/categories/vetements/level3/boucles.png', iconType: 'image-png', order: 5 },
    { name: 'Chevillières', icon: '/uploads/categories/vetements/level3/chevilleres.png', iconType: 'image-png', order: 6 },
    { name: 'Piercings', icon: '/uploads/categories/vetements/level3/piercings.png', iconType: 'image-png', order: 7 },
    { name: 'Accessoires cheveux', icon: '/uploads/categories/vetements/level3/accessoires-cheveux.png', iconType: 'image-png', order: 8 },
    { name: 'Broches', icon: '/uploads/categories/vetements/level3/broches.png', iconType: 'image-png', order: 9 },
    { name: 'Autre', icon: '/uploads/categories/vetements/level3/autre-bijoux.png', iconType: 'image-png', order: 10 }
  ],

  // TÉLÉPHONES
  'Protection & Antichoc': [
    { name: 'Protections d\'écran', icon: '/uploads/categories/telephones/level3/protections-ecran.png', iconType: 'image-png', order: 1 },
    { name: 'Coques & Antichoc', icon: '/uploads/categories/telephones/level3/coques-antichoc.png', iconType: 'image-png', order: 2 },
    { name: 'Films de protection', icon: '/uploads/categories/telephones/level3/films-protection.png', iconType: 'image-png', order: 3 },
    { name: 'Étuis', icon: '/uploads/categories/telephones/level3/etuis.png', iconType: 'image-png', order: 4 },
    { name: 'Protections de caméra', icon: '/uploads/categories/telephones/level3/protections-camera.png', iconType: 'image-png', order: 5 }
  ],
  'Ecouteurs & Son': [
    { name: 'Écouteurs filaires', icon: '/uploads/categories/telephones/level3/ecouteurs-filaires.png', iconType: 'image-png', order: 1 },
    { name: 'Écouteurs Bluetooth', icon: '/uploads/categories/telephones/level3/ecouteurs-bluetooth.png', iconType: 'image-png', order: 2 },
    { name: 'Casques audio', icon: '/uploads/categories/telephones/level3/casques-audio.png', iconType: 'image-png', order: 3 },
    { name: 'Hauts-parleurs portables', icon: '/uploads/categories/telephones/level3/hauts-parleurs-portables.png', iconType: 'image-png', order: 4 },
    { name: 'Adaptateurs audio', icon: '/uploads/categories/telephones/level3/adaptateurs-audio.png', iconType: 'image-png', order: 5 }
  ],
  'Chargeurs & Câbles': [
    { name: 'Chargeurs mural', icon: '/uploads/categories/telephones/level3/chargeurs-mur.png', iconType: 'image-png', order: 1 },
    { name: 'Chargeurs voiture', icon: '/uploads/categories/telephones/level3/chargeurs-voiture.png', iconType: 'image-png', order: 2 },
    { name: 'Chargeurs sans fil', icon: '/uploads/categories/telephones/level3/chargeurs-sans-fil.png', iconType: 'image-png', order: 3 },
    { name: 'Câbles USB', icon: '/uploads/categories/telephones/level3/cables-usb.png', iconType: 'image-png', order: 4 },
    { name: 'Câbles Lightning', icon: '/uploads/categories/telephones/level3/cables-lightning.png', iconType: 'image-png', order: 5 },
    { name: 'Câbles Type-C', icon: '/uploads/categories/telephones/level3/cables-type-c.png', iconType: 'image-png', order: 6 },
    { name: 'Hubs chargeurs', icon: '/uploads/categories/telephones/level3/hubs-chargeurs.png', iconType: 'image-png', order: 7 }
  ],
  'Supports & Stabilisateurs': [
    { name: 'Supports', icon: '/uploads/categories/telephones/level3/supports.png', iconType: 'image-png', order: 1 },
    { name: 'Stabilisateurs', icon: '/uploads/categories/telephones/level3/stabilisateurs.png', iconType: 'image-png', order: 2 },
    { name: 'Barres de selfies', icon: '/uploads/categories/telephones/level3/barres-selfies.png', iconType: 'image-png', order: 3 },
    { name: 'Pieds pour téléphone', icon: '/uploads/categories/telephones/level3/pieds-telephone.png', iconType: 'image-png', order: 4 },
    { name: 'Ventouses voiture', icon: '/uploads/categories/telephones/level3/ventouses-voiture.png', iconType: 'image-png', order: 5 }
  ],
  'Manettes': [
    { name: 'Manettes Bluetooth', icon: '/uploads/categories/telephones/level3/manettes-bluetooth.png', iconType: 'image-png', order: 1 },
    { name: 'Manettes filaires', icon: '/uploads/categories/telephones/level3/manettes-filaires.png', iconType: 'image-png', order: 2 },
    { name: 'Manettes pour téléphone', icon: '/uploads/categories/telephones/level3/manettes-telephone.png', iconType: 'image-png', order: 3 },
    { name: 'Manettes pour tablette', icon: '/uploads/categories/telephones/level3/manettes-tablette.png', iconType: 'image-png', order: 4 },
    { name: 'Accessoires pour manettes', icon: '/uploads/categories/telephones/level3/accessoires-manettes.png', iconType: 'image-png', order: 5 }
  ],
  'VR': [
    { name: 'Casques VR', icon: '/uploads/categories/telephones/level3/casques-vr.png', iconType: 'image-png', order: 1 },
    { name: 'Lunettes VR', icon: '/uploads/categories/telephones/level3/lunettes-vr.png', iconType: 'image-png', order: 2 },
    { name: 'Accessoires VR', icon: '/uploads/categories/telephones/level3/accessoires-vr.png', iconType: 'image-png', order: 3 },
    { name: 'Contrôleurs VR', icon: '/uploads/categories/telephones/level3/controleurs-vr.png', iconType: 'image-png', order: 4 },
    { name: 'Jeux VR', icon: '/uploads/categories/telephones/level3/jeux-vr.png', iconType: 'image-png', order: 5 }
  ],
  'Power banks': [
    { name: 'Power bank 10,000mAh', icon: '/uploads/categories/telephones/level3/power-bank-10000mah.png', iconType: 'image-png', order: 1 },
    { name: 'Power bank 20,000mAh', icon: '/uploads/categories/telephones/level3/power-bank-20000mah.png', iconType: 'image-png', order: 2 },
    { name: 'Power bank solaire', icon: '/uploads/categories/telephones/level3/power-bank-solaire.png', iconType: 'image-png', order: 3 },
    { name: 'Power bank charge rapide', icon: '/uploads/categories/telephones/level3/power-bank-rapide.png', iconType: 'image-png', order: 4 },
    { name: 'Power bank compact', icon: '/uploads/categories/telephones/level3/power-bank-compact.png', iconType: 'image-png', order: 5 }
  ],
  'Stylets': [
    { name: 'Stylets actifs', icon: '/uploads/categories/telephones/level3/stylets-actifs.png', iconType: 'image-png', order: 1 },
    { name: 'Stylets passifs', icon: '/uploads/categories/telephones/level3/stylets-passifs.png', iconType: 'image-png', order: 2 },
    { name: 'Stylets Bluetooth', icon: '/uploads/categories/telephones/level3/stylets-bluetooth.png', iconType: 'image-png', order: 3 },
    { name: 'Stylets pour tablette', icon: '/uploads/categories/telephones/level3/stylets-tablette.png', iconType: 'image-png', order: 4 },
    { name: 'Recharges pour stylet', icon: '/uploads/categories/telephones/level3/recharges-stylet.png', iconType: 'image-png', order: 5 }
  ],
  'Cartes Mémoire': [
    { name: 'Cartes SD', icon: '/uploads/categories/telephones/level3/sd-cards.png', iconType: 'image-png', order: 1 },
    { name: 'Cartes Micro SD', icon: '/uploads/categories/telephones/level3/micro-sd-cards.png', iconType: 'image-png', order: 2 },
    { name: 'Cartes SDHC', icon: '/uploads/categories/telephones/level3/sdhc-cards.png', iconType: 'image-png', order: 3 },
    { name: 'Cartes SDXC', icon: '/uploads/categories/telephones/level3/sdxc-cards.png', iconType: 'image-png', order: 4 },
    { name: 'Adaptateurs de carte', icon: '/uploads/categories/telephones/level3/adaptateurs-carte.png', iconType: 'image-png', order: 5 },
    { name: 'Lecteurs de carte', icon: '/uploads/categories/telephones/level3/lecteurs-carte.png', iconType: 'image-png', order: 6 }
  ],

  // IMMOBILIER
  'Vente': [
    { name: 'Appartement', icon: '/uploads/categories/immobilier/level3/appartement.png', iconType: 'image-png', order: 1 },
    { name: 'Local', icon: '/uploads/categories/immobilier/level3/local.png', iconType: 'image-png', order: 2 },
    { name: 'Villa', icon: '/uploads/categories/immobilier/level3/villa.png', iconType: 'image-png', order: 3 },
    { name: 'Terrain', icon: '/uploads/categories/immobilier/level3/terrain.png', iconType: 'image-png', order: 4 },
    { name: 'Terrain Agricole', icon: '/uploads/categories/immobilier/level3/terrain-agricole.png', iconType: 'image-png', order: 5 },
    { name: 'Immeuble', icon: '/uploads/categories/immobilier/level3/immeuble.png', iconType: 'image-png', order: 6 },
    { name: 'Bungalow', icon: '/uploads/categories/immobilier/level3/bungalow.png', iconType: 'image-png', order: 7 },
    { name: 'Hangar - Usine', icon: '/uploads/categories/immobilier/level3/hangar-usine.png', iconType: 'image-png', order: 8 },
    { name: 'Autre', icon: '/uploads/categories/immobilier/level3/autre.png', iconType: 'image-png', order: 9 }
  ],
  'Location': [
    { name: 'Appartement', icon: '/uploads/categories/immobilier/level3/appartement-location.png', iconType: 'image-png', order: 1 },
    { name: 'Local', icon: '/uploads/categories/immobilier/level3/local-location.png', iconType: 'image-png', order: 2 },
    { name: 'Villa', icon: '/uploads/categories/immobilier/level3/villa-location.png', iconType: 'image-png', order: 3 },
    { name: 'Immeuble', icon: '/uploads/categories/immobilier/level3/immeuble-location.png', iconType: 'image-png', order: 4 },
    { name: 'Bungalow', icon: '/uploads/categories/immobilier/level3/bungalow-location.png', iconType: 'image-png', order: 5 },
    { name: 'Autre', icon: '/uploads/categories/immobilier/level3/autre-location.png', iconType: 'image-png', order: 6 }
  ],
  'Location vacances': [
    { name: 'Appartement', icon: '/uploads/categories/immobilier/level3/appartement-vacances.png', iconType: 'image-png', order: 1 },
    { name: 'Villa', icon: '/uploads/categories/immobilier/level3/villa-vacances.png', iconType: 'image-png', order: 2 },
    { name: 'Bungalow', icon: '/uploads/categories/immobilier/level3/bungalow-vacances.png', iconType: 'image-png', order: 3 },
    { name: 'Autre', icon: '/uploads/categories/immobilier/level3/autre-vacances.png', iconType: 'image-png', order: 4 }
  ],
  'Cherche location': [
    { name: 'Appartement', icon: '/uploads/categories/immobilier/level3/appartement-cherche-location.png', iconType: 'image-png', order: 1 },
    { name: 'Local', icon: '/uploads/categories/immobilier/level3/local-cherche-location.png', iconType: 'image-png', order: 2 },
    { name: 'Villa', icon: '/uploads/categories/immobilier/level3/villa-cherche-location.png', iconType: 'image-png', order: 3 },
    { name: 'Immeuble', icon: '/uploads/categories/immobilier/level3/immeuble-cherche-location.png', iconType: 'image-png', order: 4 },
    { name: 'Bungalow', icon: '/uploads/categories/immobilier/level3/bungalow-cherche-location.png', iconType: 'image-png', order: 5 },
    { name: 'Autre', icon: '/uploads/categories/immobilier/level3/autre-cherche-location.png', iconType: 'image-png', order: 6 }
  ],
  'Cherche achat': [
    { name: 'Appartement', icon: '/uploads/categories/immobilier/level3/appartement-cherche-achat.png', iconType: 'image-png', order: 1 },
    { name: 'Local', icon: '/uploads/categories/immobilier/level3/local-cherche-achat.png', iconType: 'image-png', order: 2 },
    { name: 'Villa', icon: '/uploads/categories/immobilier/level3/villa-cherche-achat.png', iconType: 'image-png', order: 3 },
    { name: 'Terrain', icon: '/uploads/categories/immobilier/level3/terrain-cherche-achat.png', iconType: 'image-png', order: 4 },
    { name: 'Terrain Agricole', icon: '/uploads/categories/immobilier/level3/terrain-agricole-cherche-achat.png', iconType: 'image-png', order: 5 },
    { name: 'Immeuble', icon: '/uploads/categories/immobilier/level3/immeuble-cherche-achat.png', iconType: 'image-png', order: 6 },
    { name: 'Bungalow', icon: '/uploads/categories/immobilier/level3/bungalow-cherche-achat.png', iconType: 'image-png', order: 7 },
    { name: 'Hangar - Usine', icon: '/uploads/categories/immobilier/level3/hangar-usine-cherche-achat.png', iconType: 'image-png', order: 8 },
    { name: 'Autre', icon: '/uploads/categories/immobilier/level3/autre-cherche-achat.png', iconType: 'image-png', order: 9 }
  ],

  // ÉLECTROMÉNAGER
  'Réfrigérateurs & Congélateurs': [
    { name: 'Réfrigérateur', icon: '/uploads/categories/electromenager/level3/refrigerateur.png', iconType: 'image-png', order: 1 },
    { name: 'Congélateur', icon: '/uploads/categories/electromenager/level3/congelateur.png', iconType: 'image-png', order: 2 },
    { name: 'Réfrigérateur-Congélateur', icon: '/uploads/categories/electromenager/level3/refrigerateur-congelateur.png', iconType: 'image-png', order: 3 },
    { name: 'Cave à vin', icon: '/uploads/categories/electromenager/level3/cave-vin.png', iconType: 'image-png', order: 4 }
  ],
  'Machines à laver': [
    { name: 'Lave-linge', icon: '/uploads/categories/electromenager/level3/lave-linge.png', iconType: 'image-png', order: 1 },
    { name: 'Sèche-linge', icon: '/uploads/categories/electromenager/level3/seche-linge.png', iconType: 'image-png', order: 2 },
    { name: 'Lave-linge/Sèche-linge', icon: '/uploads/categories/electromenager/level3/lave-linge-seche-linge.png', iconType: 'image-png', order: 3 },
    { name: 'Lave-linge avec essorage', icon: '/uploads/categories/electromenager/level3/lave-linge-essorage.png', iconType: 'image-png', order: 4 }
  ],
  'Lave-vaisselles': [
    { name: 'Lave-vaisselle encastrable', icon: '/uploads/categories/electromenager/level3/lave-vaisselle-encastrable.png', iconType: 'image-png', order: 1 },
    { name: 'Lave-vaisselle pose libre', icon: '/uploads/categories/electromenager/level3/lave-vaisselle-pose-libre.png', iconType: 'image-png', order: 2 },
    { name: 'Lave-vaisselle compact', icon: '/uploads/categories/electromenager/level3/lave-vaisselle-compact.png', iconType: 'image-png', order: 3 }
  ],
  'Fours & Cuisson': [
    { name: 'Four électrique', icon: '/uploads/categories/electromenager/level3/four-electrique.png', iconType: 'image-png', order: 1 },
    { name: 'Four à gaz', icon: '/uploads/categories/electromenager/level3/four-gaz.png', iconType: 'image-png', order: 2 },
    { name: 'Four micro-ondes', icon: '/uploads/categories/electromenager/level3/four-micro-ondes.png', iconType: 'image-png', order: 3 },
    { name: 'Plaque de cuisson', icon: '/uploads/categories/electromenager/level3/plaque-cuisson.png', iconType: 'image-png', order: 4 },
    { name: 'Cuisinière', icon: '/uploads/categories/electromenager/level3/cuisiniere.png', iconType: 'image-png', order: 5 }
  ],
  'Chauffage & Climatisation': [
    { name: 'Climatiseur', icon: '/uploads/categories/electromenager/level3/climatiseur.png', iconType: 'image-png', order: 1 },
    { name: 'Ventilateur', icon: '/uploads/categories/electromenager/level3/ventilateur.png', iconType: 'image-png', order: 2 },
    { name: 'Radiateur', icon: '/uploads/categories/electromenager/level3/radiateur.png', iconType: 'image-png', order: 3 },
    { name: 'Chauffe-eau', icon: '/uploads/categories/electromenager/level3/chauffe-eau.png', iconType: 'image-png', order: 4 },
    { name: 'Pompe à chaleur', icon: '/uploads/categories/electromenager/level3/pompe-chaleur.png', iconType: 'image-png', order: 5 }
  ],
  'Appareils de cuisine': [
    { name: 'Robot de cuisine', icon: '/uploads/categories/electromenager/level3/robot-cuisine.png', iconType: 'image-png', order: 1 },
    { name: 'Mixeur', icon: '/uploads/categories/electromenager/level3/mixeur.png', iconType: 'image-png', order: 2 },
    { name: 'Bouilloire', icon: '/uploads/categories/electromenager/level3/bouilloire.png', iconType: 'image-png', order: 3 },
    { name: 'Cafetière', icon: '/uploads/categories/electromenager/level3/cafetiere.png', iconType: 'image-png', order: 4 },
    { name: 'Grille-pain', icon: '/uploads/categories/electromenager/level3/grille-pain.png', iconType: 'image-png', order: 5 }
  ]
};

// ============================================
// FUNCIÓN PRINCIPAL DE SEEDING (SIN CAMBIOS)
// ============================================
const seedCategories = async () => {
  try {
    console.log('🚀 INICIANDO SEED COMPLETO DE 5 CATEGORÍAS REALES\n');
    console.log('='.repeat(80));

    // Limpiar colección existente
    console.log('🧹 Paso 1: Limpiando colección existente...');
    const result = await Category.deleteMany({});
    console.log(`   ✅ Eliminadas ${result.deletedCount} categorías anteriores\n`);

    // Insertar categorías principales (Nivel 1)
    console.log('📦 Paso 2: Insertando categorías principales (Nivel 1)...');
    const mainCategories = {};
    const allSlugs = new Set();

    for (const categoryData of categoriesData) {
      allSlugs.add(categoryData.slug);
      const category = new Category({
        ...categoryData,
        path: `/${categoryData.slug}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedCategory = await category.save();
      mainCategories[categoryData.name] = savedCategory._id;
      console.log(`   ✅ ${categoryData.name} → ${categoryData.slug} (${categoryData.icon})`);
    }

    // Función recursiva para insertar hijos
    const insertChildren = async (parentId, parentName, childrenData, level, parentPath = '') => {
      const parentCategory = await Category.findById(parentId);
      const childIds = [];

      for (const child of childrenData) {
        const slug = createUniqueSlug(child.name, allSlugs);
        const childPath = `${parentCategory.path}/${slug}`;

        // Verificar si tiene hijos (artículos) según el nivel
        const hasMoreChildren = level === 2 && child.hasSublevel;

        const childCategory = new Category({
          name: child.name,
          slug: slug,
          level: level,
          parent: parentId,
          ancestors: [...parentCategory.ancestors, parentId],
          path: childPath,
          icon: child.icon,
          iconType: child.iconType || 'image-png',
          iconColor: child.iconColor || parentCategory.iconColor,
          bgColor: child.bgColor || parentCategory.bgColor,
          order: child.order || 0,
          isLeaf: !hasMoreChildren,
          hasChildren: !!hasMoreChildren,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const savedChild = await childCategory.save();
        childIds.push(savedChild._id);

        // Insertar nivel 3 si existe
        if (hasMoreChildren && articlesData[child.name]) {
          console.log(`      📁 Insertando ${articlesData[child.name].length} artículos para: ${child.name}`);
          await insertChildren(savedChild._id, child.name, articlesData[child.name], 3, childPath);
        }
      }

      // Actualizar parent si tiene hijos
      if (childIds.length > 0) {
        parentCategory.hasChildren = true;
        await parentCategory.save();
      }

      return childIds;
    };

    // Insertar TODAS las categorías jerárquicas
    console.log('\n📁 Paso 3: Insertando subcategorías y artículos...\n');

    for (const [mainCatName, subcats] of Object.entries(subcategoriesData)) {
      console.log(`   🔌 ${mainCatName}:`);
      const parentId = mainCategories[mainCatName];

      if (parentId && subcats.length > 0) {
        await insertChildren(parentId, mainCatName, subcats, 2);
      } else {
        console.log(`   ⚠️  No se encontró parent para ${mainCatName}`);
      }
    }

    // Mostrar resumen final
    console.log('\n' + '='.repeat(80));
    console.log('🎉 ¡SEED COMPLETADO EXITOSAMENTE!');
    console.log('='.repeat(80) + '\n');

    const totalCategories = await Category.countDocuments();
    const level1 = await Category.countDocuments({ level: 1 });
    const level2 = await Category.countDocuments({ level: 2 });
    const level3 = await Category.countDocuments({ level: 3 });

    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log('   • Categorías principales (Nivel 1):', level1);
    console.log('   • Subcategorías (Nivel 2):', level2);
    console.log('   • Artículos (Nivel 3):', level3);
    console.log('   • Total de categorías en BD:', totalCategories);

    console.log('\n📁 ESTRUCTURA COMPLETA DE CARPETAS PARA IMÁGENES:');
    console.log('public/uploads/categories/');
    console.log('├── vetements/');
    console.log('│   ├── level1/ (1 imagen)');
    console.log('│   ├── level2/ (12 imágenes)');
    console.log('│   └── level3/ (141 imágenes)');
    console.log('├── telephones/');
    console.log('│   ├── level1/ (1 imagen)');
    console.log('│   ├── level2/ (18 imágenes)');
    console.log('│   └── level3/ (46 imágenes)');
    console.log('├── immobilier/');
    console.log('│   ├── level1/ (1 imagen)');
    console.log('│   ├── level2/ (5 imágenes)');
    console.log('│   └── level3/ (34 imágenes)');
    console.log('├── electromenager/');
    console.log('│   ├── level1/ (1 imagen)');
    console.log('│   ├── level2/ (21 imágenes)');
    console.log('│   └── level3/ (25 imágenes)');
    console.log('└── vehicules/');
    console.log('    ├── level1/ (1 imagen)');
    console.log('    └── level2/ (11 imágenes) // No tiene level3');

    console.log('\n📋 TOTAL DE IMÁGENES REQUERIDAS:');
    console.log('   • Nivel 1: 5 imágenes principales');
    console.log('   • Nivel 2: 67 imágenes de subcategorías');
    console.log('   • Nivel 3: 246 imágenes de artículos');
    console.log('   • Total: 318 imágenes PNG');

    console.log('\n🎯 EJEMPLO DE JERARQUÍA CREADA:');
    console.log('   Vêtements');
    console.log('   └── Vêtements Homme');
    console.log('       ├── Hauts & Chemises');
    console.log('       ├── Jeans & Pantalons');
    console.log('       └── ... (16 artículos)');
    console.log('   Immobilier');
    console.log('   └── Vente');
    console.log('       ├── Appartement');
    console.log('       ├── Villa');
    console.log('       └── ... (9 artículos)');

    console.log('\n📍 URLs generadas para ejemplo:');
    console.log('   • /category/vetements');
    console.log('   • /category/vetements/vetements-homme');
    console.log('   • /category/vetements/vetements-homme/hauts-chemises');
    console.log('   • /category/immobilier/vente');
    console.log('   • /category/immobilier/vente/appartement');

    // Mostrar algunos ejemplos
    console.log('\n🔍 EJEMPLOS DE ARTÍCULOS NIVEL 3 INSERTADOS:');
    const level3Samples = await Category.find({ level: 3 })
      .sort({ name: 1 })
      .limit(5)
      .select('name slug icon path');

    level3Samples.forEach(article => {
      console.log(`   • ${article.name} → ${article.icon}`);
    });

    console.log('\n✅ Nota: Las imágenes pueden ser placeholders durante desarrollo.');
    console.log('🔥 Para producción, reemplaza con imágenes reales en las rutas especificadas.');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Ejecutar el seed
// Nota: No necesitas llamar seedCategories() aquí ya que se ejecuta en db.once('open')
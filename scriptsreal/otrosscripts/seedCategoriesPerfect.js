// node seedCategoriesPerfect.js
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

// 🎯 ESTRUCTURA PERFECTA CON ICONOS PNG PARA TODOS LOS NIVELES - ACTUALIZADO CON URLs DE CLOUDINARY
const categoriesData = [
  // ==================== 1. VEHICULES ====================
  {
    name: 'Vehicules',
    slug: 'vehicules',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/vehicules.png',
    order: 3,
    children: [
      { name: 'Voitures', slug: 'voitures', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/voitures.png', order: 1, children: [] },
      { name: 'Utilitaire', slug: 'utilitaire', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/utilitaire.png', order: 2, children: [] },
      { name: 'Motos & Scooters', slug: 'motos-scooters', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/motos-scooters.png', order: 3, children: [] },
      { name: 'Quads', slug: 'quads', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/quads.png', order: 4, children: [] },
      { name: 'Fourgon', slug: 'fourgon', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/fourgon.png', order: 5, children: [] },
      { name: 'Camion', slug: 'camion', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/camion.png', order: 6, children: [] },
      { name: 'Bus', slug: 'bus', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/bus.png', order: 7, children: [] },
      { name: 'Engin', slug: 'engin', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/engin.png', order: 8, children: [] },
      { name: 'Tracteurs', slug: 'tracteurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/tracteurs.png', order: 9, children: [] },
      { name: 'Remorques', slug: 'remorques', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/remorques.png', order: 10, children: [] },
      { name: 'Bateaux & Barques', slug: 'bateaux-barques', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vehicules/bateaux-barques.png', order: 11, children: [] }
    ]
  },

  // ==================== 2. VETEMENTS ====================
  {
    name: 'Vetements',
    slug: 'vetements',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements.png',
    order: 8,
    children: [
      {
        name: 'Vêtements Homme',
        slug: 'vetements-homme',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme.png',
        order: 1,
        children: [
          { name: 'Hauts & Chemises', slug: 'hauts-chemises', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/hauts-chemises.png', children: [] },
          { name: 'Jeans & Pantalons', slug: 'jeans-pantalons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/jeans-pantalons.png', children: [] },
          { name: 'Shorts & Pantacourts', slug: 'shorts-pantacourts', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/shorts-pantacourts.png', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/vestes-gilets.png', children: [] },
          { name: 'Costumes & Blazers', slug: 'costumes-blazers', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/costumes-blazers.png', children: [] },
          { name: 'Survetements', slug: 'survetements', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/survetements.png', children: [] },
          { name: 'Kamiss', slug: 'kamiss', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/kamiss.png', children: [] },
          { name: 'Sous vêtements', slug: 'sous-vetements', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/sous-vetements.png', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/pyjamas.png', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/maillots-bain.png', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/casquettes-chapeaux.png', children: [] },
          { name: 'Chaussettes', slug: 'chaussettes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/chaussettes.png', children: [] },
          { name: 'Ceintures', slug: 'ceintures', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/ceintures.png', children: [] },
          { name: 'Gants', slug: 'gants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/gants.png', children: [] },
          { name: 'Cravates', slug: 'cravates', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/cravates.png', children: [] },
          { name: 'Autre', slug: 'autre-homme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-homme/autre-homme.png', children: [] }
        ]
      },
      {
        name: 'Vêtements Femme',
        slug: 'vetements-femme',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme.png',
        order: 2,
        children: [
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/hauts-chemises-femme.png', children: [] },
          { name: 'Jeans & Pantalons', slug: 'jeans-pantalons-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/jeans-pantalons-femme.png', children: [] },
          { name: 'Shorts & Pantacourts', slug: 'shorts-pantacourts-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/shorts-pantacourts-femme.png', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/vestes-gilets-femme.png', children: [] },
          { name: 'Ensembles', slug: 'ensembles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/ensembles.png', children: [] },
          { name: 'Abayas & Hijabs', slug: 'abayas-hijabs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/abayas-hijabs.png', children: [] },
          { name: 'Mariages & Fêtes', slug: 'mariages-fetes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/mariages-fetes.png', children: [] },
          { name: 'Maternité', slug: 'maternite', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/maternite.png', children: [] },
          { name: 'Robes', slug: 'robes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/robes.png', children: [] },
          { name: 'Jupes', slug: 'jupes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/jupes.png', children: [] },
          { name: 'Joggings & Survetements', slug: 'joggings-survetements-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/joggings-survetements-femme.png', children: [] },
          { name: 'Leggings', slug: 'leggings', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/leggings.png', children: [] },
          { name: 'Sous-vêtements & Lingerie', slug: 'sous-vetements-lingerie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/sous-vetements-lingerie.png', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/pyjamas-femme.png', children: [] },
          { name: 'Peignoirs', slug: 'peignoirs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/peignoirs.png', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/maillots-bain-femme.png', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/casquettes-chapeaux-femme.png', children: [] },
          { name: 'Chaussettes & Collants', slug: 'chaussettes-collants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/chaussettes-collants.png', children: [] },
          { name: 'Foulards & Echarpes', slug: 'foulards-echarpes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/foulards-echarpes.png', children: [] },
          { name: 'Ceintures', slug: 'ceintures-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/ceintures-femme.png', children: [] },
          { name: 'Gants', slug: 'gants-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/gants-femme.png', children: [] },
          { name: 'Autre', slug: 'autre-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/vetements-femme/autre-femme.png', children: [] }
        ]
      },
      {
        name: 'Chaussures Homme',
        slug: 'chaussures-homme',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme.png',
        order: 3,
        children: [
          { name: 'Basquettes', slug: 'basquettes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/basquettes.png', children: [] },
          { name: 'Bottes', slug: 'bottes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/bottes.png', children: [] },
          { name: 'Classiques', slug: 'classiques', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/classiques.png', children: [] },
          { name: 'Mocassins', slug: 'mocassins', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/mocassins.png', children: [] },
          { name: 'Sandales', slug: 'sandales', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/sandales.png', children: [] },
          { name: 'Tangues & Pantoufles', slug: 'tangues-pantoufles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/tangues-pantoufles.png', children: [] },
          { name: 'Autre', slug: 'autre-chaussures-homme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-homme/autre-chaussures-homme.png', children: [] }
        ]
      },
      {
        name: 'Chaussures Femme',
        slug: 'chaussures-femme',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme.png',
        order: 4,
        children: [
          { name: 'Basquettes', slug: 'basquettes-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/basquettes-femme.png', children: [] },
          { name: 'Sandales', slug: 'sandales-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/sandales-femme.png', children: [] },
          { name: 'Bottes', slug: 'bottes-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/bottes-femme.png', children: [] },
          { name: 'Escarpins', slug: 'escarpins', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/escarpins.png', children: [] },
          { name: 'Ballerines', slug: 'ballerines', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/ballerines.png', children: [] },
          { name: 'Tangues & Pantoufles', slug: 'tangues-pantoufles-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/tangues-pantoufles-femme.png', children: [] },
          { name: 'Autre', slug: 'autre-chaussures-femme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/chaussures-femme/autre-chaussures-femme.png', children: [] }
        ]
      },
      {
        name: 'Garçons',
        slug: 'garcons',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons.png',
        order: 5,
        children: [
          { name: 'Chaussures', slug: 'chaussures-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/chaussures-garcons.png', children: [] },
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/hauts-chemises-garcons.png', children: [] },
          { name: 'Pantalons & Shorts', slug: 'pantalons-shorts-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/pantalons-shorts-garcons.png', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/vestes-gilets-garcons.png', children: [] },
          { name: 'Costumes', slug: 'costumes-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/costumes-garcons.png', children: [] },
          { name: 'Survetements & Joggings', slug: 'survetements-joggings-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/survetements-joggings-garcons.png', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/pyjamas-garcons.png', children: [] },
          { name: 'Sous-vêtements', slug: 'sous-vetements-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/sous-vetements-garcons.png', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/maillots-bain-garcons.png', children: [] },
          { name: 'Kamiss', slug: 'kamiss-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/kamiss-garcons.png', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/casquettes-chapeaux-garcons.png', children: [] },
          { name: 'Autre', slug: 'autre-garcons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/garcons/autre-garcons.png', children: [] }
        ]
      },
      {
        name: 'Filles',
        slug: 'filles',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles.png',
        order: 6,
        children: [
          { name: 'Chaussures', slug: 'chaussures-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/chaussures-filles.png', children: [] },
          { name: 'Hauts & Chemises', slug: 'hauts-chemises-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/hauts-chemises-filles.png', children: [] },
          { name: 'Pantalons & Shorts', slug: 'pantalons-shorts-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/pantalons-shorts-filles.png', children: [] },
          { name: 'Vestes & Gilets', slug: 'vestes-gilets-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/vestes-gilets-filles.png', children: [] },
          { name: 'Robes', slug: 'robes-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/robes-filles.png', children: [] },
          { name: 'Jupes', slug: 'jupes-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/jupes-filles.png', children: [] },
          { name: 'Ensembles', slug: 'ensembles-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/ensembles-filles.png', children: [] },
          { name: 'Joggings & Survetements', slug: 'joggings-survetements-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/joggings-survetements-filles.png', children: [] },
          { name: 'Pyjamas', slug: 'pyjamas-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/pyjamas-filles.png', children: [] },
          { name: 'Sous-vêtements', slug: 'sous-vetements-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/sous-vetements-filles.png', children: [] },
          { name: 'Leggings & Collants', slug: 'leggings-collants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/leggings-collants.png', children: [] },
          { name: 'Maillots de bain', slug: 'maillots-bain-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/maillots-bain-filles.png', children: [] },
          { name: 'Casquettes & Chapeaux', slug: 'casquettes-chapeaux-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/casquettes-chapeaux-filles.png', children: [] },
          { name: 'Autre', slug: 'autre-filles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/filles/autre-filles.png', children: [] }
        ]
      },
      {
        name: 'Bébé',
        slug: 'bebe',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bebe.png',
        order: 7,
        children: [
          { name: 'Vêtements', slug: 'vetements-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bebe/vetements-bebe.png', children: [] },
          { name: 'Chaussures', slug: 'chaussures-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bebe/chaussures-bebe.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bebe/accessoires-bebe.png', children: [] }
        ]
      },
      {
        name: 'Sacs & Valises',
        slug: 'sacs-valises',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises.png',
        order: 8,
        children: [
          { name: 'Pochettes & Portefeuilles', slug: 'pochettes-portefeuilles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/pochettes-portefeuilles.png', children: [] },
          { name: 'Sacs à main', slug: 'sacs-main', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/sacs-main.png', children: [] },
          { name: 'Sacs à dos', slug: 'sacs-dos', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/sacs-dos.png', children: [] },
          { name: 'Sacs professionnels', slug: 'sacs-professionnels', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/sacs-professionnels.png', children: [] },
          { name: 'Valises', slug: 'valises', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/valises.png', children: [] },
          { name: 'Cabas de sport', slug: 'cabas-sport', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/cabas-sport.png', children: [] },
          { name: 'Autre', slug: 'autre-sacs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/sacs-valises/autre-sacs.png', children: [] }
        ]
      },
      {
        name: 'Montres',
        slug: 'montres',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/montres.png',
        order: 9,
        children: [
          { name: 'Hommes', slug: 'montres-hommes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/montres/montres-hommes.png', children: [] },
          { name: 'Femmes', slug: 'montres-femmes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/montres/montres-femmes.png', children: [] }
        ]
      },
      {
        name: 'Lunettes',
        slug: 'lunettes',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes.png',
        order: 10,
        children: [
          { name: 'Lunettes de vue hommes', slug: 'lunettes-vue-hommes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-vue-hommes.png', children: [] },
          { name: 'Lunettes de vue femmes', slug: 'lunettes-vue-femmes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-vue-femmes.png', children: [] },
          { name: 'Lunettes de soleil hommes', slug: 'lunettes-soleil-hommes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-soleil-hommes.png', children: [] },
          { name: 'Lunettes de soleil femmes', slug: 'lunettes-soleil-femmes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-soleil-femmes.png', children: [] },
          { name: 'Lunettes de vue enfants', slug: 'lunettes-vue-enfants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-vue-enfants.png', children: [] },
          { name: 'Lunettes de soleil enfants', slug: 'lunettes-soleil-enfants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/lunettes-soleil-enfants.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-lunettes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/lunettes/accessoires-lunettes.png', children: [] }
        ]
      },
      {
        name: 'Bijoux',
        slug: 'bijoux',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux.png',
        order: 11,
        children: [
          { name: 'Parures', slug: 'parures', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/parures.png', children: [] },
          { name: 'Colliers & Pendentifs', slug: 'colliers-pendentifs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/colliers-pendentifs.png', children: [] },
          { name: 'Bracelets', slug: 'bracelets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/bracelets.png', children: [] },
          { name: 'Bagues', slug: 'bagues', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/bagues.png', children: [] },
          { name: 'Boucles', slug: 'boucles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/boucles.png', children: [] },
          { name: 'Chevillières', slug: 'chevilleres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/chevilleres.png', children: [] },
          { name: 'Piercings', slug: 'piercings', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/piercings.png', children: [] },
          { name: 'Accessoires cheveux', slug: 'accessoires-cheveux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/accessoires-cheveux.png', children: [] },
          { name: 'Broches', slug: 'broches', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/broches.png', children: [] },
          { name: 'Autre', slug: 'autre-bijoux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/bijoux/autre-bijoux.png', children: [] }
        ]
      },
      {
        name: 'Tenues professionnelles',
        slug: 'tenues-professionnelles',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/vetements/tenues-professionnelles.png',
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
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/electromenager.png',
    order: 7,
    children: [
      { name: 'Téléviseurs', slug: 'televiseurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/televiseurs.png', order: 1, children: [] },
      { name: 'Démodulateurs & Box TV', slug: 'demodulateurs-box-tv', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/demodulateurs-box-tv.png', order: 2, children: [] },
      { name: 'Paraboles & Switch TV', slug: 'paraboles-switch-tv', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/paraboles-switch-tv.png', order: 3, children: [] },
      { name: 'Abonnements IPTV', slug: 'abonnements-iptv', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/abonnements-iptv.png', order: 4, children: [] },
      { name: 'Caméras & Accessories', slug: 'cameras-accessories', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/cameras-accessories.png', order: 5, children: [] },
      { name: 'Audio', slug: 'audio', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/audio.png', order: 6, children: [] },
      { name: 'Aspirateurs & Nettoyeurs', slug: 'aspirateurs-nettoyeurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/aspirateurs-nettoyeurs.png', order: 7, children: [] },
      { name: 'Repassage', slug: 'repassage', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/repassage.png', order: 8, children: [] },
      { name: 'Beauté & Hygiène', slug: 'beaute-hygiene', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/beaute-hygiene.png', order: 9, children: [] },
      { name: 'Machines à coudre', slug: 'machines-coudre', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-coudre.png', order: 10, children: [] },
      { name: 'Télécommandes', slug: 'telecommandes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/telecommandes.png', order: 11, children: [] },
      { name: 'Sécurité & GPS', slug: 'securite-gps', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/securite-gps.png', order: 12, children: [] },
      { name: 'Composants électroniques', slug: 'composants-electroniques', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/composants-electroniques.png', order: 13, children: [] },
      { name: 'Pièces de rechange', slug: 'pieces-rechange', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/pieces-rechange.png', order: 14, children: [] },
      { name: 'Autre Électroménager', slug: 'autre-electromenager', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/autre-electromenager.png', order: 15, children: [] },
      {
        name: 'Réfrigérateurs & Congélateurs',
        slug: 'refrigerateurs-congelateurs',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/refrigerateurs-congelateurs.png',
        order: 16,
        children: [
          { name: 'Réfrigérateur', slug: 'refrigerateur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/refrigerateurs-congelateurs/refrigerateur.png', children: [] },
          { name: 'Congélateur', slug: 'congelateur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/refrigerateurs-congelateurs/congelateur.png', children: [] },
          { name: 'Réfrigérateur-Congélateur', slug: 'refrigerateur-congelateur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/refrigerateurs-congelateurs/refrigerateur-congelateur.png', children: [] },
          { name: 'Cave à vin', slug: 'cave-vin', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/refrigerateurs-congelateurs/cave-vin.png', children: [] }
        ]
      },
      {
        name: 'Machines à laver',
        slug: 'machines-laver',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-laver.png',
        order: 17,
        children: [
          { name: 'Lave-linge', slug: 'lave-linge', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-laver/lave-linge.png', children: [] },
          { name: 'Sèche-linge', slug: 'seche-linge', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-laver/seche-linge.png', children: [] },
          { name: 'Lave-linge/Sèche-linge', slug: 'lave-linge-seche-linge', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-laver/lave-linge-seche-linge.png', children: [] },
          { name: 'Lave-linge avec essorage', slug: 'lave-linge-essorage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/machines-laver/lave-linge-essorage.png', children: [] }
        ]
      },
      {
        name: 'Lave-vaisselles',
        slug: 'lave-vaisselles',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/lave-vaisselles.png',
        order: 18,
        children: [
          { name: 'Lave-vaisselle encastrable', slug: 'lave-vaisselle-encastrable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/lave-vaisselles/lave-vaisselle-encastrable.png', children: [] },
          { name: 'Lave-vaisselle pose libre', slug: 'lave-vaisselle-poselibre', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/lave-vaisselles/lave-vaisselle-poselibre.png', children: [] },
          { name: 'Lave-vaisselle compact', slug: 'lave-vaisselle-compact', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/lave-vaisselles/lave-vaisselle-compact.png', children: [] }
        ]
      },
      {
        name: 'Fours & Cuisson',
        slug: 'fours-cuisson',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson.png',
        order: 19,
        children: [
          { name: 'Four électrique', slug: 'four-electrique', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson/four-electrique.png', children: [] },
          { name: 'Four à gaz', slug: 'four-gaz', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson/four-gaz.png', children: [] },
          { name: 'Four micro-ondes', slug: 'four-micro-ondes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson/four-micro-ondes.png', children: [] },
          { name: 'Plaque de cuisson', slug: 'plaque-cuisson', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson/plaque-cuisson.png', children: [] },
          { name: 'Cuisinière', slug: 'cuisiniere', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/fours-cuisson/cuisiniere.png', children: [] }
        ]
      },
      {
        name: 'Chauffage & Climatisation',
        slug: 'chauffage-climatisation',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation.png',
        order: 20,
        children: [
          { name: 'Climatiseur', slug: 'climatiseur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation/climatiseur.png', children: [] },
          { name: 'Ventilateur', slug: 'ventilateur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation/ventilateur.png', children: [] },
          { name: 'Radiateur', slug: 'radiateur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation/radiateur.png', children: [] },
          { name: 'Chauffe-eau', slug: 'chauffe-eau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation/chauffe-eau.png', children: [] },
          { name: 'Pompe à chaleur', slug: 'pompe-chaleur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/chauffage-climatisation/pompe-chaleur.png', children: [] }
        ]
      },
      {
        name: 'Appareils de cuisine',
        slug: 'appareils-cuisine',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine.png',
        order: 21,
        children: [
          { name: 'Robot de cuisine', slug: 'robot-cuisine', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine/robot-cuisine.png', children: [] },
          { name: 'Mixeur', slug: 'mixeur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine/mixeur.png', children: [] },
          { name: 'Bouilloire', slug: 'bouilloire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine/bouilloire.png', children: [] },
          { name: 'Cafetière', slug: 'cafetiere', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine/cafetiere.png', children: [] },
          { name: 'Grille-pain', slug: 'grille-pain', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/electromenager/appareils-cuisine/grille-pain.png', children: [] }
        ]
      }
    ]
  },

  // ==================== 4. IMMOBILIER ====================
  {
    name: 'Immobilier',
    slug: 'immobilier',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/immobilier.png',
    order: 2,
    children: [
      {
        name: 'Vente',
        slug: 'vente',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente.png',
        order: 1,
        children: [
          { name: 'Appartement', slug: 'appartement', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/appartement.png', children: [] },
          { name: 'Local', slug: 'local', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/local.png', children: [] },
          { name: 'Villa', slug: 'villa', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/villa.png', children: [] },
          { name: 'Terrain', slug: 'terrain', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/terrain.png', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/terrain-agricole.png', children: [] },
          { name: 'Immeuble', slug: 'immeuble', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/immeuble.png', children: [] },
          { name: 'Bungalow', slug: 'bungalow', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/bungalow.png', children: [] },
          { name: 'Hangar - Usine', slug: 'hangar-usine', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/hangar-usine.png', children: [] },
          { name: 'Autre', slug: 'autre-vente', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/vente/autre-vente.png', children: [] }
        ]
      },
      {
        name: 'Location',
        slug: 'location',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location.png',
        order: 2,
        children: [
          { name: 'Appartement', slug: 'appartement-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/appartement-location.png', children: [] },
          { name: 'Local', slug: 'local-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/local-location.png', children: [] },
          { name: 'Villa', slug: 'villa-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/villa-location.png', children: [] },
          { name: 'Immeuble', slug: 'immeuble-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/immeuble-location.png', children: [] },
          { name: 'Bungalow', slug: 'bungalow-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/bungalow-location.png', children: [] },
          { name: 'Autre', slug: 'autre-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location/autre-location.png', children: [] }
        ]
      },
      {
        name: 'Location vacances',
        slug: 'location-vacances',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location-vacances.png',
        order: 3,
        children: [
          { name: 'Appartement', slug: 'appartement-vacances', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location-vacances/appartement-vacances.png', children: [] },
          { name: 'Villa', slug: 'villa-vacances', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location-vacances/villa-vacances.png', children: [] },
          { name: 'Bungalow', slug: 'bungalow-vacances', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location-vacances/bungalow-vacances.png', children: [] },
          { name: 'Autre', slug: 'autre-vacances', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/location-vacances/autre-vacances.png', children: [] }
        ]
      },
      {
        name: 'Cherche location',
        slug: 'cherche-location',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location.png',
        order: 4,
        children: [
          { name: 'Appartement', slug: 'appartement-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/appartement-cherche-location.png', children: [] },
          { name: 'Local', slug: 'local-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/local-cherche-location.png', children: [] },
          { name: 'Villa', slug: 'villa-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/villa-cherche-location.png', children: [] },
          { name: 'Immeuble', slug: 'immeuble-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/immeuble-cherche-location.png', children: [] },
          { name: 'Bungalow', slug: 'bungalow-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/bungalow-cherche-location.png', children: [] },
          { name: 'Autre', slug: 'autre-cherche-location', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-location/autre-cherche-location.png', children: [] }
        ]
      },
      {
        name: 'Cherche achat',
        slug: 'cherche-achat',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat.png',
        order: 5,
        children: [
          { name: 'Appartement', slug: 'appartement-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/appartement-cherche-achat.png', children: [] },
          { name: 'Local', slug: 'local-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/local-cherche-achat.png', children: [] },
          { name: 'Villa', slug: 'villa-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/villa-cherche-achat.png', children: [] },
          { name: 'Terrain', slug: 'terrain-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/terrain-cherche-achat.png', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/terrain-agricole-cherche-achat.png', children: [] },
          { name: 'Immeuble', slug: 'immeuble-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/immeuble-cherche-achat.png', children: [] },
          { name: 'Bungalow', slug: 'bungalow-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/bungalow-cherche-achat.png', children: [] },
          { name: 'Hangar - Usine', slug: 'hangar-usine-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/hangar-usine-cherche-achat.png', children: [] },
          { name: 'Autre', slug: 'autre-cherche-achat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/immobilier/cherche-achat/autre-cherche-achat.png', children: [] }
        ]
      }
    ]
  },

  // ==================== 5. ALIMENTAIRES ====================
  {
    name: 'Alimentaires',
    slug: 'alimentaires',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/alimentaires.png',
    order: 15,
    children: [
      { name: 'Produits laitiers', slug: 'produits-laitiers', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/produits-laitiers.png', order: 1, children: [] },
      { name: 'Fruits secs', slug: 'fruits-secs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/fruits-secs.png', order: 2, children: [] },
      { name: 'Graines - Riz - Céréales', slug: 'graines-riz-cereales', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/graines-riz-cereales.png', order: 3, children: [] },
      { name: 'Sucres & Produits sucrés', slug: 'sucres-produits-sucres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/sucres-produits-sucres.png', order: 4, children: [] },
      { name: 'Boissons', slug: 'boissons', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/boissons.png', order: 5, children: [] },
      { name: 'Viandes & Poissons', slug: 'viandes-poissons', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/viandes-poissons.png', order: 6, children: [] },
      { name: 'Café - Thé - Infusion', slug: 'cafe-the-infusion', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/cafe-the-infusion.png', order: 7, children: [] },
      { name: 'Compléments alimentaires', slug: 'complements-alimentaires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/complements-alimentaires.png', order: 8, children: [] },
      { name: 'Miel & Dérivés', slug: 'miel-derives', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/miel-derives.png', order: 9, children: [] },
      { name: 'Fruits & Légumes', slug: 'fruits-legumes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/fruits-legumes.png', order: 10, children: [] },
      { name: 'Blé & Farine', slug: 'ble-farine', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/ble-farine.png', order: 11, children: [] },
      { name: 'Bonbons & Chocolat', slug: 'bonbons-chocolat', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/bonbons-chocolat.png', order: 12, children: [] },
      { name: 'Boulangerie & Viennoiserie', slug: 'boulangerie-viennoiserie', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/boulangerie-viennoiserie.png', order: 13, children: [] },
      { name: 'Ingrédients cuisine et pâtisserie', slug: 'ingredients-cuisine-patisserie', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/ingredients-cuisine-patisserie.png', order: 14, children: [] },
      { name: 'Noix & Graines', slug: 'noix-graines', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/noix-graines.png', order: 15, children: [] },
      { name: 'Plats cuisinés', slug: 'plats-cuisines', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/plats-cuisines.png', order: 16, children: [] },
      { name: 'Sauces - Epices - Condiments', slug: 'sauces-epices-condiments', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/sauces-epices-condiments.png', order: 17, children: [] },
      { name: 'Œufs', slug: 'oeufs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/oeufs.png', order: 18, children: [] },
      { name: 'Huiles', slug: 'huiles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/huiles.png', order: 19, children: [] },
      { name: 'Pâtes', slug: 'pates', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/pates.png', order: 20, children: [] },
      { name: 'Gateaux', slug: 'gateaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/gateaux.png', order: 21, children: [] },
      { name: 'Emballage', slug: 'emballage', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/emballage.png', order: 22, children: [] },
      { name: 'Aliments pour bébé', slug: 'aliments-bebe', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/aliments-bebe.png', order: 23, children: [] },
      { name: 'Aliments diététiques', slug: 'aliments-dietetiques', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/aliments-dietetiques.png', order: 24, children: [] },
      { name: 'Autre Alimentaires', slug: 'autre-alimentaires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/alimentaires/autre-alimentaires.png', order: 25, children: [] }
    ]
  },

  // ==================== 6. EMPLOI ====================
  {
    name: 'Emploi',
    slug: 'emploi',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/emploi/emploi.png',
    order: 13,
    children: [
      { name: 'Offres d\'emploi', slug: 'offres-emploi', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/emploi/offres-emploi.png', order: 1, children: [] },
      { name: 'Demandes d\'emploi', slug: 'demandes-emploi', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/emploi/demandes-emploi.png', order: 2, children: [] },
      { name: 'Autres services emploi', slug: 'autres-services-emploi', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/emploi/autres-services-emploi.png', order: 3, children: [] }
    ]
  },

  // ==================== 7. INFORMATIQUE ====================
  {
    name: 'Informatique',
    slug: 'informatique',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/informatique.png',
    order: 5,
    children: [
      {
        name: 'Ordinateurs portables',
        slug: 'ordinateurs-portables',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-portables.png',
        order: 1,
        children: [
          { name: 'Pc Portable', slug: 'pc-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-portables/pc-portable.png', children: [] },
          { name: 'Macbooks', slug: 'macbooks', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-portables/macbooks.png', children: [] }
        ]
      },
      {
        name: 'Ordinateurs de bureau',
        slug: 'ordinateurs-bureau',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-bureau.png',
        order: 2,
        children: [
          { name: 'Pc de bureau', slug: 'pc-bureau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-bureau/pc-bureau.png', children: [] },
          { name: 'Unités centrales', slug: 'unites-centrales', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-bureau/unites-centrales.png', children: [] },
          { name: 'All In One', slug: 'all-in-one', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ordinateurs-bureau/all-in-one.png', children: [] }
        ]
      },
      {
        name: 'Composants PC fixe',
        slug: 'composants-pc-fixe',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe.png',
        order: 3,
        children: [
          { name: 'Cartes mère', slug: 'cartes-mere', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/cartes-mere.png', children: [] },
          { name: 'Processeurs', slug: 'processeurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/processeurs.png', children: [] },
          { name: 'RAM', slug: 'ram', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/ram.png', children: [] },
          { name: 'Disques dur', slug: 'disques-dur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/disques-dur.png', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/cartes-graphique.png', children: [] },
          { name: 'Alimentations & Boitiers', slug: 'alimentations-boitiers', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/alimentations-boitiers.png', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/refroidissement.png', children: [] },
          { name: 'Lecteurs & Graveurs CD', slug: 'lecteurs-graveurs-cd', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/lecteurs-graveurs-cd.png', children: [] },
          { name: 'Autres', slug: 'autres-composants-fixe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-fixe/autres-composants-fixe.png', children: [] }
        ]
      },
      {
        name: 'Composants PC portable',
        slug: 'composants-pc-portable',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable.png',
        order: 4,
        children: [
          { name: 'Chargeurs', slug: 'chargeurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/chargeurs.png', children: [] },
          { name: 'Batteries', slug: 'batteries', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/batteries.png', children: [] },
          { name: 'Ecrans', slug: 'ecrans-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/ecrans-portable.png', children: [] },
          { name: 'Claviers & Touchpads', slug: 'claviers-touchpads', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/claviers-touchpads.png', children: [] },
          { name: 'Disques Dur', slug: 'disques-dur-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/disques-dur-portable.png', children: [] },
          { name: 'RAM', slug: 'ram-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/ram-portable.png', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/refroidissement-portable.png', children: [] },
          { name: 'Cartes mère', slug: 'cartes-mere-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/cartes-mere-portable.png', children: [] },
          { name: 'Processeurs', slug: 'processeurs-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/processeurs-portable.png', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/cartes-graphique-portable.png', children: [] },
          { name: 'Lecteurs & Graveurs', slug: 'lecteurs-graveurs-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/lecteurs-graveurs-portable.png', children: [] },
          { name: 'Baffles & Webcams', slug: 'baffles-webcams', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/baffles-webcams.png', children: [] },
          { name: 'Autres', slug: 'autres-composants-portable', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-pc-portable/autres-composants-portable.png', children: [] }
        ]
      },
      {
        name: 'Composants serveur',
        slug: 'composants-serveur',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur.png',
        order: 5,
        children: [
          { name: 'Cartes mère', slug: 'cartes-mere-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/cartes-mere-serveur.png', children: [] },
          { name: 'Processeurs', slug: 'processeurs-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/processeurs-serveur.png', children: [] },
          { name: 'RAM', slug: 'ram-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/ram-serveur.png', children: [] },
          { name: 'Disques dur', slug: 'disques-dur-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/disques-dur-serveur.png', children: [] },
          { name: 'Cartes réseau', slug: 'cartes-reseau-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/cartes-reseau-serveur.png', children: [] },
          { name: 'Alimentations', slug: 'alimentations-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/alimentations-serveur.png', children: [] },
          { name: 'Refroidissement', slug: 'refroidissement-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/refroidissement-serveur.png', children: [] },
          { name: 'Cartes graphique', slug: 'cartes-graphique-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/cartes-graphique-serveur.png', children: [] },
          { name: 'Autres', slug: 'autres-composants-serveur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/composants-serveur/autres-composants-serveur.png', children: [] }
        ]
      },
      {
        name: 'Imprimantes & Cartouches',
        slug: 'imprimantes-cartouches',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches.png',
        order: 6,
        children: [
          { name: 'Imprimantes jet d\'encre', slug: 'imprimantes-jet-encre', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/imprimantes-jet-encre.png', children: [] },
          { name: 'Imprimantes Laser', slug: 'imprimantes-laser', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/imprimantes-laser.png', children: [] },
          { name: 'Imprimantes matricielles', slug: 'imprimantes-matricielles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/imprimantes-matricielles.png', children: [] },
          { name: 'Codes à barre & Etiqueteuses', slug: 'codes-barre-etiqueteuses', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/codes-barre-etiqueteuses.png', children: [] },
          { name: 'Imprimantes photo & badges', slug: 'imprimantes-photo-badges', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/imprimantes-photo-badges.png', children: [] },
          { name: 'Photocopieuses professionnelles', slug: 'photocopieuses-professionnelles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/photocopieuses-professionnelles.png', children: [] },
          { name: 'Imprimantes 3D', slug: 'imprimantes-3d', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/imprimantes-3d.png', children: [] },
          { name: 'Cartouches & Toners', slug: 'cartouches-toners', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/cartouches-toners.png', children: [] },
          { name: 'Autre', slug: 'autre-imprimantes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/imprimantes-cartouches/autre-imprimantes.png', children: [] }
        ]
      },
      {
        name: 'Réseau & Connexion',
        slug: 'reseau-connexion',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion.png',
        order: 7,
        children: [
          { name: 'Modems & Routeurs', slug: 'modems-routeurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/modems-routeurs.png', children: [] },
          { name: 'Switchs', slug: 'switchs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/switchs.png', children: [] },
          { name: 'Point d\'accès wifi', slug: 'point-acces-wifi', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/point-acces-wifi.png', children: [] },
          { name: 'Répéteur Wi-Fi', slug: 'repeater-wifi', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/repeater-wifi.png', children: [] },
          { name: 'Cartes réseau', slug: 'cartes-reseau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/cartes-reseau.png', children: [] },
          { name: 'Autre', slug: 'autre-reseau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/reseau-connexion/autre-reseau.png', children: [] }
        ]
      },
      {
        name: 'Stockage externe & Racks',
        slug: 'stockage-externe-racks',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stockage-externe-racks.png',
        order: 8,
        children: [
          { name: 'Disques durs', slug: 'disques-durs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stockage-externe-racks/disques-durs.png', children: [] },
          { name: 'Flash disque', slug: 'flash-disque', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stockage-externe-racks/flash-disque.png', children: [] },
          { name: 'Carte mémoire', slug: 'carte-memoire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stockage-externe-racks/carte-memoire.png', children: [] },
          { name: 'Rack', slug: 'rack', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stockage-externe-racks/rack.png', children: [] }
        ]
      },
      { name: 'Serveurs', slug: 'serveurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/serveurs.png', order: 9, children: [] },
      { name: 'Ecrans', slug: 'ecrans', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/ecrans.png', order: 10, children: [] },
      { name: 'Onduleurs & Stabilisateurs', slug: 'onduleurs-stabilisateurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/onduleurs-stabilisateurs.png', order: 11, children: [] },
      { name: 'Compteuses de billets', slug: 'compteuses-billets', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/compteuses-billets.png', order: 12, children: [] },
      { name: 'Claviers & Souris', slug: 'claviers-souris', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/claviers-souris.png', order: 13, children: [] },
      { name: 'Casques & Son', slug: 'casques-son', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/casques-son.png', order: 14, children: [] },
      { name: 'Webcam & Vidéoconférence', slug: 'webcam-videoconference', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/webcam-videoconference.png', order: 15, children: [] },
      { name: 'Data shows', slug: 'data-shows', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/data-shows.png', order: 16, children: [] },
      { name: 'Câbles & Adaptateurs', slug: 'cables-adaptateurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/cables-adaptateurs.png', order: 17, children: [] },
      { name: 'Stylets & Tablettes', slug: 'stylers-tablettes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/stylers-tablettes.png', order: 18, children: [] },
      { name: 'Cartables & Sacoches', slug: 'cartables-sacoches', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/cartables-sacoches.png', order: 19, children: [] },
      { name: 'Manettes & Simulateurs', slug: 'manettes-simulateurs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/manettes-simulateurs.png', order: 20, children: [] },
      { name: 'VR', slug: 'vr', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/vr.png', order: 21, children: [] },
      { name: 'Logiciels & Abonnements', slug: 'logiciels-abonnements', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/logiciels-abonnements.png', order: 22, children: [] },
      { name: 'Bureautique', slug: 'bureautique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/bureautique.png', order: 23, children: [] },
      { name: 'Autre Informatique', slug: 'autre-informatique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/informatique/autre-informatique.png', order: 24, children: [] }
    ]
  },

  // ==================== 8. LOISIRS ====================
  {
    name: 'Loisirs & Divertissements',
    slug: 'loisirs',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/loisirs.png',
    order: 11,
    children: [
      {
        name: 'Animalerie',
        slug: 'animalerie',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie.png',
        order: 1,
        children: [
          { name: 'Produits de soin animal', slug: 'produits-soin-animal', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/produits-soin-animal.png', children: [] },
          { name: 'Chien', slug: 'chien', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/chien.png', children: [] },
          { name: 'Oiseau', slug: 'oiseau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/oiseau.png', children: [] },
          { name: 'Animaux de ferme', slug: 'animaux-ferme', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/animaux-ferme.png', children: [] },
          { name: 'Chat', slug: 'chat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/chat.png', children: [] },
          { name: 'Cheval', slug: 'cheval', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/cheval.png', children: [] },
          { name: 'Poisson', slug: 'poisson', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/poisson.png', children: [] },
          { name: 'Accessoire pour animaux', slug: 'accessoire-animaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/accessoire-animaux.png', children: [] },
          { name: 'Nourriture pour animaux', slug: 'nourriture-animaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/nourriture-animaux.png', children: [] },
          { name: 'Autres Animaux', slug: 'autres-animaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/animalerie/autres-animaux.png', children: [] }
        ]
      },
      {
        name: 'Consoles et Jeux Vidéos',
        slug: 'consoles-jeux-videos',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/consoles-jeux-videos.png',
        order: 2,
        children: [
          { name: 'Consoles', slug: 'consoles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/consoles-jeux-videos/consoles.png', children: [] },
          { name: 'Jeux videos', slug: 'jeux-videos', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/consoles-jeux-videos/jeux-videos.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-consoles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/consoles-jeux-videos/accessoires-consoles.png', children: [] }
        ]
      },
      {
        name: 'Livres & Magazines',
        slug: 'livres-magazines',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines.png',
        order: 3,
        children: [
          { name: 'Littérature et philosophie', slug: 'litterature-philosophie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/litterature-philosophie.png', children: [] },
          { name: 'Romans', slug: 'romans', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/romans.png', children: [] },
          { name: 'Scolaire & Parascolaire', slug: 'scolaire-parascolaire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/scolaire-parascolaire.png', children: [] },
          { name: 'Sciences, techniques et medecine', slug: 'sciences-techniques-medecine', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/sciences-techniques-medecine.png', children: [] },
          { name: 'Traduction', slug: 'traduction', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/traduction.png', children: [] },
          { name: 'Religion et Spiritualités', slug: 'religion-spiritualites', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/religion-spiritualites.png', children: [] },
          { name: 'Historique', slug: 'historique', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/historique.png', children: [] },
          { name: 'Cuisine', slug: 'cuisine-livres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/cuisine-livres.png', children: [] },
          { name: 'Essais et documents', slug: 'essais-documents', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/essais-documents.png', children: [] },
          { name: 'Fiction', slug: 'fiction', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/fiction.png', children: [] },
          { name: 'Enfants', slug: 'enfants-livres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/enfants-livres.png', children: [] },
          { name: 'Mangas et bande dessinée', slug: 'mangas-bande-dessinee', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/livres-magazines/mangas-bande-dessinee.png', children: [] }
        ]
      },
      {
        name: 'Instruments de Musique',
        slug: 'instruments-musique',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique.png',
        order: 4,
        children: [
          { name: 'Instruments électriques', slug: 'instruments-electriques', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique/instruments-electriques.png', children: [] },
          { name: 'Instruments à percussion', slug: 'instruments-percussion', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique/instruments-percussion.png', children: [] },
          { name: 'Instruments a vent', slug: 'instruments-vent', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique/instruments-vent.png', children: [] },
          { name: 'Instruments à cordes', slug: 'instruments-cordes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique/instruments-cordes.png', children: [] },
          { name: 'Autre', slug: 'autre-instruments', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/instruments-musique/autre-instruments.png', children: [] }
        ]
      },
      {
        name: 'Jouets',
        slug: 'jouets',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets.png',
        order: 5,
        children: [
          { name: 'Jeux d\'éveil', slug: 'jeux-eveil', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/jeux-eveil.png', children: [] },
          { name: 'Poupées - Peluches', slug: 'poupees-peluches', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/poupees-peluches.png', children: [] },
          { name: 'Personnages - Déguisements', slug: 'personnages-deguisements', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/personnages-deguisements.png', children: [] },
          { name: 'Jeux éducatifs - Puzzle', slug: 'jeux-educatifs-puzzle', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/jeux-educatifs-puzzle.png', children: [] },
          { name: 'Véhicules et Circuits', slug: 'vehicules-circuits', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/vehicules-circuits.png', children: [] },
          { name: 'Jeux électroniques', slug: 'jeux-electroniques', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/jeux-electroniques.png', children: [] },
          { name: 'Construction et Outils', slug: 'construction-outils', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/construction-outils.png', children: [] },
          { name: 'Jeux de plein air', slug: 'jeux-plein-air', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/jeux-plein-air.png', children: [] },
          { name: 'Animaux', slug: 'animaux-jouets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jouets/animaux-jouets.png', children: [] }
        ]
      },
      {
        name: 'Chasse & Pêche',
        slug: 'chasse-peche',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche.png',
        order: 6,
        children: [
          { name: 'Canne à pêche', slug: 'canne-peche', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/canne-peche.png', children: [] },
          { name: 'Moulinets', slug: 'moulinets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/moulinets.png', children: [] },
          { name: 'Sondeurs-GPS', slug: 'sondeurs-gps', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/sondeurs-gps.png', children: [] },
          { name: 'Vêtements', slug: 'vetements-chasse-peche', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/vetements-chasse-peche.png', children: [] },
          { name: 'Accessoires de pêche', slug: 'accessoires-peche', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/accessoires-peche.png', children: [] },
          { name: 'Matériel plongée', slug: 'materiel-plongee', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/materiel-plongee.png', children: [] },
          { name: 'Equipements de chasse', slug: 'equipements-chasse', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/chasse-peche/equipements-chasse.png', children: [] }
        ]
      },
      {
        name: 'Jardinage',
        slug: 'jardinage',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage.png',
        order: 7,
        children: [
          { name: 'Mobilier de jardin', slug: 'mobilier-jardin', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/mobilier-jardin.png', children: [] },
          { name: 'Semence', slug: 'semence', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/semence.png', children: [] },
          { name: 'Outillage-Arrosage du jardin', slug: 'outillage-arrosage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/outillage-arrosage.png', children: [] },
          { name: 'Plantes et fleurs', slug: 'plantes-fleurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/plantes-fleurs.png', children: [] },
          { name: 'Équipements Et Matériels', slug: 'equipements-materiels-jardin', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/equipements-materiels-jardin.png', children: [] },
          { name: 'Insecticide', slug: 'insecticide', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/insecticide.png', children: [] },
          { name: 'Décoration', slug: 'decoration-jardin', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/decoration-jardin.png', children: [] },
          { name: 'Livres D\'Agriculture Et De Jardinage', slug: 'livres-agriculture-jardin', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jardinage/livres-agriculture-jardin.png', children: [] }
        ]
      },
      {
        name: 'Les Jeux de loisirs',
        slug: 'jeux-loisirs',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs.png',
        order: 8,
        children: [
          { name: 'Babyfoot', slug: 'babyfoot', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/babyfoot.png', children: [] },
          { name: 'Billiard', slug: 'billiard', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/billiard.png', children: [] },
          { name: 'Ping pong', slug: 'ping-pong', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/ping-pong.png', children: [] },
          { name: 'Échecs', slug: 'echecs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/echecs.png', children: [] },
          { name: 'Jeux De Société', slug: 'jeux-societe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/jeux-societe.png', children: [] },
          { name: 'Autres Jeux De Loisirs', slug: 'autres-jeux-loisirs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/jeux-loisirs/autres-jeux-loisirs.png', children: [] }
        ]
      },
      {
        name: 'Barbecue & Grillades',
        slug: 'barbecue-grillades',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/barbecue-grillades.png',
        order: 9,
        children: [
          { name: 'Barbecue', slug: 'barbecue', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/barbecue-grillades/barbecue.png', children: [] },
          { name: 'Charbon', slug: 'charbon', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/barbecue-grillades/charbon.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-barbecue', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/barbecue-grillades/accessoires-barbecue.png', children: [] }
        ]
      },
      {
        name: 'Vapes & Chichas',
        slug: 'vapes-chichas',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/vapes-chichas.png',
        order: 10,
        children: [
          { name: 'Vapes & Cigarettes électroniques', slug: 'vapes-cigarettes-electroniques', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/vapes-chichas/vapes-cigarettes-electroniques.png', children: [] },
          { name: 'Chichas', slug: 'chichas', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/vapes-chichas/chichas.png', children: [] },
          { name: 'Consommables', slug: 'consommables', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/vapes-chichas/consommables.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-chichas', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/vapes-chichas/accessoires-chichas.png', children: [] }
        ]
      },
      {
        name: 'Produits & Accessoires d\'été',
        slug: 'produits-accessoires-ete',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete.png',
        order: 11,
        children: [
          { name: 'Piscines', slug: 'piscines', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/piscines.png', children: [] },
          { name: 'Matelas gonflables', slug: 'matelas-gonflables', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/matelas-gonflables.png', children: [] },
          { name: 'Parasols', slug: 'parasols', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/parasols.png', children: [] },
          { name: 'Transats & Chaises pliables', slug: 'transats-chaises-pliables', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/transats-chaises-pliables.png', children: [] },
          { name: 'Tables', slug: 'tables-ete', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/tables-ete.png', children: [] },
          { name: 'Autres', slug: 'autres-ete', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/produits-accessoires-ete/autres-ete.png', children: [] }
        ]
      },
      { name: 'Antiquités & Collections', slug: 'antiquites-collections', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/antiquites-collections.png', order: 12, children: [] },
      { name: 'Autre', slug: 'autre-loisirs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/loisirs/autre-loisirs.png', order: 13, children: [] }
    ]
  },

  // ==================== 9. MATERIAUX ====================
  {
    name: 'Matériaux & Équipement',
    slug: 'materiaux',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiaux.png',
    order: 14,
    children: [
      {
        name: 'Matériel professionnel',
        slug: 'materiel-professionnel',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel.png',
        order: 1,
        children: [
          { name: 'Industrie & Fabrication', slug: 'industrie-fabrication', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/industrie-fabrication.png', children: [] },
          { name: 'Alimentaire et Restauration', slug: 'alimentaire-restauration', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/alimentaire-restauration.png', children: [] },
          { name: 'Medical', slug: 'medical', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/medical.png', children: [] },
          { name: 'Batiment & Construction', slug: 'batiment-construction', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/batiment-construction.png', children: [] },
          { name: 'Matériel électrique', slug: 'materiel-electrique', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/materiel-electrique.png', children: [] },
          { name: 'Ateliers', slug: 'ateliers', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/ateliers.png', children: [] },
          { name: 'Stockage et magasinage', slug: 'stockage-magasinage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/stockage-magasinage.png', children: [] },
          { name: 'Équipement de protection', slug: 'equipement-protection', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/equipement-protection.png', children: [] },
          { name: 'Agriculture', slug: 'agriculture', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/agriculture.png', children: [] },
          { name: 'Réparation & Diagnostic', slug: 'reparation-diagnostic', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/reparation-diagnostic.png', children: [] },
          { name: 'Commerce de détail', slug: 'commerce-detail', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/commerce-detail.png', children: [] },
          { name: 'Coiffure et cosmétologie', slug: 'coiffure-cosmetologie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/coiffure-cosmetologie.png', children: [] },
          { name: 'Autres matériels pro', slug: 'autres-materiel-pro', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-professionnel/autres-materiel-pro.png', children: [] }
        ]
      },
      {
        name: 'Outillage professionnel',
        slug: 'outillage-professionnel',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel.png',
        order: 2,
        children: [
          { name: 'Perceuse', slug: 'perceuse', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel/perceuse.png', children: [] },
          { name: 'Meuleuse', slug: 'meuleuse', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel/meuleuse.png', children: [] },
          { name: 'Outillage à main', slug: 'outillage-main', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel/outillage-main.png', children: [] },
          { name: 'Scie', slug: 'scie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel/scie.png', children: [] },
          { name: 'Autres', slug: 'autres-outillage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/outillage-professionnel/autres-outillage.png', children: [] }
        ]
      },
      {
        name: 'Matériel Agricole',
        slug: 'materiel-agricole',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-agricole.png',
        order: 3,
        children: [
          { name: 'Equipement agricole', slug: 'equipement-agricole', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-agricole/equipement-agricole.png', children: [] },
          { name: 'Arbres', slug: 'arbres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-agricole/arbres.png', children: [] },
          { name: 'Terrain Agricole', slug: 'terrain-agricole-materiaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-agricole/terrain-agricole-materiaux.png', children: [] },
          { name: 'Autre', slug: 'autre-agricole', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiel-agricole/autre-agricole.png', children: [] }
        ]
      },
      { name: 'Materiaux de construction', slug: 'materiaux-construction', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/materiaux-construction.png', order: 4, children: [] },
      { name: 'Matières premières', slug: 'matieres-premieres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/matieres-premieres.png', order: 5, children: [] },
      { name: 'Produits d\'hygiène', slug: 'produits-hygiene', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/produits-hygiene.png', order: 6, children: [] },
      { name: 'Autre', slug: 'autre-materiaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/materiaux/autre-materiaux.png', order: 7, children: [] }
    ]
  },

  // ==================== 10. MEUBLES ====================
  {
    name: 'Meubles & Maison',
    slug: 'meubles',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles.png',
    order: 10,
    children: [
      { name: 'Salon', slug: 'salon', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/salon.png', order: 1, children: [] },
      { name: 'Chambres à coucher', slug: 'chambres-coucher', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/chambres-coucher.png', order: 2, children: [] },
      { name: 'Tables', slug: 'tables', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/tables.png', order: 3, children: [] },
      { name: 'Armoires & Commodes', slug: 'armoires-commodes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/armoires-commodes.png', order: 4, children: [] },
      { name: 'Lits', slug: 'lits', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/lits.png', order: 5, children: [] },
      { name: 'Meubles de Cuisine', slug: 'meubles-cuisine', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-cuisine.png', order: 6, children: [] },
      { name: 'Bibliothèques & Etagères', slug: 'bibliotheques-etageres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/bibliotheques-etageres.png', order: 7, children: [] },
      { name: 'Chaises & Fauteuils', slug: 'chaises-fauteuils', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/chaises-fauteuils.png', order: 8, children: [] },
      { name: 'Dressings', slug: 'dressings', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/dressings.png', order: 9, children: [] },
      { name: 'Meubles salle de bain', slug: 'meubles-salle-bain', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-salle-bain.png', order: 10, children: [] },
      { name: 'Buffet', slug: 'buffet', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/buffet.png', order: 11, children: [] },
      { name: 'Tables TV', slug: 'tables-tv', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/tables-tv.png', order: 12, children: [] },
      { name: 'Table pliante', slug: 'table-pliante', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/table-pliante.png', order: 13, children: [] },
      { name: 'Tables à manger', slug: 'tables-manger', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/tables-manger.png', order: 14, children: [] },
      { name: 'Tables PC & Bureaux', slug: 'tables-pc-bureaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/tables-pc-bureaux.png', order: 15, children: [] },
      { name: 'Canapé', slug: 'canape', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/canape.png', order: 16, children: [] },
      { name: 'Table basse', slug: 'table-basse', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/table-basse.png', order: 17, children: [] },
      { name: 'Rangement et Organisation', slug: 'rangement-organisation', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/rangement-organisation.png', order: 18, children: [] },
      { name: 'Accessoires de cuisine', slug: 'accessoires-cuisine', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/accessoires-cuisine.png', order: 19, children: [] },
      { name: 'Meuble d\'entrée', slug: 'meuble-entree', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meuble-entree.png', order: 20, children: [] },
      {
        name: 'Décoration',
        slug: 'decoration',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration.png',
        order: 21,
        children: [
          { name: 'Peinture et calligraphie', slug: 'peinture-calligraphie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/peinture-calligraphie.png', children: [] },
          { name: 'Décoration de cuisine', slug: 'decoration-cuisine', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/decoration-cuisine.png', children: [] },
          { name: 'Coussins & Housses', slug: 'coussins-housses', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/coussins-housses.png', children: [] },
          { name: 'Déco de Bain', slug: 'deco-bain', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/deco-bain.png', children: [] },
          { name: 'Art et Revêtement Mural', slug: 'art-revetement-mural', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/art-revetement-mural.png', children: [] },
          { name: 'Figurines et miniatures', slug: 'figurines-miniatures', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/figurines-miniatures.png', children: [] },
          { name: 'Cadres', slug: 'cadres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/cadres.png', children: [] },
          { name: 'Horloges', slug: 'horloges', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/horloges.png', children: [] },
          { name: 'Autres décoration', slug: 'autres-decoration', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/decoration/autres-decoration.png', children: [] }
        ]
      },
      {
        name: 'Vaisselle',
        slug: 'vaisselle',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle.png',
        order: 22,
        children: [
          { name: 'Pôeles, Casseroles et Marmites', slug: 'poeles-casseroles-marmites', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/poeles-casseroles-marmites.png', children: [] },
          { name: 'Cocottes', slug: 'cocottes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/cocottes.png', children: [] },
          { name: 'Plats à four et Plateaux', slug: 'plats-four-plateaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/plats-four-plateaux.png', children: [] },
          { name: 'Assiettes et Bols', slug: 'assiettes-bols', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/assiettes-bols.png', children: [] },
          { name: 'Couverts et ustensiles de cuisine', slug: 'couverts-ustensiles', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/couverts-ustensiles.png', children: [] },
          { name: 'Services à Boissons', slug: 'services-boissons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/services-boissons.png', children: [] },
          { name: 'Boites et bocaux', slug: 'boites-bocaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/boites-bocaux.png', children: [] },
          { name: 'Accessoires de pâtisserie', slug: 'accessoires-patisserie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/accessoires-patisserie.png', children: [] },
          { name: 'Vaisselles Artisanales', slug: 'vaisselles-artisanales', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/vaisselles-artisanales.png', children: [] },
          { name: 'Gadget de cuisine', slug: 'gadget-cuisine', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/gadget-cuisine.png', children: [] },
          { name: 'Vaisselle enfants', slug: 'vaisselle-enfants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/vaisselle/vaisselle-enfants.png', children: [] }
        ]
      },
      {
        name: 'Meubles de bureau',
        slug: 'meubles-bureau',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau.png',
        order: 23,
        children: [
          { name: 'Bureaux & Caissons', slug: 'bureaux-caissons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau/bureaux-caissons.png', children: [] },
          { name: 'Chaises', slug: 'chaises-bureau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau/chaises-bureau.png', children: [] },
          { name: 'Armoires & Rangements', slug: 'armoires-rangements-bureau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau/armoires-rangements-bureau.png', children: [] },
          { name: 'Accessoires de bureaux', slug: 'accessoires-bureaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau/accessoires-bureaux.png', children: [] },
          { name: 'Tables de réunion', slug: 'tables-reunion', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-bureau/tables-reunion.png', children: [] }
        ]
      },
      {
        name: 'Puériculture',
        slug: 'puericulture',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture.png',
        order: 24,
        children: [
          { name: 'Poussette', slug: 'poussette', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/poussette.png', children: [] },
          { name: 'Siège Auto', slug: 'siege-auto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/siege-auto.png', children: [] },
          { name: 'Meubles bébé', slug: 'meubles-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/meubles-bebe.png', children: [] },
          { name: 'Lit bébé', slug: 'lit-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/lit-bebe.png', children: [] },
          { name: 'Chaise bébé', slug: 'chaise-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/chaise-bebe.png', children: [] },
          { name: 'Autres', slug: 'autres-puericulture', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/puericulture/autres-puericulture.png', children: [] }
        ]
      },
      {
        name: 'Luminaire',
        slug: 'luminaire',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/luminaire.png',
        order: 25,
        children: [
          { name: 'Lustre', slug: 'lustre', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/luminaire/lustre.png', children: [] },
          { name: 'Lampadaire', slug: 'lampadaire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/luminaire/lampadaire.png', children: [] },
          { name: 'Éclairage extérieur', slug: 'eclairage-exterieur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/luminaire/eclairage-exterieur.png', children: [] },
          { name: 'Autres', slug: 'autres-luminaire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/luminaire/autres-luminaire.png', children: [] }
        ]
      },
      { name: 'Rideaux', slug: 'rideaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/rideaux.png', order: 26, children: [] },
      { name: 'Literie & Linge', slug: 'literie-linge', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/literie-linge.png', order: 27, children: [] },
      { name: 'Tapis & Moquettes', slug: 'tapis-moquettes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/tapis-moquettes.png', order: 28, children: [] },
      { name: 'Meubles d\'extérieur', slug: 'meubles-exterieur', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/meubles-exterieur.png', order: 29, children: [] },
      { name: 'Fournitures et articles scolaires', slug: 'fournitures-scolaires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/fournitures-scolaires.png', order: 30, children: [] },
      { name: 'Autre', slug: 'autre-meubles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/meubles/autre-meubles.png', order: 31, children: [] }
    ]
  },

  // ==================== 11. PIECES DETACHEES ====================
  {
    name: 'Pieces Detachees',
    slug: 'pieces-detachees',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-detachees.png',
    order: 6,
    children: [
      {
        name: 'Pièces automobiles',
        slug: 'pieces-automobiles',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles.png',
        order: 1,
        children: [
          { name: 'Moteur & Transmission', slug: 'moteur-transmission', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/moteur-transmission.png', children: [] },
          { name: 'Suspension & Direction', slug: 'suspension-direction', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/suspension-direction.png', children: [] },
          { name: 'Pièces intérieur', slug: 'pieces-interieur', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/pieces-interieur.png', children: [] },
          { name: 'Carrosserie', slug: 'carrosserie', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/carrosserie.png', children: [] },
          { name: 'Optiques & Éclairage', slug: 'optiques-eclairage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/optiques-eclairage.png', children: [] },
          { name: 'Vitres & pare-brise', slug: 'vitres-pare-brise', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/vitres-pare-brise.png', children: [] },
          { name: 'Pneus & Jantes', slug: 'pneus-jantes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/pneus-jantes.png', children: [] },
          { name: 'Housses & Tapis', slug: 'housses-tapis', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/housses-tapis.png', children: [] },
          { name: 'Batteries', slug: 'batteries-auto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/batteries-auto.png', children: [] },
          { name: 'Sono & Multimédia', slug: 'sono-multimedia', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/sono-multimedia.png', children: [] },
          { name: 'Sièges auto', slug: 'sieges-auto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/sieges-auto.png', children: [] },
          { name: 'Autres pièces auto', slug: 'autres-pieces-auto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-automobiles/autres-pieces-auto.png', children: [] }
        ]
      },
      {
        name: 'Pièces moto',
        slug: 'pieces-moto',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto.png',
        order: 2,
        children: [
          { name: 'Casques & Protections', slug: 'casques-protections', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto/casques-protections.png', children: [] },
          { name: 'Pneus & Jantes', slug: 'pneus-jantes-moto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto/pneus-jantes-moto.png', children: [] },
          { name: 'Optiques & Éclairage', slug: 'optiques-eclairage-moto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto/optiques-eclairage-moto.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-moto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto/accessoires-moto.png', children: [] },
          { name: 'Autres pièces moto', slug: 'autres-pieces-moto', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-moto/autres-pieces-moto.png', children: [] }
        ]
      },
      {
        name: 'Pièces bateaux',
        slug: 'pieces-bateaux',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-bateaux.png',
        order: 3,
        children: [
          { name: 'Moteurs', slug: 'moteurs-bateau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-bateaux/moteurs-bateau.png', children: [] },
          { name: 'Pièces', slug: 'pieces-bateau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-bateaux/pieces-bateau.png', children: [] },
          { name: 'Accessoires', slug: 'accessoires-bateau', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-bateaux/accessoires-bateau.png', children: [] },
          { name: 'Autres pièces bateaux', slug: 'autres-pieces-bateaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-bateaux/autres-pieces-bateaux.png', children: [] }
        ]
      },
      { name: 'Alarme & Sécurité', slug: 'alarme-securite', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/alarme-securite.png', order: 4, children: [] },
      { name: 'Nettoyage & Entretien', slug: 'nettoyage-entretien', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/nettoyage-entretien.png', order: 5, children: [] },
      { name: 'Outils de diagnostics', slug: 'outils-diagnostics', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/outils-diagnostics.png', order: 6, children: [] },
      { name: 'Lubrifiants', slug: 'lubrifiants', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/lubrifiants.png', order: 7, children: [] },
      { name: 'Pièces véhicules', slug: 'pieces-vehicules', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/pieces-vehicules.png', order: 8, children: [] },
      { name: 'Autres pièces', slug: 'autres-pieces', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/pieces-detachees/autres-pieces.png', order: 9, children: [] }
    ]
  },

  // ==================== 12. SANTE & BEAUTE ====================
  {
    name: 'Santé & Beauté',
    slug: 'sante-beaute',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/sante-beaute.png',
    order: 9,
    children: [
      {
        name: 'Cosmétiques & Beauté',
        slug: 'cosmetiques-beaute',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute.png',
        order: 1,
        children: [
          { name: 'Soins du corps', slug: 'soins-corps', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/soins-corps.png', children: [] },
          { name: 'Savons & Gels douche', slug: 'savons-gels-douche', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/savons-gels-douche.png', children: [] },
          { name: 'Soins visage', slug: 'soins-visage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/soins-visage.png', children: [] },
          { name: 'Maquillage', slug: 'maquillage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/maquillage.png', children: [] },
          { name: 'Produits Solaires & Bronzage', slug: 'produits-solaires-bronzage', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/produits-solaires-bronzage.png', children: [] },
          { name: 'Instruments & Outils de beauté', slug: 'instruments-outils-beaute', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/instruments-outils-beaute.png', children: [] },
          { name: 'Manucure et pedicure', slug: 'manucure-pedicure', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/manucure-pedicure.png', children: [] },
          { name: 'Rasage et Épilation', slug: 'rasage-epilation', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/rasage-epilation.png', children: [] },
          { name: 'Hygiène', slug: 'hygiene', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/hygiene.png', children: [] },
          { name: 'Coiffure', slug: 'coiffure', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/coiffure.png', children: [] },
          { name: 'Soins bébé', slug: 'soins-bebe', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/soins-bebe.png', children: [] },
          { name: 'Autres produits', slug: 'autres-produits-beaute', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/cosmetiques-beaute/autres-produits-beaute.png', children: [] }
        ]
      },
      {
        name: 'Parapharmacie & Santé',
        slug: 'parapharmacie-sante',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parapharmacie-sante.png',
        order: 2,
        children: [
          { name: 'Dispositifs médicaux', slug: 'dispositifs-medicaux', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parapharmacie-sante/dispositifs-medicaux.png', children: [] },
          { name: 'Complément Alimentaire', slug: 'complement-alimentaire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parapharmacie-sante/complement-alimentaire.png', children: [] },
          { name: 'Matériel Médical', slug: 'materiel-medical', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parapharmacie-sante/materiel-medical.png', children: [] },
          { name: 'Aliments Diététiques', slug: 'aliments-dietetiques-sante', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parapharmacie-sante/aliments-dietetiques-sante.png', children: [] }
        ]
      },
      { name: 'Parfums et déodorants femme', slug: 'parfums-deodorants-femme', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parfums-deodorants-femme.png', order: 3, children: [] },
      { name: 'Parfums et déodorants homme', slug: 'parfums-deodorants-homme', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/parfums-deodorants-homme.png', order: 4, children: [] },
      { name: 'Accessoires beauté', slug: 'accessoires-beaute', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/accessoires-beaute.png', order: 5, children: [] },
      { name: 'Soins cheveux', slug: 'soins-cheveux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/soins-cheveux.png', order: 6, children: [] },
      { name: 'Autre Santé & Beauté', slug: 'autre-sante-beaute', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sante-beaute/autre-sante-beaute.png', order: 7, children: [] }
    ]
  },

  // ==================== 13. SERVICES ====================
  {
    name: 'Services',
    slug: 'services',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/services.png',
    order: 16,
    children: [
      { name: 'Construction & Travaux', slug: 'construction-travaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/construction-travaux.png', order: 1, children: [] },
      { name: 'Ecoles & Formations', slug: 'ecoles-formations', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/ecoles-formations.png', order: 2, children: [] },
      { name: 'Industrie & Fabrication', slug: 'industrie-fabrication-services', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/industrie-fabrication-services.png', order: 3, children: [] },
      { name: 'Transport et déménagement', slug: 'transport-demenagement', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/transport-demenagement.png', order: 4, children: [] },
      { name: 'Décoration & Aménagement', slug: 'decoration-amenagement', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/decoration-amenagement.png', order: 5, children: [] },
      { name: 'Publicite & Communication', slug: 'publicite-communication', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/publicite-communication.png', order: 6, children: [] },
      { name: 'Nettoyage & Jardinage', slug: 'nettoyage-jardinage', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/nettoyage-jardinage.png', order: 7, children: [] },
      { name: 'Froid & Climatisation', slug: 'froid-climatisation', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/froid-climatisation.png', order: 8, children: [] },
      { name: 'Traiteurs & Gateaux', slug: 'traiteurs-gateaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/traiteurs-gateaux.png', order: 9, children: [] },
      { name: 'Médecine & Santé', slug: 'medecine-sante', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/medecine-sante.png', order: 10, children: [] },
      { name: 'Réparation auto & Diagnostic', slug: 'reparation-auto-diagnostic', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/reparation-auto-diagnostic.png', order: 11, children: [] },
      { name: 'Sécurité & Alarme', slug: 'securite-alarme', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/securite-alarme.png', order: 12, children: [] },
      { name: 'Projets & Études', slug: 'projets-etudes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/projets-etudes.png', order: 13, children: [] },
      { name: 'Bureautique & Internet', slug: 'bureautique-internet', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/bureautique-internet.png', order: 14, children: [] },
      { name: 'Location de véhicules', slug: 'location-vehicules', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/location-vehicules.png', order: 15, children: [] },
      { name: 'Menuiserie & Meubles', slug: 'menuiserie-meubles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/menuiserie-meubles.png', order: 16, children: [] },
      { name: 'Impression & Edition', slug: 'impression-edition', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/impression-edition.png', order: 17, children: [] },
      { name: 'Hôtellerie & Restauration & Salles', slug: 'hotellerie-restauration-salles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/hotellerie-restauration-salles.png', order: 18, children: [] },
      { name: 'Esthétique & Beauté', slug: 'esthetique-beaute', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/esthetique-beaute.png', order: 19, children: [] },
      { name: 'Image & Son', slug: 'image-son', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/image-son.png', order: 20, children: [] },
      { name: 'Comptabilité & Economie', slug: 'comptabilite-economie', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/comptabilite-economie.png', order: 21, children: [] },
      { name: 'Couture & Confection', slug: 'couture-confection', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/couture-confection.png', order: 22, children: [] },
      { name: 'Maintenance informatique', slug: 'maintenance-informatique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/maintenance-informatique.png', order: 23, children: [] },
      { name: 'Réparation Electromenager', slug: 'reparation-electromenager', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/reparation-electromenager.png', order: 24, children: [] },
      { name: 'Evènements & Divertissement', slug: 'evenements-divertissement', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/evenements-divertissement.png', order: 25, children: [] },
      { name: 'Paraboles & Démos', slug: 'paraboles-demos', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/paraboles-demos.png', order: 26, children: [] },
      { name: 'Réparation Électronique', slug: 'reparation-electronique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/reparation-electronique.png', order: 27, children: [] },
      { name: 'Services à l\'étranger', slug: 'services-etranger', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/services-etranger.png', order: 28, children: [] },
      { name: 'Flashage & Réparation des téléphones', slug: 'flashage-reparation-telephones', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/flashage-reparation-telephones.png', order: 29, children: [] },
      { name: 'Flashage & Installation des jeux', slug: 'flashage-installation-jeux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/flashage-installation-jeux.png', order: 30, children: [] },
      { name: 'Juridique', slug: 'juridique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/juridique.png', order: 31, children: [] },
      { name: 'Autres Services', slug: 'autres-services', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/services/autres-services.png', order: 32, children: [] }
    ]
  },

  // ==================== 14. SPORT ====================
  {
    name: 'Sport',
    slug: 'sport',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport.png',
    order: 12,
    children: [
      {
        name: 'Football',
        slug: 'football',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/football.png',
        order: 1,
        children: [
          { name: 'Ballons et Buts', slug: 'ballons-buts', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/football/ballons-buts.png', children: [] },
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-foot', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/football/equipements-accessoires-foot.png', children: [] },
          { name: 'Chaussures de Football', slug: 'chaussures-football', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/football/chaussures-football.png', children: [] },
          { name: 'Vêtements de football', slug: 'vetements-football', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/football/vetements-football.png', children: [] }
        ]
      },
      {
        name: 'Hand/Voley/ Basket-Ball',
        slug: 'hand-voley-basket',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/hand-voley-basket.png',
        order: 2,
        children: [
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-basket', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/hand-voley-basket/equipements-accessoires-basket.png', children: [] },
          { name: 'Ballons Buts et Filets', slug: 'ballons-buts-filets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/hand-voley-basket/ballons-buts-filets.png', children: [] },
          { name: 'Chaussures', slug: 'chaussures-basket', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/hand-voley-basket/chaussures-basket.png', children: [] },
          { name: 'Vêtements', slug: 'vetements-basket', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/hand-voley-basket/vetements-basket.png', children: [] }
        ]
      },
      {
        name: 'Sport de combat',
        slug: 'sport-combat',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport-combat.png',
        order: 3,
        children: [
          { name: 'Tenue', slug: 'tenue-combat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport-combat/tenue-combat.png', children: [] },
          { name: 'Gants et casques', slug: 'gants-casques', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport-combat/gants-casques.png', children: [] },
          { name: 'Autres accessoires', slug: 'autres-accessoires-combat', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport-combat/autres-accessoires-combat.png', children: [] }
        ]
      },
      {
        name: 'Fitness - Musculation',
        slug: 'fitness-musculation',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation.png',
        order: 4,
        children: [
          { name: 'Bancs et presses de musculation', slug: 'bancs-presses', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation/bancs-presses.png', children: [] },
          { name: 'Poids et haltères', slug: 'poids-halteres', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation/poids-halteres.png', children: [] },
          { name: 'Tapis roulants', slug: 'tapis-roulants', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation/tapis-roulants.png', children: [] },
          { name: 'Vélos et rameurs', slug: 'velos-rameurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation/velos-rameurs.png', children: [] },
          { name: 'Autres équipements', slug: 'autres-equipements-fitness', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/fitness-musculation/autres-equipements-fitness.png', children: [] }
        ]
      },
      {
        name: 'Natation',
        slug: 'natation',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation.png',
        order: 5,
        children: [
          { name: 'Lunettes', slug: 'lunettes-natation', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/lunettes-natation.png', children: [] },
          { name: 'Bonnets', slug: 'bonnets', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/bonnets.png', children: [] },
          { name: 'Palmes', slug: 'palmes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/palmes.png', children: [] },
          { name: 'Planches et flotteurs', slug: 'planches-flotteurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/planches-flotteurs.png', children: [] },
          { name: 'Maillots et combinaisons', slug: 'maillots-combinaisons', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/maillots-combinaisons.png', children: [] },
          { name: 'Autres accessoires', slug: 'autres-accessoires-natation', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/natation/autres-accessoires-natation.png', children: [] }
        ]
      },
      {
        name: 'Vélos et trotinettes',
        slug: 'velos-trotinettes',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/velos-trotinettes.png',
        order: 6,
        children: [
          { name: 'Vêtements et chaussures', slug: 'vetements-chaussures-velo', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/velos-trotinettes/vetements-chaussures-velo.png', children: [] },
          { name: 'Vélos', slug: 'velos', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/velos-trotinettes/velos.png', children: [] },
          { name: 'Trotinettes', slug: 'trotinettes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/velos-trotinettes/trotinettes.png', children: [] },
          { name: 'Équipements et accessoires', slug: 'equipements-accessoires-velo', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/velos-trotinettes/equipements-accessoires-velo.png', children: [] }
        ]
      },
      {
        name: 'Sports de raquette',
        slug: 'sports-raquette',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sports-raquette.png',
        order: 7,
        children: [
          { name: 'Tennis', slug: 'tennis', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sports-raquette/tennis.png', children: [] },
          { name: 'Tennis de table', slug: 'tennis-table', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sports-raquette/tennis-table.png', children: [] },
          { name: 'Autre', slug: 'autre-raquette', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sports-raquette/autre-raquette.png', children: [] }
        ]
      },
      { name: 'Sport aquatiques', slug: 'sport-aquatiques', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/sport-aquatiques.png', order: 8, children: [] },
      { name: 'Équitation', slug: 'equitation', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/equitation.png', order: 9, children: [] },
      { name: 'Pétanque', slug: 'petanque', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/petanque.png', order: 10, children: [] },
      { name: 'Autres', slug: 'autres-sports', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/sport/autres-sports.png', order: 11, children: [] }
    ]
  },

  // ==================== 15. VOYAGES ====================
  {
    name: 'Voyages',
    slug: 'voyages',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/voyages.png',
    order: 15,
    children: [
      { name: 'Voyage organisé', slug: 'voyage-organise', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/voyage-organise.png', order: 1, children: [] },
      { name: 'Location vacances', slug: 'location-vacances-voyages', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/location-vacances-voyages.png', order: 2, children: [] },
      { name: 'Hajj & Omra', slug: 'hajj-omra', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/hajj-omra.png', order: 3, children: [] },
      { name: 'Réservations & Visa', slug: 'reservations-visa', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/reservations-visa.png', order: 4, children: [] },
      { name: 'Séjour', slug: 'sejour', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/sejour.png', order: 5, children: [] },
      { name: 'Croisière', slug: 'croisiere', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/croisiere.png', order: 6, children: [] },
      { name: 'Autre voyages', slug: 'autre-voyages', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/voyages/autre-voyages.png', order: 7, children: [] }
    ]
  },

  // ==================== 16. BOUTIQUES ====================
  {
    name: 'Boutiques',
    slug: 'boutiques',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/boutiques.png',
    order: 0,
    children: [
      { name: 'Agences immobilières', slug: 'agences-immobilieres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/agences-immobilieres.png', order: 1, children: [] },
      { name: 'Promotions immobilières', slug: 'promotions-immobilieres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/promotions-immobilieres.png', order: 2, children: [] },
      { name: 'Showroom automobiles', slug: 'showroom-automobiles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/showroom-automobiles.png', order: 3, children: [] },
      { name: 'Showroom moto', slug: 'showroom-moto', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/showroom-moto.png', order: 4, children: [] },
      { name: 'Camions & Engins', slug: 'camions-engins', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/camions-engins.png', order: 5, children: [] },
      { name: 'Pièces & Accessoires Véhicules', slug: 'pieces-accessoires-vehicules', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/pieces-accessoires-vehicules.png', order: 6, children: [] },
      { name: 'Location de voitures', slug: 'location-voitures', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/location-voitures.png', order: 7, children: [] },
      { name: 'Réparation & Services Véhicules', slug: 'reparation-services-vehicules', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/reparation-services-vehicules.png', order: 8, children: [] },
      { name: 'Téléphones & Accessoires', slug: 'telephones-accessoires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/telephones-accessoires.png', order: 9, children: [] },
      { name: 'Magasin d\'informatique', slug: 'magasin-informatique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/magasin-informatique.png', order: 10, children: [] },
      { name: 'Magasin d\'électroménager', slug: 'magasin-electromenager', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/magasin-electromenager.png', order: 11, children: [] },
      { name: 'Equipements de sécurité', slug: 'equipements-securite', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/equipements-securite.png', order: 12, children: [] },
      { name: 'Audiovisuel', slug: 'audiovisuel', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/audiovisuel.png', order: 13, children: [] },
      { name: 'Electronique', slug: 'electronique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/electronique.png', order: 14, children: [] },
      { name: 'Vêtements & Accessoires de mode', slug: 'vetements-accessoires-mode', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/vetements-accessoires-mode.png', order: 15, children: [] },
      { name: 'Cosmétiques & Beauté', slug: 'cosmetiques-et-beaute', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/cosmetiques-et-beaute.png', order: 16, children: [] },
      { name: 'Maison & Meubles', slug: 'maison-meubles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/maison-meubles.png', order: 17, children: [] },
      { name: 'Meubles de bureau', slug: 'meubles-et-bureau', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/meubles-et-bureau.png', order: 18, children: [] },
      { name: 'Vaisselles', slug: 'vaisselles', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/vaisselles.png', order: 19, children: [] },
      { name: 'Puéricultures & Jouets', slug: 'puericultures-jouets', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/puericultures-jouets.png', order: 20, children: [] },
      { name: 'Jardinage', slug: 'jardinages', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/jardinage.png', order: 21, children: [] },
      { name: 'Fournitures & Articles scolaires', slug: 'fournitures-articles-scolaires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/fournitures-articles-scolaires.png', order: 22, children: [] },
      { name: 'Articles de sport', slug: 'articles-sport', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/articles-sport.png', order: 23, children: [] },
      { name: 'Consoles & Jeux vidéo', slug: 'consoles-jeux-video', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/consoles-jeux-video.png', order: 24, children: [] },
      { name: 'Librairie & Papeterie', slug: 'librairie-papeterie', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/librairie-papeterie.png', order: 25, children: [] },
      { name: 'Instruments de musique', slug: 'instruments-et-musique', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/instruments-et-musique.png', order: 26, children: [] },
      { name: 'Chasse & Pêche', slug: 'chasse-et-peche', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/chasse-et-peche.png', order: 27, children: [] },
      { name: 'Outillages & Quincaillerie', slug: 'outillages-quincaillerie', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/outillages-quincaillerie.png', order: 28, children: [] },
      { name: 'Matériaux de construction', slug: 'materiaux-et-construction', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/materiaux-et-onstruction.png', order: 29, children: [] },
      { name: 'Matériel professionnel', slug: 'materiel-et-professionnel', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/materiel-et-professionnel.png', order: 30, children: [] },
      { name: 'Matières premières', slug: 'matieres-et-premieres', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/matieres-et-premieres.png', order: 31, children: [] },
      { name: 'Agences de voyages', slug: 'agences-voyages', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/agences-voyages.png', order: 32, children: [] },
      { name: 'Animalerie', slug: 'animaleries', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/animalerie.png', order: 33, children: [] },
      { name: 'Alimentaire', slug: 'alimentaire', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/alimentaire.png', order: 34, children: [] },
      { name: 'Transport & Déménagement', slug: 'transport-et-demenagement', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/transport-et-demenagement.png', order: 35, children: [] },
      { name: 'Travaux de Construction & d\'Aménagement', slug: 'travaux-construction-amenagement', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/travaux-construction-amenagement.png', order: 36, children: [] },
      { name: 'Ecoles & Formations', slug: 'ecoles-et-formations', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/ecoles-et-formations.png', order: 37, children: [] },
      { name: 'Publicité & Communication', slug: 'publicite-et-communication', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/publicite-et-communication.png', order: 38, children: [] },
      { name: 'Service de Nettoyage & Entretien', slug: 'service-nettoyage-entretien', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/service-nettoyage-entretien.png', order: 39, children: [] },
      { name: 'Froid & Climatisation', slug: 'froid-et-climatisation', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/froid-et-climatisation.png', order: 40, children: [] },
      { name: 'Traiteur & Gateaux', slug: 'traiteur-gateaux', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/traiteur-gateaux.png', order: 41, children: [] },
      { name: 'Hôtels', slug: 'hotels', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/hotels.png', order: 42, children: [] },
      { name: 'Restaurants & Salles des fêtes', slug: 'restaurants-salles-fetes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/restaurants-salles-fetes.png', order: 43, children: [] },
      { name: 'Services de santé', slug: 'services-sante', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/services-sante.png', order: 44, children: [] },
      { name: 'Etudes & Consulting', slug: 'etudes-consulting', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/etudes-consulting.png', order: 45, children: [] },
      { name: 'Logiciel & Web services', slug: 'logiciel-web-services', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/logiciel-web-services.png', order: 46, children: [] },
      { name: 'Esthétique & Bien être', slug: 'esthetique-bien-etre', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/esthetique-bien-etre.png', order: 47, children: [] },
      { name: 'Comptabilité & Finance', slug: 'comptabilite-finance', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/comptabilite-finance.png', order: 48, children: [] },
      { name: 'Couture & Confection', slug: 'couture-et-confection', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/couture-et-confection.png', order: 49, children: [] },
      { name: 'Réparation Electronique & Electroménager', slug: 'reparation-electronique-electromenager', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/boutiques/reparation-electronique-electromenager.png', order: 50, children: [] }
    ]
  },

  // ==================== 17. TÉLÉPHONE ====================
  {
    name: 'Téléphone',
    slug: 'telephone',
    level: 1,
    icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/telephone.png',
    order: 4,
    children: [
      { name: 'Smartphones', slug: 'smartphones', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/smartphones.png', order: 1, children: [] },
      { name: 'Téléphones cellulaires', slug: 'telephones-cellulaires', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/telephones-cellulaires.png', order: 2, children: [] },
      { name: 'Tablettes', slug: 'tablettes', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/tablettes.png', order: 3, children: [] },
      { name: 'Fixes & Fax', slug: 'fixes-fax', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/fixes-fax.png', order: 4, children: [] },
      { name: 'Smartwatchs', slug: 'smartwatchs', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/smartwatchs.png', order: 5, children: [] },
      { name: 'Pièces de rechange', slug: 'pieces-rechange-telephone', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/pieces-rechange-telephone.png', order: 7, children: [] },
      { name: 'Offres & Abonnements', slug: 'offres-abonnements', level: 2, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/offres-abonnements.png', order: 8, children: [] },
      {
        name: 'Accessoires',
        slug: 'accessoires-telephone',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone.png',
        order: 6,
        children: [
          { name: 'Étuis', slug: 'etuis', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone/etuis.png', children: [] },
          { name: 'Films de protection', slug: 'films-protection', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone/films-protection.png', children: [] },
          { name: 'Protections d\'écran', slug: 'protections-ecran', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone/protections-ecran.png', children: [] },
          { name: 'Coques & Antichoc', slug: 'coques-antichoc', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone/coques-antichoc.png', children: [] },
          { name: 'Protections de caméra', slug: 'protections-camera', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/accessoires-telephone/protections-camera.png', children: [] }
        ]
      },
      {
        name: 'Protection & Antichoc',
        slug: 'protection-antichoc',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc.png',
        order: 9,
        children: [
          { name: 'Protections d\'écran renforcées', slug: 'protections-ecran-renforcees', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc/protections-ecran-renforcees.png', children: [] },
          { name: 'Coques antichoc', slug: 'coques-antichoc-pro', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc/coques-antichoc-pro.png', children: [] },
          { name: 'Films de protection', slug: 'films-protection-antichoc', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc/films-protection-antichoc.png', children: [] },
          { name: 'Étuis renforcés', slug: 'etuis-renforces', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc/etuis-renforces.png', children: [] },
          { name: 'Protections de caméra', slug: 'protections-camera-antichoc', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/protection-antichoc/protections-camera-antichoc.png', children: [] }
        ]
      },
      {
        name: 'Ecouteurs & Son',
        slug: 'ecouteurs-son',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son.png',
        order: 10,
        children: [
          { name: 'Écouteurs filaires', slug: 'ecouteurs-filaires', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son/ecouteurs-filaires.png', children: [] },
          { name: 'Écouteurs Bluetooth', slug: 'ecouteurs-bluetooth', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son/ecouteurs-bluetooth.png', children: [] },
          { name: 'Casques audio', slug: 'casques-audio', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son/casques-audio.png', children: [] },
          { name: 'Hauts-parleurs portables', slug: 'hauts-parleurs-portables', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son/hauts-parleurs-portables.png', children: [] },
          { name: 'Adaptateurs audio', slug: 'adaptateurs-audio', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/ecouteurs-son/adaptateurs-audio.png', children: [] }
        ]
      },
      {
        name: 'Chargeurs & Câbles',
        slug: 'chargeurs-cables',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables.png',
        order: 11,
        children: [
          { name: 'Chargeurs mural', slug: 'chargeurs-mural', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/chargeurs-mural.png', children: [] },
          { name: 'Chargeurs voiture', slug: 'chargeurs-voiture', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/chargeurs-voiture.png', children: [] },
          { name: 'Chargeurs sans fil', slug: 'chargeurs-sans-fil', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/chargeurs-sans-fil.png', children: [] },
          { name: 'Câbles USB', slug: 'cables-usb', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/cables-usb.png', children: [] },
          { name: 'Câbles Lightning', slug: 'cables-lightning', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/cables-lightning.png', children: [] },
          { name: 'Câbles Type-C', slug: 'cables-type-c', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/cables-type-c.png', children: [] },
          { name: 'Hubs chargeurs', slug: 'hubs-chargeurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/chargeurs-cables/hubs-chargeurs.png', children: [] }
        ]
      },
      {
        name: 'Supports & Stabilisateurs',
        slug: 'supports-stabilisateurs',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs.png',
        order: 12,
        children: [
          { name: 'Supports téléphone', slug: 'supports-telephone', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs/supports-telephone.png', children: [] },
          { name: 'Stabilisateurs', slug: 'stabilisateurs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs/stabilisateurs.png', children: [] },
          { name: 'Barres de selfies', slug: 'barres-selfies', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs/barres-selfies.png', children: [] },
          { name: 'Pieds pour téléphone', slug: 'pieds-telephone', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs/pieds-telephone.png', children: [] },
          { name: 'Ventouses voiture', slug: 'ventouses-voiture', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/supports-stabilisateurs/ventouses-voiture.png', children: [] }
        ]
      },
      {
        name: 'Manettes',
        slug: 'manettes-telephone',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone.png',
        order: 13,
        children: [
          { name: 'Manettes Bluetooth', slug: 'manettes-bluetooth', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone/manettes-bluetooth.png', children: [] },
          { name: 'Manettes filaires', slug: 'manettes-filaires', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone/manettes-filaires.png', children: [] },
          { name: 'Manettes pour téléphone', slug: 'manettes-pour-telephone', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone/manettes-pour-telephone.png', children: [] },
          { name: 'Manettes pour tablette', slug: 'manettes-pour-tablette', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone/manettes-pour-tablette.png', children: [] },
          { name: 'Accessoires pour manettes', slug: 'accessoires-manettes', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/manettes-telephone/accessoires-manettes.png', children: [] }
        ]
      },
      {
        name: 'VR',
        slug: 'vr-telephone',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone.png',
        order: 14,
        children: [
          { name: 'Casques VR', slug: 'casques-vr', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone/casques-vr.png', children: [] },
          { name: 'Lunettes VR', slug: 'lunettes-vr', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone/lunettes-vr.png', children: [] },
          { name: 'Accessoires VR', slug: 'accessoires-vr', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone/accessoires-vr.png', children: [] },
          { name: 'Contrôleurs VR', slug: 'controleurs-vr', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone/controleurs-vr.png', children: [] },
          { name: 'Jeux VR', slug: 'jeux-vr', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/vr-telephone/jeux-vr.png', children: [] }
        ]
      },
      {
        name: 'Power banks',
        slug: 'power-banks',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks.png',
        order: 15,
        children: [
          { name: 'Power bank 10,000mAh', slug: 'power-bank-10000mah', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks/power-bank-10000mah.png', children: [] },
          { name: 'Power bank 20,000mAh', slug: 'power-bank-20000mah', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks/power-bank-20000mah.png', children: [] },
          { name: 'Power bank solaire', slug: 'power-bank-solaire', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks/power-bank-solaire.png', children: [] },
          { name: 'Power bank charge rapide', slug: 'power-bank-rapide', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks/power-bank-rapide.png', children: [] },
          { name: 'Power bank compact', slug: 'power-bank-compact', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/power-banks/power-bank-compact.png', children: [] }
        ]
      },
      {
        name: 'Stylets',
        slug: 'stylets',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets.png',
        order: 16,
        children: [
          { name: 'Stylets actifs', slug: 'stylets-actifs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets/stylets-actifs.png', children: [] },
          { name: 'Stylets passifs', slug: 'stylets-passifs', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets/stylets-passifs.png', children: [] },
          { name: 'Stylets Bluetooth', slug: 'stylets-bluetooth', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets/stylets-bluetooth.png', children: [] },
          { name: 'Stylets pour tablette', slug: 'stylets-tablette', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets/stylets-tablette.png', children: [] },
          { name: 'Recharges pour stylet', slug: 'recharges-stylet', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/stylets/recharges-stylet.png', children: [] }
        ]
      },
      {
        name: 'Cartes Mémoire',
        slug: 'cartes-memoire',
        level: 2,
        icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire.png',
        order: 17,
        children: [
          { name: 'Cartes SD', slug: 'cartes-sd', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/cartes-sd.png', children: [] },
          { name: 'Cartes Micro SD', slug: 'cartes-micro-sd', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/cartes-micro-sd.png', children: [] },
          { name: 'Cartes SDHC', slug: 'cartes-sdhc', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/cartes-sdhc.png', children: [] },
          { name: 'Cartes SDXC', slug: 'cartes-sdxc', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/cartes-sdxc.png', children: [] },
          { name: 'Adaptateurs de carte', slug: 'adaptateurs-carte', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/adaptateurs-carte.png', children: [] },
          { name: 'Lecteurs de carte', slug: 'lecteurs-carte', level: 3, icon: 'https://res.cloudinary.com/dfjipgj2o/image/upload/marketplace/icons/telephone/cartes-memoire/lecteurs-carte.png', children: [] }
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
      console.log(`✅ ${'  '.repeat(categoryData.level - 1)}${categoryData.name} (/${categoryData.slug}) - Icon: ${categoryData.icon}`);

      if (children && children.length > 0) {
        for (const childData of children) {
          await createCategory(childData, category._id);
        }
      }
    };

    // Crear categorías
    console.log('🌱 Iniciando seed con iconos PNG para todas las categorías...');
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
    console.log('\n✨ TODAS las categorías tienen iconos PNG de Cloudinary');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};
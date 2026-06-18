// node subircategoriascloudinary.js
// ============================================================
// Script para crear carpetas y subir imágenes de categorías a Cloudinary
// con estructura: Home/categories/categoria/subcategoria/...
// Basado en la estructura del objeto categories de categoriesData2.js
// ============================================================

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// ============================================================
// CONFIGURACIÓN
// ============================================================
const CLOUDINARY_ROOT_FOLDER = 'categories';   // Carpeta base en Cloudinary
const LOCAL_CATEGORIES_PATH = path.join(__dirname, 'client', 'public', 'categories');
const OUTPUT_DIR = path.join(__dirname, 'uploads');

// Credenciales Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfjipgj2o',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Faltan credenciales en .env');
  process.exit(1);
}

// Crear carpeta de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ============================================================
// ESTRUCTURA DE CATEGORÍAS (copiada de categoriesData2.js)
// ============================================================
const categories = {
  // ==================== 1. VEHICULES ====================
  "vehicules": {
    "level1": ["vehicules.png"],
    "level2": ["voitures.png", "utilitaire.png", "motos-scooters.png", "quads.png", "fourgon.png", "camion.png", "bus.png", "engin.png", "tracteurs.png", "remorques.png", "bateaux-barques.png"],
    "level3": []
  },

  // ==================== 2. VETEMENTS ====================
  "vetements": {
    "level1": ["vetements.png"],
    "level2": ["vetements-homme.png", "vetements-femme.png", "chaussures-homme.png", "chaussures-femme.png", "garcons.png", "filles.png", "bebe.png", "sacs-valises.png", "montres.png", "lunettes.png", "bijoux.png", "tenues-professionnelles.png"],
    "level3": {
      "vetements-homme": ["hauts-chemises.png", "jeans-pantalons.png", "shorts-pantacourts.png", "vestes-gilets.png", "costumes-blazers.png", "survetements.png", "kamiss.png", "sous-vetements.png", "pyjamas.png", "maillots-bain.png", "casquettes-chapeaux.png", "chaussettes.png", "ceintures.png", "gants.png", "cravates.png", "autre-homme.png"],
      "vetements-femme": ["hauts-chemises-femme.png", "jeans-pantalons-femme.png", "shorts-pantacourts-femme.png", "vestes-gilets-femme.png", "ensembles.png", "abayas-hijabs.png", "mariages-fetes.png", "maternite.png", "robes.png", "jupes.png", "joggings-survetements-femme.png", "leggings.png", "sous-vetements-lingerie.png", "pyjamas-femme.png", "peignoirs.png", "maillots-bain-femme.png", "casquettes-chapeaux-femme.png", "chaussettes-collants.png", "foulards-echarpes.png", "ceintures-femme.png", "gants-femme.png", "autre-femme.png"],
      "chaussures-homme": ["basquettes.png", "bottes.png", "classiques.png", "mocassins.png", "sandales.png", "tangues-pantoufles.png", "autre-chaussures-homme.png"],
      "chaussures-femme": ["basquettes-femme.png", "sandales-femme.png", "bottes-femme.png", "escarpins.png", "ballerines.png", "tangues-pantoufles-femme.png", "autre-chaussures-femme.png"],
      "garcons": ["chaussures-garcons.png", "hauts-chemises-garcons.png", "pantalons-shorts-garcons.png", "vestes-gilets-garcons.png", "costumes-garcons.png", "survetements-joggings-garcons.png", "pyjamas-garcons.png", "sous-vetements-garcons.png", "maillots-bain-garcons.png", "kamiss-garcons.png", "casquettes-chapeaux-garcons.png", "autre-garcons.png"],
      "filles": ["chaussures-filles.png", "hauts-chemises-filles.png", "pantalons-shorts-filles.png", "vestes-gilets-filles.png", "robes-filles.png", "jupes-filles.png", "ensembles-filles.png", "joggings-survetements-filles.png", "pyjamas-filles.png", "sous-vetements-filles.png", "leggings-collants.png", "maillots-bain-filles.png", "casquettes-chapeaux-filles.png", "autre-filles.png"],
      "bebe": ["vetements-bebe.png", "chaussures-bebe.png", "accessoires-bebe.png"],
      "sacs-valises": ["pochettes-portefeuilles.png", "sacs-main.png", "sacs-dos.png", "sacs-professionnels.png", "valises.png", "cabas-sport.png", "autre-sacs.png"],
      "montres": ["montres-hommes.png", "montres-femmes.png"],
      "lunettes": ["lunettes-vue-hommes.png", "lunettes-vue-femmes.png", "lunettes-soleil-hommes.png", "lunettes-soleil-femmes.png", "lunettes-vue-enfants.png", "lunettes-soleil-enfants.png", "accessoires-lunettes.png"],
      "bijoux": ["parures.png", "colliers-pendentifs.png", "bracelets.png", "bagues.png", "boucles.png", "chevilleres.png", "piercings.png", "accessoires-cheveux.png", "broches.png", "autre-bijoux.png"]
    }
  },

  // ==================== 3. ELECTROMENAGER ====================
  "electromenager": {
    "level1": ["electromenager.png"],
    "level2": ["televiseurs.png", "demodulateurs-box-tv.png", "paraboles-switch-tv.png", "abonnements-iptv.png", "cameras-accessories.png", "audio.png", "aspirateurs-nettoyeurs.png", "repassage.png", "beaute-hygiene.png", "machines-coudre.png", "telecommandes.png", "securite-gps.png", "composants-electroniques.png", "pieces-rechange.png", "autre-electromenager.png", "refrigerateurs-congelateurs.png", "machines-laver.png", "lave-vaisselles.png", "fours-cuisson.png", "chauffage-climatisation.png", "appareils-cuisine.png"],
    "level3": {
      "refrigerateurs-congelateurs": ["refrigerateur.png", "congelateur.png", "refrigerateur-congelateur.png", "cave-vin.png"],
      "machines-laver": ["lave-linge.png", "seche-linge.png", "lave-linge-seche-linge.png", "lave-linge-essorage.png"],
      "lave-vaisselles": ["lave-vaisselle-encastrable.png", "lave-vaisselle-poselibre.png", "lave-vaisselle-compact.png"],
      "fours-cuisson": ["four-electrique.png", "four-gaz.png", "four-micro-ondes.png", "plaque-cuisson.png", "cuisiniere.png"],
      "chauffage-climatisation": ["climatiseur.png", "ventilateur.png", "radiateur.png", "chauffe-eau.png", "pompe-chaleur.png"],
      "appareils-cuisine": ["robot-cuisine.png", "mixeur.png", "bouilloire.png", "cafetiere.png", "grille-pain.png"]
    }
  },

  // ==================== 4. IMMOBILIER ====================
  "immobilier": {
    "level1": ["immobilier.png"],
    "level2": ["vente.png", "location.png", "location-vacances.png", "cherche-location.png", "cherche-achat.png"],
    "level3": {
      "vente": ["appartement.png", "local.png", "villa.png", "terrain.png", "terrain-agricole.png", "immeuble.png", "bungalow.png", "hangar-usine.png", "autre-vente.png"],
      "location": ["appartement-location.png", "local-location.png", "villa-location.png", "immeuble-location.png", "bungalow-location.png", "autre-location.png"],
      "location-vacances": ["appartement-vacances.png", "villa-vacances.png", "bungalow-vacances.png", "autre-vacances.png"],
      "cherche-location": ["appartement-cherche-location.png", "local-cherche-location.png", "villa-cherche-location.png", "immeuble-cherche-location.png", "bungalow-cherche-location.png", "autre-cherche-location.png"],
      "cherche-achat": ["appartement-cherche-achat.png", "local-cherche-achat.png", "villa-cherche-achat.png", "terrain-cherche-achat.png", "terrain-agricole-cherche-achat.png", "immeuble-cherche-achat.png", "bungalow-cherche-achat.png", "hangar-usine-cherche-achat.png", "autre-cherche-achat.png"]
    }
  },

  // ==================== 5. ALIMENTAIRES ====================
  "alimentaires": {
    "level1": ["alimentaires.png"],
    "level2": ["produits-laitiers.png", "fruits-secs.png", "graines-riz-cereales.png", "sucres-produits-sucres.png", "boissons.png", "viandes-poissons.png", "cafe-the-infusion.png", "complements-alimentaires.png", "miel-derives.png", "fruits-legumes.png", "ble-farine.png", "bonbons-chocolat.png", "boulangerie-viennoiserie.png", "ingredients-cuisine-patisserie.png", "noix-graines.png", "plats-cuisines.png", "sauces-epices-condiments.png", "oeufs.png", "huiles.png", "pates.png", "gateaux.png", "emballage.png", "aliments-bebe.png", "aliments-dietetiques.png", "autre-alimentaires.png"],
    "level3": {}
  },

  // ==================== 6. EMPLOI ====================
  "emploi": {
    "level1": ["emploi.png"],
    "level2": ["offres-emploi.png", "demandes-emploi.png", "autres-services-emploi.png"],
    "level3": {}
  },

  // ==================== 7. INFORMATIQUE ====================
  "informatique": {
    "level1": ["informatique.png"],
    "level2": ["ordinateurs-portables.png", "ordinateurs-bureau.png", "composants-pc-fixe.png", "composants-pc-portable.png", "composants-serveur.png", "imprimantes-cartouches.png", "reseau-connexion.png", "stockage-externe-racks.png", "serveurs.png", "ecrans.png", "onduleurs-stabilisateurs.png", "compteuses-billets.png", "claviers-souris.png", "casques-son.png", "webcam-videoconference.png", "data-shows.png", "cables-adaptateurs.png", "stylers-tablettes.png", "cartables-sacoches.png", "manettes-simulateurs.png", "vr.png", "logiciels-abonnements.png", "bureautique.png", "autre-informatique.png"],
    "level3": {
      "ordinateurs-portables": ["pc-portable.png", "macbooks.png"],
      "ordinateurs-bureau": ["pc-bureau.png", "unites-centrales.png", "all-in-one.png"],
      "composants-pc-fixe": ["cartes-mere.png", "processeurs.png", "ram.png", "disques-dur.png", "cartes-graphique.png", "alimentations-boitiers.png", "refroidissement.png", "lecteurs-graveurs-cd.png", "autres-composants-fixe.png"],
      "composants-pc-portable": ["chargeurs.png", "batteries.png", "ecrans-portable.png", "claviers-touchpads.png", "disques-dur-portable.png", "ram-portable.png", "refroidissement-portable.png", "cartes-mere-portable.png", "processeurs-portable.png", "cartes-graphique-portable.png", "lecteurs-graveurs-portable.png", "baffles-webcams.png", "autres-composants-portable.png"],
      "composants-serveur": ["cartes-mere-serveur.png", "processeurs-serveur.png", "ram-serveur.png", "disques-dur-serveur.png", "cartes-reseau-serveur.png", "alimentations-serveur.png", "refroidissement-serveur.png", "cartes-graphique-serveur.png", "autres-composants-serveur.png"],
      "imprimantes-cartouches": ["imprimantes-jet-encre.png", "imprimantes-laser.png", "imprimantes-matricielles.png", "codes-barre-etiqueteuses.png", "imprimantes-photo-badges.png", "photocopieuses-professionnelles.png", "imprimantes-3d.png", "cartouches-toners.png", "autre-imprimantes.png"],
      "reseau-connexion": ["modems-routeurs.png", "switchs.png", "point-acces-wifi.png", "repeater-wifi.png", "cartes-reseau.png", "autre-reseau.png"],
      "stockage-externe-racks": ["disques-durs.png", "flash-disque.png", "carte-memoire.png", "rack.png"]
    }
  },

  // ==================== 8. LOISIRS ====================
  "loisirs": {
    "level1": ["loisirs.png"],
    "level2": ["animalerie.png", "consoles-jeux-videos.png", "livres-magazines.png", "instruments-musique.png", "jouets.png", "chasse-peche.png", "jardinage.png", "jeux-loisirs.png", "barbecue-grillades.png", "vapes-chichas.png", "produits-accessoires-ete.png", "antiquites-collections.png", "autre-loisirs.png"],
    "level3": {
      "animalerie": ["produits-soin-animal.png", "chien.png", "oiseau.png", "animaux-ferme.png", "chat.png", "cheval.png", "poisson.png", "accessoire-animaux.png", "nourriture-animaux.png", "autres-animaux.png"],
      "consoles-jeux-videos": ["consoles.png", "jeux-videos.png", "accessoires-consoles.png"],
      "livres-magazines": ["litterature-philosophie.png", "romans.png", "scolaire-parascolaire.png", "sciences-techniques-medecine.png", "traduction.png", "religion-spiritualites.png", "historique.png", "cuisine-livres.png", "essais-documents.png", "fiction.png", "enfants-livres.png", "mangas-bande-dessinee.png"],
      "instruments-musique": ["instruments-electriques.png", "instruments-percussion.png", "instruments-vent.png", "instruments-cordes.png", "autre-instruments.png"],
      "jouets": ["jeux-eveil.png", "poupees-peluches.png", "personnages-deguisements.png", "jeux-educatifs-puzzle.png", "vehicules-circuits.png", "jeux-electroniques.png", "construction-outils.png", "jeux-plein-air.png", "animaux-jouets.png"],
      "chasse-peche": ["canne-peche.png", "moulinets.png", "sondeurs-gps.png", "vetements-chasse-peche.png", "accessoires-peche.png", "materiel-plongee.png", "equipements-chasse.png"],
      "jardinage": ["mobilier-jardin.png", "semence.png", "outillage-arrosage.png", "plantes-fleurs.png", "equipements-materiels-jardin.png", "insecticide.png", "decoration-jardin.png", "livres-agriculture-jardin.png"],
      "jeux-loisirs": ["babyfoot.png", "billiard.png", "ping-pong.png", "echecs.png", "jeux-societe.png", "autres-jeux-loisirs.png"],
      "barbecue-grillades": ["barbecue.png", "charbon.png", "accessoires-barbecue.png"],
      "vapes-chichas": ["vapes-cigarettes-electroniques.png", "chichas.png", "consommables.png", "accessoires-chichas.png"],
      "produits-accessoires-ete": ["piscines.png", "matelas-gonflables.png", "parasols.png", "transats-chaises-pliables.png", "tables-ete.png", "autres-ete.png"]
    }
  },

  // ==================== 9. MATERIAUX ====================
  "materiaux": {
    "level1": ["materiaux.png"],
    "level2": ["materiel-professionnel.png", "outillage-professionnel.png", "materiel-agricole.png", "materiaux-construction.png", "matieres-premieres.png", "produits-hygiene.png", "autre-materiaux.png"],
    "level3": {
      "materiel-professionnel": ["industrie-fabrication.png", "alimentaire-restauration.png", "medical.png", "batiment-construction.png", "materiel-electrique.png", "ateliers.png", "stockage-magasinage.png", "equipement-protection.png", "agriculture.png", "reparation-diagnostic.png", "commerce-detail.png", "coiffure-cosmetologie.png", "autres-materiel-pro.png"],
      "outillage-professionnel": ["perceuse.png", "meuleuse.png", "outillage-main.png", "scie.png", "autres-outillage.png"],
      "materiel-agricole": ["equipement-agricole.png", "arbres.png", "terrain-agricole-materiaux.png", "autre-agricole.png"]
    }
  },

  // ==================== 10. MEUBLES ====================
  "meubles": {
    "level1": ["meubles.png"],
    "level2": ["salon.png", "chambres-coucher.png", "tables.png", "armoires-commodes.png", "lits.png", "meubles-cuisine.png", "bibliotheques-etageres.png", "chaises-fauteuils.png", "dressings.png", "meubles-salle-bain.png", "buffet.png", "tables-tv.png", "table-pliante.png", "tables-manger.png", "tables-pc-bureaux.png", "canape.png", "table-basse.png", "rangement-organisation.png", "accessoires-cuisine.png", "meuble-entree.png", "decoration.png", "vaisselle.png", "meubles-bureau.png", "puericulture.png", "luminaire.png", "rideaux.png", "literie-linge.png", "tapis-moquettes.png", "meubles-exterieur.png", "fournitures-scolaires.png", "autre-meubles.png"],
    "level3": {
      "decoration": ["peinture-calligraphie.png", "decoration-cuisine.png", "coussins-housses.png", "deco-bain.png", "art-revetement-mural.png", "figurines-miniatures.png", "cadres.png", "horloges.png", "autres-decoration.png"],
      "vaisselle": ["poeles-casseroles-marmites.png", "cocottes.png", "plats-four-plateaux.png", "assiettes-bols.png", "couverts-ustensiles.png", "services-boissons.png", "boites-bocaux.png", "accessoires-patisserie.png", "vaisselles-artisanales.png", "gadget-cuisine.png", "vaisselle-enfants.png"],
      "meubles-bureau": ["bureaux-caissons.png", "chaises-bureau.png", "armoires-rangements-bureau.png", "accessoires-bureaux.png", "tables-reunion.png"],
      "puericulture": ["poussette.png", "siege-auto.png", "meubles-bebe.png", "lit-bebe.png", "chaise-bebe.png", "autres-puericulture.png"],
      "luminaire": ["lustre.png", "lampadaire.png", "eclairage-exterieur.png", "autres-luminaire.png"]
    }
  },

  // ==================== 11. PIECES DETACHEES ====================
  "pieces-detachees": {
    "level1": ["pieces-detachees.png"],
    "level2": ["pieces-automobiles.png", "pieces-moto.png", "pieces-bateaux.png", "alarme-securite.png", "nettoyage-entretien.png", "outils-diagnostics.png", "lubrifiants.png", "pieces-vehicules.png", "autres-pieces.png"],
    "level3": {
      "pieces-automobiles": ["moteur-transmission.png", "suspension-direction.png", "pieces-interieur.png", "carrosserie.png", "optiques-eclairage.png", "vitres-pare-brise.png", "pneus-jantes.png", "housses-tapis.png", "batteries-auto.png", "sono-multimedia.png", "sieges-auto.png", "autres-pieces-auto.png"],
      "pieces-moto": ["casques-protections.png", "pneus-jantes-moto.png", "optiques-eclairage-moto.png", "accessoires-moto.png", "autres-pieces-moto.png"],
      "pieces-bateaux": ["moteurs-bateau.png", "pieces-bateau.png", "accessoires-bateau.png", "autres-pieces-bateaux.png"]
    }
  },

  // ==================== 12. SANTE & BEAUTE ====================
  "sante-beaute": {
    "level1": ["sante-beaute.png"],
    "level2": ["cosmetiques-beaute.png", "parapharmacie-sante.png", "parfums-deodorants-femme.png", "parfums-deodorants-homme.png", "accessoires-beaute.png", "soins-cheveux.png", "autre-sante-beaute.png"],
    "level3": {
      "cosmetiques-beaute": ["soins-corps.png", "savons-gels-douche.png", "soins-visage.png", "maquillage.png", "produits-solaires-bronzage.png", "instruments-outils-beaute.png", "manucure-pedicure.png", "rasage-epilation.png", "hygiene.png", "coiffure.png", "soins-bebe.png", "autres-produits-beaute.png"],
      "parapharmacie-sante": ["dispositifs-medicaux.png", "complement-alimentaire.png", "materiel-medical.png", "aliments-dietetiques-sante.png"]
    }
  },

  // ==================== 13. SERVICES ====================
  "services": {
    "level1": ["services.png"],
    "level2": ["construction-travaux.png", "ecoles-formations.png", "industrie-fabrication-services.png", "transport-demenagement.png", "decoration-amenagement.png", "publicite-communication.png", "nettoyage-jardinage.png", "froid-climatisation.png", "traiteurs-gateaux.png", "medecine-sante.png", "reparation-auto-diagnostic.png", "securite-alarme.png", "projets-etudes.png", "bureautique-internet.png", "location-vehicules.png", "menuiserie-meubles.png", "impression-edition.png", "hotellerie-restauration-salles.png", "esthetique-beaute.png", "image-son.png", "comptabilite-economie.png", "couture-confection.png", "maintenance-informatique.png", "reparation-electromenager.png", "evenements-divertissement.png", "paraboles-demos.png", "reparation-electronique.png", "services-etranger.png", "flashage-reparation-telephones.png", "flashage-installation-jeux.png", "juridique.png", "autres-services.png"],
    "level3": {}
  },

  // ==================== 14. SPORT ====================
  "sport": {
    "level1": ["sport.png"],
    "level2": ["football.png", "hand-voley-basket.png", "sport-combat.png", "fitness-musculation.png", "natation.png", "velos-trotinettes.png", "sports-raquette.png", "sport-aquatiques.png", "equitation.png", "petanque.png", "autres-sports.png"],
    "level3": {
      "football": ["ballons-buts.png", "equipements-accessoires-foot.png", "chaussures-football.png", "vetements-football.png"],
      "hand-voley-basket": ["equipements-accessoires-basket.png", "ballons-buts-filets.png", "chaussures-basket.png", "vetements-basket.png"],
      "sport-combat": ["tenue-combat.png", "gants-casques.png", "autres-accessoires-combat.png"],
      "fitness-musculation": ["bancs-presses.png", "poids-halteres.png", "tapis-roulants.png", "velos-rameurs.png", "autres-equipements-fitness.png"],
      "natation": ["lunettes-natation.png", "bonnets.png", "palmes.png", "planches-flotteurs.png", "maillots-combinaisons.png", "autres-accessoires-natation.png"],
      "velos-trotinettes": ["vetements-chaussures-velo.png", "velos.png", "trotinettes.png", "equipements-accessoires-velo.png"],
      "sports-raquette": ["tennis.png", "tennis-table.png", "autre-raquette.png"]
    }
  },

  // ==================== 15. VOYAGES ====================
  "voyages": {
    "level1": ["voyages.png"],
    "level2": ["voyage-organise.png", "location-vacances-voyages.png", "hajj-omra.png", "reservations-visa.png", "sejour.png", "croisiere.png", "autre-voyages.png"],
    "level3": {}
  },

  // ==================== 16. BOUTIQUES ====================
  "boutiques": {
    "level1": ["boutiques.png"],
    "level2": [
      "agences-immobilieres.png",
      "promotions-immobilieres.png",
      "showroom-automobiles.png",
      "showroom-moto.png",
      "camions-engins.png",
      "pieces-accessoires-vehicules.png",
      "location-voitures.png",
      "reparation-services-vehicules.png",
      "telephones-accessoires.png",
      "magasin-informatique.png",

      "magasin-electromenager.png",
      "equipements-securite.png",
      "audiovisuel.png",
      "electronique.png",
      "vetements-accessoires-mode.png",
      "cosmetiques-et-beaute.png",
      "maison-meubles.png",
      "meubles-et-bureau.png",
      "vaisselles.png",
      "puericultures-jouets.png",

      "jardinages.png",
      "fournitures-articles-scolaires.png",
       "articles-sport.png",
      "consoles-jeux-video.png",
      "librairie-papeterie.png",
      "instruments-et-musique.png",
      "chasse-et-peche.png",
      "outillages-quincaillerie.png",
      "materiaux-et-construction.png",
      "materiel-et-professionnel.png",

      "matieres-et-premieres.png",
      "agences-voyages.png",
      "animaleries.png",
      "alimentaire.png",
      "transport-et-demenagement.png",
      "travaux-construction-amenagement.png",
      "ecoles-et-formations.png",
      "publicite-et-communication.png",
      "service-nettoyage-entretien.png",
      "froid-et-climatisation.png",

      "traiteur-gateaux.png",
      "hotels.png",
      "restaurants-salles-fetes.png",
      "services-sante.png",
      "etudes-consulting.png",
      "logiciel-web-services.png",
      "esthetique-bien-etre.png",
 "comptabilite-finance.png",
      "couture-et-confection.png",
      "reparation-electronique-electromenager.png"
    ],
    "level3": {}
  },
  // ==================== 17. TELEPHONE ====================
  "telephone": {
    "level1": ["telephone.png"],
    "level2": ["smartphones.png", "telephones-cellulaires.png", "tablettes.png", "fixes-fax.png", "smartwatchs.png", "accessoires-telephone.png", "pieces-rechange-telephone.png", "offres-abonnements.png", "protection-antichoc.png", "ecouteurs-son.png", "chargeurs-cables.png", "supports-stabilisateurs.png", "manettes-telephone.png", "vr-telephone.png", "power-banks.png", "stylets.png", "cartes-memoire.png"],
    "level3": {
      "accessoires-telephone": ["etuis.png", "films-protection.png", "protections-ecran.png", "coques-antichoc.png", "protections-camera.png"],
      "protection-antichoc": ["protections-ecran-renforcees.png", "coques-antichoc-pro.png", "films-protection-antichoc.png", "etuis-renforces.png", "protections-camera-antichoc.png"],
      "ecouteurs-son": ["ecouteurs-filaires.png", "ecouteurs-bluetooth.png", "casques-audio.png", "hauts-parleurs-portables.png", "adaptateurs-audio.png"],
      "chargeurs-cables": ["chargeurs-mural.png", "chargeurs-voiture.png", "chargeurs-sans-fil.png", "cables-usb.png", "cables-lightning.png", "cables-type-c.png", "hubs-chargeurs.png"],
      "supports-stabilisateurs": ["supports-telephone.png", "stabilisateurs.png", "barres-selfies.png", "pieds-telephone.png", "ventouses-voiture.png"],
      "manettes-telephone": ["manettes-bluetooth.png", "manettes-filaires.png", "manettes-pour-telephone.png", "manettes-pour-tablette.png", "accessoires-manettes.png"],
      "vr-telephone": ["casques-vr.png", "lunettes-vr.png", "accessoires-vr.png", "controleurs-vr.png", "jeux-vr.png"],
      "power-banks": ["power-bank-10000mah.png", "power-bank-20000mah.png", "power-bank-solaire.png", "power-bank-rapide.png", "power-bank-compact.png"],
      "stylets": ["stylets-actifs.png", "stylets-passifs.png", "stylets-bluetooth.png", "stylets-tablette.png", "recharges-stylet.png"],
      "cartes-memoire": ["cartes-sd.png", "cartes-micro-sd.png", "cartes-sdhc.png", "cartes-sdxc.png", "adaptateurs-carte.png", "lecteurs-carte.png"]
    }
  }
};


// ============================================================
// FUNCIÓN PARA GENERAR TODAS LAS RUTAS DE CARPETAS NECESARIAS
// ============================================================
function generateFolderPaths() {
  const folderSet = new Set();

  for (const [category, levels] of Object.entries(categories)) {
    // Nivel 1: carpeta de la categoría
    folderSet.add(`${CLOUDINARY_ROOT_FOLDER}/${category}`);

    // Nivel 2: subcarpetas para cada archivo de level2
    if (levels.level2 && levels.level2.length > 0) {
      levels.level2.forEach(file => {
        const subcat = file.replace('.png', '');
        folderSet.add(`${CLOUDINARY_ROOT_FOLDER}/${category}/${subcat}`);
      });
    }

    // Nivel 3: subcarpetas adicionales dentro de level2
    if (levels.level3) {
      Object.keys(levels.level3).forEach(subcat => {
        folderSet.add(`${CLOUDINARY_ROOT_FOLDER}/${category}/${subcat}`);
        // Las subcarpetas de nivel 3 ya se crean automáticamente al incluir la ruta completa
      });
    }
  }

  return Array.from(folderSet).sort();
}

// ============================================================
// FUNCIÓN PARA CREAR UNA CARPETA EN CLOUDINARY
// ============================================================
async function createCloudinaryFolder(folderPath) {
  console.log(`📁 Creando carpeta: ${folderPath}`);

  try {
    // Intentar con create_folder (disponible en la API)
    await cloudinary.api.create_folder(folderPath);
    console.log(`   ✅ Creada`);
    return true;
  } catch (error) {
    // Si el error es porque el método no está soportado, usar método alternativo
    if (error.message && error.message.includes('not supported')) {
      try {
        // Subir un placeholder diminuto y luego eliminarlo
        const result = await cloudinary.uploader.upload(
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          {
            folder: folderPath,
            public_id: '.folder_placeholder',
            resource_type: 'image',
            overwrite: false
          }
        );
        // Eliminar el placeholder
        await cloudinary.api.delete_resources([`${folderPath}/.folder_placeholder`], {
          resource_type: 'image'
        });
        console.log(`   ✅ Creada (método alternativo)`);
        return true;
      } catch (placeholderError) {
        console.log(`   ❌ Error con placeholder: ${placeholderError.message}`);
        return false;
      }
    } else if (error.message && error.message.includes('already exists')) {
      console.log(`   📂 Ya existe`);
      return true;
    } else {
      console.log(`   ❌ Error: ${error.message}`);
      return false;
    }
  }
}

// ============================================================
// FUNCIÓN PARA SUBIR UNA IMAGEN (si existe y no está vacía)
// ============================================================
async function uploadImageIfExists(localPath, cloudinaryFolder) {
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️ Archivo local no encontrado: ${localPath}`);
    return null;
  }

  const stats = fs.statSync(localPath);
  if (stats.size === 0) {
    console.log(`   ⚠️ Archivo vacío (placeholder), no se sube: ${localPath}`);
    return null;
  }

  const fileName = path.basename(localPath);
  const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

  try {
    console.log(`   ⬆️ Subiendo: ${cloudinaryFolder}/${fileName}`);
    const result = await cloudinary.uploader.upload(localPath, {
      folder: cloudinaryFolder,
      public_id: fileNameWithoutExt,
      overwrite: true,
      unique_filename: false,
      use_filename: true
    });
    console.log(`      ✅ ${result.secure_url}`);
    return {
      localPath: `/categories/${path.relative(LOCAL_CATEGORIES_PATH, localPath).replace(/\\/g, '/')}`,
      cloudinaryUrl: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.log(`      ❌ Error: ${error.message}`);
    return null;
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
async function main() {
  console.log('🚀 CONFIGURANDO CARPETAS Y SUBIENDO IMÁGENES A CLOUDINARY');
  console.log('=========================================================\n');
  console.log(`📁 Carpeta base en Cloudinary: ${CLOUDINARY_ROOT_FOLDER}`);
  console.log(`📁 Carpeta local de categorías: ${LOCAL_CATEGORIES_PATH}`);

  // PASO 1: Generar lista de carpetas necesarias
  const folderPaths = generateFolderPaths();
  console.log(`\n📋 Se crearán ${folderPaths.length} carpetas en Cloudinary.\n`);

  // PASO 2: Crear carpetas una por una
  let created = 0;
  for (const folder of folderPaths) {
    const success = await createCloudinaryFolder(folder);
    if (success) created++;
    // Pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  console.log(`\n✅ Carpetas creadas: ${created}/${folderPaths.length}`);

  // PASO 3: Subir imágenes reales (opcional)
  console.log('\n📸 Verificando imágenes locales para subir...\n');
  const mapping = {};
  let uploaded = 0;

  // Recorrer la estructura de categorías para localizar archivos
  for (const [category, levels] of Object.entries(categories)) {
    // Imagen level1: en la carpeta de la categoría
    if (levels.level1 && levels.level1.length > 0) {
      for (const file of levels.level1) {
        const localFile = path.join(LOCAL_CATEGORIES_PATH, category, file);
        const cloudFolder = `${CLOUDINARY_ROOT_FOLDER}/${category}`;
        const result = await uploadImageIfExists(localFile, cloudFolder);
        if (result) {
          mapping[result.localPath] = result.cloudinaryUrl;
          uploaded++;
        }
      }
    }

    // Imágenes level2: en la carpeta de la categoría (sin subcarpeta propia)
    if (levels.level2 && levels.level2.length > 0) {
      for (const file of levels.level2) {
        const localFile = path.join(LOCAL_CATEGORIES_PATH, category, file);
        const cloudFolder = `${CLOUDINARY_ROOT_FOLDER}/${category}`;
        const result = await uploadImageIfExists(localFile, cloudFolder);
        if (result) {
          mapping[result.localPath] = result.cloudinaryUrl;
          uploaded++;
        }
      }
    }

    // Imágenes level3: dentro de subcarpetas
    if (levels.level3) {
      for (const [subcat, files] of Object.entries(levels.level3)) {
        for (const file of files) {
          const localFile = path.join(LOCAL_CATEGORIES_PATH, category, subcat, file);
          const cloudFolder = `${CLOUDINARY_ROOT_FOLDER}/${category}/${subcat}`;
          const result = await uploadImageIfExists(localFile, cloudFolder);
          if (result) {
            mapping[result.localPath] = result.cloudinaryUrl;
            uploaded++;
          }
        }
      }
    }
  }

  console.log(`\n✅ Imágenes subidas: ${uploaded}`);

  // PASO 4: Guardar mapping
  const mappingPath = path.join(OUTPUT_DIR, 'cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n📁 Mapping guardado en: ${mappingPath}`);

  console.log('\n🎉 PROCESO COMPLETADO');
}

// ============================================================
// EJECUTAR CON CONFIRMACIÓN
// ============================================================
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`\n⚠️  ¿Seguro que quieres crear/actualizar las carpetas en Cloudinary? (s/N): `, async answer => {
  readline.close();
  if (answer.toLowerCase() === 's') {
    await main().catch(console.error);
  } else {
    console.log('❌ Operación cancelada');
  }
});
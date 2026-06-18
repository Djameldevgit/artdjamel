  
const fs = require('fs');
const path = require('path');

// Ruta base
const basePath = path.join(__dirname, 'public', 'uploads', 'categories');

// Estructura completa de la cuarta parte
const categories = {
  "immobilier": {
    "level1": ["immobilier.png"],
    "level2": ["vente.png", "location.png", "location-vacances.png", "cherche-location.png", "cherche-achat.png"],
    "level3": ["appartement.png", "local.png", "villa.png", "terrain.png", "terrain-agricole.png", "immeuble.png", "bungalow.png", "hangar-usine.png", "autre.png"]
  },
  "automobiles-vehicules": {
    "level1": ["automobiles.png"],
    "level2": ["voitures.png","utilitaire.png","motos-scooters.png","quads.png","fourgon.png","camion.png","bus.png","engin.png","tracteurs.png","remorques.png","bateaux-barques.png"]
  },
  "pieces-detachees": {
    "level1": ["pieces-detachees.png"],
    "level2": ["pieces-automobiles.png","pieces-moto.png","pieces-bateaux.png","alarme-securite.png","nettoyage-entretien.png","outils-diagnostics.png","lubrifiants.png","pieces-vehicules.png","autres-pieces.png"],
    "level3": ["moteur-transmission.png","suspension-direction.png","pieces-interieur.png","carrosserie.png","optiques-eclairage.png","vitres-pare-brise.png","pneus-jantes.png","housses-tapis.png","batteries.png","sono-multimedia.png","sieges-auto.png","autre-pieces-auto.png"]
  },
  "telephones-accessoires": {
    "level1": ["telephones.png"],
    "level2": ["smartphones.png","telephones-cellulaires.png","tablettes.png","fixes-fax.png","smartwatchs.png","accessoires.png","pieces-rechange.png","offres-abonnements.png","protection-antichoc.png","ecouteurs-son.png","chargeurs-cables.png","supports-stabilisateurs.png","manettes.png","vr.png","power-banks.png","stylets.png","cartes-memoire.png","accessoires-divers.png"],
    "level3": ["protections-ecran.png","coques-antichoc.png","films-protection.png","etuis.png","protections-camera.png","ecouteurs-filaires.png","ecouteurs-bluetooth.png","casques-audio.png","hauts-parleurs-portables.png","adaptateurs-audio.png","chargeurs-mur.png","chargeurs-voiture.png","chargeurs-sans-fil.png","cables-usb.png","cables-lightning.png","cables-type-c.png","hubs-chargeurs.png","supports.png","stabilisateurs.png","barres-selfies.png","pieds-telephone.png","ventouses-voiture.png","manettes-bluetooth.png","manettes-filaires.png","manettes-telephone.png","manettes-tablette.png","accessoires-manettes.png","casques-vr.png","lunettes-vr.png","accessoires-vr.png","controleurs-vr.png","jeux-vr.png","power-bank-10000mah.png","power-bank-20000mah.png","power-bank-solaire.png","power-bank-rapide.png","power-bank-compact.png","stylets-actifs.png","stylets-passifs.png","stylets-bluetooth.png","stylets-tablette.png","recharges-stylet.png","sd-cards.png","micro-sd-cards.png","sdhc-cards.png","sdxc-cards.png","adaptateurs-carte.png","lecteurs-carte.png"]
  },
  "informatique": {
    "level1": ["informatique.png"],
    "level2": ["ordinateurs-portables.png","ordinateurs-bureau.png","composants-pc-fixe.png","composants-pc-portable.png","composants-serveur.png","imprimantes-cartouches.png","reseau-connexion.png","stockage-externe.png","serveurs.png","ecrans.png","onduleurs-stabilisateurs.png","compteuses-billets.png","claviers-souris.png","casques-son.png","webcam-videoconference.png","data-shows.png","cables-adaptateurs.png","stylers-tablettes.png","cartables-sacoches.png","manettes-simulateurs.png","vr.png","logiciels-abonnements.png","bureautique.png","autre-informatique.png"],
    "level3": ["pc-portable.png","macbooks.png","pc-bureau.png","unites-centrales.png","all-in-one.png","cartes-mere.png","processeurs.png","ram.png","disques-dur.png","cartes-graphique.png","alimentations-boitiers.png","refroidissement.png","lecteurs-graveurs-cd.png","autres-composants-fixe.png","chargeurs.png","batteries.png","ecrans-portable.png","claviers-touchpads.png","disques-dur-portable.png","ram-portable.png","refroidissement-portable.png","cartes-mere-portable.png","processeurs-portable.png","cartes-graphique-portable.png","lecteurs-graveurs-portable.png","baffles-webcams.png","autres-composants-portable.png","cartes-mere-serveur.png","processeurs-serveur.png","ram-serveur.png","disques-dur-serveur.png","cartes-reseau-serveur.png","alimentations-serveur.png","refroidissement-serveur.png","cartes-graphique-serveur.png","autres-composants-serveur.png","imprimantes-jet-encre.png","imprimantes-laser.png","imprimantes-matricielles.png","codes-barre-etiqueteuses.png","imprimantes-photo-badges.png","photocopieuses-professionnelles.png","imprimantes-3d.png","cartouches-toners.png","autre-imprimantes.png","modems-routeurs.png","switchs.png","point-acces-wifi.png","repeater-wifi.png","cartes-reseau-connexion.png","autre-reseau.png","disques-durs-externes.png","flash-disque.png","carte-memoire.png","rack.png"]
  }
  // Aquí podemos seguir agregando el resto de categorías tal como en tu lista completa...
};

// Función para crear carpetas y archivos
function createFolders(base, obj) {
  for (const key in obj) {
    const categoryPath = path.join(base, key);
    if (!fs.existsSync(categoryPath)) fs.mkdirSync(categoryPath, { recursive: true });

    const levels = obj[key];
    for (const level in levels) {
      const levelPath = path.join(categoryPath, level);
      if (!fs.existsSync(levelPath)) fs.mkdirSync(levelPath, { recursive: true });

      levels[level].forEach(file => {
        const filePath = path.join(levelPath, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, ''); // placeholder vacío para PNG
        }
      });
    }
  }
}

createFolders(basePath, categories);
console.log("Parte 4 completa: carpetas y placeholders creados ✅");


for (const dir in structurePart4) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  structurePart4[dir].forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, placeholder);
  });
}

console.log("✅ Cuarta parte de categorías y placeholders creados.");

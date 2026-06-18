import React from 'react';

// 🚗 VEHÍCULOS & TRANSPORTES
import SliderVehicule from './SliderVehicules'; // Tu componente original

// 🏠 INMOBILIARIO
import SliderImmobilier from './SliderImmobiler'; // Inmobiliario

// 👕 ROPA & MODA
import SliderVetements from './SliderVetements'; // Ropa

// 📺 ELECTRODOMÉSTICOS & ELECTRÓNICA
import SliderElectromenager from './SlidersElectromenagers'; // Electrodomésticos

// 📱 TELÉFONOS & ACCESORIOS
import SliderTelephones from './SliderTelephones'; // Teléfonos

// 💻 INFORMÁTICA & TECNOLOGÍA
import SliderInformatique from './SliderInformatiques'; // Informática

// 🔧 PIEZAS DETACHÉES
import SliderPiecesDetachees from './SliderPiecesDetaches'; // Piezas de repuesto

// 💄 SALUD & BELLEZA
import SliderSanteBeaute from './SliderSanteBeaute'; // Salud y belleza

// 🛋️ MUEBLES & HOGAR
import SliderMeubles from './SliderMuebles'; // Muebles

// 🎮 LOISIRS & DIVERTISSEMENTS
import SliderLoisirs from './SliderLoisir'; // Ocio y entretenimiento

// ⚽ DEPORTES
import SliderSport from './SliderSport'; // Deportes

// 🛒 ALIMENTACIÓN
import SliderAlimentaires from './SliderAlimentaires'; // Alimentación

// 🛠️ SERVICIOS
import SliderServices from './SliderServices'; // Servicios

// 🧱 MATERIALES & EQUIPO
import SliderMateriaux from './SliderMateriaux'; // Materiales

// ✈️ VIAJES
import SliderVoyages from './SliderVoyages'; // Viajes

// 💼 EMPLEO
import SliderEmploi from './SliderEmploi'; // Empleo

// 🏪 BOUTIQUES & TIENDAS
import SliderBoutiques from './SliderBoutiques'; // Tiendas

const CategorySpecificSlider = ({ categorySlug, subcategories }) => {
  // Mapeo completo de categoría -> Componente de slider
  const sliderComponents = {
    // ========== 🚗 VEHÍCULOS & TRANSPORTES ==========
    'vehicules': SliderVehicule,
    'vehicule': SliderVehicule,
    'voitures': SliderVehicule,
    'automobiles': SliderVehicule,
    'motos': SliderVehicule,
    'camions': SliderVehicule,
    'utilitaires': SliderVehicule,
    'fourgons': SliderVehicule,
    'quads': SliderVehicule,
    'bateaux': SliderVehicule,
    'engins': SliderVehicule,
    'tracteurs': SliderVehicule,
    'remorques': SliderVehicule,
    'bus': SliderVehicule,
    
    // ========== 🏠 INMOBILIARIO ==========
    'immobilier': SliderImmobilier,
    'immobiliers': SliderImmobilier,
    'appartement': SliderImmobilier,
    'maison': SliderImmobilier,
    'terrain': SliderImmobilier,
    'bureau': SliderImmobilier,
    'local': SliderImmobilier,
    'garage': SliderImmobilier,
    
    // ========== 👕 ROPA & MODA ==========
    'vetements': SliderVetements,
    'mode': SliderVetements,
    'habillement': SliderVetements,
    'vetement': SliderVetements,
    'chaussures': SliderVetements,
    'accessoires': SliderVetements,
    'sacs': SliderVetements,
    'bijoux': SliderVetements,
    
    // ========== 📺 ELECTRODOMÉSTICOS ==========
    'electromenager': SliderElectromenager,
    'electromenagers': SliderElectromenager,
    'electronique': SliderElectromenager,
    'electrique': SliderElectromenager,
    
    // ========== 📱 TELÉFONOS ==========
    'telephones': SliderTelephones,
    'telephonie': SliderTelephones,
    'smartphones': SliderTelephones,
    'tablettes': SliderTelephones,
    'accessoires-telephonie': SliderTelephones,
    
    // ========== 💻 INFORMÁTICA ==========
    'informatique': SliderInformatique,
    'ordinateurs': SliderInformatique,
    'pc': SliderInformatique,
    'portables': SliderInformatique,
    'accessoires-informatique': SliderInformatique,
    'logiciels': SliderInformatique,
    'jeux-video': SliderInformatique,
    
    // ========== 🔧 PIEZAS DETACHÉES ==========
    'pieces-detachees': SliderPiecesDetachees,
    'pieces': SliderPiecesDetachees,
    'accessoires-auto': SliderPiecesDetachees,
    'pieces-moto': SliderPiecesDetachees,
    
    // ========== 💄 SALUD & BELLEZA ==========
    'sante-beaute': SliderSanteBeaute,
    'beaute': SliderSanteBeaute,
    'sante': SliderSanteBeaute,
    'cosmetiques': SliderSanteBeaute,
    'parfums': SliderSanteBeaute,
    'soins': SliderSanteBeaute,
    
    // ========== 🛋️ MUEBLES ==========
    'meubles': SliderMeubles,
    'maison': SliderMeubles,
    'decoration': SliderMeubles,
    'amenagement': SliderMeubles,
    'jardin': SliderMeubles,
    
    // ========== 🎮 LOISIRS ==========
    'loisirs': SliderLoisirs,
    'divertissement': SliderLoisirs,
    'jeux': SliderLoisirs,
    'instruments': SliderLoisirs,
    'collection': SliderLoisirs,
    'livres': SliderLoisirs,
    
    // ========== ⚽ DEPORTES ==========
    'sport': SliderSport,
    'sports': SliderSport,
    'equipement-sport': SliderSport,
    'velos': SliderSport,
    
    // ========== 🛒 ALIMENTACIÓN ==========
    'alimentaires': SliderAlimentaires,
    'alimentation': SliderAlimentaires,
    'produits-alimentaires': SliderAlimentaires,
    'boissons': SliderAlimentaires,
    
    // ========== 🛠️ SERVICIOS ==========
    'services': SliderServices,
    'service': SliderServices,
    'prestations': SliderServices,
    
    // ========== 🧱 MATERIALES ==========
    'materiaux': SliderMateriaux,
    'materiel': SliderMateriaux,
    'outillage': SliderMateriaux,
    'construction': SliderMateriaux,
    
    // ========== ✈️ VIAJES ==========
    'voyages': SliderVoyages,
    'tourisme': SliderVoyages,
    'vacances': SliderVoyages,
    
    // ========== 💼 EMPLEO ==========
    'emploi': SliderEmploi,
    'emplois': SliderEmploi,
    'offres-emploi': SliderEmploi,
    
    // ========== 🏪 BOUTIQUES ==========
    'boutiques': SliderBoutiques,
    'boutique': SliderBoutiques,
    'commerces': SliderBoutiques,
    
    // ========== OTRAS CATEGORÍAS SIN SLIDER ESPECÍFICO ==========
    // 'informatique': null, // Ya está arriba
    // 'telephones': null,   // Ya está arriba
    // etc...
  };

  // Buscar el componente correspondiente
  const SliderComponent = sliderComponents[categorySlug] || null;

  if (!SliderComponent) {
    // Si no hay slider específico, mostrar slider genérico
    return (
      <div className="mb-4">
        <h5 className="mb-3">Sous-catégories disponibles:</h5>
        <div className="subcategories-grid">
          {subcategories.slice(0, 8).map((subcat, index) => (
            <a 
              key={index}
              href={`/${categorySlug}/${subcat.slug || subcat.id}/1`}
              className="subcategory-chip"
            >
              <span className="subcategory-emoji">{subcat.emoji || '📁'}</span>
              <span className="subcategory-name">{subcat.name}</span>
            </a>
          ))}
        </div>
        
        {/* Estilos inline para el slider genérico */}
        <style jsx>{`
          .subcategories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 16px;
          }
          
          .subcategory-chip {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px 8px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
            text-align: center;
            min-height: 100px;
          }
          
          .subcategory-chip:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            border-color: #667eea;
          }
          
          .subcategory-emoji {
            font-size: 2rem;
            margin-bottom: 8px;
            display: block;
          }
          
          .subcategory-name {
            font-size: 0.85rem;
            font-weight: 500;
            line-height: 1.2;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          @media (max-width: 768px) {
            .subcategories-grid {
              grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
              gap: 8px;
            }
            
            .subcategory-chip {
              padding: 10px 6px;
              min-height: 90px;
            }
            
            .subcategory-emoji {
              font-size: 1.6rem;
            }
            
            .subcategory-name {
              font-size: 0.75rem;
            }
          }
        `}</style>
      </div>
    );
  }

  // Pasar las subcategorías al slider si el componente las necesita
  return <SliderComponent subcategories={subcategories} />;
};

export default CategorySpecificSlider;
// 📂 components/FieldConfig.js
import { categoryHierarchy } from '../utils/categoryHierarchy';

export const getFieldConfig = (category, articleType = null, subCategory = null) => {
  const categoryConfig = categoryHierarchy[category];
  
  if (!categoryConfig) return [];

  // Campos comunes a todas las categorías
  const commonFields = [
    { name: 'title', component: 'TitleField', required: true },
    { name: 'description', component: 'DescriptionField', required: true },
    { name: 'price', component: 'PriceField', required: true },
    // ... otros campos comunes
  ];

  // Campos específicos según jerarquía
  let specificFields = [];

  if (category === 'vehicules') {
    // Vehículos - 1 nivel
    specificFields.push(
      { name: 'marque', component: 'MarqueVehiculesField', required: true },
      { name: 'modele', component: 'ModeleVehiculesField', required: true },
      { name: 'annee', component: 'YearField', required: true },
      { name: 'kilometrage', component: 'KilometerField', required: true }
    );
  } else if (category === 'immobilier' && articleType && subCategory) {
    // Inmuebles - 2 niveles
    specificFields.push(
      { name: 'surface', component: 'SurfaceField', required: true },
      { name: 'nombre_pieces', component: 'RoomCountField', required: true },
      { name: 'etage', component: 'FloorField', required: articleType === 'location' }
    );
  } else if (category === 'electromenager' && articleType && subCategory) {
    // Electrodomésticos - 2 niveles
    specificFields.push(
      { name: 'marque', component: 'BrandField', required: true },
      { name: 'etat', component: 'EtatField', required: true },
      { name: 'garantie', component: 'WarrantyField', required: false }
    );
  }

  return [...commonFields, ...specificFields];
};
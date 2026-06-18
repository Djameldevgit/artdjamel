// components/Search/DynamicFilterBuilder.js
import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// Mapeo de tipos de campo a componentes de filtro
import { 
  getFieldType, 
  getFieldOptions,
  getFieldValidation 
} from '../CATEGORIES/FieldConfig';

const DynamicFilterBuilder = ({ 
  category, 
  subCategory, 
  articleType, 
  onFilterChange,
  currentFilters 
}) => {
  const { t } = useTranslation();
  const [availableFields, setAvailableFields] = useState([]);
  
  // Obtener campos disponibles para esta categoría
  useEffect(() => {
    if (!category || !subCategory) {
      setAvailableFields([]);
      return;
    }
    
    const fetchFields = async () => {
      try {
        // Reutilizar tu lógica existente de FieldConfig
        const fields = await getAvailableFilterFields(category, subCategory, articleType);
        setAvailableFields(fields);
      } catch (error) {
        console.error('Error fetching filter fields:', error);
        setAvailableFields([]);
      }
    };
    
    fetchFields();
  }, [category, subCategory, articleType]);
  
  const handleFieldChange = (fieldName, value) => {
    const newFilters = {
      ...currentFilters,
      [`specificData.${fieldName}`]: value
    };
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const renderFilterField = (field) => {
    const { name, type, options } = field;
    const currentValue = currentFilters[`specificData.${name}`] || '';
    
    switch(type) {
      case 'select':
        return (
          <Form.Group key={name}>
            <Form.Label>{t(`fields.${name}`, name)}</Form.Label>
            <Form.Select
              value={currentValue}
              onChange={(e) => handleFieldChange(name, e.target.value)}
            >
              <option value="">{t('all', 'Tous')}</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );
        
      case 'range':
        return (
          <Form.Group key={name}>
            <Form.Label>{t(`fields.${name}`, name)}</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Min"
                  value={currentValue.min || ''}
                  onChange={(e) => handleFieldChange(name, {
                    ...currentValue,
                    min: e.target.value
                  })}
                />
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  placeholder="Max"
                  value={currentValue.max || ''}
                  onChange={(e) => handleFieldChange(name, {
                    ...currentValue,
                    max: e.target.value
                  })}
                />
              </Col>
            </Row>
          </Form.Group>
        );
        
      default:
        return (
          <Form.Group key={name}>
            <Form.Label>{t(`fields.${name}`, name)}</Form.Label>
            <Form.Control
              type="text"
              value={currentValue}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={t(`filter_by_${name}`, `Filtrer par ${name}`)}
            />
          </Form.Group>
        );
    }
  };
  
  if (availableFields.length === 0) {
    return (
      <div className="text-center text-muted py-3">
        <small>
          {t('select_category_for_filters', 'Sélectionnez une catégorie pour voir les filtres spécifiques')}
        </small>
      </div>
    );
  }
  
  return (
    <Row>
      {availableFields.map(field => (
        <Col md={6} lg={4} key={field.name} className="mb-3">
          {renderFilterField(field)}
        </Col>
      ))}
    </Row>
  );
};

// Función para obtener campos filtrables
const getAvailableFilterFields = async (category, subCategory, articleType) => {
  // Aquí puedes definir qué campos son filtrables por categoría
  const filterableFields = {
    'immobilier': ['superficie', 'nombrePieces', 'etage', 'jardin', 'piscine', 'garage'],
    'automobiles': ['marque', 'modele', 'annee', 'kilometrage', 'carburant', 'boiteVitesse'],
    'vetements': ['typeVetement', 'taille', 'couleur', 'marque', 'etat'],
    'telephones': ['marque', 'modele', 'etat', 'capaciteStockage', 'systemeExploitation'],
    'informatique': ['typeOrdinateur', 'marque', 'processeur', 'ram', 'stockage'],
    'electromenager': ['typeAppareil', 'marque', 'etat', 'capacite', 'classeEnergetique']
  };
  
  const fields = filterableFields[category] || [];
  
  // Mapear a estructura de filtro
  return fields.map(fieldName => ({
    name: fieldName,
    type: getFieldType(category, fieldName), // Necesitarías implementar esta función
    options: getFieldOptions(category, fieldName) // Y esta
  }));
};

export default DynamicFilterBuilder;
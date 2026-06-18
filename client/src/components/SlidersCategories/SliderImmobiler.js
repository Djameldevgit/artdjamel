// 📂 components/SlidersCategories/SliderImmobiler.js - VERSIÓN CORREGIDA
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa';
import categoryImmobilier from '../CATEGORIES/categoryNivel/categoryImmobiler'; // ✅ Import correcto

const colorMap = {
  primary: '#667eea',
  secondary: '#48c6ef',
  success: '#37ecba',
  warning: '#f5576c',
  info: '#6a11cb',
  dark: '#2d3748',
  danger: '#ff9a9e'
};

const SliderImmobiler = () => {
  const { subcategorySlug, subsubcategorySlug } = useParams();
  const history = useHistory();
  
  const [isMobile, setIsMobile] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedArticleType, setSelectedArticleType] = useState(null); // ✅ Renombrado
  
  // ✅ FUNCIÓN CORREGIDA: Obtener datos según nivel
  const getCurrentData = () => {
    if (currentLevel === 1) {
      // Nivel 1: mostrar articleTypes (tipos de propiedad)
      return categoryImmobilier.articleTypes || [];
    } else if (currentLevel === 2 && selectedArticleType) {
      // Nivel 2: mostrar subcategories del articleType seleccionado
      return categoryImmobilier.subcategories[selectedArticleType.id] || [];
    }
    return [];
  };

  // ✅ DISTRIBUCIÓN EN FILAS CORREGIDA
  const currentData = getCurrentData();
  const halfIndex = Math.ceil(currentData.length / 2);
  const firstRow = currentData.slice(0, halfIndex);
  const secondRow = currentData.slice(halfIndex);

  // ✅ MANEJAR CLIC CORREGIDO
  const handleItemClick = (item) => {
    if (currentLevel === 1) {
      if (item.hasSublevel) {
        // Tiene subcategorías: mostrar nivel 2 (transacciones)
        setSelectedArticleType(item);
        setCurrentLevel(2);
      } else {
        // No tiene subniveles: navegar directamente
        history.push(`/immobilier/${item.id}/1`);
      }
    } else if (currentLevel === 2) {
      // En nivel 2 (transacciones): navegar a página filtrada
      // URL: /immobilier/[articleType]/[subCategory]/1
      history.push(`/immobilier/${selectedArticleType.id}/${item.id}/1`);
    }
  };

  // ✅ RENDERIZADO CORREGIDO
  const renderIconRow = (row, rowIndex) => {
    return (
      <div style={{ /* estilos */ }}>
        {row.map((item) => {
          // ✅ Color basado en item.color (no random)
          const colorHex = colorMap[item.color] || colorMap.primary;
          
          return (
            <div
              key={`${item.id}-${rowIndex}`}
              onClick={() => handleItemClick(item)}
              style={{ /* estilos */ }}
            >
              {/* Ícono */}
              <div style={{ /* estilos con colorHex */ }}>
                <span>{item.emoji}</span>
              </div>
              
              {/* Nombre */}
              <div>
                <span>{item.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Header con título dinámico */}
      <div>
        <h3>
          {currentLevel === 1 ? '🏠 Types de Propriétés' : `${selectedArticleType?.emoji} ${selectedArticleType?.name}`}
        </h3>
        <p>
          {currentLevel === 1 ? 'Choisissez un type de bien' : `Sélectionnez une transaction pour ${selectedArticleType?.name}`}
        </p>
      </div>

      {/* Renderizar filas */}
      <div>
        {firstRow.length > 0 && renderIconRow(firstRow, 0)}
        {secondRow.length > 0 && renderIconRow(secondRow, 1)}
      </div>

      {/* Botón de retroceso */}
      {currentLevel === 2 && (
        <button onClick={() => {
          setCurrentLevel(1);
          setSelectedArticleType(null);
          history.push('/immobilier/1');
        }}>
          <FaArrowLeft /> Retour aux types
        </button>
      )}
    </div>
  );
};

export default SliderImmobiler;
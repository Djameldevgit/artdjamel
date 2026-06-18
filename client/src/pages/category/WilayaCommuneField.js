// components/CATEGORIES/camposComun/WilayaCommunesField.js
import React, { useState, useEffect } from 'react';
import wilayasData from './wilayas.json'; // Cambia esta ruta según sea necesario

const WilayaCommuneField = ({
  mainCategory,
  subCategory,
  postData,
  handleChangeInput,
  fieldName,
  isRTL,
  t,
  ...props
}) => {
  const [selectedWilaya, setSelectedWilaya] = useState(postData?.wilaya || "");
  const [communes, setCommunes] = useState([]);

  // OPCIONES:
  // 1. Si tienes un archivo wilayas.json que incluye wilayas y communes
  // 2. Si tienes un archivo communes.json separado
  // 3. Si wilayasData tiene la estructura correcta

  // Cargar comunas cuando cambia la wilaya
  useEffect(() => {
    if (selectedWilaya && wilayasData) {
      // Buscar la wilaya en los datos
      // Ajusta esta lógica según la estructura real de tu JSON
      const wilayaEncontrada = wilayasData.find((wilaya) => 
        wilaya.wilaya === selectedWilaya || wilaya.name === selectedWilaya || wilaya.code === selectedWilaya
      );
      
      // Dependiendo de la estructura de tu JSON
      let communesList = [];
      
      if (wilayaEncontrada) {
        // Si el JSON tiene la propiedad 'commune'
        if (wilayaEncontrada.commune && Array.isArray(wilayaEncontrada.commune)) {
          communesList = wilayaEncontrada.commune;
        }
        // Si el JSON tiene la propiedad 'communes'
        else if (wilayaEncontrada.communes && Array.isArray(wilayaEncontrada.communes)) {
          communesList = wilayaEncontrada.communes;
        }
        // Si el JSON tiene la propiedad 'municipalities'
        else if (wilayaEncontrada.municipalities && Array.isArray(wilayaEncontrada.municipalities)) {
          communesList = wilayaEncontrada.municipalities;
        }
      }
      
      setCommunes(communesList);
      
      // Si no hay comuna seleccionada y hay comunas disponibles, seleccionar la primera
      if (!postData?.commune && communesList.length > 0) {
        handleChangeInput({
          target: {
            name: 'commune',
            value: communesList[0]
          }
        });
      }
    } else {
      setCommunes([]);
    }
  }, [selectedWilaya, wilayasData, postData?.commune, handleChangeInput]);

  const handleWilayaChange = (e) => {
    const value = e.target.value;
    setSelectedWilaya(value);
    
    handleChangeInput({
      target: {
        name: 'wilaya',
        value: value
      }
    });
  };

  const handleCommuneChange = (e) => {
    handleChangeInput({
      target: {
        name: 'commune',
        value: e.target.value
      }
    });
  };

  // Verificar la estructura del JSON para debugging
  console.log('Wilaya data structure:', wilayasData && wilayasData[0]);

  return (
    <div className="form-field mb-3">
      <label className="form-label fw-bold">
        {t ? t('location') : 'Localisation'} 
        <span className="text-danger">*</span>
      </label>
      
      {/* Wilaya */}
      <div className="mb-3">
        <label htmlFor="wilaya" className="form-label">
          {t ? t('wilaya') : 'Wilaya'}
        </label>
        <select
          id="wilaya"
          name="wilaya"
          value={selectedWilaya}
          onChange={handleWilayaChange}
          required
          dir={isRTL ? 'rtl' : 'ltr'}
          className="form-select form-select-lg"
        >
          <option value="">{t ? t('selectWilaya') : 'Sélectionnez une wilaya'}</option>
          {wilayasData && wilayasData.map((wilaya, index) => {
            // Ajusta según la estructura real de tu JSON
            const wilayaName = wilaya.wilaya || wilaya.name || wilaya.nom || `Wilaya ${wilaya.code}`;
            const wilayaValue = wilaya.wilaya || wilaya.name || wilaya.code || wilayaName;
            
            return (
              <option key={index} value={wilayaValue}>
                {wilayaName}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Commune */}
      {selectedWilaya && communes.length > 0 && (
        <div className="mb-3">
          <label htmlFor="commune" className="form-label">
            {t ? t('commune') : 'Commune'}
          </label>
          <select
            id="commune"
            name="commune"
            value={postData?.commune || ''}
            onChange={handleCommuneChange}
            required
            dir={isRTL ? 'rtl' : 'ltr'}
            className="form-select form-select-lg"
          >
            <option value="">{t ? t('selectCommune') : 'Sélectionnez une commune'}</option>
            {communes.map((commune, index) => {
              // La commune puede ser un string o un objeto
              const communeName = typeof commune === 'string' ? commune : (commune.name || commune.nom || commune);
              const communeValue = typeof commune === 'string' ? commune : (commune.name || commune.nom || commune);
              
              return (
                <option key={index} value={communeValue}>
                  {communeName}
                </option>
              );
            })}
          </select>
        </div>
      )}
      
      {/* Mensaje si no hay comunas disponibles */}
      {selectedWilaya && communes.length === 0 && (
        <div className="alert alert-warning mt-2">
          <small>
            <i className="fas fa-exclamation-triangle me-1"></i>
            {t ? t('noCommunesAvailable') : 'Aucune commune disponible pour cette wilaya'}
          </small>
        </div>
      )}
      
      <div className="form-text text-muted">
        {t ? t('locationHelp') : 'Sélectionnez votre localisation exacte'}
      </div>
    </div>
  );
};

export default WilayaCommuneField;